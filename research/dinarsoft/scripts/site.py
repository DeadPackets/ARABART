"""Mirror DinarSoft's own pages, images, CSS and JS from the Wayback CDX index into ../site/."""
import json, re, sys
from collections import defaultdict
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from wb import ROOT, final_ts, get, load_cdx, pmap, sha256

OUT = ROOT / "site"
JUNK = re.compile(r"^/(search/|(?=[a-z]*[A-Z])[A-Za-z]{5}/|%E2|e$|test$|download/test|urchin|www\.urchin|gitex\.\.\.|image\.|memmaid/\[|robots\.txt|parked\.php|__utm)")
ASSET = re.compile(r"\.(gif|jpe?g|png|ico|bmp|css|js)$", re.I)
CUTOFF = "20081231235959"  # last year DinarSoft updated the site
# Earlier designs of pages whose best (2008) snapshot is a later design; saved as name~<ts>.html.
ERAS = [("/", "20030805031233"), ("/", "20051123232931"), ("/", "20060824002903"), ("/", "20061206211940"),
        ("/", "20070624134718"), ("/", "20070813091855"), ("/home.html", "20060508132501"),
        ("/home.html", "20061031232526"), ("/topFrame.html", "20060508132456"), ("/topFrame.html", "20061031232531"),
        ("/menu.html", "20060508132452"), ("/menu.html", "20061031232523"), ("/index.html", "20061031232510")]


def norm(u):
    return re.sub(r"^https?://(www\.)?dinarsoft\.com(:80)?", "", u) or "/"


def local(path):
    p = path.lstrip("/")
    if p == "" or p.endswith("/"):
        p += "index.html"
    p = p.replace("?", "@")
    if not ASSET.search(p) and not p.endswith((".html", ".php", ".htm")) or p.endswith(".php") or "@" in p:
        p += ".html"
    assert ".." not in p
    return p


def pick(rows, asset):
    ok = sorted(r for r in rows if r[3] == "200")
    if not ok:
        return None
    if asset:
        return ok[0]
    early = [r for r in ok if r[0] <= CUTOFF]
    return early[-1] if early else ok[0]


def plan():
    g = defaultdict(list)
    for r in load_cdx(ROOT / "cdx/cdx_full.json"):
        path = norm(r[1])
        if JUNK.search(path) or "downloadtrial" in path or path.startswith("/trials/") or "&amp" in path:
            continue
        if r[2] in ("text/html", "warc/revisit") or ASSET.search(path):
            g[path].append(r)
    jobs, missing, seen = [], [], {}
    for path in sorted(g):
        asset = bool(ASSET.search(path))
        r = pick(g[path], asset)
        if not r:
            missing.append(dict(path=path, captures=len(g[path]), statuses=sorted({x[3] for x in g[path]})))
            continue
        dest = local(path)
        if dest.lower() in seen:  # case-insensitive disk: HM.gif vs hm.gif
            stem, dot, ext = dest.rpartition(".")
            dest = f"{stem}~{r[0]}.{ext}"
        seen[dest.lower()] = path
        jobs.append((path, r[0], r[1], dest))
        if path.endswith(".css"):  # colors may differ between CSS versions: keep each one
            digests = {r[4]}
            for x in sorted(g[path]):
                if x[3] == "200" and x[4] not in digests:
                    digests.add(x[4])
                    stem = dest[:-4]
                    jobs.append((f"{path}#{x[0]}", x[0], x[1], f"{stem}~{x[0]}.css"))
    for path, ts in ERAS:
        url = next(x[1] for x in g[path] if x[0] == ts)
        stem, _, ext = local(path).rpartition(".")
        jobs.append((f"{path}#{ts}", ts, url, f"{stem}~{ts}.{ext}"))
    return jobs, missing


def one(job):
    path, ts, url, dest = job
    body, fin, status, hdr = get(ts, url)
    rec = dict(path=path, file=dest, original_url=url, timestamp=ts, status=status)
    if body is None:
        print("FAIL", path, status, flush=True)
        return rec
    out = OUT / dest
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(body)
    rec.update(timestamp=final_ts(fin) or ts, bytes=len(body), sha256=sha256(body),
               mimetype=hdr.get("Content-Type"), wayback=fin.replace("id_/", "/"))
    print("OK", dest, len(body), flush=True)
    return rec


if __name__ == "__main__":
    jobs, missing = plan()
    only = sys.argv[1:]  # optional path prefixes to (re)fetch
    if only:
        jobs = [j for j in jobs if j[0].startswith(tuple(only))]
    print(len(jobs), "to fetch,", len(missing), "with no 200 capture", flush=True)
    done = {}
    mf = ROOT / "site.json"
    if mf.exists():
        done = {r["path"]: r for r in json.loads(mf.read_text())["files"]}
    todo = [j for j in jobs if done.get(j[0], {}).get("sha256") is None or only]
    for r in pmap(one, todo):
        done[r["path"]] = r
    mf.write_text(json.dumps(dict(files=sorted(done.values(), key=lambda r: r["path"]), missing=missing), indent=1))
