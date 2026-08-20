Changing `Base.astro` ripples to every page that wraps in it — all eleven listed pages/routes (home, about, contact + its error/sent subpages, how-it-works, privacy, work index and its dynamic slug pages, writing index and its dynamic slug pages) — since it's where the nav, footer, title, meta description, and stylesheet all resolve. It explicitly does *not* affect `rss.xml.js` (no document shell) or mount `ContactForm.astro` directly (that's page-level). The card can't tell you why the chrome is inlined here rather than composed per page — that's not recoverable from source.

Card read: `cards/base-layout.md`
model: claude-sonnet-5
