---
noun: RigDemo
path: src/components/RigDemo.astro
status: live
liveness: edge
---

## What it is

The largest file in the territory and the homepage's interactive centrepiece: a
widget that walks a reader through a gated pipeline run
(src/components/RigDemo.astro:10@16a4fc4). Three buttons pick the scenario — a
clean run (src/components/RigDemo.astro:14@16a4fc4), a malformed handoff
(src/components/RigDemo.astro:15@16a4fc4) and bad work
(src/components/RigDemo.astro:16@16a4fc4) — and the script steps the chosen
scenario's ordered list of step outcomes
(src/components/RigDemo.astro:381@16a4fc4) across three stage columns, ending on
a preserved artifact: a gate's error line, a handoff file, or a verdict. Every
scenario's final frame is also present as static markup
(src/components/RigDemo.astro:67@16a4fc4), so the demonstration still teaches
with JavaScript off. It opens by naming itself a demonstration of the mechanism
rather than a live AI run (src/components/RigDemo.astro:11@16a4fc4) and closes
on the distinction between a halt and a fail
(src/components/RigDemo.astro:155@16a4fc4).

## Why it is shaped this way

Its header comment records the constraint: self-contained, with no imports, no
dependencies, no network, no storage and no free-text input
(src/components/RigDemo.astro:3@16a4fc4), which is why the markup, the styles
and the script all sit in this one file. The interactive view is hidden by
default (src/components/RigDemo.astro:339@16a4fc4) and only revealed when the
script has finished wiring itself up
(src/components/RigDemo.astro:550@16a4fc4), at which point the static frames are
hidden (src/components/RigDemo.astro:342@16a4fc4) — the swap happens once, so
neither version can flash. A reduced-motion preference skips the timed walk and
renders the whole scenario at once
(src/components/RigDemo.astro:510@16a4fc4).

## Hits

- src/pages/index.astro — the sole importer; the homepage embeds this widget, so a change to it changes the homepage (edge: src/pages/index.astro:3@16a4fc4)

## Does not hit

- src/pages/how-it-works.astro — looks related because it is the page that explains in prose the same gated pipeline this widget demonstrates, and a newcomer expects the demo to live with the explanation; no edge exists from src/components/RigDemo.astro to it — the widget is embedded on the homepage only.
- src/styles/global.css — looks related because this component's scoped styles are written entirely against the custom properties defined there, including the body-size verdict tier the step rows are coloured with (src/components/RigDemo.astro:279@16a4fc4); the coupling is by token name at paint time, and no edge exists from src/components/RigDemo.astro to it.
