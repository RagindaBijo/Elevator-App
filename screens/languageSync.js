import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n"; // Adjust path if needed

// Get the current language, loading from AsyncStorage if available
const getLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem("appLanguage");
    return savedLanguage || i18n.locale; // Fallback to i18n.locale ("en" by default)
  } catch (error) {
    console.error("Error loading language:", error);
    return i18n.locale;
  }
};

// Set the language, update i18n, and save to AsyncStorage
const setLanguage = async (newLanguage) => {
  try {
    i18n.locale = newLanguage;
    await AsyncStorage.setItem("appLanguage", newLanguage);
    console.log("Language synced:", newLanguage);
  } catch (error) {
    console.error("Error saving language:", error);
  }
};

export { getLanguage, setLanguage };
