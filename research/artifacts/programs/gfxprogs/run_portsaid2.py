import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega
from sheet import sheet
d = Ega('../unpacked/PORTSAID_PORTSAID.EXE', keys=b'', maxins=400_000_000, snap_every=500)
d.run()
pal = d.pal
def rgb(p, c):
    a = p[c]; return (((a>>2)&1)*170+((a>>5)&1)*85, ((a>>1)&1)*170+((a>>4)&1)*85, (a&1)*170+((a>>3)&1)*85)
frames = [(f[2], f[3]) for f in d.frames] + [(d.render()[2], d.pal)]
print(len(frames), 'frames; INT10 AH=36 calls:', sum(1 for x in d.log if x == (0x10, 0x36)))
sheet('portsaid_sequence.png', frames, rgb, cols=3, w=640, h=350)
