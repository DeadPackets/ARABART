// Tiny highlighter for listings: the Borland editor's colors. Returns escaped HTML.
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const C_WORDS = /\b(for|while|do|if|else|return|break|continue|char|int|unsigned|long|void|struct|const)\b/g;

export function hl(code: string, lang: 'asm' | 'c' = 'asm') {
  const s = esc(code);
  if (lang === 'c') return s.replace(/\b(0x[0-9A-Fa-f]+|\d+)\b/g, '<span class="num">$1</span>').replace(C_WORDS, '<span class="op">$1</span>');
  return s.replace(/^(\s*)([a-z]+)\b/, '$1<span class="op">$2</span>').replace(/\b([0-9][0-9A-F]*h|\d+)\b/g, '<span class="num">$1</span>');
}
