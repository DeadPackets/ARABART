// Rebuild a Pocket PC dialog from its own resource (DLGTEMPLATE controls, extracted to dialogs.json) as HTML on a
// 240-pixel QVGA screen. Dialog units become pixels at 240/164 across and 1.6 down, the scale of a QVGA Pocket PC.
export interface Item { id: number; cls: string | number; text: string | number; x: number; y: number; w: number; h: number; style: number | string }
export interface Dlg { title: string; w: number; h: number; items: Item[] }

const X = 240 / 164, Y = 1.6;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** HTML for one dialog. pics maps a bitmap resource id to an image URL; custom(id) may return HTML for owner-drawn boxes. */
export function dialogHtml(d: Dlg, prefix: string, pics: Record<number, string> = {}, custom: (it: Item) => string | null = () => null) {
  const out: string[] = [];
  let grp = 0;
  for (const it of d.items) {
    const st = typeof it.style === 'string' ? parseInt(it.style, 16) : it.style;
    const pos = `left:${Math.round(it.x * X)}px;top:${Math.round(it.y * Y)}px;width:${Math.round(it.w * X)}px;height:${Math.round(it.h * Y)}px`;
    const id = it.id === 65535 ? '' : ` data-id="${it.id}" id="${prefix}-${it.id}"`;
    const hidden = st & 0x10000000 ? '' : ' hidden';
    const text = typeof it.text === 'string' ? esc(it.text).replace(/\n/g, '<br>') : '';
    const c = custom(it);
    if (c != null) { out.push(`<div class="hdt-c" style="${pos}"${id}${hidden}>${c}</div>`); continue; }
    if (it.cls === 'Static' && (st & 0x1f) === 0x0e) {
      const src = pics[Number(it.text)];
      out.push(src ? `<img class="hdt-c" style="${pos}" src="${src}" alt=""${id}>` : '');
    } else if (it.cls === 'Static') {
      const al = st & 1 ? 'center' : st & 2 ? 'right' : 'left';
      out.push(`<span class="hdt-c hdt-st" style="${pos};text-align:${al}"${id}${hidden}>${text}</span>`);
    } else if (it.cls === 'Button') {
      const kind = st & 0xf;
      if (kind === 7) out.push(`<fieldset class="hdt-c hdt-grp" style="${pos}"${id}><legend>${text}</legend></fieldset>`);
      else if (kind === 9 || kind === 4) {
        if (st & 0x20000) grp++; // WS_GROUP starts a new set of radio buttons
        out.push(`<label class="hdt-c hdt-opt" style="${pos}"${hidden}><input type="radio" name="${prefix}-g${grp}"${id}> ${text}</label>`);
      }
      else if (kind === 3 || kind === 2) out.push(`<label class="hdt-c hdt-opt" style="${pos}"${hidden}><input type="checkbox"${id}> ${text}</label>`);
      else out.push(`<button type="button" class="hdt-c hdt-btn" style="${pos}"${id}${hidden}>${text}</button>`);
    } else if (it.cls === 'Edit') {
      out.push(`<input class="hdt-c hdt-edit" style="${pos}" maxlength="9" autocomplete="off" spellcheck="false"${id} aria-label="Key, group ${it.id - 1003}">`);
    } else if (it.cls === 'ComboBox') {
      out.push(`<select class="hdt-c hdt-sel" style="left:${Math.round(it.x * X)}px;top:${Math.round(it.y * Y)}px;width:${Math.round(it.w * X)}px;height:20px"${id}></select>`);
    }
  }
  return `<div class="hdt-dlg" style="height:${Math.round(d.h * Y)}px">${out.join('')}</div>`;
}
