#!/usr/bin/env bash
# bin/scan.sh — jidoka-cartographer (project tier) — territory walker
#
# Usage:  bin/scan.sh <territory_path> <out_dir>
#
# Writes <out_dir>/files.json  — every file in the territory, relative path
#                                plus line count.
#        <out_dir>/edges.json  — one edge per import/link statement parsed
#                                from .astro/.js/.ts/.mjs/.css sources.
#
# Deterministic, zero AI. Prints nothing on success; names the failure on
# stderr and exits non-zero otherwise. Read-only with respect to the
# territory: nothing here ever writes under <territory_path>.
#
# Unresolvable targets are STILL emitted as edges, with "resolved": false
# and "to" carrying the raw specifier — they are ghost evidence, not errors.
# Bare package specifiers (no leading . / ~ @) are not emitted: they resolve
# into node_modules, which is a scan exclusion, so they are neither edges in
# this territory nor ghosts. The one exception is "astro:content" — see
# pass D below: it is a virtual module, but importing it is Astro's contract
# for consuming the content collection config, so the edge is real.
#
# bash 3.2 clean: no mapfile (D2), no associative arrays, no array expansion
# under set -u (D4), no `realpath -m` (D5) — cd + pwd -P only.
# noglob is set globally: the territory contains bracketed Astro route
# filenames (src/pages/work/[...slug].astro) that must never be expanded.

set -euo pipefail
set -f

PROG="scan.sh"
TAB="$(printf '\t')"

die() { printf '%s: %s\n' "$PROG" "$1" >&2; exit 1; }

[ $# -eq 2 ] || die "usage: scan.sh <territory_path> <out_dir>"

[ -d "$1" ] || die "territory is not a directory: $1"
TERR="$(cd "$1" && pwd -P)"
mkdir -p "$2" 2>/dev/null || die "cannot create out_dir: $2"
OUT="$(cd "$2" && pwd -P)"
RIG="$(cd "$(dirname "$0")/.." && pwd -P)"

# ---------- the pin: never scan an unpinned target ----------

field() {
  # $1 = file, $2 = literal label. Echoes the first backticked value.
  [ -f "$1" ] || return 0
  sed -n 's/.*\*\*'"$2"':\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$1" | sed -n '1p'
}

[ -f "$RIG/_config/territory.md" ] || die "supply missing: _config/territory.md"
[ -f "$RIG/run-input.md" ] || die "supply missing: run-input.md"

CFG_COMMIT="$(field "$RIG/_config/territory.md" 'Pinned commit')"
RUN_COMMIT="$(field "$RIG/run-input.md" 'territory_commit')"

[ -n "$CFG_COMMIT" ] || die "_config/territory.md declares no pinned commit"
[ -n "$RUN_COMMIT" ] || die "run-input.md declares no territory_commit"
case "$CFG_COMMIT" in
  *[!0-9a-f]*|"") die "pinned commit is not a hash: '$CFG_COMMIT' — the territory is unpinned; a map of an unpinned target cannot be verified" ;;
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

# ---------- helpers ----------

# Astro's content collection config, by convention. Importing "astro:content"
# is the contract for consuming it; there is no file-path specifier to parse.
CONTENT_CONFIG="src/content.config.ts"

excluded() {
  case "$1" in
    node_modules|node_modules/*|*/node_modules/*) return 0 ;;
    dist|dist/*|*/dist/*)                        return 0 ;;
    .git|.git/*|*/.git/*)                        return 0 ;;
    .astro|.astro/*|*/.astro/*)                  return 0 ;;
  esac
  return 1
}

norm_path() {
  # Lexical normalization of . and .. — no filesystem access, so it works
  # for targets that do not exist (which is the whole point: ghosts).
  local p="$1" out="" seg IFS
  IFS=/
  set -- $p
  IFS=' '
  for seg in ${1+"$@"}; do
    case "$seg" in
      ''|'.') ;;
      '..') case "$out" in *"/"*) out="${out%/*}" ;; *) out="" ;; esac ;;
      *) if [ -n "$out" ]; then out="$out/$seg"; else out="$seg"; fi ;;
    esac
  done
  printf '%s' "$out"
}

candidates() {
  # Extension and index probing, in Astro/Vite resolution order.
  local b="$1"
  printf '%s\n' "$b" "$b.astro" "$b.ts" "$b.js" "$b.mjs" "$b.jsx" "$b.tsx" \
    "$b.css" "$b.json" "$b.md" "$b.mdx" "$b.svg" \
    "$b/index.astro" "$b/index.ts" "$b/index.js" "$b/index.mjs" "$b/index.css"
}

resolve_spec() {
  # $1 = referring file (territory-relative), $2 = raw specifier.
  # Echoes "<to><TAB><resolved>". Never touches the territory for writes.
  local from="$1" spec="$2" dir base cand rest route
  case "$spec" in
    '~/'*|'@/'*) base="$(norm_path "src/${spec#??}")" ;;
    /*)          # A site-root reference: a static asset under public/, or an
                 # Astro ROUTE, which resolves to the page file that serves it
                 # (/contact/ -> src/pages/contact.astro). Without route
                 # resolution every internal link would read as a ghost, and
                 # ghost status must be evidence, not a parser artefact.
                 rest="${spec#/}"
                 base="$(norm_path "public/$rest")"
                 if [ -n "$rest" ] && [ -f "$TERR/$base" ] && ! excluded "$base"; then
                   printf '%s%s%s' "$base" "$TAB" "true"
                   return 0
                 fi
                 route="${rest%/}"
                 if [ -z "$route" ]; then route="index"; fi
                 for cand in $(candidates "$(norm_path "src/pages/$route")") \
                             $(candidates "$(norm_path "src/pages/$route/index")") \
                             $(candidates "$(norm_path "$route")"); do
                   if excluded "$cand"; then continue; fi
                   if [ -f "$TERR/$cand" ]; then
                     printf '%s%s%s' "$cand" "$TAB" "true"
                     return 0
                   fi
                 done
                 printf '%s%s%s' "$spec" "$TAB" "false"
                 return 0 ;;
    *)           dir="${from%/*}"
                 if [ "$dir" = "$from" ]; then dir=""; fi
                 base="$(norm_path "${dir:+$dir/}$spec")" ;;
  esac
  for cand in $(candidates "$base"); do
    if excluded "$cand"; then continue; fi
    if [ -f "$TERR/$cand" ]; then
      printf '%s%s%s' "$cand" "$TAB" "true"
      return 0
    fi
  done
  printf '%s%s%s' "$spec" "$TAB" "false"
}

path_like() {
  case "$1" in
    ./*|../*|/*|'~/'*|'@/'*) return 0 ;;
  esac
  return 1
}

TMP="$(mktemp -d "${TMPDIR:-/tmp}/scan.XXXXXX")" || die "cannot create temp dir"
trap 'rm -rf "$TMP"' EXIT INT TERM

# ---------- pass 1: the file list ----------

( cd "$TERR" && find . \
    \( -name node_modules -o -name dist -o -name .git -o -name .astro \) -prune \
    -o -type f -print ) \
  | sed 's|^\./||' | LC_ALL=C sort > "$TMP/files.txt"

[ -s "$TMP/files.txt" ] || die "territory contains no files after exclusions: $TERR"

: > "$TMP/files.tsv"
while IFS= read -r f; do
  [ -n "$f" ] || continue
  n="$(awk 'END { print NR + 0 }' "$TERR/$f")"
  printf '%s%s%s\n' "$f" "$TAB" "$n" >> "$TMP/files.tsv"
done < "$TMP/files.txt"

jq -R -s --tab 'split("\n") | map(select(length > 0) | split("\t"))
   | map({path: .[0], lines: (.[1] | tonumber)})' \
  < "$TMP/files.tsv" > "$OUT/files.json" || die "failed to write $OUT/files.json"

# ---------- pass 2: the edge list ----------

: > "$TMP/edges.raw"
while IFS= read -r f; do
  case "$f" in
    *.astro|*.js|*.ts|*.mjs|*.css) ;;
    *) continue ;;
  esac
  # A — module specifiers: import X from "y", import "y", require("y"),
  #     @import "y" (the css at-rule matches the same shape).
  grep -n -o -E "(from|import|require\()[[:space:]]*[\"'][^\"']+[\"']" "$TERR/$f" 2>/dev/null \
    | sed "s|^\([0-9][0-9]*\):.*[\"']\([^\"']*\)[\"']\$|\1${TAB}\2|" >> "$TMP/edges.raw" || true
  # B — markup references.
  grep -n -o -E "(href|src|poster)=[\"'][^\"']+[\"']" "$TERR/$f" 2>/dev/null \
    | sed "s|^\([0-9][0-9]*\):.*[\"']\([^\"']*\)[\"']\$|\1${TAB}\2|" >> "$TMP/edges.raw" || true
  # C — css url() references, quoted or bare.
  grep -n -o -E "url\([^)]*\)" "$TERR/$f" 2>/dev/null \
    | sed "s|^\([0-9][0-9]*\):url([[:space:]]*[\"']\{0,1\}\([^\"')]*\)[\"']\{0,1\}[[:space:]]*)\$|\1${TAB}\2|" \
    >> "$TMP/edges.raw" || true
  # Stamp the referring file onto every hit found in it.
  if [ -s "$TMP/edges.raw" ]; then
    while IFS= read -r hit; do
      [ -n "$hit" ] || continue
      ln="${hit%%$TAB*}"
      spec="${hit#*$TAB}"
      case "$ln" in *[!0-9]*|"") continue ;; esac
      path_like "$spec" || continue
      to_res="$(resolve_spec "$f" "$spec")"
      printf '%s%s%s%s%s%s%s\n' "$f" "$TAB" "$ln" "$TAB" "$to_res" "$TAB" "$spec" >> "$TMP/edges.tsv"
    done < "$TMP/edges.raw"
    : > "$TMP/edges.raw"
  fi
  # D - content collections. Passes A-C emit nothing for "astro:content":
  # the specifier is bare, and it resolves inside Astro rather than into
  # this tree. But importing it is exactly how a file consumes
  # src/content.config.ts, and getCollection() is where that consumption
  # happens - so the config is load-bearing while looking zero-inbound, and
  # an adjudicator reading only edges.json would call it leftover. The edge
  # is attributed to the first getCollection() call, or to the import line
  # when a file imports the module without calling it.
  # The config file's own import of "astro:content" is skipped: a self-edge
  # is not evidence that anything consumes it.
  if [ "$f" != "$CONTENT_CONFIG" ]; then
    imp_ln="$(grep -n -E "(from|import)[[:space:]]+[\"']astro:content[\"']" "$TERR/$f" 2>/dev/null \
      | sed -n '1s/^\([0-9][0-9]*\):.*/\1/p' || true)"
    if [ -n "$imp_ln" ]; then
      call_ln="$(grep -n -E "getCollection[[:space:]]*\(" "$TERR/$f" 2>/dev/null \
        | sed -n '1s/^\([0-9][0-9]*\):.*/\1/p' || true)"
      if [ -n "$call_ln" ]; then use_ln="$call_ln"; else use_ln="$imp_ln"; fi
      if [ -f "$TERR/$CONTENT_CONFIG" ]; then cres="true"; else cres="false"; fi
      printf '%s%s%s%s%s%s%s%s%s\n' "$f" "$TAB" "$use_ln" "$TAB" \
        "$CONTENT_CONFIG" "$TAB" "$cres" "$TAB" "astro:content" >> "$TMP/edges.tsv"
    fi
  fi
done < "$TMP/files.txt"

[ -f "$TMP/edges.tsv" ] || : > "$TMP/edges.tsv"
LC_ALL=C sort -u -t"$TAB" -k1,1 -k2,2n -k3,3 -k5,5 "$TMP/edges.tsv" > "$TMP/edges.sorted"

jq -R -s --tab 'split("\n") | map(select(length > 0) | split("\t"))
   | map({from: .[0], to: .[2], line: (.[1] | tonumber),
          spec: .[4], resolved: (.[3] == "true")})' \
  < "$TMP/edges.sorted" > "$OUT/edges.json" || die "failed to write $OUT/edges.json"

exit 0
