# Decode Arabic text stored as Latin keystrokes of the standard Arabic (101) keyboard layout.
import sys, re
U = dict(zip("`qwertyuiop[]asdfghjkl;'zxcvnm,./", "ذضصثقفغعهخحجدشسيبلاتنمكطئءؤرىةوزظ"))
U['b'] = 'لا'
S = {'~': 'ّ', 'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'لإ', 'Y': 'إ', 'U': '‘', 'A': 'ِ', 'S': 'ٍ',
     'G': 'لأ', 'H': 'أ', 'J': 'ـ', 'K': '،', 'B': 'لآ', 'N': 'آ', 'X': 'ْ', 'P': '؛', '?': '؟', 'Z': '~', 'M': '’', 'F': '[', 'D': ']', 'L': '/'}
def dec(s):
    out = ''.join(S.get(c) or U.get(c) or c for c in s)
    return re.sub(r'\d+', lambda m: m.group()[::-1], out)  # digits stored reversed for RTL output
if __name__ == '__main__':
    assert dec('hgals') == 'الشمس' and dec('s,vm hGkuhl') == 'سورة الأنعام' and dec('@69') == '@96'
    for line in open(sys.argv[1], encoding='latin1'):
        off, _, s = line.rstrip('\n').partition(' ')
        if int(off, 16) < int(sys.argv[2], 16) or int(off, 16) > int(sys.argv[3], 16): continue
        print(off, dec(s), '   <=', s)
