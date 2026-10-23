/**
 * build-bundles.mjs
 *
 * Creates .jsdos bundles from the programs/ directory.
 * Each bundle is a ZIP containing program files + .jsdos/dosbox.conf
 * Output: public/bundles/{program-id}.jsdos
 */

import { createWriteStream, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve, basename } from "path";
import archiver from "archiver";

const ROOT = resolve(import.meta.dirname, "..");
const PROGRAMS_DIR = join(ROOT, "programs");
const OUTPUT_DIR = join(ROOT, "public", "bundles");
const ARABART_DIR = join(PROGRAMS_DIR, "ARABART");

// Program definitions matching src/data/programs.ts
const programs = [
  { id: "arabart-demo", folder: "ARABART", executable: "DEMO.EXE", needsArabart: true },
  { id: "arabart-editor", folder: "ARABART", executable: "EDITOR.EXE", needsArabart: true },
  { id: "arabart-commercial", folder: "ARABIC", executable: "DEMO.COM", needsArabart: false },
  { id: "digi-test", folder: "DIGI_T", executable: "MAIN.EXE", needsArabart: false },
  { id: "text-editor-gui", folder: "EDIT", executable: "EDIT.EXE", needsArabart: false },
  { id: "text-editor-demo", folder: "EDIT", executable: "EDITOR.EXE", needsArabart: false },
  { id: "formula-solver", folder: "FORM_X", executable: "FORM_X.EXE", needsArabart: false },
  { id: "kvc-antivirus", folder: "KVC", executable: "KVC.EXE", needsArabart: false },
  // Live demo scene (harmless Koko double + marked samples stored scrambled; UNWRAP.COM restores them at boot), files made by research/artifacts/koko/build.py
  { id: "kvc-live", folder: "KVC_LIVE", executable: "START.BAT", needsArabart: false },
  { id: "kemyam-splash", folder: "NAMES", executable: "NAMES.COM", needsArabart: false },
  { id: "arabic-basmallah", folder: "PESM", executable: "PESM.EXE", needsArabart: false },
  { id: "portsaid-cs-splash", folder: "PORTSAID", executable: "PORTSAID.EXE", needsArabart: false },
  { id: "portsaid-it-screensaver", folder: "SCREEN", executable: "SCREEN.COM", needsArabart: false },
  // SUN ships its own driver, ARAB-ART 7.15 with ARAB-ART.FNT; it refuses to install if ARABART 4.15 is already resident
  { id: "brave-sun", folder: "SUN", executable: "SUN.EXE", needsArabart: true, tsr: "ARAB-ART.EXE" },
  { id: "taher", folder: "TAHER", executable: "TAHER.COM", needsArabart: false },
  { id: "winkey", folder: "WINKEY", executable: "WINKEY.EXE", needsArabart: false },
];

function makeDosboxConf(executable, needsArabart, cycles = 1000, tsr = "ARABART.EXE") {
  const lines = [
    "[sdl]",
    "fullscreen=false",
    "output=surface",
    "",
    "[cpu]",
    `cycles=fixed ${cycles}`,
    "",
    "[autoexec]",
    "@echo off",
    "mount c .",
    "c:",
  ];

  if (needsArabart) {
    lines.push(`${tsr} > NUL`);
    lines.push("cls");
  }

  lines.push(executable);
  lines.push("");

  return lines.join("\r\n");
}

function makeTerminalDosboxConf() {
  return [
    "[sdl]",
    "fullscreen=false",
    "output=surface",
    "",
    "[cpu]",
    "cycles=fixed 1000",
    "",
    "[autoexec]",
    "@echo off",
    "mount c .",
    "c:",
    "cd ARABART",
    "ARABART.EXE > NUL",
    "cd C:\\",
    "cls",
    "echo Welcome to ARABART!",
    "echo Yasser Awad's DOS programs from the 1990s.",
    "echo Each directory contains a project with a README.TXT.",
    "echo Type DIR to list all directories.",
    "echo.",
    "",
  ].join("\r\n");
}

function addDirectoryFiles(archive, dirPath, archivePath = "") {
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const entryArchivePath = archivePath ? `${archivePath}/${entry}` : entry;
    if (statSync(fullPath).isDirectory()) {
      addDirectoryFiles(archive, fullPath, entryArchivePath);
    } else {
      archive.file(fullPath, { name: entryArchivePath });
    }
  }
}

async function createBundle(program) {
  const outputPath = join(OUTPUT_DIR, `${program.id}.jsdos`);
  const output = createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolvePromise, reject) => {
    output.on("close", () => {
      console.log(`  ${program.id}.jsdos (${(archive.pointer() / 1024).toFixed(1)} KB)`);
      resolvePromise();
    });
    archive.on("error", reject);
    archive.pipe(output);

    // Add dosbox.conf
    const conf = makeDosboxConf(program.executable, program.needsArabart, program.cycles, program.tsr);
    archive.append(conf, { name: ".jsdos/dosbox.conf" });

    // Add program files
    const programDir = join(PROGRAMS_DIR, program.folder);
    const programFiles = readdirSync(programDir);
    for (const file of programFiles) {
      const filePath = join(programDir, file);
      if (statSync(filePath).isFile()) {
        archive.file(filePath, { name: file });
      }
    }

    // Add ARABART files if needed and not already in the program folder
    if (program.needsArabart && !program.tsr && program.folder !== "ARABART") {
      const arabartFiles = readdirSync(ARABART_DIR);
      for (const file of arabartFiles) {
        // Only add if not already present in the program folder
        if (!programFiles.includes(file)) {
          const filePath = join(ARABART_DIR, file);
          if (statSync(filePath).isFile()) {
            archive.file(filePath, { name: file });
          }
        }
      }
    }

    archive.finalize();
  });
}

async function createTerminalBundle() {
  const outputPath = join(OUTPUT_DIR, "terminal.jsdos");
  const output = createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolvePromise, reject) => {
    output.on("close", () => {
      console.log(`  terminal.jsdos (${(archive.pointer() / 1024).toFixed(1)} KB)`);
      resolvePromise();
    });
    archive.on("error", reject);
    archive.pipe(output);

    // Add dosbox.conf
    archive.append(makeTerminalDosboxConf(), { name: ".jsdos/dosbox.conf" });

    // Add all program directories
    const entries = readdirSync(PROGRAMS_DIR);
    for (const entry of entries) {
      const fullPath = join(PROGRAMS_DIR, entry);
      if (entry === "KVC_LIVE") continue; // the Koko double and its marked files belong only to the kvc-live demo
      if (statSync(fullPath).isDirectory()) {
        addDirectoryFiles(archive, fullPath, entry);
      } else if (entry === "RUN.BAT") {
        archive.file(fullPath, { name: "RUN.BAT" });
      }
    }

    archive.finalize();
  });
}

async function main() {
  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Building .jsdos bundles...\n");

  // Build individual program bundles
  for (const program of programs) {
    await createBundle(program);
  }

  // Build terminal bundle with all programs
  console.log("");
  await createTerminalBundle();

  console.log(`\nDone! ${programs.length + 1} bundles created in public/bundles/`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
