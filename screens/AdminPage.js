import React, { useState, useEffect } from "react"; // Add useState
import { View, Text, StyleSheet } from "react-native";
import CustomButton_2 from "./CustomButton_2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n"; // Adjust path if needed
import { useIsFocused } from "@react-navigation/native";

export default function AdminPage({ navigation }) {
  const isFocused = useIsFocused();
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false); // Add loading state

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          i18n.locale = savedLanguage; // Sync i18n with saved language
        }
      } catch (error) {
        console.error("Error loading language in AdminPage:", error);
      } finally {
        setIsLanguageLoaded(true); // Mark language as loaded
      }
    };

    loadLanguage();
  }, [isFocused]); // Still runs on focus for updates

  const handleUserSignUpPress = () => {
    navigation.navigate("SignUpPage");
  };

  const handleHomePress = () => {
    navigation.navigate("MainActivity");
  };

  // Show a loading state until the language is fetched
  if (!isLanguageLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t("adminDashboardTitle")}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton_2
          title={i18n.t("userSignUpButton")}
          onPress={handleUserSignUpPress}
          color="#00CED1"
          style={styles.largeButton}
          textStyle={styles.buttonText}
        />
        <CustomButton_2
          title={i18n.t("homeButton")}
          onPress={handleHomePress}
          color="#32CD32"
          style={styles.largeButton}
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2523",
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#00CED1",
  },
  buttonContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  largeButton: {
    width: "70%",
    height: 150,
    marginVertical: 15,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loadingText: {
    fontSize: 20,
    color: "#00CED1",
    textAlign: "center",
    marginTop: "50%", // Center vertically
  },
});
