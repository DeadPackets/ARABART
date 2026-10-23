# The strings the page's MemMaid uses, in all 8 languages, picked by their index in MemMaid's own string table.
# Usage: python3 -I uistrings.py <strings23.json from strings.py> <out ui.json>
import json, sys

src = json.load(open(sys.argv[1]))
PICK = {
    'jump': 674, 'tools': 694, 'cleaner': 359, 'databases': 158, 'tweaks': 420, 'startups': 684, 'storage': 544, 'processes': 360,
    'quick': 675, 'advanced': 676, 'reclaimram': 677, 'notif': 246, 'registry': 159, 'dbusage': 678, 'ext': 679,
    'systweaks': 680, 'appcache': 681, 'info': 682, 'dllopt': 683, 'startitems': 685, 'startsvc': 686, 'today': 687,
    'storusage': 688, 'finder': 689, 'cab': 690, 'installed': 504, 'cardtools': 691, 'running': 271, 'cpu': 692, 'runproc': 693,
    'poweroff': 695, 'softreset': 696, 'settings': 301, 'schedule': 697, 'look': 654, 'about': 303, 'help': 698, 'exit': 699,
    'clean': 55, 'scan': 367, 'all': 514, 'found': 515, 'reclaim': 325, 'free0': 520, 'freed': 521, 'free1': 522,
    'r_close': 317, 'r_free': 518, 'r_compact': 519, 'reclaimed': 140, 'claimed': 142,
    'register': 354, 'trial': 357, 'registered': 306, 'lickey': 528, 'code': 529, 'keyfor': 530, 'enter': 531,
    'language': 703, 'move_up': 423, 'move_down': 424, 'enabled': 292, 'disabled': 293, 'done': 330, 'cancel': 327,
    'timebased': 153, 'eventbased': 156, 'cachesize': 625, 'readbuf': 626, 'histsize': 628, 'maxconn': 629, 'ie': 636,
    'fscache': 630, 'auto': 445, 'optimize': 333, 'apply': 332, 'memory': 107, 'terminate': 348, 'activate': 350,
    'programs_n': 261, 'chart': 341, 'browse': 339, 'shortcut': 392, 'target': 255, 'type': 396, 'enable': 334,
    'cleaned': 406, 'softq': 250, 'run': 345, 'question': 564, 'catinfo': 22, 'notscanned': 24, 'installedby': 252, 'items': 52,
    'skins': [62, 63, 64, 65, 66, 67, 68, 69], 'background': 656,
    'cats': [317, 311, 310, 70, 312, 313, 314, 316, 315, 71, 72, 318, 319, 320, 323, 362, 363, 322, 73, 74, 75, 76, 321, 308, 309, 364, 324, 707, 708],
}
LANGS = ['en', 'ger', 'fra', 'ita', 'csy', 'sky', 'rus', 'chs']
TAGS = {'en': 'en', 'ger': 'de', 'fra': 'fr', 'ita': 'it', 'csy': 'cs', 'sky': 'sk', 'rus': 'ru', 'chs': 'zh-Hans'}

def get(lang, i):
    s = src[lang]['strings'][i] or src['en']['strings'][i]  # MemMaid falls back to English the same way
    return s.replace('\n', ' ').strip()

out = {'langs': [{'id': TAGS[l], 'name': src[l]['name']} for l in LANGS], 'str': {}}
for k, v in PICK.items():
    out['str'][k] = [[get(l, i) for l in LANGS] for i in v] if isinstance(v, list) else [get(l, v) for l in LANGS]
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out['str']), 'keys')
