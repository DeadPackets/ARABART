# Yasser Awad: career after the DOS years (1993 to 2008)

Research date: 2026-10-22. Scope: Dinarsoft, the two patents, Sakhr, Alcatel 5620 and JIDM, the 1993 competition.

**Evidence marks**

| Mark | Meaning |
|---|---|
| **[V]** | Verified. I read a primary source (the company's own site, the patent office record, the standards body). |
| **[C]** | Corroborated. An independent secondary source agrees, or a primary source supports it only by inference. |
| **[U]** | Unverified. Only the family's account, or I found no public source. |

Method and rules kept: web search (English and Arabic), Wayback Machine CDX index and snapshots, Google Patents, archive.org metadata API, `gh` search. I downloaded no executable, disk image or archive. For binaries I sent HTTP `HEAD` requests only, to read the byte size. I read three patent PDFs and six screenshots (images only). I did not log in, submit forms or contact anyone. I left out home addresses and phone numbers that appear on the old Dinarsoft pages.

---

## TL;DR

- **Dinarsoft is found, tied to him, and its products won awards.** DinarSoft Corporation, Kanata, Ontario, founded November 2002, sold 6 Pocket PC / Windows Mobile utilities from 2003 to 2008, and seven of its press releases name "Yasser Awad" as author [V]. *Smartphone & Pocket PC* magazine (not *PC Magazine*) named **HandySwitcher best Task Manager in 2007 and 2008 and TapText best Misc. Utility in 2007**, from 22 nominations in 2003 to 2008 [V]. About 20 independent sites reviewed the programs [V]. Trial installers survive on the Wayback Machine (21 files). No browser emulator runs them, so the plan is a video, screenshots and a web re-creation.
- **Patents.** US 2006/0288020 A1 was granted as **US 7,603,377 B2** (2009-10-13) and lapsed in 2021 for an unpaid maintenance fee. US 2007/0130192 A1 was **abandoned**, and its EP twin was withdrawn [V]. US patent text and drawings are "typically not subject to copyright restrictions" [V], so the museum can reproduce them and build an interactive explainer.
- **Sakhr, Alcatel and the competition are only partly documented.** Sakhr's own 1997 to 1999 web pages describe Al-Ustaz 8.0 and the Arabic office suite, with Windows 3.x screenshots [V], but no public source names him. A Gartner 2003 report confirms the "5620 CORBA OSSI" [C]. I found no public JIDM, OMG or ITU document that names him, and no source for the 1993 PC Middle East competition [U]. **Gotcha: Alcatel-Lucent did not exist until 30 Nov / 1 Dec 2006. In 1996 the Kanata employer was most likely Newbridge Networks, and from 2000 it was Alcatel.** **Confirmed by his son (2026-10-22): he joined Newbridge Networks before Alcatel acquired it. Label the era "Newbridge Networks → Alcatel, Kanata, 1996 to 2006".**

---

## 0. Identity and disambiguation

| Clue | Value | Source | Mark |
|---|---|---|---|
| Patent inventor "Yasser Awad", assignee Alcatel | Residence printed as Ottawa (CA) on US 2006/0288020 and Kanata (CA) on US 2007/0130192 | Patent PDFs [P3], [P9] | [V] |
| Dinarsoft HQ | Kanata, Ontario, Canada | Dinarsoft About page [S1] | [V] |
| Dinarsoft press-release author | "Yasser Awad" (HTML meta author on 7 releases, 2006 to 2007) | [S2], [S3], [S21] to [S24] | [V] |
| Arabic product | HijriDate shows Hijri dates in Arabic on Windows Mobile | [S19], [S33] | [V] |
| Google Patents inventor query "Yasser Awad" | 3 results, all in the two Alcatel families above | [P14] | [V] |

Same city (Kanata/Ottawa), same years (2002 to 2008), same field (software), and an Arabic-language product. I am confident that the Dinarsoft "Yasser Awad" is the Alcatel inventor [C].

People I excluded:

- Yasser Al-Awadi is a Yemeni politician [X1].
- Yasser Ali is an Egyptian government official, appointed in 2013 [X2].
- Yasser Ali Mohamed is an Egyptian poet born in 1977 [X3].
- Yasser Albaz was named in an Ottawa news search result. He is a different person, and I did not follow that result.

I found no public source for the early signature "Yasser Mohamed Ali" outside the family's own DOS files [U].

---

## 1. Dinarsoft (DinarSoft Corporation)

### 1.1 Company facts

| Fact | Value | Source | Mark |
|---|---|---|---|
| Legal name | DinarSoft Corporation ("Copyrights 2006 DinarSoft Corporation") | [S1] | [V] |
| Founded | "privately-held corporation founded in November 2002" | [S1] | [V] (self-claim) |
| Location | "headquarters in silicon valley north (Kanata/Canada)" | [S1] | [V] |
| Focus | "software provider for the Windows Mobile platform … products for the PocketPC platform" | [S1] | [V] |
| Named people | Yasser Awad (meta author of press releases). No other person is named on the site. | [S2], [S3] | [V] |
| Domain | dinarsoft.com, registered 2003-07-30 (RDAP). Registrar is now NameBright (HugeDomains). | [S31] | [V] |
| First web capture | 2003-08-05, "This Site is Under Construction" | [S28] | [V] |
| Site relaunch | 2006-11-15, Joomla site with an online store "powered by Handango" | [S36] | [V] |
| Last product news | MemMaid 2.3, 2008-06-16 | [S9] | [V] |
| Last live capture | 2019-08-02 (same 6 products) | [S29] | [V] |
| Domain for sale | By 2022-02-23, a HugeDomains page, $10,095 | [S30] | [V] |
| Support forum | Hosted at AximSite.com | [S37] | [V] |
| Registry status (federal/Ontario) | Not found by web search. The registries need a form search, which my rules do not allow. | — | [U] |
| GitHub / app stores | `gh` search for "dinarsoft" and "memmaid": 0 users, 0 repositories. No App Store, Google Play or Windows Phone listing found. | `gh api search/*` | [V] (negative) |
| Third-party catalogs | Archive.org search hits for MemMaid and HandySwitcher are only Russian CHIP magazine cover discs (2006 to 2008). I did not open those discs. | archive.org search | [C] |

### 1.2 Product catalog

All six products ran on Pocket PC 2002, Windows Mobile 2003/SE and Windows Mobile 5. MemMaid 2.x and HandySwitcher 3.x added Windows Mobile 6. All were shareware: a 15-day trial, then a 16-letter unlock key [S6], [S34].

| Product | First release → last version | Platform | 2006 price | What it does | Trial binaries public? | Emulation path | Legal note |
|---|---|---|---|---|---|---|---|
| **MemMaid** | 1.0, 2003-06-16 → 2.3, 2008-06-16 [S7], [S9] | PPC 2002 (v1.73), WM 2003/5/6 (v2.x), ARM CAB plus desktop installer | $14.99 [S6] | Memory and system cleaner: 19 to 25+ cleaners, Reclaim RAM, startup and services manager, DLL optimizer, registry editor (2.0), multilingual UI (2.1) [S6], [S36], [S38] | Yes, 8 files (table 1.4) | Microsoft Device Emulator video, archived screenshots (m1/m2/m5.gif) | © DinarSoft Corp. The trial expires after 15 days. |
| **HandySwitcher** | 1.0, 2003-09-11 → 3.1, 2008-04-13 [S11], [S12] | WM 2003/5/6 | $7.99 [S10] | Task switcher: an [X] button that really closes programs, close all, hardware-key support, skins (3.0) | Yes, 3 files | Same as MemMaid | Same |
| **HandyMenu** | 1.0, 2003-07-06 → 3.6, 2006-03-06 [S14] | PPC 2002, WM 2003/5 | $5.99 [S13]. TreoCentral (June 2006) calls it a "free download" [S26]. | Tray menu: power off, soft/hard reset, screen capture, IP helper, screen rotation. UI in EN/DE/NL/PT/ES. | Yes, 3 files | Same | Same |
| **HandyLauncher** | 1.0, 2003-08-23 → 3.4, 2006-03-15 [S16] | PPC 2002, WM 2003/5 | $5.49 [S15] | Tray launcher for programs and documents, with screen orientation per shortcut | Yes, 3 files | Same | Same |
| **TapText** | 1.0, 2005-03-07 → 1.3, 2006-02-27 [S18] | WM 2003/5 | $9.99 [S17] | Inserts saved text snippets and date stamps into any program in two taps | Yes, 2 files | Same | Same |
| **HijriDate** (Today plugin) | 1.0, 2003-06-27 → 1.5 [S20] | PPC 2002, WM 2003/5 | $2.99 [S19] | "first light-weight today plugin" with the Hijri and Gregorian dates in Arabic or English, Mecca-based calculation, crescent adjustment [S19] | Yes, 2 files | Same, plus a web re-creation (section 6) | Same |

Date quirk: the HijriDate page dates v1.5 ("Windows Mobile 5 support") to 5 March 2005. Windows Mobile 5 shipped later in 2005, so the year is probably a typo for 2006 [U].

Awards and reviews are in section 1.3.

### 1.3 DinarSoft press and awards

Marks in this section: **[V]** I read the primary page (the magazine's own list, the review itself). **[C]** only DinarSoft's own claim, or an indirect listing. **[U]** not found or not archived.

**Correction first: the awards come from *Pocket PC Magazine*, not *PC Magazine*.** Every magazine badge on dinarsoft.com links to ppcmag.com. That is *Pocket PC Magazine*, later *Smartphone & Pocket PC* magazine, published by Thaddeus Computing, Fairfield, Iowa [V, M9]. It "ran these awards for 8 years, from 2001-2008" [V, M8]. I found no DinarSoft coverage in Ziff Davis *PC Magazine* / PCMag.com (web search). I also found none in 8 scanned issues of the Arabic *PC Magazine Middle East* (Jun 2006 to Mar 2009, archive.org), but their OCR text is Arabic only, so an English product name would not show. That check is weak [U].

**Totals from the magazine's own lists, 2003 to 2008 [V]: 22 nominations, 3 category wins, and 6 more finalist places.** MemMaid was a finalist 4 years running (2005 to 2008). HandySwitcher won Task Managers twice (2007, 2008).

#### A. Independent sources that I read (sorted by date)

| Date | Outlet | Exact title (author) | Product | What it says | URL: original → Wayback | Mark |
|---|---|---|---|---|---|---|
| 2003 (captured 2003-11-21) | *Pocket PC Magazine* | "Nominations: Best Software Awards 2003", Utilities | HandyMenu | Nominee, Today-screen Plug-in | http://www.pocketpcmag.com/Awards/category.asp?catid=45 → https://web.archive.org/web/20031121173312/http://www.pocketpcmag.com/Awards/category.asp?catid=45 | [V] |
| 2004-04-16 | Pocket PC Life (eMobile, UK) | "HandyMenu V.2.0 Reviewed" (Tim Hillebrand) | HandyMenu 2.0 | 5 of 5 stars | http://www.pocketpclife.co.uk/featureddetails.asp?article=508 → https://web.archive.org/web/20040525130844/http://www.pocketpclife.co.uk/featureddetails.asp?article=508 | [V] |
| 2004-04-17 | Pocket PC Life | "Handy Switcher V 2.0 Reviewed" (Tim Hillebrand) | HandySwitcher 2.0 | 4 of 5 stars | http://www.pocketpclife.co.uk/featureddetails.asp?article=509 → https://web.archive.org/web/20040926050629/http://www.pocketpclife.co.uk/featureddetails.asp?article=509 | [V] |
| 2004-07-01 | Geekzone (NZ) | "MemMaid for Pocket PC review" (M Freitas) | MemMaid | "a nice well polished tool" | http://www.geekzone.co.nz/content.asp?contentid=2977 → https://web.archive.org/web/20040804041154/http://www.geekzone.co.nz/content.asp?contentid=2977 | [V] |
| 2004-07-17 | Geekzone | "HandyMenu review" (M Freitas) | HandyMenu | "access to any of these functions just a tap away" | http://www.geekzone.co.nz/content.asp?contentid=3052 → https://web.archive.org/web/20040803112847/http://www.geekzone.co.nz/content.asp?contentid=3052 | [V] |
| 2004-07-23 | Pocket PC Dubai (UAE) | "MemMaid Review" (Mabini) | MemMaid 1.2 | "MemMaid Version 1.2 that finally ended my search" | http://www.pocketpcdubai.com/DinarSoft/memmaid_review.html → https://web.archive.org/web/20040806143825/http://www.pocketpcdubai.com/DinarSoft/memmaid_review.html | [V] |
| 2004 (captured 2004-08-10) | *Pocket PC Magazine* | "Nominations: Best Software Awards 2004", Utilities | MemMaid, HandyMenu, HandySwitcher | Nominees: System and Registry (MemMaid, HandyMenu); Task Management (HandySwitcher) | http://www.pocketpcmag.com/awards/category_2004.asp?catid=45 → https://web.archive.org/web/20040810215241/http://www.pocketpcmag.com/awards/category_2004.asp?catid=45 | [V] |
| 2004-09-08 | Pocket PC Thoughts | "All Tapped Out? DinarSoft's HandyMenu v2.5 Reviewed" (Doug Raeburn) | HandyMenu 2.5 | "A steal at $5.99!" | http://www.pocketpcthoughts.com/forums/viewtopic.php?t=31227 → https://web.archive.org/web/20050309212034/http://www.pocketpcthoughts.com/forums/viewtopic.php?t=31227 | [V] |
| 2004-09-09 | eMobie | "Dinar Soft's MemMaid Reviewed" (Russ Terrell) | MemMaid 1.3 | 5 of 5 stars. "the Swiss Army Knife of PPC utilities" | http://www.emobie.com/featureddetails.asp?article=589 → https://web.archive.org/web/20041221174606/http://www.emobie.com/featureddetails.asp?article=589 | [V] |
| 2004-11-04 | PocketPC Reviews | "MemMaid 1.3 from DinarSoft" | MemMaid 1.3 | "MemMaid is a godsend!" | http://www.pocketpcreviews.net/reviews/112004/memmaid.htm → https://web.archive.org/web/20041109070117/http://www.pocketpcreviews.net/reviews/112004/memmaid.htm | [V] |
| 2005-01-07 | Pocketnow | "Dinarsoft's MemMaid v1.4" (Tim Adams, Contributing Editor) | MemMaid 1.4 | "it certainly has found a place in my must-have list" | http://www.pocketnow.com/index.php?a=portal_detail&t=reviews&id=547 → https://web.archive.org/web/20050207042826/http://www.pocketnow.com/index.php?a=portal_detail&t=reviews&id=547 | [V] |
| 2005-03-07 | AximSite | "Tap Text" (Jim McGowan, staff review) | TapText | 4 of 5 stars | http://www.aximsite.com/articles/link.php?id=228 → https://web.archive.org/web/20050307020422/http://www.aximsite.com/articles/link.php?id=228 | [V] |
| 2005-04-29 | Pocket PC Thoughts | "DinarSoft TapText 1.0: Repetitive Text Entry is Less Repetitive" (John Walkosak) | TapText 1.0 | Pros: "Easy to use; Clean Interface; Easy to Customize; Good Price." | http://www.pocketpcthoughts.com/forums/viewtopic.php?t=38753 → https://web.archive.org/web/20050430072152/http://www.pocketpcthoughts.com/forums/viewtopic.php?t=38753 | [V] |
| 2005-06-15 | PDA247 | "MemMaid" (Neil Brown) | MemMaid | "Gives control over nearly every aspect of memory management" | http://www.clieuk.co.uk/memmaid.shtml → https://web.archive.org/web/20060406134223/http://www.clieuk.co.uk/memmaid.shtml | [V] |
| 2005 (captured 2005-11-05) | *Pocket PC Magazine* | "Nominations: Best Software Awards 2005", Utilities | MemMaid, TapText, HandyMenu, HandySwitcher | Nominees: Maintenance; Soft Keyboards; System and Registry; Task Management | http://pocketpcmag.com/awards/category_2005.asp?catid=45 → https://web.archive.org/web/20051105095814/http://pocketpcmag.com/awards/category_2005.asp?catid=45 | [V] |
| 2005 | *Smartphone & Pocket PC* | "Best Software Awards 2005 … Winners and Finalists" | MemMaid | **Finalist**, Utilities: Maintenance | http://www.smartphonemag.com/awards/winners_ppc_2005.html → https://web.archive.org/web/20110716095947/http://www.smartphonemag.com/awards/winners_ppc_2005.html | [V] |
| 2006-03-27 | pdaBlast / Treo Blast | "HandySwitcher Task Management for Your Pocket PC" (pdaBlast! Staff) | HandySwitcher | Staff review | http://treo.pdablast.com/articles/2006/3/2006327-HandySwitcher-Task-Management-for.html → https://web.archive.org/web/20060418020419/http://treo.pdablast.com/articles/2006/3/2006327-HandySwitcher-Task-Management-for.html | [V] |
| 2006-06 | *CHIP* DVD 06/2006 (Russia) | Cover-disc contents list | MemMaid 1.6 | Included on the magazine disc | https://archive.org/details/chip-dvd-ru-2006-06 | [C] (archive.org description; disc not opened) |
| 2006-06-19 | TreoCentral | "Task Manager Shoot-Out for the 700W" (Tim Hillebrand) | HandySwitcher, HandyLauncher, HandyMenu | Compared with rival task managers | https://treocentral.com/content/Stories/839-2.htm (live) | [V] |
| 2006-07-30 | Just Another Mobile Monday | "Review - Short Take on MemMaid 1.72" (PatrickJ) | MemMaid 1.72 | Short review | http://justanothermobilemonday.com/Wordpress/2006/07/30/review-short-take-on-memmaid-172/ → https://web.archive.org/web/20061101030035/http://justanothermobilemonday.com/Wordpress/2006/07/30/review-short-take-on-memmaid-172/ | [V] |
| 2006-08-02 | Pocket PC Thoughts | "Speed Up Text Entry With TapText" (Brad Adrian) | TapText | "TapText is quickly becoming a utility that I can't live without" | http://www.pocketpcthoughts.com/forums/viewtopic.php?t=49767 → https://web.archive.org/web/20061118233130/http://www.pocketpcthoughts.com/forums/viewtopic.php?t=49767 | [V] |
| 2006 (captured 2006-09-01) | *Pocket PC Magazine* | 2006 nominations, Utilities | MemMaid, TapText, HandyMenu, HandySwitcher | Nominees: Maintenance; Soft Keyboards; System and Registry; Task Management | http://www.pocketpcmag.com/awards/category_2006.asp?catid=45 → https://web.archive.org/web/20060901003358/http://www.pocketpcmag.com/awards/category_2006.asp?catid=45 | [V] |
| 2006-09-11 | Tucows | "Shareware Spotlight – SmartPhone Software – MemMaid" (Michael E. Callahan, "Dr. File Finder") | MemMaid 1.72 | "If you have a PDA or smartphone this is a program you must have." | http://www.tucows.com/article/1127 → https://web.archive.org/web/20060917031341/http://www.tucows.com/article/1127 | [V] |
| 2006 (results Oct 2006) | *Smartphone & Pocket PC* | "Best Software Awards 2006 Winners, Finalists, and Nominees" | MemMaid (+3 nominees) | **Finalist**, Maintenance | http://www.smartphonemag.com/awards/winners_ppc_2006.html → https://web.archive.org/web/20111005155856/http://www.smartphonemag.com/awards/winners_ppc_2006.html | [V] |
| 2006-10-30 | Tucows | "Favorite - MemMaid" (Dr. File Finder Favorites) | MemMaid | Named a "Dr. File Finder Favorite" | http://www.tucows.com/article/1128 → https://web.archive.org/web/20071212153437/http://www.tucows.com/article/1128 | [V] |
| 2007-01-09 | Pocketland.es (also .net, .de) | "El orden que debe reinar" (EN: "MemMaid Cleans House") | MemMaid | Review in Spanish, English and German | http://pocketland.es/showstory.php?id=335&index=1 → https://web.archive.org/web/20080204015352/http://pocketland.es/showstory.php?id=335&index=1 ; EN https://web.archive.org/web/20120301210538/http://www.pocketland.net/showstory.php?id=329&index=1 | [V] |
| 2007 (captured 2007-01-28) | Technology at Play | "MemMaid by Dinarsoft" | MemMaid | "MemMaid is an extremely handy program for the Pocket PC." | http://www.technologyatplay.com/main/tap/reviews/memmaid/review-memmaid.asp → https://web.archive.org/web/20070128232324/http://www.technologyatplay.com/main/tap/reviews/memmaid/review-memmaid.asp | [V] |
| 2007 (captured 2007-04 to 07) | GadgetMix | "Dinarysoft HandySwitcher Reviewed!", "Dinarsoft Memmaid Reviewed!", "HandyMenu Reviewed!", "Dinarsoft HandySwitcher 3 Reviewed!" | 3 products | HandySwitcher 3: "simple-yet-powerful application" | http://www.gadgetmix.com/reviews/hswitcher3/handyswitcher3.htm → https://web.archive.org/web/20070627171617/http://www.gadgetmix.com/reviews/hswitcher3/handyswitcher3.htm | [V] |
| 2007 (captured 2007-05-19) | ClintonFitch.com | "Review of DinarSoft's MemMaid by Judie Hughes on Clinton Fitch (Dot) Com!" | MemMaid 1.73 | "The cleaning feature alone would make MemMaid a must have application" | http://www.clintonfitch.com/reviews/dinarsoft/memmaid/default.asp → https://web.archive.org/web/20070519052643/http://www.clintonfitch.com/reviews/dinarsoft/memmaid/default.asp | [V] |
| 2007-05 | *CHIP* DVD 05/2007 (Russia) | Cover-disc contents list | HandySwitcher 2.7 | Included on the disc | https://archive.org/details/chip-dvd-ru-2007-05 | [C] |
| 2007-07-11 | Mobile-View | "DinarSoft's MemMaid 2.0 Reviewed!" (Allistair Lee) | MemMaid 2.0 | "Definitely deserves a 10/10 rating!" | http://mobile-view.org/index.php?option=com_content&task=view&id=63&Itemid=1 → https://web.archive.org/web/20071013202109/http://mobile-view.org/index.php?option=com_content&task=view&id=63&Itemid=1 | [V] |
| 2007-08-23 | The Gadgeteer | "DinarSoft TapText - Windows Mobile Utility" (Kent Lanum) | TapText | "I really cannot see any problems with DinarSoft's TapText" | https://the-gadgeteer.com/2007/08/23/dinarsoft_taptext_windows_mobile_utility/ → https://web.archive.org/web/20070911045854/http://the-gadgeteer.com/review/dinarsoft_taptext_windows_mobile_utility | [V] |
| 2007-09-12 | Eten Blog dot Com | "Spring Cleaning With DinarSoft's MemMaid" (Tariq Bamadhaj) | MemMaid | "MemMaid fills a gap left by Microsoft in the memory management department" | http://www.etenblog.com/2007/09/12/spring-cleaning-with-dinarsofts-memmaid/ → https://web.archive.org/web/20071203204158/http://www.etenblog.com/2007/09/12/spring-cleaning-with-dinarsofts-memmaid/ | [V] |
| 2007 (captured 2007-10-12) | AximSite | "MemMaid 2.0" (Bryan Eley) | MemMaid 2.0 (build 95) | "Rating: 5 out of 5" | http://www.aximsite.com/boards/vbarticles.php?do=article&articleid=423 → https://web.archive.org/web/20071012112936/http://www.aximsite.com/boards/vbarticles.php?do=article&articleid=423 | [V] |
| 2007 (results Nov 2007) | *Smartphone & Pocket PC* | "Best Software Awards 2007 Pocket PC Nominees, Finalists and Winners" | 5 products | **Winner**: TapText (Misc. Utilities), HandySwitcher (Task Managers). **Finalist**: MemMaid (Multifunction Maintenance Tools). Nominees: HandyMenu, HandyLauncher | http://www.smartphonemag.com/awards/winners_ppc_2007.html → https://web.archive.org/web/20111009044045/http://www.smartphonemag.com/awards/winners_ppc_2007.html ; nominations: https://web.archive.org/web/20070901005121/http://www.pocketpcmag.com/awards_2007/category.asp?catid=45 | [V] |
| 2007-12-12 | Eten Blog dot Com | "TapText Data With Ease" (Tariq Bamadhaj) | TapText | "a great text-entering application but it's not for everyone" | http://www.etenblog.com/2007/12/12/dinarsoft-taptext/ → https://web.archive.org/web/20071213193925/http://www.etenblog.com/2007/12/12/dinarsoft-taptext/ | [V] |
| 2008-06 | *CHIP* DVD and CD 06/2008 (Russia) | Cover-disc contents list | HandySwitcher 3.1 | Included on the discs | https://archive.org/details/chip-dvd-ru-2008-06 · https://archive.org/details/chip-2008-06_202502 | [C] |
| 2008-09 | *CHIP* DVD 09/2008 (Russia) | Cover-disc contents list | MemMaid 2.3 | Included on the disc | https://archive.org/details/chip-dvd-ru-2008-09 | [C] |
| 2008 (results in the 2009 Super Resource Guide) | *Smartphone & Pocket PC* | "Winners, Finalists and Nominees - Pocket PC Applications - continued" (2008) | 5 products | **Winner**: HandySwitcher (Task Managers). **Finalist**: MemMaid (Multifunction Maintenance Tools), TapText (Misc. Utilities), HandyMenu (System and Registry). Nominee: HandyLauncher | http://www.smartphonemag.com/cms/awards/2008/winners_ppc_apps/page2 → https://web.archive.org/web/20111103115143/http://www.smartphonemag.com/cms/awards/2008/winners_ppc_apps/page2 | [V] |
| 2009-01-03 | Windows Central | "Review: MemMaid Memory Management Utility" (WinC Staff) | MemMaid | Title and date only; the body did not load | https://www.windowscentral.com/review-memmaid-memory-management-utility (live) | [V] title/date |

#### B. DinarSoft's own claims that I could not confirm independently

| Date | Claimed by DinarSoft | Product | Evidence on dinarsoft.com | Why not [V] | Mark |
|---|---|---|---|---|---|
| 2003 | "2003 Foxpop Gold" | HandySwitcher | Badge `hsfox.png`, linked to foxpop.com | The Foxpop award page is not archived | [C] |
| undated | *Pocket PC Magazine* "Hot Download Pick" | MemMaid, HandyMenu, TapText | Badges `mmhot.png`, `hmhot.png` (TapText badge not archived) | No magazine list found | [C] |
| undated | Handango "Staff Picks… what we can't live without" | HandySwitcher | Badge `hshng.png` | No Handango page found | [C] |
| 2006-07-26 | Handango Champion Awards 2006 **Finalist**, "Best Application for Work" | MemMaid | Release `news/hngchampion.html` + badge `mmhng.png` | Handango's finalist page is a Flash (.swf) file; I did not open it | [C] |
| 2006-08-01 | PocketGear.com **Editor's Choice** | MemMaid | Release `news/memmaid-is-editor-choice.html` + badge `mmpg.png` | No PocketGear page found | [C] |
| 2006-12-11 | Pocketland "5 stars" / "Programa recomendado" | MemMaid | Release + badge `ples.gif` | The review exists (table A), but the 5-star rating and the badge are not on the archived text | [C] |
| 2007 | Softonic 4 of 5 stars | MemMaid | Badge `softonic4s.gif` | No Softonic page found | [C] |
| 2007 | Clinton Fitch "Number 7, Top 10 of 2007" | MemMaid | Badge `cfdc.jpg` | The Wayback index for clintonfitch.com timed out | [C] |
| 2007-11-17 | Handango **"Best of 2007"** | MemMaid | Release + badge `bestoff.gif` | The linked Handango theme page is only a redirect in Wayback | [C] |
| — | Reviews by MyPDACafe, AximUsers, GirlsGoneMobile, PDAOnline.ru | MemMaid, HandyMenu, HandySwitcher, HandyLauncher | Quotes on the product reviews pages | Not archived | [U] |

**HijriDate:** I found no review, no award and no Arabic-language press (English and Arabic searches) [U]. The Arabic angle in the press is limited to Pocket PC Dubai (in English) [V].

#### C. For a museum visitor

- **HandySwitcher won "Best Software" in the Task Managers category of *Smartphone & Pocket PC* magazine's annual awards two years in a row (2007 and 2008), and TapText won Misc. Utilities in 2007.** The magazine's own winner lists confirm this.
- From 2003 to 2008, the same awards nominated a DinarSoft product every year: 22 nominations in total. MemMaid was a finalist four years running (2005 to 2008).
- About 20 independent sites reviewed the programs, including Pocket PC Thoughts, Pocketnow, The Gadgeteer and Tucows (a "Dr. File Finder Favorite", 2006). Reviewers came from the US, UK, New Zealand, the UAE, Germany and Spain, and Russia's *CHIP* magazine put MemMaid and HandySwitcher on its cover discs.

#### D. Snapshot URLs used and reusable images

DinarSoft pages read: awards pages https://web.archive.org/web/20170831185642/http://www.dinarsoft.com/memmaid/awards.html · https://web.archive.org/web/20190717183425/http://www.dinarsoft.com/handyswitcher/awards.html · https://web.archive.org/web/20180404175358/http://www.dinarsoft.com/handymenu/awards.html · https://web.archive.org/web/20180404175518/http://www.dinarsoft.com/handylauncher/awards.html · https://web.archive.org/web/20171004205652/http://www.dinarsoft.com/taptext/awards.html ; reviews pages https://web.archive.org/web/20170831185647/http://www.dinarsoft.com/memmaid/reviews.html · https://web.archive.org/web/20190717192640/http://www.dinarsoft.com/handyswitcher/reviews.html · https://web.archive.org/web/20160408000621/http://www.dinarsoft.com/handymenu/reviews.html · https://web.archive.org/web/20180404175347/http://www.dinarsoft.com/handylauncher/reviews.html · https://web.archive.org/web/20171004205630/http://www.dinarsoft.com/taptext/reviews.html ; press index https://web.archive.org/web/20190717192212/http://www.dinarsoft.com/news/ ; releases [S21] to [S24], [S39], plus https://web.archive.org/web/20080105101625/http://www.dinarsoft.com/news/hngchampion.html , https://web.archive.org/web/20061206034847/http://www.dinarsoft.com/news/tucows-reviewed-memmaid.html , https://web.archive.org/web/20080105101652/http://www.dinarsoft.com/news/pocketland-reviewed-memmaid-and-gave-it-5-stars.html , https://web.archive.org/web/20070618081027/http://www.dinarsoft.com/news/clintonfitch-reviewed-memmaid.html . Badges: the full list is at https://web.archive.org/cdx/search/cdx?url=dinarsoft.com/images/awards/&matchType=prefix&collapse=urlkey (24 images). I viewed them to read the text and did not keep them for reuse.

Magazine pages: [M8] https://web.archive.org/web/20120504171613/http://www.smartphonemag.com/cms/awards/2008/home · [M9] https://web.archive.org/web/20111011101753/http://www.smartphonemag.com/cms/awards/previouseditions

Images of DinarSoft's own products (© DinarSoft Corporation; reuse only if the family controls the company's rights, see 1.5):

| Image | What it shows | Wayback URL |
|---|---|---|
| hijriscreen.gif (240×320) | HijriDate: Arabic Hijri date on the WM5 Today screen | https://web.archive.org/web/20160120095637/http://www.dinarsoft.com/images/hijriscreen.gif |
| taptextscreen.gif | TapText menu | https://web.archive.org/web/20160120100119/http://www.dinarsoft.com/images/taptextscreen.gif |
| hmenuscreen.gif | HandyMenu | https://web.archive.org/web/20160120101321/http://www.dinarsoft.com/images/hmenuscreen.gif |
| hlauncherscreen.gif | HandyLauncher | https://web.archive.org/web/20150525193142/http://www.dinarsoft.com/images/hlauncherscreen.gif |
| m1.gif, m2.gif, m5.gif | MemMaid screens | https://web.archive.org/web/20060808024218/http://dinarsoft.com/images/m1.gif (m2: 20060808024219, m5: 20060808024048) |
| square.gif | Square-screen layout | https://web.archive.org/web/20060808024003/http://dinarsoft.com/images/square.gif |
| MemMaid.gif, HandySwitcher.gif, TapText.gif, press/logo_100.png | Product box art and the company logo | https://web.archive.org/web/20131229224459/http://www.dinarsoft.com/images/MemMaid.gif (others in the same folder) |

Do not reuse: magazine and award badges (third-party trademarks; cite them in text only), and screenshots that reviewers took (for example, Pocket PC Life's `images/features/handy11604.jpg`). Those image files belong to the review sites, so link to them instead.

### 1.4 Surviving binaries (do not download until rights are clear; listed only)

The sizes are HTTP `Content-Length` values from `HEAD` requests to Wayback `id_` URLs, in bytes. They match the sizes that the Dinarsoft pages printed (for example, MemMaid 1.72 "628.00 KB (Cab: 496.81 KB)" = 643,072 / 508,734 bytes).

| File | Version | Bytes | Capture | Wayback URL |
|---|---|---|---|---|
| DinarSoftMemMaid172.exe | 1.72 | 643,072 | 2007-01-29 | https://web.archive.org/web/20070129002024/http://www.dinarsoft.com/trials/DinarSoftMemMaid172.exe |
| DinarSoftMemMaid172.CAB | 1.72 | 508,734 | 2007-01-29 | https://web.archive.org/web/20070129001847/http://www.dinarsoft.com/trials/DinarSoftMemMaid172.CAB |
| DinarSoftMemMaid_en.CAB | 2.x (probably 2.3) | 989,440 | 2017-09-02 | https://web.archive.org/web/20170902151714/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=cab |
| DinarSoftMemMaid_en_Setup.exe | 2.x | 461,312 | 2017-09-02 | https://web.archive.org/web/20170902151903/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=exe |
| DinarSoftMemMaid.CAB (multilingual) | 2.x | 1,303,812 | 2017-09-02 | https://web.archive.org/web/20170902151816/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=cab&l=m |
| DinarSoftMemMaid_Setup.exe (multilingual) | 2.x | 539,136 | 2017-09-02 | https://web.archive.org/web/20170902151908/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=exe&l=m |
| DinarSoftMemMaid_1_73.CAB | 1.73 (PPC 2002) | 454,630 | 2017-09-02 | https://web.archive.org/web/20170902151858/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=cab&v=o |
| DinarSoftMemMaid_1_73_Setup.exe | 1.73 | 264,704 | 2017-09-02 | https://web.archive.org/web/20170902151913/http://www.dinarsoft.com/scripts/downloadtrial.php?p=mm&t=exe&v=o |
| DinarSoftHandySwitcher27.exe | 2.7 | 163,328 | 2007-03-06 | https://web.archive.org/web/20070306075025/http://www.dinarsoft.com/trials/DinarSoftHandySwitcher27.exe |
| DinarSoftHandySwitcher_Demo.CAB | 3.x | 252,489 | 2009-03-01 | https://web.archive.org/web/20090301222736/http://www.dinarsoft.com/scripts/downloadtrial.php?p=hs&t=cab |
| DinarSoftHandySwitcher_Setup.exe | 3.x | 207,872 | 2009-03-01 | https://web.archive.org/web/20090301222741/http://www.dinarsoft.com/scripts/downloadtrial.php?p=hs&t=exe |
| DinarSoftHandyMenu36.CAB | 3.6 | 213,014 | 2006-12-23 | https://web.archive.org/web/20061223230453/http://www.dinarsoft.com/trials/DinarSoftHandyMenu36.CAB |
| DinarSoftHandyMenu.CAB | 3.6+ | 195,112 | 2010-12-18 | https://web.archive.org/web/20101218111541/http://www.dinarsoft.com/scripts/downloadtrial.php?p=hm&t=cab |
| DinarSoftHandyMenu_Setup.exe | 3.6+ | 201,728 | 2010-12-18 | https://web.archive.org/web/20101218111333/http://www.dinarsoft.com/scripts/downloadtrial.php?p=hm&t=exe |
| DinarSoftHandyLauncher34.CAB | 3.4 | 105,402 | 2006-12-22 | https://web.archive.org/web/20061222045948/http://www.dinarsoft.com/trials/DinarSoftHandyLauncher34.CAB |
| DinarSoftHandyLauncher34.exe | 3.4 | 208,896 | 2006-12-16 | https://web.archive.org/web/20061216210743/http://www.dinarsoft.com/trials/DinarSoftHandyLauncher34.exe |
| DinarSoftHandyLauncher34_Setup.exe | 3.4 | 156,672 | 2007-07-13 | https://web.archive.org/web/20070713235349/http://www.dinarsoft.com/scripts/downloadtrial.php?p=hl&t=exe |
| DinarSoftTapText13.CAB | 1.3 | 182,869 | 2007-01-17 | https://web.archive.org/web/20070117073946/http://www.dinarsoft.com/trials/DinarSoftTapText13.CAB |
| DinarSoftTapText13.exe | 1.3 | 286,720 | 2006-12-29 | https://web.archive.org/web/20061229072411/http://www.dinarsoft.com/trials/DinarSoftTapText13.exe |
| DinarSoftHijriDate15.CAB | 1.5 | 190,841 | 2007-01-16 | https://web.archive.org/web/20070116214648/http://www.dinarsoft.com/trials/DinarSoftHijriDate15.CAB |
| DinarSoftHijriDate15.exe | 1.5 | 352,256 | 2006-12-24 | https://web.archive.org/web/20061224171150/http://www.dinarsoft.com/trials/DinarSoftHijriDate15.exe |

Archived screenshots (images, safe to view): `hijriscreen.gif` (240×320, Arabic Hijri date on the Windows Mobile 5 Today screen, Ramadan 1427 / Sept 2006) [S33], plus `taptextscreen.gif`, `hmenuscreen.gif`, `hlauncherscreen.gif`, MemMaid `m1/m2/m5.gif`, and press logos at `/images/press/*_100.png`. The full list is at https://web.archive.org/cdx/search/cdx?url=dinarsoft.com/images/&matchType=prefix&filter=statuscode:200&collapse=urlkey (175 URLs).

### 1.5 Dinarsoft legal notes

1. **The copyright owner is DinarSoft Corporation, not the family by default** [V: copyright line]. If the corporation is still active and the family controls it, the family can license the binaries, for example as freeware with a short notice.
2. **If the corporation was dissolved, unsold property can pass to the Crown.** For federal corporations, CBCA s. 228(1) says property "that has not been disposed of at the date of its dissolution … vests in Her Majesty in right of Canada" [L1, V]. Ontario has its own forfeiture law; I did not check its text [U]. Check the registry status before you re-host any binary.
3. Linking to the Wayback copies is lower risk than re-hosting them. The trial builds expire after 15 days and need an unlock key [S34].

---

## 2. Patents

### 2.1 US 2006/0288020 A1 → granted as US 7,603,377 B2

| Field | Value | Mark |
|---|---|---|
| Title (US A1) | "Method and data structure for indexed storage of hierarchically interrelated information in a relational database" (EP/CA: "Methods and data structure …") | [V] [P1], [P5] |
| Inventors | Yasser Awad, Ahmed Moustafa, Mohamad Hassoun | [V] [P3] |
| Original assignee | Alcatel, Paris (FR). It became Alcatel Lucent in 2009. | [V] [P3], [P2] |
| Assignment chain | Alcatel (2005-10-26) → Alcatel Lucent (2009-08-31) → WSOU Investments LLC (2017-09-25), with security interests recorded from 2017 to 2021 | [V] [P2] |
| Priority | CA 2,509,972, filed 2005-06-15 | [V] [P1], [P6] |
| US application | 11/255,953, filed 2005-10-24 | [V] [P3] |
| US publication | US 2006/0288020 A1, 2006-12-21 | [V] [P3] |
| Grant | **US 7,603,377 B2, 2009-10-13**. Term adjusted by 465 days. | [V] [P4] |
| Status | Expired, fee related: "Lapse for failure to pay maintenance fees", effective 2021-10-13 (recorded 2021-11-15) | [V] [P2] |
| Family | CA 2509972 A1 (pub. 2006-12-15, abandoned); EP 1736904 A2/A3 (pub. 2006-12-27 / 2007-05-09, withdrawn); CN 1892655 A (pub. 2007-01-10; Google shows "Pending", which is probably stale) | [V] [P5], [P6], [P7] |
| US class / IPC | 707/100; G06F 7/00 | [V] [P3] |
| Links | https://patents.google.com/patent/US7603377B2/en · https://patents.google.com/patent/US20060288020A1/en · USPTO record: https://patentcenter.uspto.gov/applications/11255953 (not fetched; it needs JavaScript) | |

**Abstract (verbatim, [P1]):** "The invention addresses the problem of storing and maintaining highly hierarchical information in a relational database, relational databases which are more prevalent and enjoy strong database provider support. The efficacy of the storage and the maintenance of highly hierarchical information a relational database is aided by a record key uniquely ascribed to each database record across all database record tables in the relational database. Further the record key has a format which permits the specification of a "contains" relationship between database records. Beneficial information storage and information retrieval improvements are attained by using this, and only this, record key to index all database records in all record tables in the relational database."

**Plain English (3 sentences).** Telecom equipment is nested like boxes in boxes: a network has nodes, a node has shelves, a shelf has slots, a slot holds cards, and a card has ports. Normal databases are slow when they must follow many links to find what is inside what. This invention gives every item one number whose parts spell out where it sits in the nesting, so the database can find an item and everything above it from that one number.

**Technical paragraph.** Each record in every table has one record key, and that key is unique across the whole database. The key is split into regions, one for each level of the containment hierarchy. In the patent's example, a 32-bit integer has 10 bits for the node, 5 for the shelf, 5 for the slot, 5 for the card and 7 for the port. That gives room for 1,024 nodes × 32 shelves × 32 slots × 32 cards × 128 ports. A record at a higher level has zeros in the lower regions. So a mask-and-compare on the key gives the "contains" relation without foreign-key chains or multi-table joins, and this one key is the only index on all tables [V, P1 description]. Context: the Alcatel 5620 NM of that time stored its network model in an Informix relational database [A1, C]. The patent's equipment example matches that kind of network manager, but no source says that the 5620 used this patent [U].

### 2.2 US 2007/0130192 A1 (abandoned)

| Field | Value | Mark |
|---|---|---|
| Title | "Method and system for configuring network devices through an operations support system interface" | [V] [P8] |
| Inventors | Ronald Scott Bolder, Yasser Awad, Chantal Sylvie Vandette | [V] [P9] |
| Assignee | Alcatel, Paris (FR). Google now lists Alcatel Lucent SAS. | [V] [P9], [P8] |
| US application | 11/290,452, filed 2005-12-01 (this is also the priority date) | [V] [P9] |
| US publication | US 2007/0130192 A1, 2007-06-07 | [V] [P9] |
| Status | **Abandoned**, no grant | [V] [P8] |
| Family | EP 1793529 A1 (filed 2006-12-01, pub. 2007-06-06, withdrawn); CN 101009591 A (filed 2006-12-01, pub. 2007-08-01; Google shows "Pending", probably stale) | [V] [P10], [P11] |
| US class / IPC | 707/102; G06F 7/00 | [V] [P9] |
| Links | https://patents.google.com/patent/US20070130192A1/en · https://patents.google.com/patent/EP1793529A1/en · USPTO record: https://patentcenter.uspto.gov/applications/11290452 (not fetched) | |

**Abstract (verbatim, [P8]):** "A method for configuring an entity in a communications network through an operations support system interface ("OSSI"), comprising: establishing an object for the entity in the interface of a data processing system, the object having at least one attribute derived from a script template for the entity; receiving at least one parameter for the at least one attribute through the interface from an external system; populating the script template with the at least one parameter to generate a command script for performing a configuration task on the entity; sending the command script to the entity for execution; and, notifying the external system through the interface when an execution response from the entity is available and sending the execution response to the external system."

**Plain English (3 sentences).** Phone companies run large back-office systems that control the network through standard interfaces such as CMIP and CORBA. When a vendor ships a new device, those standards have no model for it yet, and an agreement on a new model can take a long time. This invention publishes the device's ready-made configuration scripts as ordinary objects on the standard interface, so the back-office system can fill in the blanks, run the script on the device and get the result, with no new standard.

**Technical paragraph.** The network management system (NMS) exposes a CMIP/CORBA operations support system interface (OSSI) to external OSSs. For each script template (written in CLI, NMTI, TL1 or XML, with a script dependency table for ordering), the NMS creates a managed object whose attributes, actions and behaviour come from the template's parameters. The OSS sets those attributes through the standard interface. The NMS then fills the template to make a command script and sends it to the target, for example an IP router. When the router replies, the NMS sends a notification through the OSSI and returns the execution response. The result is a data-driven way to extend a standardized northbound interface without a new GDMO/IDL object model [V, P8 description]. The patent background names CORBA and ITU-T M.3000 TMN. It does not name the 5620 or JIDM [V].

### 2.3 Patent publishing note

USPTO: "the text and drawings of a patent are typically not subject to copyright restrictions" (with limited exceptions in 37 CFR 1.71(d)/(e)) [P13, V]. The museum can show the PDFs, drawings and abstracts.

---

## 3. Sakhr years (Jun 1993 to Sep 1996, family account)

### 3.1 What the public record shows

| Item | Finding | Source | Mark |
|---|---|---|---|
| Sakhr's role | Founded 1982 in Kuwait by Mohammed Al-Sharekh. Arabic MSX computers from June 1985. Quran software in the Uthmani script in 1987. Moved to Heliopolis, Cairo, in 1990 after the invasion of Kuwait (about 30 programmers). Later work: NLP, OCR, speech, machine translation. | [K1], [K2], [K3] | [C] |
| Arabic Windows | Sakhr "were the first to create an Arabic version of Windows 3.x". Microsoft hired its lead developer; Sakhr sued, and the case was settled. Microsoft's Arabic version then became the de facto standard. | [K4], [K2] | [C] |
| Sakhr Arabic Windows on archive.org | "A program intended to 'Arabize' an English copy of Windows 3.1": 2 floppy images of 1,474,560 bytes each, plus screenshots | https://archive.org/details/arabic-win-3.1 [K12] | [V] |
| Arabic Windows manual | PDF, 58,036,229 bytes | https://archive.org/details/sakhr-arabic-windows [K13] | [V] |
| **Al-Ustaz (الأستاذ)** | "Ustaz Ver. 8.0" (1997): a bilingual Arabic/English word processor with "QSP" (Quality Script Processor) calligraphic Arabic fonts, HTML editing, mail merge, speller, dictionary, indexer, charts, formula editor | sakhr.com, captured 1997-05-22 [K5], [K6] | [V] |
| Ustaz requirements (1998) | 386SX minimum (486 preferred), 4 MB RAM, 11 MB disk, CD-ROM, VGA | [K7] | [V] |
| Ustaz screenshots | Two 640×480 GIFs (`Ustaz2.GIF`, `ustazmi.GIF`, captured 1997-06-10). They show a right-to-left Windows 3.x-style UI, `.sww` document files and the "Jawaher" Arabic fonts. | [K10] | [V] |
| "ArabicOffice" | **No product with this exact name was found.** The closest matches: (a) the 1997 "برامج المكتب" (Office programs) line: Al-Ustaz 8th ed., An-Nasher Al-Maktabi (Desktop Publishing) 3rd ed., Jawaher fonts, Modern fonts, speller, indexer, dictionary, searcher [K8]; (b) the 1998 "مجموعة المكتب" (Office Group) suite: editor with HTML save, spreadsheet (OLE), database, image editor, agenda, speller, charts, typing tutor, dictionary. It needs a 486DX, 8 MB RAM and 123 MB of disk [K9]. | [K8], [K9] | [V] product; [U] that this is "ArabicOffice" |
| Family Programs "Office tools" | Text editing through WordPad "integrated with Arabic Windows 95", spreadsheet, database, charts, agenda, album | [K11]; ISO 450,775,040 B at https://archive.org/details/family-programs-2 | [V] |
| Other Sakhr software on archive.org | "Sakhr Programs" 1994 to 1996, ISO 37,486,592 B (runs on XP in VirtualBox) [K14]; Holy Quran v6.31 (1991 to 1996); "Family Programs" ISO 450,777,088 B (`bramg.osara`) | archive.org | [V] |
| Ustaz or Office Group on archive.org | None found (searches: "ustaz", "الأستاذ AND صخر", "Sakhr AND windows", creator:Sakhr) | archive.org API | [V] (negative) |
| Reviews of Ustaz / Office | None found | — | [U] |
| His name at Sakhr | No public source names him. His printing core, bilingual text displayer, Arabic APIs and multimedia installer are family claims only. | — | [U] |

Plausible links, not proven: (1) "common Arabic APIs for Arabic and non-Arabic Windows" fits Sakhr Arabic Windows, which Arabized an English Windows 3.1. (2) The "multimedia installer framework" would fit the 1994 to 1996 Sakhr CD-ROMs now on archive.org. Comparing the installer screens on those ISOs with his notes could confirm it [U].

### 3.2 Is it appropriate to show or emulate Sakhr software?

| Use | Assessment |
|---|---|
| A few screenshots with credit "© Sakhr Software", next to text about his role | Low risk. This is commentary or review. Canadian fair dealing needs the source and author named; US fair use is similar. |
| Linking to archive.org items | Low risk. The museum hosts nothing. Note: the items sit in user-upload collections such as "open_source_software", and that is **not a licence**. |
| Hosting or emulating Ustaz, the Office suite or Arabic Windows | **Not appropriate without written permission from Sakhr**, which still trades with about 200 employees [K1]. Windows 3.1/95 underneath is Microsoft's, which is a second rights layer. |

---

## 4. Alcatel-Lucent years (Oct 1996 to Nov 2006, family account)

### 4.1 Employer name

| Period | Company in Kanata | Source | Mark |
|---|---|---|---|
| to 2000 | Newbridge Networks (founded 1986). The 46020 NMS was its network manager. | [A2] | [C] |
| 2000 to 2006 | Alcatel bought Newbridge (agreed Feb 2000, about US$7.1 B). The 5620 NM "was acquired by Alcatel when the company purchased Kanata, Ont.-based Newbridge". | [A2], [A3], [A4] (snippet only) | [C] |
| from 30 Nov / 1 Dec 2006 | Alcatel-Lucent (merger) | [A5] | [V] |
| from 2016 | Nokia owns Alcatel-Lucent | [A5] | [C] |

**The museum label "Alcatel-Lucent, 1996 to 2006" is wrong for the whole period, because the company did not exist until he left.** The likely correct label is "Newbridge Networks → Alcatel (Kanata)". He joined Newbridge before the acquisition [family-confirmed 2026-10-22]; the exact Oct 1996 start date is from his CV. The 1996 offer letter would settle it.

### 4.2 The 5620 and its CORBA interface

From the Gartner product report "Alcatel, Inc. BND 5620 Network Manager Product Family" (Sharon Fisher, 2003-08-04, DPRO-98246) [A1, C]:

- 5620 NM v6.1 on Sun Solaris 8 with an Informix RDBMS. It manages Alcatel 7770, 7670, 7470 and 7300 equipment and up to 10,000 core nodes and 500,000 edge nodes.
- "The 5620 CORBA OSSI and 5620 CMIP OSSI are scalable OSS interfaces … [they give] the customer OSS access to information maintained by the 5620 NM (for example, alarm, inventory and status information) and to request the 5620 NM to perform operations, such as path provisioning."
- "Order-entry applications can be linked directly to the 5620 NM for flow-through service provisioning."

Plain English: the 5620 was the control room for an operator's ATM, frame relay and IP network. The CORBA OSSI was the door through which the operator's own billing, ordering and trouble-ticket systems could read alarms and inventory and order new connections automatically. The family says he was the architect of that door [U].

### 4.3 JIDM in plain English

In the mid-1990s, telecom management systems spoke three incompatible "languages": OSI/ITU CMIP with GDMO models, Internet SNMP with SMI MIBs, and OMG CORBA with IDL. **Joint Inter-Domain Management (JIDM)** was a task force run by X/Open and the Network Management Forum. It wrote two rule books:

1. **Specification Translation** turns a GDMO or SNMP model into CORBA IDL automatically. CAE Specification, May 1997 [A7, V].
2. **Interaction Translation** defines how a run-time gateway converts CORBA calls into CMIP/SNMP operations and events [A8, V].

The Open Group adopted them as a standard in 2000 (C802) [A6, A8]. OMG adopted "Interworking Between CORBA and TMN Systems" v1.0 (formal/00-08-01, Aug 2000) [A9, V]. Fourteen companies submitted it, including Alcatel Alsthom Recherche, Nortel and Lucent [A8, V]. ITU-T then published X.780 "TMN guidelines for defining CORBA managed objects" (01/2001) and Q.816 "CORBA-based TMN services" (01/2001) [A10, A11, V]. Known weakness: one remote call per attribute gave poor performance at scale. This led to "coarse-grained" interfaces (X.780.1/Q.816.1) [A6, C].

A "JIDM-standard 5620 CORBA OSSI" means the IDL followed these translation rules, so CORBA clients saw the same objects that a CMIP client saw [C, inference from A1 + A7].

### 4.4 Public documents naming him: search results

| Where I looked | Result | Mark |
|---|---|---|
| JIDM ST acknowledgements (1997 and 2000 editions) | Not listed. The Alcatel contributor is Olivier Potonniee (Alcatel Alsthom Recherche). | [V] negative |
| OMG CORBA/TMN submitter list | Companies only, no individual engineers | [V] |
| ITU-T SG4 contribution index 2001 to 2004 (C and D series) | No Alcatel-sourced contributions in the online index. The 1997 to 2000 index shows "no document available". TD and TIES documents are not public. | [V] negative / [U] |
| "jidmTester", custom CORBA EventChannel (2× faster than standard) | No public trace. The standard it improved on is the OMG Event Service / Notification Service [A13]. | [U] |
| Papers or talks (IEEE, IFIP, NOMS) | None found | [U] |
| Patents | Only the two above [P14] | [V] |

---

## 5. 1993 PC Middle East programming competition

| Question | Finding | Mark |
|---|---|---|
| Did the competition happen, and did *The Brave Sun* win 3rd place? | No public source found. The only source is the family's README: "won 3rd place … cash prize and enterprise software packages" (`programs/SUN/README.TXT`). | [U] |
| Which magazine? | Best candidate: *PC Magazine Middle & Near East*, Dubai (publisher DIT; also listed under Micro International Distribution). It ran "18 years in English and 16 years in Arabic" until April 2009, so English started about 1991 and **Arabic about 1993**. An Arabic-software contest in 1993 fits the Arabic launch. | [C] [C1], [C2]; launch-contest link [U] |
| Did that magazine give awards? | Yes, later: Diwan's Yaqout received its "Recommended" logo (Aug 2002) | [C] [C5] |
| Online issues for 1993 to 1994? | None. The earliest Arabic issue on archive.org is Oct 1999 (`pcmagazine-me-1999-10`). | [V] negative |
| Winners list | Not found | [U] |

How to verify: (1) the family's prize letter, certificate or magazine clipping; (2) a library that holds *PC Magazine Middle & Near East* v.2 to 3 (1993 to 1994), found through WorldCat or the AUC and Bibliotheca Alexandrina catalogues.

---

## 6. Emulation and publishing plan

| Work | Playable in a browser? | Path | Rights | Effort |
|---|---|---|---|---|
| 15 DOS programs | **Yes (done)** | js-dos | Family | — |
| Dinarsoft, 6 apps | **No** (ARM Windows CE binaries; no mature WebAssembly Pocket PC emulator found; v86 is x86 only) | Record a 1 to 2 min MP4 per app in Microsoft Device Emulator 3.0 (v1.0 emulates an ARM SMDK2410 board) with Windows Mobile 5/6 images, on a Windows VM [L3]. Show the archived screenshots and the version history from 1.2. | DinarSoft Corp. (section 1.5) | 1 day for setup, 15 min per app |
| HijriDate | Yes, as a **labelled re-creation** | A web "Today screen" widget built on `Intl.DateTimeFormat('ar-u-ca-islamic-umalqura')` (native, no library). Show it next to the 2006 screenshot. | New code by the son | 2 h |
| Patent US 7,603,377 | Yes, as an interactive explainer | Input node/shelf/slot/card/port → show the 32-bit key (10/5/5/5/7 bits) and highlight the "contains" mask | Public domain text and drawings [P13] | 2 h |
| Patent US 2007/0130192 | Documented | A diagram: OSS → CORBA OSSI → script template → router → notification | Public domain | 1 h |
| 5620 CORBA OSSI, jidmTester, EventChannel | **No** | Document only: Gartner quote, a JIDM explainer, his own notes if the family has them | Nokia proprietary; publish no code or internal documents | 2 h |
| Sakhr Ustaz, Office suite, APIs | **No without Sakhr's permission** (v86 could run Windows 3.1 [L2], but there are two rights layers) | Screenshots from sakhr.com (1997) with credit, and links to the archive.org items | Sakhr, Microsoft | 1 h |
| 1993 competition | n/a | Show the family's evidence. Mark it "family account" until a clipping is found. | — | — |

---

## Deviations and unknowns

- I did not search the Corporations Canada or Ontario registries. They need form submission, which my rules forbid. This is the main open legal item for re-hosting Dinarsoft binaries.
- The ProQuest and IT World Canada pages on the Newbridge → Alcatel 5620 lineage returned 403 or redirect loops. I used the search snippet only [C].
- CN patent statuses ("Pending") come from Google Patents and are probably stale. I did not check CNIPA.
- Press and awards: I did not open Handango's 2006 and 2007 award pages, because they are Flash (.swf) files, which count as executable content. The Wayback index for clintonfitch.com and foxpop.com timed out twice. Those items stay [C].
- The WebSearch tool sometimes refused to search a person's name directly. I covered his name with the patent database, the Wayback meta tags and Arabic queries.

---

## Sources

**Dinarsoft (Wayback Machine snapshots of dinarsoft.com)**

- [S1] About, 2006-12-06: https://web.archive.org/web/20061206034925/http://www.dinarsoft.com/company/about.html
- [S2] "All-new MemMaid 2.0 Released" (meta author Yasser Awad): https://web.archive.org/web/20070715183845/http://www.dinarsoft.com/news/all-new-memmaid-2.0-released.html
- [S3] "DinarSoft Corporation changed its logo" (meta author Yasser Awad): https://web.archive.org/web/20070702051210/http://www.dinarsoft.com/news/logochange.html
- [S4] Products, 2007: https://web.archive.org/web/20070319041625/http://www.dinarsoft.com/products/
- [S5] Home (frames content), 2006-05: https://web.archive.org/web/20060508132501/http://www.dinarsoft.com/home.html
- [S6] MemMaid summary: https://web.archive.org/web/20061206211330/http://www.dinarsoft.com/memmaid/summary.html
- [S7] MemMaid revision history: https://web.archive.org/web/20070121185228/http://www.dinarsoft.com/memmaid/revision-history.html
- [S8] MemMaid download (2.2 build 111, 1.73): https://web.archive.org/web/20080213085202/http://www.dinarsoft.com/memmaid/download.html
- [S9] MemMaid 2.3: https://web.archive.org/web/20080628174914/http://www.dinarsoft.com/news/memmaid-is-updated-to-version-2.3.html
- [S10] HandySwitcher summary: https://web.archive.org/web/20061206035224/http://www.dinarsoft.com/handyswitcher/summary.html
- [S11] HandySwitcher revision history: https://web.archive.org/web/20070509202214/http://www.dinarsoft.com/handyswitcher/revision-history.html
- [S12] HandySwitcher 3.1: https://web.archive.org/web/20080517164340/http://www.dinarsoft.com/news/handyswitcher-3.1-released.html
- [S13] HandyMenu summary: https://web.archive.org/web/20061214170105/http://www.dinarsoft.com/handymenu/summary.html
- [S14] HandyMenu revision history: https://web.archive.org/web/20070509202449/http://www.dinarsoft.com/handymenu/revision-history.html
- [S15] HandyLauncher summary: https://web.archive.org/web/20061214165631/http://www.dinarsoft.com/handylauncher/summary.html
- [S16] HandyLauncher revision history: https://web.archive.org/web/20070611163401/http://www.dinarsoft.com/handylauncher/revision-history.html
- [S17] TapText summary: https://web.archive.org/web/20061214052339/http://www.dinarsoft.com/taptext/summary.html
- [S18] TapText revision history: https://web.archive.org/web/20070111181807/http://www.dinarsoft.com/taptext/revision-history.html
- [S19] HijriDate summary: https://web.archive.org/web/20061213052629/http://www.dinarsoft.com/hijridate/summary.html
- [S20] HijriDate revision history: https://web.archive.org/web/20070109074605/http://www.dinarsoft.com/hijridate/revision-history.html
- [S21] Best Software 2007 winners: https://web.archive.org/web/20071222204055/http://www.dinarsoft.com/news/two-dinarsoft-products-selected-as-best-software-award-2007-by-pocketpc-maga.html
- [S22] 2007 finalists: https://web.archive.org/web/20071023190820/http://www.dinarsoft.com/news/three-dinarsoft-products-announced-finalists-in-its-annual-best-software-for-pocketpc-2007.html
- [S23] Handango Best 2007: https://web.archive.org/web/20071207203609/http://www.dinarsoft.com/news/memmaid-named-one-of-the-best-applications-for-2007-by-handango.html
- [S24] PocketGear Editor's Choice: https://web.archive.org/web/20070702051225/http://www.dinarsoft.com/news/memmaid-is-editor-choice.html
- [S25] The Gadgeteer, TapText review: https://the-gadgeteer.com/2007/08/23/dinarsoft_taptext_windows_mobile_utility/
- [S26] TreoCentral, Task Manager Shoot-Out: https://treocentral.com/content/Stories/839-2.htm
- [S27] Windows Central, MemMaid review: https://www.windowscentral.com/review-memmaid-memory-management-utility
- [S28] Wayback CDX, all dinarsoft.com URLs: https://web.archive.org/cdx/search/cdx?url=dinarsoft.com&matchType=domain&collapse=urlkey
- [S29] Last live homepage, 2019-08-02: https://web.archive.org/web/20190802022833/http://www.dinarsoft.com/
- [S30] HugeDomains sale page, 2022-02-23: https://web.archive.org/web/20220223235941/http://www.dinarsoft.com/
- [S31] RDAP record: https://rdap.verisign.com/com/v1/domain/dinarsoft.com
- [S33] HijriDate screenshot: https://web.archive.org/web/20160120095637/http://www.dinarsoft.com/images/hijriscreen.gif
- [S34] Unlock key / trial terms: https://web.archive.org/web/20061214165733/http://www.dinarsoft.com/support/unlock-key.html
- [S36] Website relaunch release: https://web.archive.org/web/20070120205552/http://www.dinarsoft.com/news/website-launch.html
- [S37] Support forums page: https://web.archive.org/web/20070204063327/http://www.dinarsoft.com/support/forums.html
- [S38] July 2007 newsletter (MemMaid 2.0 features): https://web.archive.org/web/20081120140503/http://www.dinarsoft.com/newsletters/july-2007-newsletter.html
- [S39] 2006 finalist release: https://web.archive.org/web/20070702050117/http://www.dinarsoft.com/news/memmaid-finalist-2006.html

**Patents**

- [P1] https://patents.google.com/patent/US20060288020A1/en
- [P2] https://patents.google.com/patent/US7603377B2/en
- [P3] https://patentimages.storage.googleapis.com/62/42/f4/2da77ce832e30b/US20060288020A1.pdf
- [P4] https://patentimages.storage.googleapis.com/46/2e/78/4c3f532071398c/US7603377.pdf
- [P5] https://patents.google.com/patent/EP1736904A2/en
- [P6] https://patents.google.com/patent/CA2509972A1/en
- [P7] https://patents.google.com/patent/CN1892655A/en
- [P8] https://patents.google.com/patent/US20070130192A1/en
- [P9] https://patentimages.storage.googleapis.com/5d/4d/fb/522a550f337158/US20070130192A1.pdf
- [P10] https://patents.google.com/patent/EP1793529A1/en
- [P11] https://patents.google.com/patent/CN101009591A/en
- [P13] USPTO terms of use (copyright of patents): https://www.uspto.gov/terms-use-uspto-websites
- [P14] Google Patents inventor search: https://patents.google.com/?inventor=Yasser+Awad

**Sakhr**

- [K1] https://en.wikipedia.org/wiki/Sakhr_Software_Company
- [K2] Al Jazeera (2025-09-07), «صخر الضاد.. رحلة تعريب الحاسوب ورقمنة التراث العربي»: https://www.aljazeera.net/tech/2025/9/7/%d8%b5%d8%ae%d8%b1-%d8%a7%d9%84%d8%b6%d8%a7%d8%af-%d8%b1%d8%ad%d9%84%d8%a9-%d8%aa%d8%b9%d8%b1%d9%8a%d8%a8-%d8%a7%d9%84%d8%ad%d8%a7%d8%b3%d9%88%d8%a8-%d9%88%d8%b1%d9%82%d9%85%d9%86%d8%a9
- [K3] Arab News (2024-03-07), Al-Sharekh obituary: https://www.arabnews.pk/saudi-arabia/arabic-software-pioneer-mohammed-al-sharekh-dies-2472646
- [K4] Baheyeldin, Arabic computing history (2004): https://baheyeldin.com/node/245
- [K5] Ustaz Ver. 8.0 (English), 1997: https://web.archive.org/web/19970522192725/http://www.sakhr.com/lproduct/loffice/USTAZ.htm
- [K6] الأستاذ (Arabic), 1997: https://web.archive.org/web/19970522192538/http://www.sakhr.com/product/office/USTAZ.htm
- [K7] الأستاذ with system requirements, 1998: https://web.archive.org/web/19980206082759/http://sakhr.com/product/office/USTA.htm
- [K8] Office programs list, 1997: https://web.archive.org/web/19970522192315/http://www.sakhr.com/product/office/oficlst.htm
- [K9] Office Group suite, 1999: https://web.archive.org/web/19990129082432/http://www.sakhr.com/product/office/offgroup.htm
- [K10] Ustaz screenshot page, 1997: https://web.archive.org/web/19970121144349/http://www.sakhr.com/images/product/Al_Ustaz_SS.html (images: https://web.archive.org/web/19970610150502/http://www.sakhr.com/images/product/Ustaz2.GIF , https://web.archive.org/web/19970610150510/http://www.sakhr.com/images/product/ustazmi.GIF)
- [K11] Family Programs office tools, 1997: https://web.archive.org/web/19970121142408/http://www.sakhr.com/product/famkit/office.htm
- [K12] https://archive.org/details/arabic-win-3.1
- [K13] https://archive.org/details/sakhr-arabic-windows
- [K14] https://archive.org/details/sakhr-programs
- [K16] https://en.wikipedia.org/wiki/Nabil_Ali (VP of Sakhr's R&D council, 1985 to 1999)

**Alcatel, 5620, JIDM**

- [A1] Gartner, "Alcatel, Inc. BND 5620 Network Manager Product Family", 2003-08-04: https://web.archive.org/web/20180204223934/http://www.bus.umich.edu/kresgepublic/journals/gartner/research/98200/98246/98246.html
- [A2] https://en.wikipedia.org/wiki/Newbridge_Networks
- [A3] Photonics.com, "Alcatel to Acquire Newbridge Networks": https://www.photonics.com/Articles/Alcatel_to_Acquire_Newbridge_Networks/a5676 (search snippet)
- [A4] ProQuest trade article on 5620 lineage: https://www.proquest.com/docview/198830395 (search snippet only)
- [A5] https://en.wikipedia.org/wiki/Alcatel-Lucent
- [A6] https://en.wikipedia.org/wiki/Joint_Inter-Domain_Management
- [A7] Open Group, JIDM Specification Translation (CAE, May 1997): https://pubs.opengroup.org/onlinepubs/8349099/front.htm
- [A8] Open Group C802 (2000), ST and IT: https://pubs.opengroup.org/onlinepubs/009619799/c802shtm/front.htm · https://pubs.opengroup.org/onlinepubs/009619799/c802ihtm/front.htm
- [A9] OMG, Interworking Between CORBA and TMN Systems 1.0: https://www.omg.org/spec/TMN/1.0/About-TMN
- [A10] ITU-T X.780: https://www.itu.int/rec/T-REC-X.780
- [A11] ITU-T Q.816: https://www.itu.int/rec/T-REC-Q.816
- [A12] ITU-T SG4 contribution indexes: https://www.itu.int/md/T01-SG04-C/en · https://www.itu.int/md/T01-SG04-D/en · https://www.itu.int/md/T97-SG04-C/en
- [A13] OMG Notification Service: https://www.omg.org/spec/NOT/

**Competition**

- [C1] The National (2009-09-29), "PC Magazine to make comeback": https://www.thenationalnews.com/business/pc-magazine-to-make-comeback-1.497036
- [C2] ArabicBookshop listing, *PC Magazine Middle & near East* v.12: https://www.arabicbookshop.net/pc-magazine-middle-amp-near-east/(prd)-384
- [C3] Earliest Arabic issue on archive.org: https://archive.org/details/pcmagazine-me-1999-10
- [C4] Family README: /Users/deadpackets/workspace/DOSArchive/programs/SUN/README.TXT
- [C5] Diwan, Yaqout PC Magazine award: https://diwan.com/index.php/archive/14-al-nashir-al-sahafi-yaqout-gains-pc-magazine-award

**Legal and emulation**

- [L1] Canada Business Corporations Act, s. 228: https://laws-lois.justice.gc.ca/eng/acts/c-44/page-25.html
- [L2] v86 (x86 in WebAssembly; Windows 1.01 to 2000 profiles): https://copy.sh/v86/
- [L3] Microsoft Device Emulator: https://en.wikipedia.org/wiki/Microsoft_Device_Emulator

**Disambiguation**

- [X1] https://en.wikipedia.org/wiki/Yasser_Al-Awadi
- [X2] https://en.wikipedia.org/wiki/Yasser_Ali
- [X3] https://www.diwanalarab.com/%D9%8A%D8%A7%D8%B3%D8%B1-%D8%B9%D9%84%D9%8A-%D9%85%D8%AD%D9%85%D8%AF
