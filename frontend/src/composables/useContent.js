import { reactive, watch, toRefs, ref } from "vue";
import dictionaryFile from "../manual-dictionary.json";

// Shared state for the locale across the app
const currentLocale = ref(localStorage.getItem("locale") || "en");

export function useContent() {
  const dictionaries = dictionaryFile.dictionary;

  const getLocaleKey = (l) => {
    const str = l?.toString() || "en";
    if (dictionaries[str]) return str;
    // Fallback for zh or zh-CN to zh-TW
    if (str.startsWith("zh")) return "zh-TW";
    return "en";
  };

  // Initialize state
  const initialKey = getLocaleKey(currentLocale.value);
  const state = reactive({ ...dictionaries[initialKey] });

  // Watch for global locale changes
  watch(
    currentLocale,
    (newLocale) => {
      const key = getLocaleKey(newLocale);
      // Update state in place
      const newContent = dictionaries[key] || dictionaries["en"];

      // Clear current properties to avoid stale keys if switching languages with different structure (unlikely here but good practice)
      // Actually, Object.assign is better for reactivity if we assume structure is identical.
      // But to be safe, we iterate.
      Object.keys(newContent).forEach((k) => {
        state[k] = newContent[k];
      });
    },
    { immediate: true },
  );

  return {
    ...toRefs(state),
    locale: currentLocale, // Expose the global ref to allow modification
    setLocale: (l) => {
      currentLocale.value = l;
      localStorage.setItem("locale", l);
    },
  };
}

export const normalizeCategory = (cat) => {
  if (!cat) return cat;
  const seedMap = {
    "影音設備": "Audio",
    "音響": "Audio",
    "家具": "Furniture",
    "電競週邊": "Gaming",
    "電競": "Gaming",
    "穿戴裝置": "Wearables",
    "配件": "Accessories",
    "包袋": "Bags",
    "包款": "Bags",
    "其他": "Other"
  };
  return seedMap[cat] || cat;
};
