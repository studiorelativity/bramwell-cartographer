---
title: "Runtime-Isolated Gates"
description: "RIG, unpacked: stage, gate, feed, verdict, fitting — and why running every step fresh with only the context it needs is what stops drift."
pubDate: 2026-08-16
---

RIG stands for Runtime-Isolated Gates. "Isolated" is the adjective on the
runtimes: each step runs in its own process, and the gates sit between them.
The properties matter more than the acronym, so here are the parts.

## The vocabulary, defined once

A **stage** is one phase of the work with a contract: what it reads, what it
writes, what it hands on. Stages run in order.

A **fitting** is one instruction file executed as exactly one process. A stage is
made of fittings. Nothing is shared between two fittings — not memory, not
scrollback, not an open session. If a fitting needs something, it reads it from
disk.

A **feed** is the one file a stage hands to the next stage. Not the stage's whole
output directory — one file, with a declared shape. Everything else a stage
produced is scratch, and no later stage may read it.

A **gate** is a mechanical check that runs before a stage starts. It asks one
question: are the keys this stage declared it needs actually present in the feed?
It is a script, not a model. It has no opinion.

A **verdict** is a file a checker writes after reading a stage's output: a status
and one sentence of reason. The checker cannot edit the thing it is judging.

## Why fresh processes

The failure mode of a long AI session is drift. Context accumulates, and the
accumulation is invisible: an assumption made at step two is still in the window
at step nine, shaping output nobody traces back to it. The session gets more
confident and less anchored at the same time, and there is no line in the
transcript that says when it happened.

A fitting cannot drift into the next fitting, because there is no next fitting in
its process. It ends. The following one starts with an empty context and reads
what the contract names — the feed, the config files its instruction declares,
nothing else. Two fittings that disagree cannot quietly average themselves out;
one of them writes something the other's gate or checker rejects, and the
disagreement becomes a file you can read.

Isolation is also what makes the reading-list finite. A fitting that may read
everything has no defined input, and a step with no defined input cannot be
verified, because there is nothing to hold the output against.

## Why gates are dumb on purpose

The gate is deterministic. It checks presence and shape, and it makes no judgment
about quality — that is the checker's job, one step later and structurally
separate.

Keeping them apart is what makes the arrangement adversarial rather than
self-reported. The worker writes but does not grade. The checker grades but
cannot fix; a checker that could edit would be tempted to patch instead of rule,
and the ruling is the product. The orchestrator sequences and branches but does
not think — it reads a status field and takes a branch.

Three roles, no overlap. Most "AI with guardrails" collapses them into one model
asked to check itself.

## What you get out of it

Deterministic control, verified judgment. The rails — gates, branching, budgets,
sequencing — are ordinary code and behave the same way every run. The model does
judgment work inside those rails and is checked by something that did not
produce the work.

The audit trail is a byproduct. Each stage leaves its feed, its scratch, and its
verdict on disk, so the question "why does the output look like this" is answered
by reading files rather than by re-running and hoping for the same result.

None of this makes a model correct. It makes a wrong answer stop where it was
produced, with the evidence still sitting there, instead of becoming the
foundation of everything downstream.
