---
noun: Rig Demo
path: src/components/RigDemo.astro
status: live
liveness: edge
---

## What it is

The homepage's interactive demonstration of a gated pipeline run: a
three-button scenario chooser (src/components/RigDemo.astro:14@86aa09a), a
three-stage run display in which every gate, work, and verdict node already
exists in the markup (src/components/RigDemo.astro:29@86aa09a), an expandable
artifact panel, and a polite live region that announces run status
(src/components/RigDemo.astro:62@86aa09a). Beneath the interactive block it
carries a static rendering of all three scenarios' final frames for readers
without JavaScript (src/components/RigDemo.astro:67@86aa09a). It holds its own
scoped styles and one inline vanilla script
(src/components/RigDemo.astro:351@86aa09a), and it renders on exactly one page
(src/pages/index.astro:3@86aa09a).

## Why it is shaped this way

A comment declares the component self-contained — no imports, no external
dependencies, no network calls, no storage, no free-text input
(src/components/RigDemo.astro:3@86aa09a) — which is why the largest file in
the territory has no outbound edges at all. The script only rewrites text and
state attributes on nodes that are already present
(src/components/RigDemo.astro:20@86aa09a), and a CSS switch hides the static
frames only once the script marks the root element as active
(src/components/RigDemo.astro:342@86aa09a), so the teaching content survives
JavaScript being off.

## Hits

- src/pages/index.astro — imports and renders this component; the homepage's
  centre section is this widget (edge: src/pages/index.astro:3@86aa09a)

## Does not hit

- src/styles/global.css — looks related because this component's scoped rules
  resolve the global tokens rather than defining their own, for instance the
  mono family and size on the artifact panel
  (src/components/RigDemo.astro:319@86aa09a); no edge exists from
  src/components/RigDemo.astro to it.
- src/components/ContactForm.astro — looks related because it is the site's
  only other component carrying an inline script, and that script describes
  itself as the second and last piece of client JavaScript on the site
  (src/components/ContactForm.astro:206@86aa09a), so the two read as a pair;
  no edge exists from src/components/RigDemo.astro to it.
