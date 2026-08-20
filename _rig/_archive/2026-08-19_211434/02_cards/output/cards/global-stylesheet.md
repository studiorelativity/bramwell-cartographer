---
noun: Global stylesheet
path: src/styles/global.css
status: live
---

## What it is

The site's only stylesheet, and the one place a colour is allowed to be a hex
literal (src/styles/global.css:1@dcba75e). It opens with eight font-face
declarations covering three families across their shipped weights
(src/styles/global.css:6@dcba75e, src/styles/global.css:55@dcba75e), then
defines the whole token set on the root element — inks and grounds, a
three-step brand accent, a pass/halt/fail verdict triad with a separate
body-size tier, dark-surface tokens, the type families, a type scale, an
eight-step spacing scale, and the measurements of the section rule
(src/styles/global.css:63@dcba75e, src/styles/global.css:77@dcba75e,
src/styles/global.css:84@dcba75e, src/styles/global.css:98@dcba75e,
src/styles/global.css:109@dcba75e, src/styles/global.css:118@dcba75e). Below
the tokens it sets element defaults and the shared layout and chrome classes,
including the page column, the fading section rule, the nav bar, and the footer
(src/styles/global.css:130@dcba75e, src/styles/global.css:164@dcba75e,
src/styles/global.css:178@dcba75e, src/styles/global.css:209@dcba75e,
src/styles/global.css:247@dcba75e).

## Why it is shaped this way

The file states its own rule in its first comment: literals are transcribed
here from the design source once, and every other file reaches them by custom
property instead of writing a colour value of its own
(src/styles/global.css:1@dcba75e). That is why component styles elsewhere are
scoped and token-consuming while this file is global and token-defining, and
why the font-face block sits here rather than beside the layout that preloads
one of the same files (src/styles/global.css:22@dcba75e).

## Hits

- src/layouts/Base.astro — the layout's bare side-effect import pulls this
  stylesheet into every page, so a token rename or a class rename reaches the
  whole site through it (edge: src/layouts/Base.astro:4@dcba75e)

## Does not hit

- src/components/RigDemo.astro — looks related because its scoped style block
  consumes these tokens on nearly every rule, so a reader assumes a link
  between the two files; no edge exists from this noun to it, and none from it
  back — the tokens arrive through the layout, not through a component import.
- src/components/ContactForm.astro — looks related for the same reason, its
  form controls being styled entirely out of these custom properties; no edge
  exists from this noun to it.
