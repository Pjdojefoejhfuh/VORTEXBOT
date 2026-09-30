const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

// Surrogate pairs UTF-16 des emojis cibles
const EMOJI_TICKET  = "\uD83C\uDFAB"; // 🎫
const EMOJI_DOWN    = "\uD83D\uDC47"; // 👇
const EMOJI_FOLDER  = "\uD83D\uDCC2"; // 📂

// Les sequences cassees, ecrites avec des codes Unicode EXACTS
// (pour eviter tout probleme de copier-coller)
const BAD_TICKET  = "\u00F0\u009F\u008E\u00AB"; // ðŸŽ«
const BAD_DOWN    = "\u00F0\u009F\u0091\u0087"; // ðŸ‘‡
const BAD_FOLDER  = "\u00F0\u009F\u0093\u0082"; // ðŸ“‚
const BAD_DASH    = "\u00E2\u0080\u0094";       // â€"
const BAD_MIDDOT  = "\u00C2\u00B7";             // Â·

const FIXES = [
    [BAD_TICKET, EMOJI_TICKET],
    [BAD_DOWN,   EMOJI_DOWN],
    [BAD_FOLDER, EMOJI_FOLDER],
    [BAD_DASH,   "\u2014"], // —
    [BAD_MIDDOT, "\u00B7"], // ·
];

const FILES = [
    "src\\commands\\utility\\ticket.js",
    "src\\events\\ticketHandler.js",
    "src\\utils\\tickets.js",
];

let totalFixed = 0;

for (const rel of FILES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) {
        console.log("  [SKIP] " + rel);
        continue;
    }

    let content = fs.readFileSync(full, "utf8");
    const before = content;
    let count = 0;

    for (const [bad, good] of FIXES) {
        const regex = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
        const matches = content.match(regex);
        if (matches) {
            count += matches.length;
            content = content.replace(regex, good);
        }
    }

    if (content !== before) {
        fs.writeFileSync(full, content, { encoding: "utf8" });
        console.log("  [FIX] " + rel + "  (" + count + " remplacements)");
        totalFixed++;
    } else {
        console.log("  [--] " + rel + "  (rien a changer)");
    }
}

console.log("");
console.log("Fichiers corriges : " + totalFixed);
