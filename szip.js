"use strict";

/**
 * Build sun-formbuilder-pro.zip for distribution / WordPress.org upload.
 * Includes readme.txt (required by Plugin Check) and runtime assets only.
 *
 * Usage: npm run zip   (build:pro + zip)
 *    or: node szip.js  (zip only, after assets are built)
 */

const AdmZip = require("adm-zip");
const fs = require("fs");

const OUTPUT_FILE = "sun-formbuilder-pro.zip";

const ENTRIES = [
    { type: "file", local: "sun-formbuilder-pro.php" },
    { type: "file", local: "readme.txt" },
    { type: "folder", local: "./inc", zip: "inc" },
    { type: "folder", local: "./assets/images", zip: "assets/images" },
    { type: "folder", local: "./assets/css/lib", zip: "assets/css/lib" },
    { type: "folder", local: "./assets/css/webfonts", zip: "assets/css/webfonts" },
    {
        type: "folder",
        local: "./assets/css/minify",
        zip: "assets/css/minify",
        filter: (name) => !name.toLowerCase().endsWith(".js"),
    },
    { type: "folder", local: "./assets/js/minify", zip: "assets/js/minify" },
];

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}

function createZipArchive() {
    const startedAt = Date.now();
    const zip = new AdmZip();

    for (const entry of ENTRIES) {
        if (!fs.existsSync(entry.local)) {
            console.warn(`[skip] Not found: ${entry.local}`);
            continue;
        }

        if (entry.type === "folder") {
            zip.addLocalFolder(entry.local, entry.zip, entry.filter);
        } else {
            zip.addLocalFile(entry.local);
        }
    }

    zip.writeZip(OUTPUT_FILE);

    const { size } = fs.statSync(OUTPUT_FILE);
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(`Created ${OUTPUT_FILE} (${formatBytes(size)}) in ${elapsed}s`);
}

try {
    createZipArchive();
} catch (err) {
    console.error("Failed to create zip:", err);
    process.exit(1);
}
