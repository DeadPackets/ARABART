# MemMaid's unlock key, rebuilt from its ARM code (see NOTES.md). Run it: python3 -I keymodel.py [pocket-pc-code]
# scramble(): 2.3 sub_6AB44, 1.72/1.73 sub_20DE8, 1.5a sub_20070. pocket_code(): 2.3 sub_6A9B0 (IOCTL_HAL_GET_DEVICEID).
import sys

def scramble(text, salt):
    """A small RC4 over 120 slots, keyed by the salt; each output is squeezed into 25 letters A..Z without O."""
    S = list(range(120))
    K = [ord(salt[i % len(salt)]) for i in range(120)] if salt else [0] * 120
    j = 0
    for i in range(120):
        j = (K[i] + S[i] + j) % 120
        S[i], S[j] = S[j], S[i]
    i = j = 0
    out = []
    for ch in text:
        i = (i + 1) % 120
        t = S[i]
        j = (t + j) % 120
        S[i], S[j] = S[j], S[i]
        v = (S[(S[i] + t) % 120] ^ ord(ch)) % 25 + 65
        out.append(chr(v + 1 if v >= ord('O') else v))
    return ''.join(out)

FALLBACK = '730007B6BFA373D1380000050BFE45CE5'  # used when the device will not give its ID

def pocket_code(preset_id: bytes | None, platform_id: bytes = b''):
    """The 16-letter 'Pocket PC Code' MemMaid shows: the device ID in hex, folded in half."""
    s = list((preset_id.hex() + platform_id.hex()).upper() if preset_id is not None else FALLBACK)
    for i in range(16):
        h = ord(s[i + 16]); h = h - 0x37 if h >= 0x41 else h - 0x30
        c = ord(s[i]) + h + 1
        if 0x39 < c < 0x41: c += 7
        if c >= ord('O'): c += 1
        s[i] = chr(c)
    return ''.join(s[:16])

# Per version: the salt for a device key (the first one the check tries) and the salt for the five built-in keys.
SCHEMES = {
    '1.5a': {'device': 'MemMaidII', 'builtin': 'MemMaid'},
    '1.72': {'device': 'MemMaidI', 'builtin': 'MemMaid'},
    '1.73': {'device': 'MemMaidI', 'builtin': 'MemMaid'},
    '2.3': {'device': 'MemMaid2', 'builtin': 'MemMaid2'},
}
GIVEAWAY = 'GIVEAWAYVERSION1'

def device_key(code, version): return scramble(code.replace('-', '').replace(' ', '').upper(), SCHEMES[version]['device'])
def giveaway_key(version): return scramble(GIVEAWAY, SCHEMES[version]['builtin'])

if __name__ == '__main__':
    assert len(scramble('ABCDEFGHIJKLMNOP', 'MemMaid2')) == 16 and 'O' not in scramble('A' * 400, 'x')
    for v in SCHEMES: print(v, 'giveaway key', giveaway_key(v))
    if len(sys.argv) > 1:
        for v in SCHEMES: print(v, 'key for', sys.argv[1], device_key(sys.argv[1], v))
    print('fallback code', pocket_code(None))
