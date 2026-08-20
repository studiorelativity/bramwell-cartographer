#!/bin/bash
# walk-test.sh — the comp's bar, as a script.
# A cold headless session gets ONLY the catalog and the cards. It must
# find the door, open one card, answer, and stop. Tool scope enforces
# "cannot slurp the territory" structurally: the walk room contains
# nothing else to read.
#
# Run from _rig/ after a green run:  bash bin/walk-test.sh
# Results land in output-walk/ — one transcript per question.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CARDS_SRC="$ROOT/02_cards/output"
WALK="$ROOT/output-walk"
ROOM="$WALK/room"

[ -f "$CARDS_SRC/catalog.md" ] || { echo "no catalog at $CARDS_SRC — run the pipeline first" >&2; exit 1; }

rm -rf "$WALK"
mkdir -p "$ROOM"
cp "$CARDS_SRC/catalog.md" "$ROOM/"
cp -R "$CARDS_SRC/cards" "$ROOM/cards"

WALK_MODEL="claude-haiku-4-5"   # or claude-sonnet-5 

PROMPT_RULES="You are a developer new to this codebase. You have never seen it. In this directory you have catalog.md and a cards/ folder. Read catalog.md first, then open AT MOST ONE card — the one the catalog points you to. Answer from that card only, in 3 sentences or fewer. If the card cannot answer the question, say what it cannot tell you instead of guessing. End by naming which card you read. Question:"

q() {
  n="$1"; shift
  echo "--- Q$n: $* ---"
  ( cd "$ROOM" && claude -p "$PROMPT_RULES $*" \
      --model "$WALK_MODEL" \
      --allowedTools "Read" \
      --permission-mode acceptEdits \
      --max-turns 6 \
      --output-format text ) > "$WALK/q$n-answer.md" 2>> "$WALK/errors.log"
  echo "model: $WALK_MODEL" >> "$WALK/q$n-answer.md"
  cat "$WALK/q$n-answer.md"
  echo
}

q 1 "Where do the site's colors and typefaces come from, and what file would I edit to change the accent color?"
q 2 "I need to add a new entry to the work portfolio. What do I touch, and what schema does it have to satisfy?"
q 3 "If I change the base layout, what else on the site is affected?"
q 4 "Tony's photo isn't showing on the about page. Which file is the problem, and does the map tell you?"

echo "--- transcripts in $WALK ---"
echo "Grade each answer: correct? one card only? did it stop?"
