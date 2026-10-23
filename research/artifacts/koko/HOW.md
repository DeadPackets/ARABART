# How KVC caught Koko

Notes for the site writers. Every fact here comes from KVC's own code, its help screens, its README or the program story. Code addresses are in `README.md` and `research/programs.md`.

No antivirus of 1993 could see Koko. Yasser Awad and Ebrahim El-Etr took it apart by hand, learned its secrets, and used them against it. Yasser's verdict, from KVC's help screen: *"It is a funny virus, all its tricks are untricky."*

## What Koko did to a PC

- **It lived in memory.** Once you ran one infected program, Koko stayed loaded, like a background service, and infected every program the PC ran after that. On DOS, programs come in two kinds, COM and EXE, much like `.exe` and `.app` today. Koko infected both.
- **It had two dates.** On February 17 it showed a warning message. On July 29 it showed the message again and the data on the hard disk was lost, and so was the data on any floppy disk used that day.
- **It signed its work.** Every infected COM program starts with a few bytes of Koko's code followed by its name: `KoKo (1)`.
- **Nobody else caught it.** No commercial scanner detected it, so Yasser and Ebrahim wrote KVC, the KEMYAM Virus Capture.
- **It could not tell it was already there.** KVC's help screen notes that Koko loaded itself into memory again and again. KVC was ready for that too (see "Switching Koko off").

## How Koko hid in memory

A DOS program asks the system for everything (open a file, print text, start a program) through one door, called interrupt 21h. The very start of memory holds a table of 256 addresses, one per interrupt. "Call interrupt 21h" means "jump to the address in slot 21h". Think of it as one API endpoint that every program in the PC uses.

Koko wrote its own address into slot 21h, so every request passed through Koko first. It kept the real system address in slot 3, a slot that normally only debuggers use. In JavaScript terms, Koko monkey-patched the system:

```js
const realDos = slots[0x21];
slots[0x03] = realDos;                         // park the real address in slot 3
slots[0x21] = (request) => {                   // and stand in front of it
  if (request.ax === 0xFF0C) return 0xC0C1;    // the secret question gets the secret answer
  // ...infect the program that is starting...
  return realDos(request);
};
```

## The secret question

A virus that lives in memory needs a way to ask "am I already loaded?". Koko's question is the number `FF0C` sent to interrupt 21h. Koko answers `C0C1`. A clean PC has never heard of `FF0C` and does not give that answer.

KVC asks Koko's question every time it runs, before it scans anything. If the answer is `C0C1`, it prints **Found --KoKo (1) virus-- active in RAM** and sounds its alarm.

The same number marks Koko's EXE files: Koko set the starting stack pointer of every EXE it infected to `C0C1`, and that is the first thing KVC looks for in an EXE.

## Switching Koko off with its own hiding place

DOS has no task manager, so you cannot kill a program that sits in memory. KVC did something smarter. It used the hiding place Koko had made:

1. KVC talks to DOS through slot 3, where Koko parked the real address. Those calls skip Koko completely. KVC even prints its "Found" message this way, so Koko cannot touch it.
2. Through slot 3, it asks DOS for the address in slot 3: the real DOS address.
3. Through slot 3, it tells DOS to put that address back into slot 21h.

```js
slots[0x21] = slots[0x03];   // every program now reaches DOS directly
```

Koko's code is still in memory, but no program can reach it any more. It is frozen. KVC asks the secret question again, gets no answer, and prints **##### Virus Freezed #####**. Then it goes on to clean the disk.

If Koko still answers, a second copy of it was standing in front of the first. KVC sounds the alarm again and tells the user: the virus cannot be safely removed from memory, so after cleaning, turn the computer off and start it from a clean system disk.

## Rebuilding infected files

KVC walks every folder of the drive and checks every COM and EXE file. `/NS` scans one folder only, and `/NC` scans without cleaning.

Koko needed the original bytes of each program it infected, because it had to run that program after it ran itself. So it carried them inside its own body. KVC needed no backup: it put every file back together from what Koko carried.

**COM files.** Koko replaced the first 26 bytes with its jump-and-name stub and added its body to the end. Inside the body it kept the original 26 bytes and the original file size. KVC:

- checks 2 marks: Koko's stub and name at the start, and Koko's own restore code at a fixed place in the body;
- writes the original 26 bytes back, cuts the file to its original size, and puts back the file's date and time.

**EXE files.** Every EXE starts with a header that says where the program begins. Koko pointed that start at itself and set the stack pointer to `C0C1`. It kept the original values in its body. KVC:

- checks 4 marks: the `C0C1` stack pointer, Koko's jump at the start point, and two pieces of Koko's code deep inside the body;
- writes the original start and stack values back into the header, cuts the file where Koko began, and corrects the size the header records.

KVC clears the read-only flag before it writes, so protected files get cleaned too. And if a file shows Koko's first mark but not the rest, KVC does not touch it. It prints "Strange signeture, --> Please contact KEMYAM Computer Group." It repairs only what it fully recognizes.

## The alarm

KVC plays a two-tone siren on the PC speaker. The PC's timer chip ticks 1,193,182 times a second, and KVC tells it to make one full sound wave every 1,000 ticks, then every 1,600 ticks, in turn:

| | Value |
|---|---|
| Tones | 1,193 Hz and 746 Hz, high first |
| Pattern | 20 tones back to back, no gaps |
| Each tone | held for 65,280 turns of a counting loop |
| Length | 65 ms a tone, 1.3 s in all, on a 10 MHz 286 |

The pitch is exact on every PC, because the timer chip sets it. The length depends on the CPU: the same loop takes 4.7 s on the original 4.77 MHz IBM PC and 0.5 s on a 33 MHz 386. We use the 10 MHz 286 because Yasser's other programs are built for the 286, and it is the speed the site's emulator gives every program. `src/lib/kvc/siren.ts` plays it in the browser.

## The live demo

The `kvc-live` scene boots with Koko "in memory" and two infected programs on the disk. The visitor types `SCAN` (it runs `KVC C:`) and watches KVC find Koko, sound the alarm, freeze it and clean both files.

What is real and what is a stand-in:

- **KVC.EXE** is Yasser and Ebrahim's original program, byte for byte.
- **DOUBLE.COM** stands in for Koko in memory. It is 128 bytes. It answers the secret question and parks the DOS address in slot 3, and does nothing else.
- **HELLO.COM** and **GREET.EXE** carry Koko's marks in every place KVC checks, but contain no virus. If you run one, it prints one line and then runs the little program inside.
- **UNWRAP.COM** runs first, at boot. The two marked files are stored scrambled, so no file on the site holds Koko's bytes in plain form and no antivirus mistakes the site for the virus. UNWRAP puts them back inside the visitor's emulator, then the boot script deletes it.

After KVC is done, both files are identical to their clean originals, byte for byte. Press Restart to see it again.
