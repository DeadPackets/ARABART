# Extract file entries (record 0x35) and dependency timestamps (record 0x36) from EDITOR.PRJ.
import struct, re, datetime
d = open('/Users/deadpackets/workspace/DOSArchive/programs/EDIT/EDITOR.PRJ', 'rb').read()
def dos(t, dt):
    y, m, dd = (dt >> 9) + 1980, (dt >> 5) & 15, dt & 31; h, mi, s = t >> 11, (t >> 5) & 63, (t & 31) * 2
    return f'{y:04d}-{m:02d}-{dd:02d} {h:02d}:{mi:02d}:{s:02d}'
# record 0x35 at 0x118a: 4-byte header then 0x52-byte(?) entries: u16 idx, u32 time/date, u32 code, u32 data, u32 lines, name
r = d[0x118e:0x118e + 326]
for m in re.finditer(rb'([A-Z0-9_]+\.CPP)\x00', r):
    s = m.start() - 18
    idx, t, dt, code, data, lines = struct.unpack_from('<HHHIII', r, s)
    print(f'{m.group(1).decode():14} saved {dos(t, dt)}  code={code} data={data} lines={lines}')
t, dt = struct.unpack_from('<HH', d, 0x768 + 2); print('record 0x33 (last make?)', dos(t, dt))
# record 0x36 dependency stamps: pairs (u16 id, u32 stamp)
r6 = d[0x12d8:0x12d8 + 500]
stamps = sorted(set(struct.unpack_from('<HH', r6, i) for i in range(0, len(r6) - 4) if r6[i+3] in (0x16, 0x1b) and 0x1600 <= struct.unpack_from('<H', r6, i+2)[0] <= 0x1b60 and (struct.unpack_from('<H', r6, i+2)[0] & 31) and ((struct.unpack_from('<H', r6, i+2)[0] >> 5) & 15) in range(1, 13)))
print('distinct timestamps in dependency record:', [dos(t, dt) for t, dt in stamps])
