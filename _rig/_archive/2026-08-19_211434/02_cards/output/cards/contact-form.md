---
noun: Contact form component
path: src/components/ContactForm.astro
status: live
---

## What it is

The contact form's markup, styles, and progressive enhancement in one
component. Its frontmatter holds the visitor-facing strings as named constants
— the prompt, four field labels, the submit label, the honeypot label, and the
two result notes (src/components/ContactForm.astro:15@dcba75e,
src/components/ContactForm.astro:26@dcba75e). The form itself is a plain POST
to the /api/contact path, with a required name field, a required email field,
an optional company field, and a message field, each carrying its own maxlength
(src/components/ContactForm.astro:35@dcba75e,
src/components/ContactForm.astro:38@dcba75e,
src/components/ContactForm.astro:51@dcba75e,
src/components/ContactForm.astro:64@dcba75e). A scoped style block positions
the honeypot field off-screen rather than hiding it, so assistive technology
still reaches the labelled input (src/components/ContactForm.astro:183@dcba75e).
The inline script intercepts submit, posts the same fields as JSON, and writes
the sent or error note into the status element as text
(src/components/ContactForm.astro:205@dcba75e,
src/components/ContactForm.astro:232@dcba75e,
src/components/ContactForm.astro:258@dcba75e).

## Why it is shaped this way

The file states the constraint that produced its shape: it must work fully with
JavaScript disabled, so the plain POST and the two built result routes carry
the whole flow and the script at the bottom is pure enhancement that can be
deleted without breaking anything
(src/components/ContactForm.astro:9@dcba75e,
src/components/ContactForm.astro:206@dcba75e). The enhanced path renders the
same two notes inline that the built routes render as pages, which is why both
strings are declared here as well as existing downstream
(src/components/ContactForm.astro:23@dcba75e).

## Hits

- src/pages/contact.astro — the contact route imports and renders this
  component, so its fields, labels, and enhancement behaviour are what that
  page shows (edge: src/pages/contact.astro:3@dcba75e)

## Does not hit

- functions/api/contact.js — looks related because the form's action and the
  script's fetch both target the /api/contact path and that function is what
  answers them; no edge exists from this noun to it, because the request is
  made at runtime by the browser and no import or link in the scanned graph
  connects the two files.
- src/pages/contact/sent.astro — looks related because it is the page a
  no-script submit lands on and this component declares the same note text; no
  edge exists from this noun to it.
