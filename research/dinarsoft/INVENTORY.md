# DinarSoft inventory

**Everything DinarSoft that survives in the Internet Archive is now in this folder: 24 installers (8.9 MB, all 6 products, 13 distinct builds), 469 site files (14.7 MB), 5 in-app manuals, and 161 captures (79 full pages, 82 crops) of DinarSoft's pages and of every third-party award list and review with an archived copy.** Collected 2026-10-22 with the copyright owner's approval. Credit: Internet Archive (Wayback Machine and archive.org items).

| Folder | Files | Bytes | What |
|---|---|---|---|
| `downloads/` | 24 | 8,884,023 | Installers, untouched. Checksums: `SHA256SUMS`; details: `downloads.json` |
| `site/` | 469 | 14,651,002 | DinarSoft's own pages, images, CSS, JS, original paths. Details: `site.json` |
| `captures/` | 161 | 84,245,228 | PNG screenshots + `manifest.json` (§5) |
| `manuals/` | 13 | 245,959 | Help files and help images taken from inside the CABs |
| `brand/` | 11 | 826,120 | `contact-sheet.png` + installer icon and slogan bitmaps. See `BRAND.md` |
| `chip/` | 12 | 230,697 | CHIP magazine (Russia) cover-disc pages about DinarSoft (third party) |
| `cdx/` | 3 | 1,034,268 | The Wayback CDX index used (snapshot of 2026-10-22) |
| `scripts/` | | | Everything that produced the above (§8) |

## 1. Installers by product

Platform for all builds: ARM Pocket PC (StrongARM/XScale), from Windows CE 3.0 (Pocket PC 2002) upward; the CE range is from each CAB's setup header. "CAB" = install on the device. "EXE" = desktop installer run on a Windows PC with ActiveSync. Two desktop formats exist: the 2006 trial EXEs are self-extracting CABs; the 2007 to 2008 `*_Setup.exe` files are DinarSoft's own ActiveSync installer (UPX-packed; it carries the CAB, a license text, product bitmaps, and checks dinarsoft.com for updates). Dates are the newest file date inside the CAB.

| Product | Version (build date) | CAB | Desktop EXE | Max OS | Source |
|---|---|---|---|---|---|
| **MemMaid** | 1.5a (2006-03-23); CHIP's disc calls it 1.6 | inside the EXE | `CHIP-2006-06_DinarSoftMemMaidPG15a.exe` | CE 5.0 (WM5) | CHIP DVD 06/2006 |
| | 1.72 (2006-07-15) | `DinarSoftMemMaid172.CAB` | `DinarSoftMemMaid172.exe` | CE 5.0 | Wayback 2007-01-29 |
| | 1.73 (2007-02-17), the "older version for Pocket PC 2002" | `DinarSoftMemMaid_1_73.CAB` | `DinarSoftMemMaid_1_73_Setup.exe` | CE 6.0 | Wayback 2017-09-02 (same bytes since 2009-02-03) |
| | 2.3 Build 230, English (2008-06-17) | `DinarSoftMemMaid_en.CAB` | `DinarSoftMemMaid_en_Setup.exe` | CE 6.99 (WM6) | Wayback 2017-09-02 |
| | 2.3 Build 230, multilingual: EN, DE, FR, zh-CN, CS, SK, IT, RU (2008-06-17) | `DinarSoftMemMaid.CAB` | `DinarSoftMemMaid_Setup.exe` | CE 6.99 | Wayback 2017-09-02; same CAB also on CHIP DVD 09/2008 |
| **HandySwitcher** | 2.7 (2006-07-15) | inside the EXEs | `DinarSoftHandySwitcher27_20061223.exe` (self-extracting) and `DinarSoftHandySwitcher27.exe` (2007 setup); same device files | CE 5.99 | Wayback 2006-12-23 and 2007-03-06; the 2007 file is also on CHIP DVD 05/2007 |
| | 3.1, first build (2008-04-15) | inside the EXE | `CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe` | CE 6.99 | CHIP DVD and CD 06/2008 |
| | 3.1 Build 78 (2008-07-20) | `DinarSoftHandySwitcher_Demo.CAB` | `DinarSoftHandySwitcher_Setup.exe` | CE 6.99 | Wayback 2009-03-01 |
| **HandyMenu** | 3.6 (2006-03-06) | `DinarSoftHandyMenu36.CAB` | none archived | CE 5.1 | Wayback 2006-12-23 |
| | **3.7 Build 40**, multilingual (2008-06-24). Not in the revision history; named on the 2008 download page | `DinarSoftHandyMenu.CAB` | `DinarSoftHandyMenu_Setup.exe` | CE 6.99 | Wayback 2010-12-18 (same since 2009-04-07) |
| **HandyLauncher** | 3.4 (2006-03-20) | `DinarSoftHandyLauncher34.CAB` | `DinarSoftHandyLauncher34.exe` (2006) and `DinarSoftHandyLauncher34_Setup.exe` (2007 setup, same CAB) | CE 5.0 | Wayback 2006-12 and 2007-07-13 |
| **TapText** | 1.3 (2006-02-27) | `DinarSoftTapText13.CAB` | `DinarSoftTapText13.exe` | CE 5.0 | Wayback 2006-12 / 2007-01 |
| **HijriDate** | 1.5, Arabic/English (2005-02-04) | `DinarSoftHijriDate15.CAB` | `DinarSoftHijriDate15.exe` | CE 5.0 | Wayback 2006-12 / 2007-01 |

All 21 files listed in `research/career.md` §1.4 match their listed sizes byte for byte. The 3 extra builds are `DinarSoftHandySwitcher27_20061223.exe` (a second 2.7 installer, found as a different CDX digest of the same URL) and the 2 CHIP files. Every 2008 file also matches the size that DinarSoft's own download page printed (for example HandyMenu 3.7 "197.00 KB" = 201,728 bytes).

Checked and not kept: the 6 MemMaid `downloadtrial.php` captures of 2009-08-03 are "The domain dinarsoft.com has expired" parking pages, not installers. Two CHIP files are byte-identical to Wayback files (logged in `downloads.json` with `kept: false`).

### Full file list

| File | Version | Bytes | SHA-256 (first 16) | Capture |
|---|---|---|---|---|
| DinarSoftMemMaid172.exe | 1.72 | 643,072 | `6f2ad46398be2336` | 20070129002024 |
| DinarSoftMemMaid172.CAB | 1.72 | 508,734 | `4103d7945fe40020` | 20070129001847 |
| DinarSoftMemMaid_en.CAB | 2.3 b230 EN | 989,440 | `5db295336fdc912e` | 20170902151714 |
| DinarSoftMemMaid_en_Setup.exe | 2.3 b230 EN | 461,312 | `f43515caab0d1297` | 20170902151903 |
| DinarSoftMemMaid.CAB | 2.3 b230 multi | 1,303,812 | `0f2b92154e955a0e` | 20170902151816 |
| DinarSoftMemMaid_Setup.exe | 2.3 b230 multi | 539,136 | `3f2babff01895d89` | 20170902151908 |
| DinarSoftMemMaid_1_73.CAB | 1.73 | 454,630 | `b3c914255cf18a7a` | 20170902151858 |
| DinarSoftMemMaid_1_73_Setup.exe | 1.73 | 264,704 | `58e28b0243c22ecd` | 20170902151913 |
| CHIP-2006-06_DinarSoftMemMaidPG15a.exe | 1.5a | 524,288 | `bd01d928d4738eb5` | archive.org chip-dvd-ru-2006-06 |
| DinarSoftHandySwitcher27.exe | 2.7 | 163,328 | `ec094f4e83b8ad82` | 20070306075025 |
| DinarSoftHandySwitcher27_20061223.exe | 2.7 | 270,336 | `b1d6c761478c182b` | 20061223074350 |
| CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe | 3.1 first build | 207,360 | `2f947f7d1d914a11` | archive.org chip-dvd-ru-2008-06 |
| DinarSoftHandySwitcher_Demo.CAB | 3.1 b78 | 252,489 | `d7f2b1caada19d02` | 20090301222736 |
| DinarSoftHandySwitcher_Setup.exe | 3.1 b78 | 207,872 | `92fcc8093362e390` | 20090301222741 |
| DinarSoftHandyMenu36.CAB | 3.6 | 213,014 | `8f58a741ffe34658` | 20061223230453 |
| DinarSoftHandyMenu.CAB | 3.7 b40 | 195,112 | `2162029f1d2c81c4` | 20101218111541 |
| DinarSoftHandyMenu_Setup.exe | 3.7 b40 | 201,728 | `b01af14ffeefe405` | 20101218111333 |
| DinarSoftHandyLauncher34.CAB | 3.4 | 105,402 | `1f7be507d2dccfd0` | 20061222045948 |
| DinarSoftHandyLauncher34.exe | 3.4 | 208,896 | `431dbe604331b81c` | 20061216210743 |
| DinarSoftHandyLauncher34_Setup.exe | 3.4 | 156,672 | `3224c50bbe726873` | 20070713235349 |
| DinarSoftTapText13.CAB | 1.3 | 182,869 | `38dcaf0b243094b5` | 20070117073946 |
| DinarSoftTapText13.exe | 1.3 | 286,720 | `fb8bdfede6795ac2` | 20061229072411 |
| DinarSoftHijriDate15.CAB | 1.5 | 190,841 | `5c0e955b80c01e6f` | 20070116214648 |
| DinarSoftHijriDate15.exe | 1.5 | 352,256 | `91611e8cd8faba5d` | 20061224171150 |

Wayback URL for each: `https://web.archive.org/web/<capture>/<original_url>` (both fields in `downloads.json`). Verify: `cd downloads && shasum -a 256 -c ../SHA256SUMS`.

## 2. Manuals (from inside the CABs)

| File | What |
|---|---|
| `manuals/memmaid-1.5a-help.htm` | MemMaid in-app help, 1.5a (33 KB) |
| `manuals/memmaid-1.72-help.htm` | MemMaid help, 1.72 (identical in 1.73) |
| `manuals/memmaid-2.3-help.htm` | MemMaid 2.x help (titled "MemMaid 2.0 Help"; about 30 topics, from Quick Cleaner to CPU Usage) |
| `manuals/handyswitcher-3.1-help.htm` | HandySwitcher 3.1 help |
| `manuals/handymenu-3.6-languages.ini` | HandyMenu UI strings in English, German, Dutch, Portuguese, Spanish (same in 3.7) |
| `manuals/*.png` | The help pages' images (annotated screen diagrams) and in-app toolbar strips, converted from BMP |

The HTML files are saved byte for byte from the CABs. No readme or separate PDF manual exists in any installer or in the CDX index.

## 3. DinarSoft's own site (`site/`)

| Kind | Files | Bytes |
|---|---|---|
| HTML pages | 203 | 3,370,983 |
| Images | 227 | 2,636,031 |
| GITEX photos (`site/gitex/`) | 30 | 8,581,868 |
| CSS | 5 | 19,074 |
| JS | 4 | 43,046 |

- Coverage: every URL in the CDX index with at least one HTTP 200 capture, minus junk (search-spam URLs, 2019 random-prefix redirects, the web host's parking page). Home page, 6 product sections (summary, details, download, purchase, awards, reviews, revision history, support), products, eStore, support (FAQ, unlock key, upgrade policy, forums), company (about, partners), contact, **31 press releases** (`site/news/`), 3 newsletters (2007), the GITEX 2006 trip report, and 52 Joomla print views (`index2.php@…`).
- Best snapshot per page: the last 200 capture up to 2008-12-31 (DinarSoft's final content), else the first one after. Images: the first 200 capture (each image has one digest).
- Earlier designs are kept beside the best copy as `name~<timestamp>.html`: the home page in 2005-11, 2006-08, 2006-12, 2007-06, 2007-08, and the 2006 frames pages (`home~`, `topFrame~`, `menu~`).
- File names: `?` became `@` and `.html` was added to query URLs (`index.php@option=….html`). Case clashes on macOS got a `~timestamp` suffix (`images/hm~20160712211858.gif` next to `images/HM.gif`). `layout~20150131035728.css` is a second, slightly different version of `layout.css`.
- Site history from the index: 2003-08 to 2005-03 the domain showed the web host's "Under Construction" parking page (DinarSoft's web address in 2003 listings is its PocketGear page). 2005-11 frames site. **2006-11-15 relaunch** on Joomla with the new logo and a Handango-powered store. Content frozen after 2008-11. **2009-08-03 the domain had briefly expired** (registrar parking page), then came back until 2019. HugeDomains by 2022.

## 4. Third-party copies

- `chip/`: CHIP magazine (Russia) cover-disc pages for MemMaid 1.6 (06/2006), HandySwitcher 2.7 (05/2007), HandySwitcher 3.1 (06/2008), MemMaid 2.3 (09/2008), with their screenshots, fetched file by file from inside the archive.org ISO items (no full ISO download). `chip/render/` holds UTF-8 copies used for the captures.
- Award badges (`site/images/awards/`), review-site logos (`site/images/reviews/`) and partner logos are on DinarSoft's site but belong to the magazines and sites.

## 5. Captures (`captures/`)

**161 PNG files, 84.2 MB: 28 DinarSoft full pages, 51 third-party full pages, 82 tight crops.** `captures/manifest.json` has one entry per file: file, kind (full page / crop), what it shows, owner, original URL, Wayback URL and timestamp, privacy note, and the assets that never loaded. `captures/.boxes/` holds the element boxes each crop was cut from (used by `scripts/crop_offline.py`).

| Group | Pages | What |
|---|---|---|
| DinarSoft (`ds-*`) | 28 | Home page in 6 states (May 2006 frames site, Oct 2006, Dec 2006 relaunch, Jun 2007, Aug 2007, Dec 2008); products; 6 product pages; 5 awards pages; MemMaid reviews and download; press index; 3 press releases (logo change, Best Software 2007, MemMaid 2.0); about; GITEX; eStore. Rendered from the local mirror, so no archive requests and nothing from the squatted live domain |
| Magazine award lists (`tp-*-ppcmag-nominations`, `tp-*-smartphonemag-winners*`) | 9 | *Pocket PC Magazine* / *Smartphone & Pocket PC* nominations 2003 to 2007 and winners 2005 to 2008. One crop per DinarSoft product, showing the Nominee / Finalist / Winner label where the page has one |
| Reviews | 38 | Every review in career.md §1.3 table A with a Wayback copy, plus GadgetMix (HandyMenu, HandySwitcher, MemMaid), MyPDACafe, Just Another Mobile Monday (MemMaid 2.0 vs SKTools), Pocketland DE/FR/IT, the TreoCentral shoot-out (2006 copy), Windows Central (2024 copy with the full text and "Ratings (5 out of 5)"), and a Pocket PC Thoughts news item that sends readers to DinarSoft's GITEX photos. Crops: headline, plus the rating or verdict where the page has one |
| CHIP Russia (`tp-chip-*`) | 4 | The cover-disc pages for MemMaid 1.6, HandySwitcher 2.7, HandySwitcher 3.1, MemMaid 2.3 |

Notes: third-party pages load in the Wayback `if_` form (no toolbar). To keep under the archive's rate limit, scripts, ads, images from other sites and images beyond the 80th per page were not loaded (`images_skipped` in the manifest), so some ad slots are blank and archived Flash banners show a "Flash Player is no longer supported" box. Not captured: the 2008 winners page 1 (no DinarSoft entry); the Gadgeteer 2025 URL (the 2007 copy is used).

## 6. Missing

| Item | Why |
|---|---|
| Every installer before 2006 (MemMaid 1.0 to 1.5, HandySwitcher 1.0 to 2.5, HandyMenu 1.0 to 3.0, HandyLauncher 1.0 to 3.3, TapText 1.0 to 1.2, HijriDate 1.0 to 1.2) | dinarsoft.com was a parking page until late 2005; sales went through Handango and PocketGear, whose download files were not archived |
| MemMaid 1.61, 2.0, 2.1, 2.2; HandySwitcher 3.0 | Never captured (download URLs were reused for newer builds) |
| HandySwitcher 2.7 standalone CAB | Only redirects archived (the CAB is still inside both 2.7 EXEs) |
| HandyMenu 3.6 desktop installer | Not archived |
| TapText 1.3 2008 rebuild (download page lists Setup 178.00 KB and CAB 177.58 KB) and HijriDate desktop setup in the 2008 format | `downloadtrial.php?p=tt` and `p=hd` were never captured |
| MemMaid 1.72 beta (`DinarSoftMemMaid172Beta.CAB/.exe`) | Only redirects archived |
| Frames-site header art (`images/green_01.gif` to `green_14.gif`) | Never captured. The pre-November-2006 logo itself survives inside HijriDate 1.5 and MemMaid 1.5a and 1.72 (BRAND.md §1) |
| `templates/dinarsoft/css/color.css` | Only 404s archived |
| MemMaid screenshots `m3.gif`, `m4.gif`, `m6.gif`, `screenshots/MemMaid172-a.gif`, `images/F2005.jpg`, `images/icons/logo.png` (60×60 logo in the logo-change release), `hs_title_c.gif`, `read_btn.gif`, `hgbuy.gif`, `pgbuy.jpg` | Not archived, or only 302/404 |
| Press kit page `/press/images.html` and any vector logo | Not archived |
| Handango Champion 2006 / Best of 2007, PocketGear Editor's Choice, Softonic, Foxpop, Clinton Fitch Top-10 award pages | Not archived (Handango pages are Flash); only DinarSoft's badges and press releases survive |
| Reviews on PDAOnline.ru, AximUsers, GirlsGoneMobile, Pocketland NL | No Wayback capture |

## 7. Privacy (blur before publishing)

| Where | What |
|---|---|
| `site/contact.html`, `site/company/about.html`, `site/contact/enterprise.html`, 2 Joomla print views (`index2.php@…id=61…`, `…id=62…`), 3 newsletters | Street address (redacted here) |
| `site/contact.html`, `site/company/about.html` | Phone and fax numbers (redacted here) |
| `site/gitex/flame12*.jpg`, `flame13*.jpg` | DinarSoft business card: the same address, phone, fax and an email |
| `captures/ds-2008-company-about.png` | Address, phone and fax (flagged in `manifest.json`) |
| `captures/tp-2003/2004/2005-ppcmag-nominations*.png`, `tp-2004-04-pocketpclife-*.png` | Email `[company address on a free provider, redacted]` (company address on a free provider; blur optional) |
| Full-page magazine award lists 2003 to 2007 | Other developers' contact emails, as the magazine published them (the crops show only DinarSoft) |

Business addresses `support@dinarsoft.com` and `sales@dinarsoft.com` appear on several pages; they are professional. Yasser Awad's name appears as the author of press releases; no personal email or photo of a person was found.

## 8. Corrections to `research/career.md`

- The logo change was announced **2006-11-01** (release text), not 2007 (the capture date).
- HijriDate 1.5's files are dated **2005-02-04**, so the "5 March 2005" release date is correct, not a typo for 2006.
- HandyMenu has a **3.7 (Build 40)** release from June 2008 with Windows Mobile 6 support; the revision history stops at 3.6.
- The "2.x" MemMaid files are **2.3 Build 230**; the HandySwitcher "3.x" files are **3.1 Build 78**.
- A **MemMaid 1.5a** build (March 2006) survives on CHIP's disc.

## 9. How to reproduce

All scripts are in `scripts/` and read untrusted data only as data (`python3 -I`, nothing in `downloads/` is ever run).

```
python3 -I scripts/installers.py          # 21 + 7 Wayback payloads -> downloads/, downloads.json
python3 -I scripts/chip.py                # 4 files from CHIP ISOs on archive.org (2 kept)
python3 -I scripts/site.py                # site mirror from cdx/cdx_full.json (incl. earlier designs) -> site/, site.json
uv run -q --with playwright python -I scripts/capture.py scripts/pages_dinarsoft.json
uv run -q --with playwright python -I scripts/capture.py scripts/pages_thirdparty.json
uv run -q --with pillow python -I scripts/crop_offline.py scripts/crops_offline.json   # verdict/rating crops
uv run -q --with playwright python -I scripts/contact_sheet.py <tmpdir>
```

`wb.py` holds the shared fetcher: at most 2 requests at a time with backoff. `capture.py` also spaces requests 4 s apart and waits out IP blocks (the archive blocked this machine twice during the run). Installer contents were inspected with `7zz l` / `7zz x` and `upx -d` on scratch copies outside this folder.

## 10. Open questions

1. Does the family hold any original DinarSoft files (vector logo, source code, full-version builds, unlock keys)? Every archived installer is a 15-day trial that needs a 16-letter unlock key, and no key or registered build is in the archive. `RELEASE.md` (the freeware decision) allows publishing keys; the key method itself has not been analyzed yet.
2. Answered: the pre-November-2006 logo was different (DiNAR with a globe, and an Arabic دينار), recovered from inside HijriDate 1.5 and MemMaid 1.5a (BRAND.md §1).
3. The GITEX 2006 photos (`site/gitex/`) are DinarSoft's own, watermarked; who took them (Yasser?), for the caption?
4. HandyMenu 3.7 Build 40 (June 2008) has no release note; is there a changelog anywhere?

