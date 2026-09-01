import { I18n } from "i18n-js";
import en from "../screens/en.json";
import ka from "../screens/ka.json";

// Create an I18n instance
const i18n = new I18n({
  en,
  ka,
});

// Configure i18n
i18n.fallbacks = true; // Fallback to English if translation is missing
i18n.locale = "en"; // Default to English

export default i18n;
