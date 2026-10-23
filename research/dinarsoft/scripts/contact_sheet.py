"""Render brand/contact-sheet.png from local files only (network blocked)."""
import html, json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "scripts/contact_sheet.json").read_text())


def section(title, items):
    cells = "".join(
        f'<figure><img src="{(ROOT / f).as_uri()}"{" style=\"" + st + "\"" if st else ""}><figcaption>{html.escape(cap)}</figcaption></figure>'
        for f, cap, st in ((i[0], i[1], i[2] if len(i) > 2 else "") for i in items))
    return f"<h2>{html.escape(title)}</h2><div class=row>{cells}</div>"


swatches = "".join(
    f'<figure><div class=sw style="background:{c}"></div><figcaption><b>{c}</b><br>{html.escape(n)}</figcaption></figure>'
    for c, n in SPEC["colors"])
fonts = "".join(f'<p style="font-family:{f};font-size:{s}">{html.escape(t)} <small>({html.escape(f)})</small></p>'
                for f, s, t in SPEC["fonts"])
page = f"""<!doctype html><meta charset=utf-8><style>
body{{margin:24px;background:#fff;color:#222;font:13px Arial,Helvetica,sans-serif;width:1240px}}
h1{{font-size:22px;margin:0 0 4px}} h2{{font-size:14px;margin:22px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px}}
.row{{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end}} figure{{margin:0;text-align:center}}
figure img{{display:block;margin:0 auto 4px;image-rendering:pixelated;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/12px 12px}}
figcaption{{font-size:11px;color:#555;max-width:220px}} .sw{{width:96px;height:56px;border:1px solid #999}}
</style><h1>DinarSoft brand contact sheet</h1><div>{html.escape(SPEC["note"])}</div>
{''.join(section(t, items) for t, items in SPEC["sections"])}
<h2>Colors (hex from the archived CSS and HTML)</h2><div class=row>{swatches}</div>
<h2>Type (as declared in the CSS; rendered with this machine's fonts)</h2>{fonts}"""

out = ROOT / "brand/contact-sheet.png"
tmp = Path(sys.argv[1]) / "contact-sheet.html"
tmp.write_text(page)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    pg = b.new_page(viewport={"width": 1290, "height": 800})
    pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith("file://") else r.abort())
    pg.goto(tmp.as_uri())
    pg.screenshot(path=out, full_page=True)
    b.close()
print(out)
