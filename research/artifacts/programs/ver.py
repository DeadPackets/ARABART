import sys,struct
for p in sys.argv[1:]:
    d=open(p,'rb').read()
    if d[:2]!=b'MZ': continue
    hdr=struct.unpack('<H',d[8:10])[0]*16; ip,cs=struct.unpack('<HH',d[0x14:0x18])
    e=hdr+cs*16+ip
    print(p.split('programs/')[1], d[e+48:e+60].hex(), 'EP+55=%02x'%d[e+55], 'contains DIET?', b'DIET' in d, b'dlz' in d)
