"""Proof that src/components/toys/ds-hijridate/hijri.ts gives HijriDate 1.5's answer, by running the plug-in's own code.

unicorn runs HijriPlugin.dll's 0x104b38 (crescent adjustment, then Gregorian to Hijri: julianday, the new-moon series,
the Mecca rule) on SYSTEMTIME dates, with exact IEEE soft-float helpers. The TypeScript port runs the same dates in node.
Dates: every day of 1990 to 2040 with no adjustment, every day of 2000 to 2010 with each adjustment -2 to +2, and 3,000
random dates from 1700 to 2300 with random adjustments. Also prints today's date in his engine and in Intl's calendars.
Run: uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/hijridate/prove_calendar.py
"""
import os, sys, json, random, struct, subprocess, datetime as dt
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tools')); sys.path.insert(0, HERE)
from emu import Emu
from cab import extract

REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
CONVERT = 0x104b38  # (this, SYSTEMTIME *in, SYSTEMTIME *out, adjust) -> out = Hijri year, month, day


def dates():
    out = []
    d = dt.date(1990, 1, 1)
    while d <= dt.date(2040, 12, 31): out.append((d.year, d.month, d.day, 0)); d += dt.timedelta(1)
    d = dt.date(2000, 1, 1)
    while d <= dt.date(2010, 12, 31):
        out += [(d.year, d.month, d.day, a) for a in (-2, -1, 1, 2)]; d += dt.timedelta(1)
    r = random.Random(1)
    for _ in range(3000):
        d = dt.date(1700, 1, 1) + dt.timedelta(r.randrange((dt.date(2300, 12, 31) - dt.date(1700, 1, 1)).days))
        out.append((d.year, d.month, d.day, r.randrange(-2, 3)))
    return out


def main():
    e = Emu(extract('DinarSoftHijriDate15.CAB', 'HIJRIP~1.001'))
    st, res = e.alloc(16), e.alloc(16)
    todo = dates()
    dll = []
    for y, m, d, a in todo:
        dow = (dt.date(y, m, d).weekday() + 1) % 7
        e.uc.mem_write(st, struct.pack('<8H', y, m, dow, d, 0, 0, 0, 0))
        e.call(CONVERT, 0, st, res, a & 0xffffffff)
        hy, hm, _, hd = struct.unpack('<4H', bytes(e.uc.mem_read(res, 8)))
        dll.append([hy, hm, hd])
    mod = json.dumps(os.path.join(REPO, 'src/components/toys/ds-hijridate/hijri.ts'))
    js = (f"const h = await import({mod}); const todo = JSON.parse(require('fs').readFileSync(0, 'utf8'));"
          "console.log(JSON.stringify(todo.map(([y, m, d, a]) => { const r = h.toHijri(y, m, d, a); return [r.hy, r.hm, r.hd]; })));")
    js = js.replace("require('fs')", "(await import('node:fs'))")
    port = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], input=json.dumps(todo), check=True,
                                     capture_output=True, text=True).stdout)
    bad = [(t, a, b) for t, a, b in zip(todo, dll, port) if a != b]
    print(f'dates compared: {len(todo)} (1990-2040 daily, 2000-2010 x 4 adjustments, 3,000 random 1700-2300)')
    print(f'identical answers: {len(todo) - len(bad)} of {len(todo)}')
    for t, a, b in bad[:10]: print('  differs', t, 'dll', a, 'port', b)
    today = dt.date(2026, 10, 22)
    i = todo.index((today.year, today.month, today.day, 0))
    print(f'{today}: his engine says {dll[i][2]} {["Muharram","Safar","Rabi I","Rabi II","Jumada I","Jumada II","Rajab","Shaban","Ramadan","Shawwal","Dhu al-Qadah","Dhu al-Hijjah"][dll[i][1]-1]} {dll[i][0]}')
    print('unmapped imports touched: ' + (', '.join(sorted(e.missing)) or 'none'))
    ok = not bad and not e.missing
    print('PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
