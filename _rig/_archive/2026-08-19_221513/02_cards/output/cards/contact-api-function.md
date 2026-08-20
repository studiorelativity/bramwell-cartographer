---
noun: Contact API Function
path: functions/api/contact.js
status: live
liveness: contract
---

## What it is

The server half of the contact form: it validates a submission against a
fixed field-bounds table (functions/api/contact.js:109@86aa09a) and relays a
plain-text message through a single outbound call to a mail provider
(functions/api/contact.js:145@86aa09a). Nothing in the territory imports it;
it is live under the `pages-functions` contract, which covers files under
`functions/` invoked by Cloudflare Pages file-based function routing, and this
file matches because its path is its route and the exported POST handler
(functions/api/contact.js:174@86aa09a) is the entry point the platform calls.
It answers a JSON submission with JSON and a form-encoded one with a 303
redirect to one of two built routes (functions/api/contact.js:11@86aa09a), and
answers any other method on the path with a 405
(functions/api/contact.js:211@86aa09a).

## Why it is shaped this way

The destination address exists only in an environment binding, and a comment
records that it is never written into this file in any form, not even as a
fallback (functions/api/contact.js:146@86aa09a) — which is why a missing
binding is handled as a send failure rather than defaulting anywhere. A filled
honeypot is answered as a success with nothing sent, so the response tells a
bot nothing (functions/api/contact.js:190@86aa09a), and validation failures
come back as machine codes rather than prose because the visitor-facing
wording is owned elsewhere (functions/api/contact.js:105@86aa09a).

## Hits

- the deployed /api/contact route — this file's path is its URL, so moving or
  renaming it changes the route the browser posts to and nothing in the source
  tree would report the break (contract: pages-functions)

## Does not hit

- src/components/ContactForm.astro — looks related because that component is
  the form which posts here, and the two agree field for field on names and
  length bounds; no edge exists from functions/api/contact.js to it — this
  file is reached by URL, not by import.
- src/pages/contact/error.astro — looks related because this function
  redirects a failed form-encoded submission at that route
  (functions/api/contact.js:12@86aa09a); no edge exists from
  functions/api/contact.js to it — the route is a string constant, not a
  reference the scan resolves.
