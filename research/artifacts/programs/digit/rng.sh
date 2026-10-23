#!/bin/sh
# rng.sh SEG START END : print listing lines in [START, END] (hex offsets)
python3 -c "
import sys
s,a,b=sys.argv[1],int(sys.argv[2],16),int(sys.argv[3],16)
for l in open('dis/%s.txt'%s):
    o=int(l[5:9],16)
    if a<=o<=b: print(l,end='')
" "$@"
