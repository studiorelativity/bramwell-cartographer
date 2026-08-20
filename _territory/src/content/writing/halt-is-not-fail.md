---
title: "Halt is not fail"
description: "A halt means the plumbing is suspect. A fail means the work was judged bad. Collapsing the two costs you the diagnosis."
pubDate: 2026-08-16
---

A pipeline that stops tells you something stopped it. Most systems stop with one
word for it — error — and that single word is the reason debugging them is slow.
The rig this site was built on has three verdicts, and two of them are stops.

A **verdict** is a small file a checker writes after reading a stage's output. It
carries a status and one sentence of reason. The status is `pass`, `halt`, or
`fail`, and nothing else is legal.

`pass` means the work was read and judged good. The next stage may start.

`fail` means the work was read and judged bad. Someone wrote something, a checker
looked at it, and the checker ruled against it. The content is wrong.

`halt` means the plumbing is suspect. The stage may never have gotten a fair
chance to produce anything: a required input was missing, a handoff file was the
wrong shape, a **gate** — the mechanical check that runs before a stage starts and
asks whether the inputs it declared it needs are actually present — refused to
open. In this rig, a gate failure is a halt, never a fail.

## Why the distinction pays

The two stops route to different humans and different fixes.

A fail sends you to the work: read what the worker produced, read the reason,
decide whether the fitting's instruction was underspecified or the rubric was
wrong. A **fitting** is one instruction file run as one fresh process — the unit
you actually edit when a fail recurs.

A halt sends you to the wiring: read the handoff, find the key that was missing
or malformed, and fix the producer that should have written it. Nothing about the
worker's judgment is in question, because its judgment was never exercised.

Label a halt as a fail and you go rewrite a prompt that was fine. Label a fail as
a halt and you go hunting a plumbing bug that does not exist. Both are hours
spent in the wrong file.

## What a halt does to the evidence

A halt in this rig is not retried. The failing handoff stays on disk exactly as
it was written, because that file is the diagnosis. Retrying first would either
overwrite the evidence or, worse, get lucky — and a lucky pass hides a defect
that comes back later at a time you did not choose.

This is the same reason the failing artifact is not summarized into a log line
and deleted. You go and look at the actual thing.

## What this means when you are watching it run

A first halt feels like a failure and is not one. It is the system doing the job
you installed it to do: refusing to build stage four on a stage-three output it
could not verify. The alternative is not a run without defects. The alternative
is a run where the defect went through, became the foundation of everything
after it, and surfaced somewhere expensive.

A stop is information. Which stop it is, is more information. Keep them apart.
