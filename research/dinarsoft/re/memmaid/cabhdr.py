# Dump a Windows CE CAB install header (the *.000 file): app name, CE range, files with their real names and folders,
# registry entries and shortcuts. Usage: python -I cabhdr.py <extracted-cab-dir>
import struct, sys, pathlib, json

d = pathlib.Path(sys.argv[1])
hdr = next(p for p in d.iterdir() if p.suffix == '.000')
b = hdr.read_bytes()
u16 = lambda o: struct.unpack_from('<H', b, o)[0]
u32 = lambda o: struct.unpack_from('<I', b, o)[0]
assert b[:4] == b'MSCE'
arch, cemin, cemin2, cemax, cemax2 = (u32(20 + 4 * i) for i in range(5))
n_str, n_dir, n_file, n_hive, n_key, n_link = (u16(48 + 2 * i) for i in range(6))
o_str, o_dir, o_file, o_hive, o_key, o_link = (u32(60 + 4 * i) for i in range(6))
cstr = lambda o, n: b[o:o + n].split(b'\0')[0].decode('latin-1')
app, prov = cstr(o_app := u16(84), u16(86)), cstr(u16(88), u16(90))

strings, o = {}, o_str
for _ in range(n_str):
    i, n = u16(o), u16(o + 2); strings[i] = cstr(o + 4, n); o += 4 + n
def spec(o, n): return [u16(o + 2 * k) for k in range(n // 2) if u16(o + 2 * k)]
dirs, o = {}, o_dir
for _ in range(n_dir):
    i, n = u16(o), u16(o + 2); dirs[i] = '\\'.join(strings[s] for s in spec(o + 4, n)); o += 4 + n
files, o = [], o_file
for _ in range(n_file):
    i, di, _u, fl, n = u16(o), u16(o + 2), u16(o + 4), u32(o + 6), u16(o + 10)
    files.append({'n': i, 'dir': dirs.get(di), 'name': cstr(o + 12, n), 'flags': hex(fl)}); o += 12 + n
hives, o = {}, o_hive
for _ in range(n_hive):
    i, root, _u, n = u16(o), u16(o + 2), u16(o + 4), u16(o + 6)
    hives[i] = ['HKCR', 'HKCU', 'HKLM', 'HKU'][root - 1] + '\\' + '\\'.join(strings[s] for s in spec(o + 8, n)); o += 8 + n
keys, o = [], o_key
for _ in range(n_key):
    i, hv, _sub, ty, n = u16(o), u16(o + 2), u16(o + 4), u32(o + 6), u16(o + 10)
    raw = b[o + 12:o + 12 + n]; name, _, val = raw.partition(b'\0')
    kind = {0x00000000: 'dword', 0x00000001: 'string', 0x00010000: 'multi', 0x00000001 | 0x10000: 'multi', 0x00000003: 'binary'}.get(ty & 0x10003, hex(ty))
    v = struct.unpack('<I', val[:4])[0] if ty & 0x10001 == 0 and len(val) >= 4 else val.rstrip(b'\0').decode('latin-1')
    keys.append({'key': hives[hv], 'name': name.decode('latin-1'), 'type': hex(ty), 'value': v}); o += 12 + n
links, o = [], o_link
for _ in range(n_link):
    i, _u, base, tgt, typ, n = (u16(o + 2 * k) for k in range(6))
    links.append({'base': base, 'target_file': tgt, 'is_file': typ, 'path': '\\'.join(strings.get(s, f'%{s}%') for s in spec(o + 12, n))}); o += 12 + n
print(json.dumps({'header': hdr.name, 'app': app, 'provider': prov, 'arch': arch, 'ce_min': f'{cemin}.{cemin2}', 'ce_max': f'{cemax}.{cemax2}',
                  'files': files, 'registry': keys, 'links': links}, indent=1))
