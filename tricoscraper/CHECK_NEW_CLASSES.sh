#!/bin/bash

cd /srv/services/schedule/tricoscraper
source .venv/bin/activate

set -e

DATE=$(date +"%Y%m%d")

OUT_NAME="trico_scraped.json"

JQ_LOC="/usr/bin/jq"

cp -f "$OUT_NAME" "$OUT_NAME.tmp" 2>/dev/null
python tricoscraper.py|grep -vF '~' &> error.txt
if [[ -n $(diff -wd <(cat "$OUT_NAME.tmp"|$JQ_LOC -S .) <(cat "$OUT_NAME"|$JQ_LOC -S .)) ]]; then
  cp "$OUT_NAME" "old_schedules/$DATE.json"
  cp "$OUT_NAME" ../dist/trico_scraped.json
fi

rm -f "$OUT_NAME.tmp"
