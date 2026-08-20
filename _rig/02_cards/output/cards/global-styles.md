---
noun: Global styles
path: src/styles/global.css
status: live
liveness: edge
---

## What it is

The only stylesheet in the territory, and the file where the design tokens are
defined. Eight `@font-face` blocks load the three families from `public/fonts/`
(src/styles/global.css:6@16a4fc4), then a single `:root` block
(src/styles/global.css:63@16a4fc4) declares the colour, type, spacing and rule
tokens every other file consumes: the near-black ink
(src/styles/global.css:65@16a4fc4), the pumpkin accent
(src/styles/global.css:72@16a4fc4), the verdict triad announced at
src/styles/global.css:76@16a4fc4, the display font stack
(src/styles/global.css:98@16a4fc4) and the first step of the spacing scale
(src/styles/global.css:109@16a4fc4). Beyond the tokens it carries the element
defaults and the site chrome rules for the nav
(src/styles/global.css:209@16a4fc4), the footer
(src/styles/global.css:247@16a4fc4) and the logo lockup
(src/styles/global.css:283@16a4fc4).

## Why it is shaped this way

Its own opening comment states the rule that shapes it: this is the one file
where a colour may be a hex literal, and every other file references the custom
properties instead (src/styles/global.css:1@16a4fc4). The verdict colours are
split into a display tier and a body-size tier cleared against the darker paper
ground (src/styles/global.css:82@16a4fc4), which is why there are two names for
each verdict rather than one. The lockup sizes everything in `em` from a single
pixel value so one knob rescales the whole mark
(src/styles/global.css:288@16a4fc4).

## Hits

- src/layouts/Base.astro — the sole importer; the stylesheet enters the build through it and therefore reaches every page (edge: src/layouts/Base.astro:4@16a4fc4)

## Does not hit

- src/components/RigDemo.astro — looks related because that component's scoped styles read the same custom properties this file defines, down to the body-size verdict tier (src/components/RigDemo.astro:279@16a4fc4); the coupling is by token name at paint time, and no edge exists from src/styles/global.css to it.
- public/favicon.svg — looks related because this file wires seven other assets out of `public/` by root-absolute URL (src/styles/global.css:8@16a4fc4), so a newcomer expects the icon to be wired here too; no edge exists from src/styles/global.css to it — the icon is linked by the layout (edge: src/layouts/Base.astro:21@16a4fc4).
