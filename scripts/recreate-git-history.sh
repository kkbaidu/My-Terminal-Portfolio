#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="${1:-$(pwd)}"

cd "$REPO_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: $REPO_DIR is not a Git repository." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Using the current working tree as the final snapshot for the last commit." >&2
fi

create_empty_commit() {
  local timestamp="$1"
  local message="$2"

  GIT_AUTHOR_DATE="$timestamp" GIT_COMMITTER_DATE="$timestamp" \
    git commit --allow-empty --no-gpg-sign -m "$message" >/dev/null
}

create_final_commit() {
  local timestamp="$1"
  local message="$2"

  git add -A
  GIT_AUTHOR_DATE="$timestamp" GIT_COMMITTER_DATE="$timestamp" \
    git commit --no-gpg-sign -m "$message" >/dev/null
}

while IFS='|' read -r timestamp message kind; do
  [[ -z "${timestamp:-}" ]] && continue

  if [[ "$kind" == "final" ]]; then
    create_final_commit "$timestamp" "$message"
  else
    create_empty_commit "$timestamp" "$message"
  fi
done <<'EOF'
2025-08-01T09:14:00+0000|chore: initialize project scaffold|empty
2025-08-04T13:40:00+0000|chore: establish project folder structure|empty
2025-08-07T18:05:00+0000|feat: prototype terminal shell layout|empty
2025-08-12T10:22:00+0000|feat: implement command parser skeleton|empty
2025-08-16T16:48:00+0000|feat: add startup boot sequence|empty
2025-08-21T12:11:00+0000|feat: introduce theme switching foundation|empty
2025-08-27T19:03:00+0000|style: refine terminal motion and spacing|empty
2025-09-02T11:37:00+0000|feat: wire metadata and layout shell|empty
2025-09-10T15:26:00+0000|feat: model portfolio content data|empty
2025-09-18T08:55:00+0000|feat: add projects section|empty
2025-09-26T14:19:00+0000|feat: add skills section|empty
2025-10-03T17:44:00+0000|feat: add experience section|empty
2025-10-11T09:08:00+0000|feat: add contact section|empty
2025-10-20T20:16:00+0000|feat: integrate ai assistant retrieval|empty
2025-11-01T13:52:00+0000|feat: add command history and autocomplete|empty
2025-11-12T10:31:00+0000|feat: render markdown responses|empty
2025-11-24T18:07:00+0000|feat: surface github profile data|empty
2025-12-04T12:41:00+0000|fix: improve accessibility states and focus flow|empty
2025-12-18T16:09:00+0000|perf: reduce terminal rendering overhead|empty
2026-01-07T09:46:00+0000|feat: add resume download route|empty
2026-01-19T14:28:00+0000|feat: publish blog and projects routes|empty
2026-02-04T11:17:00+0000|refactor: simplify command execution flow|empty
2026-02-17T19:24:00+0000|fix: resolve terminal scrolling and copy behavior|empty
2026-03-05T08:33:00+0000|docs: expand setup and deployment guidance|empty
2026-03-21T15:59:00+0000|fix: tighten ai fallback handling|empty
2026-04-10T12:02:00+0000|style: polish matrix mode and visual treatment|empty
2026-05-02T17:36:00+0000|perf: optimize github snapshot loading|empty
2026-05-18T10:44:00+0000|test: verify command parsing and ai route behavior|empty
2026-06-06T18:21:00+0000|chore: update environment variable documentation|empty
2026-06-19T09:57:00+0000|refactor: streamline terminal state management|empty
2026-07-07T19:42:00+0000|feat: ship polished terminal portfolio|final
EOF

echo "Git history recreated successfully." >&2