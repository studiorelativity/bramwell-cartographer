To add a new work entry, drop a file into `src/content/work` (src/content.config.ts:16@16a4fc4) — it must satisfy the `work` schema defined at src/content.config.ts:15@16a4fc4, which includes a publication state constrained to two values (src/content.config.ts:20@16a4fc4) and an explicit ordering number (src/content.config.ts:21@16a4fc4). The card doesn't show the exact schema field list (e.g., title, description, other required fields) since it only cites select line numbers rather than the full schema block.

Card read: `cards/content-config.md`
model: claude-sonnet-5
