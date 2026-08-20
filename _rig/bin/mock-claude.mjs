#!/usr/bin/env node
// bin/mock-claude.mjs — verified-rig (version: see VERSION) — mock harness (CLAUDE_BIN stand-in)
//
// Stands in for the claude CLI in --mock runs: same argument surface, same
// stream-json stdout shape, fresh process per invocation, no state between
// invocations. Fully generic — frontmatter-driven, building schema-conformant
// stubs from each stage's own feed.schema.json. A mock that hardcodes stage
// names is project-shaped machinery masquerading as skeleton (RIG-paper §4).
//
// Scenario surface (env), vocabulary carried from v5.x:
//   MOCK_SCENARIO = good (default) | bad_feed | verdict_fail | verdict_halt
//                 | verdict_missing
//   MOCK_STAGE    = optional NN_name: the scenario applies only at that
//                   stage; elsewhere behavior is `good`. Unset, the scenario
//                   applies at the first stage it can — the run stops there,
//                   so "everywhere" and "first" coincide.
//
// Scenario semantics:
//   good            work: schema-conformant stub to the declared output;
//                   verify: {"status":"pass"} verdict
//   bad_feed        the feed-writing fitting (declared output basename
//                   feed.json) writes an unparseable feed; everything else
//                   behaves good — the NEXT stage's gate is what halts
//   verdict_fail    the verifier writes {"status":"fail"}
//   verdict_halt    the verifier writes {"status":"halt"}
//   verdict_missing the verifier writes nothing and exits 0 — run.mjs must
//                   turn the absent file into a halt (that is the test)
//
// Coupling, by design: stage and fitting are parsed from the -p prompt
// run.mjs composes ("You are executing [verifier ]fitting F of stage S.").
// Both files are skeleton-tier and version together; a change to the
// prompt wording changes this parser in the same commit.

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './fm.mjs';

const SCENARIOS = ['good', 'bad_feed', 'verdict_fail', 'verdict_halt', 'verdict_missing'];
// Value-taking CLI flags to skip while scanning argv for -p / --version.
const VALUE_FLAGS = new Set([
  '--settings', '--allowedTools', '--permission-mode', '--max-turns',
  '--max-budget-usd', '--output-format', '--model', '--mcp-config',
]);

function die(msg) {
  process.stderr.write(`mock-claude: ${msg}\n`);
  process.exit(2);
}
function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}
function readVersion() {
  try { return fs.readFileSync('VERSION', 'utf8').trim(); } catch { return 'unknown'; }
}

// Minimal conforming instance from a JSON-schema subset. Priority per
// node: const, enum[0], default, examples[0], then a type filler. Objects
// emit every declared property (requires.json chains on what the schema
// DECLARES it produces, not only on `required`). The mock never
// manufactures side files: a property whose value must be an existing
// path (a downstream path_key) carries that path in the schema's
// default/examples, or the gate halts — correctly.
// Strings honour minLength, arrays minItems, integers minimum — so the
// stub clears the same deterministic checks a real worker's output would.
// Transcribed from v5.4 mock-claude's `mockstr`.
function mockstr(min) {
  const m = (typeof min === 'number' ? min : 0) + 8;
  const words = Array.from({ length: Math.floor(m / 4) + 2 }, () => 'mock');
  return words.join(' ').slice(0, m > 12 ? m : 12);
}

function stub(schema) {
  if (schema == null || typeof schema !== 'object') return 'stub';
  if ('const' in schema) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if ('default' in schema) return schema.default;
  if (Array.isArray(schema.examples) && schema.examples.length) return schema.examples[0];
  let t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (!t && (schema.properties || schema.required)) t = 'object';
  switch (t) {
    case 'object': {
      const o = {};
      for (const k of Object.keys(schema.properties || {})) o[k] = stub(schema.properties[k]);
      for (const k of schema.required || []) if (!(k in o)) o[k] = mockstr(0);
      return o;
    }
    case 'array': {
      const n = typeof schema.minItems === 'number' ? schema.minItems : 0;
      return Array.from({ length: n }, () => stub(schema.items));
    }
    case 'integer':
    case 'number': return typeof schema.minimum === 'number' ? schema.minimum : 1;
    case 'boolean': return true;
    case 'null': return null;
    default: return mockstr(schema.minLength);
  }
}

function main(argv) {
  // Argument scan: react to --version and -p, skip everything else.
  let prompt = '';
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--version') { process.stdout.write(`mock-claude ${readVersion()}\n`); process.exit(0); }
    else if (t === '-p') prompt = argv[++i] || '';
    else if (VALUE_FLAGS.has(t)) i++;
  }
  if (!prompt) die('no -p prompt given');

  const scenario = process.env.MOCK_SCENARIO || 'good';
  if (!SCENARIOS.includes(scenario)) {
    die(`unknown MOCK_SCENARIO '${scenario}' — one of: ${SCENARIOS.join(', ')} (fail closed, not defaulted)`);
  }
  const targetStage = process.env.MOCK_STAGE || '';

  const m = prompt.match(/^You are executing (verifier )?fitting (\S+) of stage (\S+)\./);
  if (!m) die(`prompt does not match run.mjs's composed wording: '${prompt.slice(0, 80)}'`);
  const fitting = m[2];
  const stage = m[3];

  // The prompt names the fitting by bare basename, as v5.4's mock did
  // (`fit="$dir/fittings/$fname.md"`); the file carries the .md suffix.
  const fitPath = path.join(stage, 'fittings',
    fitting.endsWith('.md') ? fitting : `${fitting}.md`);
  if (!fs.existsSync(fitPath)) die(`fitting not found: ${fitPath}`);
  let data;
  try { data = parseFrontmatter(fs.readFileSync(fitPath, 'utf8'), fitPath).data; }
  catch (e) { die(e.message); }
  const role = data.role == null ? 'work' : String(data.role);
  const model = data.model == null ? 'mock' : String(data.model);
  const applies = !targetStage || targetStage === stage;

  emit({ type: 'system', subtype: 'init', model, tools: [], cwd: process.cwd() });
  let did = '';

  if (role === 'verify') {
    const vPath = path.join(stage, 'output', 'verdict.json');
    if (scenario === 'verdict_missing' && applies) {
      did = `wrote nothing (scenario verdict_missing) — the absent ${vPath} is the test`;
    } else {
      const status = scenario === 'verdict_fail' && applies ? 'fail'
        : scenario === 'verdict_halt' && applies ? 'halt' : 'pass';
      const verdict = { status, reason: `mock verifier: scenario ${applies ? scenario : 'good'} — rubric not judged` };
      fs.mkdirSync(path.dirname(vPath), { recursive: true });
      fs.writeFileSync(vPath, JSON.stringify(verdict) + '\n');
      did = `wrote ${vPath} (${status})`;
    }
  } else {
    const outRel = data.output == null ? 'output/feed.json' : String(data.output);
    const outPath = path.join(stage, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const isFeed = path.basename(outPath) === 'feed.json';
    if (scenario === 'bad_feed' && applies && isFeed) {
      fs.writeFileSync(outPath, '{"this is not json\n');
      did = `wrote ${outPath} UNPARSEABLE (scenario bad_feed) — the next gate is the test`;
    } else if (data.schema != null) {
      const sPath = path.join(stage, String(data.schema));
      if (!fs.existsSync(sPath)) die(`declared schema not found: ${sPath}`);
      let schema;
      try { schema = JSON.parse(fs.readFileSync(sPath, 'utf8')); }
      catch { die(`declared schema unparseable: ${sPath}`); }
      fs.writeFileSync(outPath, JSON.stringify(stub(schema), null, 2) + '\n');
      did = `wrote ${outPath} conforming to ${String(data.schema)}`;
    } else {
      fs.writeFileSync(outPath, outPath.endsWith('.json') ? '{"stub":true}\n' : 'mock stub\n');
      did = `wrote ${outPath} (no schema declared)`;
    }
  }

  emit({ type: 'assistant', message: { content: [{ type: 'text', text: `mock ${role} ${stage}/${fitting}: ${did}` }] } });
  emit({
    type: 'result', subtype: 'success', is_error: false, model,
    usage: { input_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 0 },
    total_cost_usd: 0, result: did,
  });
  process.exit(0);
}

main(process.argv.slice(2));