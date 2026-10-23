import hashlib, json, re, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (family archive of DinarSoft; polite, 2 parallel max)"
POOL = 2  # the brief caps us at 2 requests at a time


def raw_url(ts, url):
    return f"https://web.archive.org/web/{ts}id_/{url}"


def get(ts, url, tries=7):
    """Return (bytes, final_url, status, headers) for the raw capture. Retries 429/5xx and IA 'offline' pages."""
    req = urllib.request.Request(raw_url(ts, url), headers={"User-Agent": UA})
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                body = r.read()
                if b"Internet Archive: Temporarily Offline" in body[:400]:
                    raise urllib.error.HTTPError(r.url, 503, "offline", r.headers, None)
                return body, r.url, r.status, dict(r.headers)
        except urllib.error.HTTPError as e:
            if e.code in (404, 403) and i >= 1:
                return None, raw_url(ts, url), e.code, {}
            err = e.code
        except Exception as e:  # timeouts, resets
            err = repr(e)
        wait = min(15 * 2**i, 300)
        print(f"  retry {i+1} in {wait}s ({err}) {url}", flush=True)
        time.sleep(wait)
    return None, raw_url(ts, url), "failed", {}


def final_ts(final_url):
    m = re.search(r"/web/(\d{14})id_/", final_url)
    return m.group(1) if m else None


def sha256(b):
    return hashlib.sha256(b).hexdigest()


def pmap(fn, items):
    with ThreadPoolExecutor(POOL) as ex:
        return list(ex.map(fn, items))


def load_cdx(path):
    return json.loads(Path(path).read_text())[1:]
