---
noun: ContactForm
path: src/components/ContactForm.astro
status: live
liveness: edge
---

## What it is

The whole contact interaction in one 263-line component: a form that posts to
the site's contact API route (src/components/ContactForm.astro:35@16a4fc4) with
four visible fields plus a decoy field for bots
(src/components/ContactForm.astro:91@16a4fc4). Its native validation attributes
mirror the bounds the server enforces — a 200-character name
(src/components/ContactForm.astro:44@16a4fc4), a 254-character email
(src/components/ContactForm.astro:57@16a4fc4), and a message between 10 and
5000 characters (src/components/ContactForm.astro:81@16a4fc4,
src/components/ContactForm.astro:82@16a4fc4). An inline script at the bottom
(src/components/ContactForm.astro:205@16a4fc4) intercepts submission
(src/components/ContactForm.astro:215@16a4fc4), sends the same fields as JSON
(src/components/ContactForm.astro:232@16a4fc4), and writes the outcome into a
polite live region as text, never markup
(src/components/ContactForm.astro:258@16a4fc4). All visitor-facing strings are
declared in the frontmatter and, by the header comment, consumed verbatim from
a copy manifest (src/components/ContactForm.astro:5@16a4fc4).

## Why it is shaped this way

The no-JavaScript path is the contract, not a fallback: the component states
that deleting the script leaves the plain POST and two built routes carrying
the flow end to end (src/components/ContactForm.astro:9@16a4fc4), which is why
the same success and failure notes exist both as inline strings here
(src/components/ContactForm.astro:26@16a4fc4) and as separate pages. The decoy
field is positioned off-screen rather than hidden from the accessibility tree
(src/components/ContactForm.astro:185@16a4fc4), a choice the file explains at
src/components/ContactForm.astro:183@16a4fc4: assistive technology still reaches
the labelled field while no sighted visitor sees it.

## Hits

- src/pages/contact.astro — loses the entire form body; the page holds nothing
  else of the contact flow (edge: src/pages/contact.astro:3@16a4fc4)

## Does not hit

- functions/api/contact.js — looks related because this form's action targets
  that route and the two files agree field for field on names and bounds; no
  edge exists from src/components/ContactForm.astro to it. The agreement is by
  convention across a network boundary, and nothing in the territory enforces
  it.
- src/pages/contact/sent.astro — looks related because the enhanced path shows
  the same success note that route renders
  (src/components/ContactForm.astro:26@16a4fc4); no edge exists from
  src/components/ContactForm.astro to it.
