// HijriDate 1.5's calendar engine, ported line for line from HijriPlugin.dll (ARM). Same operations, same order,
// same constants, single-precision where his code used float, so it gives his answer for every date.
// Proven against the DLL running in an ARM emulator: research/dinarsoft/re/hijridate/prove_calendar.py.

const f32 = Math.fround;
const RAD = 0.017453292519943295; // degrees to radians

/** The moment of new moon number n (0 = January 1900) as a Julian day, in the series from Jean Meeus. */
export function newMoon(n: number) {
  const k = 0 * 0.25 + n;
  const t = k * 0.0008085054776246109; // centuries since 1900: k / 1236.85 lunations
  const t2 = t * t, t3 = t2 * t;
  let jd = k * 29.53058868 + 2415020.75933 - t2 * 0.0001178 - t3 * 1.55e-7;
  jd = Math.sin((t * 132.87 + 166.56 - t2 * 0.009173) * RAD) * 0.00033 + jd;
  const sa = (k * 29.10535608 + 359.2242 - t2 * 3.33e-5 - t3 * 3.47e-6) * RAD; // the sun's place in its orbit
  const ma = (t3 * 1.236e-5 + k * 385.81691806 + t2 * 0.0107306 + 306.0253) * RAD; // the moon's place in its orbit
  const tf = (k * 390.67050646 + 21.2964 - t2 * 0.0016528 - t3 * 2.39e-6) * 0.03490658503988659; // twice its latitude angle
  const p = Math.sin(ma * 2 + sa) * 0.0005;
  let x = (0.1734 - t * 0.000393) * Math.sin(sa);
  x = x + Math.sin(sa * 2) * 0.0021;
  x = x - Math.sin(ma) * 0.4068;
  x = x + Math.sin(ma * 2) * 0.0161;
  x = x - Math.sin(ma * 3) * 0.0004;
  x = x + Math.sin(tf) * 0.0104;
  x = x - Math.sin(ma + sa) * 0.0051;
  x = x - Math.sin(sa - ma) * 0.0074;
  x = x + Math.sin(tf + sa) * 0.0004;
  x = x - Math.sin(tf - sa) * 0.0004;
  x = x - Math.sin(tf + ma) * 0.0006;
  x = p + x;
  x = x + Math.sin(tf - ma) * 0.001;
  const clock = (t2 * 0.4992 + t * 1.2053 + 0.41) * 0.0006944444444444445; // Earth's slowing spin, minutes to days
  const mean = jd;
  x = x - clock;
  return { k, mean, wobble: x + clock, clock, jd: x + jd };
}

/** visible(): the Julian day from which month n counts, by his Mecca rule. */
export function monthStart(n: number) {
  const m = newMoon(n), jd = m.jd;
  const frac = f32(jd - Math.trunc(jd)); // Julian days start at noon: frac 0 is 12:00 UT, 0.5 is midnight
  if (frac <= 0.5) return { ...m, frac, mecca: null as number | null, late: true, start: jd + 1 };
  const mecca = f32((frac - 0.5) * 24 + 3); // hours after midnight in Mecca (UT+3)
  return { ...m, frac, mecca, late: mecca > 6, start: mecca > 6 ? jd + 1 : jd };
}

/** julianday(): days since 4713 BC for a date at 00:00 UT, with the switch to the Gregorian calendar in October 1582. */
export function julianDay(year: number, month: number, day: number, time = 0) {
  if (year < 0) year++;
  const [iy, im] = month > 2 ? [year, month] : [year - 1, month + 12];
  let t = iy * 365.25;
  if (iy < 1) t = t - 0.75;
  const a = Math.trunc((im + 1) * -30.6001);
  let jd = f32(f32(Math.trunc(t) - a + day) + f32(time)) + 1720994.5;
  if (f32(f32(day) + f32(time)) * 0.0001 + month * 0.01 + year >= 1582.1015) {
    const ia = Math.trunc(iy * 0.01);
    jd = jd + 2 - ia + Math.trunc(ia * 0.25);
  }
  return jd;
}

const MLEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** The crescent adjustment (-2 to +2 days), applied to the Gregorian date before converting, as his code does. */
export function shift(y: number, m: number, d: number, adjust: number) {
  d += adjust;
  const leap = y % 4 === 0 ? 12 : 0;
  const len = MLEN[leap + m - 1];
  if (d > len) {
    d -= len;
    if (++m > 12) { m = 1; y++; }
  } else if (d <= 0) {
    if (--m === 0) { m = 12; y--; }
    d = MLEN[leap + m - 1] + d + 1;
  }
  return [y, m, d] as const;
}

/** Gregorian to Hijri, exactly as HijriDate 1.5 computes the Today screen date. */
export function toHijri(year: number, month: number, day: number, adjust = 0) {
  const [y, m, d] = shift(year, month, day, adjust);
  const jd = julianDay(y, m, d, 0);
  const guess = Math.trunc((Math.trunc(m - 0.5) * 0.08333333333333333 + d * 0.0027397260273972603 + y - 1900) * 12.3685 + 0.6);
  const tried: ReturnType<typeof monthStart>[] = [];
  let n = guess, s: ReturnType<typeof monthStart>;
  do { s = monthStart(n); tried.push(s); n--; } while (!(s.start <= jd));
  const idx = n - 1047; // new moon 1048 opened Muharram 1405 (September 1984)
  let hy = 1405 + Math.trunc(idx / 12), hm = (idx % 12) + 1;
  if (idx !== 0 && hm <= 0) { hm += 12; hy--; }
  if (hy <= 0) hy--;
  return { hy, hm, hd: Math.trunc(jd - s.start + 1), jd, guess, lunation: n + 1, tried, shifted: [y, m, d] as const };
}

export const HIJRI_EN = ['MuHarram', 'Safar', 'Raby`al-awal', 'Raby`al-Thany', 'Jumada al-awal', 'Jumada al-Thany', 'Rajab', 'Sha`baan', 'Ramadan', 'Shawwal', 'Thw al-Qi`dah', 'Thw al-Hijjah'];
export const GREG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const BABYLONIAN_EN = ['Second Kanoon', 'Shbat', 'Azar', 'Nissan', 'Ayyar', 'Hzeyran', 'Tammooz', 'Ab', 'Aylool', 'Tishreen 1', 'Tishreen 2', 'Kanoon 1'];
export const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
