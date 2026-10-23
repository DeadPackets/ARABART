# Shell

## Window

```astro
import Window from '../components/shell/Window.astro';

<Window title="CALL.ASM" kind="editor" active num={1} aria-labelledby="h-call">
  <h2 id="h-call">...</h2>
  <p>...</p>
  <p slot="status">F7 Step  F9 Run</p>
</Window>
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | string | required | Text in the title bar. Decoration only: put a real heading in the body if the window needs one. |
| `kind` | `editor` `dialog` `panel` `help` `screen` `device` | `editor` | Which chrome (table below). |
| `active` | boolean | `false` | Focused look: double frame in `dos`, colored title bar in the Windows eras. |
| `num` | string or number | none | Window number at the top right (`dos` only, like Borland's). In `device` it shows at the right of the title bar (use it for a clock). |
| `as` | `div` `section` `article` `aside` `figure` | `div` | The element. |
| `class`, any other attribute | | | Passed to the root (`id`, `aria-*`, `data-*`, `style`). |
| slot `status` | | | A status line under the body. Soft-key bar in `device`. |

The chrome follows the nearest ancestor with `data-era` (`dos`, `win31`, `win9x`, `vs2005`). Put `data-era` on the window itself to force one.

| kind | dos | win31 | win9x | vs2005 |
|---|---|---|---|---|
| `editor` | Borland editor: blue, yellow text, double frame when active | Notepad-like, white | Notepad-like, white, sunken | Tabbed document on the tab well |
| `dialog` | Borland dialog: gray, black text | Silver dialog, navy title | Silver dialog, title buttons | Windows XP Luna dialog, beige |
| `panel` | Norton Commander panel: cyan text, double frame, path highlighted when active | White group window | White pane | Tool window (Solution Explorer), blue caption when active |
| `help` | Borland help: cyan, black text | WinHelp, white | Pale yellow | Pale yellow tool window |
| `screen` | Black VGA screen, gray single frame | Black DOS box | Black MS-DOS Prompt | Black console, Luna title |
| `device` | Pocket PC with Windows Mobile 5 title and soft-key bars, the same in every era. Width up to 320 px. | | | |

Inside a window the semantic tokens are re-pointed for that window, so style content with them and it fits every kind and era:
`--surface --surface-2 --ink --ink-2 --accent --accent-2 --hot --good --rule --focus --btn-bg --btn-ink`.
Fonts: `--font-ui` (chrome), `--font-code`, `--font-display`, `--font-ar`, `--font-dos` (the IBM VGA 9x16 text-mode font: use it only at 16, 32 or 48 px, other sizes blur).

The body has no padding of its own in `dos` (the window has it); in the other eras `.win-body` carries the padding.
Use `.button` inside windows: it takes the era's button look.

## Eras

`<html data-era>` comes from the layout prop: `<BaseLayout era="win9x">` or `<ReadLayout era="vs2005">`. Default `dos`.
Any element can set its own `data-era`; the page tokens and every Window inside follow it.

The Joined palette (`--blue --blue-deep --night --yellow --cyan --cyan-dk --gray --green --red --black`) keeps its values on every page. `--ink --ink-2 --rule --hot` are now semantic: same values as before in `dos`, re-pointed in other eras and inside windows.
Raw colors for custom chrome: `--vga-0` to `--vga-15`, `--w-black --w-white --w-silver --w-gray --w-navy --w-teal`, `--xp-*`, `--vs-key --vs-comment --vs-string`.
