const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");

// Sequence de remplacement (cle UTF-8 mal decodee = valeur corrigee)
const FIXES = [
    // Accents
    ["\u00c3\u00a9", "\u00e9"], // Ã© -> é
    ["\u00c3\u00a8", "\u00e8"], // Ã¨ -> è
    ["\u00c3\u00aa", "\u00ea"], // Ãª -> ê
    ["\u00c3\u00ab", "\u00eb"], // Ã« -> ë
    ["\u00c3\u00a0", "\u00e0"], // Ã  -> à
    ["\u00c3\u00a2", "\u00e2"], // Ã¢ -> â
    ["\u00c3\u00a4", "\u00e4"], // Ã¤ -> ä
    ["\u00c3\u00ae", "\u00ee"], // Ã® -> î
    ["\u00c3\u00af", "\u00ef"], // Ã¯ -> ï
    ["\u00c3\u00b4", "\u00f4"], // Ã´ -> ô
    ["\u00c3\u00b6", "\u00f6"], // Ã¶ -> ö
    ["\u00c3\u00b9", "\u00f9"], // Ã¹ -> ù
    ["\u00c3\u00bb", "\u00fb"], // Ã» -> û
    ["\u00c3\u00bc", "\u00fc"], // Ã¼ -> ü
    ["\u00c3\u00a7", "\u00e7"], // Ã§ -> ç
    ["\u00c3\u00b1", "\u00f1"], // Ã± -> ñ
    ["\u00c3\u0089", "\u00c9"], // Ã‰ -> É
    ["\u00c3\u0080", "\u00c0"], // Ã€ -> À
    ["\u00c3\u0087", "\u00c7"], // Ã‡ -> Ç
    ["\u00c5\u0093", "\u0153"], // Å“ -> œ
    ["\u00c5\u0092", "\u0152"], // Å’ -> Œ

    // Ponctuation
    ["\u00e2\u0080\u0099", "'"],  // â€™ -> '
    ["\u00e2\u0080\u0098", "'"],  // â€˜ -> '
    ["\u00e2\u0080\u009c", "\""], // â€œ -> "
    ["\u00e2\u0080\u009d", "\""], // â€ -> "
    ["\u00e2\u0080\u0094", "\u2014"], // â€” -> —
    ["\u00e2\u0080\u0093", "\u2013"], // â€“ -> –
    ["\u00e2\u0080\u00a6", "..."],   // â€¦ -> ...
    ["\u00c2\u00ab", "\u00ab"],   // Â« -> «
    ["\u00c2\u00bb", "\u00bb"],   // Â» -> »

    // Emojis : UTF-8 4 octets mal decodes en Latin-1
    ["\u00f0\u009f\u008e\u00ab", "\ud83c\udfab"], // 🎫
    ["\u00f0\u009f\u008e\u00a8", "\ud83c\udfa8"], // 🎨
    ["\u00f0\u009f\u008e\u0089", "\ud83c\udf89"], // 🎉
    ["\u00f0\u009f\u008e\u0081", "\ud83c\udf81"], // 🎁
    ["\u00f0\u009f\u008e\u00af", "\ud83c\udfaf"], // 🎯
    ["\u00f0\u009f\u008e\u00ae", "\ud83c\udfae"], // 🎮
    ["\u00f0\u009f\u008e\u00b5", "\ud83c\udfb5"], // 🎵
    ["\u00f0\u009f\u008e\u00b6", "\ud83c\udfb6"], // 🎶
    ["\u00f0\u009f\u008e\u00ac", "\ud83c\udfac"], // 🎬
    ["\u00f0\u009f\u008e\u00ad", "\ud83c\udfad"], // 🎭
    ["\u00f0\u009f\u008e\u00aa", "\ud83c\udfaa"], // 🎪
    ["\u00f0\u009f\u00a4\u0096", "\ud83e\udd16"], // 🤖
    ["\u00f0\u009f\u0091\u00a5", "\ud83d\udc65"], // 👥
    ["\u00f0\u009f\u0091\u00a4", "\ud83d\udc64"], // 👤
    ["\u00f0\u009f\u0091\u00a8", "\ud83d\udc68"], // 👨
    ["\u00f0\u009f\u0091\u00a9", "\ud83d\udc69"], // 👩
    ["\u00f0\u009f\u0091\u00ae", "\ud83d\udc6e"], // 👮
    ["\u00f0\u009f\u0091\u00b6", "\ud83d\udc76"], // 👶
    ["\u00f0\u009f\u0091\u00b7", "\ud83d\udc77"], // 👷
    ["\u00f0\u009f\u0091\u00b8", "\ud83d\udc78"], // 👸
    ["\u00f0\u009f\u0091\u00b9", "\ud83d\udc79"], // 👹
    ["\u00f0\u009f\u0091\u00ba", "\ud83d\udc7a"], // 👺
    ["\u00f0\u009f\u0091\u00bb", "\ud83d\udc7b"], // 👻
    ["\u00f0\u009f\u0091\u00bc", "\ud83d\udc7c"], // 👼
    ["\u00f0\u009f\u0091\u00bd", "\ud83d\udc7d"], // 👽
    ["\u00f0\u009f\u0091\u00be", "\ud83d\udc7e"], // 👾
    ["\u00f0\u009f\u0091\u00bf", "\ud83d\udc7f"], // 👿
    ["\u00f0\u009f\u0092\u0080", "\ud83d\udc80"], // 💀
    ["\u00f0\u009f\u0092\u00a1", "\ud83d\udca1"], // 💡
    ["\u00f0\u009f\u0092\u00b0", "\ud83d\udcb0"], // 💰
    ["\u00f0\u009f\u0092\u00b8", "\ud83d\udcb8"], // 💸
    ["\u00f0\u009f\u0091\u008d", "\ud83d\udc4d"], // 👍
    ["\u00f0\u009f\u0091\u008e", "\ud83d\udc4e"], // 👎
    ["\u00f0\u009f\u0091\u008c", "\ud83d\udc4c"], // 👌
    ["\u00f0\u009f\u0091\u008f", "\ud83d\udc4f"], // 👏
    ["\u00f0\u009f\u0099\u008f", "\ud83d\ude4f"], // 🙏
    ["\u00f0\u009f\u0091\u008b", "\ud83d\udc4b"], // 👋
    ["\u00f0\u009f\u0094\u00b4", "\ud83d\udd34"], // 🔴
    ["\u00f0\u009f\u009f\u00a2", "\ud83d\udfe2"], // 🟢
    ["\u00f0\u009f\u009f\u00a1", "\ud83d\udfe1"], // 🟡
    ["\u00f0\u009f\u009f\u00a0", "\ud83d\udfe0"], // 🟠
    ["\u00f0\u009f\u009f\u00a3", "\ud83d\udfe3"], // 🟣
    ["\u00f0\u009f\u009f\u00a4", "\ud83d\udfe4"], // 🟤
    ["\u00f0\u009f\u0094\u0092", "\ud83d\udd12"], // 🔒
    ["\u00f0\u009f\u0094\u0093", "\ud83d\udd13"], // 🔓
    ["\u00f0\u009f\u0094\u0097", "\ud83d\udd17"], // 🔗
    ["\u00f0\u009f\u0094\u00a8", "\ud83d\udd28"], // 🔨
    ["\u00f0\u009f\u0094\u00a7", "\ud83d\udd27"], // 🔧
    ["\u00f0\u009f\u0094\u00a9", "\ud83d\udd29"], // 🔩
    ["\u00f0\u009f\u0094\u0084", "\ud83d\udd04"], // 🔄
    ["\u00f0\u009f\u0093\u008a", "\ud83d\udcca"], // 📊
    ["\u00f0\u009f\u0093\u0088", "\ud83d\udcc8"], // 📈
    ["\u00f0\u009f\u0093\u0089", "\ud83d\udcc9"], // 📉
    ["\u00f0\u009f\u0093\u0081", "\ud83d\udcc1"], // 📁
    ["\u00f0\u009f\u0093\u0082", "\ud83d\udcc2"], // 📂
    ["\u00f0\u009f\u0093\u0085", "\ud83d\udcc5"], // 📅
    ["\u00f0\u009f\u0093\u008b", "\ud83d\udccb"], // 📋
    ["\u00f0\u009f\u0093\u008c", "\ud83d\udccc"], // 📌
    ["\u00f0\u009f\u0093\u008e", "\ud83d\udcce"], // 📎
    ["\u00f0\u009f\u0093\u009d", "\ud83d\udcdd"], // 📝
    ["\u00f0\u009f\u0093\u00a3", "\ud83d\udce3"], // 📣
    ["\u00f0\u009f\u0093\u00a4", "\ud83d\udce4"], // 📤
    ["\u00f0\u009f\u0093\u00a5", "\ud83d\udce5"], // 📥
    ["\u00f0\u009f\u0093\u00a6", "\ud83d\udce6"], // 📦
    ["\u00f0\u009f\u0093\u00b7", "\ud83d\udcf7"], // 📷
    ["\u00f0\u009f\u0093\u00b8", "\ud83d\udcf8"], // 📸
    ["\u00f0\u009f\u0093\u00b9", "\ud83d\udcf9"], // 📹
    ["\u00f0\u009f\u0093\u00ba", "\ud83d\udcfa"], // 📺
    ["\u00f0\u009f\u0093\u00bb", "\ud83d\udcfb"], // 📻
    ["\u00f0\u009f\u0093\u00bc", "\ud83d\udcfc"], // 📼
    ["\u00e2\u009a\u00a0", "\u26a0"],  // ⚠
    ["\u00e2\u009a\u00a0\ufe0f", "\u26a0\ufe0f"], // ⚠️
    ["\u00e2\u009c\u0085", "\u2705"], // ✅
    ["\u00e2\u009d\u008c", "\u274c"], // ❌
    ["\u00e2\u009e\u0095", "\u2795"], // ➕
    ["\u00e2\u009e\u0096", "\u2796"], // ➖
    ["\u00e2\u00ac\u0086\ufe0f", "\u2b06\ufe0f"], // ⬆️
    ["\u00e2\u00ac\u0087\ufe0f", "\u2b07\ufe0f"], // ⬇️
    ["\u00e2\u00ac\u0085\ufe0f", "\u2b05\ufe0f"], // ⬅️
    ["\u00e2\u009e\u00a1\ufe0f", "\u27a1\ufe0f"], // ➡️
    ["\u00f0\u009f\u009b\u00a1\ufe0f", "\ud83d\udee1\ufe0f"], // 🛡️
    ["\u00f0\u009f\u009b\u00a1", "\ud83d\udee1"], // 🛡
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

function fixFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, "utf8");
    } catch {
        return { changed: false };
    }

    const original = content;
    let count = 0;

    for (const [bad, good] of FIXES) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            count++;
        }
    }

    if (content === original) return { changed: false };

    try {
        fs.writeFileSync(filePath, content, { encoding: "utf8" });
        return { changed: true, count };
    } catch {
        return { changed: false };
    }
}

console.log("");
console.log("============================================");
console.log("  FIX-ENCODING  -  Reparation auto");
console.log("============================================");
console.log("");

const files = [
    ...walk(SRC),
    path.join(ROOT, "config.js"),
    path.join(ROOT, "index.js"),
].filter(f => fs.existsSync(f));

console.log("Fichiers a analyser : " + files.length);
console.log("");

let fixed = 0;

for (const file of files) {
    const rel = path.relative(ROOT, file);
    const result = fixFile(file);
    if (result.changed) {
        console.log("  [FIX] " + rel + "  (" + result.count + " sequences)");
        fixed++;
    }
}

console.log("");
console.log("============================================");
console.log("  TERMINE");
console.log("============================================");
console.log("  Fichiers modifies : " + fixed);
console.log("");

if (fixed > 0) {
    console.log("Redemarre le bot :");
    console.log("  Get-Process node | Stop-Process -Force");
    console.log("  node index.js");
}
console.log("");
