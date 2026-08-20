#!/usr/bin/env node
// bin/run.mjs — verified-rig (version: see VERSION) orchestrator
//
// The orchestrator never thinks. It discovers stages, validates trust by
// byte-hash, displaces stale outputs, runs the fixed five-step loop
// (feed-gate, workers, check_cmd, verifier, branch-on-verdict-file), and
// stops at the first non-pass. No retries, no heuristic recovery, no
// semantic comparison, anywhere. Unknown states fail closed.
//
// Usage:  node bin/run.mjs [--fresh] [--mock] [--mock-into <dir>]
// Run from the rig root (the directory holding VERSION).
//
// Budgets (build-doctrine): ≤600 readable lines excluding comments and
// blanks; trust/receipts ≤150 of them; rotation+sandbox+identity ≤120.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseFrontmatter } from './fm.mjs';

// ---------- globals (set in main) ----------

let RIG = process.cwd();
let RUN_ID = '';
let MODE = 'live';
let FRESH = false;
let VERSION = '';
let ORCH_SHA = '';
let CLI_VERSION = '';
let CLAUDE_BIN = '';
let LOCK = '';
let OWNED = false;
let tornWarned = false;

// ---------- small utilities ----------

function die(msg) {
  process.stderr.write(`run.mjs: ${msg}\n`);
  cleanup();
  process.exit(2);
}
function cleanup() {
  if (OWNED) { try { fs.unlinkSync(LOCK); } catch {} OWNED = false; }
}
function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
function sha256Str(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
// Canonical JSON of a flat string map: sorted keys, no whitespace.
function canonical(map) {
  const keys = Object.keys(map).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + JSON.stringify(map[k])).join(',') + '}';
}
function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function rel(p) {
  return path.relative(RIG, p).split(path.sep).join('/');
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function appendLine(p, s) {
  fs.appendFileSync(p, s + '\n');
}
function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}
function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}
function walkFiles(dir, out = []) {
  const ents = fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of ents) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}
function timestampId() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` +
    `_${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
}

// ---------- args ----------

function parseArgs(argv) {
  const a = { mock: false, fresh: false, mockInto: '' };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--mock') a.mock = true;
    else if (t === '--fresh') a.fresh = true;
    else if (t === '--mock-into') {
      a.mockInto = argv[++i] || '';
      if (!a.mockInto) die('--mock-into needs a directory');
    } else die(`unknown flag: ${t}`);
  }
  return a;
}

// ---------- journal and logs ----------

function logPath(name) {
  return path.join(RIG, 'log', name);
}
// The journal: one line to log/run-report.md and stdout. Format carried
// from v5.4; SATISFIED / DISPLACED / RUN / WARN are additive vocabulary.
function report(line) {
  appendLine(logPath('run-report.md'), line);
  process.stdout.write(line + '\n');
}
function warn(msg) {
  report(`WARN — ${msg}`);
}
function ledgerAppend(obj) {
  appendLine(logPath('receipts.jsonl'), JSON.stringify(obj));
}
function envelopeAppend(obj) {
  appendLine(logPath('envelopes.jsonl'), JSON.stringify(obj));
}
function verdictLogAppend(obj) {
  appendLine(logPath('verdicts.jsonl'), JSON.stringify(obj));
}

// ---------- frontmatter access ----------

function fm(file) {
  try {
    return parseFrontmatter(fs.readFileSync(file, 'utf8'), file).data;
  } catch (e) {
    die(`frontmatter: ${e.message}`);
  }
}
function fmList(d, key) {
  const v = d[key];
  return v == null ? [] : Array.isArray(v) ? v : [v];
}
function fmStr(d, key, dflt = '') {
  const v = d[key];
  return v == null ? dflt : String(Array.isArray(v) ? v[0] : v);
}

// ---------- discovery ----------

function discoverStages() {
  return fs.readdirSync(RIG)
    .filter((n) => /^\d\d_/.test(n) && isDir(path.join(RIG, n)))
    .sort();
}
// Fitting sequence: CONTEXT.md frontmatter `fittings:` list when present,
// else lexicographic fittings/*.md. Role comes from each fitting's own
// frontmatter.
function stageFittings(stage) {
  const ctx = path.join(RIG, stage, 'CONTEXT.md');
  let names = [];
  if (isFile(ctx)) names = fmList(fm(ctx), 'fittings');
  if (!names.length) {
    const fdir = path.join(RIG, stage, 'fittings');
    if (!isDir(fdir)) die(`${stage}: no fittings/ directory`);
    names = fs.readdirSync(fdir).filter((n) => n.endsWith('.md')).sort();
  }
  // CONTEXT.md declares fittings by bare name (`01_fetch`); the directory
  // fallback yields filenames. Normalize to v5.4's shape: name is the
  // basename without .md — the spelling the journal and envelopes carry.
  return names.map((n) => {
    const base = n.endsWith('.md') ? n.slice(0, -3) : n;
    const file = path.join(RIG, stage, 'fittings', `${base}.md`);
    if (!isFile(file)) die(`${stage}: declared fitting missing: ${base}`);
    return { name: base, file, data: fm(file) };
  });
}

// ---------- trust: closure, receipts, validation ----------

// The closure: every byte the stage's processes were instructed to read,
// plus the contracts that instructed them. Workers AND the verifier — a
// rubric change invalidates a pass. The first stage's closure always
// includes run-input.md: a new brief must never be answered by stale trust.
function closureFiles(stage, fittings, isFirst) {
  const files = [];
  const add = (p) => { if (!files.includes(p)) files.push(p); };
  const ctx = path.join(RIG, stage, 'CONTEXT.md');
  if (isFile(ctx)) add(ctx);
  for (const f of fittings) add(f.file);
  for (const n of ['requires.json', 'feed.schema.json']) {
    const p = path.join(RIG, stage, n);
    if (isFile(p)) add(p);
  }
  const declared = new Set();
  if (isFile(ctx)) for (const r of fmList(fm(ctx), 'reads')) declared.add(r);
  for (const f of fittings) for (const r of fmList(f.data, 'reads')) declared.add(r);
  if (isFirst) declared.add('run-input.md');
  return { files, declared: [...declared].sort() };
}

// closure_sha256 covers the closure file map only; the upstream feed is
// recorded beside it and checked by the separate chain cause, so the
// journal names the right thing.
function hashClosure(stage, fittings, isFirst, upstreamFeed) {
  const { files, declared } = closureFiles(stage, fittings, isFirst);
  const map = {};
  for (const p of files) map[rel(p)] = sha256File(p);
  for (const r of declared) {
    const p = path.resolve(RIG, r);
    map[rel(p)] = isFile(p) ? sha256File(p) : 'ABSENT';
  }
  const up = upstreamFeed && isFile(upstreamFeed)
    ? { path: rel(upstreamFeed), sha256: sha256File(upstreamFeed) }
    : null;
  return { files: map, upstream_feed: up, closure_sha256: sha256Str(canonical(map)) };
}

function hashOutputs(stage) {
  const sdir = path.join(RIG, stage);
  const dir = path.join(sdir, 'output');
  const map = {};
  if (isDir(dir)) {
    for (const p of walkFiles(dir)) {
      map[path.relative(sdir, p).split(path.sep).join('/')] = sha256File(p);
    }
  }
  return { files: map, outputs_sha256: sha256Str(canonical(map)) };
}

// Latest pass-receipt per stage. Event lines are invisible here;
// supersession is by position; torn lines are skipped, warned once, and
// can only shrink trust.
function latestReceipt(stage) {
  const p = logPath('receipts.jsonl');
  if (!isFile(p)) return null;
  let found = null;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    let o;
    try { o = JSON.parse(t); } catch {
      if (!tornWarned) { warn('receipts.jsonl: unparseable line skipped'); tornWarned = true; }
      continue;
    }
    if (o.event) continue;
    if (o.stage === stage && o.closure && o.outputs) found = o;
  }
  return found;
}

function firstDiff(recorded, current) {
  for (const k of Object.keys(current)) if (recorded[k] !== current[k]) return k;
  for (const k of Object.keys(recorded)) if (!(k in current)) return k;
  return '';
}

// Stage-top validation, in doctrine order. Returns '' when trusted, else
// the named cause. Trust requires positive evidence; every absence or
// ambiguity re-runs.
function trustCause(stage, fittings, isFirst, upstreamFeed) {
  if (FRESH) return 'fresh';
  const r = latestReceipt(stage);
  if (!r) return 'no-receipt';
  const prov = r.provenance || {};
  if (prov.skeleton !== VERSION) return 'skeleton-version';
  if (prov.orchestrator_sha256 !== ORCH_SHA) {
    warn(`${stage}: receipt orchestrator differs from current (warn only)`);
  }
  if (prov.cli_version !== CLI_VERSION) {
    warn(`${stage}: receipt cli_version '${prov.cli_version}' vs '${CLI_VERSION}' (warn only)`);
  }
  const cl = hashClosure(stage, fittings, isFirst, upstreamFeed);
  if (cl.closure_sha256 !== (r.closure || {}).closure_sha256) {
    const d = firstDiff((r.closure || {}).files || {}, cl.files);
    return `closure:${d || 'shape'}`;
  }
  const out = hashOutputs(stage);
  if (out.outputs_sha256 !== (r.outputs || {}).outputs_sha256) {
    const d = firstDiff((r.outputs || {}).files || {}, out.files);
    return `outputs:${d || 'shape'}`;
  }
  if (upstreamFeed) {
    const rec = (r.closure || {}).upstream_feed;
    if (!cl.upstream_feed || !rec || rec.sha256 !== cl.upstream_feed.sha256) return 'chain';
  } else if ((r.closure || {}).upstream_feed) {
    return 'chain';
  }
  return '';
}

function writeReceipt(stage, fittings, isFirst, upstreamFeed) {
  ledgerAppend({
    run_id: RUN_ID,
    stage,
    completed_at: nowIso(),
    provenance: { skeleton: VERSION, orchestrator_sha256: ORCH_SHA, cli_version: CLI_VERSION },
    closure: hashClosure(stage, fittings, isFirst, upstreamFeed),
    outputs: hashOutputs(stage),
  });
}

// ---------- rotation ----------

// Displace a stage's non-empty output/ to _archive/<run_id>/<stage>/output/.
// Order: move, manifest, ledger event, recreate. Archives are forensics
// only; no trust decision ever reads them.
function displace(stage, cause) {
  const outDir = path.join(RIG, stage, 'output');
  const has = isDir(outDir) && walkFiles(outDir).length > 0;
  if (!has) {
    fs.mkdirSync(outDir, { recursive: true });
    return false;
  }
  const arcRoot = path.join(RIG, '_archive', RUN_ID);
  const dest = path.join(arcRoot, stage);
  fs.mkdirSync(dest, { recursive: true });
  fs.renameSync(outDir, path.join(dest, 'output'));
  const r = latestReceipt(stage);
  const manPath = path.join(arcRoot, 'manifest.json');
  const man = isFile(manPath)
    ? readJson(manPath)
    : { archived_by: RUN_ID, archived_at: nowIso(), stages: {} };
  man.stages[stage] = { producing_run_id: r ? r.run_id : null, cause };
  fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + '\n');
  ledgerAppend({
    event: 'displace', run_id: RUN_ID, stage, cause,
    superseded_receipt_run: r ? r.run_id : null,
  });
  fs.mkdirSync(outDir, { recursive: true });
  return true;
}

// ---------- mock sandbox ----------

// Copy the contract surface only: stages minus outputs, _config/, bin/,
// run-input.md, VERSION. The sandbox gets its own log/ and ledger; live
// trust is structurally unreachable from here.
function buildSandbox(into) {
  const dest = into ? path.resolve(RIG, into) : path.join(RIG, '_mock', RUN_ID);
  if (into && isFile(path.join(dest, 'VERSION'))) return dest;
  fs.mkdirSync(dest, { recursive: true });
  for (const n of fs.readdirSync(RIG)) {
    if (!/^\d\d_/.test(n) || !isDir(path.join(RIG, n))) continue;
    const sdir = path.join(dest, n);
    fs.mkdirSync(sdir, { recursive: true });
    for (const e of fs.readdirSync(path.join(RIG, n))) {
      if (e === 'output') continue;
      fs.cpSync(path.join(RIG, n, e), path.join(sdir, e), { recursive: true });
    }
    fs.mkdirSync(path.join(sdir, 'output'), { recursive: true });
  }
  for (const n of ['_config', 'bin']) {
    if (isDir(path.join(RIG, n))) fs.cpSync(path.join(RIG, n), path.join(dest, n), { recursive: true });
  }
  for (const n of ['run-input.md', 'VERSION']) {
    if (isFile(path.join(RIG, n))) fs.copyFileSync(path.join(RIG, n), path.join(dest, n));
  }
  fs.mkdirSync(path.join(dest, 'log'), { recursive: true });
  return dest;
}

// ---------- lock ----------

function acquireLock() {
  LOCK = logPath('.lock');
  try {
    const fd = fs.openSync(LOCK, 'wx');
    fs.writeSync(fd, `${process.pid} ${RUN_ID}\n`);
    fs.closeSync(fd);
    OWNED = true;
  } catch (e) {
    if (e.code === 'EEXIST') {
      die(`lock held (${LOCK}: ${fs.readFileSync(LOCK, 'utf8').trim()}). ` +
        `Another run is live, or the lock is stale after a crash — inspect, then remove the file.`);
    }
    throw e;
  }
}

// ---------- sealed supply ----------

// Read-only verification of _config/manifest.json. Warns, never blocks,
// never seals: sealing writes, verification reads, the orchestrator must
// only read. Uncovered drift — a changed file no stage's closure declares —
// is the one hazard closure hashing cannot see; name it loudly.
function verifySupply(meta) {
  const cdir = path.join(RIG, '_config');
  if (!isDir(cdir)) return;
  const files = walkFiles(cdir).map(rel).filter((p) => p !== '_config/manifest.json');
  const manPath = path.join(cdir, 'manifest.json');
  if (!isFile(manPath)) {
    if (files.length) warn('supply unsealed — node bin/seal-supply.mjs to seal _config/');
    return;
  }
  let man;
  try { man = readJson(manPath); } catch {
    warn('supply manifest unparseable — reseal with node bin/seal-supply.mjs');
    return;
  }
  const covered = new Set();
  for (const m of meta) {
    for (const r of closureFiles(m.stage, m.fittings, false).declared) covered.add(r);
  }
  for (const [f, h] of Object.entries(man)) {
    const p = path.join(RIG, f);
    if (!isFile(p)) { warn(`sealed supply missing: ${f}`); continue; }
    if (sha256File(p) !== h) {
      warn(`supply drift: ${f} differs from seal` +
        (covered.has(f) ? '' : ' — UNCOVERED: no stage declares this read'));
    }
  }
  for (const f of files) if (!(f in man)) warn(`unsealed supply present: ${f}`);
}

// ---------- fitting invocation ----------

// Per-invocation settings file wiring the PreToolUse write-guard hook (D1).
// ALLOWED_WRITE travels in the child env: the stage output dir for workers,
// the single verdict path for verifiers.
function settingsFile(stage) {
  const p = logPath(`.settings-${stage}.json`);
  fs.writeFileSync(p, JSON.stringify({
    hooks: {
      PreToolUse: [{
        matcher: 'Write|Edit|MultiEdit|NotebookEdit',
        hooks: [{ type: 'command', command: path.join(RIG, 'bin', 'write-guard.sh') }],
      }],
    },
  }, null, 2) + '\n');
  return p;
}

function composePrompt(stage, fit) {
  const fpath = `${stage}/fittings/${fit.name}.md`;
  if (fmStr(fit.data, 'role', 'work') === 'verify') {
    return `You are executing verifier fitting ${fit.name} of stage ${stage}. ` +
      `Read ${stage}/CONTEXT.md for the stage contract, then ${fpath} — skip the frontmatter ` +
      `between the --- markers; it is orchestrator config. Judge the stage's output against ` +
      `the rubric in your Work section. You judge; you never fix — edit nothing. Write exactly ` +
      `one file: ${stage}/output/verdict.json, containing ` +
      `{"status":"pass"|"halt"|"fail","reason":"<one sentence>"} and nothing else.`;
  }
  return `You are executing fitting ${fit.name} of stage ${stage}. ` +
    `Read ${stage}/CONTEXT.md for the stage contract, then ${fpath} — skip the frontmatter ` +
    `between the --- markers; it is orchestrator config — and do the Work section exactly. ` +
    `Write only what your Writes section declares. Never read or write any verdict.`;
}

// One fresh headless invocation. Stdout is the stream trace; the last
// type:"result" event yields the envelope. The child's exit status is
// returned for workers and deliberately ignored for verifiers.
function invokeFitting(stage, fit, allowedWrite) {
  const d = fit.data;
  const isVerify = fmStr(fit.data, 'role', 'work') === 'verify';
  const args = [
    '-p', composePrompt(stage, fit),
    ...(isVerify ? ['--settings', settingsFile(stage)] : []),
    '--allowedTools', fmStr(d, 'tools', 'Read'),
    '--permission-mode', 'acceptEdits',
    '--max-turns', fmStr(d, 'max_turns', '12'),
    '--max-budget-usd', fmStr(d, 'budget_usd', '1.00'),
    '--output-format', 'stream-json', '--verbose',
  ];
  const model = fmStr(d, 'model');
  if (model) args.push('--model', model);
  const res = spawnSync(CLAUDE_BIN, args, {
    cwd: RIG,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ALLOWED_WRITE: allowedWrite, RIG_ROOT: RIG },
  });
  const trace = path.join('log', 'stream', RUN_ID, `${stage}__${fit.name}.jsonl`);
  fs.writeFileSync(path.join(RIG, trace), res.stdout || '');
  if (res.stderr) fs.appendFileSync(logPath('harness.err'), res.stderr);
  let result = null;
  for (const line of (res.stdout || '').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const o = JSON.parse(t);
      if (o && o.type === 'result') result = o;
    } catch {}
  }
  envelopeAppend({
    run_id: RUN_ID,
    ts: nowIso(),
    stage,
    fitting: fit.name,
    role: fmStr(d, 'role', 'work'),
    model: model || (result && result.model) || null,
    exit_code: res.status == null ? -1 : res.status,
    terminal_reason: res.error ? 'spawn_error' : result ? (result.subtype || 'completed') : 'no_result_event',
    usage: (result && result.usage) || null,
    total_cost_usd: result && result.total_cost_usd != null ? result.total_cost_usd : null,
    stream_trace: trace,
  });
  return res.status === 0;
}

// check_cmd runs orchestrator-side via /bin/bash -c with stage-dir cwd.
// D2/D4/D5 remain binding for these strings. Workers never self-grade.
function runChecks(stage, fit) {
  const sdir = path.join(RIG, stage);
  for (const cmd of fmList(fit.data, 'check_cmd')) {
    appendLine(logPath('checks.log'), `=== ${RUN_ID} ${stage} ${cmd} ===`);
    const r = spawnSync('/bin/bash', ['-c', cmd], { cwd: sdir, encoding: 'utf8' });
    if (r.stdout) fs.appendFileSync(logPath('checks.log'), r.stdout);
    if (r.stderr) fs.appendFileSync(logPath('checks.log'), r.stderr);
    if (r.status !== 0) return cmd;
  }
  return '';
}

// The verifier: stale verdict removed first so a dead verifier yields a
// missing verdict — a halt — never a ghost pass. Branch on the file only.
function runVerifier(stage, fit) {
  const vpath = path.join(RIG, stage, 'output', 'verdict.json');
  fs.rmSync(vpath, { force: true });
  invokeFitting(stage, fit, vpath);
  if (!isFile(vpath)) return { status: 'halt', reason: 'verdict file missing' };
  let v;
  try { v = readJson(vpath); } catch {
    return { status: 'halt', reason: 'verdict unparseable' };
  }
  const status = v && typeof v.status === 'string' ? v.status : '';
  const reason = v && typeof v.reason === 'string' ? v.reason : '';
  if (status !== 'pass' && status !== 'halt' && status !== 'fail') {
    return { status: 'halt', reason: `verdict status '${status}' is not pass|halt|fail` };
  }
  return { status, reason };
}

// ---------- the five-step loop ----------

function feedGate(prevStage, requiresPath) {
  // Paths stay rig-relative with cwd at the rig root, exactly as run.sh
  // invoked the shell gate — the gate's messages are archive-comparable.
  const feed = `${prevStage}/output/feed.json`;
  const r = spawnSync(process.execPath,
    [path.join(RIG, 'bin', 'feed-gate.mjs'), feed, path.relative(RIG, requiresPath)],
    { cwd: RIG, encoding: 'utf8' });
  return { ok: r.status === 0, reason: (r.stderr || '').trim().split('\n')[0] || 'gate failed' };
}

function runStage(m, prevStage) {
  const { stage, fittings } = m;
  // Step 1 — feed-gate (mechanical, halt on failure, feed left untouched).
  const reqPath = path.join(RIG, stage, 'requires.json');
  let gated = false;
  if (isFile(reqPath)) {
    let req;
    try { req = readJson(reqPath); } catch {
      report(`${stage}   HALT   — feed-gate: requires.json unparseable`);
      return 'halt';
    }
    const nKeys = (req.required_keys || []).length + (req.path_keys || []).length;
    if (nKeys > 0) {
      if (!prevStage) {
        report(`${stage}   HALT   — feed-gate: first stage declares requirements but has no upstream feed`);
        return 'halt';
      }
      const g = feedGate(prevStage, reqPath);
      if (!g.ok) {
        report(`${stage}   HALT   — ${g.reason}`);
        report(`→ malformed feed left on disk untouched: ${prevStage}/output/feed.json`);
        return 'halt';
      }
      gated = true;
    }
  }
  if (!gated) report(`${stage}   GATE   — skipped: first stage declares no requirements`);
  // Steps 2–5 — fittings in declared order.
  let sawVerifier = false;
  for (const fit of fittings) {
    if (fmStr(fit.data, 'role', 'work') === 'verify') {
      sawVerifier = true;
      const v = runVerifier(stage, fit);
      verdictLogAppend({
        run_id: RUN_ID, ts: nowIso(), stage, fitting: fit.name,
        status: v.status, reason: v.reason,
      });
      if (v.status !== 'pass') {
        report(`${stage}   ${v.status.toUpperCase()}   — fitting ${fit.name}: ${v.reason}`);
        return v.status;
      }
      continue;
    }
    // Step 2 — worker, fresh invocation, writes only its declared output.
    if (!invokeFitting(stage, fit, path.join(RIG, stage, 'output'))) {
      report(`${stage}   FAIL   — fitting ${fit.name}: worker exited non-zero`);
      return 'fail';
    }
    // Step 3 — deterministic checks, orchestrator-side.
    const bad = runChecks(stage, fit);
    if (bad) {
      report(`${stage}   FAIL   — fitting ${fit.name}: check_cmd failed: ${bad}`);
      return 'fail';
    }
  }
  if (!sawVerifier) {
    report(`${stage}   HALT   — no verifier fitting in stage`);
    return 'halt';
  }
  report(`${stage}   PASS   (fittings: ${fittings.length})`);
  return 'pass';
}

// ---------- main ----------

function main() {
  const a = parseArgs(process.argv);
  MODE = a.mock ? 'mock' : 'live';
  FRESH = a.fresh;
  if (!isFile(path.join(RIG, 'VERSION'))) die('no VERSION at cwd — run from the rig root');
  CLAUDE_BIN = process.env.CLAUDE_BIN || (a.mock ? '' : 'claude');
  if (!a.mock && CLAUDE_BIN && path.basename(CLAUDE_BIN).toLowerCase().includes('mock')) {
    die(`CLAUDE_BIN looks like a mock harness (${CLAUDE_BIN}); pass --mock to run sandboxed`);
  }
  RUN_ID = (a.mock ? 'mock-' : '') + timestampId();
  if (a.mock) {
    if (!a.mockInto) {
      let n = 2;
      const base = RUN_ID;
      while (isDir(path.join(RIG, '_mock', RUN_ID))) RUN_ID = base + '_' + n++;
    }
    const sb = buildSandbox(a.mockInto);
    RIG = sb;
    process.chdir(sb);
    if (!CLAUDE_BIN) CLAUDE_BIN = path.join(RIG, 'bin', 'mock-claude.mjs');
  }
  fs.mkdirSync(path.join(RIG, 'log'), { recursive: true });
  let n = 2;
  const base = RUN_ID;
  while (isDir(path.join(RIG, 'log', 'stream', RUN_ID))) RUN_ID = base + '_' + n++;
  fs.mkdirSync(path.join(RIG, 'log', 'stream', RUN_ID), { recursive: true });
  VERSION = fs.readFileSync(path.join(RIG, 'VERSION'), 'utf8').trim();
  ORCH_SHA = sha256File(path.join(RIG, 'bin', 'run.mjs'));
  const vres = spawnSync(CLAUDE_BIN, ['--version'], { encoding: 'utf8' });
  CLI_VERSION = vres.status === 0 ? (vres.stdout || '').trim() : 'unknown';
  acquireLock();
  process.on('SIGINT', () => {
    report(`run ${RUN_ID}   INTERRUPTED`);
    cleanup();
    process.exit(130);
  });
  report(`## run ${RUN_ID} — ${nowIso()} — mode ${MODE} — skeleton ${VERSION}`);
  if (FRESH) {
    ledgerAppend({ event: 'fresh', run_id: RUN_ID });
    report(`--fresh: receipts bypassed for this run (on the record)`);
  }
  const stages = discoverStages();
  if (!stages.length) die('no NN_* stage folders at rig root');
  const meta = stages.map((s) => ({ stage: s, fittings: stageFittings(s) }));
  verifySupply(meta);
  let result = 'pass';
  for (let i = 0; i < meta.length; i++) {
    const m = meta[i];
    const prev = i > 0 ? meta[i - 1].stage : '';
    const upstream = prev ? path.join(RIG, prev, 'output', 'feed.json') : '';
    const cause = trustCause(m.stage, m.fittings, i === 0, upstream);
    if (!cause) {
      const r = latestReceipt(m.stage);
      report(`${m.stage}   SATISFIED   — receipt ${r.run_id}, closure ` +
        `${r.closure.closure_sha256.slice(0, 6)}, ${i === 0 ? 'no upstream' : 'chain ok'}`);
      continue;
    }
    const archived = displace(m.stage, cause);
    report(archived
      ? `${m.stage}   DISPLACED   — ${cause}; archived to _archive/${RUN_ID}/${m.stage}`
      : `${m.stage}   RUN   — ${cause}`);
    result = runStage(m, prev);
    if (result !== 'pass') break;
    writeReceipt(m.stage, m.fittings, i === 0, upstream);
  }
  report(`run ${RUN_ID}   ${result === 'pass'
    ? 'COMPLETE — all stages pass'
    : result.toUpperCase() + ' — stopped at the defect; artifacts preserved'}`);
  cleanup();
  process.exit(result === 'pass' ? 0 : 1);
}

main();