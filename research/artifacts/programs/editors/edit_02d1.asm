0541:0003 c8100000       enter 0x10, 0
0541:0007 3926d608       cmp word ptr [0x8d6], sp
0541:000b 7705           ja 0x12
0541:000d 9a072d0000     lcall __OVERFLOW
0541:0012 9ab8182a09     lcall 092a:18b8
0541:0017 6a01           push 1
0541:0019 6a00           push 0
0541:001b 6a00           push 0
0541:001d 9a85162b0d     lcall 0d2b:1685
0541:0022 83c406         add sp, 6
0541:0025 68a001         push 0x1a0
0541:0028 688002         push 0x280
0541:002b 6a20           push 0x20
0541:002d 6a00           push 0
0541:002f 6a00           push 0
0541:0031 6a00           push 0
0541:0033 9a0300d102     lcall 02d1:0003
0541:0038 83c40c         add sp, 0xc
0541:003b 8956fe         mov word ptr [bp - 2], dx
0541:003e 8946fc         mov word ptr [bp - 4], ax
0541:0041 68f210         push 0x10f2
0541:0044 68da03         push 0x3da
0541:0047 6a00           push 0
0541:0049 6a00           push 0
0541:004b 9af8004105     lcall 0541:00f8
0541:0050 83c408         add sp, 8
0541:0053 8956fa         mov word ptr [bp - 6], dx
0541:0056 8946f8         mov word ptr [bp - 8], ax
0541:0059 9a01001709     lcall 0917:0001
0541:005e ff76fe         push word ptr [bp - 2]
0541:0061 ff76fc         push word ptr [bp - 4]
0541:0064 ff76fa         push word ptr [bp - 6]
0541:0067 ff76f8         push word ptr [bp - 8]
0541:006a b8f210         mov ax, 0x10f2
0541:006d 8ec0           mov es, ax
0541:006f 26ff364c10     push word ptr es:[0x104c]
0541:0074 26ff364a10     push word ptr es:[0x104a]
0541:0079 6a00           push 0
0541:007b 6a00           push 0
0541:007d 9a02007304     lcall 0473:0002
0541:0082 83c410         add sp, 0x10
0541:0085 bbf210         mov bx, 0x10f2
0541:0088 8ec3           mov es, bx
0541:008a 2689164410     mov word ptr es:[0x1044], dx
0541:008f 26a34210       mov word ptr es:[0x1042], ax
0541:0093 6a00           push 0
0541:0095 6a00           push 0
0541:0097 6a00           push 0
0541:0099 b8f210         mov ax, 0x10f2
0541:009c 8ec0           mov es, ax
0541:009e 26ff364410     push word ptr es:[0x1044]
0541:00a3 26ff364210     push word ptr es:[0x1042]
0541:00a8 b8f210         mov ax, 0x10f2
0541:00ab 8ec0           mov es, ax
0541:00ad 26c41e4210     les bx, ptr es:[0x1042]
0541:00b2 268b5f28       mov bx, word ptr es:[bx + 0x28]
0541:00b6 ff5f04         lcall [bx + 4]
0541:00b9 83c40a         add sp, 0xa
0541:00bc 16             push ss
0541:00bd 8d46f0         lea ax, [bp - 0x10]
0541:00c0 50             push ax
0541:00c1 b8f210         mov ax, 0x10f2
0541:00c4 8ec0           mov es, ax
0541:00c6 26ff364410     push word ptr es:[0x1044]
0541:00cb 26ff364210     push word ptr es:[0x1042]
0541:00d0 9aa9017304     lcall 0473:01a9
0541:00d5 83c408         add sp, 8
0541:00d8 6a03           push 3
0541:00da b8f210         mov ax, 0x10f2
0541:00dd 8ec0           mov es, ax
0541:00df 26ff364410     push word ptr es:[0x1044]
0541:00e4 26ff364210     push word ptr es:[0x1042]
0541:00e9 9aa0007304     lcall 0473:00a0
0541:00ee 83c406         add sp, 6
0541:00f1 9a530e2b0d     lcall closegraph
0541:00f6 c9             leave 
0541:00f7 cb             retf 
02d1:0003 55             push bp
02d1:0004 8bec           mov bp, sp
02d1:0006 56             push si
02d1:0007 3926d608       cmp word ptr [0x8d6], sp
02d1:000b 7705           ja 0x12
02d1:000d 9a072d0000     lcall __OVERFLOW
02d1:0012 8b4606         mov ax, word ptr [bp + 6]
02d1:0015 0b4608         or ax, word ptr [bp + 8]
02d1:0018 7402           je 0x1c
02d1:001a eb0e           jmp 0x2a
02d1:001c 6a50           push 0x50
02d1:001e 9a4e270000     lcall op_new
02d1:0023 59             pop cx
02d1:0024 895608         mov word ptr [bp + 8], dx
02d1:0027 894606         mov word ptr [bp + 6], ax
02d1:002a 8b4606         mov ax, word ptr [bp + 6]
02d1:002d 0b4608         or ax, word ptr [bp + 8]
02d1:0030 7509           jne 0x3b
02d1:0032 8b5608         mov dx, word ptr [bp + 8]
02d1:0035 8b4606         mov ax, word ptr [bp + 6]
02d1:0038 e9a901         jmp 0x1e4
02d1:003b 6a08           push 8
02d1:003d 6a00           push 0
02d1:003f 6a00           push 0
02d1:0041 ff7610         push word ptr [bp + 0x10]
02d1:0044 ff760e         push word ptr [bp + 0xe]
02d1:0047 ff760c         push word ptr [bp + 0xc]
02d1:004a ff760a         push word ptr [bp + 0xa]
02d1:004d ff7608         push word ptr [bp + 8]
02d1:0050 ff7606         push word ptr [bp + 6]
02d1:0053 9a04002d0b     lcall 0b2d:0004
02d1:0058 83c412         add sp, 0x12
02d1:005b 895608         mov word ptr [bp + 8], dx
02d1:005e 894606         mov word ptr [bp + 6], ax
02d1:0061 c45e06         les bx, ptr [bp + 6]
02d1:0064 26c74728ad00   mov word ptr es:[bx + 0x28], 0xad
02d1:006a c45e06         les bx, ptr [bp + 6]
02d1:006d 26c747320000   mov word ptr es:[bx + 0x32], 0
02d1:0073 c45e06         les bx, ptr [bp + 6]
02d1:0076 26c747340000   mov word ptr es:[bx + 0x34], 0
02d1:007c c45e06         les bx, ptr [bp + 6]
02d1:007f 26c747360000   mov word ptr es:[bx + 0x36], 0
02d1:0085 c45e06         les bx, ptr [bp + 6]
02d1:0088 26c747380000   mov word ptr es:[bx + 0x38], 0
02d1:008e c45e06         les bx, ptr [bp + 6]
02d1:0091 26c747420000   mov word ptr es:[bx + 0x42], 0
02d1:0097 c45e06         les bx, ptr [bp + 6]
02d1:009a 26c7472a0000   mov word ptr es:[bx + 0x2a], 0
02d1:00a0 c45e06         les bx, ptr [bp + 6]
02d1:00a3 26c7472c0000   mov word ptr es:[bx + 0x2c], 0
02d1:00a9 c45e06         les bx, ptr [bp + 6]
02d1:00ac 26c7472e0000   mov word ptr es:[bx + 0x2e], 0
02d1:00b2 c45e06         les bx, ptr [bp + 6]
02d1:00b5 26c747300000   mov word ptr es:[bx + 0x30], 0
02d1:00bb c45e06         les bx, ptr [bp + 6]
02d1:00be 26c7474af401   mov word ptr es:[bx + 0x4a], 0x1f4
02d1:00c4 c45e06         les bx, ptr [bp + 6]
02d1:00c7 26c747460000   mov word ptr es:[bx + 0x46], 0
02d1:00cd c45e06         les bx, ptr [bp + 6]
02d1:00d0 268b474a       mov ax, word ptr es:[bx + 0x4a]
02d1:00d4 c1e002         shl ax, 2
02d1:00d7 50             push ax
02d1:00d8 9a4e270000     lcall op_new
02d1:00dd 59             pop cx
02d1:00de c45e06         les bx, ptr [bp + 6]
02d1:00e1 26895726       mov word ptr es:[bx + 0x26], dx
02d1:00e5 26894724       mov word ptr es:[bx + 0x24], ax
02d1:00e9 33f6           xor si, si
02d1:00eb eb1a           jmp 0x107
02d1:00ed c45e06         les bx, ptr [bp + 6]
02d1:00f0 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:00f4 8bc6           mov ax, si
02d1:00f6 c1e002         shl ax, 2
02d1:00f9 03d8           add bx, ax
02d1:00fb 26c747020000   mov word ptr es:[bx + 2], 0
02d1:0101 26c7070000     mov word ptr es:[bx], 0
02d1:0106 46             inc si
02d1:0107 81fef401       cmp si, 0x1f4
02d1:010b 7ce0           jl 0xed
02d1:010d 68ff00         push 0xff
02d1:0110 9a4e270000     lcall op_new
02d1:0115 59             pop cx
02d1:0116 c45e06         les bx, ptr [bp + 6]
02d1:0119 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:011d 26895702       mov word ptr es:[bx + 2], dx
02d1:0121 268907         mov word ptr es:[bx], ax
02d1:0124 68ff00         push 0xff
02d1:0127 6a00           push 0
02d1:0129 c45e06         les bx, ptr [bp + 6]
02d1:012c 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0130 26ff7702       push word ptr es:[bx + 2]
02d1:0134 26ff37         push word ptr es:[bx]
02d1:0137 9a221d0000     lcall 0000:1d22
02d1:013c 83c408         add sp, 8
02d1:013f c45e06         les bx, ptr [bp + 6]
02d1:0142 26c747440000   mov word ptr es:[bx + 0x44], 0
02d1:0148 c45e06         les bx, ptr [bp + 6]
02d1:014b 26c7473a0800   mov word ptr es:[bx + 0x3a], 8
02d1:0151 c45e06         les bx, ptr [bp + 6]
02d1:0154 26c747480000   mov word ptr es:[bx + 0x48], 0
02d1:015a 6a01           push 1
02d1:015c 6a00           push 0
02d1:015e 6a00           push 0
02d1:0160 9a85162b0d     lcall 0d2b:1685
02d1:0165 83c406         add sp, 6
02d1:0168 6a01           push 1
02d1:016a ff7608         push word ptr [bp + 8]
02d1:016d ff7606         push word ptr [bp + 6]
02d1:0170 9a32032d0b     lcall 0b2d:0332
02d1:0175 83c406         add sp, 6
02d1:0178 c45e06         les bx, ptr [bp + 6]
02d1:017b 2689473e       mov word ptr es:[bx + 0x3e], ax
02d1:017f 1e             push ds
02d1:0180 689a00         push 0x9a
02d1:0183 9a2d202b0d     lcall textwidth
02d1:0188 59             pop cx
02d1:0189 59             pop cx
02d1:018a c45e06         les bx, ptr [bp + 6]
02d1:018d 26894740       mov word ptr es:[bx + 0x40], ax
02d1:0191 c45e06         les bx, ptr [bp + 6]
02d1:0194 268b470a       mov ax, word ptr es:[bx + 0xa]
02d1:0198 c45e06         les bx, ptr [bp + 6]
02d1:019b 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:019f d1e2           shl dx, 1
02d1:01a1 2bc2           sub ax, dx
02d1:01a3 c45e06         les bx, ptr [bp + 6]
02d1:01a6 99             cdq 
02d1:01a7 26f77f3e       idiv word ptr es:[bx + 0x3e]
02d1:01ab c45e06         les bx, ptr [bp + 6]
02d1:01ae 2689473c       mov word ptr es:[bx + 0x3c], ax
02d1:01b2 6a0d           push 0xd
02d1:01b4 9a4e270000     lcall op_new
02d1:01b9 59             pop cx
02d1:01ba c45e06         les bx, ptr [bp + 6]
02d1:01bd 2689574e       mov word ptr es:[bx + 0x4e], dx
02d1:01c1 2689474c       mov word ptr es:[bx + 0x4c], ax
02d1:01c5 1e             push ds
02d1:01c6 689c00         push 0x9c  ; 'NONAME.TXT'
02d1:01c9 c45e06         les bx, ptr [bp + 6]
02d1:01cc 26ff774e       push word ptr es:[bx + 0x4e]
02d1:01d0 26ff774c       push word ptr es:[bx + 0x4c]
02d1:01d4 9ab0200000     lcall 0000:20b0
02d1:01d9 83c408         add sp, 8
02d1:01dc 8b5608         mov dx, word ptr [bp + 8]
02d1:01df 8b4606         mov ax, word ptr [bp + 6]
02d1:01e2 eb00           jmp 0x1e4
02d1:01e4 5e             pop si
02d1:01e5 5d             pop bp
02d1:01e6 cb             retf 
02d1:01e7 55             push bp
02d1:01e8 8bec           mov bp, sp
02d1:01ea 56             push si
02d1:01eb 3926d608       cmp word ptr [0x8d6], sp
02d1:01ef 7705           ja 0x1f6
02d1:01f1 9a072d0000     lcall __OVERFLOW
02d1:01f6 c45e06         les bx, ptr [bp + 6]
02d1:01f9 26c747320000   mov word ptr es:[bx + 0x32], 0
02d1:01ff c45e06         les bx, ptr [bp + 6]
02d1:0202 26c747340000   mov word ptr es:[bx + 0x34], 0
02d1:0208 c45e06         les bx, ptr [bp + 6]
02d1:020b 26c747360000   mov word ptr es:[bx + 0x36], 0
02d1:0211 c45e06         les bx, ptr [bp + 6]
02d1:0214 26c747380000   mov word ptr es:[bx + 0x38], 0
02d1:021a c45e06         les bx, ptr [bp + 6]
02d1:021d 26c747420000   mov word ptr es:[bx + 0x42], 0
02d1:0223 c45e06         les bx, ptr [bp + 6]
02d1:0226 26c7472a0000   mov word ptr es:[bx + 0x2a], 0
02d1:022c c45e06         les bx, ptr [bp + 6]
02d1:022f 26c7472c0000   mov word ptr es:[bx + 0x2c], 0
02d1:0235 c45e06         les bx, ptr [bp + 6]
02d1:0238 26c7472e0000   mov word ptr es:[bx + 0x2e], 0
02d1:023e c45e06         les bx, ptr [bp + 6]
02d1:0241 26c747300000   mov word ptr es:[bx + 0x30], 0
02d1:0247 c45e06         les bx, ptr [bp + 6]
02d1:024a 26c7474af401   mov word ptr es:[bx + 0x4a], 0x1f4
02d1:0250 c45e06         les bx, ptr [bp + 6]
02d1:0253 26c747460000   mov word ptr es:[bx + 0x46], 0
02d1:0259 33f6           xor si, si
02d1:025b eb34           jmp 0x291
02d1:025d c45e06         les bx, ptr [bp + 6]
02d1:0260 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0264 8bc6           mov ax, si
02d1:0266 c1e002         shl ax, 2
02d1:0269 03d8           add bx, ax
02d1:026b 268b07         mov ax, word ptr es:[bx]
02d1:026e 260b4702       or ax, word ptr es:[bx + 2]
02d1:0272 741c           je 0x290
02d1:0274 c45e06         les bx, ptr [bp + 6]
02d1:0277 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:027b 8bc6           mov ax, si
02d1:027d c1e002         shl ax, 2
02d1:0280 03d8           add bx, ax
02d1:0282 26ff7702       push word ptr es:[bx + 2]
02d1:0286 26ff37         push word ptr es:[bx]
02d1:0289 9a12270000     lcall 0000:2712
02d1:028e 59             pop cx
02d1:028f 59             pop cx
02d1:0290 46             inc si
02d1:0291 c45e06         les bx, ptr [bp + 6]
02d1:0294 2639774a       cmp word ptr es:[bx + 0x4a], si
02d1:0298 77c3           ja 0x25d
02d1:029a 33f6           xor si, si
02d1:029c eb1a           jmp 0x2b8
02d1:029e c45e06         les bx, ptr [bp + 6]
02d1:02a1 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:02a5 8bc6           mov ax, si
02d1:02a7 c1e002         shl ax, 2
02d1:02aa 03d8           add bx, ax
02d1:02ac 26c747020000   mov word ptr es:[bx + 2], 0
02d1:02b2 26c7070000     mov word ptr es:[bx], 0
02d1:02b7 46             inc si
02d1:02b8 c45e06         les bx, ptr [bp + 6]
02d1:02bb 2639774a       cmp word ptr es:[bx + 0x4a], si
02d1:02bf 77dd           ja 0x29e
02d1:02c1 68ff00         push 0xff
02d1:02c4 9a4e270000     lcall op_new
02d1:02c9 59             pop cx
02d1:02ca c45e06         les bx, ptr [bp + 6]
02d1:02cd 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:02d1 26895702       mov word ptr es:[bx + 2], dx
02d1:02d5 268907         mov word ptr es:[bx], ax
02d1:02d8 68ff00         push 0xff
02d1:02db 6a00           push 0
02d1:02dd c45e06         les bx, ptr [bp + 6]
02d1:02e0 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:02e4 26ff7702       push word ptr es:[bx + 2]
02d1:02e8 26ff37         push word ptr es:[bx]
02d1:02eb 9a221d0000     lcall 0000:1d22
02d1:02f0 83c408         add sp, 8
02d1:02f3 c45e06         les bx, ptr [bp + 6]
02d1:02f6 26c747440000   mov word ptr es:[bx + 0x44], 0
02d1:02fc c45e06         les bx, ptr [bp + 6]
02d1:02ff 26c747480000   mov word ptr es:[bx + 0x48], 0
02d1:0305 6a00           push 0
02d1:0307 6a00           push 0
02d1:0309 ff7608         push word ptr [bp + 8]
02d1:030c ff7606         push word ptr [bp + 6]
02d1:030f 9afb0ad102     lcall 02d1:0afb
02d1:0314 83c408         add sp, 8
02d1:0317 5e             pop si
02d1:0318 5d             pop bp
02d1:0319 cb             retf 
02d1:031a 55             push bp
02d1:031b 8bec           mov bp, sp
02d1:031d 56             push si
02d1:031e 3926d608       cmp word ptr [0x8d6], sp
02d1:0322 7705           ja 0x329
02d1:0324 9a072d0000     lcall __OVERFLOW
02d1:0329 8b4606         mov ax, word ptr [bp + 6]
02d1:032c 0b4608         or ax, word ptr [bp + 8]
02d1:032f 7503           jne 0x334
02d1:0331 e98200         jmp 0x3b6
02d1:0334 c45e06         les bx, ptr [bp + 6]
02d1:0337 26c74728ad00   mov word ptr es:[bx + 0x28], 0xad
02d1:033d 33f6           xor si, si
02d1:033f eb34           jmp 0x375
02d1:0341 c45e06         les bx, ptr [bp + 6]
02d1:0344 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0348 8bc6           mov ax, si
02d1:034a c1e002         shl ax, 2
02d1:034d 03d8           add bx, ax
02d1:034f 268b07         mov ax, word ptr es:[bx]
02d1:0352 260b4702       or ax, word ptr es:[bx + 2]
02d1:0356 741c           je 0x374
02d1:0358 c45e06         les bx, ptr [bp + 6]
02d1:035b 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:035f 8bc6           mov ax, si
02d1:0361 c1e002         shl ax, 2
02d1:0364 03d8           add bx, ax
02d1:0366 26ff7702       push word ptr es:[bx + 2]
02d1:036a 26ff37         push word ptr es:[bx]
02d1:036d 9a12270000     lcall 0000:2712
02d1:0372 59             pop cx
02d1:0373 59             pop cx
02d1:0374 46             inc si
02d1:0375 c45e06         les bx, ptr [bp + 6]
02d1:0378 2639774a       cmp word ptr es:[bx + 0x4a], si
02d1:037c 77c3           ja 0x341
02d1:037e c45e06         les bx, ptr [bp + 6]
02d1:0381 26ff7726       push word ptr es:[bx + 0x26]
02d1:0385 26ff7724       push word ptr es:[bx + 0x24]
02d1:0389 9a12270000     lcall 0000:2712
02d1:038e 59             pop cx
02d1:038f 59             pop cx
02d1:0390 6a00           push 0
02d1:0392 ff7608         push word ptr [bp + 8]
02d1:0395 ff7606         push word ptr [bp + 6]
02d1:0398 9aa7032d0b     lcall 0b2d:03a7
02d1:039d 83c406         add sp, 6
02d1:03a0 f7460a0100     test word ptr [bp + 0xa], 1
02d1:03a5 740f           je 0x3b6
02d1:03a7 ff7608         push word ptr [bp + 8]
02d1:03aa ff7606         push word ptr [bp + 6]
02d1:03ad 9a12270000     lcall 0000:2712
02d1:03b2 59             pop cx
02d1:03b3 59             pop cx
02d1:03b4 eb00           jmp 0x3b6
02d1:03b6 5e             pop si
02d1:03b7 5d             pop bp
02d1:03b8 cb             retf 
02d1:03b9 55             push bp
02d1:03ba 8bec           mov bp, sp
02d1:03bc 3926d608       cmp word ptr [0x8d6], sp
02d1:03c0 7705           ja 0x3c7
02d1:03c2 9a072d0000     lcall __OVERFLOW
02d1:03c7 6a00           push 0
02d1:03c9 ff7608         push word ptr [bp + 8]
02d1:03cc ff7606         push word ptr [bp + 6]
02d1:03cf 9af2072d0b     lcall 0b2d:07f2
02d1:03d4 83c406         add sp, 6
02d1:03d7 6a07           push 7
02d1:03d9 c45e06         les bx, ptr [bp + 6]
02d1:03dc 26ff770a       push word ptr es:[bx + 0xa]
02d1:03e0 c45e06         les bx, ptr [bp + 6]
02d1:03e3 26ff7708       push word ptr es:[bx + 8]
02d1:03e7 6a00           push 0
02d1:03e9 6a00           push 0
02d1:03eb ff7608         push word ptr [bp + 8]
02d1:03ee ff7606         push word ptr [bp + 6]
02d1:03f1 9a62022d0b     lcall 0b2d:0262
02d1:03f6 83c40e         add sp, 0xe
02d1:03f9 6a00           push 0
02d1:03fb 6a00           push 0
02d1:03fd ff7608         push word ptr [bp + 8]
02d1:0400 ff7606         push word ptr [bp + 6]
02d1:0403 9afb0ad102     lcall 02d1:0afb
02d1:0408 83c408         add sp, 8
02d1:040b 5d             pop bp
02d1:040c cb             retf 
02d1:040d c8020000       enter 2, 0
02d1:0411 56             push si
02d1:0412 3926d608       cmp word ptr [0x8d6], sp
02d1:0416 7705           ja 0x41d
02d1:0418 9a072d0000     lcall __OVERFLOW
02d1:041d ff7608         push word ptr [bp + 8]
02d1:0420 ff7606         push word ptr [bp + 6]
02d1:0423 9aeb0ed102     lcall 02d1:0eeb
02d1:0428 59             pop cx
02d1:0429 59             pop cx
02d1:042a 9a0c00230b     lcall 0b23:000c
02d1:042f 8946fe         mov word ptr [bp - 2], ax
02d1:0432 8b76fe         mov si, word ptr [bp - 2]
02d1:0435 b90d00         mov cx, 0xd
02d1:0438 bb3e05         mov bx, 0x53e
02d1:043b 2e3937         cmp word ptr cs:[bx], si
02d1:043e 7407           je 0x447
02d1:0440 43             inc bx
02d1:0441 43             inc bx
02d1:0442 e2f7           loop 0x43b
02d1:0444 e9ce00         jmp 0x515
02d1:0447 2eff671a       jmp word ptr cs:[bx + 0x1a]
02d1:044b ff7608         push word ptr [bp + 8]
02d1:044e ff7606         push word ptr [bp + 6]
02d1:0451 9a7205d102     lcall 02d1:0572
02d1:0456 59             pop cx
02d1:0457 59             pop cx
02d1:0458 e9d300         jmp 0x52e
02d1:045b ff7608         push word ptr [bp + 8]
02d1:045e ff7606         push word ptr [bp + 6]
02d1:0461 9acb08d102     lcall 02d1:08cb
02d1:0466 59             pop cx
02d1:0467 59             pop cx
02d1:0468 e9c300         jmp 0x52e
02d1:046b ff7608         push word ptr [bp + 8]
02d1:046e ff7606         push word ptr [bp + 6]
02d1:0471 9a3409d102     lcall 02d1:0934
02d1:0476 59             pop cx
02d1:0477 59             pop cx
02d1:0478 e9b300         jmp 0x52e
02d1:047b ff7608         push word ptr [bp + 8]
02d1:047e ff7606         push word ptr [bp + 6]
02d1:0481 9a7f0ad102     lcall 02d1:0a7f
02d1:0486 59             pop cx
02d1:0487 59             pop cx
02d1:0488 e9a300         jmp 0x52e
02d1:048b ff7608         push word ptr [bp + 8]
02d1:048e ff7606         push word ptr [bp + 6]
02d1:0491 9abb09d102     lcall 02d1:09bb
02d1:0496 59             pop cx
02d1:0497 59             pop cx
02d1:0498 e99300         jmp 0x52e
02d1:049b c45e06         les bx, ptr [bp + 6]
02d1:049e 268b4742       mov ax, word ptr es:[bx + 0x42]
02d1:04a2 f7d8           neg ax
02d1:04a4 1bc0           sbb ax, ax
02d1:04a6 40             inc ax
02d1:04a7 c45e06         les bx, ptr [bp + 6]
02d1:04aa 26894742       mov word ptr es:[bx + 0x42], ax
02d1:04ae eb7e           jmp 0x52e
02d1:04b0 c45e0a         les bx, ptr [bp + 0xa]
02d1:04b3 8b46fe         mov ax, word ptr [bp - 2]
02d1:04b6 268907         mov word ptr es:[bx], ax
02d1:04b9 eb73           jmp 0x52e
02d1:04bb ff7608         push word ptr [bp + 8]
02d1:04be ff7606         push word ptr [bp + 6]
02d1:04c1 9a4e10d102     lcall 02d1:104e
02d1:04c6 59             pop cx
02d1:04c7 59             pop cx
02d1:04c8 eb64           jmp 0x52e
02d1:04ca ff7608         push word ptr [bp + 8]
02d1:04cd ff7606         push word ptr [bp + 6]
02d1:04d0 9a7f14d102     lcall 02d1:147f
02d1:04d5 59             pop cx
02d1:04d6 59             pop cx
02d1:04d7 eb55           jmp 0x52e
02d1:04d9 ff7608         push word ptr [bp + 8]
02d1:04dc ff7606         push word ptr [bp + 6]
02d1:04df 9aa113d102     lcall 02d1:13a1
02d1:04e4 59             pop cx
02d1:04e5 59             pop cx
02d1:04e6 eb46           jmp 0x52e
02d1:04e8 ff7608         push word ptr [bp + 8]
02d1:04eb ff7606         push word ptr [bp + 6]
02d1:04ee 9ae214d102     lcall 02d1:14e2
02d1:04f3 59             pop cx
02d1:04f4 59             pop cx
02d1:04f5 eb37           jmp 0x52e
02d1:04f7 ff7608         push word ptr [bp + 8]
02d1:04fa ff7606         push word ptr [bp + 6]
02d1:04fd 9a0719d102     lcall 02d1:1907
02d1:0502 59             pop cx
02d1:0503 59             pop cx
02d1:0504 eb28           jmp 0x52e
02d1:0506 ff7608         push word ptr [bp + 8]
02d1:0509 ff7606         push word ptr [bp + 6]
02d1:050c 9a8819d102     lcall 02d1:1988
02d1:0511 59             pop cx
02d1:0512 59             pop cx
02d1:0513 eb19           jmp 0x52e
02d1:0515 f746feff00     test word ptr [bp - 2], 0xff
02d1:051a 7412           je 0x52e
02d1:051c 8a46fe         mov al, byte ptr [bp - 2]
02d1:051f 50             push ax
02d1:0520 ff7608         push word ptr [bp + 8]
02d1:0523 ff7606         push word ptr [bp + 6]
02d1:0526 9a4e0cd102     lcall 02d1:0c4e
02d1:052b 83c406         add sp, 6
02d1:052e c45e0a         les bx, ptr [bp + 0xa]
02d1:0531 26813f0044     cmp word ptr es:[bx], 0x4400
02d1:0536 7403           je 0x53b
02d1:0538 e9effe         jmp 0x42a
02d1:053b 5e             pop si
02d1:053c c9             leave 
02d1:053d cb             retf 
02d1:053e 080e0d1c       or byte ptr [0x1c0d], cl
02d1:0542 004400         add byte ptr [si], al
02d1:0545 47             inc di
02d1:0546 004800         add byte ptr [bx + si], cl
02d1:0549 49             dec cx
02d1:054a 004b00         add byte ptr [bp + di], cl
02d1:054d 4d             dec bp
02d1:054e 004f00         add byte ptr [bx], cl
02d1:0551 50             push ax
02d1:0552 005100         add byte ptr [bx + di], dl
02d1:0555 52             push dx
02d1:0556 0053d9         add byte ptr [bp + di - 0x27], dl
02d1:0559 044b           add al, 0x4b
02d1:055b 04b0           add al, 0xb0
02d1:055d 04ca           add al, 0xca
02d1:055f 045b           add al, 0x5b
02d1:0561 04f7           add al, 0xf7
02d1:0563 047b           add al, 0x7b
02d1:0565 048b           add al, 0x8b
02d1:0567 04e8           add al, 0xe8
02d1:0569 046b           add al, 0x6b
02d1:056b 0406           add al, 6
02d1:056d 059b04         add ax, 0x49b
02d1:0570 bb04c8         mov bx, 0xc804
02d1:0573 0400           add al, 0
02d1:0575 005657         add byte ptr [bp + 0x57], dl
02d1:0578 3926d608       cmp word ptr [0x8d6], sp
02d1:057c 7705           ja 0x583
02d1:057e 9a072d0000     lcall __OVERFLOW
02d1:0583 c45e06         les bx, ptr [bp + 6]
02d1:0586 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:058a 06             push es
02d1:058b c47e06         les di, ptr [bp + 6]
02d1:058e 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:0592 c1e002         shl ax, 2
02d1:0595 03d8           add bx, ax
02d1:0597 07             pop es
02d1:0598 268b07         mov ax, word ptr es:[bx]
02d1:059b 260b4702       or ax, word ptr es:[bx + 2]
02d1:059f 7552           jne 0x5f3
02d1:05a1 68ff00         push 0xff
02d1:05a4 9a4e270000     lcall op_new
02d1:05a9 59             pop cx
02d1:05aa c45e06         les bx, ptr [bp + 6]
02d1:05ad 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:05b1 50             push ax
02d1:05b2 52             push dx
02d1:05b3 06             push es
02d1:05b4 c47e06         les di, ptr [bp + 6]
02d1:05b7 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:05bb c1e002         shl ax, 2
02d1:05be 03d8           add bx, ax
02d1:05c0 07             pop es
02d1:05c1 58             pop ax
02d1:05c2 26894702       mov word ptr es:[bx + 2], ax
02d1:05c6 58             pop ax
02d1:05c7 268907         mov word ptr es:[bx], ax
02d1:05ca 68ff00         push 0xff
02d1:05cd 6a00           push 0
02d1:05cf c45e06         les bx, ptr [bp + 6]
02d1:05d2 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:05d6 06             push es
02d1:05d7 c47e06         les di, ptr [bp + 6]
02d1:05da 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:05de c1e002         shl ax, 2
02d1:05e1 03d8           add bx, ax
02d1:05e3 07             pop es
02d1:05e4 26ff7702       push word ptr es:[bx + 2]
02d1:05e8 26ff37         push word ptr es:[bx]
02d1:05eb 9a221d0000     lcall 0000:1d22
02d1:05f0 83c408         add sp, 8
02d1:05f3 c45e06         les bx, ptr [bp + 6]
02d1:05f6 06             push es
02d1:05f7 c47e06         les di, ptr [bp + 6]
02d1:05fa 268b454a       mov ax, word ptr es:[di + 0x4a]
02d1:05fe 48             dec ax
02d1:05ff 07             pop es
02d1:0600 26394748       cmp word ptr es:[bx + 0x48], ax
02d1:0604 7403           je 0x609
02d1:0606 e9a600         jmp 0x6af
02d1:0609 c45e06         les bx, ptr [bp + 6]
02d1:060c 268b474a       mov ax, word ptr es:[bx + 0x4a]
02d1:0610 051400         add ax, 0x14
02d1:0613 c1e002         shl ax, 2
02d1:0616 50             push ax
02d1:0617 9a4e270000     lcall op_new
02d1:061c 59             pop cx
02d1:061d 8956fe         mov word ptr [bp - 2], dx
02d1:0620 8946fc         mov word ptr [bp - 4], ax
02d1:0623 33f6           xor si, si
02d1:0625 eb27           jmp 0x64e
02d1:0627 c45e06         les bx, ptr [bp + 6]
02d1:062a 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:062e 8bc6           mov ax, si
02d1:0630 c1e002         shl ax, 2
02d1:0633 03d8           add bx, ax
02d1:0635 268b4702       mov ax, word ptr es:[bx + 2]
02d1:0639 268b17         mov dx, word ptr es:[bx]
02d1:063c 8bde           mov bx, si
02d1:063e c1e302         shl bx, 2
02d1:0641 c47efc         les di, ptr [bp - 4]
02d1:0644 03fb           add di, bx
02d1:0646 26894502       mov word ptr es:[di + 2], ax
02d1:064a 268915         mov word ptr es:[di], dx
02d1:064d 46             inc si
02d1:064e c45e06         les bx, ptr [bp + 6]
02d1:0651 2639774a       cmp word ptr es:[bx + 0x4a], si
02d1:0655 77d0           ja 0x627
02d1:0657 c45e06         les bx, ptr [bp + 6]
02d1:065a 268b774a       mov si, word ptr es:[bx + 0x4a]
02d1:065e eb16           jmp 0x676
02d1:0660 8bc6           mov ax, si
02d1:0662 c1e002         shl ax, 2
02d1:0665 c45efc         les bx, ptr [bp - 4]
02d1:0668 03d8           add bx, ax
02d1:066a 26c747020000   mov word ptr es:[bx + 2], 0
02d1:0670 26c7070000     mov word ptr es:[bx], 0
02d1:0675 46             inc si
02d1:0676 c45e06         les bx, ptr [bp + 6]
02d1:0679 268b474a       mov ax, word ptr es:[bx + 0x4a]
02d1:067d 050a00         add ax, 0xa
02d1:0680 3bc6           cmp ax, si
02d1:0682 77dc           ja 0x660
02d1:0684 c45e06         les bx, ptr [bp + 6]
02d1:0687 26ff7726       push word ptr es:[bx + 0x26]
02d1:068b 26ff7724       push word ptr es:[bx + 0x24]
02d1:068f 9a12270000     lcall 0000:2712
02d1:0694 59             pop cx
02d1:0695 59             pop cx
02d1:0696 c45e06         les bx, ptr [bp + 6]
02d1:0699 8b46fe         mov ax, word ptr [bp - 2]
02d1:069c 8b56fc         mov dx, word ptr [bp - 4]
02d1:069f 26894726       mov word ptr es:[bx + 0x26], ax
02d1:06a3 26895724       mov word ptr es:[bx + 0x24], dx
02d1:06a7 c45e06         les bx, ptr [bp + 6]
02d1:06aa 2683474a14     add word ptr es:[bx + 0x4a], 0x14
02d1:06af ff7608         push word ptr [bp + 8]
02d1:06b2 ff7606         push word ptr [bp + 6]
02d1:06b5 9aeb0ed102     lcall 02d1:0eeb
02d1:06ba 59             pop cx
02d1:06bb 59             pop cx
02d1:06bc c45e06         les bx, ptr [bp + 6]
02d1:06bf 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:06c3 06             push es
02d1:06c4 c47e06         les di, ptr [bp + 6]
02d1:06c7 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:06cb c1e002         shl ax, 2
02d1:06ce 03d8           add bx, ax
02d1:06d0 07             pop es
02d1:06d1 26c407         les ax, ptr es:[bx]
02d1:06d4 06             push es
02d1:06d5 c45e06         les bx, ptr [bp + 6]
02d1:06d8 26034738       add ax, word ptr es:[bx + 0x38]
02d1:06dc 8bd8           mov bx, ax
02d1:06de 07             pop es
02d1:06df 26803f00       cmp byte ptr es:[bx], 0
02d1:06e3 7503           jne 0x6e8
02d1:06e5 e94901         jmp 0x831
02d1:06e8 c45e06         les bx, ptr [bp + 6]
02d1:06eb 26837f4200     cmp word ptr es:[bx + 0x42], 0
02d1:06f0 7403           je 0x6f5
02d1:06f2 e93c01         jmp 0x831
02d1:06f5 c45e06         les bx, ptr [bp + 6]
02d1:06f8 268b7748       mov si, word ptr es:[bx + 0x48]
02d1:06fc eb2c           jmp 0x72a
02d1:06fe c45e06         les bx, ptr [bp + 6]
02d1:0701 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0705 8bc6           mov ax, si
02d1:0707 c1e002         shl ax, 2
02d1:070a 03d8           add bx, ax
02d1:070c 268b4702       mov ax, word ptr es:[bx + 2]
02d1:0710 268b17         mov dx, word ptr es:[bx]
02d1:0713 c45e06         les bx, ptr [bp + 6]
02d1:0716 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:071a 8bfe           mov di, si
02d1:071c 47             inc di
02d1:071d c1e702         shl di, 2
02d1:0720 03df           add bx, di
02d1:0722 26894702       mov word ptr es:[bx + 2], ax
02d1:0726 268917         mov word ptr es:[bx], dx
02d1:0729 4e             dec si
02d1:072a c45e06         les bx, ptr [bp + 6]
02d1:072d 26397736       cmp word ptr es:[bx + 0x36], si
02d1:0731 72cb           jb 0x6fe
02d1:0733 68ff00         push 0xff
02d1:0736 9a4e270000     lcall op_new
02d1:073b 59             pop cx
02d1:073c c45e06         les bx, ptr [bp + 6]
02d1:073f 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0743 50             push ax
02d1:0744 52             push dx
02d1:0745 06             push es
02d1:0746 c47e06         les di, ptr [bp + 6]
02d1:0749 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:074d 40             inc ax
02d1:074e c1e002         shl ax, 2
02d1:0751 03d8           add bx, ax
02d1:0753 07             pop es
02d1:0754 58             pop ax
02d1:0755 26894702       mov word ptr es:[bx + 2], ax
02d1:0759 58             pop ax
02d1:075a 268907         mov word ptr es:[bx], ax
02d1:075d 68ff00         push 0xff
02d1:0760 6a00           push 0
02d1:0762 c45e06         les bx, ptr [bp + 6]
02d1:0765 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0769 06             push es
02d1:076a c47e06         les di, ptr [bp + 6]
02d1:076d 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:0771 40             inc ax
02d1:0772 c1e002         shl ax, 2
02d1:0775 03d8           add bx, ax
02d1:0777 07             pop es
02d1:0778 26ff7702       push word ptr es:[bx + 2]
02d1:077c 26ff37         push word ptr es:[bx]
02d1:077f 9a221d0000     lcall 0000:1d22
02d1:0784 83c408         add sp, 8
02d1:0787 c45e06         les bx, ptr [bp + 6]
02d1:078a 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:078e 06             push es
02d1:078f c47e06         les di, ptr [bp + 6]
02d1:0792 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:0796 c1e002         shl ax, 2
02d1:0799 03d8           add bx, ax
02d1:079b 07             pop es
02d1:079c 268b07         mov ax, word ptr es:[bx]
02d1:079f 53             push bx
02d1:07a0 06             push es
02d1:07a1 c45e06         les bx, ptr [bp + 6]
02d1:07a4 26034738       add ax, word ptr es:[bx + 0x38]
02d1:07a8 07             pop es
02d1:07a9 5b             pop bx
02d1:07aa 26ff7702       push word ptr es:[bx + 2]
02d1:07ae 50             push ax
02d1:07af c45e06         les bx, ptr [bp + 6]
02d1:07b2 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:07b6 06             push es
02d1:07b7 c47e06         les di, ptr [bp + 6]
02d1:07ba 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:07be 40             inc ax
02d1:07bf c1e002         shl ax, 2
02d1:07c2 03d8           add bx, ax
02d1:07c4 07             pop es
02d1:07c5 26ff7702       push word ptr es:[bx + 2]
02d1:07c9 26ff37         push word ptr es:[bx]
02d1:07cc 9a27130000     lcall 0000:1327
02d1:07d1 83c408         add sp, 8
02d1:07d4 c45e06         les bx, ptr [bp + 6]
02d1:07d7 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:07db 06             push es
02d1:07dc c47e06         les di, ptr [bp + 6]
02d1:07df 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:07e3 c1e002         shl ax, 2
02d1:07e6 03d8           add bx, ax
02d1:07e8 07             pop es
02d1:07e9 26ff7702       push word ptr es:[bx + 2]
02d1:07ed 26ff37         push word ptr es:[bx]
02d1:07f0 9ad9200000     lcall strlen
02d1:07f5 59             pop cx
02d1:07f6 59             pop cx
02d1:07f7 c45e06         les bx, ptr [bp + 6]
02d1:07fa 262b4738       sub ax, word ptr es:[bx + 0x38]
02d1:07fe 50             push ax
02d1:07ff 6a00           push 0
02d1:0801 c45e06         les bx, ptr [bp + 6]
02d1:0804 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0808 06             push es
02d1:0809 c47e06         les di, ptr [bp + 6]
02d1:080c 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:0810 c1e002         shl ax, 2
02d1:0813 03d8           add bx, ax
02d1:0815 07             pop es
02d1:0816 268b07         mov ax, word ptr es:[bx]
02d1:0819 53             push bx
02d1:081a 06             push es
02d1:081b c45e06         les bx, ptr [bp + 6]
02d1:081e 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0822 07             pop es
02d1:0823 5b             pop bx
02d1:0824 26ff7702       push word ptr es:[bx + 2]
02d1:0828 50             push ax
02d1:0829 9a221d0000     lcall 0000:1d22
02d1:082e 83c408         add sp, 8
02d1:0831 c45e06         les bx, ptr [bp + 6]
02d1:0834 26c747460000   mov word ptr es:[bx + 0x46], 0
02d1:083a c45e06         les bx, ptr [bp + 6]
02d1:083d 26ff4748       inc word ptr es:[bx + 0x48]
02d1:0841 c45e06         les bx, ptr [bp + 6]
02d1:0844 268b470a       mov ax, word ptr es:[bx + 0xa]
02d1:0848 c45e06         les bx, ptr [bp + 6]
02d1:084b 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:084f d1e2           shl dx, 1
02d1:0851 2bc2           sub ax, dx
02d1:0853 c45e06         les bx, ptr [bp + 6]
02d1:0856 262b4734       sub ax, word ptr es:[bx + 0x34]
02d1:085a c45e06         les bx, ptr [bp + 6]
02d1:085d 263b473e       cmp ax, word ptr es:[bx + 0x3e]
02d1:0861 7714           ja 0x877
02d1:0863 6a01           push 1
02d1:0865 6a00           push 0
02d1:0867 ff7608         push word ptr [bp + 8]
02d1:086a ff7606         push word ptr [bp + 6]
02d1:086d 9a6f0fd102     lcall 02d1:0f6f
02d1:0872 83c408         add sp, 8
02d1:0875 eb2a           jmp 0x8a1
02d1:0877 c45e06         les bx, ptr [bp + 6]
02d1:087a 26ff7736       push word ptr es:[bx + 0x36]
02d1:087e c45e06         les bx, ptr [bp + 6]
02d1:0881 26ff7734       push word ptr es:[bx + 0x34]
02d1:0885 ff7608         push word ptr [bp + 8]
02d1:0888 ff7606         push word ptr [bp + 6]
02d1:088b 9afb0ad102     lcall 02d1:0afb
02d1:0890 83c408         add sp, 8
02d1:0893 c45e06         les bx, ptr [bp + 6]
02d1:0896 268b473e       mov ax, word ptr es:[bx + 0x3e]
02d1:089a c45e06         les bx, ptr [bp + 6]
02d1:089d 26014734       add word ptr es:[bx + 0x34], ax
02d1:08a1 c45e06         les bx, ptr [bp + 6]
02d1:08a4 26c747320000   mov word ptr es:[bx + 0x32], 0
02d1:08aa c45e06         les bx, ptr [bp + 6]
02d1:08ad 26ff4736       inc word ptr es:[bx + 0x36]
02d1:08b1 c45e06         les bx, ptr [bp + 6]
02d1:08b4 26c747380000   mov word ptr es:[bx + 0x38], 0
02d1:08ba ff7608         push word ptr [bp + 8]
02d1:08bd ff7606         push word ptr [bp + 6]
02d1:08c0 9aeb0ed102     lcall 02d1:0eeb
02d1:08c5 59             pop cx
02d1:08c6 59             pop cx
02d1:08c7 5f             pop di
02d1:08c8 5e             pop si
02d1:08c9 c9             leave 
02d1:08ca cb             retf 
02d1:08cb 55             push bp
02d1:08cc 8bec           mov bp, sp
02d1:08ce 3926d608       cmp word ptr [0x8d6], sp
02d1:08d2 7705           ja 0x8d9
02d1:08d4 9a072d0000     lcall __OVERFLOW
02d1:08d9 c45e06         les bx, ptr [bp + 6]
02d1:08dc 26837f3600     cmp word ptr es:[bx + 0x36], 0
02d1:08e1 7502           jne 0x8e5
02d1:08e3 eb4d           jmp 0x932
02d1:08e5 ff7608         push word ptr [bp + 8]
02d1:08e8 ff7606         push word ptr [bp + 6]
02d1:08eb 9aeb0ed102     lcall 02d1:0eeb
02d1:08f0 59             pop cx
02d1:08f1 59             pop cx
02d1:08f2 c45e06         les bx, ptr [bp + 6]
02d1:08f5 26837f3400     cmp word ptr es:[bx + 0x34], 0
02d1:08fa 7514           jne 0x910
02d1:08fc 6a01           push 1
02d1:08fe 6a01           push 1
02d1:0900 ff7608         push word ptr [bp + 8]
02d1:0903 ff7606         push word ptr [bp + 6]
02d1:0906 9a6f0fd102     lcall 02d1:0f6f
02d1:090b 83c408         add sp, 8
02d1:090e eb0e           jmp 0x91e
02d1:0910 c45e06         les bx, ptr [bp + 6]
02d1:0913 268b473e       mov ax, word ptr es:[bx + 0x3e]
02d1:0917 c45e06         les bx, ptr [bp + 6]
02d1:091a 26294734       sub word ptr es:[bx + 0x34], ax
02d1:091e c45e06         les bx, ptr [bp + 6]
02d1:0921 26ff4f36       dec word ptr es:[bx + 0x36]
02d1:0925 ff7608         push word ptr [bp + 8]
02d1:0928 ff7606         push word ptr [bp + 6]
02d1:092b 9aeb0ed102     lcall 02d1:0eeb
02d1:0930 59             pop cx
02d1:0931 59             pop cx
02d1:0932 5d             pop bp
02d1:0933 cb             retf 
02d1:0934 55             push bp
02d1:0935 8bec           mov bp, sp
02d1:0937 3926d608       cmp word ptr [0x8d6], sp
02d1:093b 7705           ja 0x942
02d1:093d 9a072d0000     lcall __OVERFLOW
02d1:0942 c45e06         les bx, ptr [bp + 6]
02d1:0945 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0949 c45e06         les bx, ptr [bp + 6]
02d1:094c 263b4748       cmp ax, word ptr es:[bx + 0x48]
02d1:0950 7502           jne 0x954
02d1:0952 eb65           jmp 0x9b9
02d1:0954 ff7608         push word ptr [bp + 8]
02d1:0957 ff7606         push word ptr [bp + 6]
02d1:095a 9aeb0ed102     lcall 02d1:0eeb
02d1:095f 59             pop cx
02d1:0960 59             pop cx
02d1:0961 c45e06         les bx, ptr [bp + 6]
02d1:0964 268b470a       mov ax, word ptr es:[bx + 0xa]
02d1:0968 c45e06         les bx, ptr [bp + 6]
02d1:096b 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:096f d1e2           shl dx, 1
02d1:0971 2bc2           sub ax, dx
02d1:0973 c45e06         les bx, ptr [bp + 6]
02d1:0976 262b4734       sub ax, word ptr es:[bx + 0x34]
02d1:097a c45e06         les bx, ptr [bp + 6]
02d1:097d 263b473e       cmp ax, word ptr es:[bx + 0x3e]
02d1:0981 7714           ja 0x997
02d1:0983 6a01           push 1
02d1:0985 6a00           push 0
02d1:0987 ff7608         push word ptr [bp + 8]
02d1:098a ff7606         push word ptr [bp + 6]
02d1:098d 9a6f0fd102     lcall 02d1:0f6f
02d1:0992 83c408         add sp, 8
02d1:0995 eb0e           jmp 0x9a5
02d1:0997 c45e06         les bx, ptr [bp + 6]
02d1:099a 268b473e       mov ax, word ptr es:[bx + 0x3e]
02d1:099e c45e06         les bx, ptr [bp + 6]
02d1:09a1 26014734       add word ptr es:[bx + 0x34], ax
02d1:09a5 c45e06         les bx, ptr [bp + 6]
02d1:09a8 26ff4736       inc word ptr es:[bx + 0x36]
02d1:09ac ff7608         push word ptr [bp + 8]
02d1:09af ff7606         push word ptr [bp + 6]
02d1:09b2 9aeb0ed102     lcall 02d1:0eeb
02d1:09b7 59             pop cx
02d1:09b8 59             pop cx
02d1:09b9 5d             pop bp
02d1:09ba cb             retf 
02d1:09bb 55             push bp
02d1:09bc 8bec           mov bp, sp
02d1:09be 56             push si
02d1:09bf 3926d608       cmp word ptr [0x8d6], sp
02d1:09c3 7705           ja 0x9ca
02d1:09c5 9a072d0000     lcall __OVERFLOW
02d1:09ca c45e06         les bx, ptr [bp + 6]
02d1:09cd 26817f38fe00   cmp word ptr es:[bx + 0x38], 0xfe
02d1:09d3 7503           jne 0x9d8
02d1:09d5 e9a400         jmp 0xa7c
02d1:09d8 c45e06         les bx, ptr [bp + 6]
02d1:09db 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:09df 06             push es
02d1:09e0 c47606         les si, ptr [bp + 6]
02d1:09e3 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:09e7 c1e002         shl ax, 2
02d1:09ea 03d8           add bx, ax
02d1:09ec 07             pop es
02d1:09ed 26c407         les ax, ptr es:[bx]
02d1:09f0 06             push es
02d1:09f1 c45e06         les bx, ptr [bp + 6]
02d1:09f4 26034738       add ax, word ptr es:[bx + 0x38]
02d1:09f8 8bd8           mov bx, ax
02d1:09fa 07             pop es
02d1:09fb 26803f00       cmp byte ptr es:[bx], 0
02d1:09ff 7502           jne 0xa03
02d1:0a01 eb79           jmp 0xa7c
02d1:0a03 ff7608         push word ptr [bp + 8]
02d1:0a06 ff7606         push word ptr [bp + 6]
02d1:0a09 9aeb0ed102     lcall 02d1:0eeb
02d1:0a0e 59             pop cx
02d1:0a0f 59             pop cx
02d1:0a10 c45e06         les bx, ptr [bp + 6]
02d1:0a13 268b4708       mov ax, word ptr es:[bx + 8]
02d1:0a17 c45e06         les bx, ptr [bp + 6]
02d1:0a1a 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:0a1e d1e2           shl dx, 1
02d1:0a20 2bc2           sub ax, dx
02d1:0a22 c45e06         les bx, ptr [bp + 6]
02d1:0a25 262b4732       sub ax, word ptr es:[bx + 0x32]
02d1:0a29 40             inc ax
02d1:0a2a c45e06         les bx, ptr [bp + 6]
02d1:0a2d 263b4740       cmp ax, word ptr es:[bx + 0x40]
02d1:0a31 7327           jae 0xa5a
02d1:0a33 6a0a           push 0xa
02d1:0a35 6a02           push 2
02d1:0a37 ff7608         push word ptr [bp + 8]
02d1:0a3a ff7606         push word ptr [bp + 6]
02d1:0a3d 9a6f0fd102     lcall 02d1:0f6f
02d1:0a42 83c408         add sp, 8
02d1:0a45 c45e06         les bx, ptr [bp + 6]
02d1:0a48 268b4740       mov ax, word ptr es:[bx + 0x40]
02d1:0a4c ba0a00         mov dx, 0xa
02d1:0a4f f7ea           imul dx
02d1:0a51 c45e06         les bx, ptr [bp + 6]
02d1:0a54 26294732       sub word ptr es:[bx + 0x32], ax
02d1:0a58 eb0e           jmp 0xa68
02d1:0a5a c45e06         les bx, ptr [bp + 6]
02d1:0a5d 268b4740       mov ax, word ptr es:[bx + 0x40]
02d1:0a61 c45e06         les bx, ptr [bp + 6]
02d1:0a64 26014732       add word ptr es:[bx + 0x32], ax
02d1:0a68 c45e06         les bx, ptr [bp + 6]
02d1:0a6b 26ff4738       inc word ptr es:[bx + 0x38]
02d1:0a6f ff7608         push word ptr [bp + 8]
02d1:0a72 ff7606         push word ptr [bp + 6]
02d1:0a75 9aeb0ed102     lcall 02d1:0eeb
02d1:0a7a 59             pop cx
02d1:0a7b 59             pop cx
02d1:0a7c 5e             pop si
02d1:0a7d 5d             pop bp
02d1:0a7e cb             retf 
02d1:0a7f 55             push bp
02d1:0a80 8bec           mov bp, sp
02d1:0a82 3926d608       cmp word ptr [0x8d6], sp
02d1:0a86 7705           ja 0xa8d
02d1:0a88 9a072d0000     lcall __OVERFLOW
02d1:0a8d c45e06         les bx, ptr [bp + 6]
02d1:0a90 26837f3800     cmp word ptr es:[bx + 0x38], 0
02d1:0a95 7502           jne 0xa99
02d1:0a97 eb60           jmp 0xaf9
02d1:0a99 ff7608         push word ptr [bp + 8]
02d1:0a9c ff7606         push word ptr [bp + 6]
02d1:0a9f 9aeb0ed102     lcall 02d1:0eeb
02d1:0aa4 59             pop cx
02d1:0aa5 59             pop cx
02d1:0aa6 c45e06         les bx, ptr [bp + 6]
02d1:0aa9 26837f3200     cmp word ptr es:[bx + 0x32], 0
02d1:0aae 7527           jne 0xad7
02d1:0ab0 6a0a           push 0xa
02d1:0ab2 6a03           push 3
02d1:0ab4 ff7608         push word ptr [bp + 8]
02d1:0ab7 ff7606         push word ptr [bp + 6]
02d1:0aba 9a6f0fd102     lcall 02d1:0f6f
02d1:0abf 83c408         add sp, 8
02d1:0ac2 c45e06         les bx, ptr [bp + 6]
02d1:0ac5 268b4740       mov ax, word ptr es:[bx + 0x40]
02d1:0ac9 ba0900         mov dx, 9
02d1:0acc f7ea           imul dx
02d1:0ace c45e06         les bx, ptr [bp + 6]
02d1:0ad1 26014732       add word ptr es:[bx + 0x32], ax
02d1:0ad5 eb0e           jmp 0xae5
02d1:0ad7 c45e06         les bx, ptr [bp + 6]
02d1:0ada 268b4740       mov ax, word ptr es:[bx + 0x40]
02d1:0ade c45e06         les bx, ptr [bp + 6]
02d1:0ae1 26294732       sub word ptr es:[bx + 0x32], ax
02d1:0ae5 c45e06         les bx, ptr [bp + 6]
02d1:0ae8 26ff4f38       dec word ptr es:[bx + 0x38]
02d1:0aec ff7608         push word ptr [bp + 8]
02d1:0aef ff7606         push word ptr [bp + 6]
02d1:0af2 9aeb0ed102     lcall 02d1:0eeb
02d1:0af7 59             pop cx
02d1:0af8 59             pop cx
02d1:0af9 5d             pop bp
02d1:0afa cb             retf 
02d1:0afb c8060000       enter 6, 0
02d1:0aff 56             push si
02d1:0b00 57             push di
02d1:0b01 8b760a         mov si, word ptr [bp + 0xa]
02d1:0b04 3926d608       cmp word ptr [0x8d6], sp
02d1:0b08 7705           ja 0xb0f
02d1:0b0a 9a072d0000     lcall __OVERFLOW
02d1:0b0f 6a01           push 1
02d1:0b11 9ab21d2b0d     lcall setcolor
02d1:0b16 59             pop cx
02d1:0b17 6a01           push 1
02d1:0b19 6a00           push 0
02d1:0b1b 6a00           push 0
02d1:0b1d 9a85162b0d     lcall 0d2b:1685
02d1:0b22 83c406         add sp, 6
02d1:0b25 c45e06         les bx, ptr [bp + 6]
02d1:0b28 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:0b2c c45e06         les bx, ptr [bp + 6]
02d1:0b2f 50             push ax
02d1:0b30 8bc6           mov ax, si
02d1:0b32 99             cdq 
02d1:0b33 26f77f3e       idiv word ptr es:[bx + 0x3e]
02d1:0b37 5a             pop dx
02d1:0b38 2bd0           sub dx, ax
02d1:0b3a 8956fe         mov word ptr [bp - 2], dx
02d1:0b3d 6a07           push 7
02d1:0b3f c45e06         les bx, ptr [bp + 6]
02d1:0b42 268b4706       mov ax, word ptr es:[bx + 6]
02d1:0b46 c45e06         les bx, ptr [bp + 6]
02d1:0b49 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:0b4d d1e2           shl dx, 1
02d1:0b4f 2bc2           sub ax, dx
02d1:0b51 2bc6           sub ax, si
02d1:0b53 40             inc ax
02d1:0b54 50             push ax
02d1:0b55 c45e06         les bx, ptr [bp + 6]
02d1:0b58 268b4708       mov ax, word ptr es:[bx + 8]
02d1:0b5c c45e06         les bx, ptr [bp + 6]
02d1:0b5f 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:0b63 d1e2           shl dx, 1
02d1:0b65 2bc2           sub ax, dx
02d1:0b67 50             push ax
02d1:0b68 56             push si
02d1:0b69 6a00           push 0
02d1:0b6b ff7608         push word ptr [bp + 8]
02d1:0b6e ff7606         push word ptr [bp + 6]
02d1:0b71 9a62022d0b     lcall 0b2d:0262
02d1:0b76 83c40e         add sp, 0xe
02d1:0b79 6a01           push 1
02d1:0b7b c45e06         les bx, ptr [bp + 6]
02d1:0b7e 268b4706       mov ax, word ptr es:[bx + 6]
02d1:0b82 c45e06         les bx, ptr [bp + 6]
02d1:0b85 262b470c       sub ax, word ptr es:[bx + 0xc]
02d1:0b89 50             push ax
02d1:0b8a c45e06         les bx, ptr [bp + 6]
02d1:0b8d 268b4704       mov ax, word ptr es:[bx + 4]
02d1:0b91 c45e06         les bx, ptr [bp + 6]
02d1:0b94 262b470c       sub ax, word ptr es:[bx + 0xc]
02d1:0b98 50             push ax
02d1:0b99 c45e06         les bx, ptr [bp + 6]
02d1:0b9c 268b4702       mov ax, word ptr es:[bx + 2]
02d1:0ba0 c45e06         les bx, ptr [bp + 6]
02d1:0ba3 2603470c       add ax, word ptr es:[bx + 0xc]
02d1:0ba7 50             push ax
02d1:0ba8 c45e06         les bx, ptr [bp + 6]
02d1:0bab 06             push es
02d1:0bac 8e4608         mov es, word ptr [bp + 8]
02d1:0baf 53             push bx
02d1:0bb0 8b5e06         mov bx, word ptr [bp + 6]
02d1:0bb3 268b07         mov ax, word ptr es:[bx]
02d1:0bb6 5b             pop bx
02d1:0bb7 07             pop es
02d1:0bb8 2603470c       add ax, word ptr es:[bx + 0xc]
02d1:0bbc 50             push ax
02d1:0bbd 9a180f2b0d     lcall setviewport
02d1:0bc2 83c40a         add sp, 0xa
02d1:0bc5 c45e06         les bx, ptr [bp + 6]
02d1:0bc8 8b460c         mov ax, word ptr [bp + 0xc]
02d1:0bcb 0346fe         add ax, word ptr [bp - 2]
02d1:0bce 26394748       cmp word ptr es:[bx + 0x48], ax
02d1:0bd2 730d           jae 0xbe1
02d1:0bd4 c45e06         les bx, ptr [bp + 6]
02d1:0bd7 268b4748       mov ax, word ptr es:[bx + 0x48]
02d1:0bdb 2b460c         sub ax, word ptr [bp + 0xc]
02d1:0bde 8946fe         mov word ptr [bp - 2], ax
02d1:0be1 8b7e0c         mov di, word ptr [bp + 0xc]
02d1:0be4 eb4a           jmp 0xc30
02d1:0be6 56             push si
02d1:0be7 6a00           push 0
02d1:0be9 9a24102b0d     lcall 0d2b:1024
02d1:0bee 59             pop cx
02d1:0bef 59             pop cx
02d1:0bf0 c45e06         les bx, ptr [bp + 6]
02d1:0bf3 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0bf7 8bc7           mov ax, di
02d1:0bf9 c1e002         shl ax, 2
02d1:0bfc 03d8           add bx, ax
02d1:0bfe 268b4702       mov ax, word ptr es:[bx + 2]
02d1:0c02 268b17         mov dx, word ptr es:[bx]
02d1:0c05 8946fc         mov word ptr [bp - 4], ax
02d1:0c08 8956fa         mov word ptr [bp - 6], dx
02d1:0c0b 8b46fa         mov ax, word ptr [bp - 6]
02d1:0c0e 0b46fc         or ax, word ptr [bp - 4]
02d1:0c11 7415           je 0xc28
02d1:0c13 c45e06         les bx, ptr [bp + 6]
02d1:0c16 8b46fa         mov ax, word ptr [bp - 6]
02d1:0c19 26034746       add ax, word ptr es:[bx + 0x46]
02d1:0c1d ff76fc         push word ptr [bp - 4]
02d1:0c20 50             push ax
02d1:0c21 9af6152b0d     lcall 0d2b:15f6
02d1:0c26 59             pop cx
02d1:0c27 59             pop cx
02d1:0c28 c45e06         les bx, ptr [bp + 6]
02d1:0c2b 2603773e       add si, word ptr es:[bx + 0x3e]
02d1:0c2f 47             inc di
02d1:0c30 8b460c         mov ax, word ptr [bp + 0xc]
02d1:0c33 0346fe         add ax, word ptr [bp - 2]
02d1:0c36 3bc7           cmp ax, di
02d1:0c38 7dac           jge 0xbe6
02d1:0c3a 5f             pop di
02d1:0c3b 5e             pop si
02d1:0c3c c9             leave 
02d1:0c3d cb             retf 
02d1:0c3e 55             push bp
02d1:0c3f 8bec           mov bp, sp
02d1:0c41 3926d608       cmp word ptr [0x8d6], sp
02d1:0c45 7705           ja 0xc4c
02d1:0c47 9a072d0000     lcall __OVERFLOW
02d1:0c4c 5d             pop bp
02d1:0c4d cb             retf 
02d1:0c4e c8040000       enter 4, 0
02d1:0c52 56             push si
02d1:0c53 57             push di
02d1:0c54 3926d608       cmp word ptr [0x8d6], sp
02d1:0c58 7705           ja 0xc5f
02d1:0c5a 9a072d0000     lcall __OVERFLOW
02d1:0c5f 6a01           push 1
02d1:0c61 6a00           push 0
02d1:0c63 6a00           push 0
02d1:0c65 9a85162b0d     lcall 0d2b:1685
02d1:0c6a 83c406         add sp, 6
02d1:0c6d c45e06         les bx, ptr [bp + 6]
02d1:0c70 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0c74 06             push es
02d1:0c75 8e4608         mov es, word ptr [bp + 8]
02d1:0c78 53             push bx
02d1:0c79 8b5e06         mov bx, word ptr [bp + 6]
02d1:0c7c 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0c80 c1e002         shl ax, 2
02d1:0c83 5b             pop bx
02d1:0c84 03d8           add bx, ax
02d1:0c86 07             pop es
02d1:0c87 268b07         mov ax, word ptr es:[bx]
02d1:0c8a 260b4702       or ax, word ptr es:[bx + 2]
02d1:0c8e 755c           jne 0xcec
02d1:0c90 68ff00         push 0xff
02d1:0c93 9a4e270000     lcall op_new
02d1:0c98 59             pop cx
02d1:0c99 c45e06         les bx, ptr [bp + 6]
02d1:0c9c 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0ca0 50             push ax
02d1:0ca1 52             push dx
02d1:0ca2 06             push es
02d1:0ca3 8e4608         mov es, word ptr [bp + 8]
02d1:0ca6 53             push bx
02d1:0ca7 8b5e06         mov bx, word ptr [bp + 6]
02d1:0caa 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0cae c1e002         shl ax, 2
02d1:0cb1 5b             pop bx
02d1:0cb2 03d8           add bx, ax
02d1:0cb4 07             pop es
02d1:0cb5 58             pop ax
02d1:0cb6 26894702       mov word ptr es:[bx + 2], ax
02d1:0cba 58             pop ax
02d1:0cbb 268907         mov word ptr es:[bx], ax
02d1:0cbe 68ff00         push 0xff
02d1:0cc1 6a00           push 0
02d1:0cc3 c45e06         les bx, ptr [bp + 6]
02d1:0cc6 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0cca 06             push es
02d1:0ccb 8e4608         mov es, word ptr [bp + 8]
02d1:0cce 53             push bx
02d1:0ccf 8b5e06         mov bx, word ptr [bp + 6]
02d1:0cd2 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0cd6 c1e002         shl ax, 2
02d1:0cd9 5b             pop bx
02d1:0cda 03d8           add bx, ax
02d1:0cdc 07             pop es
02d1:0cdd 26ff7702       push word ptr es:[bx + 2]
02d1:0ce1 26ff37         push word ptr es:[bx]
02d1:0ce4 9a221d0000     lcall 0000:1d22
02d1:0ce9 83c408         add sp, 8
02d1:0cec c45e06         les bx, ptr [bp + 6]
02d1:0cef 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0cf3 06             push es
02d1:0cf4 8e4608         mov es, word ptr [bp + 8]
02d1:0cf7 53             push bx
02d1:0cf8 8b5e06         mov bx, word ptr [bp + 6]
02d1:0cfb 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0cff c1e002         shl ax, 2
02d1:0d02 5b             pop bx
02d1:0d03 03d8           add bx, ax
02d1:0d05 07             pop es
02d1:0d06 26ff7702       push word ptr es:[bx + 2]
02d1:0d0a 26ff37         push word ptr es:[bx]
02d1:0d0d 9ad9200000     lcall strlen
02d1:0d12 59             pop cx
02d1:0d13 59             pop cx
02d1:0d14 8bf8           mov di, ax
02d1:0d16 807e0a09       cmp byte ptr [bp + 0xa], 9
02d1:0d1a 750d           jne 0xd29
02d1:0d1c c45e06         les bx, ptr [bp + 6]
02d1:0d1f 268b773a       mov si, word ptr es:[bx + 0x3a]
02d1:0d23 c6460a20       mov byte ptr [bp + 0xa], 0x20
02d1:0d27 eb03           jmp 0xd2c
02d1:0d29 be0100         mov si, 1
02d1:0d2c c45e06         les bx, ptr [bp + 6]
02d1:0d2f 268b4738       mov ax, word ptr es:[bx + 0x38]
02d1:0d33 03c6           add ax, si
02d1:0d35 48             dec ax
02d1:0d36 3dff00         cmp ax, 0xff
02d1:0d39 7203           jb 0xd3e
02d1:0d3b e9a901         jmp 0xee7
02d1:0d3e c45e06         les bx, ptr [bp + 6]
02d1:0d41 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:0d45 06             push es
02d1:0d46 8e4608         mov es, word ptr [bp + 8]
02d1:0d49 53             push bx
02d1:0d4a 8b5e06         mov bx, word ptr [bp + 6]
02d1:0d4d 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:0d51 c1e002         shl ax, 2
02d1:0d54 5b             pop bx
02d1:0d55 03d8           add bx, ax
02d1:0d57 07             pop es
02d1:0d58 268b4702       mov ax, word ptr es:[bx + 2]
02d1:0d5c 268b17         mov dx, word ptr es:[bx]
02d1:0d5f 8946fe         mov word ptr [bp - 2], ax
02d1:0d62 8956fc         mov word ptr [bp - 4], dx
02d1:0d65 c45e06         les bx, ptr [bp + 6]
02d1:0d68 26397f38       cmp word ptr es:[bx + 0x38], di
02d1:0d6c 761d           jbe 0xd8b
02d1:0d6e c45e06         les bx, ptr [bp + 6]
02d1:0d71 268b4738       mov ax, word ptr es:[bx + 0x38]
02d1:0d75 2bc7           sub ax, di
02d1:0d77 50             push ax
02d1:0d78 6a20           push 0x20
02d1:0d7a 8b46fc         mov ax, word ptr [bp - 4]
02d1:0d7d 03c7           add ax, di
02d1:0d7f ff76fe         push word ptr [bp - 2]
02d1:0d82 50             push ax
02d1:0d83 9a221d0000     lcall 0000:1d22
02d1:0d88 83c408         add sp, 8
02d1:0d8b c45e06         les bx, ptr [bp + 6]
02d1:0d8e 26837f4200     cmp word ptr es:[bx + 0x42], 0
02d1:0d93 7405           je 0xd9a
02d1:0d95 83fe01         cmp si, 1
02d1:0d98 7e50           jle 0xdea
02d1:0d9a c45e06         les bx, ptr [bp + 6]
02d1:0d9d b8ff00         mov ax, 0xff
02d1:0da0 262b4738       sub ax, word ptr es:[bx + 0x38]
02d1:0da4 50             push ax
02d1:0da5 c45e06         les bx, ptr [bp + 6]
02d1:0da8 8b46fc         mov ax, word ptr [bp - 4]
02d1:0dab 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0daf 03c6           add ax, si
02d1:0db1 ff76fe         push word ptr [bp - 2]
02d1:0db4 50             push ax
02d1:0db5 c45e06         les bx, ptr [bp + 6]
02d1:0db8 8b46fc         mov ax, word ptr [bp - 4]
02d1:0dbb 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0dbf ff76fe         push word ptr [bp - 2]
02d1:0dc2 50             push ax
02d1:0dc3 9a411d0000     lcall 0000:1d41
02d1:0dc8 83c40a         add sp, 0xa
02d1:0dcb 56             push si
02d1:0dcc 8a460a         mov al, byte ptr [bp + 0xa]
02d1:0dcf b400           mov ah, 0
02d1:0dd1 50             push ax
02d1:0dd2 c45e06         les bx, ptr [bp + 6]
02d1:0dd5 8b46fc         mov ax, word ptr [bp - 4]
02d1:0dd8 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0ddc ff76fe         push word ptr [bp - 2]
02d1:0ddf 50             push ax
02d1:0de0 9a221d0000     lcall 0000:1d22
02d1:0de5 83c408         add sp, 8
02d1:0de8 eb18           jmp 0xe02
02d1:0dea c45e06         les bx, ptr [bp + 6]
02d1:0ded 06             push es
02d1:0dee c446fc         les ax, ptr [bp - 4]
02d1:0df1 8cc2           mov dx, es
02d1:0df3 07             pop es
02d1:0df4 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0df8 8a5e0a         mov bl, byte ptr [bp + 0xa]
02d1:0dfb 8ec2           mov es, dx
02d1:0dfd 87d8           xchg ax, bx
02d1:0dff 268807         mov byte ptr es:[bx], al
02d1:0e02 ff7608         push word ptr [bp + 8]
02d1:0e05 ff7606         push word ptr [bp + 6]
02d1:0e08 9aeb0ed102     lcall 02d1:0eeb
02d1:0e0d 59             pop cx
02d1:0e0e 59             pop cx
02d1:0e0f c45e06         les bx, ptr [bp + 6]
02d1:0e12 268b4708       mov ax, word ptr es:[bx + 8]
02d1:0e16 c45e06         les bx, ptr [bp + 6]
02d1:0e19 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:0e1d d1e2           shl dx, 1
02d1:0e1f 2bc2           sub ax, dx
02d1:0e21 c45e06         les bx, ptr [bp + 6]
02d1:0e24 262b4732       sub ax, word ptr es:[bx + 0x32]
02d1:0e28 40             inc ax
02d1:0e29 c45e06         les bx, ptr [bp + 6]
02d1:0e2c 50             push ax
02d1:0e2d 8bc6           mov ax, si
02d1:0e2f 26f76f40       imul word ptr es:[bx + 0x40]
02d1:0e33 5a             pop dx
02d1:0e34 3bd0           cmp dx, ax
02d1:0e36 7325           jae 0xe5d
02d1:0e38 6a0a           push 0xa
02d1:0e3a 6a02           push 2
02d1:0e3c ff7608         push word ptr [bp + 8]
02d1:0e3f ff7606         push word ptr [bp + 6]
02d1:0e42 9a6f0fd102     lcall 02d1:0f6f
02d1:0e47 83c408         add sp, 8
02d1:0e4a c45e06         les bx, ptr [bp + 6]
02d1:0e4d 268b4740       mov ax, word ptr es:[bx + 0x40]
02d1:0e51 ba0a00         mov dx, 0xa
02d1:0e54 f7ea           imul dx
02d1:0e56 c45e06         les bx, ptr [bp + 6]
02d1:0e59 26294732       sub word ptr es:[bx + 0x32], ax
02d1:0e5d 6a07           push 7
02d1:0e5f c45e06         les bx, ptr [bp + 6]
02d1:0e62 26ff773e       push word ptr es:[bx + 0x3e]
02d1:0e66 c45e06         les bx, ptr [bp + 6]
02d1:0e69 268b4704       mov ax, word ptr es:[bx + 4]
02d1:0e6d c45e06         les bx, ptr [bp + 6]
02d1:0e70 262b470c       sub ax, word ptr es:[bx + 0xc]
02d1:0e74 50             push ax
02d1:0e75 c45e06         les bx, ptr [bp + 6]
02d1:0e78 26ff7734       push word ptr es:[bx + 0x34]
02d1:0e7c c45e06         les bx, ptr [bp + 6]
02d1:0e7f 26ff7732       push word ptr es:[bx + 0x32]
02d1:0e83 ff7608         push word ptr [bp + 8]
02d1:0e86 ff7606         push word ptr [bp + 6]
02d1:0e89 9a62022d0b     lcall 0b2d:0262
02d1:0e8e 83c40e         add sp, 0xe
02d1:0e91 c45e06         les bx, ptr [bp + 6]
02d1:0e94 26ff7734       push word ptr es:[bx + 0x34]
02d1:0e98 c45e06         les bx, ptr [bp + 6]
02d1:0e9b 26ff7732       push word ptr es:[bx + 0x32]
02d1:0e9f 9a24102b0d     lcall 0d2b:1024
02d1:0ea4 59             pop cx
02d1:0ea5 59             pop cx
02d1:0ea6 6a01           push 1
02d1:0ea8 9ab21d2b0d     lcall setcolor
02d1:0ead 59             pop cx
02d1:0eae c45e06         les bx, ptr [bp + 6]
02d1:0eb1 8b46fc         mov ax, word ptr [bp - 4]
02d1:0eb4 26034738       add ax, word ptr es:[bx + 0x38]
02d1:0eb8 ff76fe         push word ptr [bp - 2]
02d1:0ebb 50             push ax
02d1:0ebc 9af6152b0d     lcall 0d2b:15f6
02d1:0ec1 59             pop cx
02d1:0ec2 59             pop cx
02d1:0ec3 c45e06         les bx, ptr [bp + 6]
02d1:0ec6 26017738       add word ptr es:[bx + 0x38], si
02d1:0eca c45e06         les bx, ptr [bp + 6]
02d1:0ecd 8bc6           mov ax, si
02d1:0ecf 26f76f40       imul word ptr es:[bx + 0x40]
02d1:0ed3 c45e06         les bx, ptr [bp + 6]
02d1:0ed6 26014732       add word ptr es:[bx + 0x32], ax
02d1:0eda ff7608         push word ptr [bp + 8]
02d1:0edd ff7606         push word ptr [bp + 6]
02d1:0ee0 9aeb0ed102     lcall 02d1:0eeb
02d1:0ee5 59             pop cx
02d1:0ee6 59             pop cx
02d1:0ee7 5f             pop di
02d1:0ee8 5e             pop si
02d1:0ee9 c9             leave 
02d1:0eea cb             retf 
02d1:0eeb 55             push bp
02d1:0eec 8bec           mov bp, sp
02d1:0eee 3926d608       cmp word ptr [0x8d6], sp
02d1:0ef2 7705           ja 0xef9
02d1:0ef4 9a072d0000     lcall __OVERFLOW
02d1:0ef9 6a01           push 1
02d1:0efb 9a3d1a2b0d     lcall setwritemode
02d1:0f00 59             pop cx
02d1:0f01 6a0b           push 0xb
02d1:0f03 9ab21d2b0d     lcall setcolor
02d1:0f08 59             pop cx
02d1:0f09 c45e06         les bx, ptr [bp + 6]
02d1:0f0c 268b4734       mov ax, word ptr es:[bx + 0x34]
02d1:0f10 c45e06         les bx, ptr [bp + 6]
02d1:0f13 2603473e       add ax, word ptr es:[bx + 0x3e]
02d1:0f17 50             push ax
02d1:0f18 c45e06         les bx, ptr [bp + 6]
02d1:0f1b 26ff7732       push word ptr es:[bx + 0x32]
02d1:0f1f c45e06         les bx, ptr [bp + 6]
02d1:0f22 26ff7734       push word ptr es:[bx + 0x34]
02d1:0f26 c45e06         les bx, ptr [bp + 6]
02d1:0f29 26ff7732       push word ptr es:[bx + 0x32]
02d1:0f2d 9a251c2b0d     lcall line
02d1:0f32 83c408         add sp, 8
02d1:0f35 c45e06         les bx, ptr [bp + 6]
02d1:0f38 268b4734       mov ax, word ptr es:[bx + 0x34]
02d1:0f3c c45e06         les bx, ptr [bp + 6]
02d1:0f3f 2603473e       add ax, word ptr es:[bx + 0x3e]
02d1:0f43 50             push ax
02d1:0f44 c45e06         les bx, ptr [bp + 6]
02d1:0f47 268b4732       mov ax, word ptr es:[bx + 0x32]
02d1:0f4b 40             inc ax
02d1:0f4c 50             push ax
02d1:0f4d c45e06         les bx, ptr [bp + 6]
02d1:0f50 26ff7734       push word ptr es:[bx + 0x34]
02d1:0f54 c45e06         les bx, ptr [bp + 6]
02d1:0f57 268b4732       mov ax, word ptr es:[bx + 0x32]
02d1:0f5b 40             inc ax
02d1:0f5c 50             push ax
02d1:0f5d 9a251c2b0d     lcall line
02d1:0f62 83c408         add sp, 8
02d1:0f65 6a00           push 0
02d1:0f67 9a3d1a2b0d     lcall setwritemode
02d1:0f6c 59             pop cx
02d1:0f6d 5d             pop bp
02d1:0f6e cb             retf 
02d1:0f6f 55             push bp
02d1:0f70 8bec           mov bp, sp
02d1:0f72 56             push si
02d1:0f73 8b760c         mov si, word ptr [bp + 0xc]
02d1:0f76 3926d608       cmp word ptr [0x8d6], sp
02d1:0f7a 7705           ja 0xf81
02d1:0f7c 9a072d0000     lcall __OVERFLOW
02d1:0f81 8b5e0a         mov bx, word ptr [bp + 0xa]
02d1:0f84 83fb03         cmp bx, 3
02d1:0f87 7603           jbe 0xf8c
02d1:0f89 e9b700         jmp 0x1043
02d1:0f8c d1e3           shl bx, 1
02d1:0f8e 2effa74610     jmp word ptr cs:[bx + 0x1046]
02d1:0f93 c45e06         les bx, ptr [bp + 6]
02d1:0f96 26017744       add word ptr es:[bx + 0x44], si
02d1:0f9a c45e06         les bx, ptr [bp + 6]
02d1:0f9d 268b4744       mov ax, word ptr es:[bx + 0x44]
02d1:0fa1 c45e06         les bx, ptr [bp + 6]
02d1:0fa4 263b4748       cmp ax, word ptr es:[bx + 0x48]
02d1:0fa8 760a           jbe 0xfb4
02d1:0faa c45e06         les bx, ptr [bp + 6]
02d1:0fad 26297744       sub word ptr es:[bx + 0x44], si
02d1:0fb1 e98f00         jmp 0x1043
02d1:0fb4 c45e06         les bx, ptr [bp + 6]
02d1:0fb7 26ff7744       push word ptr es:[bx + 0x44]
02d1:0fbb 6a00           push 0
02d1:0fbd ff7608         push word ptr [bp + 8]
02d1:0fc0 ff7606         push word ptr [bp + 6]
02d1:0fc3 0e             push cs
02d1:0fc4 e834fb         call 0xafb
02d1:0fc7 83c408         add sp, 8
02d1:0fca eb77           jmp 0x1043
02d1:0fcc c45e06         les bx, ptr [bp + 6]
02d1:0fcf 26297744       sub word ptr es:[bx + 0x44], si
02d1:0fd3 c45e06         les bx, ptr [bp + 6]
02d1:0fd6 26837f4400     cmp word ptr es:[bx + 0x44], 0
02d1:0fdb 7d10           jge 0xfed
02d1:0fdd c45e06         les bx, ptr [bp + 6]
02d1:0fe0 26c747440000   mov word ptr es:[bx + 0x44], 0
02d1:0fe6 83fe01         cmp si, 1
02d1:0fe9 7502           jne 0xfed
02d1:0feb eb56           jmp 0x1043
02d1:0fed c45e06         les bx, ptr [bp + 6]
02d1:0ff0 26ff7744       push word ptr es:[bx + 0x44]
02d1:0ff4 6a00           push 0
02d1:0ff6 ff7608         push word ptr [bp + 8]
02d1:0ff9 ff7606         push word ptr [bp + 6]
02d1:0ffc 0e             push cs
02d1:0ffd e8fbfa         call 0xafb
02d1:1000 83c408         add sp, 8
02d1:1003 eb3e           jmp 0x1043
02d1:1005 c45e06         les bx, ptr [bp + 6]
02d1:1008 26017746       add word ptr es:[bx + 0x46], si
02d1:100c c45e06         les bx, ptr [bp + 6]
02d1:100f 26ff7744       push word ptr es:[bx + 0x44]
02d1:1013 6a00           push 0
02d1:1015 ff7608         push word ptr [bp + 8]
02d1:1018 ff7606         push word ptr [bp + 6]
02d1:101b 0e             push cs
02d1:101c e8dcfa         call 0xafb
02d1:101f 83c408         add sp, 8
02d1:1022 eb1f           jmp 0x1043
02d1:1024 c45e06         les bx, ptr [bp + 6]
02d1:1027 26297746       sub word ptr es:[bx + 0x46], si
02d1:102b c45e06         les bx, ptr [bp + 6]
02d1:102e 26ff7744       push word ptr es:[bx + 0x44]
02d1:1032 6a00           push 0
02d1:1034 ff7608         push word ptr [bp + 8]
02d1:1037 ff7606         push word ptr [bp + 6]
02d1:103a 0e             push cs
02d1:103b e8bdfa         call 0xafb
02d1:103e 83c408         add sp, 8
02d1:1041 eb00           jmp 0x1043
02d1:1043 5e             pop si
02d1:1044 5d             pop bp
02d1:1045 cb             retf 
02d1:1046 93             xchg bx, ax
02d1:1047 0fcc           bswap sp
02d1:1049 0f05           syscall 
02d1:104b 1024           adc byte ptr [si], ah
02d1:104d 10c8           adc al, cl
02d1:104f 0200           add al, byte ptr [bx + si]
02d1:1051 005657         add byte ptr [bp + 0x57], dl
02d1:1054 3926d608       cmp word ptr [0x8d6], sp
02d1:1058 7705           ja 0x105f
02d1:105a 9a072d0000     lcall __OVERFLOW
02d1:105f ff7608         push word ptr [bp + 8]
02d1:1062 ff7606         push word ptr [bp + 6]
02d1:1065 0e             push cs
02d1:1066 e882fe         call 0xeeb
02d1:1069 59             pop cx
02d1:106a 59             pop cx
02d1:106b c45e06         les bx, ptr [bp + 6]
02d1:106e 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1072 06             push es
02d1:1073 c47606         les si, ptr [bp + 6]
02d1:1076 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:107a c1e002         shl ax, 2
02d1:107d 03d8           add bx, ax
02d1:107f 07             pop es
02d1:1080 26ff7702       push word ptr es:[bx + 2]
02d1:1084 26ff37         push word ptr es:[bx]
02d1:1087 9ad9200000     lcall strlen
02d1:108c 59             pop cx
02d1:108d 59             pop cx
02d1:108e 8bf8           mov di, ax
02d1:1090 c45e06         les bx, ptr [bp + 6]
02d1:1093 26397f38       cmp word ptr es:[bx + 0x38], di
02d1:1097 7603           jbe 0x109c
02d1:1099 e90103         jmp 0x139d
02d1:109c c45e06         les bx, ptr [bp + 6]
02d1:109f 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:10a3 06             push es
02d1:10a4 c47606         les si, ptr [bp + 6]
02d1:10a7 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:10ab c1e002         shl ax, 2
02d1:10ae 03d8           add bx, ax
02d1:10b0 07             pop es
02d1:10b1 26c407         les ax, ptr es:[bx]
02d1:10b4 06             push es
02d1:10b5 c45e06         les bx, ptr [bp + 6]
02d1:10b8 26034738       add ax, word ptr es:[bx + 0x38]
02d1:10bc 8bd8           mov bx, ax
02d1:10be 07             pop es
02d1:10bf 26803f00       cmp byte ptr es:[bx], 0
02d1:10c3 7503           jne 0x10c8
02d1:10c5 e9e600         jmp 0x11ae
02d1:10c8 c45e06         les bx, ptr [bp + 6]
02d1:10cb 8bc7           mov ax, di
02d1:10cd 262b4738       sub ax, word ptr es:[bx + 0x38]
02d1:10d1 50             push ax
02d1:10d2 c45e06         les bx, ptr [bp + 6]
02d1:10d5 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:10d9 06             push es
02d1:10da c47606         les si, ptr [bp + 6]
02d1:10dd 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:10e1 c1e002         shl ax, 2
02d1:10e4 03d8           add bx, ax
02d1:10e6 07             pop es
02d1:10e7 268b07         mov ax, word ptr es:[bx]
02d1:10ea 53             push bx
02d1:10eb 06             push es
02d1:10ec c45e06         les bx, ptr [bp + 6]
02d1:10ef 26034738       add ax, word ptr es:[bx + 0x38]
02d1:10f3 07             pop es
02d1:10f4 5b             pop bx
02d1:10f5 26ff7702       push word ptr es:[bx + 2]
02d1:10f9 50             push ax
02d1:10fa c45e06         les bx, ptr [bp + 6]
02d1:10fd 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1101 06             push es
02d1:1102 c47606         les si, ptr [bp + 6]
02d1:1105 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:1109 c1e002         shl ax, 2
02d1:110c 03d8           add bx, ax
02d1:110e 07             pop es
02d1:110f 268b07         mov ax, word ptr es:[bx]
02d1:1112 53             push bx
02d1:1113 06             push es
02d1:1114 c45e06         les bx, ptr [bp + 6]
02d1:1117 26034738       add ax, word ptr es:[bx + 0x38]
02d1:111b 40             inc ax
02d1:111c 07             pop es
02d1:111d 5b             pop bx
02d1:111e 26ff7702       push word ptr es:[bx + 2]
02d1:1122 50             push ax
02d1:1123 9a411d0000     lcall 0000:1d41
02d1:1128 83c40a         add sp, 0xa
02d1:112b 6a07           push 7
02d1:112d c45e06         les bx, ptr [bp + 6]
02d1:1130 26ff773e       push word ptr es:[bx + 0x3e]
02d1:1134 c45e06         les bx, ptr [bp + 6]
02d1:1137 268b4708       mov ax, word ptr es:[bx + 8]
02d1:113b c45e06         les bx, ptr [bp + 6]
02d1:113e 262b4732       sub ax, word ptr es:[bx + 0x32]
02d1:1142 50             push ax
02d1:1143 c45e06         les bx, ptr [bp + 6]
02d1:1146 26ff7734       push word ptr es:[bx + 0x34]
02d1:114a c45e06         les bx, ptr [bp + 6]
02d1:114d 26ff7732       push word ptr es:[bx + 0x32]
02d1:1151 ff7608         push word ptr [bp + 8]
02d1:1154 ff7606         push word ptr [bp + 6]
02d1:1157 9a62022d0b     lcall 0b2d:0262
02d1:115c 83c40e         add sp, 0xe
02d1:115f c45e06         les bx, ptr [bp + 6]
02d1:1162 26ff7734       push word ptr es:[bx + 0x34]
02d1:1166 c45e06         les bx, ptr [bp + 6]
02d1:1169 26ff7732       push word ptr es:[bx + 0x32]
02d1:116d 9a24102b0d     lcall 0d2b:1024
02d1:1172 59             pop cx
02d1:1173 59             pop cx
02d1:1174 6a01           push 1
02d1:1176 9ab21d2b0d     lcall setcolor
02d1:117b 59             pop cx
02d1:117c c45e06         les bx, ptr [bp + 6]
02d1:117f 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1183 06             push es
02d1:1184 c47606         les si, ptr [bp + 6]
02d1:1187 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:118b c1e002         shl ax, 2
02d1:118e 03d8           add bx, ax
02d1:1190 07             pop es
02d1:1191 268b07         mov ax, word ptr es:[bx]
02d1:1194 53             push bx
02d1:1195 06             push es
02d1:1196 c45e06         les bx, ptr [bp + 6]
02d1:1199 26034738       add ax, word ptr es:[bx + 0x38]
02d1:119d 07             pop es
02d1:119e 5b             pop bx
02d1:119f 26ff7702       push word ptr es:[bx + 2]
02d1:11a3 50             push ax
02d1:11a4 9af6152b0d     lcall 0d2b:15f6
02d1:11a9 59             pop cx
02d1:11aa 59             pop cx
02d1:11ab e9e301         jmp 0x1391
02d1:11ae c45e06         les bx, ptr [bp + 6]
02d1:11b1 268b4748       mov ax, word ptr es:[bx + 0x48]
02d1:11b5 c45e06         les bx, ptr [bp + 6]
02d1:11b8 263b4736       cmp ax, word ptr es:[bx + 0x36]
02d1:11bc 7703           ja 0x11c1
02d1:11be e9d001         jmp 0x1391
02d1:11c1 c45e06         les bx, ptr [bp + 6]
02d1:11c4 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:11c8 06             push es
02d1:11c9 c47606         les si, ptr [bp + 6]
02d1:11cc 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:11d0 40             inc ax
02d1:11d1 c1e002         shl ax, 2
02d1:11d4 03d8           add bx, ax
02d1:11d6 07             pop es
02d1:11d7 26ff7702       push word ptr es:[bx + 2]
02d1:11db 26ff37         push word ptr es:[bx]
02d1:11de 9ad9200000     lcall strlen
02d1:11e3 59             pop cx
02d1:11e4 59             pop cx
02d1:11e5 8946fe         mov word ptr [bp - 2], ax
02d1:11e8 8b46fe         mov ax, word ptr [bp - 2]
02d1:11eb 03c7           add ax, di
02d1:11ed 3dff00         cmp ax, 0xff
02d1:11f0 7f03           jg 0x11f5
02d1:11f2 e9a100         jmp 0x1296
02d1:11f5 b8ff00         mov ax, 0xff
02d1:11f8 2bc7           sub ax, di
02d1:11fa 50             push ax
02d1:11fb c45e06         les bx, ptr [bp + 6]
02d1:11fe 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1202 06             push es
02d1:1203 c47606         les si, ptr [bp + 6]
02d1:1206 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:120a c1e002         shl ax, 2
02d1:120d 03d8           add bx, ax
02d1:120f 07             pop es
02d1:1210 268b07         mov ax, word ptr es:[bx]
02d1:1213 53             push bx
02d1:1214 06             push es
02d1:1215 c45e06         les bx, ptr [bp + 6]
02d1:1218 26034738       add ax, word ptr es:[bx + 0x38]
02d1:121c 07             pop es
02d1:121d 5b             pop bx
02d1:121e 26ff7702       push word ptr es:[bx + 2]
02d1:1222 50             push ax
02d1:1223 c45e06         les bx, ptr [bp + 6]
02d1:1226 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:122a 06             push es
02d1:122b c47606         les si, ptr [bp + 6]
02d1:122e 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:1232 40             inc ax
02d1:1233 c1e002         shl ax, 2
02d1:1236 03d8           add bx, ax
02d1:1238 07             pop es
02d1:1239 26ff7702       push word ptr es:[bx + 2]
02d1:123d 26ff37         push word ptr es:[bx]
02d1:1240 9a411d0000     lcall 0000:1d41
02d1:1245 83c40a         add sp, 0xa
02d1:1248 6a00           push 0
02d1:124a c45e06         les bx, ptr [bp + 6]
02d1:124d 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1251 06             push es
02d1:1252 c47606         les si, ptr [bp + 6]
02d1:1255 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:1259 40             inc ax
02d1:125a c1e002         shl ax, 2
02d1:125d 03d8           add bx, ax
02d1:125f 07             pop es
02d1:1260 268b07         mov ax, word ptr es:[bx]
02d1:1263 0346fe         add ax, word ptr [bp - 2]
02d1:1266 03c7           add ax, di
02d1:1268 0501ff         add ax, 0xff01
02d1:126b 26ff7702       push word ptr es:[bx + 2]
02d1:126f 50             push ax
02d1:1270 9a5b130000     lcall 0000:135b
02d1:1275 83c406         add sp, 6
02d1:1278 c45e06         les bx, ptr [bp + 6]
02d1:127b 26ff7736       push word ptr es:[bx + 0x36]
02d1:127f c45e06         les bx, ptr [bp + 6]
02d1:1282 26ff7734       push word ptr es:[bx + 0x34]
02d1:1286 ff7608         push word ptr [bp + 8]
02d1:1289 ff7606         push word ptr [bp + 6]
02d1:128c 0e             push cs
02d1:128d e86bf8         call 0xafb
02d1:1290 83c408         add sp, 8
02d1:1293 e9fb00         jmp 0x1391
02d1:1296 c45e06         les bx, ptr [bp + 6]
02d1:1299 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:129d 06             push es
02d1:129e c47606         les si, ptr [bp + 6]
02d1:12a1 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:12a5 40             inc ax
02d1:12a6 c1e002         shl ax, 2
02d1:12a9 03d8           add bx, ax
02d1:12ab 07             pop es
02d1:12ac 26ff7702       push word ptr es:[bx + 2]
02d1:12b0 26ff37         push word ptr es:[bx]
02d1:12b3 c45e06         les bx, ptr [bp + 6]
02d1:12b6 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:12ba 06             push es
02d1:12bb c47606         les si, ptr [bp + 6]
02d1:12be 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:12c2 c1e002         shl ax, 2
02d1:12c5 03d8           add bx, ax
02d1:12c7 07             pop es
02d1:12c8 268b07         mov ax, word ptr es:[bx]
02d1:12cb 53             push bx
02d1:12cc 06             push es
02d1:12cd c45e06         les bx, ptr [bp + 6]
02d1:12d0 26034738       add ax, word ptr es:[bx + 0x38]
02d1:12d4 07             pop es
02d1:12d5 5b             pop bx
02d1:12d6 26ff7702       push word ptr es:[bx + 2]
02d1:12da 50             push ax
02d1:12db 9a27130000     lcall 0000:1327
02d1:12e0 83c408         add sp, 8
02d1:12e3 c45e06         les bx, ptr [bp + 6]
02d1:12e6 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:12ea 06             push es
02d1:12eb c47606         les si, ptr [bp + 6]
02d1:12ee 268b4436       mov ax, word ptr es:[si + 0x36]
02d1:12f2 40             inc ax
02d1:12f3 c1e002         shl ax, 2
02d1:12f6 03d8           add bx, ax
02d1:12f8 07             pop es
02d1:12f9 26ff7702       push word ptr es:[bx + 2]
02d1:12fd 26ff37         push word ptr es:[bx]
02d1:1300 9a12270000     lcall 0000:2712
02d1:1305 59             pop cx
02d1:1306 59             pop cx
02d1:1307 c45e06         les bx, ptr [bp + 6]
02d1:130a 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:130e 40             inc ax
02d1:130f 8bf0           mov si, ax
02d1:1311 eb2e           jmp 0x1341
02d1:1313 c45e06         les bx, ptr [bp + 6]
02d1:1316 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:131a 8bc6           mov ax, si
02d1:131c 40             inc ax
02d1:131d c1e002         shl ax, 2
02d1:1320 03d8           add bx, ax
02d1:1322 268b4702       mov ax, word ptr es:[bx + 2]
02d1:1326 268b17         mov dx, word ptr es:[bx]
02d1:1329 c45e06         les bx, ptr [bp + 6]
02d1:132c 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1330 50             push ax
02d1:1331 8bc6           mov ax, si
02d1:1333 c1e002         shl ax, 2
02d1:1336 03d8           add bx, ax
02d1:1338 58             pop ax
02d1:1339 26894702       mov word ptr es:[bx + 2], ax
02d1:133d 268917         mov word ptr es:[bx], dx
02d1:1340 46             inc si
02d1:1341 c45e06         les bx, ptr [bp + 6]
02d1:1344 26397748       cmp word ptr es:[bx + 0x48], si
02d1:1348 77c9           ja 0x1313
02d1:134a c45e06         les bx, ptr [bp + 6]
02d1:134d 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1351 06             push es
02d1:1352 8e4608         mov es, word ptr [bp + 8]
02d1:1355 53             push bx
02d1:1356 8b5e06         mov bx, word ptr [bp + 6]
02d1:1359 268b4748       mov ax, word ptr es:[bx + 0x48]
02d1:135d c1e002         shl ax, 2
02d1:1360 5b             pop bx
02d1:1361 03d8           add bx, ax
02d1:1363 07             pop es
02d1:1364 26c747020000   mov word ptr es:[bx + 2], 0
02d1:136a 26c7070000     mov word ptr es:[bx], 0
02d1:136f c45e06         les bx, ptr [bp + 6]
02d1:1372 26ff4f48       dec word ptr es:[bx + 0x48]
02d1:1376 c45e06         les bx, ptr [bp + 6]
02d1:1379 26ff7736       push word ptr es:[bx + 0x36]
02d1:137d c45e06         les bx, ptr [bp + 6]
02d1:1380 26ff7734       push word ptr es:[bx + 0x34]
02d1:1384 ff7608         push word ptr [bp + 8]
02d1:1387 ff7606         push word ptr [bp + 6]
02d1:138a 0e             push cs
02d1:138b e86df7         call 0xafb
02d1:138e 83c408         add sp, 8
02d1:1391 ff7608         push word ptr [bp + 8]
02d1:1394 ff7606         push word ptr [bp + 6]
02d1:1397 0e             push cs
02d1:1398 e850fb         call 0xeeb
02d1:139b 59             pop cx
02d1:139c 59             pop cx
02d1:139d 5f             pop di
02d1:139e 5e             pop si
02d1:139f c9             leave 
02d1:13a0 cb             retf 
02d1:13a1 55             push bp
02d1:13a2 8bec           mov bp, sp
02d1:13a4 56             push si
02d1:13a5 57             push di
02d1:13a6 3926d608       cmp word ptr [0x8d6], sp
02d1:13aa 7705           ja 0x13b1
02d1:13ac 9a072d0000     lcall __OVERFLOW
02d1:13b1 c45e06         les bx, ptr [bp + 6]
02d1:13b4 26837f3800     cmp word ptr es:[bx + 0x38], 0
02d1:13b9 750d           jne 0x13c8
02d1:13bb c45e06         les bx, ptr [bp + 6]
02d1:13be 26837f3600     cmp word ptr es:[bx + 0x36], 0
02d1:13c3 7503           jne 0x13c8
02d1:13c5 e9b300         jmp 0x147b
02d1:13c8 c45e06         les bx, ptr [bp + 6]
02d1:13cb 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:13cf 06             push es
02d1:13d0 c47e06         les di, ptr [bp + 6]
02d1:13d3 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:13d7 c1e002         shl ax, 2
02d1:13da 03d8           add bx, ax
02d1:13dc 07             pop es
02d1:13dd 26ff7702       push word ptr es:[bx + 2]
02d1:13e1 26ff37         push word ptr es:[bx]
02d1:13e4 9ad9200000     lcall strlen
02d1:13e9 59             pop cx
02d1:13ea 59             pop cx
02d1:13eb 8bf0           mov si, ax
02d1:13ed c45e06         les bx, ptr [bp + 6]
02d1:13f0 26397738       cmp word ptr es:[bx + 0x38], si
02d1:13f4 7633           jbe 0x1429
02d1:13f6 c45e06         les bx, ptr [bp + 6]
02d1:13f9 268b4738       mov ax, word ptr es:[bx + 0x38]
02d1:13fd 2bc6           sub ax, si
02d1:13ff 50             push ax
02d1:1400 6a20           push 0x20
02d1:1402 c45e06         les bx, ptr [bp + 6]
02d1:1405 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1409 06             push es
02d1:140a c47e06         les di, ptr [bp + 6]
02d1:140d 268b4536       mov ax, word ptr es:[di + 0x36]
02d1:1411 c1e002         shl ax, 2
02d1:1414 03d8           add bx, ax
02d1:1416 07             pop es
02d1:1417 268b07         mov ax, word ptr es:[bx]
02d1:141a 03c6           add ax, si
02d1:141c 26ff7702       push word ptr es:[bx + 2]
02d1:1420 50             push ax
02d1:1421 9a221d0000     lcall 0000:1d22
02d1:1426 83c408         add sp, 8
02d1:1429 c45e06         les bx, ptr [bp + 6]
02d1:142c 26837f3800     cmp word ptr es:[bx + 0x38], 0
02d1:1431 741a           je 0x144d
02d1:1433 ff7608         push word ptr [bp + 8]
02d1:1436 ff7606         push word ptr [bp + 6]
02d1:1439 0e             push cs
02d1:143a e842f6         call 0xa7f
02d1:143d 59             pop cx
02d1:143e 59             pop cx
02d1:143f ff7608         push word ptr [bp + 8]
02d1:1442 ff7606         push word ptr [bp + 6]
02d1:1445 0e             push cs
02d1:1446 e805fc         call 0x104e
02d1:1449 59             pop cx
02d1:144a 59             pop cx
02d1:144b eb2e           jmp 0x147b
02d1:144d c45e06         les bx, ptr [bp + 6]
02d1:1450 26ff4f36       dec word ptr es:[bx + 0x36]
02d1:1454 c45e06         les bx, ptr [bp + 6]
02d1:1457 268b473e       mov ax, word ptr es:[bx + 0x3e]
02d1:145b c45e06         les bx, ptr [bp + 6]
02d1:145e 26294734       sub word ptr es:[bx + 0x34], ax
02d1:1462 ff7608         push word ptr [bp + 8]
02d1:1465 ff7606         push word ptr [bp + 6]
02d1:1468 9ae214d102     lcall 02d1:14e2
02d1:146d 59             pop cx
02d1:146e 59             pop cx
02d1:146f ff7608         push word ptr [bp + 8]
02d1:1472 ff7606         push word ptr [bp + 6]
02d1:1475 0e             push cs
02d1:1476 e8d5fb         call 0x104e
02d1:1479 59             pop cx
02d1:147a 59             pop cx
02d1:147b 5f             pop di
02d1:147c 5e             pop si
02d1:147d 5d             pop bp
02d1:147e cb             retf 
02d1:147f 55             push bp
02d1:1480 8bec           mov bp, sp
02d1:1482 3926d608       cmp word ptr [0x8d6], sp
02d1:1486 7705           ja 0x148d
02d1:1488 9a072d0000     lcall __OVERFLOW
02d1:148d ff7608         push word ptr [bp + 8]
02d1:1490 ff7606         push word ptr [bp + 6]
02d1:1493 0e             push cs
02d1:1494 e854fa         call 0xeeb
02d1:1497 59             pop cx
02d1:1498 59             pop cx
02d1:1499 c45e06         les bx, ptr [bp + 6]
02d1:149c 26837f4600     cmp word ptr es:[bx + 0x46], 0
02d1:14a1 741f           je 0x14c2
02d1:14a3 c45e06         les bx, ptr [bp + 6]
02d1:14a6 26c747460000   mov word ptr es:[bx + 0x46], 0
02d1:14ac c45e06         les bx, ptr [bp + 6]
02d1:14af 26ff7744       push word ptr es:[bx + 0x44]
02d1:14b3 6a00           push 0
02d1:14b5 ff7608         push word ptr [bp + 8]
02d1:14b8 ff7606         push word ptr [bp + 6]
02d1:14bb 0e             push cs
02d1:14bc e83cf6         call 0xafb
02d1:14bf 83c408         add sp, 8
02d1:14c2 c45e06         les bx, ptr [bp + 6]
02d1:14c5 26c747380000   mov word ptr es:[bx + 0x38], 0
02d1:14cb c45e06         les bx, ptr [bp + 6]
02d1:14ce 26c747320000   mov word ptr es:[bx + 0x32], 0
02d1:14d4 ff7608         push word ptr [bp + 8]
02d1:14d7 ff7606         push word ptr [bp + 6]
02d1:14da 0e             push cs
02d1:14db e80dfa         call 0xeeb
02d1:14de 59             pop cx
02d1:14df 59             pop cx
02d1:14e0 5d             pop bp
02d1:14e1 cb             retf 
02d1:14e2 c8020000       enter 2, 0
02d1:14e6 56             push si
02d1:14e7 57             push di
02d1:14e8 3926d608       cmp word ptr [0x8d6], sp
02d1:14ec 7705           ja 0x14f3
02d1:14ee 9a072d0000     lcall __OVERFLOW
02d1:14f3 c45e06         les bx, ptr [bp + 6]
02d1:14f6 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:14fa 06             push es
02d1:14fb 8e4608         mov es, word ptr [bp + 8]
02d1:14fe 53             push bx
02d1:14ff 8b5e06         mov bx, word ptr [bp + 6]
02d1:1502 268b4736       mov ax, word ptr es:[bx + 0x36]
02d1:1506 c1e002         shl ax, 2
02d1:1509 5b             pop bx
02d1:150a 03d8           add bx, ax
02d1:150c 07             pop es
02d1:150d 26ff7702       push word ptr es:[bx + 2]
02d1:1511 26ff37         push word ptr es:[bx]
02d1:1514 9ad9200000     lcall strlen
02d1:1519 59             pop cx
02d1:151a 59             pop cx
02d1:151b 8bf0           mov si, ax
02d1:151d c45e06         les bx, ptr [bp + 6]
02d1:1520 26397738       cmp word ptr es:[bx + 0x38], si
02d1:1524 7503           jne 0x1529
02d1:1526 e99a00         jmp 0x15c3
02d1:1529 ff7608         push word ptr [bp + 8]
02d1:152c ff7606         push word ptr [bp + 6]
02d1:152f 0e             push cs
02d1:1530 e8b8f9         call 0xeeb
02d1:1533 59             pop cx
02d1:1534 59             pop cx
02d1:1535 8976fe         mov word ptr [bp - 2], si
02d1:1538 33ff           xor di, di
02d1:153a eb06           jmp 0x1542
02d1:153c 83ee0a         sub si, 0xa
02d1:153f 83c70a         add di, 0xa
02d1:1542 c45e06         les bx, ptr [bp + 6]
02d1:1545 268b4708       mov ax, word ptr es:[bx + 8]
02d1:1549 c45e06         les bx, ptr [bp + 6]
02d1:154c 268b570c       mov dx, word ptr es:[bx + 0xc]
02d1:1550 d1e2           shl dx, 1
02d1:1552 2bc2           sub ax, dx
02d1:1554 c45e06         les bx, ptr [bp + 6]
02d1:1557 50             push ax
02d1:1558 8bc6           mov ax, si
02d1:155a 26f76f40       imul word ptr es:[bx + 0x40]
02d1:155e 5a             pop dx
02d1:155f 3bd0           cmp dx, ax
02d1:1561 7ed9           jle 0x153c
02d1:1563 0bff           or di, di
02d1:1565 742e           je 0x1595
02d1:1567 c45e06         les bx, ptr [bp + 6]
02d1:156a 26c747460000   mov word ptr es:[bx + 0x46], 0
02d1:1570 57             push di
02d1:1571 6a02           push 2
02d1:1573 ff7608         push word ptr [bp + 8]
02d1:1576 ff7606         push word ptr [bp + 6]
02d1:1579 0e             push cs
02d1:157a e8f2f9         call 0xf6f
02d1:157d 83c408         add sp, 8
02d1:1580 c45e06         les bx, ptr [bp + 6]
02d1:1583 8b46fe         mov ax, word ptr [bp - 2]
02d1:1586 2bc7           sub ax, di
02d1:1588 26f76f40       imul word ptr es:[bx + 0x40]
02d1:158c c45e06         les bx, ptr [bp + 6]
02d1:158f 26014732       add word ptr es:[bx + 0x32], ax
02d1:1593 eb18           jmp 0x15ad
02d1:1595 c45e06         les bx, ptr [bp + 6]
02d1:1598 8b46fe         mov ax, word ptr [bp - 2]
02d1:159b 262b4738       sub ax, word ptr es:[bx + 0x38]
02d1:159f c45e06         les bx, ptr [bp + 6]
02d1:15a2 26f76f40       imul word ptr es:[bx + 0x40]
02d1:15a6 c45e06         les bx, ptr [bp + 6]
02d1:15a9 26014732       add word ptr es:[bx + 0x32], ax
02d1:15ad c45e06         les bx, ptr [bp + 6]
02d1:15b0 8b46fe         mov ax, word ptr [bp - 2]
02d1:15b3 26894738       mov word ptr es:[bx + 0x38], ax
02d1:15b7 ff7608         push word ptr [bp + 8]
02d1:15ba ff7606         push word ptr [bp + 6]
02d1:15bd 0e             push cs
02d1:15be e82af9         call 0xeeb
02d1:15c1 59             pop cx
02d1:15c2 59             pop cx
02d1:15c3 5f             pop di
02d1:15c4 5e             pop si
02d1:15c5 c9             leave 
02d1:15c6 cb             retf 
02d1:15c7 c80c0000       enter 0xc, 0
02d1:15cb 56             push si
02d1:15cc 57             push di
02d1:15cd 3926d608       cmp word ptr [0x8d6], sp
02d1:15d1 7705           ja 0x15d8
02d1:15d3 9a072d0000     lcall __OVERFLOW
02d1:15d8 6a0d           push 0xd
02d1:15da 6a00           push 0
02d1:15dc c45e06         les bx, ptr [bp + 6]
02d1:15df 26ff774e       push word ptr es:[bx + 0x4e]
02d1:15e3 26ff774c       push word ptr es:[bx + 0x4c]
02d1:15e7 9a221d0000     lcall 0000:1d22
02d1:15ec 83c408         add sp, 8
02d1:15ef 6a0c           push 0xc
02d1:15f1 ff760c         push word ptr [bp + 0xc]
02d1:15f4 ff760a         push word ptr [bp + 0xa]
02d1:15f7 c45e06         les bx, ptr [bp + 6]
02d1:15fa 26ff774e       push word ptr es:[bx + 0x4e]
02d1:15fe 26ff774c       push word ptr es:[bx + 0x4c]
02d1:1602 9af8200000     lcall 0000:20f8
02d1:1607 83c40a         add sp, 0xa
02d1:160a c746fa0000     mov word ptr [bp - 6], 0
02d1:160f ff7608         push word ptr [bp + 8]
02d1:1612 ff7606         push word ptr [bp + 6]
02d1:1615 0e             push cs
02d1:1616 e8ceeb         call 0x1e7
02d1:1619 59             pop cx
02d1:161a 59             pop cx
02d1:161b 1e             push ds
02d1:161c 68a700         push 0xa7
02d1:161f c45e06         les bx, ptr [bp + 6]
02d1:1622 26ff774e       push word ptr es:[bx + 0x4e]
02d1:1626 26ff774c       push word ptr es:[bx + 0x4c]
02d1:162a 9ae0080000     lcall fopen
02d1:162f 83c408         add sp, 8
02d1:1632 8956fe         mov word ptr [bp - 2], dx
02d1:1635 8946fc         mov word ptr [bp - 4], ax
02d1:1638 0bc2           or ax, dx
02d1:163a 7503           jne 0x163f
02d1:163c e9f701         jmp 0x1836
02d1:163f e9c801         jmp 0x180a
02d1:1642 c45e06         les bx, ptr [bp + 6]
02d1:1645 06             push es
02d1:1646 c47606         les si, ptr [bp + 6]
02d1:1649 268b444a       mov ax, word ptr es:[si + 0x4a]
02d1:164d 48             dec ax
02d1:164e 07             pop es
02d1:164f 26394748       cmp word ptr es:[bx + 0x48], ax
02d1:1653 7403           je 0x1658
02d1:1655 e9af00         jmp 0x1707
02d1:1658 c45e06         les bx, ptr [bp + 6]
02d1:165b 268b474a       mov ax, word ptr es:[bx + 0x4a]
02d1:165f 051400         add ax, 0x14
02d1:1662 c1e002         shl ax, 2
02d1:1665 50             push ax
02d1:1666 9a4e270000     lcall op_new
02d1:166b 59             pop cx
02d1:166c 8956f6         mov word ptr [bp - 0xa], dx
02d1:166f 8946f4         mov word ptr [bp - 0xc], ax
02d1:1672 33f6           xor si, si
02d1:1674 eb30           jmp 0x16a6
02d1:1676 c45e06         les bx, ptr [bp + 6]
02d1:1679 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:167d 8bc6           mov ax, si
02d1:167f c1e002         shl ax, 2
02d1:1682 03d8           add bx, ax
02d1:1684 268b4702       mov ax, word ptr es:[bx + 2]
02d1:1688 268b17         mov dx, word ptr es:[bx]
02d1:168b 8bde           mov bx, si
02d1:168d c1e302         shl bx, 2
02d1:1690 8e46f6         mov es, word ptr [bp - 0xa]
02d1:1693 50             push ax
02d1:1694 52             push dx
02d1:1695 53             push bx
02d1:1696 8b5ef4         mov bx, word ptr [bp - 0xc]
02d1:1699 58             pop ax
02d1:169a 03d8           add bx, ax
02d1:169c 58             pop ax
02d1:169d 5a             pop dx
02d1:169e 26895702       mov word ptr es:[bx + 2], dx
02d1:16a2 268907         mov word ptr es:[bx], ax
02d1:16a5 46             inc si
02d1:16a6 c45e06         les bx, ptr [bp + 6]
02d1:16a9 2639774a       cmp word ptr es:[bx + 0x4a], si
02d1:16ad 77c7           ja 0x1676
02d1:16af c45e06         les bx, ptr [bp + 6]
02d1:16b2 268b774a       mov si, word ptr es:[bx + 0x4a]
02d1:16b6 eb16           jmp 0x16ce
02d1:16b8 8bc6           mov ax, si
02d1:16ba c1e002         shl ax, 2
02d1:16bd c45ef4         les bx, ptr [bp - 0xc]
02d1:16c0 03d8           add bx, ax
02d1:16c2 26c747020000   mov word ptr es:[bx + 2], 0
02d1:16c8 26c7070000     mov word ptr es:[bx], 0
02d1:16cd 46             inc si
02d1:16ce c45e06         les bx, ptr [bp + 6]
02d1:16d1 268b474a       mov ax, word ptr es:[bx + 0x4a]
02d1:16d5 050a00         add ax, 0xa
02d1:16d8 3bc6           cmp ax, si
02d1:16da 77dc           ja 0x16b8
02d1:16dc c45e06         les bx, ptr [bp + 6]
02d1:16df 26ff7726       push word ptr es:[bx + 0x26]
02d1:16e3 26ff7724       push word ptr es:[bx + 0x24]
02d1:16e7 9a12270000     lcall 0000:2712
02d1:16ec 59             pop cx
02d1:16ed 59             pop cx
02d1:16ee c45e06         les bx, ptr [bp + 6]
02d1:16f1 8b46f6         mov ax, word ptr [bp - 0xa]
02d1:16f4 8b56f4         mov dx, word ptr [bp - 0xc]
02d1:16f7 26894726       mov word ptr es:[bx + 0x26], ax
02d1:16fb 26895724       mov word ptr es:[bx + 0x24], dx
02d1:16ff c45e06         les bx, ptr [bp + 6]
02d1:1702 2683474a14     add word ptr es:[bx + 0x4a], 0x14
02d1:1707 c45e06         les bx, ptr [bp + 6]
02d1:170a 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:170e 06             push es
02d1:170f c47606         les si, ptr [bp + 6]
02d1:1712 268b4448       mov ax, word ptr es:[si + 0x48]
02d1:1716 c1e002         shl ax, 2
02d1:1719 03d8           add bx, ax
02d1:171b 07             pop es
02d1:171c 268b07         mov ax, word ptr es:[bx]
02d1:171f 260b4702       or ax, word ptr es:[bx + 2]
02d1:1723 7552           jne 0x1777
02d1:1725 68ff00         push 0xff
02d1:1728 9a4e270000     lcall op_new
02d1:172d 59             pop cx
02d1:172e c45e06         les bx, ptr [bp + 6]
02d1:1731 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:1735 50             push ax
02d1:1736 52             push dx
02d1:1737 06             push es
02d1:1738 c47606         les si, ptr [bp + 6]
02d1:173b 268b4448       mov ax, word ptr es:[si + 0x48]
02d1:173f c1e002         shl ax, 2
02d1:1742 03d8           add bx, ax
02d1:1744 07             pop es
02d1:1745 58             pop ax
02d1:1746 26894702       mov word ptr es:[bx + 2], ax
02d1:174a 58             pop ax
02d1:174b 268907         mov word ptr es:[bx], ax
02d1:174e 68ff00         push 0xff
02d1:1751 6a00           push 0
02d1:1753 c45e06         les bx, ptr [bp + 6]
02d1:1756 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:175a 06             push es
02d1:175b c47606         les si, ptr [bp + 6]
02d1:175e 268b4448       mov ax, word ptr es:[si + 0x48]
02d1:1762 c1e002         shl ax, 2
02d1:1765 03d8           add bx, ax
02d1:1767 07             pop es
02d1:1768 26ff7702       push word ptr es:[bx + 2]
02d1:176c 26ff37         push word ptr es:[bx]
02d1:176f 9a221d0000     lcall 0000:1d22
02d1:1774 83c408         add sp, 8
02d1:1777 ff76fe         push word ptr [bp - 2]
02d1:177a ff76fc         push word ptr [bp - 4]
02d1:177d 9af2190000     lcall fgetc
02d1:1782 59             pop cx
02d1:1783 59             pop cx
02d1:1784 8846f9         mov byte ptr [bp - 7], al
02d1:1787 8a46f9         mov al, byte ptr [bp - 7]
02d1:178a b400           mov ah, 0
02d1:178c 3d0900         cmp ax, 9
02d1:178f 7419           je 0x17aa
02d1:1791 3d0a00         cmp ax, 0xa
02d1:1794 7402           je 0x1798
02d1:1796 eb4e           jmp 0x17e6
02d1:1798 c646f900       mov byte ptr [bp - 7], 0
02d1:179c c746fa0000     mov word ptr [bp - 6], 0
02d1:17a1 c45e06         les bx, ptr [bp + 6]
02d1:17a4 26ff4748       inc word ptr es:[bx + 0x48]
02d1:17a8 eb60           jmp 0x180a
02d1:17aa 8b7efa         mov di, word ptr [bp - 6]
02d1:17ad eb1d           jmp 0x17cc
02d1:17af c45e06         les bx, ptr [bp + 6]
02d1:17b2 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:17b6 06             push es
02d1:17b7 c47606         les si, ptr [bp + 6]
02d1:17ba 268b4448       mov ax, word ptr es:[si + 0x48]
02d1:17be c1e002         shl ax, 2
02d1:17c1 03d8           add bx, ax
02d1:17c3 07             pop es
02d1:17c4 26c41f         les bx, ptr es:[bx]
02d1:17c7 26c60120       mov byte ptr es:[bx + di], 0x20
02d1:17cb 47             inc di
02d1:17cc c45e06         les bx, ptr [bp + 6]
02d1:17cf 8b46fa         mov ax, word ptr [bp - 6]
02d1:17d2 2603473a       add ax, word ptr es:[bx + 0x3a]
02d1:17d6 3bc7           cmp ax, di
02d1:17d8 77d5           ja 0x17af
02d1:17da c45e06         les bx, ptr [bp + 6]
02d1:17dd 268b473a       mov ax, word ptr es:[bx + 0x3a]
02d1:17e1 0146fa         add word ptr [bp - 6], ax
02d1:17e4 eb24           jmp 0x180a
02d1:17e6 c45e06         les bx, ptr [bp + 6]
02d1:17e9 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:17ed 06             push es
02d1:17ee c47606         les si, ptr [bp + 6]
02d1:17f1 268b4448       mov ax, word ptr es:[si + 0x48]
02d1:17f5 c1e002         shl ax, 2
02d1:17f8 03d8           add bx, ax
02d1:17fa 07             pop es
02d1:17fb 26c41f         les bx, ptr es:[bx]
02d1:17fe 035efa         add bx, word ptr [bp - 6]
02d1:1801 8a46f9         mov al, byte ptr [bp - 7]
02d1:1804 268807         mov byte ptr es:[bx], al
02d1:1807 ff46fa         inc word ptr [bp - 6]
02d1:180a c45efc         les bx, ptr [bp - 4]
02d1:180d 26f747022000   test word ptr es:[bx + 2], 0x20
02d1:1813 7503           jne 0x1818
02d1:1815 e92afe         jmp 0x1642
02d1:1818 ff76fe         push word ptr [bp - 2]
02d1:181b ff76fc         push word ptr [bp - 4]
02d1:181e 9a4c050000     lcall fclose
02d1:1823 59             pop cx
02d1:1824 59             pop cx
02d1:1825 6a00           push 0
02d1:1827 6a00           push 0
02d1:1829 ff7608         push word ptr [bp + 8]
02d1:182c ff7606         push word ptr [bp + 6]
02d1:182f 0e             push cs
02d1:1830 e8c8f2         call 0xafb
02d1:1833 83c408         add sp, 8
02d1:1836 5f             pop di
02d1:1837 5e             pop si
02d1:1838 c9             leave 
02d1:1839 cb             retf 
02d1:183a c8060000       enter 6, 0
02d1:183e 56             push si
02d1:183f 57             push di
02d1:1840 3926d608       cmp word ptr [0x8d6], sp
02d1:1844 7705           ja 0x184b
02d1:1846 9a072d0000     lcall __OVERFLOW
02d1:184b 6a0d           push 0xd
02d1:184d 6a00           push 0
02d1:184f c45e06         les bx, ptr [bp + 6]
02d1:1852 26ff774e       push word ptr es:[bx + 0x4e]
02d1:1856 26ff774c       push word ptr es:[bx + 0x4c]
02d1:185a 9a221d0000     lcall 0000:1d22
02d1:185f 83c408         add sp, 8
02d1:1862 6a0c           push 0xc
02d1:1864 ff760c         push word ptr [bp + 0xc]
02d1:1867 ff760a         push word ptr [bp + 0xa]
02d1:186a c45e06         les bx, ptr [bp + 6]
02d1:186d 26ff774e       push word ptr es:[bx + 0x4e]
02d1:1871 26ff774c       push word ptr es:[bx + 0x4c]
02d1:1875 9af8200000     lcall 0000:20f8
02d1:187a 83c40a         add sp, 0xa
02d1:187d 1e             push ds
02d1:187e 68aa00         push 0xaa
02d1:1881 c45e06         les bx, ptr [bp + 6]
02d1:1884 26ff774e       push word ptr es:[bx + 0x4e]
02d1:1888 26ff774c       push word ptr es:[bx + 0x4c]
02d1:188c 9ae0080000     lcall fopen
02d1:1891 83c408         add sp, 8
02d1:1894 8956fe         mov word ptr [bp - 2], dx
02d1:1897 8946fc         mov word ptr [bp - 4], ax
02d1:189a 0bc2           or ax, dx
02d1:189c 7502           jne 0x18a0
02d1:189e eb63           jmp 0x1903
02d1:18a0 33ff           xor di, di
02d1:18a2 eb49           jmp 0x18ed
02d1:18a4 33f6           xor si, si
02d1:18a6 eb3e           jmp 0x18e6
02d1:18a8 c45e06         les bx, ptr [bp + 6]
02d1:18ab 26c45f24       les bx, ptr es:[bx + 0x24]
02d1:18af 8bc7           mov ax, di
02d1:18b1 c1e002         shl ax, 2
02d1:18b4 03d8           add bx, ax
02d1:18b6 26c41f         les bx, ptr es:[bx]
02d1:18b9 268a00         mov al, byte ptr es:[bx + si]
02d1:18bc 8846fb         mov byte ptr [bp - 5], al
02d1:18bf 807efb00       cmp byte ptr [bp - 5], 0
02d1:18c3 7504           jne 0x18c9
02d1:18c5 c646fb0a       mov byte ptr [bp - 5], 0xa
02d1:18c9 ff76fe         push word ptr [bp - 2]
02d1:18cc ff76fc         push word ptr [bp - 4]
02d1:18cf 8a46fb         mov al, byte ptr [bp - 5]
02d1:18d2 b400           mov ah, 0
02d1:18d4 50             push ax
02d1:18d5 9ad50b0000     lcall 0000:0bd5
02d1:18da 83c406         add sp, 6
02d1:18dd 807efb0a       cmp byte ptr [bp - 5], 0xa
02d1:18e1 7502           jne 0x18e5
02d1:18e3 eb07           jmp 0x18ec
02d1:18e5 46             inc si
02d1:18e6 81feff00       cmp si, 0xff
02d1:18ea 7ebc           jle 0x18a8
02d1:18ec 47             inc di
02d1:18ed c45e06         les bx, ptr [bp + 6]
02d1:18f0 26397f48       cmp word ptr es:[bx + 0x48], di
02d1:18f4 73ae           jae 0x18a4
02d1:18f6 ff76fe         push word ptr [bp - 2]
02d1:18f9 ff76fc         push word ptr [bp - 4]
02d1:18fc 9a4c050000     lcall fclose
02d1:1901 59             pop cx
02d1:1902 59             pop cx
02d1:1903 5f             pop di
02d1:1904 5e             pop si
02d1:1905 c9             leave 
02d1:1906 cb             retf 
02d1:1907 55             push bp
02d1:1908 8bec           mov bp, sp
02d1:190a 3926d608       cmp word ptr [0x8d6], sp
02d1:190e 7705           ja 0x1915
02d1:1910 9a072d0000     lcall __OVERFLOW
02d1:1915 c45e06         les bx, ptr [bp + 6]
02d1:1918 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:191c c45e06         les bx, ptr [bp + 6]
02d1:191f 26294744       sub word ptr es:[bx + 0x44], ax
02d1:1923 c45e06         les bx, ptr [bp + 6]
02d1:1926 26837f4400     cmp word ptr es:[bx + 0x44], 0
02d1:192b 7d1d           jge 0x194a
02d1:192d c45e06         les bx, ptr [bp + 6]
02d1:1930 26c747440000   mov word ptr es:[bx + 0x44], 0
02d1:1936 c45e06         les bx, ptr [bp + 6]
02d1:1939 26c747340000   mov word ptr es:[bx + 0x34], 0
02d1:193f c45e06         les bx, ptr [bp + 6]
02d1:1942 26c747360000   mov word ptr es:[bx + 0x36], 0
02d1:1948 eb0e           jmp 0x1958
02d1:194a c45e06         les bx, ptr [bp + 6]
02d1:194d 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:1951 c45e06         les bx, ptr [bp + 6]
02d1:1954 26294736       sub word ptr es:[bx + 0x36], ax
02d1:1958 ff7608         push word ptr [bp + 8]
02d1:195b ff7606         push word ptr [bp + 6]
02d1:195e 0e             push cs
02d1:195f e889f5         call 0xeeb
02d1:1962 59             pop cx
02d1:1963 59             pop cx
02d1:1964 c45e06         les bx, ptr [bp + 6]
02d1:1967 26ff7744       push word ptr es:[bx + 0x44]
02d1:196b 6a00           push 0
02d1:196d ff7608         push word ptr [bp + 8]
02d1:1970 ff7606         push word ptr [bp + 6]
02d1:1973 0e             push cs
02d1:1974 e884f1         call 0xafb
02d1:1977 83c408         add sp, 8
02d1:197a ff7608         push word ptr [bp + 8]
02d1:197d ff7606         push word ptr [bp + 6]
02d1:1980 0e             push cs
02d1:1981 e867f5         call 0xeeb
02d1:1984 59             pop cx
02d1:1985 59             pop cx
02d1:1986 5d             pop bp
02d1:1987 cb             retf 
02d1:1988 55             push bp
02d1:1989 8bec           mov bp, sp
02d1:198b 3926d608       cmp word ptr [0x8d6], sp
02d1:198f 7705           ja 0x1996
02d1:1991 9a072d0000     lcall __OVERFLOW
02d1:1996 c45e06         les bx, ptr [bp + 6]
02d1:1999 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:199d c45e06         les bx, ptr [bp + 6]
02d1:19a0 26014744       add word ptr es:[bx + 0x44], ax
02d1:19a4 c45e06         les bx, ptr [bp + 6]
02d1:19a7 268b4744       mov ax, word ptr es:[bx + 0x44]
02d1:19ab c45e06         les bx, ptr [bp + 6]
02d1:19ae 263b4748       cmp ax, word ptr es:[bx + 0x48]
02d1:19b2 7610           jbe 0x19c4
02d1:19b4 c45e06         les bx, ptr [bp + 6]
02d1:19b7 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:19bb c45e06         les bx, ptr [bp + 6]
02d1:19be 26294744       sub word ptr es:[bx + 0x44], ax
02d1:19c2 eb3c           jmp 0x1a00
02d1:19c4 ff7608         push word ptr [bp + 8]
02d1:19c7 ff7606         push word ptr [bp + 6]
02d1:19ca 0e             push cs
02d1:19cb e81df5         call 0xeeb
02d1:19ce 59             pop cx
02d1:19cf 59             pop cx
02d1:19d0 c45e06         les bx, ptr [bp + 6]
02d1:19d3 268b473c       mov ax, word ptr es:[bx + 0x3c]
02d1:19d7 c45e06         les bx, ptr [bp + 6]
02d1:19da 26014736       add word ptr es:[bx + 0x36], ax
02d1:19de c45e06         les bx, ptr [bp + 6]
02d1:19e1 26ff7744       push word ptr es:[bx + 0x44]
02d1:19e5 6a00           push 0
02d1:19e7 ff7608         push word ptr [bp + 8]
02d1:19ea ff7606         push word ptr [bp + 6]
02d1:19ed 0e             push cs
02d1:19ee e80af1         call 0xafb
02d1:19f1 83c408         add sp, 8
02d1:19f4 ff7608         push word ptr [bp + 8]
02d1:19f7 ff7606         push word ptr [bp + 6]
02d1:19fa 0e             push cs
02d1:19fb e8edf4         call 0xeeb
02d1:19fe 59             pop cx
02d1:19ff 59             pop cx
02d1:1a00 5d             pop bp
02d1:1a01 cb             retf 
02d1:1a02 55             push bp
02d1:1a03 8bec           mov bp, sp
02d1:1a05 3926d608       cmp word ptr [0x8d6], sp
02d1:1a09 7705           ja 0x1a10
02d1:1a0b 9a072d0000     lcall __OVERFLOW
02d1:1a10 5d             pop bp
02d1:1a11 cb             retf 
02d1:1a12 55             push bp
02d1:1a13 8bec           mov bp, sp
02d1:1a15 3926d608       cmp word ptr [0x8d6], sp
02d1:1a19 7705           ja 0x1a20
02d1:1a1b db 9a
02d1:1a1c 07             pop es
02d1:1a1d db 2d
