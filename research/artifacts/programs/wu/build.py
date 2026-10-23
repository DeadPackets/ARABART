# Pastes the generated SVGs into the writeup templates and writes src/writeups/<id>.astro.
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); DST = '/Users/deadpackets/workspace/DOSArchive/src/writeups'
for f in sorted(os.listdir(os.path.join(HERE, 'tpl'))):
    s = open(os.path.join(HERE, 'tpl', f)).read()
    s = re.sub(r'@@([\w-]+)@@', lambda m: open(os.path.join(HERE, 'svg', m.group(1) + '.svg')).read(), s)
    assert '@@' not in s and '—' not in s, f
    for bad in ('colour', 'behaviour', 'centre', 'analyse', 'favour'):
        assert bad not in s.lower(), (f, bad)
    open(os.path.join(DST, f), 'w').write(s); print('wrote', f, len(s))
