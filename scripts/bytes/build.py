# Builds the data behind /bytes/ ("Every byte"):
#   disk layer   : what DIET's own unpacker does with every byte of the shipped file (run in an emulator, see emu.py)
#   memory layer : the unpacked image, with an automatic anatomy (header, relocations, traced code, text, zeros, data)
#                  used until src/data/anatomy/<KEY>.json exists for a file
# Run from the repo root after the unpacked images or anatomy change:
#   uv run --quiet --with unicorn --with capstone python -I scripts/bytes/build.py
import bisect, collections, hashlib, json, math, pathlib, re, struct, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/bytes'))
import emu  # noqa: E402
from capstone import Cs, CS_ARCH_X86, CS_MODE_16  # noqa: E402

UNP = ROOT / 'research/artifacts/programs/unpacked'
ANAT = ROOT / 'src/data/anatomy'
PUB = ROOT / 'public/bytes'
md = Cs(CS_ARCH_X86, CS_MODE_16)

DISK = ['sea', 'header', 'reloc', 'entry', 'unpacker', 'control', 'literal', 'text', 'backref', 'never']
TAG = {'hdr': 'header', 'rel': 'reloc', 'stub': 'entry', 'unp': 'unpacker', 'ctrl': 'control', 'lit': 'literal',
       'tok': 'backref', '?': 'never', 'rel2': 'never'}
# (key, packed file, program id, layout row); rows run in time order
FILES = [
    ('ARABART_ARABART.EXE', 'ARABART/ARABART.EXE', 'arabart', 0), ('ARABART_DEMO.EXE', 'ARABART/DEMO.EXE', 'arabart-demo', 0),
    ('ARABART_EDITOR.EXE', 'ARABART/EDITOR.EXE', 'arabart-editor', 0), ('ARABIC_DEMO.COM', 'ARABIC/DEMO.COM', 'arabart-commercial', 0),
    ('PESM_PESM.EXE', 'PESM/PESM.EXE', 'arabic-basmallah', 0), ('SCREEN_SCREEN.COM', 'SCREEN/SCREEN.COM', 'portsaid-it-screensaver', 0),
    ('TAHER_TAHER.COM', 'TAHER/TAHER.COM', 'taher', 0), ('FORM_X_FORM_X.EXE', 'FORM_X/FORM_X.EXE', 'formula-solver', 0),
    ('WINKEY_WINKEY.EXE', 'WINKEY/WINKEY.EXE', 'winkey', 0),
    ('DIGI_T_MAIN.EXE', 'DIGI_T/MAIN.EXE', 'digi-test', 1), ('KVC_KVC.EXE', 'KVC/KVC.EXE', 'kvc-antivirus', 1),
    ('NAMES_NAMES.COM', 'NAMES/NAMES.COM', 'kemyam-splash', 1),
    ('EDIT_EDIT.EXE', 'EDIT/EDIT.EXE', 'text-editor-gui', 2), ('EDIT_EDITOR.EXE', 'EDIT/EDITOR.EXE', 'text-editor-demo', 2),
    ('PORTSAID_PORTSAID.EXE', 'PORTSAID/PORTSAID.EXE', 'portsaid-cs-splash', 2), ('SUN_SUN.EXE', 'SUN/SUN.EXE', 'brave-sun', 2),
    ('SUN_ARAB-ART.EXE', 'SUN/ARAB-ART.EXE', 'brave-sun', 2),
]
W, GAP = 1024, 16
# Personal data the research says must never be published (KVC help screen, SUN exit card)
PRIVATE = [rb'\(\d\d\) ?\d{3}-\d{3,}', rb'\d{3}-\d{3,}', rb'w>f> \d+']
# A P.O. box number, kept out of the source: any 6-digit run with this SHA-256 is masked too
PRIVATE_SHA = 'd864f8fd8f76e61708f3213689b5f6c7442a56c6c6adf2dddc8aadc932e0fced'
FAR = re.compile(r'(0x[0-9a-f]+|\d+)(?::|, )(0x[0-9a-f]+|\d+)')


def ent(b):
    if not b: return 0.0
    c = collections.Counter(b); n = len(b)
    return -sum(v / n * math.log2(v / n) for v in c.values())


def fmt(m, op, seg=None):
    """capstone text in the style of the research listings: 02C3h, jmp far 0759:04D6"""
    far = FAR.fullmatch(op) if m in ('ljmp', 'lcall') else None
    if far:
        return f"{'jmp' if m == 'ljmp' else 'call'} far {int(far[1], 0):04X}:{int(far[2], 0):04X}"
    if re.fullmatch(r'(rep |repne )?(movs|lods|stos|cmps|scas)[bwd]', m): return m
    if re.match(r'(j|loop|call)', m) and re.fullmatch(r'0x[0-9a-f]+', op): return f'{m} {int(op, 16) & 0xffff:04X}'
    op = op.replace('word ptr ', '').replace('byte ptr ', '')

    def h(mt):
        v = int(mt.group(1), 16)
        if v < 10: return str(v)
        s = f'{v:X}'
        if len(s) % 2: s = '0' + s
        if s[0] in 'ABCDEF': s = '0' + s
        return s + 'h'
    return f'{m} {re.sub(r"0x([0-9a-f]+)", h, op)}'.strip()


# ---------------- disk layer (v1, unchanged method) ----------------
def disk_layer(path):
    d, cls, st, _ = emu.run(path)
    n = len(d); c = [TAG[x] for x in cls]
    if d[:2] != b'MZ':
        for i in range(0, 0x23): c[i] = 'entry'
        if c[0x25] == 'never' and c[0x26] == 'never': c[0x25] = c[0x26] = 'control'
    elif c[0x5a] == 'never': c[0x5a] = c[0x5b] = 'control'
    u = [i for i, x in enumerate(c) if x == 'unpacker']
    for a, b in zip(u, u[1:]):
        if 1 < b - a <= 8 and all(c[k] == 'never' for k in range(a + 1, b)):
            for k in range(a + 1, b): c[k] = 'unpacker'
    frags = []; i = 0
    while i < n:
        if c[i] == 'literal' and 0x20 <= d[i] < 0x7f:
            last = i; txt = ''; k = i
            while k < n:
                if c[k] == 'literal' and 0x20 <= d[k] < 0x7f:
                    if k - last > 1: txt += '·'
                    txt += chr(d[k]); last = k; k += 1
                elif k - last <= 2: k += 1
                else: break
            chars = txt.replace('·', ''); words = re.findall(r'[A-Za-z]{3,}', txt)
            if len(chars) >= 6 and sum(ch.isalpha() for ch in chars) >= 0.6 * len(chars) and sum(map(len, words)) >= 6 \
                    and any(len(w) >= 4 and re.search('[aeiouAEIOU]', w) for w in words):
                frags.append({'a': i, 'n': last - i + 1, 't': txt})
                for q in range(i, last + 1):
                    if c[q] == 'literal' and 0x20 <= d[q] < 0x7f: c[q] = 'text'
            i = last + 1
        else: i += 1
    com = d[:2] != b'MZ'
    pk = [i for i, x in enumerate(c) if x in ('control', 'literal', 'text', 'backref')]
    ps, pe = pk[0], pk[-1] + 1
    us = [i for i, x in enumerate(c) if x == 'unpacker']
    R = []
    def add(a, b, kind, label, note, by='diet'):
        if b > a: R.append({'start': a, 'end': b, 'kind': kind, 'label': label, 'note': note, 'by': by, 'evidence': 'measured'})
    if com:
        add(0, ps, 'entry', 'DIET start-up code', 'The first instructions to run. They check there is room, move the packed program to the top of its memory, then jump to the unpacker.')
    else:
        add(0, 32, 'header', 'Header, written by DIET', 'DIET wrote this header. It sends DOS to DIET’s start-up code first, and that code starts the program.')
        add(32, ps, 'entry', 'DIET start-up code', 'The first instructions to run. They move the packed program higher in memory, 16 bytes at a time, then jump to the unpacker.')
    out = st['out']
    tail = pe
    if us and us[0] >= pe:
        add(ps, us[0], 'packed', 'Packed program', f'The real program, compressed by DIET. When it starts, the unpacker turns these {us[0] - ps:,} bytes into {out:,}.')
        add(us[0], us[-1] + 1, 'unpacker', 'DIET unpacker', f'{us[-1] + 1 - us[0]} bytes of code that rebuild the program in memory, then jump to its first instruction.')
        tail = us[-1] + 1
    else:
        add(ps, pe, 'packed', 'Packed program', f'The real program, compressed by DIET into {pe - ps:,} bytes.')
    if tail < n: add(tail, n, 'never', 'Not needed to start', f'{n - tail:,} bytes at the end of the file that the unpacker does not need to start the program.', 'unknown')
    code = []
    base = 0x100 if com else -0x20
    for g in R:
        if g['kind'] not in ('entry', 'unpacker'): continue
        p = g['start']
        while p < g['end']:
            if c[p] not in ('entry', 'unpacker'): p += 1; continue
            ins = next(md.disasm(d[p:p + 16], (p + base) & 0xffff), None)
            if ins is None or not all(c[k] in ('entry', 'unpacker') for k in range(p, p + ins.size)): p += 1; continue
            code.append([p, ins.size, fmt(ins.mnemonic, ins.op_str)]); p += ins.size
    return d, c, R, frags, code, out, st


# ---------------- memory layer: automatic anatomy ----------------
def trace(img, hdr, entries):
    """Follow jumps and calls (near and far with immediate targets) from the entry point. Returns {offset: (size, text, seg)}."""
    seen = {}; work = list(entries); n = len(img)
    while work:
        off, segbase = work.pop()
        while 0 <= off < n and off not in seen:
            ip = off - segbase
            if not 0 <= ip <= 0xffff: break
            ins = next(md.disasm(img[off:off + 16], ip), None)
            if ins is None or off + ins.size > n: break
            m, op = ins.mnemonic, ins.op_str
            seen[off] = (ins.size, fmt(m, op), segbase)
            if m in ('ret', 'retf', 'iret', 'hlt') or (m == 'int' and op == '0x20'): break
            far = FAR.fullmatch(op) if m in ('ljmp', 'lcall') else None
            if far and hdr > 0:
                s, o = int(far[1], 0), int(far[2], 0)
                tb = hdr + s * 16
                if 0 <= tb + o < n: work.append((tb + o, tb))
                if m == 'ljmp': break
                off += ins.size; continue
            if re.match(r'(j|loop|call)', m) and re.fullmatch(r'0x[0-9a-f]+', op):
                t = segbase + (int(op, 16) & 0xffff)
                if m == 'jmp':
                    off = t; continue
                if 0 <= t < n: work.append((t, segbase))
            elif m in ('jmp', 'ljmp'): break
            off += ins.size
    return seen


# Koko's signature, read from KVC's own table (DS:059F, 05C1, 05D5; DS is image offset 3780h). A hosted byte file that holds
# any of these runs is stored scrambled, so no antivirus scanner finds Koko on the site. The explorer unscrambles it.
def av_runs():
    img = (UNP / 'KVC_KVC.EXE').read_bytes()
    img = img[struct.unpack_from('<H', img, 8)[0] * 16:]
    return [img[0x3780 + o:0x3780 + o + n] for o, n in ((0x59f, 21), (0x5c1, 20), (0x5d5, 6))]


def scramble(b):
    """XOR with a rolling key, A5h plus 4Dh per byte (src/scripts/bytes/explorer.ts undoes it). Its own inverse."""
    return bytes(x ^ ((0xA5 + 0x4D * i) & 0xFF) for i, x in enumerate(b))


def masks(b):
    """Byte ranges of the unpacked image that hold personal data."""
    out = [[m.start(), m.end()] for p in PRIVATE for m in re.finditer(p, b)]
    out += [[m.start(1), m.end(1)] for m in re.finditer(rb'(?=(\d{6}))', b) if hashlib.sha256(m.group(1)).hexdigest() == PRIVATE_SHA]
    return out


def disk_masks(mm, hdr, st):
    """The packed-file bytes that the unpacker copies into those ranges (literals; back-references hold no digits)."""
    out = sorted({st['litmap'][a] for s, e in mm for k in range(s, e) if (a := st['outmin'] + k - hdr) in st['litmap']})
    return [[k, k + 1] for k in out]


def memory_layer(key):
    img = (UNP / key).read_bytes(); n = len(img)
    exe = img[:2] == b'MZ'
    kind = ['data'] * n
    R = []
    if exe:
        _, _, nrel, hdrp, _, _, ss, sp, _, ip, cs, lfa = struct.unpack('<12H', img[2:26])
        hdr = hdrp * 16; entry = hdr + cs * 16 + ip; segbase = hdr + cs * 16; entry_txt = f'{cs:04X}:{ip:04X}'
        for i in range(hdr): kind[i] = 'header'
        for i in range(lfa, lfa + 4 * nrel): kind[i] = 'reloc'
        for i in range(lfa + 4 * nrel, hdr): kind[i] = 'pad'
    else:
        hdr = 0; nrel = 0; entry = 0; segbase = -0x100; entry_txt = '0100'
    code = trace(img, hdr, [(entry, segbase)])
    for off, (sz, _, _) in code.items():
        for k in range(off, off + sz): kind[k] = 'code'
    # text: printable runs outside code
    for m in re.finditer(rb'[\x20-\x7e\t\r\n]{5,}', img):
        a, b = m.start(), m.end()
        if a < hdr or any(kind[k] == 'code' for k in range(a, b)): continue
        s = m.group().decode('latin-1')
        if sum(ch.isalpha() for ch in s) >= 0.5 * len(s.strip()) and re.search(r'[A-Za-z]{3}', s):
            for k in range(a, b): kind[k] = 'text'
    for m in re.finditer(rb'\x00{32,}', img):
        if m.start() < hdr: continue
        for k in range(m.start(), m.end()):
            if kind[k] == 'data': kind[k] = 'unused'
    # runs, then fold tiny runs into their left neighbour so the map reads as regions, not noise
    runs = []
    for i, k in enumerate(kind):
        if runs and runs[-1][2] == k: runs[-1][1] = i + 1
        else: runs.append([i, i + 1, k])
    merged = []
    for r in runs:
        if merged and r[1] - r[0] < 8 and r[2] in ('data', 'unused', 'text') and merged[-1][2] not in ('header', 'reloc', 'pad'):
            merged[-1][1] = r[1]
        elif merged and merged[-1][2] == r[2]: merged[-1][1] = r[1]
        else: merged.append(r)
    # compact rows [start, end, kind, extra]; labels and notes are written by the explorer (src/scripts/bytes/regions.ts)
    for a, b, k in merged:
        if k == 'text':
            x = re.sub(rb'[^\x20-\x7e]+', b' ', img[a:b]).decode().strip()
            for p in PRIVATE: x = re.sub(p.decode(), '(hidden)', x)
            x = re.sub(r'\d{6}', lambda m: '(hidden)' if hashlib.sha256(m.group().encode()).hexdigest() == PRIVATE_SHA else m.group(), x)
            x = x[:48] + ('\u2026' if len(x) > 48 else '')
        elif k == 'data': x = round(ent(img[a:b]), 1)
        else: x = 0
        R.append([a, b, k, x])
    return img, R, code, hdr, nrel, entry, entry_txt


def anatomy_code(img, hdr, anat, traced, com):
    """Linear disassembly of authored code regions and routines, so the Code level can show them.
    Segment base: COM files load at offset 100h; EXE code takes the segment of the nearest traced instruction (inference)."""
    cov = bytearray(len(img))
    for o, (sz, _, _) in traced.items(): cov[o:o + sz] = b'\1' * sz
    segs = sorted((o, sb) for o, (_, _, sb) in traced.items())
    out = []
    for r in anat.get('routines', []) + [r for r in anat.get('regions', []) if r.get('kind') in ('code', 'library', 'startup')]:
        p, e = r['start'], min(r['end'], len(img))
        if com: base = -0x100
        else:
            k = bisect.bisect_right(segs, (p, float('inf'))) - 1
            base = segs[k][1] if k >= 0 and 0 <= p - segs[k][1] <= 0xffff else hdr + ((p - hdr) & ~0xffff)
        while p < e:
            if cov[p]: p += 1; continue
            i = next(md.disasm(img[p:p + 16], (p - base) & 0xffff), None)
            if i is None or any(cov[p:p + i.size]): p += 1; continue
            out.append([p, i.size, fmt(i.mnemonic, i.op_str)]); cov[p:p + i.size] = b'\1' * i.size; p += i.size
    return out


def main():
    PUB.mkdir(parents=True, exist_ok=True); (PUB / 'files').mkdir(exist_ok=True); (PUB / 'code').mkdir(exist_ok=True)
    for old in ('plate.bin', 'plate.json', 'plate.png'):
        (PUB / old).unlink(missing_ok=True)
    rows = collections.defaultdict(list)
    for f in FILES: rows[f[3]].append(f)
    files = []; nib = bytearray(); y = 0; tot = collections.Counter(); RUNS = av_runs()
    for r in sorted(rows):
        built = []
        for key, path, pid, _ in rows[r]:
            d, c, dreg, frags, dcode, out, st = disk_layer(path)
            img, mreg, mcode, hdr, nrel, entry, entry_txt = memory_layer(key)
            built.append((key, path, pid, d, c, dreg, frags, dcode, img, mreg, mcode, hdr, nrel, entry, entry_txt, st))
        sizes = [len(b[8]) for b in built]
        avail = W - GAP * (len(built) - 1); H = sum(sizes) / avail
        widths = [max(16, round(s / H / 16) * 16) for s in sizes]
        widths[sizes.index(max(sizes))] += W - GAP * (len(built) - 1) - sum(widths)
        x = 0; rowh = 0
        for b, w in zip(built, widths):
            key, path, pid, d, c, dreg, frags, dcode, img, mreg, mcode, hdr, nrel, entry, entry_txt, st = b
            h = -(-len(img) // w); rowh = max(rowh, h)
            mm = masks(img)
            dm = disk_masks(mm, hdr, st)
            frags = [f for f in frags if not any(a < f['a'] + f['n'] and f['a'] < e for a, e in dm)]
            dd = bytearray(d); mi = bytearray(img)
            for a, e in dm: dd[a:e] = bytes(e - a)
            for a, e in mm: mi[a:e] = bytes(e - a)
            hot = []
            for ext, data in (('disk', bytes(dd)), ('mem', bytes(mi))):
                if any(r in data for r in RUNS): hot.append(ext); data = scramble(data)
                (PUB / 'files' / f'{key}.{ext}').write_bytes(data)
            anat_p = ANAT / f'{key}.json'
            anat = json.loads(anat_p.read_text()) if anat_p.exists() else {}
            mcode = sorted([[o, sz, t] for o, (sz, t, _) in mcode.items()] + anatomy_code(bytes(mi), hdr, anat, mcode, img[:2] != b'MZ'))
            (PUB / 'code' / f'{key}.json').write_text(json.dumps({'disk': dcode, 'mem': mcode}, separators=(',', ':')))
            start = len(nib) * 2
            for k in c: tot[k] += 1
            vals = [DISK.index(k) for k in c] + ([0] if len(c) % 2 else [])
            nib += bytes(vals[i] | vals[i + 1] << 4 for i in range(0, len(vals), 2))
            files.append({
                'key': key, 'path': path, 'id': pid, 'x': x, 'y': y, 'w': w, 'h': h, 'scrambled': hot,
                'disk': {'size': len(d), 'start': start, 'out': out, 'com': d[:2] != b'MZ', 'regions': dreg, 'strings': frags,
                         'counts': {k: c.count(k) for k in DISK[1:] if c.count(k)}, 'mask': dm},
                'mem': {'size': len(img), 'hdr': hdr, 'relocs': nrel, 'entry': entry, 'entryText': entry_txt, 'auto': mreg, 'mask': mm},
            })
            x += w + GAP
        y += rowh + GAP
    (PUB / 'disk-classes.bin').write_bytes(bytes(nib))
    meta = {'W': W, 'H': y - GAP, 'disk': DISK, 'totals': {'disk': sum(f['disk']['size'] for f in files), 'mem': sum(f['mem']['size'] for f in files),
            'classes': dict(tot)}, 'files': files}
    (PUB / 'files.json').write_text(json.dumps(meta, separators=(',', ':')))
    print('plate', W, 'x', y - GAP, '| disk', meta['totals']['disk'], 'mem', meta['totals']['mem'])
    for f in files:
        print(f"  {f['key']:22} {f['w']:4}x{f['h']:4} auto regions {len(f['mem']['auto']):4} code "
              f"{sum(r[1] - r[0] for r in f['mem']['auto'] if r[2] == 'code'):6} masks {len(f['disk']['mask'])}/{len(f['mem']['mask'])}")


if __name__ == '__main__':
    main()
