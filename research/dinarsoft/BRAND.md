# DinarSoft brand

**Red double-crescent "D" mark + italic charcoal "DinarSoft" wordmark, on a gray-and-white site with brick-red accents. Tagline: "Mobile Software for every need".** Contact sheet: [`brand/contact-sheet.png`](brand/contact-sheet.png) (regenerate with `uv run -q --with playwright python -I scripts/contact_sheet.py <tmpdir>`; it reads only local files).

Every file below is DinarSoft's own, from the Internet Archive copies in `site/` or from inside DinarSoft's 2008 installers (`brand/installer/`). The award badges in the site's sidebar belong to the magazines and stores; cite them, do not reuse them as DinarSoft art.

## 1. Logo

The current logo dates from **1 November 2006** (press release `site/news/logochange.html`: "DinarSoft Corporation announced a new logo … used immediately in the website and in any official papers"). The site relaunch two weeks later carried it.

| File | Size | Use |
|---|---|---|
| `site/templates/dinarsoft/images/logo.gif` | 300×50 GIF | Site header, mark + wordmark (largest raster) |
| `site/images/press/logo_name_50.png` | 220×50 PNG, transparent | Press kit, mark + wordmark |
| `site/images/press/logo_100.png` | 100×100 PNG, transparent | Press kit, mark only (largest mark) |
| `site/images/dinarsoft.ico` (= `site/favicon.ico`) | 32×32 ICO | Favicon, mark only |

- **No vector version was archived.** The CDX index has no `.svg`, `.eps`, `.ai`, `.pdf`, `.psd` or `.zip` under dinarsoft.com, and the press "Logo & Images" page (`/press/images.html`) was never captured. For print or large display, trace `logo_100.png` (mark) and `logo_name_50.png` (wordmark) by hand.
- Mark: two nested red crescents forming a "D" around a solid red dot, `#CF2F2F` (favicon `#E0251B`).
- Wordmark: "DinarSoft" in a semi-bold italic humanist sans, charcoal `#433C3C`. The font is not named in any file; it looks like Myriad Pro Semibold Italic (not confirmed).
- Other uses: a white business card with the logo at left, a large faded red crescent watermark behind it, and a thin red rule (visible in `site/gitex/flame12l.jpg`; it shows a street address and phone numbers, so crop or blur it); and a translucent white logo watermark on DinarSoft's own photos (`site/gitex/*.jpg`).
- **The logo before November 2006 survives inside the installers.** It is "DiNAR" in blue capitals, with a small green globe as the dot of the i, under and over thin blue rules; its Arabic twin spells دينار with the same globe. Best copies, 24-bit: HijriDate 1.5's Today plug-in (`HIJRIP~1.001` in `DinarSoftHijriDate15.CAB`), bitmap 162 (DiNAR, 116×53) and bitmap 157 (Arabic, 92×54). MemMaid 1.5a and 1.72 carry the same DiNAR logo as bitmap 108 on their About screen, reduced to 256 colors (the two builds' bitmaps are byte-identical); 1.73 and later show the new logo. Published pixel for pixel as `public/dinarsoft/logo-2005.webp` and `logo-2005-ar.webp` (lossless) (`scripts/publish_hub.py`, step 7; research copies in `re/hijridate/resources/` and `re/memmaid/NOTES.md`).
- The 2005 to 2006 frames site drew its header from `images/green_01.gif` to `green_14.gif`, which the Wayback Machine never captured. That site's text wordmark was "**Dinar**Soft" in Times New Roman, blue `#006699`.

## 2. Tagline and voice

- Tagline: **"Mobile Software for every need"**, set in light gray over the 755×123 home-page banner photos (`site/images/banners/*.jpg`). Meta description: "DinarSoft :: Mobile Software for every need!!, Custom mobile software, OEM software, Utilities for Windows Mobile".
- 2006 intro line: "We are specialized in developing software for mobile devices. Our excellence is in providing feature rich products and world-class customer support."
- Product slogans (installer bitmaps and page titles):

| Product | Slogan |
|---|---|
| MemMaid | The Best Maid for PocketPCs |
| HandySwitcher | The Ultimate Task Manager |
| HandyMenu | Powerful System Access (the promo buttons spell it "Powerfull") |
| HandyLauncher | The Seamless Launcher |
| TapText | More Text, Less Taps. |
| HijriDate Plugin | What is Today |

## 3. Colors

Hex values come from the archived CSS (`site/templates/dinarsoft/css/layout.css`, `customize.css`) and inline HTML, or are sampled from the logo and title images where marked.

| Hex | Role | Source |
|---|---|---|
| `#CF2F2F` | Logo red; red question headings on product pages ("What is HandySwitcher?") | logo pixels; inline `color:#cf2f2f` |
| `#433C3C` | Logo charcoal (wordmark) | logo pixels |
| `#E0251B` | Favicon red | `dinarsoft.ico` pixels |
| `#3D3D3D` | Product wordmark gray ("Mem**Maid**") | title/slogan bitmaps |
| `#B8380E` | Product slogan rust | title/slogan bitmaps |
| `#A82711` | Drop-down menu hover; FAQ links | inline menu CSS; `li.faq a` |
| `#AA0000` | 1 px rule under section headings and product tables | `.contentheading`, inline `border-bottom` |
| `#D34B0C` | Side-menu hover underline | `.mainlevel_navmenu:hover` |
| `#C55D3B` | Active side-menu item | `#active_menu_navmenu` |
| `#6A6A6A` | Drop-down menu background | inline TransMenu CSS |
| `#555555` | Content headings | `.contentheading` |
| `#999999` | Footer and dates | `#footer` |
| `#E9E9ED` | Page background gray | `#main-body` |
| `#EEEEEE`, `#F5F5F5` | Table row fills, menu hover | inline `bgcolor`; `:hover` |
| `#003366` | 2005 to 2006 frames site: product names | `home~20060508132501.html` |
| `#006699` | 2005 to 2006 frames site: "DinarSoft" text wordmark | same |
| `#EEF2F3` / `#CED2D3` | 2005 to 2006 frames site: intro panel fill / border | same |

`templates/dinarsoft/css/color.css` was referenced in a comment but never archived (all 10 captures are 404). `template_css.css` imports only `layout.css` and `customize.css`, so the table above is complete for the 2006 to 2008 site.

## 4. Typefaces

| Where | Font stack | Size |
|---|---|---|
| Body text | Verdana, Arial, Helvetica, sans-serif | 70.1% of browser default (about 11 px), line-height 1.3em |
| Headings, menus, module titles | Arial, Helvetica, sans-serif | menus 12 px; headings 14 px bold `#555555` |
| Download-list titles | Tahoma | 12 px |
| Footer | Arial | 0.8em, `#999999` |
| Product wordmarks (images) | Arial-like sans in two weights: light prefix + bold name ("Handy**Switcher**") | 225×40 and 190×40 bitmaps |
| 2005 to 2006 frames site | Arial body; Times New Roman for the "DinarSoft" wordmark | |

## 5. Layout and buttons (Nov 2006 to 2008 site)

- Fixed 981 px page, centered, on `#E9E9ED`. Header: logo left over a gray underline (`grayline.gif`), date below it, search box right.
- Six top tabs (Home, Products, eStore, Support, Press, About): 93×64 tiles with a white-to-gray gradient and an orange-red bar at the bottom (`images/stories/button.gif`); hover swaps to a darker gray tile (`buttonH.gif`). Drop-downs are gray `#6A6A6A` panels with `#A82711` hover.
- Main column 755 px: a white panel with soft rounded corners and a drop shadow, built from slice images (`templates/dinarsoft/images/m*.gif`, `n*.gif`). It starts with the 755×123 photo banner and an orange-red rule.
- Featured-product block: title bitmap (`images/mm_title.gif` etc.), three short bullets, 3D box art on the right, then **Read More** and **Buy Now** buttons. These are 82×17 two-state sprites (`rd_n.gif`, `bn_n.gif`; hover = second row). Download pages add **Download** (`dn_n.gif`) and **CAB File** (`cb_n.gif`). Buy Now is pink-red; the others are light gray with a dark bevel.
- Right sidebar 202 px: a column of award badges (`templates/dinarsoft/images/awards.gif`, 178×585).
- "Latest News" list with italic dates on the right; "Newsletter" block with a pink **Sign up →** button (`images/signup.gif`).
- Footer: "Copyrights 2006 DinarSoft Corporation", small gray Arial.
- The 2005 to 2006 frames site was plain: white, a left menu of 122×20 text buttons (`buttons/0button.gif`, `1button.gif`), product names in navy, and Handango / PocketGear buy links.

## 6. Product icon set

Glossy 3D icons, one per product, in matching box-art style:

| Product | Motif | Sizes available |
|---|---|---|
| MemMaid | Blue tray with a white wrench and cables | 130 GIF, 100 PNG, 100 GIF, 64 BMP (installer) |
| HandySwitcher | Four-color Windows-style flag | same |
| HandyMenu | Green ring with a white power symbol | same |
| HandyLauncher | Pie chart (red/blue/yellow) with a white arrow | same |
| TapText | Blue notepad with a red pen | same |
| HijriDate | Blue calendar page with a green top strip and the Arabic-Indic numerals ٢٩ (29) in white | 130 GIF, 100 PNG, 100 GIF (not in the installer set) |

Best resolution per icon: `site/images/<Product>.gif` (130×130) for size, `site/images/press/<Product>_100.png` (100×100, true alpha) for clean edges. Promotion buttons, 278×60 light and dark: `site/promote/<product>.gif` and `<product>b.gif`. In-app art from the installers: `brand/installer/*_icon.png` (64×64), `*_slogan.png` (190×40), and `manuals/*.png` (toolbar strips and help diagrams).
