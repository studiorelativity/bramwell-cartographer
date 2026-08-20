# Receipts — provenance and the one finding

These transcripts are unedited output of `_rig/bin/walk-test.sh` against
the final map (run 2026-08-19_223934, territory commit 16a4fc4): one
cold headless session per question, able to read only catalog.md and
cards/. Four questions, two models, same map.

On three of the four questions the models agree and are correct; the
frontier model relays more of the cards on Q1 and Q3 (the ContactForm
wrong-neighbor, a "not recoverable from source" boundary). The fourth
is the finding.

**Q2 asked what schema a new work entry must satisfy. Same card, two
answers:**

> haiku: …must satisfy the `work` schema… which requires a `title`,
> `status` ("published" or "draft"), and an `order` number.

> sonnet: …a publication state constrained to two values
> (src/content.config.ts:20@16a4fc4)… The card doesn't show the exact
> schema field list… it only cites select line numbers.

The card does not contain the values "published" or "draft" — the small
model reconstructed plausible ones, and the territory's real enum is
different (the schema lines the card cites hold the truth). The
reconstruction wasn't from nothing: "draft" is a real token in the
territory — the adjacent writing collection's draft flag
(src/content.config.ts:11@16a4fc4) — fused with a plausible partner
into an enum that does not exist. Overstatements anchored in real
fragments are exactly the ones that read as confident, and exactly what
a citation catches. The frontier model reported the card's boundary
instead and cited the line. Both transcripts ship as produced: a
confident answer and a citable one look identical until you can check,
and the citation is what makes the overstatement catchable in seconds.
That is this repo's argument, in one question.
