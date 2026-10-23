export type Era = 'dos' | 'win31' | 'win9x' | 'vs2005';

/** The four looks the site moves through, oldest first. when = [place, year] shown in the menu bar and tray. */
export const ERAS: Record<Era, { when: [string, string]; theme: string }> = {
  dos: { when: ['Port Said', '1991'], theme: '#0000aa' },
  win31: { when: ['Cairo', '1993'], theme: '#000080' },
  win9x: { when: ['Kanata', '1996'], theme: '#007070' },
  vs2005: { when: ['Kanata', '2002'], theme: '#dce6f4' },
};
export const ORDER: Era[] = ['dos', 'win31', 'win9x', 'vs2005'];
