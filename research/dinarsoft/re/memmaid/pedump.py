# Sections, imports (coredll ordinals named from a text list) and resource tree of a WinCE ARM PE.
# Usage: python -I pedump.py <coredll_ord.txt> <pe>...
import sys, pefile
ords = dict(l.split(None, 1) for l in open(sys.argv[1]).read().splitlines())
for path in sys.argv[2:]:
    pe = pefile.PE(path)
    print(f'## {path}  machine={hex(pe.FILE_HEADER.Machine)} base={hex(pe.OPTIONAL_HEADER.ImageBase)} entry={hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint)} ts={pe.FILE_HEADER.TimeDateStamp} subsys={pe.OPTIONAL_HEADER.MajorSubsystemVersion}.{pe.OPTIONAL_HEADER.MinorSubsystemVersion}')
    for s in pe.sections: print(f'  {s.Name.rstrip(b"\0").decode():8} va={hex(s.VirtualAddress)} vs={hex(s.Misc_VirtualSize)} raw={hex(s.SizeOfRawData)}')
    for e in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', []):
        names = []
        for i in e.imports:
            n = i.name.decode() if i.name else (ords.get(str(i.ordinal), f'#{i.ordinal}') if e.dll.lower() == b'coredll.dll' else f'#{i.ordinal}')
            names.append(f'{n}@{hex(i.address)}')
        print(f'  import {e.dll.decode()} ({len(names)}): ' + ' '.join(names))
    for e in getattr(pe, 'DIRECTORY_ENTRY_EXPORT', None) and pe.DIRECTORY_ENTRY_EXPORT.symbols or []:
        print(f'  export {e.name} @{e.ordinal} {hex(e.address)}')
    if hasattr(pe, 'DIRECTORY_ENTRY_RESOURCE'):
        for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
            tn = pefile.RESOURCE_TYPE.get(t.id, str(t.name or t.id))
            items = []
            for n in t.directory.entries:
                for l in n.directory.entries:
                    items.append(f'{n.name or n.id}/{l.id}:{l.data.struct.Size}')
            print(f'  rsrc {tn} ({len(items)}): ' + ' '.join(items))
