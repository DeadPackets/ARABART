import sys,re
d=open(sys.argv[1],'rb').read()
n=int(sys.argv[2]) if len(sys.argv)>2 else 5
for m in re.finditer(rb'[\x20-\x7e\t\r\n]{%d,}'%n, d):
    s=m.group().decode('latin1').replace('\r','\\r').replace('\n','\\n')
    print(f'{m.start():06x} {s}')
