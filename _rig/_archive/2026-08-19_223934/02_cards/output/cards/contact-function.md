---
noun: Contact function
path: functions/api/contact.js
status: live
liveness: contract
---

## What it is

The backend of the contact flow, and the only server-side code in the
territory. It is live under the contract `pages-functions`, which covers
everything under `functions/` as invoked by Cloudflare Pages file-based
function routing: this file's path is what mounts it at the API route, so it
needs no inbound reference to run. It exports a POST handler
(functions/api/contact.js:174@16a4fc4) and a catch-all that answers every other
method with a 405 (functions/api/contact.js:211@16a4fc4). The handler accepts
two body encodings and rejects anything else with a 415
(functions/api/contact.js:43@16a4fc4, functions/api/contact.js:179@16a4fc4),
validates the four fields against bounds declared as constants at the top
(functions/api/contact.js:15@16a4fc4 through
functions/api/contact.js:20@16a4fc4, checked at
functions/api/contact.js:109@16a4fc4), answers a filled decoy field as success
while sending nothing (functions/api/contact.js:191@16a4fc4), and otherwise
posts the message to an external mail API
(functions/api/contact.js:161@16a4fc4).

## Why it is shaped this way

One flag decides the whole response style: requests that arrived as JSON get
JSON back, and form-encoded requests get a 303 redirect to a built route
instead (functions/api/contact.js:31@16a4fc4,
functions/api/contact.js:207@16a4fc4). That is what lets a single endpoint
serve both the enhanced submission and the no-JavaScript form post without
either path knowing about the other. The destination address exists only as an
environment binding and is deliberately absent from the file, including as a
fallback — the file says so at functions/api/contact.js:146@16a4fc4 and reads
the binding at functions/api/contact.js:148@16a4fc4 — and the mail provider's
response body is never echoed back to the caller
(functions/api/contact.js:171@16a4fc4).

## Hits

- the deployed contact API route — the accepted encodings, the field bounds,
  the status codes, and the two redirect targets are all defined only here
  (contract: pages-functions)

## Does not hit

- src/components/ContactForm.astro — looks related because that component posts
  to this route and repeats these exact field names and bounds; no edge exists
  from functions/api/contact.js to it. Nothing in the territory ties the two
  together — they agree by convention across a network boundary.
- src/pages/contact/sent.astro — looks related because this file redirects
  form-encoded submissions to that route by literal path
  (functions/api/contact.js:11@16a4fc4); no edge exists from
  functions/api/contact.js to it.
