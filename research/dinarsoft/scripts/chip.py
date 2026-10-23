"""DinarSoft files inside Russian CHIP magazine cover discs (archive.org ISO items), fetched file by file."""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from wb import ROOT, UA, sha256

# item, iso, path inside iso, date inside iso, product note
FILES = [
    ("chip-dvd-ru-2006-06", "CHIP_DVD_2006-06.iso", "special/memmaid/DinarSoftMemMaidPG15a.exe", "2006-04-14", "MemMaid (disc lists 'MemMaid 1.6')"),
    ("chip-dvd-ru-2007-05", "CHIP_DVD_2007-05.iso", "pda/handy/DinarSoftHandySwitcher27.exe", "2007-03-26", "HandySwitcher 2.7"),
    ("chip-dvd-ru-2008-06", "CHIP_DVD_2008-06.iso", "pda/HandySwitcher/DinarSoftHandySwitcher_Setup.exe", "2008-04-18", "HandySwitcher 3.1"),
    ("chip-dvd-ru-2008-09", "CHIP_DVD_2008-09.iso", "pda/DinarSoftMemMaid/DinarSoftMemMaid.CAB", "2008-07-17", "MemMaid 2.3 multilingual"),
]


def fetch(url):
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r:
                return r.read()
        except Exception as e:
            print("  retry", i + 1, repr(e)[:80], flush=True)
            time.sleep(15 * 2**i)


if __name__ == "__main__":
    mf = ROOT / "downloads.json"
    recs = [r for r in json.loads(mf.read_text()) if not r["file"].startswith("CHIP-")]
    known = {r["sha256"]: r["file"] for r in recs if r.get("sha256")}
    for item, iso, path, date, note in FILES:
        url = f"https://archive.org/download/{item}/{iso}/{urllib.parse.quote(path, safe='')}"
        body = fetch(url)
        h = sha256(body)
        name = f"CHIP-{item.split('-')[-2]}-{item.split('-')[-1]}_{path.rsplit('/', 1)[1]}"
        rec = dict(file=name, version=note, bytes=len(body), sha256=h, source="archive.org CHIP Russia cover disc",
                   archive_item=f"https://archive.org/details/{item}", path_in_iso=path, date_in_iso=date, url=url)
        if h in known:
            rec.update(kept=False, note=f"identical to {known[h]}")
        else:
            (ROOT / "downloads" / name).write_bytes(body)
        recs.append(rec)
        print(name, len(body), "dup of " + known[h] if h in known else "NEW", flush=True)
        time.sleep(3)
    mf.write_text(json.dumps(recs, indent=1))
