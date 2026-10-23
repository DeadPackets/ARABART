0000 ba8101       mov dx, 0x181
0003 2e89163502   mov word ptr cs:[0x235], dx
0008 b430         mov ah, 0x30
000a cd21         int 0x21
000c 8b2e0200     mov bp, word ptr [2]
0010 8b1e2c00     mov bx, word ptr [0x2c]
0014 8eda         mov ds, dx
0016 a39000       mov word ptr [0x90], ax
0019 8c068e00     mov word ptr [0x8e], es
001d 891e8a00     mov word ptr [0x8a], bx
0021 892ea600     mov word ptr [0xa6], bp
0025 e83d01       call 0x165
0028 c43e8800     les di, ptr [0x88]
002c 8bc7         mov ax, di
002e 8bd8         mov bx, ax
0030 b9ff7f       mov cx, 0x7fff
0033 fc           cld 
0034 f2ae         repne scasb al, byte ptr es:[di]
0036 e361         jcxz 0x99
0038 43           inc bx
0039 263805       cmp byte ptr es:[di], al
003c 75f6         jne 0x34
003e 80cd80       or ch, 0x80
0041 f7d9         neg cx
0043 890e8800     mov word ptr [0x88], cx
0047 b90100       mov cx, 1
004a d3e3         shl bx, cl
004c 83c308       add bx, 8
004f 83e3f8       and bx, 0xfff8
0052 891e8c00     mov word ptr [0x8c], bx
0056 8cda         mov dx, ds
0058 2bea         sub bp, dx
005a 8b3e1e02     mov di, word ptr [0x21e]
005e 81ff0002     cmp di, 0x200
0062 7307         jae 0x6b
0064 bf0002       mov di, 0x200
0067 893e1e02     mov word ptr [0x21e], di
006b 81c7c202     add di, 0x2c2
006f 7228         jb 0x99
0071 033e1802     add di, word ptr [0x218]
0075 7222         jb 0x99
0077 b104         mov cl, 4
0079 d3ef         shr di, cl
007b 47           inc di
007c 3bef         cmp bp, di
007e 7219         jb 0x99
0080 833e1e0200   cmp word ptr [0x21e], 0
0085 7407         je 0x8e
0087 833e180200   cmp word ptr [0x218], 0
008c 750e         jne 0x9c
008e bf0010       mov di, 0x1000
0091 3bef         cmp bp, di
0093 7707         ja 0x9c
0095 8bfd         mov di, bp
0097 eb03         jmp 0x9c
0099 e98401       jmp 0x220
009c 8bdf         mov bx, di
009e 03da         add bx, dx
00a0 891e9e00     mov word ptr [0x9e], bx
00a4 891ea200     mov word ptr [0xa2], bx
00a8 a18e00       mov ax, word ptr [0x8e]
00ab 2bd8         sub bx, ax
00ad 8ec0         mov es, ax
00af b44a         mov ah, 0x4a
00b1 57           push di
00b2 cd21         int 0x21
00b4 5f           pop di
00b5 d3e7         shl di, cl
00b7 fa           cli 
00b8 8ed2         mov ss, dx
00ba 8be7         mov sp, di
00bc fb           sti 
00bd 33c0         xor ax, ax
00bf 2e8e063502   mov es, word ptr cs:[0x235]
00c4 bf8202       mov di, 0x282
00c7 b9c202       mov cx, 0x2c2
00ca 2bcf         sub cx, di
00cc fc           cld 
00cd f3aa         rep stosb byte ptr es:[di], al
00cf b400         mov ah, 0
00d1 cd1a         int 0x1a
00d3 89169400     mov word ptr [0x94], dx
00d7 890e9600     mov word ptr [0x96], cx
00db 33ed         xor bp, bp
00dd b88001       mov ax, 0x180
00e0 8ed8         mov ds, ax
00e2 be0000       mov si, 0
00e5 bf0600       mov di, 6
00e8 e8ea00       call 0x1d5
00eb 2e8e1e3502   mov ds, word ptr cs:[0x235]
00f0 ff368600     push word ptr [0x86]
00f4 ff368400     push word ptr [0x84]
00f8 ff368200     push word ptr [0x82]
00fc e81709       call 0xa16
00ff 2ec606e70172 mov byte ptr cs:[0x1e7], 0x72
0105 2ec606d60100 mov byte ptr cs:[0x1d6], 0
010b 50           push ax
010c e8020f       call 0x1011
010f b88001       mov ax, 0x180
0112 8ed8         mov ds, ax
0114 be0600       mov si, 6
0117 bf0600       mov di, 6
011a e8b800       call 0x1d5
011d 2e8e1e3502   mov ds, word ptr cs:[0x235]
0122 ff16aa00     call word ptr [0xaa]
0126 ff16ac00     call word ptr [0xac]
012a ff16ae00     call word ptr [0xae]
012e 2e8e1e3502   mov ds, word ptr cs:[0x235]
0133 e87200       call 0x1a8
0136 33c0         xor ax, ax
0138 8bf0         mov si, ax
013a b92d00       mov cx, 0x2d
013d 0204         add al, byte ptr [si]
013f 80d400       adc ah, 0
0142 46           inc si
0143 e2f8         loop 0x13d
0145 2da50c       sub ax, 0xca5
0148 7409         je 0x153
014a b91900       mov cx, 0x19
014d ba2d00       mov dx, 0x2d
0150 e8c500       call 0x218
0153 8bec         mov bp, sp
0155 b44c         mov ah, 0x4c
0157 8a4602       mov al, byte ptr [bp + 2]
015a cd21         int 0x21
015c b90e00       mov cx, 0xe
015f ba4600       mov dx, 0x46
0162 e9c100       jmp 0x226
0165 1e           push ds
0166 b80035       mov ax, 0x3500
0169 cd21         int 0x21
016b 891e7200     mov word ptr [0x72], bx
016f 8c067400     mov word ptr [0x74], es
0173 b80435       mov ax, 0x3504
0176 cd21         int 0x21
0178 891e7600     mov word ptr [0x76], bx
017c 8c067800     mov word ptr [0x78], es
0180 b80535       mov ax, 0x3505
0183 cd21         int 0x21
0185 891e7a00     mov word ptr [0x7a], bx
0189 8c067c00     mov word ptr [0x7c], es
018d b80635       mov ax, 0x3506
0190 cd21         int 0x21
0192 891e7e00     mov word ptr [0x7e], bx
0196 8c068000     mov word ptr [0x80], es
019a b80025       mov ax, 0x2500
019d 8cca         mov dx, cs
019f 8eda         mov ds, dx
01a1 ba5c01       mov dx, 0x15c
01a4 cd21         int 0x21
01a6 1f           pop ds
01a7 c3           ret 
01a8 1e           push ds
01a9 b80025       mov ax, 0x2500
01ac c5167200     lds dx, ptr [0x72]
01b0 cd21         int 0x21
01b2 1f           pop ds
01b3 1e           push ds
01b4 b80425       mov ax, 0x2504
01b7 c5167600     lds dx, ptr [0x76]
01bb cd21         int 0x21
01bd 1f           pop ds
01be 1e           push ds
01bf b80525       mov ax, 0x2505
01c2 c5167a00     lds dx, ptr [0x7a]
01c6 cd21         int 0x21
01c8 1f           pop ds
01c9 1e           push ds
01ca b80625       mov ax, 0x2506
01cd c5167e00     lds dx, ptr [0x7e]
01d1 cd21         int 0x21
01d3 1f           pop ds
01d4 c3           ret 
01d5 b4ff         mov ah, 0xff
01d7 8bd7         mov dx, di
01d9 8bde         mov bx, si
01db 3bdf         cmp bx, di
01dd 7414         je 0x1f3
01df 803fff       cmp byte ptr [bx], 0xff
01e2 740a         je 0x1ee
01e4 386701       cmp byte ptr [bx + 1], ah
01e7 7705         ja 0x1ee
01e9 8a6701       mov ah, byte ptr [bx + 1]
01ec 8bd3         mov dx, bx
01ee 83c306       add bx, 6
01f1 ebe8         jmp 0x1db
01f3 3bd7         cmp dx, di
01f5 7420         je 0x217
01f7 8bda         mov bx, dx
01f9 1e           push ds
01fa 07           pop es
01fb 06           push es
01fc 803f00       cmp byte ptr [bx], 0
01ff c607ff       mov byte ptr [bx], 0xff
0202 2e8e1e3502   mov ds, word ptr cs:[0x235]
0207 7407         je 0x210
0209 26ff5f02     lcall es:[bx + 2]
020d 1f           pop ds
020e ebc5         jmp 0x1d5
0210 26ff5702     call word ptr es:[bx + 2]
0214 1f           pop ds
0215 ebbe         jmp 0x1d5
0217 c3           ret 
0218 b440         mov ah, 0x40
021a bb0200       mov bx, 2
021d cd21         int 0x21
021f c3           ret 
0220 b91e00       mov cx, 0x1e
0223 ba5400       mov dx, 0x54
0226 2e8e1e3502   mov ds, word ptr cs:[0x235]
022b e8eaff       call 0x218
022e b80300       mov ax, 3
0231 50           push ax
0232 e8f9fe       call 0x12e
0235 0000         add byte ptr [bx + si], al
0237 0100         add word ptr [bx + si], ax
0239 55           push bp
023a 8bec         mov bp, sp
023c 4c           dec sp
023d 4c           dec sp
023e 1e           push ds
023f b8003d       mov ax, 0x3d00
0242 ba6e02       mov dx, 0x26e
0245 0e           push cs
0246 1f           pop ds
0247 cd21         int 0x21
0249 721a         jb 0x265
024b 8bd8         mov bx, ax
024d 8b4e06       mov cx, word ptr [bp + 6]
0250 ba0000       mov dx, 0
0253 8e5e04       mov ds, word ptr [bp + 4]
0256 b43f         mov ah, 0x3f
0258 cd21         int 0x21
025a 7209         jb 0x265
025c b43e         mov ah, 0x3e
025e cd21         int 0x21
0260 7203         jb 0x265
0262 b80000       mov ax, 0
0265 8946fe       mov word ptr [bp - 2], ax
0268 1f           pop ds
0269 8b46fe       mov ax, word ptr [bp - 2]
026c eb0a         jmp 0x278
026e 4d           dec bp
026f 45           inc bp
0270 4e           dec si
0271 55           push bp
0272 322e4441     xor ch, byte ptr [0x4144]
0276 54           push sp
0277 008be55d     add byte ptr [bp + di + 0x5de5], cl
027b c3           ret 
027c 55           push bp
027d 8bec         mov bp, sp
027f 4c           dec sp
0280 4c           dec sp
0281 56           push si
0282 57           push di
0283 8b460a       mov ax, word ptr [bp + 0xa]
0286 014608       add word ptr [bp + 8], ax
0289 8b460a       mov ax, word ptr [bp + 0xa]
028c 014606       add word ptr [bp + 6], ax
028f 1e           push ds
0290 06           push es
0291 8e5e0c       mov ds, word ptr [bp + 0xc]
0294 8b7604       mov si, word ptr [bp + 4]
0297 8a5c01       mov bl, byte ptr [si + 1]
029a 32ff         xor bh, bh
029c 015e08       add word ptr [bp + 8], bx
029f 8a1c         mov bl, byte ptr [si]
02a1 015e06       add word ptr [bp + 6], bx
02a4 83c602       add si, 2
02a7 b800a0       mov ax, 0xa000
02aa 8ec0         mov es, ax
02ac 8a04         mov al, byte ptr [si]
02ae 46           inc si
02af 8846ff       mov byte ptr [bp - 1], al
02b2 bace03       mov dx, 0x3ce
02b5 b001         mov al, 1
02b7 ee           out dx, al
02b8 42           inc dx
02b9 b00f         mov al, 0xf
02bb ee           out dx, al
02bc 4a           dec dx
02bd 32c0         xor al, al
02bf ee           out dx, al
02c0 42           inc dx
02c1 8a46ff       mov al, byte ptr [bp - 1]
02c4 ee           out dx, al
02c5 8b5e08       mov bx, word ptr [bp + 8]
02c8 33c0         xor ax, ax
02ca 8a04         mov al, byte ptr [si]
02cc 2bd8         sub bx, ax
02ce 46           inc si
02cf 43           inc bx
02d0 4b           dec bx
02d1 32e4         xor ah, ah
02d3 8b5606       mov dx, word ptr [bp + 6]
02d6 ac           lodsb al, byte ptr [si]
02d7 3cef         cmp al, 0xef
02d9 74f5         je 0x2d0
02db 3cfc         cmp al, 0xfc
02dd 74cd         je 0x2ac
02df 7758         ja 0x339
02e1 2bd0         sub dx, ax
02e3 ac           lodsb al, byte ptr [si]
02e4 53           push bx
02e5 50           push ax
02e6 52           push dx
02e7 8bc3         mov ax, bx
02e9 33d2         xor dx, dx
02eb bb5000       mov bx, 0x50
02ee f7e3         mul bx
02f0 8bf8         mov di, ax
02f2 5a           pop dx
02f3 58           pop ax
02f4 b90300       mov cx, 3
02f7 33db         xor bx, bx
02f9 d1ea         shr dx, 1
02fb d1d3         rcl bx, 1
02fd e2fa         loop 0x2f9
02ff 03fa         add di, dx
0301 2e8a8f3d03   mov cl, byte ptr cs:[bx + 0x33d]
0306 32ed         xor ch, ch
0308 8bd9         mov bx, cx
030a 8bc8         mov cx, ax
030c bace03       mov dx, 0x3ce
030f b008         mov al, 8
0311 ee           out dx, al
0312 42           inc dx
0313 33c0         xor ax, ax
0315 2e0a874503   or al, byte ptr cs:[bx + 0x345]
031a 83fb00       cmp bx, 0
031d 750d         jne 0x32c
031f ee           out dx, al
0320 268a05       mov al, byte ptr es:[di]
0323 268805       mov byte ptr es:[di], al
0326 4f           dec di
0327 bb0800       mov bx, 8
032a 32c0         xor al, al
032c 4b           dec bx
032d e2e6         loop 0x315
032f ee           out dx, al
0330 268a05       mov al, byte ptr es:[di]
0333 268805       mov byte ptr es:[di], al
0336 5b           pop bx
0337 eb98         jmp 0x2d1
0339 07           pop es
033a 1f           pop ds
033b eb10         jmp 0x34d
033d 0004         add byte ptr [si], al
033f 02060105     add al, byte ptr [0x501]
0343 0307         add ax, word ptr [bx]
0345 80402010     add byte ptr [bx + si + 0x20], 0x10
0349 0804         or byte ptr [si], al
034b 0201         add al, byte ptr [bx + di]
034d 5f           pop di
034e 5e           pop si
034f 8be5         mov sp, bp
0351 5d           pop bp
0352 c3           ret 
0353 55           push bp
0354 8bec         mov bp, sp
0356 bace03       mov dx, 0x3ce
0359 b80100       mov ax, 1
035c ef           out dx, ax
035d b808ff       mov ax, 0xff08
0360 ef           out dx, ax
0361 5d           pop bp
0362 c3           ret 
0363 55           push bp
0364 8bec         mov bp, sp
0366 bace03       mov dx, 0x3ce
0369 b001         mov al, 1
036b ee           out dx, al
036c 42           inc dx
036d b00f         mov al, 0xf
036f ee           out dx, al
0370 4a           dec dx
0371 32c0         xor al, al
0373 ee           out dx, al
0374 42           inc dx
0375 8a4604       mov al, byte ptr [bp + 4]
0378 ee           out dx, al
0379 5d           pop bp
037a c3           ret 
037b 55           push bp
037c 8bec         mov bp, sp
037e 83ec06       sub sp, 6
0381 8b4604       mov ax, word ptr [bp + 4]
0384 8b5e08       mov bx, word ptr [bp + 8]
0387 3bc3         cmp ax, bx
0389 7701         ja 0x38c
038b 93           xchg bx, ax
038c 2bc3         sub ax, bx
038e 40           inc ax
038f 8946fc       mov word ptr [bp - 4], ax
0392 8b4606       mov ax, word ptr [bp + 6]
0395 8b5e0a       mov bx, word ptr [bp + 0xa]
0398 3bc3         cmp ax, bx
039a 7701         ja 0x39d
039c 93           xchg bx, ax
039d 2bc3         sub ax, bx
039f 40           inc ax
03a0 8946fa       mov word ptr [bp - 6], ax
03a3 33d2         xor dx, dx
03a5 8b46fc       mov ax, word ptr [bp - 4]
03a8 8b5efa       mov bx, word ptr [bp - 6]
03ab f7e3         mul bx
03ad d1e8         shr ax, 1
03af 050a00       add ax, 0xa
03b2 8946fe       mov word ptr [bp - 2], ax
03b5 8b46fe       mov ax, word ptr [bp - 2]
03b8 eb00         jmp 0x3ba
03ba 8be5         mov sp, bp
03bc 5d           pop bp
03bd c3           ret 
03be 55           push bp
03bf 8bec         mov bp, sp
03c1 4c           dec sp
03c2 4c           dec sp
03c3 33d2         xor dx, dx
03c5 8b4604       mov ax, word ptr [bp + 4]
03c8 bb1000       mov bx, 0x10
03cb f7f3         div bx
03cd 83fa00       cmp dx, 0
03d0 7401         je 0x3d3
03d2 40           inc ax
03d3 8bd8         mov bx, ax
03d5 b448         mov ah, 0x48
03d7 cd21         int 0x21
03d9 7303         jae 0x3de
03db b80000       mov ax, 0
03de 8946fe       mov word ptr [bp - 2], ax
03e1 8b46fe       mov ax, word ptr [bp - 2]
03e4 eb00         jmp 0x3e6
03e6 8be5         mov sp, bp
03e8 5d           pop bp
03e9 c3           ret 
03ea 55           push bp
03eb 8bec         mov bp, sp
03ed 83ec08       sub sp, 8
03f0 56           push si
03f1 57           push di
03f2 e85eff       call 0x353
03f5 8b4604       mov ax, word ptr [bp + 4]
03f8 8b5e08       mov bx, word ptr [bp + 8]
03fb 3bc3         cmp ax, bx
03fd 7701         ja 0x400
03ff 93           xchg bx, ax
0400 895efe       mov word ptr [bp - 2], bx
0403 2bc3         sub ax, bx
0405 40           inc ax
0406 8946fa       mov word ptr [bp - 6], ax
0409 8b4606       mov ax, word ptr [bp + 6]
040c 8b5e0a       mov bx, word ptr [bp + 0xa]
040f 3bc3         cmp ax, bx
0411 7701         ja 0x414
0413 93           xchg bx, ax
0414 895efc       mov word ptr [bp - 4], bx
0417 2bc3         sub ax, bx
0419 40           inc ax
041a 8946f8       mov word ptr [bp - 8], ax
041d 8b460c       mov ax, word ptr [bp + 0xc]
0420 1e           push ds
0421 06           push es
0422 8ec0         mov es, ax
0424 8b46fc       mov ax, word ptr [bp - 4]
0427 33d2         xor dx, dx
0429 bb5000       mov bx, 0x50
042c f7e3         mul bx
042e 8bf0         mov si, ax
0430 8b56fe       mov dx, word ptr [bp - 2]
0433 03f2         add si, dx
0435 8b4efa       mov cx, word ptr [bp - 6]
0438 d1e9         shr cx, 1
043a d1e9         shr cx, 1
043c d1e9         shr cx, 1
043e 8b5ef8       mov bx, word ptr [bp - 8]
0441 bf0400       mov di, 4
0444 26894dfc     mov word ptr es:[di - 4], cx
0448 26895dfe     mov word ptr es:[di - 2], bx
044c b800a0       mov ax, 0xa000
044f 8ed8         mov ds, ax
0451 bace03       mov dx, 0x3ce
0454 b80400       mov ax, 4
0457 ef           out dx, ax
0458 53           push bx
0459 56           push si
045a 51           push cx
045b 56           push si
045c f3a4         rep movsb byte ptr es:[di], byte ptr [si]
045e 5e           pop si
045f 59           pop cx
0460 83c650       add si, 0x50
0463 4b           dec bx
0464 83fb00       cmp bx, 0
0467 75f1         jne 0x45a
0469 5e           pop si
046a 5b           pop bx
046b 050001       add ax, 0x100
046e 3d0403       cmp ax, 0x304
0471 76e4         jbe 0x457
0473 07           pop es
0474 1f           pop ds
0475 5f           pop di
0476 5e           pop si
0477 8be5         mov sp, bp
0479 5d           pop bp
047a c3           ret 
047b 55           push bp
047c 8bec         mov bp, sp
047e 56           push si
047f 57           push di
0480 e8d0fe       call 0x353
0483 8b4606       mov ax, word ptr [bp + 6]
0486 33d2         xor dx, dx
0488 bb5000       mov bx, 0x50
048b f7e3         mul bx
048d 8bf8         mov di, ax
048f 8b5604       mov dx, word ptr [bp + 4]
0492 b103         mov cl, 3
0494 d3ea         shr dx, cl
0496 03fa         add di, dx
0498 1e           push ds
0499 06           push es
049a 8e5e08       mov ds, word ptr [bp + 8]
049d b800a0       mov ax, 0xa000
04a0 8ec0         mov es, ax
04a2 be0400       mov si, 4
04a5 8b4cfc       mov cx, word ptr [si - 4]
04a8 8b5cfe       mov bx, word ptr [si - 2]
04ab bac403       mov dx, 0x3c4
04ae b002         mov al, 2
04b0 ee           out dx, al
04b1 42           inc dx
04b2 b001         mov al, 1
04b4 bac503       mov dx, 0x3c5
04b7 ee           out dx, al
04b8 53           push bx
04b9 57           push di
04ba 51           push cx
04bb 57           push di
04bc f3a4         rep movsb byte ptr es:[di], byte ptr [si]
04be 5f           pop di
04bf 59           pop cx
04c0 83c750       add di, 0x50
04c3 4b           dec bx
04c4 83fb00       cmp bx, 0
04c7 75f1         jne 0x4ba
04c9 5f           pop di
04ca 5b           pop bx
04cb d0e0         shl al, 1
04cd 3c10         cmp al, 0x10
04cf 76e3         jbe 0x4b4
04d1 07           pop es
04d2 1f           pop ds
04d3 5f           pop di
04d4 5e           pop si
04d5 5d           pop bp
04d6 c3           ret 
04d7 55           push bp
04d8 8bec         mov bp, sp
04da 8e4604       mov es, word ptr [bp + 4]
04dd b449         mov ah, 0x49
04df cd21         int 0x21
04e1 5d           pop bp
04e2 c3           ret 
04e3 55           push bp
04e4 8bec         mov bp, sp
04e6 83ec08       sub sp, 8
04e9 56           push si
04ea 57           push di
04eb e865fe       call 0x353
04ee 8b4604       mov ax, word ptr [bp + 4]
04f1 8b5e08       mov bx, word ptr [bp + 8]
04f4 3bc3         cmp ax, bx
04f6 7701         ja 0x4f9
04f8 93           xchg bx, ax
04f9 8946fe       mov word ptr [bp - 2], ax
04fc 2bc3         sub ax, bx
04fe 40           inc ax
04ff 8946fa       mov word ptr [bp - 6], ax
0502 8b4606       mov ax, word ptr [bp + 6]
0505 8b5e0a       mov bx, word ptr [bp + 0xa]
0508 3bc3         cmp ax, bx
050a 7701         ja 0x50d
050c 93           xchg bx, ax
050d 8946fc       mov word ptr [bp - 4], ax
0510 2bc3         sub ax, bx
0512 40           inc ax
0513 8946f8       mov word ptr [bp - 8], ax
0516 06           push es
0517 b800a0       mov ax, 0xa000
051a 8ec0         mov es, ax
051c 8b46fc       mov ax, word ptr [bp - 4]
051f 33d2         xor dx, dx
0521 bb5000       mov bx, 0x50
0524 f7e3         mul bx
0526 8bf0         mov si, ax
0528 8b56fe       mov dx, word ptr [bp - 2]
052b b90300       mov cx, 3
052e 33db         xor bx, bx
0530 d1ea         shr dx, 1
0532 d1d3         rcl bx, 1
0534 e2fa         loop 0x530
0536 03f2         add si, dx
0538 33d2         xor dx, dx
053a 2e8a97a405   mov dl, byte ptr cs:[bx + 0x5a4]
053f 8bfa         mov di, dx
0541 33c0         xor ax, ax
0543 8b4efa       mov cx, word ptr [bp - 6]
0546 2e0a85ac05   or al, byte ptr cs:[di + 0x5ac]
054b 83ff00       cmp di, 0
054e 752c         jne 0x57c
0550 51           push cx
0551 56           push si
0552 8b4ef8       mov cx, word ptr [bp - 8]
0555 50           push ax
0556 bace03       mov dx, 0x3ce
0559 b80403       mov ax, 0x304
055c ef           out dx, ax
055d 58           pop ax
055e 268a24       mov ah, byte ptr es:[si]
0561 32e0         xor ah, al
0563 50           push ax
0564 bac403       mov dx, 0x3c4
0567 b80208       mov ax, 0x802
056a ef           out dx, ax
056b 58           pop ax
056c 268824       mov byte ptr es:[si], ah
056f 83ee50       sub si, 0x50
0572 e2e1         loop 0x555
0574 5e           pop si
0575 32c0         xor al, al
0577 4e           dec si
0578 bf0800       mov di, 8
057b 59           pop cx
057c 4f           dec di
057d e2c7         loop 0x546
057f 8b4ef8       mov cx, word ptr [bp - 8]
0582 50           push ax
0583 bace03       mov dx, 0x3ce
0586 b80403       mov ax, 0x304
0589 ef           out dx, ax
058a 58           pop ax
058b 268a24       mov ah, byte ptr es:[si]
058e 32e0         xor ah, al
0590 50           push ax
0591 bac403       mov dx, 0x3c4
0594 b80208       mov ax, 0x802
0597 ef           out dx, ax
0598 58           pop ax
0599 268824       mov byte ptr es:[si], ah
059c 83ee50       sub si, 0x50
059f e2e1         loop 0x582
05a1 07           pop es
05a2 eb10         jmp 0x5b4
05a4 0004         add byte ptr [si], al
05a6 02060105     add al, byte ptr [0x501]
05aa 0307         add ax, word ptr [bx]
05ac 80402010     add byte ptr [bx + si + 0x20], 0x10
05b0 0804         or byte ptr [si], al
05b2 0201         add al, byte ptr [bx + di]
05b4 5f           pop di
05b5 5e           pop si
05b6 8be5         mov sp, bp
05b8 5d           pop bp
05b9 c3           ret 
05ba 55           push bp
05bb 8bec         mov bp, sp
05bd 83ec08       sub sp, 8
05c0 56           push si
05c1 57           push di
05c2 8b4604       mov ax, word ptr [bp + 4]
05c5 8b5e08       mov bx, word ptr [bp + 8]
05c8 3bc3         cmp ax, bx
05ca 7701         ja 0x5cd
05cc 93           xchg bx, ax
05cd 8946fe       mov word ptr [bp - 2], ax
05d0 2bc3         sub ax, bx
05d2 40           inc ax
05d3 8946fa       mov word ptr [bp - 6], ax
05d6 8b4606       mov ax, word ptr [bp + 6]
05d9 8b5e0a       mov bx, word ptr [bp + 0xa]
05dc 3bc3         cmp ax, bx
05de 7701         ja 0x5e1
05e0 93           xchg bx, ax
05e1 8946fc       mov word ptr [bp - 4], ax
05e4 2bc3         sub ax, bx
05e6 40           inc ax
05e7 8946f8       mov word ptr [bp - 8], ax
05ea 06           push es
05eb b800a0       mov ax, 0xa000
05ee 8ec0         mov es, ax
05f0 8b46fc       mov ax, word ptr [bp - 4]
05f3 33d2         xor dx, dx
05f5 bb5000       mov bx, 0x50
05f8 f7e3         mul bx
05fa 8bf0         mov si, ax
05fc 8b56fe       mov dx, word ptr [bp - 2]
05ff b90300       mov cx, 3
0602 33db         xor bx, bx
0604 d1ea         shr dx, 1
0606 d1d3         rcl bx, 1
0608 e2fa         loop 0x604
060a 03f2         add si, dx
060c 33d2         xor dx, dx
060e 2e8a975906   mov dl, byte ptr cs:[bx + 0x659]
0613 8bfa         mov di, dx
0615 bace03       mov dx, 0x3ce
0618 b008         mov al, 8
061a ee           out dx, al
061b 42           inc dx
061c 33c0         xor ax, ax
061e 8b4efa       mov cx, word ptr [bp - 6]
0621 2e0a856106   or al, byte ptr cs:[di + 0x661]
0626 83ff00       cmp di, 0
0629 7519         jne 0x644
062b 51           push cx
062c 56           push si
062d 8b4ef8       mov cx, word ptr [bp - 8]
0630 ee           out dx, al
0631 268a04       mov al, byte ptr es:[si]
0634 268804       mov byte ptr es:[si], al
0637 83ee50       sub si, 0x50
063a e2f5         loop 0x631
063c 5e           pop si
063d 32c0         xor al, al
063f 4e           dec si
0640 bf0800       mov di, 8
0643 59           pop cx
0644 4f           dec di
0645 e2da         loop 0x621
0647 8b4ef8       mov cx, word ptr [bp - 8]
064a ee           out dx, al
064b 268a04       mov al, byte ptr es:[si]
064e 268804       mov byte ptr es:[si], al
0651 83ee50       sub si, 0x50
0654 e2f5         loop 0x64b
0656 07           pop es
0657 eb10         jmp 0x669
0659 0004         add byte ptr [si], al
065b 02060105     add al, byte ptr [0x501]
065f 0307         add ax, word ptr [bx]
0661 80402010     add byte ptr [bx + si + 0x20], 0x10
0665 0804         or byte ptr [si], al
0667 0201         add al, byte ptr [bx + di]
0669 5f           pop di
066a 5e           pop si
066b 8be5         mov sp, bp
066d 5d           pop bp
066e c3           ret 
066f 55           push bp
0670 8bec         mov bp, sp
0672 83ec08       sub sp, 8
0675 56           push si
0676 57           push di
0677 8b4604       mov ax, word ptr [bp + 4]
067a 8b5e08       mov bx, word ptr [bp + 8]
067d 3bc3         cmp ax, bx
067f 7701         ja 0x682
0681 93           xchg bx, ax
0682 8946fe       mov word ptr [bp - 2], ax
0685 2bc3         sub ax, bx
0687 40           inc ax
0688 8946fa       mov word ptr [bp - 6], ax
068b 8b4606       mov ax, word ptr [bp + 6]
068e 8b5e0a       mov bx, word ptr [bp + 0xa]
0691 3bc3         cmp ax, bx
0693 7701         ja 0x696
0695 93           xchg bx, ax
0696 8946fc       mov word ptr [bp - 4], ax
0699 2bc3         sub ax, bx
069b 40           inc ax
069c 8946f8       mov word ptr [bp - 8], ax
069f 06           push es
06a0 b800a0       mov ax, 0xa000
06a3 8ec0         mov es, ax
06a5 8b46fc       mov ax, word ptr [bp - 4]
06a8 33d2         xor dx, dx
06aa bb5000       mov bx, 0x50
06ad f7e3         mul bx
06af 8bf0         mov si, ax
06b1 8b56fe       mov dx, word ptr [bp - 2]
06b4 b90300       mov cx, 3
06b7 33db         xor bx, bx
06b9 d1ea         shr dx, 1
06bb d1d3         rcl bx, 1
06bd e2fa         loop 0x6b9
06bf 03f2         add si, dx
06c1 33d2         xor dx, dx
06c3 2e8a975707   mov dl, byte ptr cs:[bx + 0x757]
06c8 8bfa         mov di, dx
06ca bace03       mov dx, 0x3ce
06cd b008         mov al, 8
06cf ee           out dx, al
06d0 42           inc dx
06d1 33c0         xor ax, ax
06d3 8b4efa       mov cx, word ptr [bp - 6]
06d6 2e0a854707   or al, byte ptr cs:[di + 0x747]
06db 2e0aa54f07   or ah, byte ptr cs:[di + 0x74f]
06e0 83ff00       cmp di, 0
06e3 7533         jne 0x718
06e5 51           push cx
06e6 56           push si
06e7 8b4ef8       mov cx, word ptr [bp - 8]
06ea d1e9         shr cx, 1
06ec ee           out dx, al
06ed 268a04       mov al, byte ptr es:[si]
06f0 268804       mov byte ptr es:[si], al
06f3 81eea000     sub si, 0xa0
06f7 e2f4         loop 0x6ed
06f9 8ac4         mov al, ah
06fb ee           out dx, al
06fc 83c650       add si, 0x50
06ff 8b4ef8       mov cx, word ptr [bp - 8]
0702 d1e9         shr cx, 1
0704 268a04       mov al, byte ptr es:[si]
0707 268804       mov byte ptr es:[si], al
070a 81c6a000     add si, 0xa0
070e e2f4         loop 0x704
0710 5e           pop si
0711 33c0         xor ax, ax
0713 4e           dec si
0714 bf0800       mov di, 8
0717 59           pop cx
0718 4f           dec di
0719 e2bb         loop 0x6d6
071b 8b4ef8       mov cx, word ptr [bp - 8]
071e d1e9         shr cx, 1
0720 ee           out dx, al
0721 268a04       mov al, byte ptr es:[si]
0724 268804       mov byte ptr es:[si], al
0727 81eea000     sub si, 0xa0
072b e2f4         loop 0x721
072d 8ac4         mov al, ah
072f ee           out dx, al
0730 83c650       add si, 0x50
0733 8b4ef8       mov cx, word ptr [bp - 8]
0736 d1e9         shr cx, 1
0738 268a04       mov al, byte ptr es:[si]
073b 268804       mov byte ptr es:[si], al
073e 81c6a000     add si, 0xa0
0742 e2f4         loop 0x738
0744 07           pop es
0745 eb18         jmp 0x75f
0747 800020       add byte ptr [bx + si], 0x20
074a 0008         add byte ptr [bx + si], cl
074c 0002         add byte ptr [bp + si], al
074e 0000         add byte ptr [bx + si], al
0750 40           inc ax
0751 0010         add byte ptr [bx + si], dl
0753 0004         add byte ptr [si], al
0755 0001         add byte ptr [bx + di], al
0757 0004         add byte ptr [si], al
0759 02060105     add al, byte ptr [0x501]
075d 0307         add ax, word ptr [bx]
075f 5f           pop di
0760 5e           pop si
0761 8be5         mov sp, bp
0763 5d           pop bp
0764 c3           ret 
0765 55           push bp
0766 8bec         mov bp, sp
0768 83ec06       sub sp, 6
076b 56           push si
076c 57           push di
076d 1e           push ds
076e 06           push es
076f 8b4604       mov ax, word ptr [bp + 4]
0772 8b5e08       mov bx, word ptr [bp + 8]
0775 3bc3         cmp ax, bx
0777 7703         ja 0x77c
0779 747c         je 0x7f7
077b 93           xchg bx, ax
077c 8b4e06       mov cx, word ptr [bp + 6]
077f 894efc       mov word ptr [bp - 4], cx
0782 8946fe       mov word ptr [bp - 2], ax
0785 2bc3         sub ax, bx
0787 40           inc ax
0788 8946fa       mov word ptr [bp - 6], ax
078b b800a0       mov ax, 0xa000
078e 8ec0         mov es, ax
0790 8b46fc       mov ax, word ptr [bp - 4]
0793 33d2         xor dx, dx
0795 bb5000       mov bx, 0x50
0798 f7e3         mul bx
079a 8bf0         mov si, ax
079c 8b56fe       mov dx, word ptr [bp - 2]
079f b90300       mov cx, 3
07a2 33db         xor bx, bx
07a4 d1ea         shr dx, 1
07a6 d1d3         rcl bx, 1
07a8 e2fa         loop 0x7a4
07aa 03f2         add si, dx
07ac 2e8a97e707   mov dl, byte ptr cs:[bx + 0x7e7]
07b1 32f6         xor dh, dh
07b3 8bfa         mov di, dx
07b5 bace03       mov dx, 0x3ce
07b8 b008         mov al, 8
07ba ee           out dx, al
07bb 42           inc dx
07bc 32c0         xor al, al
07be 8b4efa       mov cx, word ptr [bp - 6]
07c1 2e0a85ef07   or al, byte ptr cs:[di + 0x7ef]
07c6 83ff00       cmp di, 0
07c9 750d         jne 0x7d8
07cb ee           out dx, al
07cc 268a04       mov al, byte ptr es:[si]
07cf 268804       mov byte ptr es:[si], al
07d2 32c0         xor al, al
07d4 4e           dec si
07d5 bf0800       mov di, 8
07d8 4f           dec di
07d9 e2e6         loop 0x7c1
07db ee           out dx, al
07dc 268a04       mov al, byte ptr es:[si]
07df 268804       mov byte ptr es:[si], al
07e2 07           pop es
07e3 1f           pop ds
07e4 eb70         jmp 0x856
07e6 90           nop 
07e7 0004         add byte ptr [si], al
07e9 02060105     add al, byte ptr [0x501]
07ed 0307         add ax, word ptr [bx]
07ef 80402010     add byte ptr [bx + si + 0x20], 0x10
07f3 0804         or byte ptr [si], al
07f5 0201         add al, byte ptr [bx + di]
07f7 8946fe       mov word ptr [bp - 2], ax
07fa 8b4606       mov ax, word ptr [bp + 6]
07fd 8b5e0a       mov bx, word ptr [bp + 0xa]
0800 3bc3         cmp ax, bx
0802 7701         ja 0x805
0804 93           xchg bx, ax
0805 8946fc       mov word ptr [bp - 4], ax
0808 2bc3         sub ax, bx
080a 40           inc ax
080b 8946fa       mov word ptr [bp - 6], ax
080e b800a0       mov ax, 0xa000
0811 8ec0         mov es, ax
0813 8b46fc       mov ax, word ptr [bp - 4]
0816 33d2         xor dx, dx
0818 bb5000       mov bx, 0x50
081b f7e3         mul bx
081d 8bf0         mov si, ax
081f 8b56fe       mov dx, word ptr [bp - 2]
0822 b90300       mov cx, 3
0825 33ff         xor di, di
0827 d1ea         shr dx, 1
0829 d1d7         rcl di, 1
082b e2fa         loop 0x827
082d 03f2         add si, dx
082f bace03       mov dx, 0x3ce
0832 b008         mov al, 8
0834 ee           out dx, al
0835 42           inc dx
0836 2e8a854e08   mov al, byte ptr cs:[di + 0x84e]
083b ee           out dx, al
083c 8b4efa       mov cx, word ptr [bp - 6]
083f 268a04       mov al, byte ptr es:[si]
0842 268804       mov byte ptr es:[si], al
0845 83ee50       sub si, 0x50
0848 e2f5         loop 0x83f
084a 07           pop es
084b 1f           pop ds
084c eb08         jmp 0x856
084e 800820       or byte ptr [bx + si], 0x20
0851 024004       add al, byte ptr [bx + si + 4]
0854 1001         adc byte ptr [bx + di], al
0856 5f           pop di
0857 5e           pop si
0858 8be5         mov sp, bp
085a 5d           pop bp
085b c3           ret 
085c 55           push bp
085d 8bec         mov bp, sp
085f 56           push si
0860 57           push di
0861 8b7e08       mov di, word ptr [bp + 8]
0864 8b760a       mov si, word ptr [bp + 0xa]
0867 56           push si
0868 ff7604       push word ptr [bp + 4]
086b ff7606       push word ptr [bp + 6]
086e ff7604       push word ptr [bp + 4]
0871 e8f1fe       call 0x765
0874 83c408       add sp, 8
0877 56           push si
0878 57           push di
0879 56           push si
087a ff7604       push word ptr [bp + 4]
087d e8e5fe       call 0x765
0880 83c408       add sp, 8
0883 ff7606       push word ptr [bp + 6]
0886 57           push di
0887 56           push si
0888 57           push di
0889 e8d9fe       call 0x765
088c 83c408       add sp, 8
088f ff7606       push word ptr [bp + 6]
0892 ff7604       push word ptr [bp + 4]
0895 ff7606       push word ptr [bp + 6]
0898 57           push di
0899 e8c9fe       call 0x765
089c 83c408       add sp, 8
089f 5f           pop di
08a0 5e           pop si
08a1 5d           pop bp
08a2 c3           ret 
08a3 55           push bp
08a4 8bec         mov bp, sp
08a6 83ec06       sub sp, 6
08a9 8b460c       mov ax, word ptr [bp + 0xc]
08ac 2d1000       sub ax, 0x10
08af 89460c       mov word ptr [bp + 0xc], ax
08b2 8b4604       mov ax, word ptr [bp + 4]
08b5 034608       add ax, word ptr [bp + 8]
08b8 48           dec ax
08b9 8946fc       mov word ptr [bp - 4], ax
08bc 8b4606       mov ax, word ptr [bp + 6]
08bf 03460a       add ax, word ptr [bp + 0xa]
08c2 48           dec ax
08c3 8946fa       mov word ptr [bp - 6], ax
08c6 c646fe01     mov byte ptr [bp - 2], 1
08ca c646ff00     mov byte ptr [bp - 1], 0
08ce e9bc00       jmp 0x98d
08d1 8a5e0c       mov bl, byte ptr [bp + 0xc]
08d4 025eff       add bl, byte ptr [bp - 1]
08d7 32ff         xor bh, bh
08d9 2e8a87b209   mov al, byte ptr cs:[bx + 0x9b2]
08de 8846fe       mov byte ptr [bp - 2], al
08e1 53           push bx
08e2 807efe00     cmp byte ptr [bp - 2], 0
08e6 7411         je 0x8f9
08e8 807efe08     cmp byte ptr [bp - 2], 8
08ec 740b         je 0x8f9
08ee 8a46fe       mov al, byte ptr [bp - 2]
08f1 02460e       add al, byte ptr [bp + 0xe]
08f4 04f9         add al, 0xf9
08f6 8846fe       mov byte ptr [bp - 2], al
08f9 8a46fe       mov al, byte ptr [bp - 2]
08fc 50           push ax
08fd e863fa       call 0x363
0900 59           pop cx
0901 ff7606       push word ptr [bp + 6]
0904 ff76fc       push word ptr [bp - 4]
0907 ff7606       push word ptr [bp + 6]
090a ff7604       push word ptr [bp + 4]
090d e855fe       call 0x765
0910 83c408       add sp, 8
0913 ff76fa       push word ptr [bp - 6]
0916 ff7604       push word ptr [bp + 4]
0919 ff7606       push word ptr [bp + 6]
091c ff7604       push word ptr [bp + 4]
091f e843fe       call 0x765
0922 83c408       add sp, 8
0925 5b           pop bx
0926 2e8a87b309   mov al, byte ptr cs:[bx + 0x9b3]
092b 8846fe       mov byte ptr [bp - 2], al
092e 53           push bx
092f 807efe00     cmp byte ptr [bp - 2], 0
0933 7411         je 0x946
0935 807efe08     cmp byte ptr [bp - 2], 8
0939 740b         je 0x946
093b 8a46fe       mov al, byte ptr [bp - 2]
093e 02460e       add al, byte ptr [bp + 0xe]
0941 04f9         add al, 0xf9
0943 8846fe       mov byte ptr [bp - 2], al
0946 8a46fe       mov al, byte ptr [bp - 2]
0949 50           push ax
094a e816fa       call 0x363
094d 59           pop cx
094e ff76fa       push word ptr [bp - 6]
0951 ff76fc       push word ptr [bp - 4]
0954 ff7606       push word ptr [bp + 6]
0957 ff76fc       push word ptr [bp - 4]
095a e808fe       call 0x765
095d 83c408       add sp, 8
0960 ff76fa       push word ptr [bp - 6]
0963 ff76fc       push word ptr [bp - 4]
0966 ff76fa       push word ptr [bp - 6]
0969 ff7604       push word ptr [bp + 4]
096c e8f6fd       call 0x765
096f 83c408       add sp, 8
0972 ff4604       inc word ptr [bp + 4]
0975 ff4606       inc word ptr [bp + 6]
0978 ff4efc       dec word ptr [bp - 4]
097b ff4efa       dec word ptr [bp - 6]
097e ff46ff       inc word ptr [bp - 1]
0981 ff46ff       inc word ptr [bp - 1]
0984 5b           pop bx
0985 2e8a87b409   mov al, byte ptr cs:[bx + 0x9b4]
098a 8846fe       mov byte ptr [bp - 2], al
098d 807efe10     cmp byte ptr [bp - 2], 0x10
0991 7403         je 0x996
0993 e93bff       jmp 0x8d1
0996 8a460e       mov al, byte ptr [bp + 0xe]
0999 50           push ax
099a e8c6f9       call 0x363
099d 59           pop cx
099e ff76fa       push word ptr [bp - 6]
09a1 ff76fc       push word ptr [bp - 4]
09a4 ff7606       push word ptr [bp + 6]
09a7 ff7604       push word ptr [bp + 4]
09aa e80dfc       call 0x5ba
09ad 83c408       add sp, 8
09b0 eb60         jmp 0xa12
09b2 db 0f
09b3 db 0f
09b4 db 0f
09b5 0f1000       movups xmm0, xmmword ptr [bx + si]
09b8 0000         add byte ptr [bx + si], al
09ba 0000         add byte ptr [bx + si], al
09bc 0000         add byte ptr [bx + si], al
09be 0000         add byte ptr [bx + si], al
09c0 0000         add byte ptr [bx + si], al
09c2 080f         or byte ptr [bx], cl
09c4 080f         or byte ptr [bx], cl
09c6 1000         adc byte ptr [bx + si], al
09c8 0000         add byte ptr [bx + si], al
09ca 0000         add byte ptr [bx + si], al
09cc 0000         add byte ptr [bx + si], al
09ce 0000         add byte ptr [bx + si], al
09d0 0000         add byte ptr [bx + si], al
09d2 0f08         invd 
09d4 0f08         invd 
09d6 1000         adc byte ptr [bx + si], al
09d8 0000         add byte ptr [bx + si], al
09da 0000         add byte ptr [bx + si], al
09dc 0000         add byte ptr [bx + si], al
09de 0000         add byte ptr [bx + si], al
09e0 0000         add byte ptr [bx + si], al
09e2 0f08         invd 
09e4 0f08         invd 
09e6 07           pop es
09e7 07           pop es
09e8 07           pop es
09e9 07           pop es
09ea 07           pop es
09eb 07           pop es
09ec 080f         or byte ptr [bx], cl
09ee 080f         or byte ptr [bx], cl
09f0 1000         adc byte ptr [bx + si], al
09f2 0000         add byte ptr [bx + si], al
09f4 0807         or byte ptr [bx], al
09f6 0807         or byte ptr [bx], al
09f8 1000         adc byte ptr [bx + si], al
09fa 0000         add byte ptr [bx + si], al
09fc 0000         add byte ptr [bx + si], al
09fe 0000         add byte ptr [bx + si], al
0a00 0000         add byte ptr [bx + si], al
0a02 0000         add byte ptr [bx + si], al
0a04 0f08         invd 
0a06 0f08         invd 
0a08 1000         adc byte ptr [bx + si], al
0a0a 0000         add byte ptr [bx + si], al
0a0c 0000         add byte ptr [bx + si], al
0a0e 0000         add byte ptr [bx + si], al
0a10 0000         add byte ptr [bx + si], al
0a12 8be5         mov sp, bp
0a14 5d           pop bp
0a15 c3           ret 
0a16 55           push bp
0a17 8bec         mov bp, sp
0a19 4c           dec sp
0a1a 4c           dec sp
0a1b 56           push si
0a1c 57           push di
0a1d b81000       mov ax, 0x10
0a20 cd10         int 0x10
0a22 b8a00f       mov ax, 0xfa0
0a25 50           push ax
0a26 e895f9       call 0x3be
0a29 59           pop cx
0a2a 8946fe       mov word ptr [bp - 2], ax
0a2d b8a00f       mov ax, 0xfa0
0a30 50           push ax
0a31 ff76fe       push word ptr [bp - 2]
0a34 e802f8       call 0x239
0a37 59           pop cx
0a38 59           pop cx
0a39 8bf0         mov si, ax
0a3b b007         mov al, 7
0a3d 50           push ax
0a3e b040         mov al, 0x40
0a40 50           push ax
0a41 b83201       mov ax, 0x132
0a44 50           push ax
0a45 b8c800       mov ax, 0xc8
0a48 50           push ax
0a49 b80500       mov ax, 5
0a4c 50           push ax
0a4d b80500       mov ax, 5
0a50 50           push ax
0a51 e84ffe       call 0x8a3
0a54 83c40c       add sp, 0xc
0a57 33ff         xor di, di
0a59 e9a400       jmp 0xb00
0a5c b007         mov al, 7
0a5e 50           push ax
0a5f b050         mov al, 0x50
0a61 50           push ax
0a62 b82200       mov ax, 0x22
0a65 50           push ax
0a66 b83000       mov ax, 0x30
0a69 50           push ax
0a6a b81200       mov ax, 0x12
0a6d 50           push ax
0a6e b81200       mov ax, 0x12
0a71 50           push ax
0a72 e82efe       call 0x8a3
0a75 83c40c       add sp, 0xc
0a78 ff76fe       push word ptr [bp - 2]
0a7b b80200       mov ax, 2
0a7e 50           push ax
0a7f b81800       mov ax, 0x18
0a82 50           push ax
0a83 b81400       mov ax, 0x14
0a86 50           push ax
0a87 b8c20a       mov ax, 0xac2
0a8a 50           push ax
0a8b e8eef7       call 0x27c
0a8e 83c40a       add sp, 0xa
0a91 33f6         xor si, si
0a93 eb0b         jmp 0xaa0
0a95 8bc6         mov ax, si
0a97 48           dec ax
0a98 8bf0         mov si, ax
0a9a 8bc6         mov ax, si
0a9c 40           inc ax
0a9d 8bf0         mov si, ax
0a9f 46           inc si
0aa0 33c0         xor ax, ax
0aa2 0bc0         or ax, ax
0aa4 7cef         jl 0xa95
0aa6 7f06         jg 0xaae
0aa8 81fe409c     cmp si, 0x9c40
0aac 76e7         jbe 0xa95
0aae b007         mov al, 7
0ab0 50           push ax
0ab1 b060         mov al, 0x60
0ab3 50           push ax
0ab4 b82200       mov ax, 0x22
0ab7 50           push ax
0ab8 b83000       mov ax, 0x30
0abb 50           push ax
0abc b81200       mov ax, 0x12
0abf 50           push ax
0ac0 b81200       mov ax, 0x12
0ac3 50           push ax
0ac4 e8dcfd       call 0x8a3
0ac7 83c40c       add sp, 0xc
0aca ff76fe       push word ptr [bp - 2]
0acd 33c0         xor ax, ax
0acf 50           push ax
0ad0 b81800       mov ax, 0x18
0ad3 50           push ax
0ad4 b81400       mov ax, 0x14
0ad7 50           push ax
0ad8 b8c20a       mov ax, 0xac2
0adb 50           push ax
0adc e89df7       call 0x27c
0adf 83c40a       add sp, 0xa
0ae2 33f6         xor si, si
0ae4 eb0b         jmp 0xaf1
0ae6 8bc6         mov ax, si
0ae8 48           dec ax
0ae9 8bf0         mov si, ax
0aeb 8bc6         mov ax, si
0aed 40           inc ax
0aee 8bf0         mov si, ax
0af0 46           inc si
0af1 33c0         xor ax, ax
0af3 0bc0         or ax, ax
0af5 7cef         jl 0xae6
0af7 7f06         jg 0xaff
0af9 81fe409c     cmp si, 0x9c40
0afd 76e7         jbe 0xae6
0aff 47           inc di
0b00 83ff0a       cmp di, 0xa
0b03 7703         ja 0xb08
0b05 e954ff       jmp 0xa5c
0b08 33ff         xor di, di
0b0a e9a400       jmp 0xbb1
0b0d b007         mov al, 7
0b0f 50           push ax
0b10 b050         mov al, 0x50
0b12 50           push ax
0b13 b82200       mov ax, 0x22
0b16 50           push ax
0b17 b83000       mov ax, 0x30
0b1a 50           push ax
0b1b b83500       mov ax, 0x35
0b1e 50           push ax
0b1f b81200       mov ax, 0x12
0b22 50           push ax
0b23 e87dfd       call 0x8a3
0b26 83c40c       add sp, 0xc
0b29 ff76fe       push word ptr [bp - 2]
0b2c b80200       mov ax, 2
0b2f 50           push ax
0b30 b83b00       mov ax, 0x3b
0b33 50           push ax
0b34 b81400       mov ax, 0x14
0b37 50           push ax
0b38 b8b902       mov ax, 0x2b9
0b3b 50           push ax
0b3c e83df7       call 0x27c
0b3f 83c40a       add sp, 0xa
0b42 33f6         xor si, si
0b44 eb0b         jmp 0xb51
0b46 8bc6         mov ax, si
0b48 48           dec ax
0b49 8bf0         mov si, ax
0b4b 8bc6         mov ax, si
0b4d 40           inc ax
0b4e 8bf0         mov si, ax
0b50 46           inc si
0b51 33c0         xor ax, ax
0b53 0bc0         or ax, ax
0b55 7cef         jl 0xb46
0b57 7f06         jg 0xb5f
0b59 81fe409c     cmp si, 0x9c40
0b5d 76e7         jbe 0xb46
0b5f b007         mov al, 7
0b61 50           push ax
0b62 b060         mov al, 0x60
0b64 50           push ax
0b65 b82200       mov ax, 0x22
0b68 50           push ax
0b69 b83000       mov ax, 0x30
0b6c 50           push ax
0b6d b83500       mov ax, 0x35
0b70 50           push ax
0b71 b81200       mov ax, 0x12
0b74 50           push ax
0b75 e82bfd       call 0x8a3
0b78 83c40c       add sp, 0xc
0b7b ff76fe       push word ptr [bp - 2]
0b7e 33c0         xor ax, ax
0b80 50           push ax
0b81 b83b00       mov ax, 0x3b
0b84 50           push ax
0b85 b81400       mov ax, 0x14
0b88 50           push ax
0b89 b8b902       mov ax, 0x2b9
0b8c 50           push ax
0b8d e8ecf6       call 0x27c
0b90 83c40a       add sp, 0xa
0b93 33f6         xor si, si
0b95 eb0b         jmp 0xba2
0b97 8bc6         mov ax, si
0b99 48           dec ax
0b9a 8bf0         mov si, ax
0b9c 8bc6         mov ax, si
0b9e 40           inc ax
0b9f 8bf0         mov si, ax
0ba1 46           inc si
0ba2 33c0         xor ax, ax
0ba4 0bc0         or ax, ax
0ba6 7cef         jl 0xb97
0ba8 7f06         jg 0xbb0
0baa 81fe409c     cmp si, 0x9c40
0bae 76e7         jbe 0xb97
0bb0 47           inc di
0bb1 83ff0a       cmp di, 0xa
0bb4 7703         ja 0xbb9
0bb6 e954ff       jmp 0xb0d
0bb9 33ff         xor di, di
0bbb e9a400       jmp 0xc62
0bbe b007         mov al, 7
0bc0 50           push ax
0bc1 b050         mov al, 0x50
0bc3 50           push ax
0bc4 b82200       mov ax, 0x22
0bc7 50           push ax
0bc8 b83000       mov ax, 0x30
0bcb 50           push ax
0bcc b85800       mov ax, 0x58
0bcf 50           push ax
0bd0 b81200       mov ax, 0x12
0bd3 50           push ax
0bd4 e8ccfc       call 0x8a3
0bd7 83c40c       add sp, 0xc
0bda ff76fe       push word ptr [bp - 2]
0bdd b80200       mov ax, 2
0be0 50           push ax
0be1 b85e00       mov ax, 0x5e
0be4 50           push ax
0be5 b81400       mov ax, 0x14
0be8 50           push ax
0be9 b86401       mov ax, 0x164
0bec 50           push ax
0bed e88cf6       call 0x27c
0bf0 83c40a       add sp, 0xa
0bf3 33f6         xor si, si
0bf5 eb0b         jmp 0xc02
0bf7 8bc6         mov ax, si
0bf9 48           dec ax
0bfa 8bf0         mov si, ax
0bfc 8bc6         mov ax, si
0bfe 40           inc ax
0bff 8bf0         mov si, ax
0c01 46           inc si
0c02 33c0         xor ax, ax
0c04 0bc0         or ax, ax
0c06 7cef         jl 0xbf7
0c08 7f06         jg 0xc10
0c0a 81fe409c     cmp si, 0x9c40
0c0e 76e7         jbe 0xbf7
0c10 b007         mov al, 7
0c12 50           push ax
0c13 b060         mov al, 0x60
0c15 50           push ax
0c16 b82200       mov ax, 0x22
0c19 50           push ax
0c1a b83000       mov ax, 0x30
0c1d 50           push ax
0c1e b85800       mov ax, 0x58
0c21 50           push ax
0c22 b81200       mov ax, 0x12
0c25 50           push ax
0c26 e87afc       call 0x8a3
0c29 83c40c       add sp, 0xc
0c2c ff76fe       push word ptr [bp - 2]
0c2f 33c0         xor ax, ax
0c31 50           push ax
0c32 b85e00       mov ax, 0x5e
0c35 50           push ax
0c36 b81400       mov ax, 0x14
0c39 50           push ax
0c3a b86401       mov ax, 0x164
0c3d 50           push ax
0c3e e83bf6       call 0x27c
0c41 83c40a       add sp, 0xa
0c44 33f6         xor si, si
0c46 eb0b         jmp 0xc53
0c48 8bc6         mov ax, si
0c4a 48           dec ax
0c4b 8bf0         mov si, ax
0c4d 8bc6         mov ax, si
0c4f 40           inc ax
0c50 8bf0         mov si, ax
0c52 46           inc si
0c53 33c0         xor ax, ax
0c55 0bc0         or ax, ax
0c57 7cef         jl 0xc48
0c59 7f06         jg 0xc61
0c5b 81fe409c     cmp si, 0x9c40
0c5f 76e7         jbe 0xc48
0c61 47           inc di
0c62 83ff0a       cmp di, 0xa
0c65 7703         ja 0xc6a
0c67 e954ff       jmp 0xbbe
0c6a 33ff         xor di, di
0c6c e9a400       jmp 0xd13
0c6f b007         mov al, 7
0c71 50           push ax
0c72 b050         mov al, 0x50
0c74 50           push ax
0c75 b82200       mov ax, 0x22
0c78 50           push ax
0c79 b83000       mov ax, 0x30
0c7c 50           push ax
0c7d b87b00       mov ax, 0x7b
0c80 50           push ax
0c81 b81200       mov ax, 0x12
0c84 50           push ax
0c85 e81bfc       call 0x8a3
0c88 83c40c       add sp, 0xc
0c8b ff76fe       push word ptr [bp - 2]
0c8e b80200       mov ax, 2
0c91 50           push ax
0c92 b88100       mov ax, 0x81
0c95 50           push ax
0c96 b81400       mov ax, 0x14
0c99 50           push ax
0c9a b8d603       mov ax, 0x3d6
0c9d 50           push ax
0c9e e8dbf5       call 0x27c
0ca1 83c40a       add sp, 0xa
0ca4 33f6         xor si, si
0ca6 eb0b         jmp 0xcb3
0ca8 8bc6         mov ax, si
0caa 48           dec ax
0cab 8bf0         mov si, ax
0cad 8bc6         mov ax, si
0caf 40           inc ax
0cb0 8bf0         mov si, ax
0cb2 46           inc si
0cb3 33c0         xor ax, ax
0cb5 0bc0         or ax, ax
0cb7 7cef         jl 0xca8
0cb9 7f06         jg 0xcc1
0cbb 81fe409c     cmp si, 0x9c40
0cbf 76e7         jbe 0xca8
0cc1 b007         mov al, 7
0cc3 50           push ax
0cc4 b060         mov al, 0x60
0cc6 50           push ax
0cc7 b82200       mov ax, 0x22
0cca 50           push ax
0ccb b83000       mov ax, 0x30
0cce 50           push ax
0ccf b87b00       mov ax, 0x7b
0cd2 50           push ax
0cd3 b81200       mov ax, 0x12
0cd6 50           push ax
0cd7 e8c9fb       call 0x8a3
0cda 83c40c       add sp, 0xc
0cdd ff76fe       push word ptr [bp - 2]
0ce0 33c0         xor ax, ax
0ce2 50           push ax
0ce3 b88100       mov ax, 0x81
0ce6 50           push ax
0ce7 b81400       mov ax, 0x14
0cea 50           push ax
0ceb b8d603       mov ax, 0x3d6
0cee 50           push ax
0cef e88af5       call 0x27c
0cf2 83c40a       add sp, 0xa
0cf5 33f6         xor si, si
0cf7 eb0b         jmp 0xd04
0cf9 8bc6         mov ax, si
0cfb 48           dec ax
0cfc 8bf0         mov si, ax
0cfe 8bc6         mov ax, si
0d00 40           inc ax
0d01 8bf0         mov si, ax
0d03 46           inc si
0d04 33c0         xor ax, ax
0d06 0bc0         or ax, ax
0d08 7cef         jl 0xcf9
0d0a 7f06         jg 0xd12
0d0c 81fe409c     cmp si, 0x9c40
0d10 76e7         jbe 0xcf9
0d12 47           inc di
0d13 83ff0a       cmp di, 0xa
0d16 7703         ja 0xd1b
0d18 e954ff       jmp 0xc6f
0d1b 33ff         xor di, di
0d1d e9a400       jmp 0xdc4
0d20 b007         mov al, 7
0d22 50           push ax
0d23 b050         mov al, 0x50
0d25 50           push ax
0d26 b82200       mov ax, 0x22
0d29 50           push ax
0d2a b83000       mov ax, 0x30
0d2d 50           push ax
0d2e b89e00       mov ax, 0x9e
0d31 50           push ax
0d32 b81200       mov ax, 0x12
0d35 50           push ax
0d36 e86afb       call 0x8a3
0d39 83c40c       add sp, 0xc
0d3c ff76fe       push word ptr [bp - 2]
0d3f b80200       mov ax, 2
0d42 50           push ax
0d43 b8a400       mov ax, 0xa4
0d46 50           push ax
0d47 b81400       mov ax, 0x14
0d4a 50           push ax
0d4b b81000       mov ax, 0x10
0d4e 50           push ax
0d4f e82af5       call 0x27c
0d52 83c40a       add sp, 0xa
0d55 33f6         xor si, si
0d57 eb0b         jmp 0xd64
0d59 8bc6         mov ax, si
0d5b 48           dec ax
0d5c 8bf0         mov si, ax
0d5e 8bc6         mov ax, si
0d60 40           inc ax
0d61 8bf0         mov si, ax
0d63 46           inc si
0d64 33c0         xor ax, ax
0d66 0bc0         or ax, ax
0d68 7cef         jl 0xd59
0d6a 7f06         jg 0xd72
0d6c 81fe409c     cmp si, 0x9c40
0d70 76e7         jbe 0xd59
0d72 b007         mov al, 7
0d74 50           push ax
0d75 b060         mov al, 0x60
0d77 50           push ax
0d78 b82200       mov ax, 0x22
0d7b 50           push ax
0d7c b83000       mov ax, 0x30
0d7f 50           push ax
0d80 b89e00       mov ax, 0x9e
0d83 50           push ax
0d84 b81200       mov ax, 0x12
0d87 50           push ax
0d88 e818fb       call 0x8a3
0d8b 83c40c       add sp, 0xc
0d8e ff76fe       push word ptr [bp - 2]
0d91 33c0         xor ax, ax
0d93 50           push ax
0d94 b8a400       mov ax, 0xa4
0d97 50           push ax
0d98 b81400       mov ax, 0x14
0d9b 50           push ax
0d9c b81000       mov ax, 0x10
0d9f 50           push ax
0da0 e8d9f4       call 0x27c
0da3 83c40a       add sp, 0xa
0da6 33f6         xor si, si
0da8 eb0b         jmp 0xdb5
0daa 8bc6         mov ax, si
0dac 48           dec ax
0dad 8bf0         mov si, ax
0daf 8bc6         mov ax, si
0db1 40           inc ax
0db2 8bf0         mov si, ax
0db4 46           inc si
0db5 33c0         xor ax, ax
0db7 0bc0         or ax, ax
0db9 7cef         jl 0xdaa
0dbb 7f06         jg 0xdc3
0dbd 81fe409c     cmp si, 0x9c40
0dc1 76e7         jbe 0xdaa
0dc3 47           inc di
0dc4 83ff0a       cmp di, 0xa
0dc7 7703         ja 0xdcc
0dc9 e954ff       jmp 0xd20
0dcc 33ff         xor di, di
0dce e9a400       jmp 0xe75
0dd1 b007         mov al, 7
0dd3 50           push ax
0dd4 b050         mov al, 0x50
0dd6 50           push ax
0dd7 b82200       mov ax, 0x22
0dda 50           push ax
0ddb b83000       mov ax, 0x30
0dde 50           push ax
0ddf b8c100       mov ax, 0xc1
0de2 50           push ax
0de3 b81200       mov ax, 0x12
0de6 50           push ax
0de7 e8b9fa       call 0x8a3
0dea 83c40c       add sp, 0xc
0ded ff76fe       push word ptr [bp - 2]
0df0 b80200       mov ax, 2
0df3 50           push ax
0df4 b8c700       mov ax, 0xc7
0df7 50           push ax
0df8 b81400       mov ax, 0x14
0dfb 50           push ax
0dfc b82a07       mov ax, 0x72a
0dff 50           push ax
0e00 e879f4       call 0x27c
0e03 83c40a       add sp, 0xa
0e06 33f6         xor si, si
0e08 eb0b         jmp 0xe15
0e0a 8bc6         mov ax, si
0e0c 48           dec ax
0e0d 8bf0         mov si, ax
0e0f 8bc6         mov ax, si
0e11 40           inc ax
0e12 8bf0         mov si, ax
0e14 46           inc si
0e15 33c0         xor ax, ax
0e17 0bc0         or ax, ax
0e19 7cef         jl 0xe0a
0e1b 7f06         jg 0xe23
0e1d 81fe409c     cmp si, 0x9c40
0e21 76e7         jbe 0xe0a
0e23 b007         mov al, 7
0e25 50           push ax
0e26 b060         mov al, 0x60
0e28 50           push ax
0e29 b82200       mov ax, 0x22
0e2c 50           push ax
0e2d b83000       mov ax, 0x30
0e30 50           push ax
0e31 b8c100       mov ax, 0xc1
0e34 50           push ax
0e35 b81200       mov ax, 0x12
0e38 50           push ax
0e39 e867fa       call 0x8a3
0e3c 83c40c       add sp, 0xc
0e3f ff76fe       push word ptr [bp - 2]
0e42 33c0         xor ax, ax
0e44 50           push ax
0e45 b8c700       mov ax, 0xc7
0e48 50           push ax
0e49 b81400       mov ax, 0x14
0e4c 50           push ax
0e4d b82a07       mov ax, 0x72a
0e50 50           push ax
0e51 e828f4       call 0x27c
0e54 83c40a       add sp, 0xa
0e57 33f6         xor si, si
0e59 eb0b         jmp 0xe66
0e5b 8bc6         mov ax, si
0e5d 48           dec ax
0e5e 8bf0         mov si, ax
0e60 8bc6         mov ax, si
0e62 40           inc ax
0e63 8bf0         mov si, ax
0e65 46           inc si
0e66 33c0         xor ax, ax
0e68 0bc0         or ax, ax
0e6a 7cef         jl 0xe5b
0e6c 7f06         jg 0xe74
0e6e 81fe409c     cmp si, 0x9c40
0e72 76e7         jbe 0xe5b
0e74 47           inc di
0e75 83ff0a       cmp di, 0xa
0e78 7703         ja 0xe7d
0e7a e954ff       jmp 0xdd1
0e7d 33ff         xor di, di
0e7f e9a400       jmp 0xf26
0e82 b007         mov al, 7
0e84 50           push ax
0e85 b050         mov al, 0x50
0e87 50           push ax
0e88 b82200       mov ax, 0x22
0e8b 50           push ax
0e8c b83000       mov ax, 0x30
0e8f 50           push ax
0e90 b8e400       mov ax, 0xe4
0e93 50           push ax
0e94 b81200       mov ax, 0x12
0e97 50           push ax
0e98 e808fa       call 0x8a3
0e9b 83c40c       add sp, 0xc
0e9e ff76fe       push word ptr [bp - 2]
0ea1 b80200       mov ax, 2
0ea4 50           push ax
0ea5 b8ea00       mov ax, 0xea
0ea8 50           push ax
0ea9 b81400       mov ax, 0x14
0eac 50           push ax
0ead b85d05       mov ax, 0x55d
0eb0 50           push ax
0eb1 e8c8f3       call 0x27c
0eb4 83c40a       add sp, 0xa
0eb7 33f6         xor si, si
0eb9 eb0b         jmp 0xec6
0ebb 8bc6         mov ax, si
0ebd 48           dec ax
0ebe 8bf0         mov si, ax
0ec0 8bc6         mov ax, si
0ec2 40           inc ax
0ec3 8bf0         mov si, ax
0ec5 46           inc si
0ec6 33c0         xor ax, ax
0ec8 0bc0         or ax, ax
0eca 7cef         jl 0xebb
0ecc 7f06         jg 0xed4
0ece 81fe409c     cmp si, 0x9c40
0ed2 76e7         jbe 0xebb
0ed4 b007         mov al, 7
0ed6 50           push ax
0ed7 b060         mov al, 0x60
0ed9 50           push ax
0eda b82200       mov ax, 0x22
0edd 50           push ax
0ede b83000       mov ax, 0x30
0ee1 50           push ax
0ee2 b8e400       mov ax, 0xe4
0ee5 50           push ax
0ee6 b81200       mov ax, 0x12
0ee9 50           push ax
0eea e8b6f9       call 0x8a3
0eed 83c40c       add sp, 0xc
0ef0 ff76fe       push word ptr [bp - 2]
0ef3 33c0         xor ax, ax
0ef5 50           push ax
0ef6 b8ea00       mov ax, 0xea
0ef9 50           push ax
0efa b81400       mov ax, 0x14
0efd 50           push ax
0efe b85d05       mov ax, 0x55d
0f01 50           push ax
0f02 e877f3       call 0x27c
0f05 83c40a       add sp, 0xa
0f08 33f6         xor si, si
0f0a eb0b         jmp 0xf17
0f0c 8bc6         mov ax, si
0f0e 48           dec ax
0f0f 8bf0         mov si, ax
0f11 8bc6         mov ax, si
0f13 40           inc ax
0f14 8bf0         mov si, ax
0f16 46           inc si
0f17 33c0         xor ax, ax
0f19 0bc0         or ax, ax
0f1b 7cef         jl 0xf0c
0f1d 7f06         jg 0xf25
0f1f 81fe409c     cmp si, 0x9c40
0f23 76e7         jbe 0xf0c
0f25 47           inc di
0f26 83ff0a       cmp di, 0xa
0f29 7703         ja 0xf2e
0f2b e954ff       jmp 0xe82
0f2e 33ff         xor di, di
0f30 e9a400       jmp 0xfd7
0f33 b007         mov al, 7
0f35 50           push ax
0f36 b050         mov al, 0x50
0f38 50           push ax
0f39 b82200       mov ax, 0x22
0f3c 50           push ax
0f3d b83000       mov ax, 0x30
0f40 50           push ax
0f41 b80701       mov ax, 0x107
0f44 50           push ax
0f45 b81200       mov ax, 0x12
0f48 50           push ax
0f49 e857f9       call 0x8a3
0f4c 83c40c       add sp, 0xc
0f4f ff76fe       push word ptr [bp - 2]
0f52 b80200       mov ax, 2
0f55 50           push ax
0f56 b80d01       mov ax, 0x10d
0f59 50           push ax
0f5a b81400       mov ax, 0x14
0f5d 50           push ax
0f5e b80409       mov ax, 0x904
0f61 50           push ax
0f62 e817f3       call 0x27c
0f65 83c40a       add sp, 0xa
0f68 33f6         xor si, si
0f6a eb0b         jmp 0xf77
0f6c 8bc6         mov ax, si
0f6e 48           dec ax
0f6f 8bf0         mov si, ax
0f71 8bc6         mov ax, si
0f73 40           inc ax
0f74 8bf0         mov si, ax
0f76 46           inc si
0f77 33c0         xor ax, ax
0f79 0bc0         or ax, ax
0f7b 7cef         jl 0xf6c
0f7d 7f06         jg 0xf85
0f7f 81fe409c     cmp si, 0x9c40
0f83 76e7         jbe 0xf6c
0f85 b007         mov al, 7
0f87 50           push ax
0f88 b060         mov al, 0x60
0f8a 50           push ax
0f8b b82200       mov ax, 0x22
0f8e 50           push ax
0f8f b83000       mov ax, 0x30
0f92 50           push ax
0f93 b80701       mov ax, 0x107
0f96 50           push ax
0f97 b81200       mov ax, 0x12
0f9a 50           push ax
0f9b e805f9       call 0x8a3
0f9e 83c40c       add sp, 0xc
0fa1 ff76fe       push word ptr [bp - 2]
0fa4 33c0         xor ax, ax
0fa6 50           push ax
0fa7 b80d01       mov ax, 0x10d
0faa 50           push ax
0fab b81400       mov ax, 0x14
0fae 50           push ax
0faf b80409       mov ax, 0x904
0fb2 50           push ax
0fb3 e8c6f2       call 0x27c
0fb6 83c40a       add sp, 0xa
0fb9 33f6         xor si, si
0fbb eb0b         jmp 0xfc8
0fbd 8bc6         mov ax, si
0fbf 48           dec ax
0fc0 8bf0         mov si, ax
0fc2 8bc6         mov ax, si
0fc4 40           inc ax
0fc5 8bf0         mov si, ax
0fc7 46           inc si
0fc8 33c0         xor ax, ax
0fca 0bc0         or ax, ax
0fcc 7cef         jl 0xfbd
0fce 7f06         jg 0xfd6
0fd0 81fe409c     cmp si, 0x9c40
0fd4 76e7         jbe 0xfbd
0fd6 47           inc di
0fd7 83ff0a       cmp di, 0xa
0fda 7703         ja 0xfdf
0fdc e954ff       jmp 0xf33
0fdf ff76fe       push word ptr [bp - 2]
0fe2 e8f2f4       call 0x4d7
0fe5 59           pop cx
0fe6 5f           pop di
0fe7 5e           pop si
0fe8 8be5         mov sp, bp
0fea 5d           pop bp
0feb c3           ret 
0fec 55           push bp
0fed 8bec         mov bp, sp
0fef 833ea80020   cmp word ptr [0xa8], 0x20
0ff4 7505         jne 0xffb
0ff6 b80100       mov ax, 1
0ff9 eb13         jmp 0x100e
0ffb 8b1ea800     mov bx, word ptr [0xa8]
0fff d1e3         shl bx, 1
1001 8b4604       mov ax, word ptr [bp + 4]
1004 89878202     mov word ptr [bx + 0x282], ax
1008 ff06a800     inc word ptr [0xa8]
100c 33c0         xor ax, ax
100e 5d           pop bp
100f c3           ret 
1010 c3           ret 
1011 55           push bp
1012 8bec         mov bp, sp
1014 eb0a         jmp 0x1020
1016 8b1ea800     mov bx, word ptr [0xa8]
101a d1e3         shl bx, 1
101c ff978202     call word ptr [bx + 0x282]
1020 a1a800       mov ax, word ptr [0xa8]
1023 ff0ea800     dec word ptr [0xa8]
1027 0bc0         or ax, ax
1029 75eb         jne 0x1016
102b ff7604       push word ptr [bp + 4]
102e e8def0       call 0x10f
1031 59           pop cx
1032 5d           pop bp
1033 c3           ret 
1034 55           push bp
1035 8bec         mov bp, sp
1037 56           push si
1038 57           push di
1039 8b7604       mov si, word ptr [bp + 4]
103c 0bf6         or si, si
103e 7505         jne 0x1045
1040 e87300       call 0x10b6
1043 eb6b         jmp 0x10b0
1045 39740e       cmp word ptr [si + 0xe], si
1048 7405         je 0x104f
104a b8ffff       mov ax, 0xffff
104d eb63         jmp 0x10b2
104f 833c00       cmp word ptr [si], 0
1052 7c29         jl 0x107d
1054 f744020800   test word ptr [si + 2], 8
1059 750a         jne 0x1065
105b 8bc6         mov ax, si
105d 050500       add ax, 5
1060 39440a       cmp word ptr [si + 0xa], ax
1063 7516         jne 0x107b
1065 c7040000     mov word ptr [si], 0
1069 8bc6         mov ax, si
106b 050500       add ax, 5
106e 39440a       cmp word ptr [si + 0xa], ax
1071 7508         jne 0x107b
1073 8b4408       mov ax, word ptr [si + 8]
1076 89440a       mov word ptr [si + 0xa], ax
1079 eb35         jmp 0x10b0
107b eb33         jmp 0x10b0
107d 8b4406       mov ax, word ptr [si + 6]
1080 0304         add ax, word ptr [si]
1082 40           inc ax
1083 8bf8         mov di, ax
1085 8b04         mov ax, word ptr [si]
1087 2bc7         sub ax, di
1089 8904         mov word ptr [si], ax
108b 57           push di
108c 8b4408       mov ax, word ptr [si + 8]
108f 89440a       mov word ptr [si + 0xa], ax
1092 50           push ax
1093 8a4404       mov al, byte ptr [si + 4]
1096 98           cwde 
1097 50           push ax
1098 e8a302       call 0x133e
109b 83c406       add sp, 6
109e 3bc7         cmp ax, di
10a0 740e         je 0x10b0
10a2 f744020002   test word ptr [si + 2], 0x200
10a7 7507         jne 0x10b0
10a9 814c021000   or word ptr [si + 2], 0x10
10ae eb9a         jmp 0x104a
10b0 33c0         xor ax, ax
10b2 5f           pop di
10b3 5e           pop si
10b4 5d           pop bp
10b5 c3           ret 
10b6 55           push bp
10b7 8bec         mov bp, sp
10b9 4c           dec sp
10ba 4c           dec sp
10bb 56           push si
10bc 57           push di
10bd c746fe0000   mov word ptr [bp - 2], 0
10c2 bf1400       mov di, 0x14
10c5 beb000       mov si, 0xb0
10c8 eb12         jmp 0x10dc
10ca f744020300   test word ptr [si + 2], 3
10cf 7408         je 0x10d9
10d1 56           push si
10d2 e85fff       call 0x1034
10d5 59           pop cx
10d6 ff46fe       inc word ptr [bp - 2]
10d9 83c610       add si, 0x10
10dc 8bc7         mov ax, di
10de 4f           dec di
10df 0bc0         or ax, ax
10e1 75e7         jne 0x10ca
10e3 8b46fe       mov ax, word ptr [bp - 2]
10e6 5f           pop di
10e7 5e           pop si
10e8 8be5         mov sp, bp
10ea 5d           pop bp
10eb c3           ret 
10ec 55           push bp
10ed 8bec         mov bp, sp
10ef 56           push si
10f0 57           push di
10f1 8b5e04       mov bx, word ptr [bp + 4]
10f4 833f00       cmp word ptr [bx], 0
10f7 7d08         jge 0x1101
10f9 8b4706       mov ax, word ptr [bx + 6]
10fc 0307         add ax, word ptr [bx]
10fe 40           inc ax
10ff eb0a         jmp 0x110b
1101 8b5e04       mov bx, word ptr [bp + 4]
1104 8b07         mov ax, word ptr [bx]
1106 99           cdq 
1107 33c2         xor ax, dx
1109 2bc2         sub ax, dx
110b 8bf0         mov si, ax
110d 8bc8         mov cx, ax
110f 8b5e04       mov bx, word ptr [bp + 4]
1112 f747024000   test word ptr [bx + 2], 0x40
1117 7402         je 0x111b
1119 eb2f         jmp 0x114a
111b 8b5e04       mov bx, word ptr [bp + 4]
111e 8b7f0a       mov di, word ptr [bx + 0xa]
1121 833f00       cmp word ptr [bx], 0
1124 7d1d         jge 0x1143
1126 eb09         jmp 0x1131
1128 4f           dec di
1129 8bdf         mov bx, di
112b 803f0a       cmp byte ptr [bx], 0xa
112e 7501         jne 0x1131
1130 41           inc cx
1131 8bc6         mov ax, si
1133 4e           dec si
1134 0bc0         or ax, ax
1136 75f0         jne 0x1128
1138 eb10         jmp 0x114a
113a 8bdf         mov bx, di
113c 47           inc di
113d 803f0a       cmp byte ptr [bx], 0xa
1140 7501         jne 0x1143
1142 41           inc cx
1143 8bc6         mov ax, si
1145 4e           dec si
1146 0bc0         or ax, ax
1148 75f0         jne 0x113a
114a 8bc1         mov ax, cx
114c 5f           pop di
114d 5e           pop si
114e 5d           pop bp
114f c20200       ret 2
1152 55           push bp
1153 8bec         mov bp, sp
1155 56           push si
1156 8b7604       mov si, word ptr [bp + 4]
1159 56           push si
115a e8d7fe       call 0x1034
115d 59           pop cx
115e 0bc0         or ax, ax
1160 7405         je 0x1167
1162 b8ffff       mov ax, 0xffff
1165 eb4a         jmp 0x11b1
1167 837e0a01     cmp word ptr [bp + 0xa], 1
116b 7510         jne 0x117d
116d 833c00       cmp word ptr [si], 0
1170 7e0b         jle 0x117d
1172 56           push si
1173 e876ff       call 0x10ec
1176 99           cdq 
1177 294606       sub word ptr [bp + 6], ax
117a 195608       sbb word ptr [bp + 8], dx
117d 8164025ffe   and word ptr [si + 2], 0xfe5f
1182 c7040000     mov word ptr [si], 0
1186 8b4408       mov ax, word ptr [si + 8]
1189 89440a       mov word ptr [si + 0xa], ax
118c ff760a       push word ptr [bp + 0xa]
118f ff7608       push word ptr [bp + 8]
1192 ff7606       push word ptr [bp + 6]
1195 8a4404       mov al, byte ptr [si + 4]
1198 98           cwde 
1199 50           push ax
119a e86e03       call 0x150b
119d 83c408       add sp, 8
11a0 83faff       cmp dx, -1
11a3 750a         jne 0x11af
11a5 3dffff       cmp ax, 0xffff
11a8 7505         jne 0x11af
11aa b8ffff       mov ax, 0xffff
11ad eb02         jmp 0x11b1
11af 33c0         xor ax, ax
11b1 5e           pop si
11b2 5d           pop bp
11b3 c3           ret 
11b4 55           push bp
11b5 8bec         mov bp, sp
11b7 83ec04       sub sp, 4
11ba 56           push si
11bb 8b7604       mov si, word ptr [bp + 4]
11be 8a4404       mov al, byte ptr [si + 4]
11c1 98           cwde 
11c2 50           push ax
11c3 e86001       call 0x1326
11c6 59           pop cx
11c7 8946fc       mov word ptr [bp - 4], ax
11ca 8956fe       mov word ptr [bp - 2], dx
11cd 833c00       cmp word ptr [si], 0
11d0 7d0d         jge 0x11df
11d2 56           push si
11d3 e816ff       call 0x10ec
11d6 99           cdq 
11d7 0146fc       add word ptr [bp - 4], ax
11da 1156fe       adc word ptr [bp - 2], dx
11dd eb0b         jmp 0x11ea
11df 56           push si
11e0 e809ff       call 0x10ec
11e3 99           cdq 
11e4 2946fc       sub word ptr [bp - 4], ax
11e7 1956fe       sbb word ptr [bp - 2], dx
11ea 8b56fe       mov dx, word ptr [bp - 2]
11ed 8b46fc       mov ax, word ptr [bp - 4]
11f0 5e           pop si
11f1 8be5         mov sp, bp
11f3 5d           pop bp
11f4 c3           ret 
11f5 a0b400       mov al, byte ptr [0xb4]
11f8 98           cwde 
11f9 50           push ax
11fa e8fd02       call 0x14fa
11fd 59           pop cx
11fe 0bc0         or ax, ax
1200 7506         jne 0x1208
1202 8126b200fffd and word ptr [0xb2], 0xfdff
1208 b80002       mov ax, 0x200
120b 50           push ax
120c 8506b200     test word ptr [0xb2], ax
1210 7405         je 0x1217
1212 b80100       mov ax, 1
1215 eb02         jmp 0x1219
1217 33c0         xor ax, ax
1219 50           push ax
121a 33c0         xor ax, ax
121c 50           push ax
121d b8b000       mov ax, 0xb0
1220 50           push ax
1221 e83600       call 0x125a
1224 83c408       add sp, 8
1227 a0c400       mov al, byte ptr [0xc4]
122a 98           cwde 
122b 50           push ax
122c e8cb02       call 0x14fa
122f 59           pop cx
1230 0bc0         or ax, ax
1232 7506         jne 0x123a
1234 8126c200fffd and word ptr [0xc2], 0xfdff
123a b80002       mov ax, 0x200
123d 50           push ax
123e 8506c200     test word ptr [0xc2], ax
1242 7405         je 0x1249
1244 b80200       mov ax, 2
1247 eb02         jmp 0x124b
1249 33c0         xor ax, ax
124b 50           push ax
124c 33c0         xor ax, ax
124e 50           push ax
124f b8c000       mov ax, 0xc0
1252 50           push ax
1253 e80400       call 0x125a
1256 83c408       add sp, 8
1259 c3           ret 
125a 55           push bp
125b 8bec         mov bp, sp
125d 56           push si
125e 57           push di
125f 8b7604       mov si, word ptr [bp + 4]
1262 8b7e0a       mov di, word ptr [bp + 0xa]
1265 39740e       cmp word ptr [si + 0xe], si
1268 750c         jne 0x1276
126a 837e0802     cmp word ptr [bp + 8], 2
126e 7f06         jg 0x1276
1270 81ffff7f     cmp di, 0x7fff
1274 7606         jbe 0x127c
1276 b8ffff       mov ax, 0xffff
1279 e9a600       jmp 0x1322
127c 833e1c0200   cmp word ptr [0x21c], 0
1281 750e         jne 0x1291
1283 81fec000     cmp si, 0xc0
1287 7508         jne 0x1291
1289 c7061c020100 mov word ptr [0x21c], 1
128f eb13         jmp 0x12a4
1291 833e1a0200   cmp word ptr [0x21a], 0
1296 750c         jne 0x12a4
1298 81feb000     cmp si, 0xb0
129c 7506         jne 0x12a4
129e c7061a020100 mov word ptr [0x21a], 1
12a4 833c00       cmp word ptr [si], 0
12a7 7411         je 0x12ba
12a9 b80100       mov ax, 1
12ac 50           push ax
12ad 33c0         xor ax, ax
12af 33d2         xor dx, dx
12b1 50           push ax
12b2 52           push dx
12b3 56           push si
12b4 e89bfe       call 0x1152
12b7 83c408       add sp, 8
12ba f744020400   test word ptr [si + 2], 4
12bf 7407         je 0x12c8
12c1 ff7408       push word ptr [si + 8]
12c4 e8b902       call 0x1580
12c7 59           pop cx
12c8 816402f3ff   and word ptr [si + 2], 0xfff3
12cd c744060000   mov word ptr [si + 6], 0
12d2 8bc6         mov ax, si
12d4 050500       add ax, 5
12d7 894408       mov word ptr [si + 8], ax
12da 89440a       mov word ptr [si + 0xa], ax
12dd 837e0802     cmp word ptr [bp + 8], 2
12e1 743d         je 0x1320
12e3 0bff         or di, di
12e5 7639         jbe 0x1320
12e7 c706aa002d14 mov word ptr [0xaa], 0x142d
12ed 837e0600     cmp word ptr [bp + 6], 0
12f1 7516         jne 0x1309
12f3 57           push di
12f4 e85803       call 0x164f
12f7 59           pop cx
12f8 894606       mov word ptr [bp + 6], ax
12fb 0bc0         or ax, ax
12fd 7407         je 0x1306
12ff 814c020400   or word ptr [si + 2], 4
1304 eb03         jmp 0x1309
1306 e96dff       jmp 0x1276
1309 8b4606       mov ax, word ptr [bp + 6]
130c 89440a       mov word ptr [si + 0xa], ax
130f 894408       mov word ptr [si + 8], ax
1312 897c06       mov word ptr [si + 6], di
1315 837e0801     cmp word ptr [bp + 8], 1
1319 7505         jne 0x1320
131b 814c020800   or word ptr [si + 2], 8
1320 33c0         xor ax, ax
1322 5f           pop di
1323 5e           pop si
1324 5d           pop bp
1325 c3           ret 
1326 55           push bp
1327 8bec         mov bp, sp
1329 b80100       mov ax, 1
132c 50           push ax
132d 33c0         xor ax, ax
132f 33d2         xor dx, dx
1331 50           push ax
1332 52           push dx
1333 ff7604       push word ptr [bp + 4]
1336 e8d201       call 0x150b
1339 83c408       add sp, 8
133c 5d           pop bp
133d c3           ret 
133e 55           push bp
133f 8bec         mov bp, sp
1341 81ec8a00     sub sp, 0x8a
1345 56           push si
1346 57           push di
1347 8b4608       mov ax, word ptr [bp + 8]
134a 40           inc ax
134b 3d0200       cmp ax, 2
134e 7305         jae 0x1355
1350 33c0         xor ax, ax
1352 e9d200       jmp 0x1427
1355 8b5e04       mov bx, word ptr [bp + 4]
1358 d1e3         shl bx, 1
135a f787f0010080 test word ptr [bx + 0x1f0], 0x8000
1360 7412         je 0x1374
1362 ff7608       push word ptr [bp + 8]
1365 ff7606       push word ptr [bp + 6]
1368 ff7604       push word ptr [bp + 4]
136b e8c601       call 0x1534
136e 83c406       add sp, 6
1371 e9b300       jmp 0x1427
1374 8b5e04       mov bx, word ptr [bp + 4]
1377 d1e3         shl bx, 1
1379 81a7f001fffd and word ptr [bx + 0x1f0], 0xfdff
137f 8b4606       mov ax, word ptr [bp + 6]
1382 8946f8       mov word ptr [bp - 8], ax
1385 8b4608       mov ax, word ptr [bp + 8]
1388 8946fc       mov word ptr [bp - 4], ax
138b eb55         jmp 0x13e2
138d ff4efc       dec word ptr [bp - 4]
1390 8b5ef8       mov bx, word ptr [bp - 8]
1393 ff46f8       inc word ptr [bp - 8]
1396 8a07         mov al, byte ptr [bx]
1398 8846fb       mov byte ptr [bp - 5], al
139b 3c0a         cmp al, 0xa
139d 7504         jne 0x13a3
139f c6040d       mov byte ptr [si], 0xd
13a2 46           inc si
13a3 8a46fb       mov al, byte ptr [bp - 5]
13a6 8804         mov byte ptr [si], al
13a8 46           inc si
13a9 8d8676ff     lea ax, [bp - 0x8a]
13ad 8bd6         mov dx, si
13af 2bd0         sub dx, ax
13b1 81fa8000     cmp dx, 0x80
13b5 7c31         jl 0x13e8
13b7 8bd6         mov dx, si
13b9 2bd0         sub dx, ax
13bb 8bfa         mov di, dx
13bd 52           push dx
13be 50           push ax
13bf ff7604       push word ptr [bp + 4]
13c2 e86f01       call 0x1534
13c5 83c406       add sp, 6
13c8 8946fe       mov word ptr [bp - 2], ax
13cb 3bc7         cmp ax, di
13cd 7413         je 0x13e2
13cf 0bc0         or ax, ax
13d1 7305         jae 0x13d8
13d3 b8ffff       mov ax, 0xffff
13d6 eb4a         jmp 0x1422
13d8 8b4608       mov ax, word ptr [bp + 8]
13db 2b46fc       sub ax, word ptr [bp - 4]
13de eb3d         jmp 0x141d
13e0 eb40         jmp 0x1422
13e2 8d8676ff     lea ax, [bp - 0x8a]
13e6 8bf0         mov si, ax
13e8 837efc00     cmp word ptr [bp - 4], 0
13ec 759f         jne 0x138d
13ee 8d8676ff     lea ax, [bp - 0x8a]
13f2 8bd6         mov dx, si
13f4 2bd0         sub dx, ax
13f6 8bfa         mov di, dx
13f8 8bc2         mov ax, dx
13fa 0bc0         or ax, ax
13fc 7626         jbe 0x1424
13fe 52           push dx
13ff 8d8676ff     lea ax, [bp - 0x8a]
1403 50           push ax
1404 ff7604       push word ptr [bp + 4]
1407 e82a01       call 0x1534
140a 83c406       add sp, 6
140d 8946fe       mov word ptr [bp - 2], ax
1410 3bc7         cmp ax, di
1412 7410         je 0x1424
1414 0bc0         or ax, ax
1416 7302         jae 0x141a
1418 ebb9         jmp 0x13d3
141a 8b4608       mov ax, word ptr [bp + 8]
141d 0346fe       add ax, word ptr [bp - 2]
1420 2bc7         sub ax, di
1422 eb03         jmp 0x1427
1424 8b4608       mov ax, word ptr [bp + 8]
1427 5f           pop di
1428 5e           pop si
1429 8be5         mov sp, bp
142b 5d           pop bp
142c c3           ret 
142d 56           push si
142e 57           push di
142f bf0400       mov di, 4
1432 beb000       mov si, 0xb0
1435 eb10         jmp 0x1447
1437 f744020300   test word ptr [si + 2], 3
143c 7405         je 0x1443
143e 56           push si
143f e8f2fb       call 0x1034
1442 59           pop cx
1443 4f           dec di
1444 83c610       add si, 0x10
1447 0bff         or di, di
1449 75ec         jne 0x1437
144b 5f           pop di
144c 5e           pop si
144d c3           ret 
144e 55           push bp
144f 8bec         mov bp, sp
1451 8b4604       mov ax, word ptr [bp + 4]
1454 8bd4         mov dx, sp
1456 81ea0002     sub dx, 0x200
145a 3bc2         cmp ax, dx
145c 7307         jae 0x1465
145e a39a00       mov word ptr [0x9a], ax
1461 33c0         xor ax, ax
1463 eb09         jmp 0x146e
1465 c70692000800 mov word ptr [0x92], 8
146b b8ffff       mov ax, 0xffff
146e 5d           pop bp
146f c3           ret 
1470 55           push bp
1471 8bec         mov bp, sp
1473 8b4604       mov ax, word ptr [bp + 4]
1476 8b5606       mov dx, word ptr [bp + 6]
1479 03069a00     add ax, word ptr [0x9a]
147d 83d200       adc dx, 0
1480 8bc8         mov cx, ax
1482 0bd2         or dx, dx
1484 7510         jne 0x1496
1486 81c10002     add cx, 0x200
148a 720a         jb 0x1496
148c 3bcc         cmp cx, sp
148e 7306         jae 0x1496
1490 87069a00     xchg word ptr [0x9a], ax
1494 eb09         jmp 0x149f
1496 c70692000800 mov word ptr [0x92], 8
149c b8ffff       mov ax, 0xffff
149f 5d           pop bp
14a0 c3           ret 
14a1 55           push bp
14a2 8bec         mov bp, sp
14a4 ff7604       push word ptr [bp + 4]
14a7 e8a4ff       call 0x144e
14aa 59           pop cx
14ab 5d           pop bp
14ac c3           ret 
14ad 55           push bp
14ae 8bec         mov bp, sp
14b0 8b4604       mov ax, word ptr [bp + 4]
14b3 99           cdq 
14b4 52           push dx
14b5 50           push ax
14b6 e8b7ff       call 0x1470
14b9 59           pop cx
14ba 59           pop cx
14bb 5d           pop bp
14bc c3           ret 
14bd 55           push bp
14be 8bec         mov bp, sp
14c0 56           push si
14c1 8b7604       mov si, word ptr [bp + 4]
14c4 0bf6         or si, si
14c6 7c15         jl 0x14dd
14c8 83fe58       cmp si, 0x58
14cb 7e03         jle 0x14d0
14cd be5700       mov si, 0x57
14d0 89362002     mov word ptr [0x220], si
14d4 8a842202     mov al, byte ptr [si + 0x222]
14d8 98           cwde 
14d9 8bf0         mov si, ax
14db eb11         jmp 0x14ee
14dd 8bc6         mov ax, si
14df f7d8         neg ax
14e1 8bf0         mov si, ax
14e3 3d2300       cmp ax, 0x23
14e6 7fe5         jg 0x14cd
14e8 c7062002ffff mov word ptr [0x220], 0xffff
14ee 89369200     mov word ptr [0x92], si
14f2 b8ffff       mov ax, 0xffff
14f5 5e           pop si
14f6 5d           pop bp
14f7 c20200       ret 2
14fa 55           push bp
14fb 8bec         mov bp, sp
14fd b80044       mov ax, 0x4400
1500 8b5e04       mov bx, word ptr [bp + 4]
1503 cd21         int 0x21
1505 92           xchg dx, ax
1506 258000       and ax, 0x80
1509 5d           pop bp
150a c3           ret 
150b 55           push bp
150c 8bec         mov bp, sp
150e 8b5e04       mov bx, word ptr [bp + 4]
1511 d1e3         shl bx, 1
1513 81a7f001fffd and word ptr [bx + 0x1f0], 0xfdff
1519 b442         mov ah, 0x42
151b 8a460a       mov al, byte ptr [bp + 0xa]
151e 8b5e04       mov bx, word ptr [bp + 4]
1521 8b4e08       mov cx, word ptr [bp + 8]
1524 8b5606       mov dx, word ptr [bp + 6]
1527 cd21         int 0x21
1529 7202         jb 0x152d
152b eb05         jmp 0x1532
152d 50           push ax
152e e88cff       call 0x14bd
1531 99           cdq 
1532 5d           pop bp
1533 c3           ret 
1534 55           push bp
1535 8bec         mov bp, sp
1537 8b5e04       mov bx, word ptr [bp + 4]
153a d1e3         shl bx, 1
153c f787f0010008 test word ptr [bx + 0x1f0], 0x800
1542 7413         je 0x1557
1544 b80200       mov ax, 2
1547 50           push ax
1548 33c0         xor ax, ax
154a 33d2         xor dx, dx
154c 50           push ax
154d 52           push dx
154e ff7604       push word ptr [bp + 4]
1551 e8b7ff       call 0x150b
1554 83c408       add sp, 8
1557 b440         mov ah, 0x40
1559 8b5e04       mov bx, word ptr [bp + 4]
155c 8b4e08       mov cx, word ptr [bp + 8]
155f 8b5606       mov dx, word ptr [bp + 6]
1562 cd21         int 0x21
1564 720f         jb 0x1575
1566 50           push ax
1567 8b5e04       mov bx, word ptr [bp + 4]
156a d1e3         shl bx, 1
156c 818ff0010010 or word ptr [bx + 0x1f0], 0x1000
1572 58           pop ax
1573 eb04         jmp 0x1579
1575 50           push ax
1576 e844ff       call 0x14bd
1579 5d           pop bp
157a c3           ret 
157b 0000         add byte ptr [bx + si], al
157d 0000         add byte ptr [bx + si], al
157f 005657       add byte ptr [bp + 0x57], dl
1582 8bf4         mov si, sp
1584 8b5c06       mov bx, word ptr [si + 6]
1587 83eb04       sub bx, 4
158a 720e         jb 0x159a
158c 3b1e7e02     cmp bx, word ptr [0x27e]
1590 7405         je 0x1597
1592 e84200       call 0x15d7
1595 eb03         jmp 0x159a
1597 e80300       call 0x159d
159a 5f           pop di
159b 5e           pop si
159c c3           ret 
159d 391e7c02     cmp word ptr [0x27c], bx
15a1 7423         je 0x15c6
15a3 8b7702       mov si, word ptr [bx + 2]
15a6 f60401       test byte ptr [si], 1
15a9 7406         je 0x15b1
15ab 89367e02     mov word ptr [0x27e], si
15af eb20         jmp 0x15d1
15b1 3b367c02     cmp si, word ptr [0x27c]
15b5 740d         je 0x15c4
15b7 8bde         mov bx, si
15b9 e85400       call 0x1610
15bc 8b4702       mov ax, word ptr [bx + 2]
15bf a37e02       mov word ptr [0x27e], ax
15c2 eb0d         jmp 0x15d1
15c4 8bde         mov bx, si
15c6 33c0         xor ax, ax
15c8 a37c02       mov word ptr [0x27c], ax
15cb a37e02       mov word ptr [0x27e], ax
15ce a38002       mov word ptr [0x280], ax
15d1 53           push bx
15d2 e879fe       call 0x144e
15d5 5b           pop bx
15d6 c3           ret 
15d7 ff0f         dec word ptr [bx]
15d9 3b1e7c02     cmp bx, word ptr [0x27c]
15dd 7418         je 0x15f7
15df 8b7702       mov si, word ptr [bx + 2]
15e2 8b04         mov ax, word ptr [si]
15e4 a801         test al, 1
15e6 750f         jne 0x15f7
15e8 0307         add ax, word ptr [bx]
15ea 8904         mov word ptr [si], ax
15ec 8b3f         mov di, word ptr [bx]
15ee 03fb         add di, bx
15f0 897502       mov word ptr [di + 2], si
15f3 8bde         mov bx, si
15f5 eb03         jmp 0x15fa
15f7 e83200       call 0x162c
15fa 8b3f         mov di, word ptr [bx]
15fc 03fb         add di, bx
15fe 8b05         mov ax, word ptr [di]
1600 a801         test al, 1
1602 7401         je 0x1605
1604 c3           ret 
1605 0107         add word ptr [bx], ax
1607 8bf7         mov si, di
1609 03f0         add si, ax
160b 895c02       mov word ptr [si + 2], bx
160e 8bdf         mov bx, di
1610 8b7f06       mov di, word ptr [bx + 6]
1613 3bdf         cmp bx, di
1615 740e         je 0x1625
1617 893e8002     mov word ptr [0x280], di
161b 8b7704       mov si, word ptr [bx + 4]
161e 897504       mov word ptr [di + 4], si
1621 897c06       mov word ptr [si + 6], di
1624 c3           ret 
1625 c70680020000 mov word ptr [0x280], 0
162b c3           ret 
162c 8b368002     mov si, word ptr [0x280]
1630 0bf6         or si, si
1632 7410         je 0x1644
1634 8b7c06       mov di, word ptr [si + 6]
1637 895c06       mov word ptr [si + 6], bx
163a 895d04       mov word ptr [di + 4], bx
163d 897f06       mov word ptr [bx + 6], di
1640 897704       mov word ptr [bx + 4], si
1643 c3           ret 
1644 891e8002     mov word ptr [0x280], bx
1648 895f04       mov word ptr [bx + 4], bx
164b 895f06       mov word ptr [bx + 6], bx
164e c3           ret 
164f 56           push si
1650 57           push di
1651 8bf4         mov si, sp
1653 8b4406       mov ax, word ptr [si + 6]
1656 0bc0         or ax, ax
1658 7452         je 0x16ac
165a 050500       add ax, 5
165d 7236         jb 0x1695
165f 25feff       and ax, 0xfffe
1662 3d0800       cmp ax, 8
1665 7303         jae 0x166a
1667 b80800       mov ax, 8
166a 833e7c0200   cmp word ptr [0x27c], 0
166f 741f         je 0x1690
1671 8b1e8002     mov bx, word ptr [0x280]
1675 0bdb         or bx, bx
1677 740d         je 0x1686
1679 8bd3         mov dx, bx
167b 3907         cmp word ptr [bx], ax
167d 731a         jae 0x1699
167f 8b5f06       mov bx, word ptr [bx + 6]
1682 3bda         cmp bx, dx
1684 75f5         jne 0x167b
1686 e86600       call 0x16ef
1689 eb21         jmp 0x16ac
168b e88a00       call 0x1718
168e eb1c         jmp 0x16ac
1690 e81c00       call 0x16af
1693 eb17         jmp 0x16ac
1695 33c0         xor ax, ax
1697 eb13         jmp 0x16ac
1699 8bf0         mov si, ax
169b 83c608       add si, 8
169e 3937         cmp word ptr [bx], si
16a0 73e9         jae 0x168b
16a2 e86bff       call 0x1610
16a5 ff07         inc word ptr [bx]
16a7 8bc3         mov ax, bx
16a9 050400       add ax, 4
16ac 5f           pop di
16ad 5e           pop si
16ae c3           ret 
16af 50           push ax
16b0 33c0         xor ax, ax
16b2 50           push ax
16b3 50           push ax
16b4 e8b9fd       call 0x1470
16b7 5b           pop bx
16b8 5b           pop bx
16b9 250100       and ax, 1
16bc 7409         je 0x16c7
16be 33d2         xor dx, dx
16c0 52           push dx
16c1 50           push ax
16c2 e8abfd       call 0x1470
16c5 5b           pop bx
16c6 5b           pop bx
16c7 58           pop ax
16c8 50           push ax
16c9 33db         xor bx, bx
16cb 53           push bx
16cc 50           push ax
16cd e8a0fd       call 0x1470
16d0 5b           pop bx
16d1 5b           pop bx
16d2 3dffff       cmp ax, 0xffff
16d5 7414         je 0x16eb
16d7 8bd8         mov bx, ax
16d9 891e7c02     mov word ptr [0x27c], bx
16dd 891e7e02     mov word ptr [0x27e], bx
16e1 58           pop ax
16e2 40           inc ax
16e3 8907         mov word ptr [bx], ax
16e5 83c304       add bx, 4
16e8 8bc3         mov ax, bx
16ea c3           ret 
16eb 5b           pop bx
16ec 33c0         xor ax, ax
16ee c3           ret 
16ef 50           push ax
16f0 33db         xor bx, bx
16f2 53           push bx
16f3 50           push ax
16f4 e879fd       call 0x1470
16f7 5b           pop bx
16f8 5b           pop bx
16f9 3dffff       cmp ax, 0xffff
16fc 7416         je 0x1714
16fe 8bd8         mov bx, ax
1700 a17e02       mov ax, word ptr [0x27e]
1703 894702       mov word ptr [bx + 2], ax
1706 891e7e02     mov word ptr [0x27e], bx
170a 58           pop ax
170b 40           inc ax
170c 8907         mov word ptr [bx], ax
170e 83c304       add bx, 4
1711 8bc3         mov ax, bx
1713 c3           ret 
1714 58           pop ax
1715 33c0         xor ax, ax
1717 c3           ret 
1718 2907         sub word ptr [bx], ax
171a 8bf3         mov si, bx
171c 0337         add si, word ptr [bx]
171e 8bfe         mov di, si
1720 03f8         add di, ax
1722 40           inc ax
1723 8904         mov word ptr [si], ax
1725 895c02       mov word ptr [si + 2], bx
1728 897502       mov word ptr [di + 2], si
172b 83c604       add si, 4
172e 8bc6         mov ax, si
1730 c3           ret 
1731 8bec         mov bp, sp
1733 53           push bx
1734 50           push ax
1735 51           push cx
1736 50           push ax
1737 e815ff       call 0x164f
173a 5b           pop bx
173b 0bc0         or ax, ax
173d 741f         je 0x175e
173f 1e           push ds
1740 07           pop es
1741 fc           cld 
1742 8bf8         mov di, ax
1744 8b76fe       mov si, word ptr [bp - 2]
1747 8b0c         mov cx, word ptr [si]
1749 83c604       add si, 4
174c 56           push si
174d 83e905       sub cx, 5
1750 d1e9         shr cx, 1
1752 f3a5         rep movsw word ptr es:[di], word ptr [si]
1754 8946fe       mov word ptr [bp - 2], ax
1757 e826fe       call 0x1580
175a 5b           pop bx
175b 8b5efe       mov bx, word ptr [bp - 2]
175e 83c406       add sp, 6
1761 c3           ret 
1762 8bc2         mov ax, dx
1764 83c208       add dx, 8
1767 3bd1         cmp dx, cx
1769 7735         ja 0x17a0
176b 8bd1         mov dx, cx
176d 3b1e7e02     cmp bx, word ptr [0x27e]
1771 750f         jne 0x1782
1773 8907         mov word ptr [bx], ax
1775 ff07         inc word ptr [bx]
1777 03c3         add ax, bx
1779 53           push bx
177a 50           push ax
177b e8d0fc       call 0x144e
177e 5b           pop bx
177f 5b           pop bx
1780 eb1e         jmp 0x17a0
1782 8bfb         mov di, bx
1784 03f8         add di, ax
1786 895d02       mov word ptr [di + 2], bx
1789 2bd0         sub dx, ax
178b 2917         sub word ptr [bx], dx
178d 8bf7         mov si, di
178f 03f2         add si, dx
1791 897c02       mov word ptr [si + 2], di
1794 42           inc dx
1795 8915         mov word ptr [di], dx
1797 8bcb         mov cx, bx
1799 8bdf         mov bx, di
179b e839fe       call 0x15d7
179e 8bd9         mov bx, cx
17a0 83c304       add bx, 4
17a3 c3           ret 
17a4 56           push si
17a5 57           push di
17a6 55           push bp
17a7 8bec         mov bp, sp
17a9 8b5e08       mov bx, word ptr [bp + 8]
17ac 8b460a       mov ax, word ptr [bp + 0xa]
17af 0bc0         or ax, ax
17b1 7437         je 0x17ea
17b3 0bdb         or bx, bx
17b5 742d         je 0x17e4
17b7 83eb04       sub bx, 4
17ba 8b0f         mov cx, word ptr [bx]
17bc 49           dec cx
17bd 8bd0         mov dx, ax
17bf 83c205       add dx, 5
17c2 83e2fe       and dx, 0xfffe
17c5 83fa08       cmp dx, 8
17c8 7303         jae 0x17cd
17ca ba0800       mov dx, 8
17cd 3bca         cmp cx, dx
17cf 720c         jb 0x17dd
17d1 7705         ja 0x17d8
17d3 83c304       add bx, 4
17d6 eb08         jmp 0x17e0
17d8 e887ff       call 0x1762
17db eb03         jmp 0x17e0
17dd e851ff       call 0x1731
17e0 8bc3         mov ax, bx
17e2 eb0b         jmp 0x17ef
17e4 50           push ax
17e5 e867fe       call 0x164f
17e8 eb04         jmp 0x17ee
17ea 53           push bx
17eb e892fd       call 0x1580
17ee 5b           pop bx
17ef 5d           pop bp
17f0 5f           pop di
17f1 5e           pop si
17f2 c3           ret 
17f3 0000         add byte ptr [bx + si], al
17f5 0000         add byte ptr [bx + si], al
17f7 0000         add byte ptr [bx + si], al
17f9 0000         add byte ptr [bx + si], al
17fb 0000         add byte ptr [bx + si], al
17fd 0000         add byte ptr [bx + si], al
17ff 0000         add byte ptr [bx + si], al
1801 02f5         add dh, ch
1803 1100         adc word ptr [bx + si], ax
1805 0000         add byte ptr [bx + si], al
1807 0000         add byte ptr [bx + si], al
1809 0000         add byte ptr [bx + si], al
180b 0000         add byte ptr [bx + si], al
180d 0000         add byte ptr [bx + si], al
180f db 00
