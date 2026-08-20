---
noun: Contact function
path: functions/api/contact.js
status: live
liveness: contract
---

## What it is

The only server-side code in the territory: the handler behind the contact
form, accepting POST and nothing else
(functions/api/contact.js:2@16a4fc4). It is live under the `pages-functions`
contract: that contract covers everything under `functions/`, which Cloudflare
Pages invokes by file-based routing, and this file's path is what mounts it at
`/api/contact`. It parses either a JSON or a form-encoded body, checks the
submission against a field table (functions/api/contact.js:109@16a4fc4), and on
a clean submission hands the message to MailChannels
(functions/api/contact.js:161@16a4fc4). A JSON caller gets a JSON answer and a
plain form caller gets a 303 to one of two built routes
(functions/api/contact.js:11@16a4fc4 and
functions/api/contact.js:12@16a4fc4).

## Why it is shaped this way

The destination address exists only as an environment binding read at request
time (functions/api/contact.js:148@16a4fc4), and the comment above it records
that it is never written into the file in any form, including as a fallback
(functions/api/contact.js:146@16a4fc4). A filled honeypot is answered as a
success with no mail sent, so a bot learns nothing from the response
(functions/api/contact.js:190@16a4fc4). The redirect status is 303 specifically
so the browser re-issues the follow-up as a GET after the POST
(functions/api/contact.js:30@16a4fc4).

## Hits

- The deployed /api/contact route — the platform mounts this file at that path and invokes its POST handler, so the endpoint's behaviour is whatever this file does (contract: pages-functions; functions/api/contact.js:174@16a4fc4)

## Does not hit

- src/components/ContactForm.astro — looks related because that component posts to exactly this path and restates this file's field bounds as HTML constraints (functions/api/contact.js:19@16a4fc4); the two are coupled by a URL string rather than an import, and no edge exists from functions/api/contact.js to it.
- src/pages/contact/error.astro — looks related because this handler redirects a no-JS caller to that route on every failure path (functions/api/contact.js:12@16a4fc4); the route is reached by a Location header at runtime, and no edge exists from functions/api/contact.js to it.
