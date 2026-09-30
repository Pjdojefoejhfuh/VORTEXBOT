const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");

// Bon emoji en clair (UTF-8 propre)
const TICKET_EMOJI = "\u{1F3AB}"; // 🎫

// Sequences casses possibles (toutes les variantes UTF-8 mal decodees de 🎫)
const BAD_SEQUENCES = [
    "\u00f0\u009f\u008e\u00ab",  // ðŸŽ« (le plus courant)
    "\u00f0\u009f\u008e\u00a8\u00ab", // variante avec octet en plus
    "\u00f0\u009f\u008e",         // version tronquee
];

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            results = results.concat(walk(full));
        } else if (entry.name.endsWith(".js")) {
            results.push(full);
        }
    }
    return results;
}

function fixEmoji(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, "utf8");
    } catch { return false; }

    const original = content;
    let replaced = 0;

    for (const bad of BAD_SEQUENCES) {
        if (content.includes(bad)) {
            content = content.split(bad).join(TICKET_EMOJI);
            replaced++;
        }
    }

    if (content === original) return false;

    try {
        fs.writeFileSync(filePath, content, { encoding: "utf8" });
        return true;
    } catch { return false; }
}

console.log("");
console.log("=== FIX EMOJI TICKET ===");
console.log("");

const files = walk(SRC);
let fixed = 0;

for (const file of files) {
    if (fixEmoji(file)) {
        console.log("  [FIX] " + path.relative(ROOT, file));
        fixed++;
    }
}

console.log("");
console.log("Fichiers corriges : " + fixed);
console.log("");
