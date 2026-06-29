#!/usr/bin/env python3
"""XEN RSS builder: xen/live.json -> rss/feed.xml (RSS 2.0) + rss/feed.json.
Also POSTs new events to the omni OTLP lane (best-effort). Run from the receipts cycle / cron."""
import json, os, html, datetime, urllib.request
ROOT="/Volumes/M4/sync_/exedus/dev_/xen/.deploy/hitthe.link"
LIVE=os.path.join(ROOT,"xen/live.json")
OUTX=os.path.join(ROOT,"rss/feed.xml")
OUTJ=os.path.join(ROOT,"rss/feed.json")
SEEN=os.path.join(ROOT,"rss/.seen.json")
SITE="https://hitthe.link"
OTLP=os.environ.get("OMNI_OTLP_URL","http://127.0.0.1:4319/v1/logs")  # omni OTLP logs endpoint (best-effort)

def rfc822(ts):
    try:
        d=datetime.datetime.fromisoformat(ts.replace("Z","+00:00"))
        return d.strftime("%a, %d %b %Y %H:%M:%S +0000")
    except Exception:
        return datetime.datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")

def flatten(d):
    items=[]
    for cap in d.get("by_capability",[]):
        for r in cap.get("recent",[]):
            items.append({"ts":r.get("ts",""),"text":r.get("text","") or "","cat":cap.get("tag","event"),
                          "catName":cap.get("name",cap.get("tag","Event")),"persona":r.get("persona","XEN"),"proof":r.get("proof")})
    items.sort(key=lambda x:x["ts"],reverse=True)
    return items

d=json.load(open(LIVE,encoding="utf-8"))
items=flatten(d)
updated=d.get("updated","")

# ---- feed.json ----
json.dump({"title":"XEN — Notification Center","home":SITE+"/rss/","updated":updated,
           "count":len(items),"items":items[:300]}, open(OUTJ,"w",encoding="utf-8"))

# ---- feed.xml (RSS 2.0) ----
def cd(s): return "<![CDATA["+(s or "")+"]]>"
parts=['<?xml version="1.0" encoding="UTF-8"?>',
 '<rss version="2.0"><channel>',
 '<title>XEN · Notification Center</title>',
 '<link>%s/rss/</link>'%SITE,
 '<description>Live XEN event firehose — canon, ships, voice, bridges, goals.</description>',
 '<lastBuildDate>%s</lastBuildDate>'%rfc822(updated),
 '<generator>xen-rss</generator>']
for i in items[:200]:
    guid=html.escape((i["ts"]+"|"+i["text"])[:120])
    parts.append("<item><title>%s</title><description>%s</description><category>%s</category><dc:creator xmlns:dc=\"http://purl.org/dc/elements/1.1/\">%s</dc:creator><pubDate>%s</pubDate><guid isPermaLink=\"false\">%s</guid><link>%s/rss/</link></item>"%(
        cd(i["catName"]+": "+i["text"][:90]), cd(i["text"]), html.escape(i["catName"]), html.escape(i["persona"]), rfc822(i["ts"]), guid, SITE))
parts.append("</channel></rss>")
open(OUTX,"w",encoding="utf-8").write("\n".join(parts))

# ---- emit NEW events to omni OTLP (best-effort, non-fatal) ----
seen=set()
if os.path.exists(SEEN):
    try: seen=set(json.load(open(SEEN)))
    except: pass
new=[i for i in items if (i["ts"]+i["text"])[:80] not in seen]
sent=0
for i in new[:50]:
    rec={"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"xen-rss"}}]},
      "scopeLogs":[{"logRecords":[{"timeUnixNano":"0","severityText":"INFO",
        "body":{"stringValue":"["+i["catName"]+"] "+i["text"][:200]},
        "attributes":[{"key":"category","value":{"stringValue":i["cat"]}},{"key":"persona","value":{"stringValue":i["persona"]}},{"key":"src","value":{"stringValue":"rss"}}]}]}]}]}
    try:
        req=urllib.request.Request(OTLP,data=json.dumps(rec).encode(),headers={"Content-Type":"application/json"},method="POST")
        urllib.request.urlopen(req,timeout=3); sent+=1
    except Exception: pass
for i in items: seen.add((i["ts"]+i["text"])[:80])
json.dump(sorted(list(seen))[-2000:],open(SEEN,"w"))
print("feed: %d items | new->otlp: %d/%d"%(len(items),sent,len(new)))
