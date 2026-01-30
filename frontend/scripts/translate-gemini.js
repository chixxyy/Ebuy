import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Configuration
const SOURCE_FILE = path.join(__dirname, "../src/manual-dictionary.json");
const TARGET_FILE = path.join(__dirname, "../src/locales/en-translated.json");
const TARGET_LANG = "English";
const MODEL_NAME = "gemini-flash-latest"; // Updated as requested
const VALID_API_VERSION = "v1beta";
const CHUNK_SIZE = 10;
const DELAY_MS = 5000;
const RETRY_DELAY_MS = 60000; // 60 seconds

// Helper: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Flatten Object
function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

// Helper: Unflatten Object
function unflattenObject(data) {
    const result = {};
    for (const i in data) {
        const keys = i.split('.');
        keys.reduce((r, e, j) => {
            return r[e] || (r[e] = keys.length - 1 === j ? data[i] : {});
        }, result);
    }
    return result;
}

/**
 * Translate a single chunk with retry capability
 */
async function translateChunk(model, chunkObj, chunkIndex, totalChunks) {
    const prompt = `
    You are a professional software localization expert.
    Translate the following JSON object values from Traditional Chinese to ${TARGET_LANG}.
    
    Rules:
    1. Keep all keys EXACTLY the same.
    2. Only translate the values.
    3. Maintain any placeholder variables like {name}, {count}, etc.
    4. Return ONLY the valid JSON object. No markdown.

    Source JSON:
    ${JSON.stringify(chunkObj, null, 2)}
    `;

    while (true) {
        try {
            console.log(`🤖 Translating batch ${chunkIndex + 1}/${totalChunks}...`);
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // More robust JSON extraction
            // Find the first '{' and the last '}'
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            
            if (start !== -1 && end !== -1 && end > start) {
                text = text.substring(start, end + 1);
            } else {
                 // Fallback cleanup if braces not found (unlikely but possible)
                 if (text.startsWith("```json")) {
                    text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
                 } else if (text.startsWith("```")) {
                    text = text.replace(/^```\n/, "").replace(/\n```$/, "");
                 }
            }

            return JSON.parse(text);

        } catch (error) {
            if (error.status === 429 || (error.message && error.message.includes('429'))) {
                console.warn(`⚠️ Rate limit (429) hit. Sleeping for ${RETRY_DELAY_MS / 1000}s before retrying...`);
                await sleep(RETRY_DELAY_MS);
            } else {
                console.error(`❌ Batch ${chunkIndex + 1} failed with non-retriable error.`);
                throw error;
            }
        }
    }
}

/**
 * Main translation function
 */
async function translateFile() {
  console.log("🚀 Starting robust translation...");
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: GOOGLE_API_KEY is missing in .env file");
    process.exit(1);
  }

  // Check file
  try {
    await fs.access(SOURCE_FILE);
  } catch (error) {
    console.error(`❌ Source file not found: ${SOURCE_FILE}`);
    process.exit(1);
  }

  // Read & Parse
  const sourceContent = await fs.readFile(SOURCE_FILE, "utf-8");
  const sourceData = JSON.parse(sourceContent);

  // Initialize AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME 
  }, { 
      apiVersion: VALID_API_VERSION 
  });

  // Flatten and Chunk
  // We only translate string values.
  const flatData = flattenObject(sourceData);
  const keys = Object.keys(flatData);
  
  // Filter for strings only (skip numbers/booleans if needed, or translate them likely as strings)
  // Usually we only translate strings.
  const stringKeys = keys.filter(k => typeof flatData[k] === 'string');
  
  const chunks = [];
  for (let i = 0; i < stringKeys.length; i += CHUNK_SIZE) {
      const chunkKeys = stringKeys.slice(i, i + CHUNK_SIZE);
      const chunkObj = {};
      chunkKeys.forEach(k => chunkObj[k] = flatData[k]);
      chunks.push(chunkObj);
  }

  console.log(`📦 Prepared ${chunks.length} batches from ${stringKeys.length} text entries.`);

  const translatedFlatData = { ...flatData }; // Copy original structure (numbers/bools remain)

  // Process Chunks
  for (let i = 0; i < chunks.length; i++) {
      const resultObj = await translateChunk(model, chunks[i], i, chunks.length);
      
      // Merge results back
      Object.assign(translatedFlatData, resultObj);

      if (i < chunks.length - 1) {
          await sleep(DELAY_MS);
      }
  }

  // Unflatten
  const finalJSON = unflattenObject(translatedFlatData);

  // Save
  await fs.mkdir(path.dirname(TARGET_FILE), { recursive: true });
  await fs.writeFile(TARGET_FILE, JSON.stringify(finalJSON, null, 2));
  console.log(`✅ Translation complete! Saved to: ${TARGET_FILE}`);
}

translateFile();
