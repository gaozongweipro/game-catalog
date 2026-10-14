#!/usr/bin/env bash
set -euo pipefail
REPO=gaozongweipro/game-catalog
cd /workspace/game-catalog-site
cp /workspace/game-catalog/games.json public/data/games.json
PAGES_BASE=/game-catalog/ npx vite build --outDir /tmp/pages-dist --emptyOutDir
touch /tmp/pages-dist/.nojekyll
T=$(mktemp -d); cp -r /tmp/pages-dist/. "$T"; cd "$T"
git init -q -b gh-pages && git add -A
git -c user.name=gaozongweipro -c user.email=gaozongweipro@users.noreply.github.com commit -qm "Deploy $(date '+%F %T')"
git push -qf "https://github.com/$REPO.git" gh-pages
cd /; rm -rf "$T"
echo "Deployed: https://gaozongweipro.github.io/game-catalog/"
