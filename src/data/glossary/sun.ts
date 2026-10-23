import type { Term } from '../glossary';

export default {
  'map-mask': {
    term: 'Map Mask register',
    short: 'A setting on the EGA and VGA graphics card that picks which of its four color layers the next write lands in. Set it to 1, 2, 4 or 8 and one write fills one layer.',
    now: 'Like writing only the red channel of an image, or only its alpha.',
  },
  sprite: {
    term: 'Sprite',
    short: 'A small picture drawn once, kept in memory, and copied to a new place on the screen every frame, so it travels across the screen.',
    now: 'An image you drawImage onto a canvas, or a sprite in any 2D game engine.',
  },
  'game-loop': {
    term: 'Game loop',
    short: 'The loop that drives an animation: draw the frame, move everything a little, check the keyboard, go again.',
    now: 'requestAnimationFrame in a browser.',
  },
  fpu: {
    term: 'Math coprocessor (8087)',
    short: 'A second chip that did math with decimals, such as sine and cosine, in hardware. Most PCs of the time did not have one.',
    now: 'Built into every computer and phone processor today.',
  },
  'float-emulator': {
    term: 'Floating-point emulator',
    short: 'Code Borland added to a program to do the math chip’s work in software on PCs without one. The compiler marks every decimal operation, and at run time the emulator either does it in code or hands it to the real chip.',
    now: 'Software floating point on small microcontrollers that have no hardware for decimals.',
  },
  'stack-frame': {
    term: 'Stack frame',
    short: 'How a C function finds its arguments: the caller puts them on the stack, and the function reads them from fixed places beside its return address.',
    now: 'Every compiled language still does this; today the first few arguments usually travel in registers.',
  },
  'dosbox-cycles': {
    term: 'DOSBox cycles',
    short: 'A DOSBox setting for how many instructions the emulated processor runs each millisecond. A low, fixed number makes an old program run at about the speed of an old PC.',
    now: 'Like CPU throttling in the browser’s developer tools.',
  },
} satisfies Record<string, Term>;
