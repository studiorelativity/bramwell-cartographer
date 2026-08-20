---
noun: Global styles
path: src/styles/global.css
status: live
liveness: edge
---

## What it is

The territory's only stylesheet, and by its own header the only file in the
site where a colour may be written as a hex literal
(src/styles/global.css:1@16a4fc4). It opens with eight face declarations
binding three families — a display face, a body face, and a mono face — to the
woff2 files under the public fonts directory (src/styles/global.css:6@16a4fc4
through src/styles/global.css:60@16a4fc4). The custom-property block that
follows (src/styles/global.css:63@16a4fc4) is the token set: inks and grounds
(src/styles/global.css:65@16a4fc4), a three-step brand accent
(src/styles/global.css:72@16a4fc4), a verdict triad plus its paper body-size
tier (src/styles/global.css:77@16a4fc4, src/styles/global.css:84@16a4fc4), the
type scale (src/styles/global.css:102@16a4fc4), the spacing scale
(src/styles/global.css:109@16a4fc4), and the section-rule geometry
(src/styles/global.css:118@16a4fc4). Below the tokens it also carries the
chrome and primitive rulesets by class name — nav
(src/styles/global.css:209@16a4fc4), footer
(src/styles/global.css:247@16a4fc4), the logo lockup
(src/styles/global.css:283@16a4fc4), buttons
(src/styles/global.css:324@16a4fc4), and cards
(src/styles/global.css:347@16a4fc4).

## Why it is shaped this way

One flat file with no stylesheet imports beneath it, loaded exactly once by
the layout (src/layouts/Base.astro:4@16a4fc4), so a token and the rules that
consume it resolve in a single pass with no cascade ordering to reason about.
Components declare their own scoped styles and read the tokens through the
custom properties rather than redefining them (for example
src/components/ContactForm.astro:145@16a4fc4,
src/components/RigDemo.astro:160@16a4fc4). The blinking-cursor animation is
defined here (src/styles/global.css:302@16a4fc4) and cancelled by an explicit
modifier class (src/styles/global.css:315@16a4fc4) so that exactly one
instance on a page animates, a rule the file states in a comment at
src/styles/global.css:312@16a4fc4.

## Hits

- src/layouts/Base.astro — loses the token set and every chrome rule the shell
  and its children name (edge: src/layouts/Base.astro:4@16a4fc4)

## Does not hit

- src/components/Nav.astro — looks related because the entire nav ruleset,
  including the lockup and the current-page treatment, is defined in this
  file; no edge exists from src/styles/global.css to it. The coupling is by
  class name, which the edge list does not record.
- src/components/ContactForm.astro — looks related because its scoped style
  block sets colour, type, and spacing from these custom properties; no edge
  exists from src/styles/global.css to it.
