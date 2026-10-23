// The 1991 commercial (ARABIC/DEMO.COM): his slide script, read the way his 152-byte player at CS:0113 reads it.
// File offset = CS offset - 100h. The script starts at CS:01EC; the scrambled credit sits at CS:01AB.
export interface Run { x: number; y: number; n: number; at: number }
export interface TextLine { slide: number; at: number; head: number[]; face: number; shade: number; shadow: boolean; row0: number; col0: number; runs: Run[]; end: number }
export interface Script { lines: TextLine[]; slides: TextLine[][]; size: number }

export const SCRIPT_AT = 0x1ec - 0x100, CREDIT_AT = 0x1ab - 0x100, CREDIT_LEN = 65;

export function parse(com: Uint8Array): Script {
  let si = SCRIPT_AT;
  const lines: TextLine[] = [], slides: TextLine[][] = [[]];
  for (;;) {
    const head = [...com.subarray(si, si + 5)], at = si;
    const row0 = com[si + 5] | (com[si + 6] << 8);
    let x = com[si + 7] | (com[si + 8] << 8), b = 0;
    si += 9;
    const sx = head[0] === 0x4b ? -1 : 1, sw = head[1] === 0x4b ? -1 : 1; // bytes copied over inc bx: 4Bh is dec bx
    const l: TextLine = { slide: slides.length, at, head, face: head[3], shade: head[4], shadow: head[2] === 0, row0, col0: x, runs: [], end: 0 };
    for (;;) {
      b = com[si++];
      if (b === 0x78) { x += sx; continue; }
      if (b === 0x77) { x += sw; continue; }
      if (b === 0x79 || b === 0x7a || b === 0x88) break;
      l.runs.push({ x, y: row0 + b, n: com[si], at: si - 1 });
      si++;
    }
    l.end = si;
    lines.push(l);
    slides[slides.length - 1].push(l);
    if (b === 0x7a) break;
    if (b === 0x88) slides.push([]);
  }
  return { lines, slides, size: si - SCRIPT_AT };
}

/** Paints runs the way his loop does: per pixel, the face color at (x, y), then the shadow at (x + 2, y + 2). */
export function paintRun(data: Uint8Array, w: number, h: number, l: TextLine, r: Run) {
  for (let k = 0, y = r.y; k < r.n; k++, y++) {
    if (r.x >= 0 && r.x < w && y >= 0 && y < h) data[y * w + r.x] = l.face;
    if (l.shadow && r.x + 2 < w && y + 2 < h) data[(y + 2) * w + r.x + 2] = l.shade;
  }
}

/** His credit, unscrambled: byte k minus (4 + k). */
export const decode = (bytes: ArrayLike<number>) => Array.from(bytes, (b, k) => (b - 4 - k) & 255);
export const encode = (bytes: ArrayLike<number>) => Array.from(bytes, (b, k) => (b + 4 + k) & 255);

export const SLIDES: [string, string][] = [
  ['بسم الله الرحمن الرحيم', 'In the name of God, the Most Gracious, the Most Merciful'],
  ['عضوية · مركز بورسعيد لخدمات الكمبيوتر', 'Membership · Port Said Center for Computer Services'],
  ['إنضم واستلم كارت العضوية', 'Join and get your membership card'],
  ['الآن · جنيه واحد فقط · تحصل على', 'Now, for one pound only, you get'],
  ['خصم عشرة بالمائة · من جميع خدماتنا', 'ten percent off all our services'],
  ['عند', 'when'],
  ['شراء أى نوع من أجهزة الكمبيوتر', 'buying any kind of computer'],
  ['شراء مستلزمات الكمبيوتر', 'buying computer supplies'],
  ['طباعة الرسائل بالألوان · بإستخدام أحدث الطابعات', 'printing letters in color, on the latest printers'],
  ['دورات تدريبيه فى جميع اللغات', 'training courses in every language'],
  ['الإنضمام لبنك المعلومات · للحصول على أحدث البرامج', 'joining the information bank, for the latest software'],
  ['خدمة تأجير أجهزة الكمبيوتر', 'computer rental'],
  ['مركز بورسعيد لخدمات الكمبيوتر', 'Port Said Center for Computer Services'],
  ['رجاء أن نكون دائما · عند حسن ظنكم بنا', 'We hope to always live up to your trust in us'],
  ['برمجة · ياسر محمد على', 'Programmed by Yasser Mohamed Ali'],
];
