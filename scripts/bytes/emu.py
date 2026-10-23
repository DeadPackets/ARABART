# Runs each packed program's own unpacker in an emulator and records, for every file byte,
# who touched it: header, entry code, unpacker code, control word, literal, back-reference token, reloc data.
import struct, json, sys, pathlib
from unicorn import *
from unicorn.x86_const import *
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
P=str(pathlib.Path(__file__).resolve().parents[2]/'programs')+'/'
md=Cs(CS_ARCH_X86, CS_MODE_16)
PSP=0x1000
def run(path):
    d=open(P+path,'rb').read()
    n=len(d); cls=['?']*n
    mu=Uc(UC_ARCH_X86, UC_MODE_16); mu.mem_map(0,0x100000)
    if d[:2]==b'MZ':
        cblp,cp,crlc,hdrp,mn,mx,ss,sp,cs_,ip,cs,lfarlc,ov=struct.unpack('<13H',d[2:28])
        hdr=hdrp*16; img=bytearray(d[hdr:]); ls=PSP+0x10
        for k in range(crlc):
            o,s=struct.unpack('<HH',d[lfarlc+4*k:lfarlc+4*k+4]); a=s*16+o
            img[a:a+2]=struct.pack('<H',(struct.unpack('<H',img[a:a+2])[0]+ls)&0xffff)
        for i in range(28): cls[i]='hdr'
        for i in range(lfarlc,lfarlc+4*crlc): cls[i]='rel'
        for i in range(28,hdr):
            if cls[i]=='?': cls[i]='hdr'
        mu.mem_write(ls*16,bytes(img))
        regs=dict(CS=ls+cs,IP=ip,SS=ls+ss,SP=sp,DS=PSP,ES=PSP)
        orig=lambda a: a-ls*16+hdr
        addr_of=lambda fo: ls*16+fo-hdr
        entry=(hdr+ip, {'cs':cs,'ip':ip,'hdr':hdr,'relocs':crlc})
    else:
        hdr=0; mu.mem_write(PSP*16+0x100,d)
        regs=dict(CS=PSP,IP=0x100,SS=PSP,SP=0xFFFE,DS=PSP,ES=PSP)
        orig=lambda a: a-PSP*16-0x100
        addr_of=lambda fo: PSP*16+0x100+fo
        entry=(0,{})
    for k,v in regs.items(): mu.reg_write(globals()['UC_X86_REG_'+k],v)
    st={'phase':0,'base':None,'cur':None,'steps':0,'ctrl':0}
    def inmoved(a): return st['base'] is not None and st['base']<=a<st['base']+n
    def fo_moved(a): return a-st['base']
    def hook_code(uc,addr,size,_):
        st['steps']+=1
        if st['steps']>80_000_000: uc.emu_stop(); return
        o=orig(addr)
        if st['phase']==0:
            if 0<=o<n and o < 0x80 and st['phase']==0:
                for i in range(o,o+size): cls[i]='stub'
                st['cur']=None; return
            # first instruction outside the stub: locate the moved copy by content
            mem=bytes(uc.mem_read(0,0x100000))
            probe=d[0x100:0x180]; olin=addr_of(0x100); b=-1; k=mem.find(probe)
            while k!=-1:
                if k!=olin: b=k; break
                k=mem.find(probe,k+1)
            st['base']=b-0x100; st['phase']=1
            mm=sum(1 for x,y in zip(mem[st['base']+0x60:st['base']+min(n,0x1800)],d[0x60:0x1800]) if x!=y); assert mm<=8, ('moved copy mismatch',mm,hex(olin),hex(b),[hex(i+0x60) for i,(x,y) in enumerate(zip(mem[st['base']+0x60:st['base']+n],d[0x60:])) if x!=y][:5], [hex(i+0x60) for i,(x,y) in enumerate(zip(mem[st['base']+0x60:st['base']+n],d[0x60:])) if x!=y][-3:])
        if inmoved(addr):
            fo=fo_moved(addr)
            for i in range(fo,fo+size):
                if cls[i] in('?','lit','tok','ctrl'): cls[i]='unp'
            ins=next(md.disasm(bytes(uc.mem_read(addr,size)),0))
            st['cur']=ins.mnemonic; st['ia']=fo
        else:
            uc.emu_stop()
    def hook_read(uc,acc,addr,size,val,_):
        if st['phase']!=1 or not inmoved(addr) or dirty[addr]: return
        m=st['cur']; fo=fo_moved(addr)
        tag={'lodsw':'ctrl','movsb':'lit','lodsb':'tok'}.get(m)
        if tag is None: return
        if tag=='ctrl': st.setdefault('lw',{}).setdefault(st['ia'],[]).extend(range(fo,fo+size)); return
        for i in range(fo,fo+size):
            if cls[i]=='?': cls[i]=tag
        if tag=='lit': st['lastlit']=fo
    st['out']=0; st['litmap']={}
    dirty=bytearray(0x100000)
    def hook_write(uc,acc,addr,size,val,_):
        if st['phase']==1: dirty[addr:addr+size]=b'\1'*size
        if st['phase']==1 and st['cur'] in ('stosb','movsb'):
            st['out']+=size; st['outmin']=min(st.get('outmin',addr),addr)
            # output address -> packed-file offset of the literal byte stored there
            if st['cur']=='movsb' and 'lastlit' in st: st['litmap'][addr]=st.pop('lastlit')
    mu.hook_add(UC_HOOK_MEM_WRITE,hook_write)
    mu.hook_add(UC_HOOK_CODE,hook_code); mu.hook_add(UC_HOOK_MEM_READ,hook_read)
    mu.hook_add(UC_HOOK_INTR,lambda uc,i,_: (print('  INT',hex(i)),uc.emu_stop()))
    start=(regs['CS']*16+regs['IP'])
    try: mu.emu_start(start, 0xfffff, count=0)
    except UcError as e: print('  UcError',e)
    st['mem']=bytes(mu.mem_read(st.get('outmin',0),st['out']))
    if 'lw' in st:
        g=max(st['lw'],key=lambda k:len(st['lw'][k]))
        for ia,offs in st['lw'].items():
            for i in offs:
                if cls[i]=='?': cls[i]='ctrl' if ia==g else 'rel2'
    return d,cls,st,entry
if __name__=='__main__':
    import collections
    for f in sys.argv[1:]:
        d,cls,st,entry=run(f)
        c=collections.Counter(cls)
        q=[i for i,x in enumerate(cls) if x=='?']
        runs=[];
        for i in q:
            if runs and runs[-1][1]==i-1: runs[-1][1]=i
            else: runs.append([i,i])
        print(f'{f:22} n={len(d)} out={st["out"]} ratio={len(d)/max(1,st["out"]):.2f} {dict(c)} ?={[(hex(a),b-a+1) for a,b in runs][:8]}')
