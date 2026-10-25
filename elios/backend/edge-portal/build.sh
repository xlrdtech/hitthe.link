#!/bin/sh
# Assemble the elios-portal Worker (Cloudflare Static Assets) from origin/main, never the
# working copy. Prints the build dir; ship from inside it with wrangler (CF token from 1Password).
# Served: elios/ minus backend/, logins.html and *.md, plus the eliops/ redirect page.
set -e
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
out=$(mktemp -d)
git -C "$repo" fetch -q origin main
mkdir -p "$out/public"
git -C "$repo" archive origin/main elios eliops/index.html | tar -x -C "$out/public"
rm -rf "$out/public/elios/backend" "$out/public/elios/logins.html" "$out/public/elios/"*.md
cp "$here/_headers" "$here/_redirects" "$here/robots.txt" "$out/public/"
cp "$here/wrangler.jsonc" "$out/"
echo "$out"
