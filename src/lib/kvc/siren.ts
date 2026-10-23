// KVC's Koko alarm, rebuilt from its code (KVC.EXE 0000:080C-083E).
// KVC sets PC speaker timer channel 2 to square-wave mode and loads divisor 1000, then 1600, in turn:
// 20 tones with no gap, each held by `mov cx,0FF00h / loop $` (65,280 passes of LOOP).
// The pitch comes from the timer's 1,193,182 Hz clock, so it is exact. The length depends on the CPU.

export const PIT_HZ = 1_193_182;
export const DIVISORS = [1000, 1600] as const; // 1193.2 Hz then 745.7 Hz; the high tone is first
export const TONES = 20;
export const LOOP_PASSES = 0xff00;
// Assumed: a 10 MHz 286, where LOOP takes 10 clocks (1 µs a pass). The site's DOSBox setting
// (fixed 1000 cycles) runs this loop at the same speed, so the page and the live demo match.
export const TONE_MS = LOOP_PASSES / 1000; // 65.28 ms, 1.31 s for all 20

export function createSiren({ toneMs = TONE_MS, volume = 0.15 } = {}) {
  let ctx: AudioContext | null = null;
  let live: { osc: OscillatorNode; gain: GainNode } | null = null;

  function stop() {
    if (!live || !ctx) return;
    const t = ctx.currentTime;
    live.gain.gain.cancelScheduledValues(t);
    live.gain.gain.setTargetAtTime(0, t, 0.004);
    live.osc.stop(t + 0.03);
  }

  // Call from a click or key handler: browsers keep audio silent until the visitor acts.
  function play(): Promise<void> {
    if (navigator.userActivation?.isActive === false) {
      return Promise.reject(new Error("The siren starts only from a click or key press."));
    }
    stop();
    ctx ??= new AudioContext();
    void ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    const end = t0 + (TONES * toneMs) / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    for (let i = 0; i < TONES; i++) {
      osc.frequency.setValueAtTime(PIT_HZ / DIVISORS[i % 2], t0 + (i * toneMs) / 1000);
    }
    // 3 ms edges only stop the speaker pop; the tones themselves switch hard, as on the PC
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.003);
    gain.gain.setValueAtTime(volume, end - 0.003);
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(end);
    const me = (live = { osc, gain });
    return new Promise((resolve) => {
      osc.onended = () => {
        gain.disconnect();
        if (live === me) live = null;
        resolve();
      };
    });
  }

  // One steady tone from the timer chip: the pitch is PIT_HZ / divisor, as on the PC
  function tone(divisor: number, ms = 450): Promise<void> {
    stop();
    ctx ??= new AudioContext();
    void ctx.resume();
    const t0 = ctx.currentTime + 0.02, end = t0 + ms / 1000;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = PIT_HZ / divisor;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.003);
    gain.gain.setValueAtTime(volume, end - 0.003);
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(end);
    const me = (live = { osc, gain });
    return new Promise((resolve) => {
      osc.onended = () => {
        gain.disconnect();
        if (live === me) live = null;
        resolve();
      };
    });
  }

  return {
    play,
    stop,
    tone,
    get playing() {
      return live !== null;
    },
  };
}
