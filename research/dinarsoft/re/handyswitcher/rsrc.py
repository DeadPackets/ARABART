import pefile, sys, os
T = {1:'CURSOR',2:'BITMAP',3:'ICON',4:'MENU',5:'DIALOG',6:'STRING',9:'ACCEL',10:'RCDATA',12:'GROUP_CURSOR',14:'GROUP_ICON',16:'VERSION',240:'DLGINIT',241:'TOOLBAR'}
def walk(pe):
    for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        tn = str(t.name) if t.name else T.get(t.id, t.id)
        for n in t.directory.entries:
            nn = str(n.name) if n.name else n.id
            for l in n.directory.entries:
                d = l.data.struct
                yield tn, nn, l.id, pe.get_data(d.OffsetToData, d.Size)
if __name__ == '__main__':
    for f in sys.argv[1:]:
        pe = pefile.PE(f)
        print('==', os.path.basename(f))
        for tn, nn, lang, data in walk(pe):
            print('  ', tn, nn, lang, len(data))
