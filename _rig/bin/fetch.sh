#!/usr/bin/env bash
# fetch.sh — evidence-grade single fetch. The only fetch path for the audit's
# 01_fetch fitting: WebFetch cannot supply a raw body, a status line, or a
# redirect chain (see DEVIATIONS: D7), and an audit that cannot quote the wire
# has no evidence.
#
# Usage: bin/fetch.sh <url> <body-out-path>
# Writes the raw response body byte-for-byte to <body-out-path> and prints one
# JSON object to stdout:
#   {url, final_url, status, redirect_chain: [], redirect_count, content_type,
#    bytes, file, ok, error}
# Always exits 0 for a completed attempt, including a 4xx/5xx — the status IS
# the observation. Exits nonzero only when curl could not complete at all, and
# prints an object with "ok": false and the reason in "error".
set -uo pipefail

url="${1:-}"; out="${2:-}"
[ -n "$url" ] && [ -n "$out" ] || {
  printf '{"ok":false,"error":"usage: fetch.sh <url> <body-out-path>"}\n' >&2; exit 2; }
command -v curl >/dev/null || {
  printf '{"ok":false,"error":"curl is required"}\n' >&2; exit 2; }
command -v jq >/dev/null || {
  printf '{"ok":false,"error":"jq is required"}\n' >&2; exit 2; }

mkdir -p "$(dirname "$out")"
hdr="$(mktemp)"; meta="$(mktemp)"
trap 'rm -f "$hdr" "$meta"' EXIT

# -L follows redirects; -D dumps every header block in the chain, so the chain
# is reconstructible from what the server actually sent, not from a summary.
# --max-time bounds each attempt; a hung host must never hold a stage open.
# --retry absorbs transport flakiness: no.fail's edge resets roughly half of all
# connections regardless of user agent (observed 2026-08-13), and a reset is a
# transport failure, not an observation about the site. Retries are bounded and
# never mask a real HTTP status — curl does not retry a completed 4xx/5xx here,
# because those exit 0 and are the evidence we came for.
set +e
curl -sS -L \
  --max-time 30 --connect-timeout 10 --max-redirs 10 \
  --retry 4 --retry-delay 2 --retry-connrefused --retry-all-errors \
  --compressed \
  -A 'nofail-audit/1.0 (+https://no.fail; SEO audit fetcher)' \
  -D "$hdr" \
  -o "$out" \
  -w '{"final_url":"%{url_effective}","status":%{http_code},"redirect_count":%{num_redirects},"content_type":"%{content_type}","bytes":%{size_download},"time_total":%{time_total}}' \
  "$url" > "$meta" 2>"$hdr.err"
rc=$?
set -e

if [ "$rc" -ne 0 ]; then
  err="$(tr -d '\r' < "$hdr.err" | tr '\n' ' ' | sed 's/  */ /g')"
  rm -f "$hdr.err"
  jq -n --arg u "$url" --arg f "$out" --arg e "curl exit $rc: $err" \
    '{url:$u,final_url:null,status:null,redirect_chain:[],redirect_count:null,
      content_type:null,bytes:null,file:$f,ok:false,error:$e}'
  exit 1
fi
rm -f "$hdr.err"

# Redirect chain: every status line in the dumped headers, plus each Location.
chain="$(awk '
  /^HTTP\// { code=$2; loc=""; next }
  tolower($0) ~ /^location:[[:space:]]*/ {
    loc=$0; sub(/^[Ll]ocation:[[:space:]]*/, "", loc); gsub(/\r/, "", loc);
    printf "%s %s\n", code, loc
  }
' "$hdr" | jq -R . | jq -s .)"

jq -n --arg u "$url" --arg f "$out" --argjson m "$(cat "$meta")" --argjson c "$chain" \
  '{url:$u, final_url:$m.final_url, status:$m.status, redirect_chain:$c,
    redirect_count:$m.redirect_count, content_type:$m.content_type,
    bytes:$m.bytes, file:$f, ok:true, error:null}'
exit 0
