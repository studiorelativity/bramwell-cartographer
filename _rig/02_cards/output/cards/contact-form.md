---
noun: ContactForm
path: src/components/ContactForm.astro
status: live
liveness: edge
---

## What it is

The contact form's markup and its progressive enhancement, mounted by the
contact page. At its base it is a plain POST to `/api/contact`
(src/components/ContactForm.astro:35@16a4fc4) over four visible fields, whose
server-side bounds are restated as HTML constraints — 200 characters on the
name (src/components/ContactForm.astro:44@16a4fc4), 254 on the email
(src/components/ContactForm.astro:57@16a4fc4), and a message between 10
(src/components/ContactForm.astro:81@16a4fc4) and 5000
(src/components/ContactForm.astro:82@16a4fc4). A fifth field is a honeypot
(src/components/ContactForm.astro:89@16a4fc4), labelled and reachable but held
off-screen by the component's own styles
(src/components/ContactForm.astro:185@16a4fc4). The inline script
(src/components/ContactForm.astro:205@16a4fc4) intercepts the submit and
re-sends it as JSON (src/components/ContactForm.astro:232@16a4fc4), writing the
result into a polite live region
(src/components/ContactForm.astro:104@16a4fc4) as text rather than markup
(src/components/ContactForm.astro:258@16a4fc4).

## Why it is shaped this way

The header comment states the constraint the whole file is built to: the form
works with JavaScript disabled as a plain POST that redirects to two built
routes, and the script at the bottom can be deleted without breaking it
(src/components/ContactForm.astro:9@16a4fc4). The honeypot is positioned
off-screen rather than hidden outright so assistive technology still reaches the
labelled field while no sighted visitor sees it
(src/components/ContactForm.astro:183@16a4fc4). The in-flight state is a
disabled button with no wording, because the copy manifest carries no string for
the wait (src/components/ContactForm.astro:228@16a4fc4).

## Hits

- src/pages/contact.astro — the sole importer; the contact page delegates its entire form to this component (edge: src/pages/contact.astro:3@16a4fc4)

## Does not hit

- functions/api/contact.js — looks related because this form posts to exactly the path that function answers (src/components/ContactForm.astro:35@16a4fc4) and the two share their field bounds; the coupling is a URL string rather than an import, and no edge exists from src/components/ContactForm.astro to it.
- src/pages/contact/sent.astro — looks related because it is where the no-JS path lands after a successful send (src/components/ContactForm.astro:9@16a4fc4); that route is reached by a redirect issued server-side, and no edge exists from src/components/ContactForm.astro to it.
