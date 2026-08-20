#!/usr/bin/env bash
# write-guard.sh — PreToolUse hook: deny any Write/Edit outside $ALLOWED_WRITE.
# Exists because Write(<path>) tool-scope arguments are inert on some CLI
# versions (see DEVIATIONS: D1). Paths normalized so relative == absolute.
p="$(jq -r '.tool_input.file_path // empty')"
norm() { realpath -m -- "$1" 2>/dev/null || echo "$1"; }
if [[ -n "$p" && "$(norm "$p")" == "$(norm "$ALLOWED_WRITE")" ]]; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"allow",permissionDecisionReason:"scoped write"}}'
else
  jq -n --arg p "$p" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:("out of scope: "+$p)}}'
fi
