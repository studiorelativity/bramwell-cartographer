# Examples — the map, walked

The worked map for this submission is not reproduced here; it ships in
`map/` (catalog + ten cards), verified against the pinned territory in
`_territory/`. This file shows the map *working*: real questions, walked
by real cold readers, answering from one card each. The full unedited
transcripts are in `receipts/`; excerpts below.

## Walk 1 — find the tokens

**Q: Where do the site's colors and typefaces come from, and what file
would I edit to change the accent color?**

The catalog's door for the token source reads in the reader's terms —
every color and typeface resolves there — and routes to one card. A cold
reader (no memory, able to see only the catalog and cards) answered:

> All colors, typefaces, and spacing come from `src/styles/global.css`,
> loaded site-wide via `src/layouts/Base.astro`; it's the one file allowed
> to use hex literals, with the pumpkin accent color defined at
> `src/styles/global.css:72` inside the `:root` token block — that's the
> file to edit. Card read: **cards/global-styles.md**.

One door, one card, a cited line, stop.

## Walk 2 — change something, know the blast radius

**Q: If I change the base layout, what else on the site is affected?**

> Changing `Base.astro` ripples to every page that wraps in it — all
> eleven listed pages/routes (home, about, contact + its error/sent
> subpages, how-it-works, privacy, work index and its dynamic slug pages,
> writing index and its dynamic slug pages) — since it's where the nav,
> footer, title, meta description, and stylesheet all resolve. It
> explicitly does *not* affect `rss.xml.js` (no document shell) or mount
> `ContactForm.astro` directly (that's page-level). The card can't tell
> you why the chrome is inlined here rather than composed per page —
> that's not recoverable from source.
>
> Card read: `cards/base-layout.md`

Note the rss.xml.js sentence: the reader relayed a **Does not hit** —
the obvious wrong neighbour, denied with its reason. That absence is
not the card author's recollection; it was checked against the
extracted edge list before the map passed verification.

## Walk 3 — the boundary, answered honestly

**Q: Tony's photo isn't showing on the about page. Which file is the
problem, and does the map tell you?**

This question aims past the map's evidence classes on purpose: the photo
is referenced from markdown frontmatter, which the scanner does not
parse. The reader:

> This card defines the `people` collection's schema
> (src/content.config.ts) and confirms about.astro reads content through
> it, but it doesn't show the schema's actual fields or which one is a
> photo/image field — so it can't tell me whether the schema even has a
> photo field, or where Tony's specific entry file/photo asset lives.
>
> Card read: **content-config.md**

The map's most important behaviour is on that tape: at its boundary it
says what it cannot tell you and stops, instead of inventing a
plausible answer. Both a frontier model and a small model gave the same
shape of answer — see `receipts/`.

## The failure worth showing

One walk's answers are only as good as the cards, so here is the map
being *rejected*. During the build, a run produced cards whose 150
citations all resolved — real files, real lines — and the verifier
failed the map anyway:

> content-config.md attaches src/content.config.ts:19 to the claim that
> the work collection declares a shipped/in-progress status and an
> explicit order, when line 19 is the optional slug field (status is
> line 20, order line 21).

A citation one line off resolves fine and misleads. The fix went to the
card writer's instructions (read the line, then write the citation), no
card was hand-edited, and the re-run passed with the corrected lines —
which then appeared, correct, in the cold reader's transcripts in
receipts/ (sonnet-q2) (`:20` for the status constraint, `:21` for the
ordering). Defect → instruction fix → verified card → correct
stranger's answer, end to end, all of it in `_rig/log/` and
`receipts/`.
