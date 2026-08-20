# Rules

## 1. Evidence before badges

No status is asserted from a read-through. The territory is scanned
first — deterministically, by script — into two files: every file
present, and every edge (import, link, resolved route) with its source
line. Statuses are adjudicated against those files:

- **live / edge** — something in the territory imports or links it. The
  card cites the edge.
- **live / contract** — no inbound edge, but a contract from the closed
  list in `reference/` consumes it: file-based routing, collection
  consumption, toolchain manifests, platform function routing, static
  serving. The card names the contract id. The list is closed — a
  contract not on it is a change to the rules, never a card's
  improvisation.
- **leftover** — no edge AND no contract. Both absences are checked. A
  territory with none is recorded as a finding, not decorated with an
  invented corpse.
- **ghost** — an edge points at it and it does not exist. A ghost card
  cites the referencing line and stops.

Labels, filenames, and comments are testimony, not evidence. A file
that says it is disabled and an edge list that says it is reached
disagree; the edge list wins.

## 2. Cite, never copy

Every factual claim on a card carries a citation: `path:line@commit`.
Maximum five quoted source lines per card, enforced mechanically and in
judgment. A card that reproduces its source is a photocopy, and a
photocopy is a defect: delete the territory and a true map becomes
worthless — that is the correct relationship.

## 3. Read the line, then write the citation

Before writing any citation, open the cited file and read the line the
number names. Confirm that line — not the line above it, not the block
it sits in — carries the content the sentence claims. A citation is
copied from the file open in front of you, never reconstructed from
memory of an earlier read. The failure this prevents is worse than a
broken citation: a number one line off still resolves, so it misleads
instead of announcing itself.

## 4. Hits and Does not hit

Every card says what else moves when its noun changes, one line per
hit, each hit naming the edge (or contract) that supports it. No edge,
no hit — a dependency remembered but not citable does not go on a card.
And every card names the wrong neighbour: the file a newcomer would
obviously reach for, with the checked absence that proves it is not on
the road. The absent edge is verified against the edge list like any
other claim; a wrong "does not hit" is permission to break something,
which makes it the most dangerous sentence on the card and the one most
worth checking.

## 5. The catalog points; it stores nothing

One line per card: a door, written in the reader's terms, that tells
them whether their question lives behind it. Card content stays on the
card. If the catalog needs a paragraph to explain itself, the doors are
bad — fix the doors.

## 6. The walk

Catalog, then ONE card, then stop. If the catalog cannot route a
question in one pass, that is a catalog defect — report it. If a card
cannot answer the question it was opened for, the honest response names
what the card cannot tell you; reaching for the whole territory is the
failure this map exists to prevent.

## 7. Verification is somebody else's job

The writer of a card never grades it. After writing: a mechanical pass
resolves every citation against the pinned territory and counts quoted
lines; then a separate read-only verifier opens every cited line and
judges whether it supports its sentence, checks every hit against the
edge list and every absence as genuine, and passes or fails the map as
a whole, naming defects by card and line. A verifier that has only ever
passed good work is unproven — this one's record includes a planted
defect caught by name and one live failure of a map whose every
citation resolved.

## 8. The refusals

No diagnosis (why something broke), no audit (a list of everything
wrong), no tour (a narrated run-through), no advice (what to refactor,
what to build). A card that starts prescribing has left the map and
joined the opinions.
