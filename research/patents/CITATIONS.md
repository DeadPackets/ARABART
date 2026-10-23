# Who cited Yasser Awad's patents

Read on 2026-10-23. Data file: `citations.json` (89 records, one per citing publication). Key fields: `cited_by` is examiner or applicant; `link` is direct (it names his document) or family (a sibling does, see `via`); `invention_group` ties publications of one invention together; `own_cited_by` / `own_families_citing` are Google's counts for that record.

## Correction to the brief

EP 1793529 is the European twin of **US 2007/0130192** (the OSS script-template application), not of US 7,603,377. The family of US 7,603,377 is US 2006/0288020 A1 (its pre-grant publication), EP 1736904 A2/A3, CA 2509972 A1 and CN 1892655 A. The family of US 2007/0130192 A1 is EP 1793529 A1 and CN 101009591 A. `src/writeups/patents.astro` already says this correctly.

## Totals

| Measure | US 7,603,377 family (database key) | US 2007/0130192 family (OSS templates) | Both |
|---|---|---|---|
| Citing publications | 14 | 75 | **89** |
| Distinct inventions (patent families) | 8 | 37 | **45** |
| Distinct companies | 8 | 19 | **27** (26 without Alcatel itself) |

- 76 of 89 publications name one of his documents in their own reference list. The other 13 are siblings of a publication that does (Google's "Families Citing this family").
- 48 are marked as examiner citations, 41 as applicant citations. 43 of the 76 direct citations were added by the examiner.
- Company count rules: names normalised (Futurewei counted as Huawei, Cleversafe as IBM, Apstrktr as Apstra, HP and HPE as one). Apstra (bought by Juniper in 2021) and CENX (bought by Ericsson in 2018) are kept as their own names. If Apstra is folded into Juniper, there are 25 outside companies.
- Second source: the USPTO full text confirms 43 US publications that name his documents. Counting family members, 64 of 89 records and 29 of 45 inventions are confirmed. The rest are Chinese, WIPO, EP or US pre-grant records that only Google Patents shows (US A1 publications print no reference list).
- Scholarly papers, standards and books: **none found**.

## Notable citing documents

Ranked by company size and fame first, then by the citing patent's own citation count. "Cited by" is Google's count of later documents that cite that publication / the number of later families.

| # | Company | Number | Title | Priority / published | Cites his | How | Cited by | Second source |
|---|---|---|---|---|---|---|---|---|
| 1 | Cisco | [US10462010B2](https://patents.google.com/patent/US10462010B2/en) | Detecting and managing recurring patterns in device and service configuration data | 2017 / 2019 | CN 101009591 A | examiner, via CN110799942A, CN110799942B | 2 / 11 | no, Google Patents only |
| 2 | IBM | [US10089344B2](https://patents.google.com/patent/US10089344B2/en) | Listing data objects using a hierarchical dispersed storage index | 2012 / 2018 | US 2006/0288020 A1 | examiner, direct | 4 / 79 | yes |
| 3 | Oracle | [US10360233B2](https://patents.google.com/patent/US10360233B2/en) | In-memory key-value store for a multi-model database | 2015 / 2019 | CN 1892655 A | examiner, via CN113961564A | 1 / 21 | no, Google Patents only |
| 4 | Huawei | [US11218423B2](https://patents.google.com/patent/US11218423B2/en) | Method for service implementation in network function virtualization (NFV) system and communications unit | 2014 / 2022 | US 2007/0130192 A1 | examiner, direct | 0 / 46 | yes |
| 5 | Huawei | [US10013414B2](https://patents.google.com/patent/US10013414B2/en) | System and method for metadata enhanced inventory management of a communications system | 2014 / 2018 | EP 1793529 A1 | applicant, direct | 0 / 16 | yes |
| 6 | CENX (now Ericsson) | [US9871702B2](https://patents.google.com/patent/US9871702B2/en) | Service information model for managing a telecommunications network | 2016 / 2018 | US 2007/0130192 A1 | examiner, direct | 1 / 4 | yes |
| 7 | Juniper Networks | [US11283691B1](https://patents.google.com/patent/US11283691B1/en) | Model driven intent policy conflict detection and resolution through graph analysis | 2020 / 2022 | US 2007/0130192 A1 | applicant, direct | 14 / 7 | yes |
| 8 | Apstra (Juniper) | [US11805024B1](https://patents.google.com/patent/US11805024B1/en) | Automatically generating an intent-based network model of an existing computer network | 2019 / 2023 | US 2007/0130192 A1 | applicant, direct | 2 / 92 | yes |
| 9 | AT&T | [US8295199B2](https://patents.google.com/patent/US8295199B2/en) | Methods and systems for maintaining diversity for telecommunication services | 2007 / 2012 | US 2007/0130192 A1 | examiner, direct | 0 / 6 | yes |
| 10 | HP / HPE | [US9569471B2](https://patents.google.com/patent/US9569471B2/en) | Asset model import connector | 2011 / 2017 | US 2007/0130192 A1 | examiner, direct | 5 / 27 | yes |
| 11 | Arista Networks | [US11750458B1](https://patents.google.com/patent/US11750458B1/en) | Structured network change controls | 2022 / 2023 | US 2007/0130192 A1 | examiner, direct | 1 / 0 | yes |
| 12 | Brocade | [US9716672B2](https://patents.google.com/patent/US9716672B2/en) | Distributed configuration management for virtual cluster switching | 2010 / 2017 | US 2006/0288020 A1 | examiner, direct | 2 / 50 | yes |
| 13 | Teradata | [US9514182B2](https://patents.google.com/patent/US9514182B2/en) | Techniques for managing data relationships | 2009 / 2016 | US 7,603,377 B2 | applicant, direct | 2 / 1 | yes |
| 14 | Citrix | [US10503754B2](https://patents.google.com/patent/US10503754B2/en) | Bulk loading multiple hierarchical levels of relational data to a database | 2017 / 2019 | US 7,603,377 B2 | applicant, direct | 0 / 3 | yes |
| 15 | Level 3 Communications | [US10326645B2](https://patents.google.com/patent/US10326645B2/en) | System and methods for configuration management | 2011 / 2019 | US 2007/0130192 A1 | examiner, direct | 0 / 24 | yes |
| 16 | ZTE | [CN102684894B](https://patents.google.com/patent/CN102684894B/en) | Method and device for realizing northboundbound interface | 2011 / 2014 | CN 101009591 A | examiner, direct | 0 / 6 | no, Google Patents only |
| 17 | Rakuten Mobile | [US20230033609A1](https://patents.google.com/patent/US20230033609A1/en) | Method of managing at least one network element | 2021 / 2023 | EP 1793529 A1 | examiner, direct | 0 / 0 | no, Google Patents only |

Notes on the table:
- Cisco and Oracle cite him only through their Chinese filings: a Chinese examiner cited his Chinese publication. The US patents are in the same families.
- Apstra's first patent in that family, US10992543B1, has 93 later citations, the most of any document here. US10756983B2 (Apstra, same family as US11451451B2) has 77.
- Huawei cites him in two separate inventions: the NFV family (US11218423B2, US10862823B2, US20190058670A1, EP3116177B1) and the inventory family (US10013414B2, EP3172866A4).
- Not notable: the two Alcatel records (US7403491B2, US20050232163A1) are his own employer citing him. Other smaller companies: Gluware, Allied Telesis, Net-Conex, Baosight, Shanghai Feixun, Putian, Hangzhou Runzhou, Mashang Consumer Finance, Face Recording and Measurements.

## Sources and method

| Source | Read | Result |
|---|---|---|
| Google Patents pages of all 9 of his publications | 2026-10-23 | "Cited By" and "Families Citing this family" tables; asterisk = examiner |
| Google Patents pages of all 89 citing publications | 2026-10-23 | Assignee, dates, own citation counts, and which of his documents each one lists |
| USPTO Patent Public Search (ppubs.uspto.gov, anonymous full-text search) | 2026-10-23 | Second source for US patents. Searches: `7603377.urpn.`, "2006/0288020", "2007/0130192", "EP 1793529" and the other family numbers. No US citing patent found that Google lacks. |
| Google Scholar | 2026-10-23 | No articles match the patent numbers or titles. Scholar did not return patents for a control title, so it could not check patent citations. |
| OpenAlex full-text search | 2026-10-23 | 0 hits for the patent numbers (1 false match: an unrelated economics paper containing the digit string) |
| Web search limited to IEEE Xplore, ACM, Semantic Scholar, ResearchGate, arXiv, Springer, ScienceDirect | 2026-10-23 | No paper cites the patents |
| Juniper, HPE, Ericsson and IBM acquisition news (press releases, SEC 10-K) | 2026-10-23 | Apstra to Juniper 27 Jan 2021; Juniper to HPE 2 Jul 2025; CENX to Ericsson Sep 2018; Cleversafe to IBM, announced Oct 2015 |

Not reached: Espacenet and EPO OPS (HTTP 403), Lens.org (needs JavaScript), FreePatentsOnline, Justia and uspto.report (HTTP 403), Semantic Scholar API (HTTP 429, rate limit), the Chrome extension (not connected). Chinese citations were not checked at CNIPA. No files were downloaded; pages were read as HTML or JSON.
