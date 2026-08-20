#!/usr/bin/env node
// bin/feed-gate.mjs — verified-rig (version: see VERSION) — mechanical pre-stage gate
//
// Usage:  node bin/feed-gate.mjs <feed.json> <requires.json>
//
// Zero AI, zero tokens, deterministic. Prints nothing on success, exit 0.
// On failure: names the exact failed check on stderr, exit 1. Relative
// paths resolve against the caller's cwd — run.mjs invokes with cwd at
// the rig root, exactly as run.sh invoked the shell gate.
//
// PARITY CONTRACT (cutover acceptance): this gate and the v5.4
// feed-gate.sh run side-by-side against the fixture set and must agree
// on exit status and failure naming for every case; the .sh is the
// oracle, any divergence is a defect here. The two required-key messages
// below are transcribed verbatim from the production gate (quoted in
// RIG-paper §5). Every other message wording is reconstruction from the
// gate spec; the cutover kickoff (phase 3d) diffed each against the
// v5.4 oracle's stderr and corrected the wording in this file.
//
// CHECK ORDER (normative — the gate validates its own inputs first):
//   0. argument count
//   1. requires file exists, is a file, is non-empty, parses as JSON
//   2. feed exists and is a file          ("File exists…")
//   3. feed is non-empty                  ("…and is non-empty")
//   4. feed parses as JSON
//   5. every required_keys[] entry is present in the feed and non-null
//   6. every path_keys[] entry's value resolves to an existing file
//
// jq-faithfulness notes, so the mechanics match the oracle's mechanics:
// key lists are read as `.required_keys[]? // empty` did — non-arrays
// yield nothing, null/false items drop, empty strings drop, non-string
// items stringify the way `jq -r` rendered them. Presence matches
// `jq -e 'has($k)'`: a feed that is not a JSON object cannot have a
// string key, so it fails the presence check for the first required key.
// Path values are tested like `[ -f ]`: symlinks followed, directories
// are not files.

import fs from 'node:fs';

function die(msg) {
  process.stderr.write('feed-gate: ' + msg + '\n');
  process.exit(1);
}

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

// Items as `jq -r '.key[]? // empty'` produced them.
function jqrItems(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const it of v) {
    if (it === null || it === false) continue;                  // // empty
    const s = typeof it === 'object' ? JSON.stringify(it) : String(it);
    if (s === '') continue;                                     // [ -n "$k" ]
    out.push(s);
  }
  return out;
}

function main(argv) {
  if (argv.length !== 2) {
    die('usage: feed-gate.mjs <feed.json> <requires.json>');    // oracle-aligned
  }
  const feed = argv[0];
  const req = argv[1];

  // 1 — own inputs first: the requires file must exist and parse before
  // anything is judged.
  if (!isFile(req)) die(`requires file missing: ${req}`);       // oracle-aligned
  if (fs.statSync(req).size === 0) {
    die(`requires file empty: ${req}`);                         // documented divergence (flag 2)
  }
  let reqObj;
  try {
    reqObj = JSON.parse(fs.readFileSync(req, 'utf8'));
  } catch {
    die(`requires file is not valid JSON: ${req}`);             // oracle-aligned
  }
  if (reqObj === null || typeof reqObj !== 'object' || Array.isArray(reqObj)) {
    die(`requires file is not valid JSON: ${req}`);             // oracle-aligned
  }

  // 2, 3, 4 — the feed: exists, non-empty, parses.
  if (!isFile(feed)) die(`feed missing: ${feed}`);              // oracle-aligned
  if (fs.statSync(feed).size === 0) die(`feed is empty: ${feed}`); // oracle-aligned
  let feedObj;
  try {
    feedObj = JSON.parse(fs.readFileSync(feed, 'utf8'));
  } catch {
    die(`feed is not valid JSON: ${feed}`);                     // oracle-aligned
  }
  const feedIsObject =
    feedObj !== null && typeof feedObj === 'object' && !Array.isArray(feedObj);

  // 5 — required keys: present and non-null. Messages transcribed
  // verbatim from the production gate; do not reword.
  for (const k of jqrItems(reqObj.required_keys)) {
    const has = feedIsObject && Object.prototype.hasOwnProperty.call(feedObj, k);
    if (!has) die(`required key missing: '${k}' in ${feed}`);   // verbatim
    if (feedObj[k] === null) {
      die(`required key is null: '${k}' in ${feed}`);           // verbatim
    }
  }

  // 6 — path keys: the value resolves to an existing file, [ -f ] style.
  for (const k of jqrItems(reqObj.path_keys)) {
    const v = feedIsObject ? feedObj[k] : undefined;
    const s = v === undefined || v === null
      ? ''                                                      // jq -r '// empty'
      : typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (s === '') die(`path key has no value: '${k}' in ${feed}`);  // oracle-aligned
    if (!isFile(s)) {
      die(`path key '${k}' does not resolve to a file: '${s}'`);    // oracle-aligned
    }
  }

  process.exit(0);
}

main(process.argv.slice(2));