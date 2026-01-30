import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_FILE = path.join(__dirname, "../src/manual-dictionary.json");
const TARGET_FILE = path.join(__dirname, "../src/locales/en-translated.json"); // The file to clean

/**
 * Heuristic checks to see if the value looks like a failed translation or explanation
 */
function isDirtyValue(value) {
    if (typeof value !== 'string') return false;
    
    const lower = value.toLowerCase();
    
    // Check for "Here is the translation" type explanations
    if (lower.includes("here is the translation") || 
        lower.includes("translation:") || 
        lower.startsWith("note:") ||
        value.includes("```")) {
        return true;
    }

    // Check for bad placeholders
    if (value.includes("[object Object]") || value === "undefined") {
        return true;
    }

    return false;
}

/**
 * Clean a string value
 */
function cleanString(value) {
    if (!value) return "";
    let cleaned = value.trim();
    
    // Remove potential markdown code blocks if they survived
    cleaned = cleaned.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    
    return cleaned.trim();
}

/**
 * Recursively sync keys from source to target.
 * structure: Source (zh-TW) is the master for keys.
 * output: Target (en) should have same keys.
 */
function syncKeys(sourceObj, targetObj) {
    const result = {};

    for (const key in sourceObj) {
        const sourceValue = sourceObj[key];
        const targetValue = targetObj ? targetObj[key] : undefined;

        if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
            // Recurse for objects
            result[key] = syncKeys(sourceValue, targetValue || {});
        } else {
            // It's a leaf (string/number/boolean)
            if (targetValue !== undefined) {
                // Keep target value if valid
                if (typeof targetValue === 'string') {
                    if (isDirtyValue(targetValue)) {
                        console.warn(`⚠️ Removed dirty value for key "${key}": "${targetValue}"`);
                        result[key] = ""; // Reset or maybe keep source? Empty is safer to spot.
                    } else {
                        result[key] = cleanString(targetValue);
                    }
                } else {
                     // Keep numbers/booleans as is
                    result[key] = targetValue;
                }
            } else {
                // Target missing key? 
                // We can't auto-translate here, but we ensure the key exists.
                // Log it.
                // console.log(`ℹ️ Key missing in target: "${key}". (Keeping empty)`);
                result[key] = ""; 
            }
        }
    }
    return result;
}

async function main() {
    console.log("🧹 Starting cleanup...");

    try {
        const sourceContent = await fs.readFile(SOURCE_FILE, "utf-8");
        const targetContent = await fs.readFile(TARGET_FILE, "utf-8");

        const sourceJSON = JSON.parse(sourceContent);
        const targetJSON = JSON.parse(targetContent);

        // Assume source structure: { dictionary: { "zh-TW": { ... } } }
        // Assume target structure: { dictionary: { "en": { ... } } } OR flat?
        // Let's inspect root keys.
        
        let sourceRoot = sourceJSON.dictionary?.["zh-TW"];
        if (!sourceRoot) {
             console.error("❌ Could not find dictionary['zh-TW'] in source file.");
             process.exit(1);
        }

        // Target might be full structure or just the locale part.
        // We want to update targetJSON.dictionary.en to match sourceRoot keys.
        let targetRoot = targetJSON.dictionary?.["en"];
        
        // If target file is weird structure, handle it.
        if (!targetRoot) {
            // maybe it IS the en object directly?
            targetRoot = targetJSON; 
        }

        console.log("🔄 Syncing keys...");
        const cleanedRoot = syncKeys(sourceRoot, targetRoot);

        // Reconstruct full object to save
        // We preserve 'id' from target if it exists, or source.
        const output = {
            id: targetJSON.id || sourceJSON.id,
            dictionary: {
                en: cleanedRoot
            }
            // We consciously DO NOT include other locales here to keep this file pure EN.
            // If the user wants to merge it back to manual-dictionary.json, that's a different step.
        };

        await fs.writeFile(TARGET_FILE, JSON.stringify(output, null, 2));
        console.log(`✅ Cleanup complete! Saved to ${TARGET_FILE}`);

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    }
}

main();
