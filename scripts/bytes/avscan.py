# Fails if any file holds Koko's signature in plain form (the 3 runs KVC checks, read from KVC itself).
#   python3 -I scripts/bytes/avscan.py [dir ...]     (default: public; run it on dist after a build)
import pathlib, struct, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def runs():
    img = (ROOT / 'research/artifacts/programs/unpacked/KVC_KVC.EXE').read_bytes()
    img = img[struct.unpack_from('<H', img, 8)[0] * 16:]
    return [img[0x3780 + o:0x3780 + o + n] for o, n in ((0x59f, 21), (0x5c1, 20), (0x5d5, 6))]


def scan(*dirs):
    R = runs()
    return [(str(p.relative_to(ROOT)), i) for d in dirs for p in sorted((ROOT / d).rglob('*')) if p.is_file()
            for i, r in enumerate(R) if r in p.read_bytes()]


if __name__ == '__main__':
    dirs = sys.argv[1:] or ['public']
    hits = scan(*dirs)
    print('\n'.join(f'{f}: run {i + 1}' for f, i in hits) or f'clean: no Koko signature run in {", ".join(dirs)}')
    sys.exit(1 if hits else 0)
