#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# push-to-github.sh
# Run this ONCE after creating the GitHub repo to connect and push.
# Usage: bash push-to-github.sh
# ─────────────────────────────────────────────────────────────

GITHUB_USER="Ramon-Carrillo"
REPO_NAME="ecoshop"
BRANCH="main"

echo "→ Renaming branch to '$BRANCH'..."
git branch -M "$BRANCH"

echo "→ Adding remote origin..."
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo "→ Pushing to GitHub..."
git push -u origin "$BRANCH"

echo ""
echo "✓ Done! View your repo at: https://github.com/$GITHUB_USER/$REPO_NAME"
