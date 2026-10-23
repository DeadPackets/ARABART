// Smooth wheel scrolling on desktop only. Off for touch and for reduced motion.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { RM } from './tier';

export function smooth(): Lenis | null {
  if (RM || !matchMedia('(pointer: fine)').matches) return null;
  const lenis = new Lenis({ autoRaf: true, anchors: { offset: -48 } });
  (window as unknown as { lenis: Lenis }).lenis = lenis;
  return lenis;
}
