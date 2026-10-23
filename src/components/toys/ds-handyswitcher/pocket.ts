// Rebuilds a Windows Mobile dialog from the template stored in the app's own resources (src/components/toys/ds-*/ui.json,
// pulled by research/dinarsoft/re/handyswitcher/extract_ui.py). Positions stay in dialog units; CSS scales them to the screen.
// Shared by the HandySwitcher, HandyMenu and HandyLauncher pages.

export interface Item { id: number; cls: string | number; text: string | number; style: number; r: [number, number, number, number] }
export interface Dialog { title: string; w: number; h: number; font: string | null; items: Item[] }
/** Per control id: what the running app would have put in it. */
export interface Fill {
  options?: string[];
  value?: string;
  checked?: boolean;
  rows?: { text: string; icon?: string; checked?: boolean }[];
  img?: string;
  hidden?: boolean;
  show?: boolean;
  attrs?: string;
  style?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const WS_VISIBLE = 0x10000000, WS_DISABLED = 0x08000000;

/** HTML for one dialog. idp keeps form ids unique when the same dialog shows twice on a page. */
export function renderDialog(d: Dialog, fill: Record<number, Fill> = {}, idp = 'd'): string {
  const out: string[] = [];
  let radio = 0;
  for (const it of d.items) {
    const f = fill[it.id] ?? {};
    const [x, y, w, h] = it.r;
    const shown = f.show || ((it.style & WS_VISIBLE) && !f.hidden);
    if (!shown) continue;
    const pos = `style="--x:${x};--y:${y};--w:${w};--h:${h}${f.style ? ";" + f.style : ""}"`;
    const dis = it.style & WS_DISABLED ? ' disabled' : '';
    const text = typeof it.text === 'string' ? it.text.replace(/&&/g, '\u0001').replace(/&/g, '').replace(/\u0001/g, '&') : '';
    const kind = it.style & 0xf;
    const uid = `${idp}-${it.id}-${x}-${y}`;
    const data = `data-id="${it.id}"${f.attrs ? ' ' + f.attrs : ''}`;
    switch (it.cls) {
      case 'STATIC':
        if (kind === 0xe || kind === 3) {
          out.push(f.img ? `<img class="ppc-img" ${pos} ${data} src="${f.img}" alt="">` : '');
        } else if (it.id === 9) {
          out.push(`<p class="ppc-head" ${pos} ${data}>${esc(f.value ?? text)}</p>`);
        } else {
          const al = kind === 1 ? ' c' : kind === 2 ? ' r' : '';
          out.push(`<p class="ppc-st${al}" ${pos} ${data}>${esc(f.value ?? text).replace(/\n/g, '<br>')}</p>`);
        }
        break;
      case 'BUTTON':
        if (kind === 7) out.push(`<span class="ppc-grp" ${pos} ${data} aria-hidden="true"></span>`);
        else if (kind === 2 || kind === 3 || kind === 5 || kind === 6)
          out.push(`<label class="ppc-chk" ${pos} ${data}><input type="checkbox"${f.checked ? ' checked' : ''}${dis}><span>${esc(text)}</span></label>`);
        else if (kind === 4 || kind === 9) {
          if (it.style & 0x20000 || !radio) radio++; // WS_GROUP starts a new radio group
          out.push(`<label class="ppc-chk ppc-rad" ${pos} ${data}><input type="radio" name="${idp}-r${radio}"${f.checked ? ' checked' : ''}${dis}><span>${esc(text)}</span></label>`);
        } else out.push(`<button type="button" class="ppc-btn${text ? '' : ' sw'}" ${pos} ${data}${dis}${text ? '' : ` aria-label="${esc(f.value ?? 'Color')}"`}>${esc(text)}</button>`);
        break;
      case 'EDIT':
        out.push(`<input class="ppc-ed" id="${uid}" ${pos} ${data} value="${esc(f.value ?? '')}" aria-label="${esc(f.value ?? 'Text box')}"${it.style & 8 ? ' autocapitalize="characters"' : ''}${dis} spellcheck="false" autocomplete="off">`);
        break;
      case 'COMBOBOX':
        out.push(`<select class="ppc-cb" ${pos} ${data} aria-label="${esc(f.value ?? 'Choice')}"${dis}>${(f.options ?? ['']).map(o => `<option>${esc(o)}</option>`).join('')}</select>`);
        break;
      case 'SCROLLBAR':
        out.push(`<span class="ppc-ud${it.style & 1 ? ' v' : ''}" ${pos} ${data} aria-hidden="true"><i>◂</i><i>▸</i></span>`);
        break;
      case 'SysListView32':
      case 'SysTreeView32':
        out.push(`<ul class="ppc-lv" ${pos} ${data}>${(f.rows ?? []).map(r => `<li>${r.checked != null ? `<input type="checkbox"${r.checked ? ' checked' : ''} aria-label="${esc(r.text)}">` : ''}${r.icon ? `<img src="${r.icon}" alt="">` : ''}<span>${esc(r.text)}</span></li>`).join('')}</ul>`);
        break;
    }
  }
  return `<div class="ppc-dlg" style="--dw:${d.w};--dh:${d.h}">${out.join('')}</div>`;
}
