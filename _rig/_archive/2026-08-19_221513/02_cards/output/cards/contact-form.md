---
noun: Contact Form
path: src/components/ContactForm.astro
status: live
liveness: edge
---

## What it is

The contact form itself: a prompt line, four labelled fields — name, email,
optional company, and message, each with native validation bounds — a submit
button, and a hidden honeypot field
(src/components/ContactForm.astro:89@86aa09a). The form element is a plain
POST whose action is the site's own API route
(src/components/ContactForm.astro:35@86aa09a), and the component carries its
own scoped style block (src/components/ContactForm.astro:108@86aa09a). An
inline script at the bottom intercepts the submit, re-sends the same fields as
JSON, and writes the outcome into a polite live region rather than navigating
(src/components/ContactForm.astro:232@86aa09a). It renders on exactly one
page, the contact route (src/pages/contact.astro:3@86aa09a).

## Why it is shaped this way

The action and every field constraint are expressed in HTML rather than in
JavaScript because a comment states the script is enhancement only — remove
it and the plain POST plus the two built result routes still carry the whole
flow (src/components/ContactForm.astro:9@86aa09a). The honeypot is hidden from
sight but left labelled and reachable for screen readers, and a filled value
is answered as a success with nothing sent
(src/components/ContactForm.astro:86@86aa09a). Every visitor-facing string is
recorded as consumed verbatim from a copy manifest
(src/components/ContactForm.astro:5@86aa09a).

## Hits

- src/pages/contact.astro — the only page that imports and renders this
  component; the body of the contact route is this form
  (edge: src/pages/contact.astro:3@86aa09a)

## Does not hit

- functions/api/contact.js — looks related because the form's action targets
  that function's route and the two agree field for field on names and length
  bounds; no edge exists from src/components/ContactForm.astro to it — the
  action is a URL string (src/components/ContactForm.astro:35@86aa09a), not a
  reference the scan resolves.
- src/pages/contact/sent.astro — looks related because that route is where a
  visitor with JavaScript off lands after a successful send; no edge exists
  from src/components/ContactForm.astro to it — the redirect is issued by the
  serverless function, not by this component.
