#!/usr/bin/env bash
set -euo pipefail

# setup-harness.sh — Create symlinks from repo root to harness/ configs.
# Run this after cloning or whenever symlinks are missing.

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

link() {
  local target="$1" link_name="$2"
  if [ -L "$link_name" ]; then
    rm "$link_name"
  elif [ -e "$link_name" ]; then
    echo "WARNING: $link_name exists and is not a symlink — skipping"
    return
  fi
  ln -s "$target" "$link_name"
  echo "  $link_name → $target"
}

echo "Creating harness symlinks..."

# Directory symlinks
link harness/claude   .claude
link harness/cursor   .cursor
link harness/opencode .opencode
link harness/rules    .rules

# File symlinks
link harness/claude/CLAUDE.md  CLAUDE.md
link harness/claude/AGENTS.md  AGENTS.md
link harness/opencode/opencode.json opencode.json
link harness/claude/mcp.json .mcp.json

echo "Done."
