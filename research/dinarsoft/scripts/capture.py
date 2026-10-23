"""Full-page and crop screenshots of archived pages. Usage: capture.py pages.json [id ...]

Third-party pages load from the Wayback Machine (`if_` form: no toolbar). DinarSoft's own pages
("local": true) render from the files already mirrored into ../site/, so they cost no requests.
"""
import asyncio, json, os, re, sys, time
from pathlib import Path
from urllib.parse import urljoin
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "captures"
ADS = re.compile(r"doubleclick|googlesyndication|google-analytics|urchin|adserver|/ads?/|/adv?ert|quantserve|scorecardresearch|statcounter|addthis|fastclick|tribalfusion|adbrite|adsonar|/_static/", re.I)
HIDE = "#wm-ipp-base,#wm-ipp,#wm-ipp-print,#donato,#wm-ipp-inside{display:none!important}"
DS = re.compile(r"^https?://(www\.)?dinarsoft\.com(:80)?", re.I)
ARCHIVE = ("https://web.archive.org/", "https://archive.org/")

# Smallest block that contains the match: prefer its table row or list item, never taller than maxh.
FIND = """([rx, nth, up, maxh]) => {
  const r = new RegExp(rx, 'i');
  const all = [...document.body.querySelectorAll('*')].filter(e => r.test(e.innerText || ''));
  const deep = all.filter(e => ![...e.children].some(c => r.test(c.innerText || '')));
  const h = e => e.getBoundingClientRect().height;
  const box = el => { const b = el.getBoundingClientRect();
    return {x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, tag: el.tagName, text: el.innerText.slice(0, 300)}; };
  const pick = el => {
    const blockish = e => !['inline', 'contents'].includes(getComputedStyle(e).display);
    while (el.parentElement && (!blockish(el) || h(el) < 14)) el = el.parentElement;
    for (let c = el, i = 0; c && i < 4; c = c.parentElement, i++)
      if (['TR', 'LI'].includes(c.tagName) && h(c) <= maxh) { el = c; break; }
    for (let i = 0; i < up && el.parentElement && h(el.parentElement) <= maxh; i++) el = el.parentElement;
    return box(el);
  };
  if (nth < 0) return deep.slice(0, 15).map(pick);  // all candidates, for offline re-cropping
  return deep[nth] ? pick(deep[nth]) : null;
}"""
CANDIDATES = r"DinarSoft|Dinar Soft|MemMaid|Handy\s?Switcher|HandyMenu|HandyLauncher|Tap\s?Text|Hijri|rating|stars?\b|out of 5|/10|verdict|conclusion|bottom line|must.have|recommend|winner|finalist|nominee"

STATE = {"failed": 0, "missing": [], "ts": None, "site": "", "images": 0, "skipped": 0}
MIRROR = {}  # site path -> [(timestamp, local file)]
for rec in json.loads((ROOT / "site.json").read_text())["files"]:
    if rec.get("sha256"):
        MIRROR.setdefault(rec["path"].split("#")[0], []).append((rec["timestamp"], ROOT / "site" / rec["file"]))


def mirrored(url):
    """Local copy of a dinarsoft.com URL, the capture closest in time to the page being shot."""
    path = DS.sub("", url).split("#")[0] or "/"
    options = MIRROR.get(path) or MIRROR.get(path.rstrip("/") + "/")
    if not options:
        return None
    return min(options, key=lambda o: abs(int(o[0]) - int(STATE["ts"])))[1]


async def wait_open():
    """IA refuses TCP connections while it blocks an IP: probe with a bare connect, no HTTP request."""
    while True:
        try:
            _, w = await asyncio.wait_for(asyncio.open_connection("web.archive.org", 443), 20)
            w.close()
            return
        except Exception:
            print("  archive blocks us; waiting 5 min", flush=True)
            await asyncio.sleep(300)


async def shoot(ctx, pg, log):
    page = await ctx.new_page()
    local = pg.get("local")
    url = pg["url"] if local or pg["url"].startswith(("https://archive.org/", "file://")) \
        else f"https://web.archive.org/web/{pg['ts']}if_/{pg['url']}"
    credit = f"https://web.archive.org/web/{pg['ts']}/{pg['url']}" if pg.get("ts") else pg.get("source") or url
    host = re.sub(r"^https?://(www\.)?", "", pg["url"]).split("/")[0].split(":")[0]
    STATE.update(failed=0, missing=[], ts=pg.get("ts") or "20060101000000", site=".".join(host.split(".")[-2:]), images=0, skipped=0)
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=900_000)
        try:
            await page.wait_for_load_state("networkidle", timeout=600_000)
        except Exception:
            pass
        if STATE["failed"]:
            print("INCOMPLETE", pg["id"], STATE["failed"], "sub-requests refused", flush=True)
            return False
        try:
            await page.add_style_tag(content=HIDE)
        except Exception:
            pass  # a page's CSP can refuse the style tag; if_ pages carry no toolbar anyway
        for fr in page.frames:  # never-archived images: hide the broken-image icon, keep the layout
            await fr.evaluate("document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.style.visibility = 'hidden' })")
        await page.wait_for_timeout(1500)
        full = OUT / f"{pg['id']}.png"
        await page.screenshot(path=full, full_page=True)
        base = dict(source_url=pg.get("source") or pg["url"], wayback_url=credit, timestamp=pg.get("ts"), owner=pg["owner"])
        log.append(dict(file=full.name, kind="full page", shows=pg["shows"], privacy=pg.get("privacy"),
                        rendered_from="local mirror (site/), no live requests" if local else None,
                        assets_not_loaded=STATE["missing"] or None, images_skipped=STATE["skipped"] or None, **base))
        print("OK", full.name, len(STATE["missing"]), "assets missing", flush=True)
        if os.environ.get("DUMP"):  # page text for tuning crop patterns
            Path(os.environ["DUMP"], pg["id"] + ".txt").write_text(await page.evaluate("document.body.innerText"))
        boxes = await page.evaluate(FIND, [CANDIDATES, -1, 0, 400])
        (OUT / ".boxes").mkdir(exist_ok=True)
        (OUT / ".boxes" / f"{pg['id']}.json").write_text(json.dumps(boxes, indent=1, ensure_ascii=False))
        for i, c in enumerate(pg.get("crops", [])):
            box = await page.evaluate(FIND, [c["rx"], c.get("nth", 0), c.get("up", 0), c.get("maxh", 400)])
            if not box:
                print("  NO MATCH", pg["id"], c["rx"], flush=True)
                continue
            pad = c.get("pad", 10)
            clip = dict(x=max(box["x"] - pad, 0), y=max(box["y"] - pad, 0),
                        width=min(box["w"] + 2 * pad, 1600), height=box["h"] + 2 * pad)
            name = f"{pg['id']}--{c.get('name', i)}.png"
            await page.screenshot(path=OUT / name, clip=clip, full_page=True)
            log.append(dict(file=name, kind="crop", shows=c.get("shows", pg["shows"]), matched_text=box["text"], **base))
            print("  crop", name, int(box["w"]), int(box["h"]), flush=True)
        return True
    except Exception as e:
        print("FAIL", pg["id"], repr(e)[:200], flush=True)
        return False
    finally:
        await page.close()


async def main(spec, only):
    OUT.mkdir(exist_ok=True)
    pages = [p for p in json.loads(Path(spec).read_text()) if not only or p["id"] in only]
    sem = asyncio.Semaphore(2)  # the brief caps us at 2 requests at a time
    gap, last, lock = 4.0, [0.0], asyncio.Lock()  # and >=4 s between requests (every redirect hop): IA blocks the IP above ~15/min

    async def paced_fetch(r, url):
        async with lock:
            await asyncio.sleep(max(0, last[0] + gap - time.monotonic()))
            last[0] = time.monotonic()
        return await r.fetch(url=url, max_redirects=0, timeout=60_000)

    async def route(r):
        u = r.request.url
        if u.startswith(("file://", "data:")):
            return await r.continue_()
        if DS.match(u):  # DinarSoft page rendered from the mirror; never touch the squatted live domain
            f = mirrored(u)
            if f:
                return await r.fulfill(path=f)
            STATE["missing"].append(u)
            return await r.abort()
        if not u.startswith(ARCHIVE) or r.request.resource_type not in ("document", "stylesheet", "image") or ADS.search(u):
            return await r.abort()  # live hosts, scripts, ads and trackers
        if r.request.resource_type == "image":
            m = re.search(r"/web/\d+\w*/(?:https?://)?(?:www\.)?([^/:]+)", u)
            site = ".".join(m.group(1).split(".")[-2:]) if m else ""
            STATE["images"] += 1
            if site != STATE["site"] or STATE["images"] > 80:  # other-site images are ads/counters; long forums cap out
                STATE["skipped"] += 1
                return await r.abort()
        async with sem:
            target, err = u, ""
            for _ in range(6):  # Wayback answers most assets with a 302 to the nearest capture: pace every hop
                try:
                    resp = await paced_fetch(r, target)
                except Exception as e:
                    err = str(e)
                    if "REFUSED" in err.upper() or "RESET" in err.upper():
                        break
                    await asyncio.sleep(20)
                    continue
                loc = resp.headers.get("location")
                if resp.status in (301, 302, 303, 307, 308) and loc:
                    target = urljoin(target, loc)
                    if not target.startswith(ARCHIVE):
                        break
                    continue
                if resp.status in (429, 503):
                    err = "REFUSED (429/503)"
                    break
                return await r.fulfill(response=resp)
            if "REFUSED" in err.upper() or "RESET" in err.upper():
                STATE["failed"] += 1  # IP block: the page is redone after a wait
            else:
                STATE["missing"].append(u)  # archived asset that never answers: keep the page without it
            await r.abort()

    mf = OUT / "manifest.json"
    log = json.loads(mf.read_text()) if mf.exists() else []
    done = {x["file"] for x in log}
    if only:  # explicit ids are re-shot
        log = [x for x in log if x["file"].split("--")[0].removesuffix(".png") not in only]
    else:
        pages = [p for p in pages if f"{p['id']}.png" not in done]
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome")
        ctx = await b.new_context(viewport={"width": 1280, "height": 900})
        await ctx.route("**/*", route)
        for pg in pages:  # one page at a time; the semaphore caps its sub-requests
            for attempt in range(3):
                if not (pg.get("local") or pg["url"].startswith("file://")):
                    await wait_open()
                if await shoot(ctx, pg, log):
                    break
                await asyncio.sleep(300)
            mf.write_text(json.dumps(sorted(log, key=lambda x: x["file"]), indent=1, ensure_ascii=False))
        await b.close()
    mf.write_text(json.dumps(sorted(log, key=lambda x: x["file"]), indent=1, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], set(sys.argv[2:])))
