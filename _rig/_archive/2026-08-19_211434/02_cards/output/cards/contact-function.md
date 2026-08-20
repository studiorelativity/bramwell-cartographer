---
noun: Contact serverless function
path: functions/api/contact.js
status: leftover
---

## What it is

The server side of the contact form: a Cloudflare Pages Function answering POST
on its own path and nothing else (functions/api/contact.js:2@dcba75e,
functions/api/contact.js:174@dcba75e, functions/api/contact.js:211@dcba75e). It
accepts either a JSON body or a urlencoded one, validates the trimmed fields
against a table of minimum and maximum lengths declared at the top of the file,
and treats a filled honeypot field as a success that sends nothing
(functions/api/contact.js:43@dcba75e, functions/api/contact.js:14@dcba75e,
functions/api/contact.js:109@dcba75e, functions/api/contact.js:190@dcba75e). On
success it composes a labelled plain-text mail and posts it to MailChannels,
taking the destination address only from an environment binding
(functions/api/contact.js:6@dcba75e, functions/api/contact.js:135@dcba75e,
functions/api/contact.js:145@dcba75e, functions/api/contact.js:148@dcba75e).
Every outcome answers twice over: a JSON status for the enhanced path, a 303
redirect to a built route for the plain one
(functions/api/contact.js:23@dcba75e, functions/api/contact.js:31@dcba75e,
functions/api/contact.js:202@dcba75e). Nothing in the scanned import or link
graph resolves to this file, so its status is leftover.

## Why it is shaped this way

The file names its contract and its prohibitions in its opening lines — no
storage, no cookies, no CORS headers, no retries, and one outbound call
(functions/api/contact.js:3@dcba75e). Two response shapes exist for one flow
because the form must work with JavaScript off, so the same handler both
answers a fetch and redirects a browser
(functions/api/contact.js:11@dcba75e). Error reasons stay machine codes rather
than prose because the visitor-facing wording is owned elsewhere
(functions/api/contact.js:105@dcba75e).

## Hits

No hit. No edge in the edge list resolves to this file: nothing in the
territory imports or links it, which is what its leftover status records.

## Does not hit

- src/components/ContactForm.astro — looks related because it is the form this
  function answers, and both the form's action and its script's fetch name this
  path; no edge exists from this noun to it, and none from it back — the
  connection is a runtime request the static scan does not follow.
- src/pages/contact/sent.astro — looks related because this file holds that
  route as a redirect target string and sends browsers there on success; no
  edge exists from this noun to it.
