import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sunrun import Sun, files
m = Sun('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000); m.run()
m.load('../unpacked/SUN_SUN.EXE', 0x2000); m.script = []; m.buf = None; m.polls = 0; m.shots = []; m.maxins = 3_000_000_000
m.run()
for n in list(range(0x34, 0x3f)) + [0x75, 0, 4, 5, 6, 0x10, 0x16, 0x1c, 8, 9]:
    off, seg = struct.unpack('<HH', bytes(m.uc.mem_read(n*4, 4)))
    print(f'INT {n:02x} -> {seg:04x}:{off:04x}  (rel seg {seg-0x2000:04x}, linear rel {(seg-0x2000)*16+off:05x})')
