// SuccessPage.js
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n"; // Adjust path if needed (e.g., "../screens/i18n")
import { getLanguage } from "./languageSync"; // Adjust path to your sync file

export default function SuccessPage({ navigation }) {
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await getLanguage();
        i18n.locale = savedLanguage; // Sync i18n with saved language
        console.log("Language loaded in SuccessPage:", savedLanguage);
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };

    loadLanguage();
  }, []);

  const handleButtonPress = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("isAdmin");
      await AsyncStorage.removeItem("isSignedIn");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Sign out failed:", error.message);
      Alert.alert(i18n.t("signOutFailedTitle"), error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="checkmark-circle-outline" size={150} color="#00CED1" />
      </View>
      <Text style={styles.successText}>{i18n.t("successMessage")}</Text>
      <TouchableOpacity onPress={handleButtonPress}>
        <Text style={styles.buttonText}>{i18n.t("closeButton")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2523",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00CED1",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 14,
    color: "#32CD32",
  },
});
