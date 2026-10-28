#!/usr/bin/env bash
# Lighthouse every built page, mobile + desktop. Prints only pages that miss 100.
# Usage (from the site root): themes/zenware/scripts/lighthouse.sh
# Needs Chrome: npx @puppeteer/browsers install chrome@stable --path ~/.cache/zenware-chrome
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
out=$(mktemp -d)
export CHROME_PATH=${CHROME_PATH:-$(find ~/.cache/zenware-chrome -type f -name 'Google Chrome for Testing' | head -1)}
nix develop -c zola build --base-url http://localhost:4173 -o "$out/public" --force >/dev/null
node "$here/serve.mjs" "$out/public" >/dev/null & server=$!
trap 'kill $server' EXIT
sleep 1
pages=$(cd "$out/public" && find . -name index.html | sed 's#^\.##; s#index.html$##' | sort; echo /404.html)
for p in $pages; do for preset in mobile desktop; do
  flag=""; [ $preset = desktop ] && flag="--preset=desktop"
  npx -y lighthouse@latest "http://localhost:4173$p" $flag --quiet --chrome-flags="--headless=new" \
    --output=json --output-path="$out/r.json" >/dev/null 2>&1
  python3 - "$out/r.json" "$p" "$preset" <<'PY'
import json, sys
r = json.load(open(sys.argv[1])); c = r["categories"]
s = {k: round((v["score"] or 0) * 100) for k, v in c.items()}
bad = [ref["id"] for v in c.values() for ref in v["auditRefs"]
       if ref["weight"] > 0 and r["audits"][ref["id"]]["score"] is not None and r["audits"][ref["id"]]["score"] < 1]
mark = "ok  " if all(x == 100 for x in s.values()) else "MISS"
print(mark, f"{sys.argv[2]:<40} {sys.argv[3]:<7}", " ".join(f"{k[:4]}={v}" for k, v in s.items()), bad or "")
PY
done; done
