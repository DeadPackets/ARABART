// Turns the FORM_X port's step trace into what the live solver shows: the formula, the bracket being solved, the sum
// with his 20-digit numbers, and one plain sentence per step. Shared by the server render and the browser.
import { evaluate, type Tok, type Num } from '../../../lib/formx/formx';

export const PRESETS: [string, string, string][] = [
  ['(x-3)*(x+2)/7', '-1.5', '3'],
  ['x+3*x-10/x', '4', '13'],
  ['-(x*(x+1)-6)/4+x', '2.5', '7'],
  ['x*x', '10', '100'],
  ['0.1+0.2', '', ''],
  ['1/6', '', ''],
];

export interface View { main: string; scratch: string; calc: string; say: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const short = (v: string) => v.replace(/\.?0+$/, '').replace(/^-0$/, '0');
const show = (v: string) => short(v).replace('-', '−');
const sym = (o: string) => ({ '*': '×', '/': '÷', '-': '−', '+': '+' })[o] ?? o;
const chip = (t: Tok, cls = '') => t.kind === 'op' ? `<i class="o${cls}">${esc(t.op)}</i>` : `<i class="${cls.trim()}">${esc(short(t.value))}</i>`;
const chips = (ts: Tok[], mark: (k: number) => string = () => '') => ts.map((t, k) => chip(t, mark(k))).join('');
const none = '<span class="none">nothing yet</span>';

// His 20 bytes: 14 digits before the point, 6 after; leading zeros dimmed, a negative number tinted
function strip(n: Num) {
  const neg = +n.digits[0] > 4;
  const lead = neg ? -1 : n.digits.slice(0, 13).search(/[1-9]/);
  const cells = [...n.digits].map((d, i) => {
    const z = !neg && (lead < 0 ? i < 13 : i < lead) && d === '0';
    return `<span class="${[z && 'z', i >= 14 && 'f', i === 14 && 'p'].filter(Boolean).join(' ')}">${d}</span>`;
  });
  return `<div class="c-d${neg ? ' neg' : ''}" aria-label="${n.digits}">${cells.join('')}</div>`;
}
const row = (label: string, n: Num, cls = '') => `<div class="c-row ${cls}"><span>${label}</span>${strip(n)}</div>`;

export function views(formula: string, x: string): View[] {
  const { steps, printed } = evaluate(formula, x, true);
  const out: View[] = [];
  let main = '';
  for (const s of steps) {
    if (s.step === 'expand') {
      main = chips(s.tokens);
      out.push({
        main, scratch: none,
        calc: `<div class="c-eq">x = <b>${esc(show(s.x.value))}</b></div><div class="c-rows">${row('x stored', s.x)}</div>${+s.x.digits[0] > 4 ? '<p class="c-note">Negative numbers are stored the way a car’s odometer shows them after rolling back past zero: 9s at the front.</p>' : ''}`,
        say: `He copies your formula into his work area, inside one more pair of brackets of his own, and writes every number and every x as <b>20 digits</b>. ${/x/i.test(formula) ? `Here x is ${esc(show(s.x.value))}.` : ''}`,
      });
    } else if (s.step === 'fold') {
      main = chips(s.after);
      out.push({ main, scratch: none, calc: `<div class="c-rows">${row('was', s.operand)}${row('now', s.result, 'c-res')}</div>`, say: 'A minus right after an opening bracket: he stores that number as <b>negative</b> right away.' });
    } else if (s.step === 'bracket') {
      main = chips(s.tokens, k => (k >= s.start && k <= s.end ? ' in' : ''));
      const outer = s.start === 0 && s.end === s.tokens.length - 1;
      out.push({
        main, scratch: chips(s.inside),
        calc: `<div class="c-eq">${outer ? 'his own outer brackets' : `brackets inside: <b>${s.depth}</b> deep`}</div><p class="c-note">He reads from the left until the first closing bracket. That bracket has nothing inside it to wait for.</p>`,
        say: outer
          ? 'Only his own outer brackets are left. The whole formula is one <b>flat bracket</b> now.'
          : `He reads from the left to the first closing bracket. Its pair holds no other brackets, so he <b>solves it first</b>.`,
      });
    } else if (s.step === 'negate') {
      out.push({
        main, scratch: chips(s.after, k => (k === 0 ? ' res' : '')),
        calc: `<div class="c-eq">${esc(show(s.operand.value))} → <b>${esc(show(s.result.value))}</b></div><div class="c-rows">${row('flipped', s.result, 'c-res')}</div>`,
        say: `This bracket starts with a minus, so he flips the sign of its first number: <b>${esc(show(s.operand.value))} becomes ${esc(show(s.result.value))}</b>.`,
      });
    } else if (s.step === 'op') {
      const eq = `${esc(show(s.left.value))} ${sym(s.op)} ${esc(show(s.right.value))} = <b>${s.overflow ? 'too big' : esc(show(s.result.value))}</b>`;
      out.push({
        main, scratch: chips(s.after, k => (k === s.at - 1 ? ' res' : '')),
        calc: `<div class="c-eq">${eq}</div><div class="c-rows">${row('left', s.left)}${row('right', s.right)}${s.overflow ? '' : row('result', s.result, 'c-res')}</div>`,
        say: s.pass === 1
          ? `Times and divide come first, the leftmost one first: ${eq}. The result takes the place of both numbers and the sign.`
          : `No × or ÷ is left in this bracket, so now plus and minus, the leftmost one first: ${eq}.`,
      });
    } else if (s.step === 'replace') {
      main = chips(s.after, k => (k === s.at ? ' res' : ''));
      out.push({ main, scratch: none, calc: '<p class="c-note">Every number is exactly 20 bytes wide, so the bracket can be replaced without ever searching for where a number starts or ends.</p>', say: 'He writes the single number back over the whole bracket and closes the gap. <b>The formula just got shorter.</b>' });
    } else if (s.step === 'done') {
      out.push({
        main: s.result ? `<i class="res">${esc(short(s.result.value))}</i>` : '<i class="res">* OVERFLOW *</i>', scratch: none,
        calc: s.result ? `<div class="c-eq">his table prints <b>${esc(printed.trim())}</b></div><div class="c-rows">${row('answer', s.result, 'c-res')}</div>` : `<div class="c-eq"><b>${esc(printed.trim())}</b></div>`,
        say: s.result
          ? `One number is left: <b>the answer, ${esc(show(s.result.value))}</b>. His table prints it with 6 decimals.`
          : 'The answer does not fit, or it asks him to divide by zero, so his table prints <b>* OVERFLOW *</b> for this row and carries on.',
      });
    }
  }
  return out;
}
