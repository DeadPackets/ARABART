import sys,struct
for p in sys.argv[1:]:
    d=open(p,'rb').read()
    print("==",p,len(d))
    if d[:2] in (b'MZ',b'ZM'):
        f=struct.unpack('<14H',d[:28])
        sig,cblp,cp,crlc,cparhdr,minalloc,maxalloc,ss,sp,csum,ip,cs,lfarlc,ovno=f
        imgsize=(cp-1)*512+(cblp or 512)
        hdr=cparhdr*16
        print(f" cblp={cblp} cp={cp} imgsize={imgsize} relocs={crlc} hdr={hdr} min={minalloc:#x} max={maxalloc:#x} ss:sp={ss:#x}:{sp:#x} cs:ip={cs:#x}:{ip:#x} lfarlc={lfarlc:#x} ovno={ovno}")
        print(" hdr bytes 0x1c..0x40:",d[0x1c:0x40].hex(), repr(d[0x1c:0x40]))
        ent=hdr+cs*16+ip
        print(" overlay bytes after image:", len(d)-imgsize)
        print(" entry@file",hex(ent),d[ent:ent+48].hex())
    else:
        print(" COM first 64:",d[:64].hex())
