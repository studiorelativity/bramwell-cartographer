---
noun: Site footer
path: src/components/Footer.astro
status: live
---

## What it is

The closing site chrome. It computes the current year at build time and
declares seven destinations as a local array of label and href pairs — the
nav's six plus privacy (src/components/Footer.astro:6@dcba75e,
src/components/Footer.astro:8@dcba75e). It renders a footer element holding the
wordmark lockup as a link home, a labelled nav wrapping the link list, a
sentence stating the site was built and verified on the pipeline architecture
it describes, and the copyright line carrying the computed year
(src/components/Footer.astro:18@dcba75e, src/components/Footer.astro:19@dcba75e,
src/components/Footer.astro:23@dcba75e, src/components/Footer.astro:30@dcba75e,
src/components/Footer.astro:31@dcba75e). The lockup here takes an extra
modifier class alongside the shared one (src/components/Footer.astro:19@dcba75e).

## Why it is shaped this way

The wording is not authored here — the file records that every word comes from
a copy manifest and is consumed by name
(src/components/Footer.astro:2@dcba75e). The modifier class exists because this
lockup instance must not animate its cursor while the nav's does, and the file
states the distinction is made explicit in the markup rather than inferred from
position (src/components/Footer.astro:4@dcba75e).

## Hits

- src/layouts/Base.astro — the layout imports this component and closes every
  page with it, so a change to the link list or the closing lines reaches the
  whole site through the layout (edge: src/layouts/Base.astro:3@dcba75e)

## Does not hit

- src/components/Nav.astro — looks related because it is the other half of the
  chrome pair, renders the same lockup markup, and carries six of these seven
  links; no edge exists from this noun to it, and none from it back — both are
  assembled independently by the layout.
- src/styles/global.css — looks related because this element's own rules,
  including its top hairline and its shared padding shell, live there; no edge
  exists from this noun to it.
