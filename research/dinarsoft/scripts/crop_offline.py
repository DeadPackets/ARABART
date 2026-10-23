"""Cut extra crops (verdicts, ratings) from full-page captures using the boxes saved by capture.py.
Usage: uv run -q --with pillow python -I crop_offline.py crops_offline.json"""
import json, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CAP = ROOT / "captures"
mf = CAP / "manifest.json"
log = json.loads(mf.read_text())
full = {x["file"]: x for x in log if x["kind"] == "full page"}
for c in json.loads(Path(sys.argv[1]).read_text()):
    for gone in c.get("replaces", []):  # a bad automatic crop of the same page
        (CAP / gone).unlink(missing_ok=True)
        log = [x for x in log if x["file"] != gone]
    boxes = json.loads((CAP / ".boxes" / f"{c['page']}.json").read_text())
    if "clip" in c:  # fixed rectangle (document px) when no saved box fits
        x, y, w, h = c["clip"]
        boxes = [dict(x=x, y=y, w=w, h=h, text=c.get("text", ""))]
        c["rx"] = ".*"
    hit = [b for b in boxes if re.search(c["rx"], b["text"], re.I | re.S)]
    if not hit:
        print("NO MATCH", c["page"], c["rx"])
        continue
    hit = hit if c.get("union") else hit[:1]
    pad = c.get("pad", 10)
    x0, y0 = min(b["x"] for b in hit) - pad, min(b["y"] for b in hit) - pad
    x1, y1 = max(b["x"] + b["w"] for b in hit) + pad, max(b["y"] + b["h"] for b in hit) + pad
    src = full[f"{c['page']}.png"]
    name = f"{c['page']}--{c['name']}.png"
    Image.open(CAP / src["file"]).crop((max(0, int(x0)), max(0, int(y0)), int(x1), int(y1))).save(CAP / name)
    log = [x for x in log if x["file"] != name]
    log.append(dict(file=name, kind="crop", shows=c["shows"], matched_text=" / ".join(" ".join(b["text"].split())[:120] for b in hit),
                    **{k: src[k] for k in ("source_url", "wayback_url", "timestamp", "owner")}))
    print("crop", name, int(x1 - x0), int(y1 - y0))
mf.write_text(json.dumps(sorted(log, key=lambda x: x["file"]), indent=1, ensure_ascii=False))
