import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from wb import ROOT, final_ts, get, pmap, sha256

OUT = ROOT / "downloads"
D = "http://www.dinarsoft.com"
T = D + "/scripts/downloadtrial.php?"
# name, version, expected bytes (career.md 1.4, None = not in the list), timestamp, url
ITEMS = [
    ("DinarSoftMemMaid172.exe", "1.72", 643072, "20070129002024", D + "/trials/DinarSoftMemMaid172.exe"),
    ("DinarSoftMemMaid172.CAB", "1.72", 508734, "20070129001847", D + "/trials/DinarSoftMemMaid172.CAB"),
    ("DinarSoftMemMaid_en.CAB", "2.3 (Build 230), English", 989440, "20170902151714", T + "p=mm&t=cab"),
    ("DinarSoftMemMaid_en_Setup.exe", "2.3 (Build 230), English", 461312, "20170902151903", T + "p=mm&t=exe"),
    ("DinarSoftMemMaid.CAB", "2.3 (Build 230), multilingual", 1303812, "20170902151816", T + "p=mm&t=cab&l=m"),
    ("DinarSoftMemMaid_Setup.exe", "2.3 (Build 230), multilingual", 539136, "20170902151908", T + "p=mm&t=exe&l=m"),
    ("DinarSoftMemMaid_1_73.CAB", "1.73", 454630, "20170902151858", T + "p=mm&t=cab&v=o"),
    ("DinarSoftMemMaid_1_73_Setup.exe", "1.73", 264704, "20170902151913", T + "p=mm&t=exe&v=o"),
    ("DinarSoftHandySwitcher27.exe", "2.7", 163328, "20070306075025", D + "/trials/DinarSoftHandySwitcher27.exe"),
    ("DinarSoftHandySwitcher_Demo.CAB", "3.1 (Build 78)", 252489, "20090301222736", T + "p=hs&t=cab"),
    ("DinarSoftHandySwitcher_Setup.exe", "3.1 (Build 78)", 207872, "20090301222741", T + "p=hs&t=exe"),
    ("DinarSoftHandyMenu36.CAB", "3.6", 213014, "20061223230453", D + "/trials/DinarSoftHandyMenu36.CAB"),
    ("DinarSoftHandyMenu.CAB", "3.7 (Build 40), multilingual", 195112, "20101218111541", T + "p=hm&t=cab"),
    ("DinarSoftHandyMenu_Setup.exe", "3.7 (Build 40), multilingual", 201728, "20101218111333", T + "p=hm&t=exe"),
    ("DinarSoftHandyLauncher34.CAB", "3.4", 105402, "20061222045948", D + "/trials/DinarSoftHandyLauncher34.CAB"),
    ("DinarSoftHandyLauncher34.exe", "3.4", 208896, "20061216210743", D + "/trials/DinarSoftHandyLauncher34.exe"),
    ("DinarSoftHandyLauncher34_Setup.exe", "3.4", 156672, "20070713235349", T + "p=hl&t=exe"),
    ("DinarSoftTapText13.CAB", "1.3", 182869, "20070117073946", D + "/trials/DinarSoftTapText13.CAB"),
    ("DinarSoftTapText13.exe", "1.3", 286720, "20061229072411", D + "/trials/DinarSoftTapText13.exe"),
    ("DinarSoftHijriDate15.CAB", "1.5", 190841, "20070116214648", D + "/trials/DinarSoftHijriDate15.CAB"),
    ("DinarSoftHijriDate15.exe", "1.5", 352256, "20061224171150", D + "/trials/DinarSoftHijriDate15.exe"),
    # Extra payloads: same URL, different CDX digest from the listed capture.
    ("DinarSoftHandySwitcher27_20061223.exe", "2.7 (earlier build)", None, "20061223074350", D + "/trials/DinarSoftHandySwitcher27.exe"),
    ("DinarSoftMemMaid_en_20090803.CAB", "2.x", None, "20090803131716", T + "p=mm&t=cab"),
    ("DinarSoftMemMaid_20090803.CAB", "2.x multilingual", None, "20090803131722", T + "p=mm&t=cab&l=m"),
    ("DinarSoftMemMaid_1_73_20090803.CAB", "1.73", None, "20090803131727", T + "p=mm&t=cab&v=o"),
    ("DinarSoftMemMaid_en_Setup_20090803.exe", "2.x", None, "20090803131741", T + "p=mm&t=exe"),
    ("DinarSoftMemMaid_Setup_20090803.exe", "2.x multilingual", None, "20090803131747", T + "p=mm&t=exe&l=m"),
    ("DinarSoftMemMaid_1_73_Setup_20090803.exe", "1.73", None, "20090803131807", T + "p=mm&t=exe&v=o"),
]


def one(item):
    name, ver, want, ts, url = item
    dest = OUT / name
    body, fin, status, hdr = get(ts, url)
    if body is None:
        print("FAIL", name, status, flush=True)
        return dict(file=name, version=ver, expected_bytes=want, wayback=fin, status=status)
    if body[:2] != b"MZ" and body[:4] != b"MSCF":  # 2009-08-03 captures are "domain has expired" pages
        print("NOT A BINARY", name, flush=True)
        return dict(file=name, version=ver, wayback=fin, timestamp=final_ts(fin) or ts, original_url=url,
                    bytes=len(body), kept=False, note="HTML page: 'The domain dinarsoft.com has expired' (registrar parking), not an installer")
    dest.write_bytes(body)
    cd =hdr.get("x-archive-orig-content-disposition") or hdr.get("Content-Disposition")
    rec = dict(file=name, version=ver, bytes=len(body), expected_bytes=want,
               size_ok=(want is None or want == len(body)), sha256=sha256(body),
               original_url=url, timestamp=final_ts(fin) or ts, wayback=fin,
               orig_content_disposition=cd, mimetype=hdr.get("Content-Type"),
               magic=body[:4].hex())
    print("OK" if rec["size_ok"] else "SIZE MISMATCH", name, len(body), want, flush=True)
    return rec


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    recs = pmap(one, ITEMS)
    (ROOT / "downloads.json").write_text(json.dumps(recs, indent=1))
