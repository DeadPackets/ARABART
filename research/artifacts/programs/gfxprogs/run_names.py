import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega
d = Ega('../unpacked/NAMES_NAMES.COM', keys=b'', snap_every=0)
d.vgamode = 0x0d
fr = []
orig = d.port_in
def pin(uc, port, size, _):
    v = orig(uc, port, size, _)
    if port == 0x3da and d.retr % 400 == 0: fr.append(d.render())
    return v
d.uc.hook_del  # keep simple
d.port_in = pin
d.run()
print('retrace polls', d.retr, 'mode', hex(d.vgamode), 'log tail', d.log[-4:], 'ports', {k: v for k, v in d.ports.items()})
d.save('names_final.png')
print(d.screen(0) if False else '')
