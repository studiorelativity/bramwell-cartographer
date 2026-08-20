// bin/fm.mjs — verified-rig (version: see VERSION) — strict flat-subset frontmatter parser
//
// Module, not executable: the one non-executable in bin/ (MANIFEST).
// Consumed by run.mjs and mock-claude.mjs — one implementation by design;
// the strictness is the point, and two copies would drift.
//
// THE SUBSET (this header is the normative grammar):
//   frontmatter = line 1 exactly "---", then content lines, then a line
//                 exactly "---"
//   key line    = key ":" (" " value)?   keys match [A-Za-z_][A-Za-z0-9_]*,
//                 start at column 0, and may not repeat
//   list        = "key:" with no value, followed by "- value" item lines
//                 (any indentation); items are scalars only
//   value       = double-quoted  (\" and \\ are the ONLY escapes)
//               | single-quoted  (no escapes at all)
//               | bare scalar    (no ": ", no trailing ":", no leading
//                 & * ! [ { | > % @ ` — quote it if you mean it literally)
//   comments    = full-line ("# ..."), or trailing: whitespace + "#" ends a
//                 bare scalar and may follow a closing quote
//   null        = "key:" with no value and no items
//
// EVERYTHING ELSE IS AN ERROR, by file and line: nested maps, indented
// keys, block scalars, anchors/aliases, tags, flow collections,
// directives, tabs, unknown escapes, junk after a closing quote,
// duplicate keys, list items without a key, empty list items,
// unterminated quotes or frontmatter. The frontmatter-shell bug class
// (v5.x, four incidents) died of undefined semantics; nothing here is
// undefined.
//
// All parsed values are strings, arrays of strings, or null. NO type
// coercion, ever: "1.00" stays "1.00", "no" stays "no". Consumers parse
// numbers where they need numbers.
//
// Returns { data, body, hasFrontmatter }. A file with no opening "---"
// returns empty data and the whole text as body — whether frontmatter is
// mandatory is the caller's policy, not the parser's.

function err(file, line, msg) {
  return new Error(`${file}:${line}: ${msg}`);
}

// Parse one scalar. Returns the string value, or null when the text is
// empty or comment-only. `where` names the construct for error messages.
function parseScalar(s, file, line, where) {
  s = s.trim();
  if (s === '' || s.startsWith('#')) return null;

  if (s.startsWith('"')) {
    let out = '';
    let i = 1;
    for (;;) {
      if (i >= s.length) throw err(file, line, `${where}: unterminated double quote`);
      const c = s[i];
      if (c === '\\') {
        const n = s[i + 1];
        if (n === '"' || n === '\\') { out += n; i += 2; continue; }
        throw err(file, line, `${where}: unsupported escape \\${n ?? ''} — ` +
          `only \\" and \\\\ exist in the subset; complex strings belong in bin/ scripts`);
      }
      if (c === '"') { i++; break; }
      out += c; i++;
    }
    const rest = s.slice(i);
    if (rest.trim() !== '' && !/^\s+#/.test(rest)) {
      throw err(file, line, `${where}: junk after closing quote: '${rest.trim()}'`);
    }
    return out;
  }

  if (s.startsWith("'")) {
    const close = s.indexOf("'", 1);
    if (close === -1) throw err(file, line, `${where}: unterminated single quote`);
    const rest = s.slice(close + 1);
    if (rest.trim() !== '' && !/^\s+#/.test(rest)) {
      throw err(file, line, `${where}: junk after closing quote: '${rest.trim()}' — ` +
        `single-quoted strings have no escapes; use double quotes for embedded quotes`);
    }
    return s.slice(1, close);
  }

  // Bare scalar. Whitespace-then-# starts a trailing comment (the YAML
  // rule, made explicit); a # glued to non-space is literal (foo#bar).
  const hash = s.search(/\s#/);
  if (hash !== -1) s = s.slice(0, hash).trim();
  if (s === '') return null;

  const first = s[0];
  if ('&*![{|>%@`'.includes(first)) {
    throw err(file, line, `${where}: bare value starts with '${first}' — anchors, aliases, ` +
      `tags, flow collections, block scalars, and directives are outside the subset; ` +
      `quote the value if it is a literal string`);
  }
  if (s.includes(': ') || s.endsWith(':')) {
    throw err(file, line, `${where}: ':' in a bare value looks like a nested mapping — ` +
      `nested structures are outside the subset; quote the value if it is a literal string`);
  }
  return s;
}

export function parseFrontmatter(text, file = '<frontmatter>') {
  if (typeof text !== 'string') throw err(file, 0, 'input is not a string');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split('\n').map((l) => (l.endsWith('\r') ? l.slice(0, -1) : l));

  if (lines[0] !== '---') {
    if (lines[0] !== undefined && lines[0].trim() === '---') {
      throw err(file, 1, "line 1 is '---' with stray whitespace — the opening marker must be exactly ---");
    }
    return { data: {}, body: text, hasFrontmatter: false };
  }

  let end = -1;
  let sloppy = 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { end = i; break; }
    if (!sloppy && lines[i].trim() === '---') sloppy = i + 1;
  }
  if (end === -1) {
    throw err(file, 1, 'unterminated frontmatter: opening --- never closed' +
      (sloppy ? ` (line ${sloppy} is '---' with stray whitespace)` : ''));
  }

  const data = {};
  let pending = null; // key that may still collect list items (or resolve to null)
  const closePending = () => {
    if (pending !== null && !(pending in data)) data[pending] = null;
    pending = null;
  };

  for (let i = 1; i < end; i++) {
    const raw = lines[i];
    const ln = i + 1;

    if (raw.trim() === '') continue;
    if (/^\s*#/.test(raw)) continue;
    if (raw.includes('\t')) {
      throw err(file, ln, 'tab character — the subset is spaces-only, everywhere');
    }

    // List item: optional indent, dash, space, scalar.
    const im = raw.match(/^\s*-(?:\s(.*))?$/);
    if (im) {
      if (pending === null) {
        throw err(file, ln, `list item without a preceding 'key:' line`);
      }
      const v = im[1] === undefined ? null : parseScalar(im[1], file, ln, `item of '${pending}'`);
      if (v === null) throw err(file, ln, `empty list item under '${pending}'`);
      if (!(pending in data)) data[pending] = [];
      data[pending].push(v);
      continue;
    }

    // Anything else that is indented is a nested structure trying to happen.
    if (/^\s/.test(raw)) {
      throw err(file, ln, 'indented content — nested structures are outside the subset (keys start at column 0)');
    }

    const km = raw.match(/^([A-Za-z_][A-Za-z0-9_]*):(.*)$/);
    if (!km) {
      throw err(file, ln, `not a 'key: value', 'key:', or '- item' line: '${raw.trim()}'`);
    }
    closePending();
    const key = km[1];
    if (key in data) throw err(file, ln, `duplicate key '${key}'`);
    const rest = km[2];
    if (rest === '') { pending = key; continue; }
    if (!rest.startsWith(' ')) {
      throw err(file, ln, `after '${key}:' a space or end of line is required`);
    }
    const v = parseScalar(rest, file, ln, `value of '${key}'`);
    if (v === null) { pending = key; continue; } // "key:  # comment" may still open a list
    data[key] = v;
  }
  closePending();

  return { data, body: lines.slice(end + 1).join('\n'), hasFrontmatter: true };
}