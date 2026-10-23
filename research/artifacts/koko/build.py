# Build the harmless Koko double, two clean demo programs, and their Koko-marked copies.
# Every byte KVC checks is read from KVC itself (the unpacked research copy), nothing else is Koko's.
# The marked copies are stored scrambled, so no hosted file holds Koko's signature bytes in plain form;
# UNWRAP.COM, run first by START.BAT, unscrambles them inside the visitor's emulator.
# Run: uv run -q --with capstone python -I research/artifacts/koko/build.py
import os, struct, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SCENE = os.path.join(ROOT, 'programs', 'KVC_LIVE')
CLEAN = os.path.join(HERE, 'clean')

# KVC's own signature data (data segment at image offset 3780h)
_kvc = open(os.path.join(ROOT, 'research/artifacts/programs/unpacked/KVC_KVC.EXE'), 'rb').read()[0x40:]
_ds = 0x3780
COM_TAIL = _kvc[_ds + 0x59F:_ds + 0x59F + 21]   # push ax / mov ax,100h / push ax / xor ax,ax / retf / 08 00 / "KoKo (1)\n\r$"
BODY_MARK = _kvc[_ds + 0x5C1:_ds + 0x5C1 + 20]  # 20 bytes KVC expects at body+5F0h
RESTORE = _kvc[_ds + 0x5D5:_ds + 0x5D5 + 6]     # mov di,100h / mov si,122h, expected at body+127h
assert COM_TAIL.endswith(b'KoKo (1)\n\r$') and RESTORE == bytes.fromhex('bf0001be2201')

BODY_LEN = 0x6F4  # last byte KVC reads is body+6F3h
KEY0, KEY_STEP = 0xA5, 0x4D  # scramble: byte i XOR (A5h + i * 4Dh), a key that repeats only every 256 bytes


def asm(org, items, labels=None):
    """Tiny two-pass assembler: items are bytes, 'name:' labels, or (kind, label, prefix[, addend])."""
    size = {'rel8': 1, 'rel16': 2, 'abs16': 2}
    labels, pc = dict(labels or {}), org
    for it in items:
        if isinstance(it, str):
            labels[it[:-1]] = pc
        else:
            pc += len(it) if isinstance(it, bytes) else len(it[2]) + size[it[0]]
    out = bytearray()
    for it in items:
        if isinstance(it, str):
            continue
        if isinstance(it, bytes):
            out += it
            continue
        kind, lab, prefix = it[:3]
        out += prefix
        target = labels[lab] + (it[3] if len(it) > 3 else 0)
        end = org + len(out) + size[kind]
        if kind == 'rel8':
            assert -128 <= target - end < 128
            out += struct.pack('<b', target - end)
        elif kind == 'rel16':
            out += struct.pack('<h', target - end)
        else:
            out += struct.pack('<H', target)
    return bytes(out), labels


def double_com():
    """Resident stand-in: answers INT 21h AX=FF0Ch with C0C1h and parks the DOS entry in INT 3, nothing else."""
    def build(paras):
        return asm(0x100, [
            ('rel8', 'install', b'\xEB'),            # jmp install
            'old21:', b'\0\0\0\0',                   # original INT 21h (DOS entry)
            'handler:',
            b'\x3D\x0C\xFF',                         # cmp ax,0FF0Ch   the secret question
            ('rel8', 'chain', b'\x75'),              # jne chain
            b'\xB8\xC1\xC0',                         # mov ax,0C0C1h   Koko's answer
            b'\xCF',                                 # iret
            'chain:', ('abs16', 'old21', b'\x2E\xFF\x2E'),   # jmp far cs:[old21]  every other call goes to DOS
            'install:',
            b'\xB8\x21\x35', b'\xCD\x21',            # mov ax,3521h / int 21h   ES:BX = DOS entry
            ('abs16', 'old21', b'\x89\x1E'),         # mov [old21],bx
            ('abs16', 'old21', b'\x8C\x06', 2),      # mov [old21+2],es
            b'\x1E',                                 # push ds
            ('abs16', 'old21', b'\xC5\x16'),         # lds dx,[old21]
            b'\xB8\x03\x25', b'\xCD\x21',            # mov ax,2503h / int 21h   INT 3 = DOS entry (where KVC looks)
            b'\x1F',                                 # pop ds
            ('abs16', 'handler', b'\xBA'),           # mov dx,handler
            b'\xB8\x21\x25', b'\xCD\x21',            # mov ax,2521h / int 21h   INT 21h = handler
            ('abs16', 'msg', b'\xBA'),               # mov dx,msg
            b'\xB4\x09', b'\xCD\x21',                # mov ah,9 / int 21h
            b'\xBA' + struct.pack('<H', paras),      # mov dx,paragraphs to keep (PSP + handler)
            b'\xB8\x00\x31', b'\xCD\x21',            # mov ax,3100h / int 21h   stay resident
            'msg:', b"Koko double loaded. It only answers KVC's secret question.\r\n$",
        ])
    _, lab = build(0)
    return build((lab['install'] + 15) >> 4)


def scramble(data):
    """XOR with a rolling key; the same call unscrambles."""
    out, k = bytearray(data), KEY0
    for i in range(len(out)):
        out[i] ^= k
        k = (k + KEY_STEP) & 0xFF
    return bytes(out)


def unwrap_com():
    """Unscrambles HELLO.COM and GREET.EXE in place: open, read, XOR, write back, close. Nothing else."""
    code, _ = asm(0x100, [
        ('abs16', 'names', b'\xBE'),                # mov si,names
        'next:',
        b'\x80\x3C\x00',                           # cmp byte [si],0
        ('rel8', 'done', b'\x74'),                  # je done
        b'\x8B\xD6',                               # mov dx,si
        b'\xB8\x02\x3D', b'\xCD\x21',              # mov ax,3D02h / int 21h   open for reading and writing
        ('rel8', 'name', b'\x72'),                  # jc name
        b'\x93',                                   # xchg ax,bx                BX = the file
        b'\xB4\x3F', b'\xB9\x00\x10',               # mov ah,3Fh / mov cx,1000h
        ('abs16', 'buf', b'\xBA'), b'\xCD\x21',     # mov dx,buf / int 21h      read it all
        b'\x91', b'\x51',                          # xchg ax,cx / push cx      CX = its length
        ('abs16', 'buf', b'\xBF'),                  # mov di,buf
        b'\xB0' + bytes([KEY0]),                   # mov al,KEY0
        'mix:',
        b'\x30\x05', b'\x47',                      # xor [di],al / inc di
        b'\x04' + bytes([KEY_STEP]),               # add al,KEY_STEP
        ('rel8', 'mix', b'\xE2'),                   # loop mix
        b'\xB8\x00\x42', b'\x31\xC9', b'\x31\xD2', b'\xCD\x21',   # mov ax,4200h / xor cx,cx / xor dx,dx / int 21h   back to the start
        b'\x59', b'\xB4\x40',                      # pop cx / mov ah,40h
        ('abs16', 'buf', b'\xBA'), b'\xCD\x21',     # mov dx,buf / int 21h      write it back
        b'\xB4\x3E', b'\xCD\x21',                  # mov ah,3Eh / int 21h      close
        'name:',
        b'\xAC', b'\x84\xC0',                      # lodsb / test al,al        step past the name
        ('rel8', 'name', b'\x75'),                  # jnz name
        ('rel8', 'next', b'\xEB'),                  # jmp next
        'done:',
        b'\xB8\x00\x4C', b'\xCD\x21',              # mov ax,4C00h / int 21h
        'names:', b'HELLO.COM\0GREET.EXE\0\0',
        'buf:',
    ])
    return code


def hello_com():
    code, _ = asm(0x100, [
        b'\xB4\x09', ('abs16', 'msg', b'\xBA'), b'\xCD\x21',   # print
        b'\xB8\x00\x4C', b'\xCD\x21',                          # exit
        'msg:', b'Hello! I am HELLO.COM, a clean little program.\r\n$',
    ])
    return code


def greet_exe():
    code, _ = asm(0, [
        b'\x0E\x1F', ('abs16', 'msg', b'\xBA'), b'\xB4\x09', b'\xCD\x21',   # push cs / pop ds / print
        b'\xB8\x00\x4C', b'\xCD\x21',                                       # exit
        'msg:', b'Hello! I am GREET.EXE, a clean little program.\r\n$',
    ])
    image = code.ljust((len(code) + 15) & ~15, b'\0')  # paragraph-sized, like the files Koko appended to
    size = 32 + len(image)
    hdr = struct.pack('<2sHHHHHHHHHHHHH', b'MZ', size % 512, (size + 511) // 512, 0, 2, 0x20, 0xFFFF,
                      0, 0x200, 0, 0, 0, 0x1C, 0).ljust(32, b'\0')        # SS:SP 0000:0200, CS:IP 0000:0000
    return hdr + image


def body(host_is_exe, saved26, com_size=0, exe_regs=(0, 0, 0, 0)):
    """The fake virus body: Koko's layout at every offset KVC reads, harmless code everywhere it runs.
    Body offset X runs at offset X+100h of its own segment, as Koko's did."""
    b = bytearray(BODY_LEN)
    b[0:4] = b'\xEB\x60\x90\xEA'                     # jmp short +60h / nop / jmp far (KVC's EXE entry check)
    b[8] = 1 if host_is_exe else 0                   # our flag: which kind of host to return to
    b[0x18:0x1A] = struct.pack('<H', com_size)       # COM: original size (KVC cuts the file back to it)
    b[0x22:0x22 + 26] = saved26                      # COM: original first 26 bytes; EXE: original header
    b[0x4D:0x55] = struct.pack('<HHHH', *exe_regs)   # EXE: original CS, SS, IP, SP
    code, _ = asm(0x162, [                           # body+62h, where the entry jump lands
        b'\x0E\x1F',                                 # push cs / pop ds
        ('abs16', 'msg', b'\xBA'), b'\xB4\x09', b'\xCD\x21',   # print the one line
        b'\x80\x3E\x08\x01\x00',                     # cmp byte [108h],0
        ('rel8', 'exe', b'\x75'),                    # jne exe
        ('rel16', 'com', b'\xE9'),                   # jmp com (body+127h)
        'exe:',
        b'\x8C\xC0', b'\x05\x10\x00', b'\x8B\xD8',   # mov ax,es / add ax,10h / mov bx,ax  (load segment)
        b'\x03\x1E\x4F\x01', b'\x03\x06\x4D\x01',    # add bx,[14Fh] / add ax,[14Dh]   host SS, CS
        b'\x8B\x0E\x53\x01', b'\x8B\x16\x51\x01',    # mov cx,[153h] / mov dx,[151h]   host SP, IP
        b'\xFA\x8E\xD3\x8B\xE1\xFB',                 # cli / mov ss,bx / mov sp,cx / sti
        b'\x06\x1F\x50\x52\x33\xC0\xCB',             # push es / pop ds / push ax / push dx / xor ax,ax / retf
        'msg:', b"[This file wears Koko's marks for the KVC demo. It cannot spread.]\r\n$",
    ], {'com': 0x227})
    assert 0x62 + len(code) <= 0x127
    b[0x62:0x62 + len(code)] = code
    b[0x127:0x127 + 23] = RESTORE + bytes.fromhex(  # mov di,100h / mov si,122h, then:
        'b91a00' 'fc' 'f3a4'                         # mov cx,1Ah / cld / rep movsb   put the host's 26 bytes back
        '061f' '06' 'b80001' '50' '33c0' 'cb')       # push es / pop ds / push es / mov ax,100h / push ax / xor ax,ax / retf
    b[0x5F0:0x5F0 + 20] = BODY_MARK                  # data only, never run
    b[0x6DA:0x6DA + 26] = b'\x8C\xC8\x05\0\0' + COM_TAIL   # Koko's COM entry stub, kept as a template
    return bytes(b)


def mark_com(host):
    paras = (len(host) + 15) // 16
    stub = b'\x8C\xC8\x05' + struct.pack('<H', paras) + COM_TAIL   # mov ax,cs / add ax,paras / ... / retf to body
    return stub + host[26:].ljust(paras * 16 - 26, b'\0') + body(False, host[:26], com_size=len(host))


def mark_exe(orig):
    hdr_paras = struct.unpack('<H', orig[8:10])[0]
    ss, sp, _, ip, cs = struct.unpack('<HHHHH', orig[0x0E:0x18])
    vseg = (len(orig) - hdr_paras * 16) // 16            # body segment starts right after the original image
    out = bytearray(orig + bytes(0x100) + body(True, orig[:26], exe_regs=(cs, ss, ip, sp)))
    out[2:6] = struct.pack('<HH', len(out) % 512, (len(out) + 511) // 512)
    out[0x0E:0x12] = struct.pack('<HH', vseg, 0xC0C1)    # initial SP = C0C1h: Koko's EXE mark
    out[0x14:0x18] = struct.pack('<HH', 0x100, vseg)     # entry = body
    return bytes(out)


def listing(code, org):
    import capstone
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_16)
    return '\n'.join('%04X  %-20s %s %s' % (i.address, i.bytes.hex(' '), i.mnemonic, i.op_str) for i in md.disasm(code, org))


def main():
    double, dlab = double_com()
    hello, greet = hello_com(), greet_exe()
    unwrap = unwrap_com()
    os.makedirs(SCENE, exist_ok=True)
    os.makedirs(CLEAN, exist_ok=True)
    files = {
        'KVC.EXE': open(os.path.join(ROOT, 'programs/KVC/KVC.EXE'), 'rb').read(),
        'DOUBLE.COM': double,
        'HELLO.COM': scramble(mark_com(hello)),
        'GREET.EXE': scramble(mark_exe(greet)),
        'UNWRAP.COM': unwrap,
        'START.BAT': b'@ECHO OFF\r\nUNWRAP\r\nDEL UNWRAP.COM\r\nCLS\r\nDOUBLE\r\n'
                     b"ECHO HELLO.COM and GREET.EXE carry Koko's marks. Nothing here can spread.\r\n"
                     b'ECHO.\r\nECHO Type SCAN and press Enter. SCAN runs KVC C: to check drive C.\r\n',
        'SCAN.BAT': b'KVC C:\r\n',
    }
    for name, data in files.items():
        open(os.path.join(SCENE, name), 'wb').write(data)
    open(os.path.join(CLEAN, 'HELLO.COM'), 'wb').write(hello)
    open(os.path.join(CLEAN, 'GREET.EXE'), 'wb').write(greet)

    marked = scramble(files['HELLO.COM'])
    assert all(sig not in data for data in files.values() for sig in (COM_TAIL, BODY_MARK, RESTORE)), 'a plain signature run is in the scene'
    b = marked[(len(hello) + 15) // 16 * 16:]
    with open(os.path.join(HERE, 'listing.txt'), 'w') as f:
        f.write('UNWRAP.COM (all of it; runs first, then START.BAT deletes it)\n' + listing(unwrap[:unwrap.index(b'HELLO')], 0x100) + '\n\n')
        f.write('DOUBLE.COM (all of it)\n' + listing(double[:dlab['msg'] - 0x100], 0x100) + '\n\n')
        f.write('HELLO.COM entry stub, unscrambled (bytes 0-12; 13-25 are data)\n' + listing(marked[:13], 0x100) + '\n\n')
        f.write('Body entry, body+0 (runs at 0100h)\n' + listing(b[:4], 0x100) + '\n\n')
        f.write('Body code, body+62h\n' + listing(b[0x62:0x99], 0x162) + '\n\n')
        f.write('Body COM return, body+127h\n' + listing(b[0x127:0x13E], 0x227) + '\n')
    for name, data in files.items():
        print(f'{name:11} {len(data):6} bytes')


if __name__ == '__main__':
    main()
