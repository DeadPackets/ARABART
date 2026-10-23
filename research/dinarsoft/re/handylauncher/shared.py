# One engine, three apps: finds the functions that HandySwitcher 2.7, HandyLauncher 3.4 and HandyMenu 3.6 share,
# byte for byte once their addresses are set aside. Writes SHARED.md here and the data for the site's function map.
# Run from the repo root:
#   uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/handylauncher/shared.py
import hashlib, json, os, re, struct, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'handyswitcher'))
import pefile
from capstone import Cs, CS_ARCH_ARM, CS_MODE_ARM
from armemu import extract, ordinals, REPO
from rsrc import walk
import dlg

APPS = [('HandySwitcher 2.7', 'DinarSoftHandySwitcher27_20061223.exe', 'HANDYS~1.001'),
        ('HandyLauncher 3.4', 'DinarSoftHandyLauncher34.CAB', 'HANDYL~1.001'),
        ('HandyMenu 3.6', 'DinarSoftHandyMenu36.CAB', 'HANDYM~1.001')]
# What each shared function does, named by its HandyLauncher address (read from the disassembly)
LABEL = {
    0x1553c: 'Your Pocket PC Code: reads the device ID and folds it to 16 characters',
    0x156c8: 'The key engine: a 120-number shuffle keyed by the product name',
    0x158ac: 'Takes the spaces and dashes out of a code',
    0x15908: 'Writes a code as four groups of four',
    0x159cc: 'Disguises the install date as 14 bytes',
    0x15b48: 'Reads the 14-byte date back and checks it',
    0x12bbc: 'Sets a dialog in Tahoma at the right size for the screen',
    0x135cc: 'Lays out the controls of a settings page',
    0x134ec: 'Opens the color picker for one menu color',
    0x11940: 'Turns a bitmap into an icon with a see-through background',
    0x15ef8: 'Makes the menu font, scaled for the screen',
    0x15d58: 'Reads the phone theme colors from the registry',
    0x1a8fc: 'Grows a block of memory when a list gets longer',
}
ORD = ordinals()

class Bin:
    def __init__(self, path):
        self.pe = pe = pefile.PE(path)
        self.base = pe.OPTIONAL_HEADER.ImageBase
        self.img = pe.get_memory_mapped_image()
        self.iat = {i.address: (i.name.decode() if i.name else ORD.get((d.dll.decode().lower(), i.ordinal), '#%d' % i.ordinal))
                    for d in pe.DIRECTORY_ENTRY_IMPORT for i in d.imports}
        pd = next(s for s in pe.sections if s.Name.startswith(b'.pdata'))
        raw = self.img[pd.VirtualAddress:pd.VirtualAddress + pd.Misc_VirtualSize]
        self.funcs = sorted((st, ((info >> 8) & 0x3FFFFF) * 4) for st, info in struct.iter_unpack('<II', raw[:len(raw) // 8 * 8]) if st)
        text = next(s for s in pe.sections if s.Name.startswith(b'.text'))
        t0 = self.base + text.VirtualAddress
        self.thunks = {}
        for o in range(0, text.Misc_VirtualSize - 8, 4):
            a, b = struct.unpack_from('<II', self.img, text.VirtualAddress + o)
            if a & 0xFFFFF000 == 0xE59FC000 and b == 0xE59CF000:
                tgt = self.u32(t0 + o + 8 + (a & 0xFFF))
                if tgt in self.iat: self.thunks[t0 + o] = self.iat[tgt]
        self.md = Cs(CS_ARCH_ARM, CS_MODE_ARM)
    def u32(self, va): return struct.unpack_from('<I', self.img, va - self.base)[0]
    def inimg(self, va): return self.base <= va < self.base + len(self.img)
    def wstr(self, va):
        if not self.inimg(va): return None
        o, s = va - self.base, ''
        while o + 2 <= len(self.img) and len(s) < 60:
            c = struct.unpack_from('<H', self.img, o)[0]
            if not c: break
            if c < 9 or c > 0x5FF: return None
            s += chr(c); o += 2
        return s if len(s) >= 2 else None
    def lines(self, st, ln):
        return list(self.md.disasm(bytes(self.img[st - self.base:st - self.base + ln]), st))
    def norm(self, st, ln):
        ins = self.lines(st, ln)
        lits = {i.address + 8 + int(m.group(1), 0) for i in ins
                for m in [re.match(r'\w+, \[pc, #(-?0x[0-9a-f]+|-?\d+)\]', i.op_str)] if i.mnemonic.startswith('ldr') and m}
        toks = []
        for i in ins:
            if i.address in lits: toks.append('LIT'); continue
            m = re.match(r'(\w+), \[pc, #(-?0x[0-9a-f]+|-?\d+)\]', i.op_str)
            if i.mnemonic.startswith('ldr') and m:
                v = self.u32(i.address + 8 + int(m.group(2), 0))
                d = self.iat.get(v) or self.wstr(v) or ('PTR' if self.inimg(v) else hex(v))
                toks.append('%s %s, =%s' % (i.mnemonic, m.group(1), d)); continue
            o = i.op_str
            if i.mnemonic.startswith('b') and o.startswith('#'):
                t = int(o[1:], 16)
                o = '+%d' % (t - st) if st <= t < st + ln else self.thunks.get(t, 'FN')
            toks.append(i.mnemonic + ' ' + o)
        return toks, lits

def show(b, st, ln, lits, n=14):
    out = []
    for i in b.lines(st, ln):
        if i.address in lits: break
        c = ''
        if i.mnemonic in ('bl', 'b') and i.op_str.startswith('#') and int(i.op_str[1:], 16) in b.thunks: c = b.thunks[int(i.op_str[1:], 16)]
        out.append(['%05X' % i.address, ('%-6s %s' % (i.mnemonic, i.op_str)).strip(), c])
        if len(out) == n: break
    return out

def main():
    bins = [Bin(os.path.join(extract(src), f)) for _, src, f in APPS]
    data = []
    for b in bins:
        fs = {}
        for st, ln in b.funcs:
            toks, lits = b.norm(st, ln)
            fs[st] = dict(size=ln, h=hashlib.sha1('\n'.join(toks).encode()).hexdigest()[:12], lits=lits)
        data.append(fs)
    by_hash = [{f['h']: a for a, f in fs.items()} for fs in data]
    hs, hl, hm = data
    shared = []
    seen = set()
    for a, f in sorted(hl.items()):  # one row per distinct function body (HandyLauncher keeps a few tiny ones twice)
        if f['h'] in by_hash[0] and f['h'] in by_hash[2] and f['h'] not in seen:
            seen.add(f['h'])
            shared.append((by_hash[0][f['h']], a, by_hash[2][f['h']], f['size']))
    pair = lambda x, y: (len(set(by_hash[x]) & set(by_hash[y])), sum(data[x][by_hash[x][h]]['size'] for h in set(by_hash[x]) & set(by_hash[y])))
    total = sum(s[3] for s in shared)
    md = ['# One engine, three apps', '',
          'Functions found in all three 2006 builds with the same instructions once addresses, branch targets and data pointers are set aside '
          '(strings, imported calls and constants still have to match). Function bounds come from each file’s `.pdata` table. '
          'Rerun: `uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/handylauncher/shared.py`.', '',
          '**%d functions, %s bytes of code, identical in HandySwitcher 2.7, HandyLauncher 3.4 and HandyMenu 3.6.**' % (len(shared), format(total, ',')), '',
          '| Pair | Identical functions | Bytes |', '|---|---|---|']
    for x, y in ((0, 1), (0, 2), (1, 2)):
        n, by = pair(x, y)
        md.append('| %s and %s | %d | %s |' % (APPS[x][0], APPS[y][0], n, format(by, ',')))
    md += ['', '| HandySwitcher 2.7 | HandyLauncher 3.4 | HandyMenu 3.6 | Bytes | What it does |', '|---|---|---|---|---|']
    for a, b_, c, sz in shared:
        md.append('| 0x%X | 0x%X | 0x%X | %d | %s |' % (a, b_, c, sz, LABEL.get(b_, '')))
    md += ['', 'Totals per file: ' + ', '.join('%s %d functions, %s bytes' % (APPS[i][0], len(data[i]), format(sum(f['size'] for f in data[i].values()), ',')) for i in range(3))]
    # The shared dialogs: the same controls with the same words in all three (image ids aside)
    DLGS = [('License Key', (105, 105, 105)), ('Custom Colors', (186, 179, 505))]
    md += ['', '| Dialog | HandySwitcher 2.7 | HandyLauncher 3.4 | HandyMenu 3.6 | Controls | Same controls with the same words |', '|---|---|---|---|---|---|']
    for name, ids in DLGS:
        seqs = []
        for b, i in zip(bins, ids):
            raw = next(d for t, n, l, d in walk(b.pe) if t == 'DIALOG' and n == i)
            seqs.append(sorted((str(it['cls']), str(it['text']) if isinstance(it['text'], str) else 'image') for it in dlg.parse(raw)['items']))
        md.append('| %s | %d | %d | %d | %d | %s |' % (name, *ids, len(seqs[1]), 'yes' if seqs[0] == seqs[1] == seqs[2] else 'no'))
    open(os.path.join(HERE, 'SHARED.md'), 'w').write('\n'.join(md) + '\n')
    sset = {a for a, f in hl.items() if f['h'] in seen}
    site = {
        'total': total, 'count': len(shared),
        'pairs': [[APPS[x][0], APPS[y][0], *pair(x, y)] for x, y in ((0, 1), (0, 2), (1, 2))],
        'funcs': [[a, f['size'], 1 if a in sset else 0] for a, f in sorted(hl.items())],
        'shared': [dict(addr=[a, b_, c], size=sz, label=LABEL.get(b_, ''),
                        code=[show(bins[k], ad, sz, data[k][ad]['lits']) for k, ad in enumerate((a, b_, c))])
                   for a, b_, c, sz in shared if b_ in LABEL],
    }
    json.dump(site, open(os.path.join(REPO, 'src', 'components', 'toys', 'ds-handylauncher', 'engine.json'), 'w'), separators=(',', ':'))
    print('\n'.join(md))

main()
