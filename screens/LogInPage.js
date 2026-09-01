import CustomButton from "./CustomButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KeyboardAvoidingContainer from "./KeyboardAvoidingContainer";
import LanguageToggle from "./LanguageToggle";
import i18n from "../screens/i18n"; // Import i18n

const { width, height } = Dimensions.get("window");
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

export default function LogInPage({ navigation }) {
  const [mail, setMail] = useState("");
  const [password, setPassWord] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(i18n.locale); // Start with i18n’s default

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.locale = savedLanguage; // Sync i18n with saved language
        }
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };

    loadLanguage();
  }, []);

  const handlePress = async () => {
    if (!mail.trim() || !password.trim()) {
      Alert.alert(i18n.t("emptyFieldsTitle"), i18n.t("emptyFieldsMessage"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://new-elevator-api.elevator-rand.workers.dev/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: mail, password }),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        } else if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error(`Login failed: ${response.status}`);
      }
      const data = await response.json();
      console.log("Login response:", data);

      if (data.success) {
        await AsyncStorage.setItem("userId", data.id);
        await AsyncStorage.setItem("isSignedIn", "true");
        await AsyncStorage.setItem("isAdmin", data.admin.toString());
        // Debug: Verify storage
        const storedIsAdmin = await AsyncStorage.getItem("isAdmin");
        console.log(
          "Stored userId:",
          data.id,
          "isSignedIn:",
          "true",
          "isAdmin:",
          storedIsAdmin
        );

        if (data.admin === 1) {
          navigation.replace("AdminPage");
        } else {
          navigation.replace("MainActivity");
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setLoading(false);
      console.error("Sign-in error:", error.message);
      Alert.alert(i18n.t("loginFailedTitle"), i18n.t("loginFailedMessage"));
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage; // Update i18n locale
    try {
      await AsyncStorage.setItem("appLanguage", newLanguage); // Save to AsyncStorage
      console.log("Language saved:", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  return (
    <KeyboardAvoidingContainer
      style={{
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight + hp(10) : hp(10),
      }}
    >
      <View style={styles.outerSectionTop}>
        <View style={styles.language}>
          <LanguageToggle
            onLanguageChange={handleLanguageChange}
            language={language}
          />
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.compNameText}>Elevator</Text>
      </View>

      <View style={styles.middleSection}>
        <View
          style={[
            styles.textBorder,
            focusedField === "email" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={25} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("emailPlaceholder")}
              keyboardType="email-address"
              placeholderTextColor="#A9B8B6"
              value={mail}
              onChangeText={setMail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "password" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={25} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("passwordPlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={password}
              onChangeText={setPassWord}
              secureTextEntry={true}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.outerSection}>
        {loading ? (
          <ActivityIndicator size="large" color="#00CED1" />
        ) : (
          <CustomButton
            title={i18n.t("logInButton")}
            onPress={handlePress}
            color="#00CED1"
          />
        )}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>{i18n.t("forgotPassword")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingContainer>
  );
}

// Styles remain unchanged as requested
const styles = StyleSheet.create({
  outerSectionTop: {
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: 10,
    position: "relative",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  compNameText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#00CED1",
    textAlign: "center",
  },
  middleSection: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  outerSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  textBorder: {
    flexDirection: "row",
    backgroundColor: "#2F3634",
    width: "100%",
    height: 50,
    borderWidth: 2,
    borderColor: "#228B22",
    borderRadius: 20,
    paddingStart: 10,
    paddingEnd: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  textBorderFocused: {
    borderColor: "#00CED1",
  },
  dataText: {
    height: "100%",
    width: "100%",
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1E8E6",
    textAlign: "center",
  },
  iconContainer: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPassword: {
    marginTop: 10,
    fontSize: 14,
    color: "#32CD32",
  },
  language: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
