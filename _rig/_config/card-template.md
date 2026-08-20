# Card contract

One card per noun. A card is a map entry, not a copy of the source. If
the card and the real file disagree, the file wins and the card is wrong.

## File shape

Filename: `cards/<noun-slug>.md`. YAML frontmatter, then four sections in
this order. Nothing else.

```
---
noun: <name as the codebase uses it>
path: <primary source path, relative to snapshot root>
status: live | leftover | ghost
liveness: edge | contract        # live nouns only; omit otherwise
---
```

## Section 1 — What it is

Two to four sentences. What this noun is and what job it does. Every
factual claim carries a citation `path:line@commit`. Plain prose; no
lists.

## Section 2 — Why it is shaped this way

One to three sentences. The design reason a newcomer cannot see from the
file alone — why it lives where it lives, why it is split or merged the
way it is. If the reason is visible in the source (a comment, a config
key), cite it. If it is not knowable from the territory, say "not
recoverable from source" rather than inventing a story.

## Section 3 — Hits

What else moves if you change this noun. One line per hit:

```
- <path> — <what changes there> (edge: <from>:<line>@<commit>)
```

Every hit names the edge in `edges.json` that supports it. No edge, no
hit — a dependency you remember but cannot cite does not go on the card.
For contract-live nouns, hits may also cite the contract by id where the
consumer is the toolchain itself (e.g. changing `package.json` scripts
hits the build: contract `toolchain-manifest`).

## Section 4 — Does not hit

The obvious wrong neighbor: the noun a newcomer would reach for and be
wrong. One or two entries:

```
- <path or noun> — looks related because <reason>; no edge exists from
  <this noun> to it.
```

The claim is the *absence* of an edge, and the verifier checks that
absence against `edges.json`.

## Status badges — two kinds of alive, one kind of dead

- **live / edge** — something in the territory imports or links it: an
  inbound edge exists in `edges.json`. The card cites the edge.
- **live / contract** — no inbound edge, but a contract from the closed
  contract list in `noun-guidance.md` consumes it (file-based routing,
  collection consumption, toolchain manifest, platform function routing,
  static serving). The card names the contract id and states in one
  sentence why the file matches it. A contract claim never names a
  contract absent from the closed list — a new contract class is a
  `_config/` change, not a card improvisation.
- **leftover** — no inbound edge AND no contract matches. Honest dead
  weight, and only now: a leftover badge asserts both absences, and the
  verifier checks both.
- **ghost** — an edge points at it, but the target is absent from
  `files.json`. A ghost card cites the referencing line and states the
  target does not exist. Ghost cards have no Sections 2–4 beyond that.

## Hard rules

- Cite, never copy. Maximum quoted source lines per card:
  `quote_cap_lines` from run-input.md (default 5). Quoting means any
  verbatim reproduction of source, fenced or inline.
- Every citation format is exactly `path:line@commit` — the mechanical
  checker parses this shape and nothing else.
- No prescriptions. A card says what is and what moves — never "you
  should refactor this." A card that advises is out of contract.
