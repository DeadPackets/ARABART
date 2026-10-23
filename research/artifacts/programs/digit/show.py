# print dis/<seg>.txt lines in [a,b) for each "seg:a-b" arg, minus stack-check noise
import sys, re
for spec in sys.argv[1:]:
    seg, rng = spec.split(':'); a, b = (int(x, 16) for x in rng.split('-'))
    print('===', spec)
    for l in open(f'dis/{seg}.txt'):
        m = re.match(r'[0-9a-f]{4}:([0-9a-f]{4}) ', l)
        if m and a <= int(m.group(1), 16) < b and not re.search(r'165c|29ac|ja 0x', l): print(l.rstrip())
