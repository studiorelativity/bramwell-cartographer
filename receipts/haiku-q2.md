To add a new entry to the work portfolio, you touch `src/content/work/` (add a new `.md` file) and an entry's frontmatter must satisfy the `work` schema defined in `src/content.config.ts:15–27`, which requires a `title`, `status` ("published" or "draft"), and an `order` number. The catalog points to the content-config card, which defines the work collection's location and constraints.

Read: **content-config.md**
model: claude-haiku-4-5
