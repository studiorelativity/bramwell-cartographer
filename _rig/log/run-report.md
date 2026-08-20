## run 2026-08-19_171909 — 2026-08-19T22:19:09Z — mode live — skeleton v6.0
WARN — supply drift: _config/territory.md differs from seal
01_inventory   RUN   — no-receipt
01_inventory   GATE   — skipped: first stage declares no requirements
01_inventory   PASS   (fittings: 3)
02_cards   RUN   — no-receipt
02_cards   PASS   (fittings: 3)
03_verify   RUN   — no-receipt
03_verify   FAIL   — fitting 01_cite_check: check_cmd failed: jq -e '[.citations[] | select(.resolved | not)] | if length == 0 then true else (.[] | "UNRESOLVED CITATION -- card \(.card): \(.citation): \(.reason)"), false end' output/raw/citation-report.json
run 2026-08-19_171909   FAIL — stopped at the defect; artifacts preserved
## run 2026-08-19_174535 — 2026-08-19T22:45:36Z — mode live — skeleton v6.0
01_inventory   SATISFIED   — receipt 2026-08-19_171909, closure 5498ed, no upstream
02_cards   SATISFIED   — receipt 2026-08-19_171909, closure 17e576, chain ok
03_verify   DISPLACED   — no-receipt; archived to _archive/2026-08-19_174535/03_verify
03_verify   PASS   (fittings: 3)
run 2026-08-19_174535   COMPLETE — all stages pass
## run 2026-08-19_175838 — 2026-08-19T22:58:38Z — mode live — skeleton v6.0
01_inventory   SATISFIED   — receipt 2026-08-19_171909, closure 5498ed, no upstream
02_cards   SATISFIED   — receipt 2026-08-19_171909, closure 17e576, chain ok
03_verify   SATISFIED   — receipt 2026-08-19_174535, closure 8ff430, chain ok
run 2026-08-19_175838   COMPLETE — all stages pass
## run 2026-08-19_180021 — 2026-08-19T23:00:21Z — mode live — skeleton v6.0
01_inventory   SATISFIED   — receipt 2026-08-19_171909, closure 5498ed, no upstream
02_cards   SATISFIED   — receipt 2026-08-19_171909, closure 17e576, chain ok
03_verify   SATISFIED   — receipt 2026-08-19_174535, closure 8ff430, chain ok
run 2026-08-19_180021   COMPLETE — all stages pass
## run 2026-08-19_180514 — 2026-08-19T23:05:14Z — mode live — skeleton v6.0
01_inventory   DISPLACED   — no-receipt; archived to _archive/2026-08-19_180514/01_inventory
01_inventory   GATE   — skipped: first stage declares no requirements
01_inventory   PASS   (fittings: 3)
02_cards   DISPLACED   — no-receipt; archived to _archive/2026-08-19_180514/02_cards
02_cards   PASS   (fittings: 3)
03_verify   DISPLACED   — no-receipt; archived to _archive/2026-08-19_180514/03_verify
03_verify   PASS   (fittings: 3)
run 2026-08-19_180514   COMPLETE — all stages pass
## run 2026-08-19_211434 — 2026-08-20T02:14:34Z — mode live — skeleton v6.0
01_inventory   DISPLACED   — closure:01_inventory/fittings/02_adjudicate.md; archived to _archive/2026-08-19_211434/01_inventory
01_inventory   GATE   — skipped: first stage declares no requirements
01_inventory   PASS   (fittings: 3)
02_cards   DISPLACED   — closure:02_cards/CONTEXT.md; archived to _archive/2026-08-19_211434/02_cards
02_cards   PASS   (fittings: 3)
03_verify   DISPLACED   — closure:_config/card-template.md; archived to _archive/2026-08-19_211434/03_verify
03_verify   PASS   (fittings: 3)
run 2026-08-19_211434   COMPLETE — all stages pass
## run 2026-08-19_221513 — 2026-08-20T03:15:13Z — mode live — skeleton v6.0
01_inventory   DISPLACED   — closure:_config/territory.md; archived to _archive/2026-08-19_221513/01_inventory
01_inventory   GATE   — skipped: first stage declares no requirements
01_inventory   PASS   (fittings: 3)
02_cards   DISPLACED   — closure:_config/territory.md; archived to _archive/2026-08-19_221513/02_cards
02_cards   PASS   (fittings: 3)
03_verify   DISPLACED   — closure:_config/territory.md; archived to _archive/2026-08-19_221513/03_verify
03_verify   FAIL   — fitting 03_verify: All 150 citations resolve, every Hits line matches an edge in edges.json and every Does-not-hit absence holds, and no card is over the quote cap in letter or spirit, but content-config.md attaches src/content.config.ts:19@16a4fc4 to the claim that the work collection declares a shipped/in-progress status and an explicit order when line 19 is the optional slug field (status is line 20, order line 21, and the schema block the card's writing and people citations point at opens at line 17), and secondarily rig-demo.md attaches src/components/RigDemo.astro:2@16a4fc4 to the no-imports/no-network-calls claim that the file actually states at lines 3-4.
run 2026-08-19_221513   FAIL — stopped at the defect; artifacts preserved
## run 2026-08-19_223934 — 2026-08-20T03:39:34Z — mode live — skeleton v6.0
01_inventory   SATISFIED   — receipt 2026-08-19_221513, closure 0575eb, no upstream
02_cards   DISPLACED   — closure:02_cards/fittings/01_write.md; archived to _archive/2026-08-19_223934/02_cards
02_cards   PASS   (fittings: 3)
03_verify   DISPLACED   — closure:_config/territory.md; archived to _archive/2026-08-19_223934/03_verify
03_verify   PASS   (fittings: 3)
run 2026-08-19_223934   COMPLETE — all stages pass
