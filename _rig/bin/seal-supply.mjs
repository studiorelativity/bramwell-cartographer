#!/usr/bin/env node
// bin/seal-supply.mjs — verified-rig (version: see VERSION) — seal _config/ supply hashes
//
// Usage:  node bin/seal-supply.mjs [--check]
//         (from the rig root)
//
// Sealing is an explicit human act: this tool is the ONLY writer of
// _config/manifest.json. Doctrine: sealing writes, verification reads,
// the orchestrator must only read — run.mjs verifies the seal at startup
// and warns on drift; it never repairs, and it never seals.
//
// Bare invocation: hash every file under _config/ (recursive; dotfiles
// invisible; manifest.json itself excluded), print the diff against the
// previous seal, write the new manifest atomically. Idempotent: when the
// seal already matches the world, nothing is written.
// --check: print the diff, write nothing. Exit 0 when the seal matches
// exactly, 1 on any drift — scriptable as a pre-run look.
//
// MANIFEST FORMAT (normative — run.mjs's verifySupply depends on it):
// a flat JSON object, rig-root-relative POSIX path → sha256 hex digest,
// keys sorted, pretty-printed. NO metadata keys, ever: the verifier
// treats every key as a file path, so the map stays pure. Provenance of
// a seal lives in git history, not in the file.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RIG = process.cwd();
const CDIR = path.join(RIG, '_config');
const MANIFEST = path.join(CDIR, 'manifest.json');
const MANIFEST_REL = '_config/manifest.json';

function die(msg) {
  process.stderr.write(`seal-supply: ${msg}\n`);
  process.exit(2);
}
function out(s) {
  process.stdout.write(s + '\n');
}
function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
function rel(p) {
  return path.relative(RIG, p).split(path.sep).join('/');
}
// Dotfiles and dot-directories are invisible to the seal — the .DS_Store
// class on the deployment Mac would otherwise make drift warnings
// permanent noise, and a dead warning channel is worse than none.
// run.mjs's walk must skip identically (see flag 1).
function walkFiles(dir, files = []) {
  const ents = fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of ents) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, files);
    else if (e.isFile()) files.push(p);
  }
  return files;
}

function currentMap() {
  let st;
  try { st = fs.statSync(CDIR); } catch { die('no _config/ at rig root — nothing to seal'); }
  if (!st.isDirectory()) die('_config is not a directory');
  const map = {};
  for (const p of walkFiles(CDIR)) {
    const r = rel(p);
    if (r === MANIFEST_REL) continue;
    map[r] = sha256File(p);
  }
  return map;
}

// The previous seal, or null when absent/unreadable — resealing is
// exactly how a broken seal gets fixed, so a bad one is reported and
// treated as absent, never fatal.
function previousSeal() {
  if (!fs.existsSync(MANIFEST)) return { map: null, note: '' };
  let o;
  try { o = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); }
  catch { return { map: null, note: 'previous seal unparseable — treated as absent' }; }
  if (o === null || typeof o !== 'object' || Array.isArray(o)) {
    return { map: null, note: 'previous seal is not a JSON object — treated as absent' };
  }
  return { map: o, note: '' };
}

function diffSeals(prev, cur) {
  const added = [], changed = [], removed = [];
  let same = 0;
  for (const k of Object.keys(cur).sort()) {
    if (!prev || !(k in prev)) added.push(k);
    else if (prev[k] !== cur[k]) changed.push(k);
    else same++;
  }
  if (prev) for (const k of Object.keys(prev).sort()) if (!(k in cur)) removed.push(k);
  return { added, changed, removed, same };
}

function writeSeal(map) {
  const sorted = {};
  for (const k of Object.keys(map).sort()) sorted[k] = map[k];
  const tmp = path.join(CDIR, '.manifest.json.tmp'); // dot-named: invisible to walks
  fs.writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n');
  fs.renameSync(tmp, MANIFEST);
}

function main(argv) {
  let check = false;
  for (const t of argv) {
    if (t === '--check') check = true;
    else die(`unknown flag: ${t}`);
  }
  if (!fs.existsSync(path.join(RIG, 'VERSION'))) {
    die('no VERSION at cwd — run from the rig root');
  }

  const cur = currentMap();
  const { map: prev, note } = previousSeal();
  if (note) out(`note: ${note}`);

  const d = diffSeals(prev, cur);
  for (const k of d.added) out(`  added:    ${k}`);
  for (const k of d.changed) out(`  changed:  ${k}`);
  for (const k of d.removed) out(`  removed:  ${k}`);
  const drift = d.added.length + d.changed.length + d.removed.length;
  const n = Object.keys(cur).length;

  if (check) {
    if (prev === null) {
      out(`--check: no seal present (${n} unsealed file${n === 1 ? '' : 's'}); nothing written`);
      process.exit(n ? 1 : 0);
    }
    out(drift
      ? `--check: DRIFT — ${d.added.length} added, ${d.changed.length} changed, ` +
        `${d.removed.length} removed, ${d.same} unchanged; nothing written`
      : `--check: seal matches — ${d.same} file${d.same === 1 ? '' : 's'}`);
    process.exit(drift ? 1 : 0);
  }

  if (prev !== null && !drift) {
    out(`seal unchanged — ${d.same} file${d.same === 1 ? '' : 's'}; nothing written`);
    process.exit(0);
  }
  writeSeal(cur);
  out(`sealed ${n} file${n === 1 ? '' : 's'} → ${MANIFEST_REL}`);
  if (n === 0) {
    out(`note: _config/ is empty — the empty seal arms 'unsealed supply present' warnings for future additions`);
  }
  process.exit(0);
}

main(process.argv.slice(2));