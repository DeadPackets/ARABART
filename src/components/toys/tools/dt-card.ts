// Steps for the card routine (MAIN.EXE 2529:0B23): reverse 8 bits with SHR and RCL, write the card, read it back.
const bin = (v: number) => v.toString(2).padStart(8, '0').replace(/^(....)/, '$1 ');
const h = (v: number) => v.toString(16).padStart(2, '0').toUpperCase() + 'h';

export function cardSteps(p: number) {
  const steps: { a: number; c: number; say: string; regs: { name: string; value: string; means: string; changed?: boolean }[]; vis: object }[] = [];
  let ax = p & 0xff, bx = 0, carry = 0, cx = 8, axn = 0, bxn = 0, port: number | null = null;
  const push = (a: number, c: number, say: string, shift: '' | 'ax' | 'bx', ch: string[] = []) => steps.push({
    a, c, say,
    regs: [
      { name: 'AX', value: bin(ax), means: 'the pattern, losing a bit each turn', changed: ch.includes('AX') },
      { name: 'BX', value: bin(bx), means: 'the same bits, reversed', changed: ch.includes('BX') },
      { name: 'CF', value: String(carry), means: 'the carry flag: one bit in transit', changed: ch.includes('CF') },
      { name: 'CX', value: String(cx), means: 'turns left', changed: ch.includes('CX') },
    ],
    vis: { ax, bx, carry, axn, bxn, shift, port },
  });
  push(0, 0, `The test pattern is <b>${bin(p)}</b>: one bit for each input of the circuit.`, '', ['AX']);
  push(3, 1, `Eight turns, and <b>BX</b> starts empty. It will collect the bits in the opposite order, to match the order of the card’s lines.`, '', ['BX', 'CX']);
  for (let k = 1; k <= 8; k++) {
    carry = ax & 1; ax >>= 1; axn = k;
    push(4, 3, `Turn ${k}: <code>SHR</code> pushes the lowest bit of AX, a <b>${carry}</b>, out into the carry flag.`, 'ax', ['AX', 'CF']);
    bx = ((bx << 1) | carry) & 0xff; bxn = k; cx--;
    push(5, 4, `<code>RCL</code> moves BX one place left and pulls the carry in on the right. BX is now <b>${bin(bx)}</b>.`, 'bx', ['BX', 'CX']);
  }
  port = bx;
  push(9, 6, `The reversed byte, <b>${h(bx)}</b>, goes out to port 301h. The card sets the circuit’s 8 inputs to it, like <code>digitalWrite()</code> on 8 pins of an Arduino.`, '');
  push(13, 7, `A second write goes to port 300h, the card’s other port.`, '');
  push(15, 9, `Then he reads port 300h 2,000 times and keeps only the last reading. The chips get time to settle, the way a web app debounces a button.`, '');
  push(17, 9, `That last reading is the circuit’s answer. Digi-Test compares it with what its simulation expects. If they differ, the guided probe takes over.`, '');
  return steps;
}
