01f6:000e c8120000       enter 0x12, 0
01f6:0012 39269603       cmp word ptr [0x396], sp
01f6:0016 7705           ja 0x1d
01f6:0018 9a621f0000     lcall __OVERFLOW
01f6:001d 16             push ss
01f6:001e 8d46ee         lea ax, [bp - 0x12]
01f6:0021 50             push ax
01f6:0022 9af8149b03     lcall getpalette
01f6:0027 59             pop cx
01f6:0028 59             pop cx
01f6:0029 6a00           push 0
01f6:002b 6a00           push 0
01f6:002d 6a3f           push 0x3f
01f6:002f 8a46fb         mov al, byte ptr [bp - 5]
01f6:0032 98             cwde 
01f6:0033 50             push ax
01f6:0034 9a821e9b03     lcall setrgbpalette
01f6:0039 83c408         add sp, 8
01f6:003c 6a3f           push 0x3f
01f6:003e 6a3f           push 0x3f
01f6:0040 6a3f           push 0x3f
01f6:0042 8a46fe         mov al, byte ptr [bp - 2]
01f6:0045 98             cwde 
01f6:0046 50             push ax
01f6:0047 9a821e9b03     lcall setrgbpalette
01f6:004c 83c408         add sp, 8
01f6:004f 6a2a           push 0x2a
01f6:0051 6a2a           push 0x2a
01f6:0053 6a2a           push 0x2a
01f6:0055 8a46f6         mov al, byte ptr [bp - 0xa]
01f6:0058 98             cwde 
01f6:0059 50             push ax
01f6:005a 9a821e9b03     lcall setrgbpalette
01f6:005f 83c408         add sp, 8
01f6:0062 6a20           push 0x20
01f6:0064 6a20           push 0x20
01f6:0066 6a20           push 0x20
01f6:0068 8a46f7         mov al, byte ptr [bp - 9]
01f6:006b 98             cwde 
01f6:006c 50             push ax
01f6:006d 9a821e9b03     lcall setrgbpalette
01f6:0072 83c408         add sp, 8
01f6:0075 6a30           push 0x30
01f6:0077 6a00           push 0
01f6:0079 6a00           push 0
01f6:007b 8a46f0         mov al, byte ptr [bp - 0x10]
01f6:007e 98             cwde 
01f6:007f 50             push ax
01f6:0080 9a821e9b03     lcall setrgbpalette
01f6:0085 83c408         add sp, 8
01f6:0088 c9             leave 
01f6:0089 cb             retf 
01f6:008a 55             push bp
01f6:008b 8bec           mov bp, sp
01f6:008d 39269603       cmp word ptr [0x396], sp
01f6:0091 7705           ja 0x98
01f6:0093 9a621f0000     lcall __OVERFLOW
01f6:0098 0e             push cs
01f6:0099 e872ff         call 0xe
01f6:009c 6a0f           push 0xf
01f6:009e 6a01           push 1
01f6:00a0 9a30129b03     lcall setfillstyle
01f6:00a5 59             pop cx
01f6:00a6 59             pop cx
01f6:00a7 68df01         push 0x1df
01f6:00aa 687f02         push 0x27f
01f6:00ad 6a00           push 0
01f6:00af 6a00           push 0
01f6:00b1 9a881c9b03     lcall bar
01f6:00b6 83c408         add sp, 8
01f6:00b9 6a01           push 1
01f6:00bb 6a01           push 1
01f6:00bd 9a30129b03     lcall setfillstyle
01f6:00c2 59             pop cx
01f6:00c3 59             pop cx
01f6:00c4 6a19           push 0x19
01f6:00c6 687f02         push 0x27f
01f6:00c9 6a00           push 0
01f6:00cb 6a00           push 0
01f6:00cd 9a881c9b03     lcall bar
01f6:00d2 83c408         add sp, 8
01f6:00d5 6a0f           push 0xf
01f6:00d7 9ab21d9b03     lcall setcolor
01f6:00dc 59             pop cx
01f6:00dd 1e             push ds
01f6:00de 684601         push 0x146  ; 'TEST-EDITOR'
01f6:00e1 6a0a           push 0xa
01f6:00e3 681801         push 0x118
01f6:00e6 9a801f9b03     lcall outtextxy
01f6:00eb 83c408         add sp, 8
01f6:00ee 6a08           push 8
01f6:00f0 9ab21d9b03     lcall setcolor
01f6:00f5 59             pop cx
01f6:00f6 68de01         push 0x1de
01f6:00f9 687e02         push 0x27e
01f6:00fc 6a01           push 1
01f6:00fe 6a01           push 1
01f6:0100 9abd119b03     lcall rectangle
01f6:0105 83c408         add sp, 8
01f6:0108 68dd01         push 0x1dd
01f6:010b 687d02         push 0x27d
01f6:010e 6a02           push 2
01f6:0110 6a02           push 2
01f6:0112 9abd119b03     lcall rectangle
01f6:0117 83c408         add sp, 8
01f6:011a 6a00           push 0
01f6:011c 9ab21d9b03     lcall setcolor
01f6:0121 59             pop cx
01f6:0122 68dc01         push 0x1dc
01f6:0125 687c02         push 0x27c
01f6:0128 6a03           push 3
01f6:012a 6a03           push 3
01f6:012c 9abd119b03     lcall rectangle
01f6:0131 83c408         add sp, 8
01f6:0134 6a03           push 3
01f6:0136 686702         push 0x267
01f6:0139 6a00           push 0
01f6:013b 686702         push 0x267
01f6:013e 9a251c9b03     lcall line
01f6:0143 83c408         add sp, 8
01f6:0146 68df01         push 0x1df
01f6:0149 686702         push 0x267
01f6:014c 68dc01         push 0x1dc
01f6:014f 686702         push 0x267
01f6:0152 9a251c9b03     lcall line
01f6:0157 83c408         add sp, 8
01f6:015a 68df01         push 0x1df
01f6:015d 6a19           push 0x19
01f6:015f 68dc01         push 0x1dc
01f6:0162 6a19           push 0x19
01f6:0164 9a251c9b03     lcall line
01f6:0169 83c408         add sp, 8
01f6:016c 6a19           push 0x19
01f6:016e 687f02         push 0x27f
01f6:0171 6a19           push 0x19
01f6:0173 6a00           push 0
01f6:0175 9a251c9b03     lcall line
01f6:017a 83c408         add sp, 8
01f6:017d 68df01         push 0x1df
01f6:0180 687f02         push 0x27f
01f6:0183 6a00           push 0
01f6:0185 6a00           push 0
01f6:0187 9abd119b03     lcall rectangle
01f6:018c 83c408         add sp, 8
01f6:018f 6a07           push 7
01f6:0191 6a01           push 1
01f6:0193 9a30129b03     lcall setfillstyle
01f6:0198 59             pop cx
01f6:0199 59             pop cx
01f6:019a 6a19           push 0x19
01f6:019c 6a19           push 0x19
01f6:019e 6a04           push 4
01f6:01a0 6a04           push 4
01f6:01a2 9a881c9b03     lcall bar
01f6:01a7 83c408         add sp, 8
01f6:01aa 6a19           push 0x19
01f6:01ac 6a19           push 0x19
01f6:01ae 6a00           push 0
01f6:01b0 6a00           push 0
01f6:01b2 9abd119b03     lcall rectangle
01f6:01b7 83c408         add sp, 8
01f6:01ba 6a0f           push 0xf
01f6:01bc 6a01           push 1
01f6:01be 9a30129b03     lcall setfillstyle
01f6:01c3 59             pop cx
01f6:01c4 59             pop cx
01f6:01c5 6a0f           push 0xf
01f6:01c7 6a11           push 0x11
01f6:01c9 6a0e           push 0xe
01f6:01cb 6a0b           push 0xb
01f6:01cd 9a881c9b03     lcall bar
01f6:01d2 83c408         add sp, 8
01f6:01d5 6a10           push 0x10
01f6:01d7 6a12           push 0x12
01f6:01d9 6a0d           push 0xd
01f6:01db 6a0a           push 0xa
01f6:01dd 9abd119b03     lcall rectangle
01f6:01e2 83c408         add sp, 8
01f6:01e5 6a30           push 0x30
01f6:01e7 687c02         push 0x27c
01f6:01ea 6a30           push 0x30
01f6:01ec 6a04           push 4
01f6:01ee 9a251c9b03     lcall line
01f6:01f3 83c408         add sp, 8
01f6:01f6 1e             push ds
01f6:01f7 685201         push 0x152  ; 'File'
01f6:01fa 6a21           push 0x21
01f6:01fc 6a12           push 0x12
01f6:01fe 9a801f9b03     lcall outtextxy
01f6:0203 83c408         add sp, 8
01f6:0206 6a29           push 0x29
01f6:0208 6a18           push 0x18
01f6:020a 6a29           push 0x29
01f6:020c 6a10           push 0x10
01f6:020e 9a251c9b03     lcall line
01f6:0213 83c408         add sp, 8
01f6:0216 68c601         push 0x1c6
01f6:0219 6a00           push 0
01f6:021b 68df01         push 0x1df
01f6:021e 687f02         push 0x27f
01f6:0221 9abd119b03     lcall rectangle
01f6:0226 83c408         add sp, 8
01f6:0229 68dc01         push 0x1dc
01f6:022c 681c02         push 0x21c
01f6:022f 68c701         push 0x1c7
01f6:0232 681c02         push 0x21c
01f6:0235 9a251c9b03     lcall line
01f6:023a 83c408         add sp, 8
01f6:023d 9a5e007a02     lcall 027a:005e
01f6:0242 5d             pop bp
01f6:0243 cb             retf 
01f6:0244 c8040000       enter 4, 0
01f6:0248 39269603       cmp word ptr [0x396], sp
01f6:024c 7705           ja 0x253
01f6:024e 9a621f0000     lcall __OVERFLOW
01f6:0253 c746fe0000     mov word ptr [bp - 2], 0
01f6:0258 1e             push ds
01f6:0259 685701         push 0x157
01f6:025c 16             push ss
01f6:025d 8d46fc         lea ax, [bp - 4]
01f6:0260 50             push ax
01f6:0261 16             push ss
01f6:0262 8d46fe         lea ax, [bp - 2]
01f6:0265 50             push ax
01f6:0266 9a6a099b03     lcall initgraph
01f6:026b 83c40c         add sp, 0xc
01f6:026e 0e             push cs
01f6:026f e818fe         call 0x8a
01f6:0272 9a0d007a02     lcall 027a:000d
01f6:0277 c9             leave 
01f6:0278 cb             retf 
01f6:0279 c8be0000       enter 0xbe, 0
01f6:027d 56             push si
01f6:027e 57             push di
01f6:027f 39269603       cmp word ptr [0x396], sp
01f6:0283 7705           ja 0x28a
01f6:0285 9a621f0000     lcall __OVERFLOW
01f6:028a 68c800         push 0xc8
01f6:028d 68c800         push 0xc8
01f6:0290 6a00           push 0
01f6:0292 6a00           push 0
01f6:0294 9a17159b03     lcall imagesize
01f6:0299 83c408         add sp, 8
01f6:029c 8946fe         mov word ptr [bp - 2], ax
01f6:029f ff76fe         push word ptr [bp - 2]
01f6:02a2 9a131c0000     lcall malloc
01f6:02a7 59             pop cx
01f6:02a8 8956fc         mov word ptr [bp - 4], dx
01f6:02ab 8946fa         mov word ptr [bp - 6], ax
01f6:02ae ff76fc         push word ptr [bp - 4]
01f6:02b1 ff76fa         push word ptr [bp - 6]
01f6:02b4 68c700         push 0xc7
01f6:02b7 688700         push 0x87
01f6:02ba 6a00           push 0
01f6:02bc 6a00           push 0
01f6:02be 9abc209b03     lcall getimage
01f6:02c3 83c40c         add sp, 0xc
01f6:02c6 6a01           push 1
01f6:02c8 6a01           push 1
01f6:02ca 9a30129b03     lcall setfillstyle
01f6:02cf 59             pop cx
01f6:02d0 59             pop cx
01f6:02d1 6a1a           push 0x1a
01f6:02d3 6a3f           push 0x3f
01f6:02d5 6a2f           push 0x2f  ; 'Divide error'
01f6:02d7 6a04           push 4
01f6:02d9 9a881c9b03     lcall bar
01f6:02de 83c408         add sp, 8
01f6:02e1 6a0f           push 0xf
01f6:02e3 9ab21d9b03     lcall setcolor
01f6:02e8 59             pop cx
01f6:02e9 1e             push ds
01f6:02ea 685801         push 0x158  ; 'File'
01f6:02ed 6a21           push 0x21
01f6:02ef 6a12           push 0x12
01f6:02f1 9a801f9b03     lcall outtextxy
01f6:02f6 83c408         add sp, 8
01f6:02f9 6a0f           push 0xf
01f6:02fb 6a01           push 1
01f6:02fd 9a30129b03     lcall setfillstyle
01f6:0302 59             pop cx
01f6:0303 59             pop cx
01f6:0304 688200         push 0x82
01f6:0307 6a78           push 0x78
01f6:0309 6a30           push 0x30
01f6:030b 6a04           push 4
01f6:030d 9a881c9b03     lcall bar
01f6:0312 83c408         add sp, 8
01f6:0315 6a00           push 0
01f6:0317 9ab21d9b03     lcall setcolor
01f6:031c 59             pop cx
01f6:031d 688200         push 0x82
01f6:0320 6a78           push 0x78
01f6:0322 6a30           push 0x30
01f6:0324 6a04           push 4
01f6:0326 9abd119b03     lcall rectangle
01f6:032b 83c408         add sp, 8
01f6:032e 6a00           push 0
01f6:0330 6a01           push 1
01f6:0332 9a30129b03     lcall setfillstyle
01f6:0337 59             pop cx
01f6:0338 59             pop cx
01f6:0339 8d46ba         lea ax, [bp - 0x46]
01f6:033c 16             push ss
01f6:033d 50             push ax
01f6:033e 1e             push ds
01f6:033f 689200         push 0x92  ; 'Open      F3'
01f6:0342 b93c00         mov cx, 0x3c
01f6:0345 9a131f0000     lcall SCOPY@
01f6:034a 8d8642ff       lea ax, [bp - 0xbe]
01f6:034e 16             push ss
01f6:034f 50             push ax
01f6:0350 1e             push ds
01f6:0351 68ce00         push 0xce  ; 'Open and load a new file'
01f6:0354 b97800         mov cx, 0x78
01f6:0357 9a131f0000     lcall SCOPY@
01f6:035c c746f80000     mov word ptr [bp - 8], 0
01f6:0361 eb28           jmp 0x38b
01f6:0363 8b46f8         mov ax, word ptr [bp - 8]
01f6:0366 ba0f00         mov dx, 0xf
01f6:0369 f7ea           imul dx
01f6:036b 8d56ba         lea dx, [bp - 0x46]
01f6:036e 03d0           add dx, ax
01f6:0370 16             push ss
01f6:0371 52             push dx
01f6:0372 8b46f8         mov ax, word ptr [bp - 8]
01f6:0375 ba1400         mov dx, 0x14
01f6:0378 f7ea           imul dx
01f6:037a 053700         add ax, 0x37
01f6:037d 50             push ax
01f6:037e 6a12           push 0x12
01f6:0380 9a801f9b03     lcall outtextxy
01f6:0385 83c408         add sp, 8
01f6:0388 ff46f8         inc word ptr [bp - 8]
01f6:038b 837ef803       cmp word ptr [bp - 8], 3
01f6:038f 7ed2           jle 0x363
01f6:0391 33f6           xor si, si
01f6:0393 33ff           xor di, di
01f6:0395 6a01           push 1
01f6:0397 6a01           push 1
01f6:0399 9a30129b03     lcall setfillstyle
01f6:039e 59             pop cx
01f6:039f 59             pop cx
01f6:03a0 6a44           push 0x44
01f6:03a2 6a77           push 0x77
01f6:03a4 6a31           push 0x31
01f6:03a6 6a05           push 5
01f6:03a8 9a881c9b03     lcall bar
01f6:03ad 83c408         add sp, 8
01f6:03b0 6a0f           push 0xf
01f6:03b2 9ab21d9b03     lcall setcolor
01f6:03b7 59             pop cx
01f6:03b8 16             push ss
01f6:03b9 8d46ba         lea ax, [bp - 0x46]
01f6:03bc 50             push ax
01f6:03bd 6a37           push 0x37
01f6:03bf 6a12           push 0x12
01f6:03c1 9a801f9b03     lcall outtextxy
01f6:03c6 83c408         add sp, 8
01f6:03c9 6a00           push 0
01f6:03cb 9ab21d9b03     lcall setcolor
01f6:03d0 59             pop cx
01f6:03d1 16             push ss
01f6:03d2 8d8642ff       lea ax, [bp - 0xbe]
01f6:03d6 50             push ax
01f6:03d7 68ce01         push 0x1ce
01f6:03da 6a14           push 0x14
01f6:03dc 9a801f9b03     lcall outtextxy
01f6:03e1 83c408         add sp, 8
01f6:03e4 e94802         jmp 0x62f
01f6:03e7 8b4606         mov ax, word ptr [bp + 6]
01f6:03ea 8946f6         mov word ptr [bp - 0xa], ax
01f6:03ed b90600         mov cx, 6
01f6:03f0 bbac06         mov bx, 0x6ac
01f6:03f3 2e8b07         mov ax, word ptr cs:[bx]
01f6:03f6 3b46f6         cmp ax, word ptr [bp - 0xa]
01f6:03f9 7407           je 0x402
01f6:03fb 43             inc bx
01f6:03fc 43             inc bx
01f6:03fd e2f4           loop 0x3f3
01f6:03ff e92202         jmp 0x624
01f6:0402 2eff670c       jmp word ptr cs:[bx + 0xc]
01f6:0406 6a00           push 0
01f6:0408 ff76fc         push word ptr [bp - 4]
01f6:040b ff76fa         push word ptr [bp - 6]
01f6:040e 6a00           push 0
01f6:0410 6a00           push 0
01f6:0412 9a48159b03     lcall putimage
01f6:0417 83c40a         add sp, 0xa
01f6:041a ff76fc         push word ptr [bp - 4]
01f6:041d ff76fa         push word ptr [bp - 6]
01f6:0420 9a2d1b0000     lcall free
01f6:0425 59             pop cx
01f6:0426 59             pop cx
01f6:0427 9a40007a02     lcall 027a:0040
01f6:042c 83fe03         cmp si, 3
01f6:042f 7d03           jge 0x434
01f6:0431 46             inc si
01f6:0432 eb02           jmp 0x436
01f6:0434 33f6           xor si, si
01f6:0436 6a0f           push 0xf
01f6:0438 6a01           push 1
01f6:043a 9a30129b03     lcall setfillstyle
01f6:043f 59             pop cx
01f6:0440 59             pop cx
01f6:0441 8bc7           mov ax, di
01f6:0443 ba1400         mov dx, 0x14
01f6:0446 f7ea           imul dx
01f6:0448 054400         add ax, 0x44
01f6:044b 50             push ax
01f6:044c 6a77           push 0x77
01f6:044e 8bc7           mov ax, di
01f6:0450 ba1400         mov dx, 0x14
01f6:0453 f7ea           imul dx
01f6:0455 053100         add ax, 0x31
01f6:0458 50             push ax
01f6:0459 6a05           push 5
01f6:045b 9a881c9b03     lcall bar
01f6:0460 83c408         add sp, 8
01f6:0463 68db01         push 0x1db
01f6:0466 682c01         push 0x12c
01f6:0469 68ce01         push 0x1ce
01f6:046c 6a14           push 0x14
01f6:046e 9a881c9b03     lcall bar
01f6:0473 83c408         add sp, 8
01f6:0476 6a00           push 0
01f6:0478 9ab21d9b03     lcall setcolor
01f6:047d 59             pop cx
01f6:047e 8bc7           mov ax, di
01f6:0480 ba0f00         mov dx, 0xf
01f6:0483 f7ea           imul dx
01f6:0485 8d56ba         lea dx, [bp - 0x46]
01f6:0488 03d0           add dx, ax
01f6:048a 16             push ss
01f6:048b 52             push dx
01f6:048c 8bc7           mov ax, di
01f6:048e ba1400         mov dx, 0x14
01f6:0491 f7ea           imul dx
01f6:0493 053700         add ax, 0x37
01f6:0496 50             push ax
01f6:0497 6a12           push 0x12
01f6:0499 9a801f9b03     lcall outtextxy
01f6:049e 83c408         add sp, 8
01f6:04a1 8bc6           mov ax, si
01f6:04a3 ba1e00         mov dx, 0x1e
01f6:04a6 f7ea           imul dx
01f6:04a8 8d9642ff       lea dx, [bp - 0xbe]
01f6:04ac 03d0           add dx, ax
01f6:04ae 16             push ss
01f6:04af 52             push dx
01f6:04b0 68ce01         push 0x1ce
01f6:04b3 6a14           push 0x14
01f6:04b5 9a801f9b03     lcall outtextxy
01f6:04ba 83c408         add sp, 8
01f6:04bd 6a01           push 1
01f6:04bf 6a01           push 1
01f6:04c1 9a30129b03     lcall setfillstyle
01f6:04c6 59             pop cx
01f6:04c7 59             pop cx
01f6:04c8 8bc6           mov ax, si
01f6:04ca ba1400         mov dx, 0x14
01f6:04cd f7ea           imul dx
01f6:04cf 054400         add ax, 0x44
01f6:04d2 50             push ax
01f6:04d3 6a77           push 0x77
01f6:04d5 8bc6           mov ax, si
01f6:04d7 ba1400         mov dx, 0x14
01f6:04da f7ea           imul dx
01f6:04dc 053100         add ax, 0x31
01f6:04df 50             push ax
01f6:04e0 6a05           push 5
01f6:04e2 9a881c9b03     lcall bar
01f6:04e7 83c408         add sp, 8
01f6:04ea 6a0f           push 0xf
01f6:04ec 9ab21d9b03     lcall setcolor
01f6:04f1 59             pop cx
01f6:04f2 8bc6           mov ax, si
01f6:04f4 ba0f00         mov dx, 0xf
01f6:04f7 f7ea           imul dx
01f6:04f9 8d56ba         lea dx, [bp - 0x46]
01f6:04fc 03d0           add dx, ax
01f6:04fe 16             push ss
01f6:04ff 52             push dx
01f6:0500 8bc6           mov ax, si
01f6:0502 ba1400         mov dx, 0x14
01f6:0505 f7ea           imul dx
01f6:0507 053700         add ax, 0x37
01f6:050a 50             push ax
01f6:050b 6a12           push 0x12
01f6:050d 9a801f9b03     lcall outtextxy
01f6:0512 83c408         add sp, 8
01f6:0515 8bfe           mov di, si
01f6:0517 c746060000     mov word ptr [bp + 6], 0
01f6:051c e90501         jmp 0x624
01f6:051f 0bf6           or si, si
01f6:0521 7e03           jle 0x526
01f6:0523 4e             dec si
01f6:0524 eb03           jmp 0x529
01f6:0526 be0300         mov si, 3
01f6:0529 6a0f           push 0xf
01f6:052b 6a01           push 1
01f6:052d 9a30129b03     lcall setfillstyle
01f6:0532 59             pop cx
01f6:0533 59             pop cx
01f6:0534 8bc7           mov ax, di
01f6:0536 ba1400         mov dx, 0x14
01f6:0539 f7ea           imul dx
01f6:053b 054400         add ax, 0x44
01f6:053e 50             push ax
01f6:053f 6a77           push 0x77
01f6:0541 8bc7           mov ax, di
01f6:0543 ba1400         mov dx, 0x14
01f6:0546 f7ea           imul dx
01f6:0548 053100         add ax, 0x31
01f6:054b 50             push ax
01f6:054c 6a05           push 5
01f6:054e 9a881c9b03     lcall bar
01f6:0553 83c408         add sp, 8
01f6:0556 68db01         push 0x1db
01f6:0559 682c01         push 0x12c
01f6:055c 68ce01         push 0x1ce
01f6:055f 6a14           push 0x14
01f6:0561 9a881c9b03     lcall bar
01f6:0566 83c408         add sp, 8
01f6:0569 6a00           push 0
01f6:056b 9ab21d9b03     lcall setcolor
01f6:0570 59             pop cx
01f6:0571 8bc7           mov ax, di
01f6:0573 ba0f00         mov dx, 0xf
01f6:0576 f7ea           imul dx
01f6:0578 8d56ba         lea dx, [bp - 0x46]
01f6:057b 03d0           add dx, ax
01f6:057d 16             push ss
01f6:057e 52             push dx
01f6:057f 8bc7           mov ax, di
01f6:0581 ba1400         mov dx, 0x14
01f6:0584 f7ea           imul dx
01f6:0586 053700         add ax, 0x37
01f6:0589 50             push ax
01f6:058a 6a12           push 0x12
01f6:058c 9a801f9b03     lcall outtextxy
01f6:0591 83c408         add sp, 8
01f6:0594 8bc6           mov ax, si
01f6:0596 ba1e00         mov dx, 0x1e
01f6:0599 f7ea           imul dx
01f6:059b 8d9642ff       lea dx, [bp - 0xbe]
01f6:059f 03d0           add dx, ax
01f6:05a1 16             push ss
01f6:05a2 52             push dx
01f6:05a3 68ce01         push 0x1ce
01f6:05a6 6a14           push 0x14
01f6:05a8 9a801f9b03     lcall outtextxy
01f6:05ad 83c408         add sp, 8
01f6:05b0 6a01           push 1
01f6:05b2 6a01           push 1
01f6:05b4 9a30129b03     lcall setfillstyle
01f6:05b9 59             pop cx
01f6:05ba 59             pop cx
01f6:05bb 8bc6           mov ax, si
01f6:05bd ba1400         mov dx, 0x14
01f6:05c0 f7ea           imul dx
01f6:05c2 054400         add ax, 0x44
01f6:05c5 50             push ax
01f6:05c6 6a77           push 0x77
01f6:05c8 8bc6           mov ax, si
01f6:05ca ba1400         mov dx, 0x14
01f6:05cd f7ea           imul dx
01f6:05cf 053100         add ax, 0x31
01f6:05d2 50             push ax
01f6:05d3 6a05           push 5
01f6:05d5 9a881c9b03     lcall bar
01f6:05da 83c408         add sp, 8
01f6:05dd 6a0f           push 0xf
01f6:05df 9ab21d9b03     lcall setcolor
01f6:05e4 59             pop cx
01f6:05e5 8bc6           mov ax, si
01f6:05e7 ba0f00         mov dx, 0xf
01f6:05ea f7ea           imul dx
01f6:05ec 8d56ba         lea dx, [bp - 0x46]
01f6:05ef 03d0           add dx, ax
01f6:05f1 16             push ss
01f6:05f2 52             push dx
01f6:05f3 8bc6           mov ax, si
01f6:05f5 ba1400         mov dx, 0x14
01f6:05f8 f7ea           imul dx
01f6:05fa 053700         add ax, 0x37
01f6:05fd 50             push ax
01f6:05fe 6a12           push 0x12
01f6:0600 9a801f9b03     lcall outtextxy
01f6:0605 83c408         add sp, 8
01f6:0608 8bfe           mov di, si
01f6:060a c746060000     mov word ptr [bp + 6], 0
01f6:060f eb13           jmp 0x624
01f6:0611 33f6           xor si, si
01f6:0613 eb24           jmp 0x639
01f6:0615 be0100         mov si, 1
01f6:0618 eb1f           jmp 0x639
01f6:061a be0400         mov si, 4
01f6:061d c746060d1c     mov word ptr [bp + 6], 0x1c0d
01f6:0622 eb15           jmp 0x639
01f6:0624 6a00           push 0
01f6:0626 9af3100000     lcall bioskey
01f6:062b 59             pop cx
01f6:062c 894606         mov word ptr [bp + 6], ax
01f6:062f 817e060d1c     cmp word ptr [bp + 6], 0x1c0d
01f6:0634 7403           je 0x639
01f6:0636 e9aefd         jmp 0x3e7
01f6:0639 6a0f           push 0xf
01f6:063b 6a01           push 1
01f6:063d 9a30129b03     lcall setfillstyle
01f6:0642 59             pop cx
01f6:0643 59             pop cx
01f6:0644 68db01         push 0x1db
01f6:0647 682c01         push 0x12c
01f6:064a 68ce01         push 0x1ce
01f6:064d 6a14           push 0x14
01f6:064f 9a881c9b03     lcall bar
01f6:0654 83c408         add sp, 8
01f6:0657 6a00           push 0
01f6:0659 ff76fc         push word ptr [bp - 4]
01f6:065c ff76fa         push word ptr [bp - 6]
01f6:065f 6a00           push 0
01f6:0661 6a00           push 0
01f6:0663 9a48159b03     lcall putimage
01f6:0668 83c40a         add sp, 0xa
01f6:066b ff76fc         push word ptr [bp - 4]
01f6:066e ff76fa         push word ptr [bp - 6]
01f6:0671 9a2d1b0000     lcall free
01f6:0676 59             pop cx
01f6:0677 59             pop cx
01f6:0678 8bde           mov bx, si
01f6:067a 83fb03         cmp bx, 3
01f6:067d 7721           ja 0x6a0
01f6:067f d1e3           shl bx, 1
01f6:0681 2effa7a406     jmp word ptr cs:[bx + 0x6a4]
01f6:0686 9a6d097a02     lcall 027a:096d
01f6:068b eb13           jmp 0x6a0
01f6:068d 9acf0a7a02     lcall 027a:0acf
01f6:0692 eb0c           jmp 0x6a0
01f6:0694 9ae5007a02     lcall 027a:00e5
01f6:0699 eb05           jmp 0x6a0
01f6:069b 9a40007a02     lcall 027a:0040
01f6:06a0 5f             pop di
01f6:06a1 5e             pop si
01f6:06a2 c9             leave 
01f6:06a3 cb             retf 
01f6:06a4 86068d06       xchg byte ptr [0x68d], al
01f6:06a8 94             xchg sp, ax
01f6:06a9 06             push es
01f6:06aa 9b             wait 
01f6:06ab 06             push es
01f6:06ac 1b01           sbb ax, word ptr [bx + di]
01f6:06ae 002d           add byte ptr [di], ch
01f6:06b0 003c           add byte ptr [si], bh
01f6:06b2 003d           add byte ptr [di], bh
01f6:06b4 004800         add byte ptr [bx + si], cl
01f6:06b7 50             push ax
01f6:06b8 1a060604       sbb al, byte ptr [0x406]
01f6:06bc 150611         adc ax, 0x1106
01f6:06bf 06             push es
01f6:06c0 1f             pop ds
01f6:06c1 052c04         add ax, 0x42c
0262:0004 c8040000       enter 4, 0
0262:0008 56             push si
0262:0009 57             push di
0262:000a 39269603       cmp word ptr [0x396], sp
0262:000e 7705           ja 0x15
0262:0010 9a621f0000     lcall __OVERFLOW
0262:0015 9a4402f601     lcall 01f6:0244
0262:001a 6a00           push 0
0262:001c 9af3100000     lcall bioskey
0262:0021 59             pop cx
0262:0022 8946fe         mov word ptr [bp - 2], ax
0262:0025 6a01           push 1
0262:0027 68c201         push 0x1c2
0262:002a 687602         push 0x276
0262:002d 6a46           push 0x46
0262:002f 6a0a           push 0xa
0262:0031 9a180f9b03     lcall setviewport
0262:0036 83c40a         add sp, 0xa
0262:0039 8b7efe         mov di, word ptr [bp - 2]
0262:003c b91600         mov cx, 0x16
0262:003f bb3501         mov bx, 0x135
0262:0042 2e393f         cmp word ptr cs:[bx], di
0262:0045 7407           je 0x4e
0262:0047 43             inc bx
0262:0048 43             inc bx
0262:0049 e2f7           loop 0x42
0262:004b e9c600         jmp 0x114
0262:004e 2eff672c       jmp word ptr cs:[bx + 0x2c]
0262:0052 9a40007a02     lcall 027a:0040
0262:0057 6a01           push 1
0262:0059 68df01         push 0x1df
0262:005c 687f02         push 0x27f
0262:005f 6a00           push 0
0262:0061 6a00           push 0
0262:0063 9a180f9b03     lcall setviewport
0262:0068 83c40a         add sp, 0xa
0262:006b ff76fe         push word ptr [bp - 2]
0262:006e 9a7902f601     lcall 01f6:0279
0262:0073 59             pop cx
0262:0074 e9b700         jmp 0x12e
0262:0077 c746fe0000     mov word ptr [bp - 2], 0
0262:007c e9af00         jmp 0x12e
0262:007f 6a01           push 1
0262:0081 68df01         push 0x1df
0262:0084 687f02         push 0x27f
0262:0087 6a00           push 0
0262:0089 6a00           push 0
0262:008b 9a180f9b03     lcall setviewport
0262:0090 83c40a         add sp, 0xa
0262:0093 9a5e007a02     lcall 027a:005e
0262:0098 e99300         jmp 0x12e
0262:009b 9a6e067a02     lcall 027a:066e
0262:00a0 e98b00         jmp 0x12e
0262:00a3 9ac0067a02     lcall 027a:06c0
0262:00a8 e98300         jmp 0x12e
0262:00ab 9a28077a02     lcall 027a:0728
0262:00b0 eb7c           jmp 0x12e
0262:00b2 9a7a077a02     lcall 027a:077a
0262:00b7 eb75           jmp 0x12e
0262:00b9 9ad1077a02     lcall 027a:07d1
0262:00be eb6e           jmp 0x12e
0262:00c0 9a19087a02     lcall 027a:0819
0262:00c5 eb67           jmp 0x12e
0262:00c7 9a97087a02     lcall 027a:0897
0262:00cc eb60           jmp 0x12e
0262:00ce 9ae3087a02     lcall 027a:08e3
0262:00d3 eb59           jmp 0x12e
0262:00d5 9a9d0d7a02     lcall 027a:0d9d
0262:00da eb52           jmp 0x12e
0262:00dc 9a410f7a02     lcall 027a:0f41
0262:00e1 eb4b           jmp 0x12e
0262:00e3 9aad107a02     lcall 027a:10ad
0262:00e8 eb44           jmp 0x12e
0262:00ea 9a4d117a02     lcall 027a:114d
0262:00ef eb3d           jmp 0x12e
0262:00f1 9ab6117a02     lcall 027a:11b6
0262:00f6 eb36           jmp 0x12e
0262:00f8 9a0c057a02     lcall 027a:050c
0262:00fd eb2f           jmp 0x12e
0262:00ff be0100         mov si, 1
0262:0102 eb09           jmp 0x10d
0262:0104 6a20           push 0x20
0262:0106 9a4e037a02     lcall 027a:034e
0262:010b 59             pop cx
0262:010c 46             inc si
0262:010d 83fe06         cmp si, 6
0262:0110 7ef2           jle 0x104
0262:0112 eb1a           jmp 0x12e
0262:0114 50             push ax
0262:0115 8b46fe         mov ax, word ptr [bp - 2]
0262:0118 8846fd         mov byte ptr [bp - 3], al
0262:011b 58             pop ax
0262:011c 807efd00       cmp byte ptr [bp - 3], 0
0262:0120 7502           jne 0x124
0262:0122 eb0a           jmp 0x12e
0262:0124 8a46fd         mov al, byte ptr [bp - 3]
0262:0127 50             push ax
0262:0128 9a4e037a02     lcall 027a:034e
0262:012d 59             pop cx
0262:012e e9e9fe         jmp 0x1a
0262:0131 5f             pop di
0262:0132 5e             pop si
0262:0133 c9             leave 
0262:0134 cb             retf 
0262:0135 00841b01       add byte ptr [si + 0x11b], al
0262:0139 080e090f       or byte ptr [0xf09], cl
0262:013d 1915           sbb word ptr [di], dx
0262:013f 0d1c00         or ax, 0x1c
0262:0142 2100           and word ptr [bx + si], ax
0262:0144 2d003c         sub ax, 0x3c00
0262:0147 003d           add byte ptr [di], bh
0262:0149 004400         add byte ptr [si], al
0262:014c 47             inc di
0262:014d 004800         add byte ptr [bx + si], cl
0262:0150 49             dec cx
0262:0151 004b00         add byte ptr [bp + di], cl
0262:0154 4d             dec bp
0262:0155 004f00         add byte ptr [bx], cl
0262:0158 50             push ax
0262:0159 005100         add byte ptr [bx + di], dl
0262:015c 52             push dx
0262:015d 005300         add byte ptr [bp + di], dl
0262:0160 76ea           jbe 0x14c
0262:0162 007700         add byte ptr [bx], dh
0262:0165 d500           aad 0
0262:0167 ff00           inc word ptr [bx + si]
0262:0169 e300           jcxz 0x16b
0262:016b f8             clc 
0262:016c 005700         add byte ptr [bx], dl
0262:016f 52             push dx
0262:0170 005700         add byte ptr [bx], dl
0262:0173 57             push di
0262:0174 005700         add byte ptr [bx], dl
0262:0177 c700ab00       mov word ptr [bx + si], 0xab
0262:017b b9009b         mov cx, 0x9b00
0262:017e 00a300ce       add byte ptr [bp + di - 0x3200], ah
0262:0182 00b200c0       add byte ptr [bp + si - 0x4000], dh
0262:0186 007f00         add byte ptr [bx], bh
0262:0189 dc00           fadd qword ptr [bx + si]
0262:018b f1             int1 
0262:018c db 00
027a:000d 55             push bp
027a:000e 8bec           mov bp, sp
027a:0010 56             push si
027a:0011 39269603       cmp word ptr [0x396], sp
027a:0015 7705           ja 0x1c
027a:0017 9a621f0000     lcall __OVERFLOW
027a:001c 33f6           xor si, si
027a:001e eb12           jmp 0x32
027a:0020 8bde           mov bx, si
027a:0022 c1e302         shl bx, 2
027a:0025 c787740a0000   mov word ptr [bx + 0xa74], 0
027a:002b c787720a0000   mov word ptr [bx + 0xa72], 0
027a:0031 46             inc si
027a:0032 81fe5802       cmp si, 0x258
027a:0036 7ee8           jle 0x20
027a:0038 9ae5007a02     lcall 027a:00e5
027a:003d 5e             pop si
027a:003e 5d             pop bp
027a:003f cb             retf 
027a:0040 55             push bp
027a:0041 8bec           mov bp, sp
027a:0043 39269603       cmp word ptr [0x396], sp
027a:0047 7705           ja 0x4e
027a:0049 9a621f0000     lcall __OVERFLOW
027a:004e 9a7e017a02     lcall 027a:017e
027a:0053 9a530e9b03     lcall closegraph
027a:0058 b44c           mov ah, 0x4c
027a:005a cd21           int 0x21
027a:005c 5d             pop bp
027a:005d cb             retf 
027a:005e c8140000       enter 0x14, 0
027a:0062 39269603       cmp word ptr [0x396], sp
027a:0066 7705           ja 0x6d
027a:0068 9a621f0000     lcall __OVERFLOW
027a:006d 8d46ec         lea ax, [bp - 0x14]
027a:0070 16             push ss
027a:0071 50             push ax
027a:0072 1e             push ds
027a:0073 687601         push 0x176  ; 'INS OFF'
027a:0076 b91400         mov cx, 0x14
027a:0079 9a131f0000     lcall SCOPY@
027a:007e a05e01         mov al, byte ptr [0x15e]
027a:0081 98             cwde 
027a:0082 f7d8           neg ax
027a:0084 1bc0           sbb ax, ax
027a:0086 40             inc ax
027a:0087 a25e01         mov byte ptr [0x15e], al
027a:008a 6a0f           push 0xf
027a:008c 6a01           push 1
027a:008e 9a30129b03     lcall setfillstyle
027a:0093 59             pop cx
027a:0094 59             pop cx
027a:0095 68db01         push 0x1db
027a:0098 687602         push 0x276
027a:009b 68ce01         push 0x1ce
027a:009e 682602         push 0x226
027a:00a1 9a881c9b03     lcall bar
027a:00a6 83c408         add sp, 8
027a:00a9 6a00           push 0
027a:00ab 9ab21d9b03     lcall setcolor
027a:00b0 59             pop cx
027a:00b1 a05e01         mov al, byte ptr [0x15e]
027a:00b4 98             cwde 
027a:00b5 ba0a00         mov dx, 0xa
027a:00b8 f7ea           imul dx
027a:00ba 8d56ec         lea dx, [bp - 0x14]
027a:00bd 03d0           add dx, ax
027a:00bf 16             push ss
027a:00c0 52             push dx
027a:00c1 68ce01         push 0x1ce
027a:00c4 683002         push 0x230
027a:00c7 9a801f9b03     lcall outtextxy
027a:00cc 83c408         add sp, 8
027a:00cf 68dc01         push 0x1dc
027a:00d2 681c02         push 0x21c
027a:00d5 68c701         push 0x1c7
027a:00d8 681c02         push 0x21c
027a:00db 9a251c9b03     lcall line
027a:00e0 83c408         add sp, 8
027a:00e3 c9             leave 
027a:00e4 cb             retf 
027a:00e5 55             push bp
027a:00e6 8bec           mov bp, sp
027a:00e8 39269603       cmp word ptr [0x396], sp
027a:00ec 7705           ja 0xf3
027a:00ee 9a621f0000     lcall __OVERFLOW
027a:00f3 9a7e017a02     lcall 027a:017e
027a:00f8 c706da130000   mov word ptr [0x13da], 0
027a:00fe c706dc130000   mov word ptr [0x13dc], 0
027a:0104 c706de130000   mov word ptr [0x13de], 0
027a:010a c706e0130000   mov word ptr [0x13e0], 0
027a:0110 c7065f010100   mov word ptr [0x15f], 1
027a:0116 1e             push ds
027a:0117 688a01         push 0x18a
027a:011a 9a9e189b03     lcall textheight
027a:011f 59             pop cx
027a:0120 59             pop cx
027a:0121 050400         add ax, 4
027a:0124 a3e613         mov word ptr [0x13e6], ax
027a:0127 1e             push ds
027a:0128 688c01         push 0x18c
027a:012b 9a2d209b03     lcall textwidth
027a:0130 59             pop cx
027a:0131 59             pop cx
027a:0132 a3e813         mov word ptr [0x13e8], ax
027a:0135 6a0f           push 0xf
027a:0137 6a01           push 1
027a:0139 9a30129b03     lcall setfillstyle
027a:013e 59             pop cx
027a:013f 59             pop cx
027a:0140 68c201         push 0x1c2
027a:0143 687602         push 0x276
027a:0146 6a46           push 0x46
027a:0148 6a0a           push 0xa
027a:014a 9a881c9b03     lcall bar
027a:014f 83c408         add sp, 8
027a:0152 9a96027a02     lcall 027a:0296
027a:0157 68ce00         push 0xce  ; 'Open and load a new file'
027a:015a 9aad190000     lcall op_new
027a:015f 59             pop cx
027a:0160 8916740a       mov word ptr [0xa74], dx
027a:0164 a3720a         mov word ptr [0xa72], ax
027a:0167 6a00           push 0
027a:0169 68ce00         push 0xce  ; 'Open and load a new file'
027a:016c ff36740a       push word ptr [0xa74]
027a:0170 ff36720a       push word ptr [0xa72]
027a:0174 9a3d150000     lcall setmem
027a:0179 83c408         add sp, 8
027a:017c 5d             pop bp
027a:017d cb             retf 
027a:017e 55             push bp
027a:017f 8bec           mov bp, sp
027a:0181 56             push si
027a:0182 39269603       cmp word ptr [0x396], sp
027a:0186 7705           ja 0x18d
027a:0188 9a621f0000     lcall __OVERFLOW
027a:018d 33f6           xor si, si
027a:018f eb35           jmp 0x1c6
027a:0191 8bde           mov bx, si
027a:0193 c1e302         shl bx, 2
027a:0196 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:019a 0b87740a       or ax, word ptr [bx + 0xa74]
027a:019e 7425           je 0x1c5
027a:01a0 8bde           mov bx, si
027a:01a2 c1e302         shl bx, 2
027a:01a5 ffb7740a       push word ptr [bx + 0xa74]
027a:01a9 ffb7720a       push word ptr [bx + 0xa72]
027a:01ad 9a71190000     lcall op_delete
027a:01b2 59             pop cx
027a:01b3 59             pop cx
027a:01b4 8bde           mov bx, si
027a:01b6 c1e302         shl bx, 2
027a:01b9 c787740a0000   mov word ptr [bx + 0xa74], 0
027a:01bf c787720a0000   mov word ptr [bx + 0xa72], 0
027a:01c5 46             inc si
027a:01c6 81fe5802       cmp si, 0x258
027a:01ca 7ec5           jle 0x191
027a:01cc 5e             pop si
027a:01cd 5d             pop bp
027a:01ce cb             retf 
027a:01cf 55             push bp
027a:01d0 8bec           mov bp, sp
027a:01d2 39269603       cmp word ptr [0x396], sp
027a:01d6 7705           ja 0x1dd
027a:01d8 9a621f0000     lcall __OVERFLOW
027a:01dd 6a01           push 1
027a:01df 9a3d1a9b03     lcall setwritemode
027a:01e4 59             pop cx
027a:01e5 6a03           push 3
027a:01e7 9ab21d9b03     lcall setcolor
027a:01ec 59             pop cx
027a:01ed a1dc13         mov ax, word ptr [0x13dc]
027a:01f0 f72ee613       imul word ptr [0x13e6]
027a:01f4 8b16e613       mov dx, word ptr [0x13e6]
027a:01f8 03d0           add dx, ax
027a:01fa 52             push dx
027a:01fb a1da13         mov ax, word ptr [0x13da]
027a:01fe f72ee813       imul word ptr [0x13e8]
027a:0202 40             inc ax
027a:0203 50             push ax
027a:0204 a1dc13         mov ax, word ptr [0x13dc]
027a:0207 f72ee613       imul word ptr [0x13e6]
027a:020b 05fdff         add ax, 0xfffd
027a:020e 50             push ax
027a:020f a1da13         mov ax, word ptr [0x13da]
027a:0212 f72ee813       imul word ptr [0x13e8]
027a:0216 50             push ax
027a:0217 9abd119b03     lcall rectangle
027a:021c 83c408         add sp, 8
027a:021f a1dc13         mov ax, word ptr [0x13dc]
027a:0222 f72ee613       imul word ptr [0x13e6]
027a:0226 8b16e613       mov dx, word ptr [0x13e6]
027a:022a 03d0           add dx, ax
027a:022c 52             push dx
027a:022d a1da13         mov ax, word ptr [0x13da]
027a:0230 f72ee813       imul word ptr [0x13e8]
027a:0234 050300         add ax, 3
027a:0237 50             push ax
027a:0238 a1dc13         mov ax, word ptr [0x13dc]
027a:023b f72ee613       imul word ptr [0x13e6]
027a:023f 05fdff         add ax, 0xfffd
027a:0242 50             push ax
027a:0243 a1da13         mov ax, word ptr [0x13da]
027a:0246 f72ee813       imul word ptr [0x13e8]
027a:024a 40             inc ax
027a:024b 40             inc ax
027a:024c 50             push ax
027a:024d 9abd119b03     lcall rectangle
027a:0252 83c408         add sp, 8
027a:0255 a1dc13         mov ax, word ptr [0x13dc]
027a:0258 f72ee613       imul word ptr [0x13e6]
027a:025c 8b16e613       mov dx, word ptr [0x13e6]
027a:0260 03d0           add dx, ax
027a:0262 52             push dx
027a:0263 a1da13         mov ax, word ptr [0x13da]
027a:0266 f72ee813       imul word ptr [0x13e8]
027a:026a 050500         add ax, 5
027a:026d 50             push ax
027a:026e a1dc13         mov ax, word ptr [0x13dc]
027a:0271 f72ee613       imul word ptr [0x13e6]
027a:0275 05fdff         add ax, 0xfffd
027a:0278 50             push ax
027a:0279 a1da13         mov ax, word ptr [0x13da]
027a:027c f72ee813       imul word ptr [0x13e8]
027a:0280 050400         add ax, 4
027a:0283 50             push ax
027a:0284 9abd119b03     lcall rectangle
027a:0289 83c408         add sp, 8
027a:028c 6a00           push 0
027a:028e 9a3d1a9b03     lcall setwritemode
027a:0293 59             pop cx
027a:0294 5d             pop bp
027a:0295 cb             retf 
027a:0296 55             push bp
027a:0297 8bec           mov bp, sp
027a:0299 39269603       cmp word ptr [0x396], sp
027a:029d 7705           ja 0x2a4
027a:029f 9a621f0000     lcall __OVERFLOW
027a:02a4 6a01           push 1
027a:02a6 9a3d1a9b03     lcall setwritemode
027a:02ab 59             pop cx
027a:02ac 6a03           push 3
027a:02ae 9ab21d9b03     lcall setcolor
027a:02b3 59             pop cx
027a:02b4 a1dc13         mov ax, word ptr [0x13dc]
027a:02b7 c1e003         shl ax, 3
027a:02ba 054c00         add ax, 0x4c
027a:02bd 50             push ax
027a:02be a1da13         mov ax, word ptr [0x13da]
027a:02c1 c1e003         shl ax, 3
027a:02c4 050b00         add ax, 0xb
027a:02c7 50             push ax
027a:02c8 a1dc13         mov ax, word ptr [0x13dc]
027a:02cb c1e003         shl ax, 3
027a:02ce 054600         add ax, 0x46
027a:02d1 50             push ax
027a:02d2 a1da13         mov ax, word ptr [0x13da]
027a:02d5 c1e003         shl ax, 3
027a:02d8 050a00         add ax, 0xa
027a:02db 50             push ax
027a:02dc 9abd119b03     lcall rectangle
027a:02e1 83c408         add sp, 8
027a:02e4 a1dc13         mov ax, word ptr [0x13dc]
027a:02e7 c1e003         shl ax, 3
027a:02ea 054c00         add ax, 0x4c
027a:02ed 50             push ax
027a:02ee a1da13         mov ax, word ptr [0x13da]
027a:02f1 c1e003         shl ax, 3
027a:02f4 050d00         add ax, 0xd
027a:02f7 50             push ax
027a:02f8 a1dc13         mov ax, word ptr [0x13dc]
027a:02fb c1e003         shl ax, 3
027a:02fe 054600         add ax, 0x46
027a:0301 50             push ax
027a:0302 a1da13         mov ax, word ptr [0x13da]
027a:0305 c1e003         shl ax, 3
027a:0308 050c00         add ax, 0xc
027a:030b 50             push ax
027a:030c 9abd119b03     lcall rectangle
027a:0311 83c408         add sp, 8
027a:0314 a1dc13         mov ax, word ptr [0x13dc]
027a:0317 c1e003         shl ax, 3
027a:031a 054c00         add ax, 0x4c
027a:031d 50             push ax
027a:031e a1da13         mov ax, word ptr [0x13da]
027a:0321 c1e003         shl ax, 3
027a:0324 050f00         add ax, 0xf
027a:0327 50             push ax
027a:0328 a1dc13         mov ax, word ptr [0x13dc]
027a:032b c1e003         shl ax, 3
027a:032e 054600         add ax, 0x46
027a:0331 50             push ax
027a:0332 a1da13         mov ax, word ptr [0x13da]
027a:0335 c1e003         shl ax, 3
027a:0338 050e00         add ax, 0xe
027a:033b 50             push ax
027a:033c 9abd119b03     lcall rectangle
027a:0341 83c408         add sp, 8
027a:0344 6a00           push 0
027a:0346 9a3d1a9b03     lcall setwritemode
027a:034b 59             pop cx
027a:034c 5d             pop bp
027a:034d cb             retf 
027a:034e 55             push bp
027a:034f 8bec           mov bp, sp
027a:0351 56             push si
027a:0352 39269603       cmp word ptr [0x396], sp
027a:0356 7705           ja 0x35d
027a:0358 9a621f0000     lcall __OVERFLOW
027a:035d 8b1ee013       mov bx, word ptr [0x13e0]
027a:0361 c1e302         shl bx, 2
027a:0364 ffb7740a       push word ptr [bx + 0xa74]
027a:0368 ffb7720a       push word ptr [bx + 0xa72]
027a:036c 9aef180000     lcall strlen
027a:0371 59             pop cx
027a:0372 59             pop cx
027a:0373 8bf0           mov si, ax
027a:0375 81fecc00       cmp si, 0xcc
027a:0379 7c0a           jl 0x385
027a:037b 803e5e0101     cmp byte ptr [0x15e], 1
027a:0380 7503           jne 0x385
027a:0382 e9d000         jmp 0x455
027a:0385 813ede13cc00   cmp word ptr [0x13de], 0xcc
027a:038b 7c03           jl 0x390
027a:038d e9c500         jmp 0x455
027a:0390 0e             push cs
027a:0391 e83bfe         call 0x1cf
027a:0394 803e5e0100     cmp byte ptr [0x15e], 0
027a:0399 7439           je 0x3d4
027a:039b b8cc00         mov ax, 0xcc
027a:039e 2b06de13       sub ax, word ptr [0x13de]
027a:03a2 50             push ax
027a:03a3 8b1ee013       mov bx, word ptr [0x13e0]
027a:03a7 c1e302         shl bx, 2
027a:03aa 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:03ae 0306de13       add ax, word ptr [0x13de]
027a:03b2 ffb7740a       push word ptr [bx + 0xa74]
027a:03b6 50             push ax
027a:03b7 8b1ee013       mov bx, word ptr [0x13e0]
027a:03bb c1e302         shl bx, 2
027a:03be 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:03c2 0306de13       add ax, word ptr [0x13de]
027a:03c6 40             inc ax
027a:03c7 ffb7740a       push word ptr [bx + 0xa74]
027a:03cb 50             push ax
027a:03cc 9ad2150000     lcall memmove
027a:03d1 83c40a         add sp, 0xa
027a:03d4 3b36de13       cmp si, word ptr [0x13de]
027a:03d8 7d22           jge 0x3fc
027a:03da 6a20           push 0x20
027a:03dc a1de13         mov ax, word ptr [0x13de]
027a:03df 2bc6           sub ax, si
027a:03e1 50             push ax
027a:03e2 8b1ee013       mov bx, word ptr [0x13e0]
027a:03e6 c1e302         shl bx, 2
027a:03e9 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:03ed 03c6           add ax, si
027a:03ef ffb7740a       push word ptr [bx + 0xa74]
027a:03f3 50             push ax
027a:03f4 9a3d150000     lcall setmem
027a:03f9 83c408         add sp, 8
027a:03fc 8b1ee013       mov bx, word ptr [0x13e0]
027a:0400 c1e302         shl bx, 2
027a:0403 c49f720a       les bx, ptr [bx + 0xa72]
027a:0407 031ede13       add bx, word ptr [0x13de]
027a:040b 8a4606         mov al, byte ptr [bp + 6]
027a:040e 268807         mov byte ptr es:[bx], al
027a:0411 833eda134c     cmp word ptr [0x13da], 0x4c
027a:0416 7c1f           jl 0x437
027a:0418 ff06de13       inc word ptr [0x13de]
027a:041c 832eda130a     sub word ptr [0x13da], 0xa
027a:0421 c706e2130a00   mov word ptr [0x13e2], 0xa
027a:0427 6a20           push 0x20
027a:0429 6a00           push 0
027a:042b 6a00           push 0
027a:042d 9a58047a02     lcall 027a:0458
027a:0432 83c406         add sp, 6
027a:0435 eb1a           jmp 0x451
027a:0437 6a01           push 1
027a:0439 ff36dc13       push word ptr [0x13dc]
027a:043d ff36da13       push word ptr [0x13da]
027a:0441 9a58047a02     lcall 027a:0458
027a:0446 83c406         add sp, 6
027a:0449 ff06da13       inc word ptr [0x13da]
027a:044d ff06de13       inc word ptr [0x13de]
027a:0451 0e             push cs
027a:0452 e87afd         call 0x1cf
027a:0455 5e             pop si
027a:0456 5d             pop bp
027a:0457 cb             retf 
027a:0458 55             push bp
027a:0459 8bec           mov bp, sp
027a:045b 56             push si
027a:045c 57             push di
027a:045d 8b7e08         mov di, word ptr [bp + 8]
027a:0460 39269603       cmp word ptr [0x396], sp
027a:0464 7705           ja 0x46b
027a:0466 9a621f0000     lcall __OVERFLOW
027a:046b 6a0f           push 0xf
027a:046d 6a01           push 1
027a:046f 9a30129b03     lcall setfillstyle
027a:0474 59             pop cx
027a:0475 59             pop cx
027a:0476 8bc7           mov ax, di
027a:0478 03460a         add ax, word ptr [bp + 0xa]
027a:047b f72ee613       imul word ptr [0x13e6]
027a:047f 05feff         add ax, 0xfffe
027a:0482 50             push ax
027a:0483 687602         push 0x276
027a:0486 8bc7           mov ax, di
027a:0488 f72ee613       imul word ptr [0x13e6]
027a:048c 50             push ax
027a:048d 8b4606         mov ax, word ptr [bp + 6]
027a:0490 f72ee813       imul word ptr [0x13e8]
027a:0494 50             push ax
027a:0495 9a881c9b03     lcall bar
027a:049a 83c408         add sp, 8
027a:049d 6a00           push 0
027a:049f 9ab21d9b03     lcall setcolor
027a:04a4 59             pop cx
027a:04a5 33f6           xor si, si
027a:04a7 eb5a           jmp 0x503
027a:04a9 8b1ee013       mov bx, word ptr [0x13e0]
027a:04ad 2b1edc13       sub bx, word ptr [0x13dc]
027a:04b1 03df           add bx, di
027a:04b3 03de           add bx, si
027a:04b5 c1e302         shl bx, 2
027a:04b8 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:04bc 0b87740a       or ax, word ptr [bx + 0xa74]
027a:04c0 7504           jne 0x4c6
027a:04c2 eb44           jmp 0x508
027a:04c4 eb3c           jmp 0x502
027a:04c6 8b1ee013       mov bx, word ptr [0x13e0]
027a:04ca 2b1edc13       sub bx, word ptr [0x13dc]
027a:04ce 03df           add bx, di
027a:04d0 03de           add bx, si
027a:04d2 c1e302         shl bx, 2
027a:04d5 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:04d9 0306de13       add ax, word ptr [0x13de]
027a:04dd 2b06da13       sub ax, word ptr [0x13da]
027a:04e1 034606         add ax, word ptr [bp + 6]
027a:04e4 ffb7740a       push word ptr [bx + 0xa74]
027a:04e8 50             push ax
027a:04e9 8bc7           mov ax, di
027a:04eb 03c6           add ax, si
027a:04ed f72ee613       imul word ptr [0x13e6]
027a:04f1 50             push ax
027a:04f2 8b4606         mov ax, word ptr [bp + 6]
027a:04f5 f72ee813       imul word ptr [0x13e8]
027a:04f9 50             push ax
027a:04fa 9a801f9b03     lcall outtextxy
027a:04ff 83c408         add sp, 8
027a:0502 46             inc si
027a:0503 3b760a         cmp si, word ptr [bp + 0xa]
027a:0506 7ca1           jl 0x4a9
027a:0508 5f             pop di
027a:0509 5e             pop si
027a:050a 5d             pop bp
027a:050b cb             retf 
027a:050c 55             push bp
027a:050d 8bec           mov bp, sp
027a:050f 56             push si
027a:0510 57             push di
027a:0511 39269603       cmp word ptr [0x396], sp
027a:0515 7705           ja 0x51c
027a:0517 9a621f0000     lcall __OVERFLOW
027a:051c 33ff           xor di, di
027a:051e 813ee0135802   cmp word ptr [0x13e0], 0x258
027a:0524 7c03           jl 0x529
027a:0526 e94101         jmp 0x66a
027a:0529 813e5f015802   cmp word ptr [0x15f], 0x258
027a:052f 7c03           jl 0x534
027a:0531 e93601         jmp 0x66a
027a:0534 ff065f01       inc word ptr [0x15f]
027a:0538 a15f01         mov ax, word ptr [0x15f]
027a:053b 48             dec ax
027a:053c 8bf0           mov si, ax
027a:053e eb1c           jmp 0x55c
027a:0540 8bde           mov bx, si
027a:0542 4b             dec bx
027a:0543 c1e302         shl bx, 2
027a:0546 8b87740a       mov ax, word ptr [bx + 0xa74]
027a:054a 8b97720a       mov dx, word ptr [bx + 0xa72]
027a:054e 8bde           mov bx, si
027a:0550 c1e302         shl bx, 2
027a:0553 8987740a       mov word ptr [bx + 0xa74], ax
027a:0557 8997720a       mov word ptr [bx + 0xa72], dx
027a:055b 4e             dec si
027a:055c a1e013         mov ax, word ptr [0x13e0]
027a:055f 40             inc ax
027a:0560 3bc6           cmp ax, si
027a:0562 7cdc           jl 0x540
027a:0564 68ce00         push 0xce  ; 'Open and load a new file'
027a:0567 9aad190000     lcall op_new
027a:056c 59             pop cx
027a:056d 8b1ee013       mov bx, word ptr [0x13e0]
027a:0571 43             inc bx
027a:0572 c1e302         shl bx, 2
027a:0575 8997740a       mov word ptr [bx + 0xa74], dx
027a:0579 8987720a       mov word ptr [bx + 0xa72], ax
027a:057d 6a00           push 0
027a:057f 68ce00         push 0xce  ; 'Open and load a new file'
027a:0582 8b1ee013       mov bx, word ptr [0x13e0]
027a:0586 43             inc bx
027a:0587 c1e302         shl bx, 2
027a:058a ffb7740a       push word ptr [bx + 0xa74]
027a:058e ffb7720a       push word ptr [bx + 0xa72]
027a:0592 9a3d150000     lcall setmem
027a:0597 83c408         add sp, 8
027a:059a 8b1ee013       mov bx, word ptr [0x13e0]
027a:059e c1e302         shl bx, 2
027a:05a1 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:05a5 0306de13       add ax, word ptr [0x13de]
027a:05a9 ffb7740a       push word ptr [bx + 0xa74]
027a:05ad 50             push ax
027a:05ae 9aef180000     lcall strlen
027a:05b3 59             pop cx
027a:05b4 59             pop cx
027a:05b5 50             push ax
027a:05b6 8b1ee013       mov bx, word ptr [0x13e0]
027a:05ba c1e302         shl bx, 2
027a:05bd 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:05c1 0306de13       add ax, word ptr [0x13de]
027a:05c5 ffb7740a       push word ptr [bx + 0xa74]
027a:05c9 50             push ax
027a:05ca 8b1ee013       mov bx, word ptr [0x13e0]
027a:05ce 43             inc bx
027a:05cf c1e302         shl bx, 2
027a:05d2 ffb7740a       push word ptr [bx + 0xa74]
027a:05d6 ffb7720a       push word ptr [bx + 0xa72]
027a:05da 9ad2150000     lcall memmove
027a:05df 83c40a         add sp, 0xa
027a:05e2 6a00           push 0
027a:05e4 b8ce00         mov ax, 0xce  ; 'Open and load a new file'
027a:05e7 2b06de13       sub ax, word ptr [0x13de]
027a:05eb 50             push ax
027a:05ec 8b1ee013       mov bx, word ptr [0x13e0]
027a:05f0 c1e302         shl bx, 2
027a:05f3 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:05f7 0306de13       add ax, word ptr [0x13de]
027a:05fb ffb7740a       push word ptr [bx + 0xa74]
027a:05ff 50             push ax
027a:0600 9a3d150000     lcall setmem
027a:0605 83c408         add sp, 8
027a:0608 0e             push cs
027a:0609 e8c3fb         call 0x1cf
027a:060c 8b3edc13       mov di, word ptr [0x13dc]
027a:0610 ff06dc13       inc word ptr [0x13dc]
027a:0614 ff06e013       inc word ptr [0x13e0]
027a:0618 833edc131f     cmp word ptr [0x13dc], 0x1f
027a:061d 7e07           jle 0x626
027a:061f 832edc1305     sub word ptr [0x13dc], 5
027a:0624 33ff           xor di, di
027a:0626 a1de13         mov ax, word ptr [0x13de]
027a:0629 3b06da13       cmp ax, word ptr [0x13da]
027a:062d 751e           jne 0x64d
027a:062f c706da130000   mov word ptr [0x13da], 0
027a:0635 c706de130000   mov word ptr [0x13de], 0
027a:063b b82000         mov ax, 0x20
027a:063e 2bc7           sub ax, di
027a:0640 50             push ax
027a:0641 57             push di
027a:0642 6a00           push 0
027a:0644 0e             push cs
027a:0645 e810fe         call 0x458
027a:0648 83c406         add sp, 6
027a:064b eb19           jmp 0x666
027a:064d c706da130000   mov word ptr [0x13da], 0
027a:0653 c706de130000   mov word ptr [0x13de], 0
027a:0659 6a20           push 0x20
027a:065b 6a00           push 0
027a:065d 6a00           push 0
027a:065f 0e             push cs
027a:0660 e8f5fd         call 0x458
027a:0663 83c406         add sp, 6
027a:0666 0e             push cs
027a:0667 e865fb         call 0x1cf
027a:066a 5f             pop di
027a:066b 5e             pop si
027a:066c 5d             pop bp
027a:066d cb             retf 
027a:066e 55             push bp
027a:066f 8bec           mov bp, sp
027a:0671 39269603       cmp word ptr [0x396], sp
027a:0675 7705           ja 0x67c
027a:0677 9a621f0000     lcall __OVERFLOW
027a:067c 833ede1300     cmp word ptr [0x13de], 0
027a:0681 7502           jne 0x685
027a:0683 eb39           jmp 0x6be
027a:0685 0e             push cs
027a:0686 e846fb         call 0x1cf
027a:0689 ff0ede13       dec word ptr [0x13de]
027a:068d ff0eda13       dec word ptr [0x13da]
027a:0691 833eda1300     cmp word ptr [0x13da], 0
027a:0696 7d22           jge 0x6ba
027a:0698 833ede130a     cmp word ptr [0x13de], 0xa
027a:069d 7e08           jle 0x6a7
027a:069f c706da130a00   mov word ptr [0x13da], 0xa
027a:06a5 eb06           jmp 0x6ad
027a:06a7 a1de13         mov ax, word ptr [0x13de]
027a:06aa a3da13         mov word ptr [0x13da], ax
027a:06ad 6a20           push 0x20
027a:06af 6a00           push 0
027a:06b1 6a00           push 0
027a:06b3 0e             push cs
027a:06b4 e8a1fd         call 0x458
027a:06b7 83c406         add sp, 6
027a:06ba 0e             push cs
027a:06bb e811fb         call 0x1cf
027a:06be 5d             pop bp
027a:06bf cb             retf 
027a:06c0 55             push bp
027a:06c1 8bec           mov bp, sp
027a:06c3 39269603       cmp word ptr [0x396], sp
027a:06c7 7705           ja 0x6ce
027a:06c9 9a621f0000     lcall __OVERFLOW
027a:06ce 8b1ee013       mov bx, word ptr [0x13e0]
027a:06d2 c1e302         shl bx, 2
027a:06d5 ffb7740a       push word ptr [bx + 0xa74]
027a:06d9 ffb7720a       push word ptr [bx + 0xa72]
027a:06dd 9aef180000     lcall strlen
027a:06e2 59             pop cx
027a:06e3 59             pop cx
027a:06e4 3b06de13       cmp ax, word ptr [0x13de]
027a:06e8 7702           ja 0x6ec
027a:06ea eb3a           jmp 0x726
027a:06ec 0e             push cs
027a:06ed e8dffa         call 0x1cf
027a:06f0 ff06de13       inc word ptr [0x13de]
027a:06f4 ff06da13       inc word ptr [0x13da]
027a:06f8 833eda134c     cmp word ptr [0x13da], 0x4c
027a:06fd 7e23           jle 0x722
027a:06ff 813ede13e000   cmp word ptr [0x13de], 0xe0
027a:0705 7d08           jge 0x70f
027a:0707 c706da134200   mov word ptr [0x13da], 0x42
027a:070d eb06           jmp 0x715
027a:070f a1de13         mov ax, word ptr [0x13de]
027a:0712 a3da13         mov word ptr [0x13da], ax
027a:0715 6a20           push 0x20
027a:0717 6a00           push 0
027a:0719 6a00           push 0
027a:071b 0e             push cs
027a:071c e839fd         call 0x458
027a:071f 83c406         add sp, 6
027a:0722 0e             push cs
027a:0723 e8a9fa         call 0x1cf
027a:0726 5d             pop bp
027a:0727 cb             retf 
027a:0728 55             push bp
027a:0729 8bec           mov bp, sp
027a:072b 39269603       cmp word ptr [0x396], sp
027a:072f 7705           ja 0x736
027a:0731 9a621f0000     lcall __OVERFLOW
027a:0736 833ee01300     cmp word ptr [0x13e0], 0
027a:073b 7502           jne 0x73f
027a:073d eb39           jmp 0x778
027a:073f 0e             push cs
027a:0740 e88cfa         call 0x1cf
027a:0743 ff0ee013       dec word ptr [0x13e0]
027a:0747 ff0edc13       dec word ptr [0x13dc]
027a:074b 833edc1300     cmp word ptr [0x13dc], 0
027a:0750 7d22           jge 0x774
027a:0752 833ee01305     cmp word ptr [0x13e0], 5
027a:0757 7e08           jle 0x761
027a:0759 c706dc130500   mov word ptr [0x13dc], 5
027a:075f eb06           jmp 0x767
027a:0761 a1e013         mov ax, word ptr [0x13e0]
027a:0764 a3dc13         mov word ptr [0x13dc], ax
027a:0767 6a20           push 0x20
027a:0769 6a00           push 0
027a:076b 6a00           push 0
027a:076d 0e             push cs
027a:076e e8e7fc         call 0x458
027a:0771 83c406         add sp, 6
027a:0774 0e             push cs
027a:0775 e857fa         call 0x1cf
027a:0778 5d             pop bp
027a:0779 cb             retf 
027a:077a 55             push bp
027a:077b 8bec           mov bp, sp
027a:077d 39269603       cmp word ptr [0x396], sp
027a:0781 7705           ja 0x788
027a:0783 9a621f0000     lcall __OVERFLOW
027a:0788 a1e013         mov ax, word ptr [0x13e0]
027a:078b 40             inc ax
027a:078c 3b065f01       cmp ax, word ptr [0x15f]
027a:0790 7c02           jl 0x794
027a:0792 eb3b           jmp 0x7cf
027a:0794 0e             push cs
027a:0795 e837fa         call 0x1cf
027a:0798 ff06e013       inc word ptr [0x13e0]
027a:079c ff06dc13       inc word ptr [0x13dc]
027a:07a0 833edc131f     cmp word ptr [0x13dc], 0x1f
027a:07a5 7e24           jle 0x7cb
027a:07a7 c706dc131a00   mov word ptr [0x13dc], 0x1a
027a:07ad a15f01         mov ax, word ptr [0x15f]
027a:07b0 2b06e013       sub ax, word ptr [0x13e0]
027a:07b4 3d0500         cmp ax, 5
027a:07b7 7f05           jg 0x7be
027a:07b9 832edc1305     sub word ptr [0x13dc], 5
027a:07be 6a20           push 0x20
027a:07c0 6a00           push 0
027a:07c2 6a00           push 0
027a:07c4 0e             push cs
027a:07c5 e890fc         call 0x458
027a:07c8 83c406         add sp, 6
027a:07cb 0e             push cs
027a:07cc e800fa         call 0x1cf
027a:07cf 5d             pop bp
027a:07d0 cb             retf 
027a:07d1 55             push bp
027a:07d2 8bec           mov bp, sp
027a:07d4 39269603       cmp word ptr [0x396], sp
027a:07d8 7705           ja 0x7df
027a:07da 9a621f0000     lcall __OVERFLOW
027a:07df 833ee01300     cmp word ptr [0x13e0], 0
027a:07e4 7502           jne 0x7e8
027a:07e6 eb2f           jmp 0x817
027a:07e8 0e             push cs
027a:07e9 e8e3f9         call 0x1cf
027a:07ec 832ee0131f     sub word ptr [0x13e0], 0x1f
027a:07f1 a1e013         mov ax, word ptr [0x13e0]
027a:07f4 3b06dc13       cmp ax, word ptr [0x13dc]
027a:07f8 7f0c           jg 0x806
027a:07fa c706dc130000   mov word ptr [0x13dc], 0
027a:0800 c706e0130000   mov word ptr [0x13e0], 0
027a:0806 6a20           push 0x20
027a:0808 6a00           push 0
027a:080a 6a00           push 0
027a:080c 0e             push cs
027a:080d e848fc         call 0x458
027a:0810 83c406         add sp, 6
027a:0813 0e             push cs
027a:0814 e8b8f9         call 0x1cf
027a:0817 5d             pop bp
027a:0818 cb             retf 
027a:0819 55             push bp
027a:081a 8bec           mov bp, sp
027a:081c 56             push si
027a:081d 39269603       cmp word ptr [0x396], sp
027a:0821 7705           ja 0x828
027a:0823 9a621f0000     lcall __OVERFLOW
027a:0828 a1e013         mov ax, word ptr [0x13e0]
027a:082b 3b065f01       cmp ax, word ptr [0x15f]
027a:082f 7c02           jl 0x833
027a:0831 eb61           jmp 0x894
027a:0833 0e             push cs
027a:0834 e898f9         call 0x1cf
027a:0837 8306e0131f     add word ptr [0x13e0], 0x1f
027a:083c a1e013         mov ax, word ptr [0x13e0]
027a:083f 3b065f01       cmp ax, word ptr [0x15f]
027a:0843 7c3e           jl 0x883
027a:0845 832ee0131f     sub word ptr [0x13e0], 0x1f
027a:084a a15f01         mov ax, word ptr [0x15f]
027a:084d 2b06e013       sub ax, word ptr [0x13e0]
027a:0851 48             dec ax
027a:0852 8bf0           mov si, ax
027a:0854 0136e013       add word ptr [0x13e0], si
027a:0858 0136dc13       add word ptr [0x13dc], si
027a:085c 833edc131f     cmp word ptr [0x13dc], 0x1f
027a:0861 7e1a           jle 0x87d
027a:0863 c706dc131f00   mov word ptr [0x13dc], 0x1f
027a:0869 a15f01         mov ax, word ptr [0x15f]
027a:086c 48             dec ax
027a:086d a3e013         mov word ptr [0x13e0], ax
027a:0870 6a20           push 0x20
027a:0872 6a00           push 0
027a:0874 6a00           push 0
027a:0876 0e             push cs
027a:0877 e8defb         call 0x458
027a:087a 83c406         add sp, 6
027a:087d 0e             push cs
027a:087e e84ef9         call 0x1cf
027a:0881 eb11           jmp 0x894
027a:0883 6a20           push 0x20
027a:0885 6a00           push 0
027a:0887 6a00           push 0
027a:0889 0e             push cs
027a:088a e8cbfb         call 0x458
027a:088d 83c406         add sp, 6
027a:0890 0e             push cs
027a:0891 e83bf9         call 0x1cf
027a:0894 5e             pop si
027a:0895 5d             pop bp
027a:0896 cb             retf 
027a:0897 55             push bp
027a:0898 8bec           mov bp, sp
027a:089a 39269603       cmp word ptr [0x396], sp
027a:089e 7705           ja 0x8a5
027a:08a0 9a621f0000     lcall __OVERFLOW
027a:08a5 0e             push cs
027a:08a6 e826f9         call 0x1cf
027a:08a9 a1da13         mov ax, word ptr [0x13da]
027a:08ac 3b06de13       cmp ax, word ptr [0x13de]
027a:08b0 7512           jne 0x8c4
027a:08b2 c706da130000   mov word ptr [0x13da], 0
027a:08b8 c706de130000   mov word ptr [0x13de], 0
027a:08be 0e             push cs
027a:08bf e80df9         call 0x1cf
027a:08c2 eb1d           jmp 0x8e1
027a:08c4 c706da130000   mov word ptr [0x13da], 0
027a:08ca c706de130000   mov word ptr [0x13de], 0
027a:08d0 6a20           push 0x20
027a:08d2 6a00           push 0
027a:08d4 6a00           push 0
027a:08d6 0e             push cs
027a:08d7 e87efb         call 0x458
027a:08da 83c406         add sp, 6
027a:08dd 0e             push cs
027a:08de e8eef8         call 0x1cf
027a:08e1 5d             pop bp
027a:08e2 cb             retf 
027a:08e3 55             push bp
027a:08e4 8bec           mov bp, sp
027a:08e6 56             push si
027a:08e7 39269603       cmp word ptr [0x396], sp
027a:08eb 7705           ja 0x8f2
027a:08ed 9a621f0000     lcall __OVERFLOW
027a:08f2 8b1ee013       mov bx, word ptr [0x13e0]
027a:08f6 c1e302         shl bx, 2
027a:08f9 ffb7740a       push word ptr [bx + 0xa74]
027a:08fd ffb7720a       push word ptr [bx + 0xa72]
027a:0901 9aef180000     lcall strlen
027a:0906 59             pop cx
027a:0907 59             pop cx
027a:0908 8bf0           mov si, ax
027a:090a 3b36de13       cmp si, word ptr [0x13de]
027a:090e 7502           jne 0x912
027a:0910 eb58           jmp 0x96a
027a:0912 0e             push cs
027a:0913 e8b9f8         call 0x1cf
027a:0916 3b36de13       cmp si, word ptr [0x13de]
027a:091a 7d09           jge 0x925
027a:091c a1de13         mov ax, word ptr [0x13de]
027a:091f 3b06da13       cmp ax, word ptr [0x13da]
027a:0923 740e           je 0x933
027a:0925 83fe4c         cmp si, 0x4c
027a:0928 7d17           jge 0x941
027a:092a a1de13         mov ax, word ptr [0x13de]
027a:092d 3b06da13       cmp ax, word ptr [0x13da]
027a:0931 750e           jne 0x941
027a:0933 8936de13       mov word ptr [0x13de], si
027a:0937 8936da13       mov word ptr [0x13da], si
027a:093b 0e             push cs
027a:093c e890f8         call 0x1cf
027a:093f eb29           jmp 0x96a
027a:0941 8936de13       mov word ptr [0x13de], si
027a:0945 8936da13       mov word ptr [0x13da], si
027a:0949 eb05           jmp 0x950
027a:094b 832eda130a     sub word ptr [0x13da], 0xa
027a:0950 833eda134c     cmp word ptr [0x13da], 0x4c
027a:0955 7ff4           jg 0x94b
027a:0957 6a20           push 0x20
027a:0959 6a00           push 0
027a:095b 6a00           push 0
027a:095d 0e             push cs
027a:095e e8f7fa         call 0x458
027a:0961 83c406         add sp, 6
027a:0964 0e             push cs
027a:0965 e867f8         call 0x1cf
027a:0968 eb00           jmp 0x96a
027a:096a 5e             pop si
027a:096b 5d             pop bp
027a:096c cb             retf 
027a:096d c8060000       enter 6, 0
027a:0971 56             push si
027a:0972 57             push di
027a:0973 39269603       cmp word ptr [0x396], sp
027a:0977 7705           ja 0x97e
027a:0979 9a621f0000     lcall __OVERFLOW
027a:097e 6a00           push 0
027a:0980 9a660b7a02     lcall 027a:0b66
027a:0985 59             pop cx
027a:0986 98             cwde 
027a:0987 0bc0           or ax, ax
027a:0989 7503           jne 0x98e
027a:098b e93d01         jmp 0xacb
027a:098e 33f6           xor si, si
027a:0990 1e             push ds
027a:0991 688e01         push 0x18e
027a:0994 1e             push ds
027a:0995 686101         push 0x161  ; 'LOAD FILE           '
027a:0998 9a92070000     lcall fopen
027a:099d 83c408         add sp, 8
027a:09a0 8956fe         mov word ptr [bp - 2], dx
027a:09a3 8946fc         mov word ptr [bp - 4], ax
027a:09a6 0bc2           or ax, dx
027a:09a8 7503           jne 0x9ad
027a:09aa e91e01         jmp 0xacb
027a:09ad 0e             push cs
027a:09ae e834f7         call 0xe5
027a:09b1 e9c300         jmp 0xa77
027a:09b4 a15f01         mov ax, word ptr [0x15f]
027a:09b7 48             dec ax
027a:09b8 3d5802         cmp ax, 0x258
027a:09bb 7c03           jl 0x9c0
027a:09bd e9c500         jmp 0xa85
027a:09c0 8b1e5f01       mov bx, word ptr [0x15f]
027a:09c4 4b             dec bx
027a:09c5 c1e302         shl bx, 2
027a:09c8 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:09cc 0b87740a       or ax, word ptr [bx + 0xa74]
027a:09d0 7536           jne 0xa08
027a:09d2 68ce00         push 0xce  ; 'Open and load a new file'
027a:09d5 9aad190000     lcall op_new
027a:09da 59             pop cx
027a:09db 8b1e5f01       mov bx, word ptr [0x15f]
027a:09df 4b             dec bx
027a:09e0 c1e302         shl bx, 2
027a:09e3 8997740a       mov word ptr [bx + 0xa74], dx
027a:09e7 8987720a       mov word ptr [bx + 0xa72], ax
027a:09eb 6a00           push 0
027a:09ed 68ce00         push 0xce  ; 'Open and load a new file'
027a:09f0 8b1e5f01       mov bx, word ptr [0x15f]
027a:09f4 4b             dec bx
027a:09f5 c1e302         shl bx, 2
027a:09f8 ffb7740a       push word ptr [bx + 0xa74]
027a:09fc ffb7720a       push word ptr [bx + 0xa72]
027a:0a00 9a3d150000     lcall setmem
027a:0a05 83c408         add sp, 8
027a:0a08 ff76fe         push word ptr [bp - 2]
027a:0a0b ff76fc         push word ptr [bp - 4]
027a:0a0e 9a8d120000     lcall fgetc
027a:0a13 59             pop cx
027a:0a14 59             pop cx
027a:0a15 8846fb         mov byte ptr [bp - 5], al
027a:0a18 807efb0a       cmp byte ptr [bp - 5], 0xa
027a:0a1c 750c           jne 0xa2a
027a:0a1e c646fb00       mov byte ptr [bp - 5], 0
027a:0a22 33f6           xor si, si
027a:0a24 ff065f01       inc word ptr [0x15f]
027a:0a28 eb4d           jmp 0xa77
027a:0a2a 807efb09       cmp byte ptr [bp - 5], 9
027a:0a2e 7528           jne 0xa58
027a:0a30 8bc6           mov ax, si
027a:0a32 050600         add ax, 6
027a:0a35 7421           je 0xa58
027a:0a37 33ff           xor di, di
027a:0a39 eb16           jmp 0xa51
027a:0a3b 8b1e5f01       mov bx, word ptr [0x15f]
027a:0a3f 4b             dec bx
027a:0a40 c1e302         shl bx, 2
027a:0a43 c49f720a       les bx, ptr [bx + 0xa72]
027a:0a47 8bc6           mov ax, si
027a:0a49 46             inc si
027a:0a4a 03d8           add bx, ax
027a:0a4c 26c60720       mov byte ptr es:[bx], 0x20
027a:0a50 47             inc di
027a:0a51 83ff06         cmp di, 6
027a:0a54 7ce5           jl 0xa3b
027a:0a56 eb1f           jmp 0xa77
027a:0a58 8b1e5f01       mov bx, word ptr [0x15f]
027a:0a5c 4b             dec bx
027a:0a5d c1e302         shl bx, 2
027a:0a60 c49f720a       les bx, ptr [bx + 0xa72]
027a:0a64 8a46fb         mov al, byte ptr [bp - 5]
027a:0a67 268800         mov byte ptr es:[bx + si], al
027a:0a6a 46             inc si
027a:0a6b 81fec800       cmp si, 0xc8
027a:0a6f 7e06           jle 0xa77
027a:0a71 33f6           xor si, si
027a:0a73 ff065f01       inc word ptr [0x15f]
027a:0a77 c45efc         les bx, ptr [bp - 4]
027a:0a7a 26f747022000   test word ptr es:[bx + 2], 0x20
027a:0a80 7503           jne 0xa85
027a:0a82 e92fff         jmp 0x9b4
027a:0a85 6a01           push 1
027a:0a87 68c201         push 0x1c2
027a:0a8a 687602         push 0x276
027a:0a8d 6a46           push 0x46
027a:0a8f 6a0a           push 0xa
027a:0a91 9a180f9b03     lcall setviewport
027a:0a96 83c40a         add sp, 0xa
027a:0a99 6a20           push 0x20
027a:0a9b 6a00           push 0
027a:0a9d 6a00           push 0
027a:0a9f 0e             push cs
027a:0aa0 e8b5f9         call 0x458
027a:0aa3 83c406         add sp, 6
027a:0aa6 0e             push cs
027a:0aa7 e825f7         call 0x1cf
027a:0aaa 6a01           push 1
027a:0aac 68df01         push 0x1df
027a:0aaf 687f02         push 0x27f
027a:0ab2 6a00           push 0
027a:0ab4 6a00           push 0
027a:0ab6 9a180f9b03     lcall setviewport
027a:0abb 83c40a         add sp, 0xa
027a:0abe ff76fe         push word ptr [bp - 2]
027a:0ac1 ff76fc         push word ptr [bp - 4]
027a:0ac4 9afe030000     lcall fclose
027a:0ac9 59             pop cx
027a:0aca 59             pop cx
027a:0acb 5f             pop di
027a:0acc 5e             pop si
027a:0acd c9             leave 
027a:0ace cb             retf 
027a:0acf c8060000       enter 6, 0
027a:0ad3 56             push si
027a:0ad4 57             push di
027a:0ad5 39269603       cmp word ptr [0x396], sp
027a:0ad9 7705           ja 0xae0
027a:0adb 9a621f0000     lcall __OVERFLOW
027a:0ae0 6a01           push 1
027a:0ae2 9a660b7a02     lcall 027a:0b66
027a:0ae7 59             pop cx
027a:0ae8 98             cwde 
027a:0ae9 0bc0           or ax, ax
027a:0aeb 7502           jne 0xaef
027a:0aed eb73           jmp 0xb62
027a:0aef 1e             push ds
027a:0af0 689101         push 0x191
027a:0af3 1e             push ds
027a:0af4 686101         push 0x161  ; 'LOAD FILE           '
027a:0af7 9a92070000     lcall fopen
027a:0afc 83c408         add sp, 8
027a:0aff 8956fe         mov word ptr [bp - 2], dx
027a:0b02 8946fc         mov word ptr [bp - 4], ax
027a:0b05 0bc2           or ax, dx
027a:0b07 7502           jne 0xb0b
027a:0b09 eb57           jmp 0xb62
027a:0b0b 33ff           xor di, di
027a:0b0d eb40           jmp 0xb4f
027a:0b0f 33f6           xor si, si
027a:0b11 eb35           jmp 0xb48
027a:0b13 8bdf           mov bx, di
027a:0b15 c1e302         shl bx, 2
027a:0b18 c49f720a       les bx, ptr [bx + 0xa72]
027a:0b1c 268a00         mov al, byte ptr es:[bx + si]
027a:0b1f 8846fb         mov byte ptr [bp - 5], al
027a:0b22 807efb00       cmp byte ptr [bp - 5], 0
027a:0b26 7504           jne 0xb2c
027a:0b28 c646fb0a       mov byte ptr [bp - 5], 0xa
027a:0b2c ff76fe         push word ptr [bp - 2]
027a:0b2f ff76fc         push word ptr [bp - 4]
027a:0b32 8a46fb         mov al, byte ptr [bp - 5]
027a:0b35 98             cwde 
027a:0b36 50             push ax
027a:0b37 9ae1090000     lcall fputc
027a:0b3c 83c406         add sp, 6
027a:0b3f 807efb0a       cmp byte ptr [bp - 5], 0xa
027a:0b43 7502           jne 0xb47
027a:0b45 eb07           jmp 0xb4e
027a:0b47 46             inc si
027a:0b48 81fecc00       cmp si, 0xcc
027a:0b4c 7ec5           jle 0xb13
027a:0b4e 47             inc di
027a:0b4f 3b3e5f01       cmp di, word ptr [0x15f]
027a:0b53 7cba           jl 0xb0f
027a:0b55 ff76fe         push word ptr [bp - 2]
027a:0b58 ff76fc         push word ptr [bp - 4]
027a:0b5b 9afe030000     lcall fclose
027a:0b60 59             pop cx
027a:0b61 59             pop cx
027a:0b62 5f             pop di
027a:0b63 5e             pop si
027a:0b64 c9             leave 
027a:0b65 cb             retf 
027a:0b66 c80c0000       enter 0xc, 0
027a:0b6a 56             push si
027a:0b6b 39269603       cmp word ptr [0x396], sp
027a:0b6f 7705           ja 0xb76
027a:0b71 9a621f0000     lcall __OVERFLOW
027a:0b76 c746fe0000     mov word ptr [bp - 2], 0
027a:0b7b 682201         push 0x122
027a:0b7e 68a401         push 0x1a4
027a:0b81 68be00         push 0xbe
027a:0b84 68dc00         push 0xdc
027a:0b87 9a17159b03     lcall imagesize
027a:0b8c 83c408         add sp, 8
027a:0b8f 8946fc         mov word ptr [bp - 4], ax
027a:0b92 ff76fc         push word ptr [bp - 4]
027a:0b95 9a131c0000     lcall malloc
027a:0b9a 59             pop cx
027a:0b9b 8956fa         mov word ptr [bp - 6], dx
027a:0b9e 8946f8         mov word ptr [bp - 8], ax
027a:0ba1 ff76fa         push word ptr [bp - 6]
027a:0ba4 ff76f8         push word ptr [bp - 8]
027a:0ba7 682201         push 0x122
027a:0baa 68a401         push 0x1a4
027a:0bad 68be00         push 0xbe
027a:0bb0 68dc00         push 0xdc
027a:0bb3 9abc209b03     lcall getimage
027a:0bb8 83c40c         add sp, 0xc
027a:0bbb 6a0f           push 0xf
027a:0bbd 6a01           push 1
027a:0bbf 9a30129b03     lcall setfillstyle
027a:0bc4 59             pop cx
027a:0bc5 59             pop cx
027a:0bc6 681801         push 0x118
027a:0bc9 68a401         push 0x1a4
027a:0bcc 68be00         push 0xbe
027a:0bcf 68dc00         push 0xdc
027a:0bd2 9a881c9b03     lcall bar
027a:0bd7 83c408         add sp, 8
027a:0bda 6a00           push 0
027a:0bdc 9ab21d9b03     lcall setcolor
027a:0be1 59             pop cx
027a:0be2 681801         push 0x118
027a:0be5 68a401         push 0x1a4
027a:0be8 68be00         push 0xbe
027a:0beb 68dc00         push 0xdc
027a:0bee 9abd119b03     lcall rectangle
027a:0bf3 83c408         add sp, 8
027a:0bf6 68d300         push 0xd3
027a:0bf9 68a401         push 0x1a4
027a:0bfc 68be00         push 0xbe
027a:0bff 68dc00         push 0xdc
027a:0c02 9abd119b03     lcall rectangle
027a:0c07 83c408         add sp, 8
027a:0c0a 6a01           push 1
027a:0c0c 6a01           push 1
027a:0c0e 9a30129b03     lcall setfillstyle
027a:0c13 59             pop cx
027a:0c14 59             pop cx
027a:0c15 68d200         push 0xd2
027a:0c18 68a301         push 0x1a3
027a:0c1b 68bf00         push 0xbf  ; 'Exit   Alt-X'
027a:0c1e 68dd00         push 0xdd
027a:0c21 9a881c9b03     lcall bar
027a:0c26 83c408         add sp, 8
027a:0c29 6a0f           push 0xf
027a:0c2b 9ab21d9b03     lcall setcolor
027a:0c30 59             pop cx
027a:0c31 837e0600       cmp word ptr [bp + 6], 0
027a:0c35 7514           jne 0xc4b
027a:0c37 1e             push ds
027a:0c38 689401         push 0x194  ; 'LOAD FILE'
027a:0c3b 68c500         push 0xc5
027a:0c3e 682201         push 0x122
027a:0c41 9a801f9b03     lcall outtextxy
027a:0c46 83c408         add sp, 8
027a:0c49 eb12           jmp 0xc5d
027a:0c4b 1e             push ds
027a:0c4c 689e01         push 0x19e  ; 'SAVE FILE'
027a:0c4f 68c500         push 0xc5
027a:0c52 682201         push 0x122
027a:0c55 9a801f9b03     lcall outtextxy
027a:0c5a 83c408         add sp, 8
027a:0c5d 6a00           push 0
027a:0c5f 9ab21d9b03     lcall setcolor
027a:0c64 59             pop cx
027a:0c65 1e             push ds
027a:0c66 68a801         push 0x1a8  ; 'Enter file name here'
027a:0c69 68e600         push 0xe6
027a:0c6c 68f000         push 0xf0
027a:0c6f 9a801f9b03     lcall outtextxy
027a:0c74 83c408         add sp, 8
027a:0c77 1e             push ds
027a:0c78 68bd01         push 0x1bd  ; 'Name :'
027a:0c7b 68fe00         push 0xfe
027a:0c7e 68f000         push 0xf0
027a:0c81 9a801f9b03     lcall outtextxy
027a:0c86 83c408         add sp, 8
027a:0c89 6a08           push 8
027a:0c8b 6a01           push 1
027a:0c8d 9a30129b03     lcall setfillstyle
027a:0c92 59             pop cx
027a:0c93 59             pop cx
027a:0c94 680801         push 0x108
027a:0c97 689001         push 0x190
027a:0c9a 68fb00         push 0xfb
027a:0c9d 682401         push 0x124
027a:0ca0 9a881c9b03     lcall bar
027a:0ca5 83c408         add sp, 8
027a:0ca8 33f6           xor si, si
027a:0caa eb06           jmp 0xcb2
027a:0cac c684610100     mov byte ptr [si + 0x161], 0  ; 'LOAD FILE           '
027a:0cb1 46             inc si
027a:0cb2 83fe14         cmp si, 0x14
027a:0cb5 7ef5           jle 0xcac
027a:0cb7 c746f60000     mov word ptr [bp - 0xa], 0
027a:0cbc 33f6           xor si, si
027a:0cbe e9a800         jmp 0xd69
027a:0cc1 6a00           push 0
027a:0cc3 9af3100000     lcall bioskey
027a:0cc8 59             pop cx
027a:0cc9 8946f6         mov word ptr [bp - 0xa], ax
027a:0ccc 817ef60d1c     cmp word ptr [bp - 0xa], 0x1c0d
027a:0cd1 7515           jne 0xce8
027a:0cd3 0bf6           or si, si
027a:0cd5 7507           jne 0xcde
027a:0cd7 c746fe0000     mov word ptr [bp - 2], 0
027a:0cdc eb05           jmp 0xce3
027a:0cde c746fe0100     mov word ptr [bp - 2], 1
027a:0ce3 c746f60100     mov word ptr [bp - 0xa], 1
027a:0ce8 817ef61b01     cmp word ptr [bp - 0xa], 0x11b
027a:0ced 750a           jne 0xcf9
027a:0cef c746fe0000     mov word ptr [bp - 2], 0
027a:0cf4 c746f60100     mov word ptr [bp - 0xa], 1
027a:0cf9 817ef6080e     cmp word ptr [bp - 0xa], 0xe08
027a:0cfe 750f           jne 0xd0f
027a:0d00 0bf6           or si, si
027a:0d02 7e0b           jle 0xd0f
027a:0d04 c684600100     mov byte ptr [si + 0x160], 0
027a:0d09 4e             dec si
027a:0d0a c746f60000     mov word ptr [bp - 0xa], 0
027a:0d0f 50             push ax
027a:0d10 8b46f6         mov ax, word ptr [bp - 0xa]
027a:0d13 8846f5         mov byte ptr [bp - 0xb], al
027a:0d16 58             pop ax
027a:0d17 807ef500       cmp byte ptr [bp - 0xb], 0
027a:0d1b 7413           je 0xd30
027a:0d1d 807ef501       cmp byte ptr [bp - 0xb], 1
027a:0d21 740d           je 0xd30
027a:0d23 83fe0d         cmp si, 0xd
027a:0d26 7d08           jge 0xd30
027a:0d28 8a46f5         mov al, byte ptr [bp - 0xb]
027a:0d2b 88846101       mov byte ptr [si + 0x161], al  ; 'LOAD FILE           '
027a:0d2f 46             inc si
027a:0d30 6a08           push 8
027a:0d32 6a01           push 1
027a:0d34 9a30129b03     lcall setfillstyle
027a:0d39 59             pop cx
027a:0d3a 59             pop cx
027a:0d3b 680801         push 0x108
027a:0d3e 689001         push 0x190
027a:0d41 68fb00         push 0xfb
027a:0d44 682401         push 0x124
027a:0d47 9a881c9b03     lcall bar
027a:0d4c 83c408         add sp, 8
027a:0d4f 6a0e           push 0xe
027a:0d51 9ab21d9b03     lcall setcolor
027a:0d56 59             pop cx
027a:0d57 1e             push ds
027a:0d58 686101         push 0x161  ; 'LOAD FILE           '
027a:0d5b 68fe00         push 0xfe
027a:0d5e 682901         push 0x129
027a:0d61 9a801f9b03     lcall outtextxy
027a:0d66 83c408         add sp, 8
027a:0d69 837ef601       cmp word ptr [bp - 0xa], 1
027a:0d6d 7403           je 0xd72
027a:0d6f e94fff         jmp 0xcc1
027a:0d72 6a00           push 0
027a:0d74 ff76fa         push word ptr [bp - 6]
027a:0d77 ff76f8         push word ptr [bp - 8]
027a:0d7a 68be00         push 0xbe
027a:0d7d 68dc00         push 0xdc
027a:0d80 9a48159b03     lcall putimage
027a:0d85 83c40a         add sp, 0xa
027a:0d88 ff76fa         push word ptr [bp - 6]
027a:0d8b ff76f8         push word ptr [bp - 8]
027a:0d8e 9a2d1b0000     lcall free
027a:0d93 59             pop cx
027a:0d94 59             pop cx
027a:0d95 8a46fe         mov al, byte ptr [bp - 2]
027a:0d98 eb00           jmp 0xd9a
027a:0d9a 5e             pop si
027a:0d9b c9             leave 
027a:0d9c cb             retf 
027a:0d9d c8020000       enter 2, 0
027a:0da1 56             push si
027a:0da2 57             push di
027a:0da3 39269603       cmp word ptr [0x396], sp
027a:0da7 7705           ja 0xdae
027a:0da9 9a621f0000     lcall __OVERFLOW
027a:0dae 833ede1300     cmp word ptr [0x13de], 0
027a:0db3 750a           jne 0xdbf
027a:0db5 833ee01300     cmp word ptr [0x13e0], 0
027a:0dba 7503           jne 0xdbf
027a:0dbc e97e01         jmp 0xf3d
027a:0dbf 833ede1300     cmp word ptr [0x13de], 0
027a:0dc4 7403           je 0xdc9
027a:0dc6 e90201         jmp 0xecb
027a:0dc9 8b1ee013       mov bx, word ptr [0x13e0]
027a:0dcd c1e302         shl bx, 2
027a:0dd0 ffb7740a       push word ptr [bx + 0xa74]
027a:0dd4 ffb7720a       push word ptr [bx + 0xa72]
027a:0dd8 9aef180000     lcall strlen
027a:0ddd 59             pop cx
027a:0dde 59             pop cx
027a:0ddf 8bf0           mov si, ax
027a:0de1 8b1ee013       mov bx, word ptr [0x13e0]
027a:0de5 4b             dec bx
027a:0de6 c1e302         shl bx, 2
027a:0de9 ffb7740a       push word ptr [bx + 0xa74]
027a:0ded ffb7720a       push word ptr [bx + 0xa72]
027a:0df1 9aef180000     lcall strlen
027a:0df6 59             pop cx
027a:0df7 59             pop cx
027a:0df8 8bf8           mov di, ax
027a:0dfa 8bc6           mov ax, si
027a:0dfc 03c7           add ax, di
027a:0dfe 3dcc00         cmp ax, 0xcc
027a:0e01 7c03           jl 0xe06
027a:0e03 e93701         jmp 0xf3d
027a:0e06 8bc6           mov ax, si
027a:0e08 40             inc ax
027a:0e09 50             push ax
027a:0e0a 8b1ee013       mov bx, word ptr [0x13e0]
027a:0e0e c1e302         shl bx, 2
027a:0e11 ffb7740a       push word ptr [bx + 0xa74]
027a:0e15 ffb7720a       push word ptr [bx + 0xa72]
027a:0e19 8b1ee013       mov bx, word ptr [0x13e0]
027a:0e1d 4b             dec bx
027a:0e1e c1e302         shl bx, 2
027a:0e21 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0e25 03c7           add ax, di
027a:0e27 ffb7740a       push word ptr [bx + 0xa74]
027a:0e2b 50             push ax
027a:0e2c 9ad2150000     lcall memmove
027a:0e31 83c40a         add sp, 0xa
027a:0e34 ff0e5f01       dec word ptr [0x15f]
027a:0e38 8b1ee013       mov bx, word ptr [0x13e0]
027a:0e3c c1e302         shl bx, 2
027a:0e3f 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0e43 0b87740a       or ax, word ptr [bx + 0xa74]
027a:0e47 7416           je 0xe5f
027a:0e49 8b1ee013       mov bx, word ptr [0x13e0]
027a:0e4d c1e302         shl bx, 2
027a:0e50 ffb7740a       push word ptr [bx + 0xa74]
027a:0e54 ffb7720a       push word ptr [bx + 0xa72]
027a:0e58 9a71190000     lcall op_delete
027a:0e5d 59             pop cx
027a:0e5e 59             pop cx
027a:0e5f 8b36e013       mov si, word ptr [0x13e0]
027a:0e63 eb1c           jmp 0xe81
027a:0e65 8bde           mov bx, si
027a:0e67 43             inc bx
027a:0e68 c1e302         shl bx, 2
027a:0e6b 8b87740a       mov ax, word ptr [bx + 0xa74]
027a:0e6f 8b97720a       mov dx, word ptr [bx + 0xa72]
027a:0e73 8bde           mov bx, si
027a:0e75 c1e302         shl bx, 2
027a:0e78 8987740a       mov word ptr [bx + 0xa74], ax
027a:0e7c 8997720a       mov word ptr [bx + 0xa72], dx
027a:0e80 46             inc si
027a:0e81 3b365f01       cmp si, word ptr [0x15f]
027a:0e85 7cde           jl 0xe65
027a:0e87 8b1e5f01       mov bx, word ptr [0x15f]
027a:0e8b c1e302         shl bx, 2
027a:0e8e c787740a0000   mov word ptr [bx + 0xa74], 0
027a:0e94 c787720a0000   mov word ptr [bx + 0xa72], 0
027a:0e9a 893ede13       mov word ptr [0x13de], di
027a:0e9e 893eda13       mov word ptr [0x13da], di
027a:0ea2 eb05           jmp 0xea9
027a:0ea4 832eda130a     sub word ptr [0x13da], 0xa
027a:0ea9 833eda134c     cmp word ptr [0x13da], 0x4c
027a:0eae 7df4           jge 0xea4
027a:0eb0 0e             push cs
027a:0eb1 e81bf3         call 0x1cf
027a:0eb4 6a20           push 0x20
027a:0eb6 6a00           push 0
027a:0eb8 6a00           push 0
027a:0eba 0e             push cs
027a:0ebb e89af5         call 0x458
027a:0ebe 83c406         add sp, 6
027a:0ec1 0e             push cs
027a:0ec2 e80af3         call 0x1cf
027a:0ec5 0e             push cs
027a:0ec6 e85ff8         call 0x728
027a:0ec9 eb72           jmp 0xf3d
027a:0ecb 0e             push cs
027a:0ecc e800f3         call 0x1cf
027a:0ecf 8b1ee013       mov bx, word ptr [0x13e0]
027a:0ed3 c1e302         shl bx, 2
027a:0ed6 ffb7740a       push word ptr [bx + 0xa74]
027a:0eda ffb7720a       push word ptr [bx + 0xa72]
027a:0ede 9aef180000     lcall strlen
027a:0ee3 59             pop cx
027a:0ee4 59             pop cx
027a:0ee5 8946fe         mov word ptr [bp - 2], ax
027a:0ee8 ff76fe         push word ptr [bp - 2]
027a:0eeb 8b1ee013       mov bx, word ptr [0x13e0]
027a:0eef c1e302         shl bx, 2
027a:0ef2 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0ef6 0306de13       add ax, word ptr [0x13de]
027a:0efa ffb7740a       push word ptr [bx + 0xa74]
027a:0efe 50             push ax
027a:0eff 8b1ee013       mov bx, word ptr [0x13e0]
027a:0f03 c1e302         shl bx, 2
027a:0f06 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0f0a 0306de13       add ax, word ptr [0x13de]
027a:0f0e 48             dec ax
027a:0f0f ffb7740a       push word ptr [bx + 0xa74]
027a:0f13 50             push ax
027a:0f14 9ad2150000     lcall memmove
027a:0f19 83c40a         add sp, 0xa
027a:0f1c 833eda1300     cmp word ptr [0x13da], 0
027a:0f21 7e12           jle 0xf35
027a:0f23 6a01           push 1
027a:0f25 ff36dc13       push word ptr [0x13dc]
027a:0f29 a1da13         mov ax, word ptr [0x13da]
027a:0f2c 48             dec ax
027a:0f2d 50             push ax
027a:0f2e 0e             push cs
027a:0f2f e826f5         call 0x458
027a:0f32 83c406         add sp, 6
027a:0f35 0e             push cs
027a:0f36 e896f2         call 0x1cf
027a:0f39 0e             push cs
027a:0f3a e831f7         call 0x66e
027a:0f3d 5f             pop di
027a:0f3e 5e             pop si
027a:0f3f c9             leave 
027a:0f40 cb             retf 
027a:0f41 55             push bp
027a:0f42 8bec           mov bp, sp
027a:0f44 56             push si
027a:0f45 57             push di
027a:0f46 39269603       cmp word ptr [0x396], sp
027a:0f4a 7705           ja 0xf51
027a:0f4c 9a621f0000     lcall __OVERFLOW
027a:0f51 8b1ee013       mov bx, word ptr [0x13e0]
027a:0f55 c1e302         shl bx, 2
027a:0f58 ffb7740a       push word ptr [bx + 0xa74]
027a:0f5c ffb7720a       push word ptr [bx + 0xa72]
027a:0f60 9aef180000     lcall strlen
027a:0f65 59             pop cx
027a:0f66 59             pop cx
027a:0f67 8bf0           mov si, ax
027a:0f69 8b1ee013       mov bx, word ptr [0x13e0]
027a:0f6d 43             inc bx
027a:0f6e c1e302         shl bx, 2
027a:0f71 ffb7740a       push word ptr [bx + 0xa74]
027a:0f75 ffb7720a       push word ptr [bx + 0xa72]
027a:0f79 9aef180000     lcall strlen
027a:0f7e 59             pop cx
027a:0f7f 59             pop cx
027a:0f80 8bf8           mov di, ax
027a:0f82 3936de13       cmp word ptr [0x13de], si
027a:0f86 750d           jne 0xf95
027a:0f88 a15f01         mov ax, word ptr [0x15f]
027a:0f8b 48             dec ax
027a:0f8c 3b06e013       cmp ax, word ptr [0x13e0]
027a:0f90 7503           jne 0xf95
027a:0f92 e91401         jmp 0x10a9
027a:0f95 3936de13       cmp word ptr [0x13de], si
027a:0f99 7403           je 0xf9e
027a:0f9b e9bf00         jmp 0x105d
027a:0f9e 8bc6           mov ax, si
027a:0fa0 03c7           add ax, di
027a:0fa2 3dcc00         cmp ax, 0xcc
027a:0fa5 7c03           jl 0xfaa
027a:0fa7 e9ff00         jmp 0x10a9
027a:0faa 8bc7           mov ax, di
027a:0fac 40             inc ax
027a:0fad 50             push ax
027a:0fae 8b1ee013       mov bx, word ptr [0x13e0]
027a:0fb2 43             inc bx
027a:0fb3 c1e302         shl bx, 2
027a:0fb6 ffb7740a       push word ptr [bx + 0xa74]
027a:0fba ffb7720a       push word ptr [bx + 0xa72]
027a:0fbe 8b1ee013       mov bx, word ptr [0x13e0]
027a:0fc2 c1e302         shl bx, 2
027a:0fc5 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0fc9 0306de13       add ax, word ptr [0x13de]
027a:0fcd ffb7740a       push word ptr [bx + 0xa74]
027a:0fd1 50             push ax
027a:0fd2 9ad2150000     lcall memmove
027a:0fd7 83c40a         add sp, 0xa
027a:0fda ff0e5f01       dec word ptr [0x15f]
027a:0fde 8b1ee013       mov bx, word ptr [0x13e0]
027a:0fe2 43             inc bx
027a:0fe3 c1e302         shl bx, 2
027a:0fe6 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:0fea 0b87740a       or ax, word ptr [bx + 0xa74]
027a:0fee 7417           je 0x1007
027a:0ff0 8b1ee013       mov bx, word ptr [0x13e0]
027a:0ff4 43             inc bx
027a:0ff5 c1e302         shl bx, 2
027a:0ff8 ffb7740a       push word ptr [bx + 0xa74]
027a:0ffc ffb7720a       push word ptr [bx + 0xa72]
027a:1000 9a71190000     lcall op_delete
027a:1005 59             pop cx
027a:1006 59             pop cx
027a:1007 a1e013         mov ax, word ptr [0x13e0]
027a:100a 40             inc ax
027a:100b 8bf0           mov si, ax
027a:100d eb1c           jmp 0x102b
027a:100f 8bde           mov bx, si
027a:1011 43             inc bx
027a:1012 c1e302         shl bx, 2
027a:1015 8b87740a       mov ax, word ptr [bx + 0xa74]
027a:1019 8b97720a       mov dx, word ptr [bx + 0xa72]
027a:101d 8bde           mov bx, si
027a:101f c1e302         shl bx, 2
027a:1022 8987740a       mov word ptr [bx + 0xa74], ax
027a:1026 8997720a       mov word ptr [bx + 0xa72], dx
027a:102a 46             inc si
027a:102b 3b365f01       cmp si, word ptr [0x15f]
027a:102f 7cde           jl 0x100f
027a:1031 8b1e5f01       mov bx, word ptr [0x15f]
027a:1035 c1e302         shl bx, 2
027a:1038 c787740a0000   mov word ptr [bx + 0xa74], 0
027a:103e c787720a0000   mov word ptr [bx + 0xa72], 0
027a:1044 0e             push cs
027a:1045 e887f1         call 0x1cf
027a:1048 6a20           push 0x20
027a:104a ff36dc13       push word ptr [0x13dc]
027a:104e 6a00           push 0
027a:1050 0e             push cs
027a:1051 e804f4         call 0x458
027a:1054 83c406         add sp, 6
027a:1057 0e             push cs
027a:1058 e874f1         call 0x1cf
027a:105b eb4c           jmp 0x10a9
027a:105d 0e             push cs
027a:105e e86ef1         call 0x1cf
027a:1061 8bc6           mov ax, si
027a:1063 40             inc ax
027a:1064 50             push ax
027a:1065 8b1ee013       mov bx, word ptr [0x13e0]
027a:1069 c1e302         shl bx, 2
027a:106c 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:1070 0306de13       add ax, word ptr [0x13de]
027a:1074 40             inc ax
027a:1075 ffb7740a       push word ptr [bx + 0xa74]
027a:1079 50             push ax
027a:107a 8b1ee013       mov bx, word ptr [0x13e0]
027a:107e c1e302         shl bx, 2
027a:1081 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:1085 0306de13       add ax, word ptr [0x13de]
027a:1089 ffb7740a       push word ptr [bx + 0xa74]
027a:108d 50             push ax
027a:108e 9ad2150000     lcall memmove
027a:1093 83c40a         add sp, 0xa
027a:1096 6a01           push 1
027a:1098 ff36dc13       push word ptr [0x13dc]
027a:109c 6a00           push 0
027a:109e 0e             push cs
027a:109f e8b6f3         call 0x458
027a:10a2 83c406         add sp, 6
027a:10a5 0e             push cs
027a:10a6 e826f1         call 0x1cf
027a:10a9 5f             pop di
027a:10aa 5e             pop si
027a:10ab 5d             pop bp
027a:10ac cb             retf 
027a:10ad 55             push bp
027a:10ae 8bec           mov bp, sp
027a:10b0 56             push si
027a:10b1 39269603       cmp word ptr [0x396], sp
027a:10b5 7705           ja 0x10bc
027a:10b7 9a621f0000     lcall __OVERFLOW
027a:10bc a15f01         mov ax, word ptr [0x15f]
027a:10bf 48             dec ax
027a:10c0 3b06e013       cmp ax, word ptr [0x13e0]
027a:10c4 7503           jne 0x10c9
027a:10c6 e98100         jmp 0x114a
027a:10c9 0e             push cs
027a:10ca e802f1         call 0x1cf
027a:10cd ff0e5f01       dec word ptr [0x15f]
027a:10d1 8b1ee013       mov bx, word ptr [0x13e0]
027a:10d5 c1e302         shl bx, 2
027a:10d8 8b87720a       mov ax, word ptr [bx + 0xa72]
027a:10dc 0b87740a       or ax, word ptr [bx + 0xa74]
027a:10e0 7416           je 0x10f8
027a:10e2 8b1ee013       mov bx, word ptr [0x13e0]
027a:10e6 c1e302         shl bx, 2
027a:10e9 ffb7740a       push word ptr [bx + 0xa74]
027a:10ed ffb7720a       push word ptr [bx + 0xa72]
027a:10f1 9a71190000     lcall op_delete
027a:10f6 59             pop cx
027a:10f7 59             pop cx
027a:10f8 8b36e013       mov si, word ptr [0x13e0]
027a:10fc eb1c           jmp 0x111a
027a:10fe 8bde           mov bx, si
027a:1100 43             inc bx
027a:1101 c1e302         shl bx, 2
027a:1104 8b87740a       mov ax, word ptr [bx + 0xa74]
027a:1108 8b97720a       mov dx, word ptr [bx + 0xa72]
027a:110c 8bde           mov bx, si
027a:110e c1e302         shl bx, 2
027a:1111 8987740a       mov word ptr [bx + 0xa74], ax
027a:1115 8997720a       mov word ptr [bx + 0xa72], dx
027a:1119 46             inc si
027a:111a 3b365f01       cmp si, word ptr [0x15f]
027a:111e 7cde           jl 0x10fe
027a:1120 8b1e5f01       mov bx, word ptr [0x15f]
027a:1124 c1e302         shl bx, 2
027a:1127 c787740a0000   mov word ptr [bx + 0xa74], 0
027a:112d c787720a0000   mov word ptr [bx + 0xa72], 0
027a:1133 6a20           push 0x20
027a:1135 ff36dc13       push word ptr [0x13dc]
027a:1139 6a00           push 0
027a:113b 0e             push cs
027a:113c e819f3         call 0x458
027a:113f 83c406         add sp, 6
027a:1142 0e             push cs
027a:1143 e889f0         call 0x1cf
027a:1146 0e             push cs
027a:1147 e84df7         call 0x897
027a:114a 5e             pop si
027a:114b 5d             pop bp
027a:114c cb             retf 
027a:114d 55             push bp
027a:114e 8bec           mov bp, sp
027a:1150 39269603       cmp word ptr [0x396], sp
027a:1154 7705           ja 0x115b
027a:1156 9a621f0000     lcall __OVERFLOW
027a:115b 0e             push cs
027a:115c e870f0         call 0x1cf
027a:115f a1de13         mov ax, word ptr [0x13de]
027a:1162 3b06da13       cmp ax, word ptr [0x13da]
027a:1166 7523           jne 0x118b
027a:1168 a1e013         mov ax, word ptr [0x13e0]
027a:116b 3b06dc13       cmp ax, word ptr [0x13dc]
027a:116f 751a           jne 0x118b
027a:1171 c706de130000   mov word ptr [0x13de], 0
027a:1177 c706da130000   mov word ptr [0x13da], 0
027a:117d c706e0130000   mov word ptr [0x13e0], 0
027a:1183 c706dc130000   mov word ptr [0x13dc], 0
027a:1189 eb25           jmp 0x11b0
027a:118b c706e0130000   mov word ptr [0x13e0], 0
027a:1191 c706dc130000   mov word ptr [0x13dc], 0
027a:1197 c706de130000   mov word ptr [0x13de], 0
027a:119d c706da130000   mov word ptr [0x13da], 0
027a:11a3 6a20           push 0x20
027a:11a5 6a00           push 0
027a:11a7 6a00           push 0
027a:11a9 0e             push cs
027a:11aa e8abf2         call 0x458
027a:11ad 83c406         add sp, 6
027a:11b0 0e             push cs
027a:11b1 e81bf0         call 0x1cf
027a:11b4 5d             pop bp
027a:11b5 cb             retf 
027a:11b6 55             push bp
027a:11b7 8bec           mov bp, sp
027a:11b9 39269603       cmp word ptr [0x396], sp
027a:11bd 7705           ja 0x11c4
027a:11bf 9a621f0000     lcall __OVERFLOW
027a:11c4 0e             push cs
027a:11c5 e807f0         call 0x1cf
027a:11c8 c706de130000   mov word ptr [0x13de], 0
027a:11ce a15f01         mov ax, word ptr [0x15f]
027a:11d1 48             dec ax
027a:11d2 a3e013         mov word ptr [0x13e0], ax
027a:11d5 c706da130000   mov word ptr [0x13da], 0
027a:11db a15f01         mov ax, word ptr [0x15f]
027a:11de 48             dec ax
027a:11df a3dc13         mov word ptr [0x13dc], ax
027a:11e2 eb05           jmp 0x11e9
027a:11e4 832edc1305     sub word ptr [0x13dc], 5
027a:11e9 833edc131f     cmp word ptr [0x13dc], 0x1f
027a:11ee 7ff4           jg 0x11e4
027a:11f0 6a20           push 0x20
027a:11f2 6a00           push 0
027a:11f4 6a00           push 0
027a:11f6 0e             push cs
027a:11f7 e85ef2         call 0x458
027a:11fa 83c406         add sp, 6
027a:11fd 0e             push cs
027a:11fe e8ceef         call 0x1cf
027a:1201 5d             pop bp
027a:1202 cb             retf 
