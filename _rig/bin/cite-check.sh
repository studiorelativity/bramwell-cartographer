#!/usr/bin/env bash
# bin/cite-check.sh — jidoka-cartographer (project tier) — citation resolver
#
# Usage:  bin/cite-check.sh <cards_dir> <territory_path> <out_file>
#
# Extracts every `path:line@commit` citation from every card in <cards_dir>,
# and mechanically decides three things per citation: the commit matches the
# run's pinned commit, the path exists in the territory, the line exists in
# that file. Also counts quoted source lines per card against
# quote_cap_lines from run-input.md.
#
# MECHANICAL ONLY. This script never judges whether a cited line SUPPORTS
# the claim it is attached to — that judgment is the 03_verify rubric's, and
# putting it here would be the orchestrator thinking.
#
# Quoted lines are counted the way a machine can count them: every line
# inside a fenced code block, plus every blockquote line. Inline backtick
# spans are not machine-countable as "lines" and are left to the verifier's
# judgment — the cap is enforced twice on purpose.
#
# Writes JSON to <out_file>:
#   { expected_commit, quote_cap_lines, cards_dir, territory,
#     citations: [{card, citation, resolved, reason}],
#     cards:     [{card, quoted_lines, over_cap}],
#     totals:    {citations, unresolved, cards, cards_over_cap} }
#
# Prints nothing on success; names the failure on stderr otherwise.
# bash 3.2 clean (D2/D4/D5). noglob is set: card and territory paths may
# contain bracketed Astro route filenames.

set -euo pipefail
set -f

PROG="cite-check.sh"
TAB="$(printf '\t')"

die() { printf '%s: %s\n' "$PROG" "$1" >&2; exit 1; }

[ $# -eq 3 ] || die "usage: cite-check.sh <cards_dir> <territory_path> <out_file>"

[ -d "$1" ] || die "cards_dir is not a directory: $1"
CARDS="$(cd "$1" && pwd -P)"
[ -d "$2" ] || die "territory is not a directory: $2"
TERR="$(cd "$2" && pwd -P)"
OUT_FILE="$3"
OUT_DIR="$(dirname "$OUT_FILE")"
mkdir -p "$OUT_DIR" 2>/dev/null || die "cannot create output directory: $OUT_DIR"
RIG="$(cd "$(dirname "$0")/.." && pwd -P)"

# ---------- the pin and the cap, from the run's own trigger ----------

field() {
  [ -f "$1" ] || return 0
  sed -n 's/.*\*\*'"$2"':\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$1" | sed -n '1p'
}

[ -f "$RIG/_config/territory.md" ] || die "supply missing: _config/territory.md"
[ -f "$RIG/run-input.md" ] || die "supply missing: run-input.md"

CFG_COMMIT="$(field "$RIG/_config/territory.md" 'Pinned commit')"
RUN_COMMIT="$(field "$RIG/run-input.md" 'territory_commit')"
CAP="$(field "$RIG/run-input.md" 'quote_cap_lines')"

[ -n "$CFG_COMMIT" ] || die "_config/territory.md declares no pinned commit"
[ -n "$RUN_COMMIT" ] || die "run-input.md declares no territory_commit"
case "$CFG_COMMIT" in
  *[!0-9a-f]*|"") die "pinned commit is not a hash: '$CFG_COMMIT' — citations cannot be checked against an unpinned target" ;;
esac
case "$RUN_COMMIT" in
  *[!0-9a-f]*|"") die "run-input territory_commit is not a hash: '$RUN_COMMIT'" ;;
esac
[ "${#CFG_COMMIT}" -ge 7 ] || die "pinned commit too short to be a hash: '$CFG_COMMIT'"
[ "${#RUN_COMMIT}" -ge 7 ] || die "run-input territory_commit too short: '$RUN_COMMIT'"
case "$CFG_COMMIT" in
  "$RUN_COMMIT"*) : ;;
  *) case "$RUN_COMMIT" in
       "$CFG_COMMIT"*) : ;;
       *) die "commit disagreement: _config/territory.md '$CFG_COMMIT' vs run-input.md '$RUN_COMMIT'" ;;
     esac ;;
esac

# The citation form is `path:line@commit` where commit is the first 7
# characters of the pinned hash (_config/territory.md).
EXPECT="$(printf '%s' "$CFG_COMMIT" | cut -c1-7)"

case "${CAP:-}" in
  ''|*[!0-9]*) die "run-input.md declares no numeric quote_cap_lines" ;;
esac
[ "$CAP" -ge 1 ] || die "quote_cap_lines must be at least 1, got '$CAP'"

excluded() {
  case "$1" in
    node_modules|node_modules/*|*/node_modules/*) return 0 ;;
    dist|dist/*|*/dist/*)                        return 0 ;;
    .git|.git/*|*/.git/*)                        return 0 ;;
    .astro|.astro/*|*/.astro/*)                  return 0 ;;
  esac
  return 1
}

TMP="$(mktemp -d "${TMPDIR:-/tmp}/citecheck.XXXXXX")" || die "cannot create temp dir"
trap 'rm -rf "$TMP"' EXIT INT TERM

( cd "$CARDS" && find . -type f -name '*.md' -print ) \
  | sed 's|^\./||' | LC_ALL=C sort > "$TMP/cards.txt"

[ -s "$TMP/cards.txt" ] || die "no cards found under: $CARDS"

: > "$TMP/citations.tsv"
: > "$TMP/cards.tsv"

while IFS= read -r card; do
  [ -n "$card" ] || continue
  f="$CARDS/$card"

  # --- citations ---
  # Path characters include [ ] and . — Astro's dynamic route filenames
  # (src/pages/work/[...slug].astro) are ordinary paths in this territory.
  # In both bracket expressions ']' comes first and '-' last, which is how
  # POSIX ERE takes them literally; '[' is ordinary inside either one.
  grep -o -E '[A-Za-z0-9._[][]A-Za-z0-9._/[-]*:[0-9]+@[0-9a-fA-F]+' "$f" 2>/dev/null \
    | LC_ALL=C sort -u > "$TMP/cites.txt" || : > "$TMP/cites.txt"

  while IFS= read -r cite; do
    [ -n "$cite" ] || continue
    cpath="${cite%%:*}"
    rest="${cite#*:}"
    cline="${rest%%@*}"
    ccommit="${rest#*@}"
    reason=""
    if [ "$ccommit" != "$EXPECT" ]; then
      reason="commit '$ccommit' is not the pinned commit '$EXPECT'"
    elif excluded "$cpath"; then
      reason="path '$cpath' is under a scan exclusion and is not part of the mapped territory"
    elif [ ! -f "$TERR/$cpath" ]; then
      reason="path '$cpath' does not exist in the territory"
    else
      total="$(awk 'END { print NR + 0 }' "$TERR/$cpath")"
      if [ "$cline" -lt 1 ]; then
        reason="line $cline is not a line number"
      elif [ "$cline" -gt "$total" ]; then
        reason="line $cline is beyond the end of '$cpath' ($total lines)"
      fi
    fi
    if [ -n "$reason" ]; then
      printf '%s%s%s%s%s%s%s\n' "$card" "$TAB" "$cite" "$TAB" "false" "$TAB" "$reason" >> "$TMP/citations.tsv"
    else
      printf '%s%s%s%s%s%s%s\n' "$card" "$TAB" "$cite" "$TAB" "true" "$TAB" "resolved" >> "$TMP/citations.tsv"
    fi
  done < "$TMP/cites.txt"

  # --- quoted lines: fenced block bodies plus blockquote lines ---
  q="$(awk '
    /^[[:space:]]*```/ { fence = !fence; next }
    fence             { n++; next }
    /^[[:space:]]*>/  { n++ }
    END               { print n + 0 }
  ' "$f")"
  if [ "$q" -gt "$CAP" ]; then over="true"; else over="false"; fi
  printf '%s%s%s%s%s\n' "$card" "$TAB" "$q" "$TAB" "$over" >> "$TMP/cards.tsv"
done < "$TMP/cards.txt"

jq -n --tab \
  --arg expect "$EXPECT" \
  --argjson cap "$CAP" \
  --arg cards_dir "$CARDS" \
  --arg territory "$TERR" \
  --rawfile citations "$TMP/citations.tsv" \
  --rawfile cardrows "$TMP/cards.tsv" '
  def rows($t): $t | split("\n") | map(select(length > 0) | split("\t"));
  (rows($citations) | map({card: .[0], citation: .[1], resolved: (.[2] == "true"), reason: .[3]})) as $cites
  | (rows($cardrows) | map({card: .[0], quoted_lines: (.[1] | tonumber), over_cap: (.[2] == "true")})) as $cards
  | {
      expected_commit: $expect,
      quote_cap_lines: $cap,
      cards_dir: $cards_dir,
      territory: $territory,
      citations: $cites,
      cards: $cards,
      totals: {
        citations: ($cites | length),
        unresolved: ($cites | map(select(.resolved | not)) | length),
        cards: ($cards | length),
        cards_over_cap: ($cards | map(select(.over_cap)) | length)
      }
    }' > "$OUT_FILE" || die "failed to write $OUT_FILE"

exit 0
