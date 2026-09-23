#!/usr/bin/env bash
# Fails when a commit in <base>..<head> carries an attribution trailer, which
# AGENTS.md forbids. Usage: check-commit-messages.sh <base> <head>
#
# Commits reachable from 7d1a6d1 predate this check and are exempt: history is
# not rewritten, so without the exemption the pull request that introduced the
# check could never pass.
set -euo pipefail

base="$1"
head="$2"
exempt="7d1a6d1675a003b8dc24bb506aeaeb90ba12a2a9"

not_exempt=()
if git cat-file -e "${exempt}^{commit}" 2>/dev/null; then
  not_exempt=(--not "$exempt")
fi

commits=$(git rev-list "$base..$head" "${not_exempt[@]}")
checked=0
failed=0
for sha in $commits; do
  checked=$((checked + 1))
  if git log -1 --format=%B "$sha" | grep -qiE '^(co-authored-by|claude-session):'; then
    echo "::error::$(git log -1 --format='%h %s' "$sha") carries an attribution trailer"
    failed=1
  fi
done

echo "check-commit-messages: $checked commit(s) checked"
exit "$failed"
