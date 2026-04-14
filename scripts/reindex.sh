#!/bin/bash
# Re-index all registered knowledge-graph repos
# Usage: ./scripts/reindex.sh [--force]

REGISTRY="$HOME/.knowledge-graph/registry.json"
KG_CLI="C:/Dev/knowledge-graph/knowledge-graph/dist/cli/index.js"

if [ ! -f "$REGISTRY" ]; then
  echo "No registry found at $REGISTRY"
  exit 1
fi

echo "=== Knowledge-Graph Re-indexer ==="
echo ""

node -e "
  const reg = JSON.parse(require('fs').readFileSync('$REGISTRY','utf8'));
  reg.forEach(r => console.log(r.path));
" | while read -r repo; do
  echo "Re-indexing: $repo"
  node "$KG_CLI" analyze "$repo" "$@"
  echo ""
done

echo "=== Done ==="
