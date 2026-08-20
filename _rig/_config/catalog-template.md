# Catalog contract

The catalog is the front door. A cold reader loads it, picks one door,
opens one card, stops. The catalog points; it stores nothing.

## File shape

`catalog.md`. A three-to-five-line header stating what territory this
maps, the pinned commit, and the one rule: load this catalog, then one
card — never the whole cards folder, never the territory.

Then one line per card, grouped by noun class:

```
- **<noun>** (<status>) — <one-line door> → `cards/<noun-slug>.md`
```

## The door line

A door tells the reader whether their question lives behind it. It names
the noun's job in the reader's terms, not the file's contents.

Good: "every color and typeface on the site resolves here"
Bad: "CSS custom properties for the design system" (that's the card's
first sentence, copied up — the catalog now stores what the card holds)

## Hard rules

- One line per card. No card content, no citations, no hits — those live
  on the card.
- Every card has exactly one catalog line; no catalog line points at a
  card that does not exist. The verifier checks both directions.
- If the catalog needs a second paragraph to explain itself, the doors
  are bad — fix the doors, not the length.
