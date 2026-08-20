---
noun: Global Stylesheet
path: src/styles/global.css
status: live
liveness: edge
---

## What it is

The site's single global stylesheet. It holds the eight `@font-face`
declarations that bind the self-hosted font files to three families
(src/styles/global.css:6@86aa09a), the full custom-property token set —
inks and grounds, the accent steps, the verdict triad, the type scale, the
spacing scale, and the section-rule geometry (src/styles/global.css:63@86aa09a)
— and the element and utility rules everything else composes from
(src/styles/global.css:154@86aa09a). It is pulled in exactly once, by the base
layout (src/layouts/Base.astro:4@86aa09a), so no page imports it directly.
Its opening comment states the rule the rest of the site follows: this is the
only file permitted to write a raw colour value, and everything else
references the custom properties (src/styles/global.css:1@86aa09a).

## Why it is shaped this way

Tokens and the rules that consume them sit in one file because the palette is
defined by measured contrast pairs and the ratios are recorded in comments
beside the values that earn them (src/styles/global.css:84@86aa09a) —
separating the tokens out would separate a value from the check that licenses
it. The file is deliberately wider than what the pages currently use: a block
of dark-surface tokens is defined and marked as not yet consumed
(src/styles/global.css:88@86aa09a).

## Hits

- src/layouts/Base.astro — the one import that pulls this stylesheet into
  every page; a renamed token or a moved file lands here first
  (edge: src/layouts/Base.astro:4@86aa09a)

## Does not hit

- src/components/RigDemo.astro — looks related because its scoped style block
  resolves this file's tokens rather than defining its own, for instance the
  mono family and size on its artifact panel
  (src/components/RigDemo.astro:319@86aa09a); no edge exists from
  src/styles/global.css to it.
- public/favicon.svg — looks related because it is a public asset addressed by
  a root-absolute URL, the same shape as the font sources declared here; no
  edge exists from src/styles/global.css to it — the favicon is linked from
  the layout instead (src/layouts/Base.astro:21@86aa09a).
