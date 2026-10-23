import type { Term } from '../glossary';

// Terms for the DinarSoft pages
export default {
  'cab-file': {
    term: 'CAB file',
    short: 'The install package of a Pocket PC app: one compressed file with the program, its settings and where each part goes. Tap it on the device and it installs itself.',
    now: 'An .apk on Android, or an app download from a store.',
  },
  activesync: {
    term: 'ActiveSync',
    short: 'Microsoft’s desktop program that connected a Pocket PC to a Windows PC by cable or cradle, to sync mail and contacts and to install apps from the PC.',
    now: 'Plugging an iPhone into a computer to sync it, or the phone link apps of today.',
  },
  'device-emulator': {
    term: 'Device Emulator',
    short: 'Microsoft’s free program that runs a whole Pocket PC inside a window on a Windows PC, with its screen, buttons and storage card.',
    now: 'The Android Emulator in Android Studio, or the iOS Simulator in Xcode.',
  },
  'sha-256': {
    term: 'SHA-256',
    short: 'A fingerprint of a file: 64 characters computed from every byte. Change one byte and the fingerprint changes completely, so a match proves the file is identical.',
    now: 'The checksum next to a download, or the integrity hash in a package-lock.json.',
  },
} satisfies Record<string, Term>;
