---
title: "The no.fail rebuild, built by the process it sells"
slug: nofail-jidoka
status: in-progress
order: 1
url: null
summary: "This website is the output of a verified rig — a stateless pipeline where every stage ran as an isolated process, every handoff was mechanically gated, and every stage's output was judged by an independent verifier before the next stage started. The run's logs — every invocation, verdict, and dollar — are the raw material for a forthcoming white paper."
stack: "verified-rig skeleton (v5.4), headless Claude Code, bash 3.2 orchestration, jq gates, Astro, Cloudflare Pages"
caption: "currently rebuilding — the architecture is on display"
---

The portfolio opens with one system, mid-build, with its decisions on display.
That is the entry: this site.

no.fail sells staged delivery with a checker after every step. Rather than
describe it, the site was built that way. Four stages ran the job — plan, copy,
components, assemble — each one an isolated process that received only what the
stage before it handed over. Nothing carried between stages except the handoff
file, and the handoff was checked before the next stage was allowed to start.

Every stage was judged by a verifier that had no power to fix anything. The
worker writes; the verifier reads and rules; the two are never the same process.
Work that failed its reading did not become the input to the next stage.

The demo on the homepage runs the same loop, so a visitor can watch the shape of
it instead of taking the description on faith.

The orchestration targets stock macOS bash 3.2 — the shell that ships on the
machine, with no runtime to install first.

The build is not finished, and the entry says so. What the run recorded — every
invocation, every verdict, every dollar — is the material for a white paper that
is forthcoming. Nothing from those records is quoted here until that paper
exists.
