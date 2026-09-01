import CustomButton from "./CustomButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Alert,
  View,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KeyboardAvoidingContainer from "./KeyboardAvoidingContainer";
import LanguageToggle from "./LanguageToggle";
import i18n from "./i18n";
import emailValidator from "email-validator"; // Import email-validator

const { width, height } = Dimensions.get("window");

// Helper functions for responsive sizing
const wp = (percentage) => (width * percentage) / 100; // Width percentage
const hp = (percentage) => (height * percentage) / 100; // Height percentage

export default function SignUpPage({ navigation }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mail, setMail] = useState("");
  const [number, setNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [building, setBuilding] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(i18n.locale);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.locale = savedLanguage;
        }
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };

    loadLanguage();
  }, []);

  const handleSignUp = async () => {
    if (
      !name ||
      !surname ||
      !mail ||
      !number ||
      !idNumber ||
      !password ||
      !repeatPassword ||
      !building
    ) {
      Alert.alert(i18n.t("missingInfoTitle"), i18n.t("emptyFieldsMessage"));
      return;
    }

    // Validate email format using email-validator
    if (!emailValidator.validate(mail)) {
      Alert.alert(i18n.t("invalidEmailTitle"), i18n.t("invalidEmailMessage"));
      return;
    }

    // Validate phone number (exactly 9 digits)
    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(number)) {
      Alert.alert(
        i18n.t("invalidPhoneTitle"),
        i18n.t("phoneLengthMessage", { length: 9 })
      );
      return;
    }

    // Validate ID number (exactly 11 digits)
    const idRegex = /^\d{11}$/;
    if (!idRegex.test(idNumber)) {
      Alert.alert(
        i18n.t("invalidIdTitle"),
        i18n.t("idLengthMessage", { length: 11 })
      );
      return;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      Alert.alert(
        i18n.t("invalidPasswordTitle"),
        i18n.t("passwordMinLengthMessage", { length: 6 })
      );
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert(
        i18n.t("passwordMismatchTitle"),
        i18n.t("passwordMismatchMessage")
      );
      return;
    }

    // Validate building: if it starts with "0", it must be exactly "00"
    if (building.startsWith("0") && building !== "00") {
      Alert.alert(i18n.t("invalidBuildingTitle"));
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check if the email already exists in the database
      const checkEmailResponse = await fetch(
        `https://new-elevator-api.elevator-rand.workers.dev/user/check-email?email=${encodeURIComponent(
          mail
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!checkEmailResponse.ok) {
        throw new Error(`Failed to check email: ${checkEmailResponse.status}`);
      }

      const emailData = await checkEmailResponse.json();
      if (emailData.exists) {
        setLoading(false);
        Alert.alert(i18n.t("emailExistsTitle"), i18n.t("emailExistsMessage"));
        return;
      }

      // Step 2: If email doesn't exist, proceed with sign-up
      const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const defaultImageUrl =
        "https://img.freepik.com/premium-vector/profile-picture-placeholder-avatar-silhouette-gray-tones-icon-colored-shapes-gradient_1076610-40164.jpg?semt=ais_hybrid";

      const userData = {
        id: userId,
        name,
        surname,
        email: mail,
        number,
        idNumber,
        building,
        profileImageUrl: defaultImageUrl,
        password,
      };

      const response = await fetch(
        "https://new-elevator-api.elevator-rand.workers.dev/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Missing required fields");
        }
        throw new Error(`Failed to sign up: ${response.status}`);
      }

      const data = await response.json();
      console.log("User Signed Up:", data);

      if (data.success) {
        await AsyncStorage.setItem("userId", userId);
        setLoading(false);
        navigation.replace("SuccessPage");
      } else {
        throw new Error("Sign-up failed: Invalid response");
      }
    } catch (error) {
      setLoading(false);
      console.error("Sign up error:", error.message);
      Alert.alert(i18n.t("signUpFailedTitle"), i18n.t("signUpFailedMessage"));
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
    try {
      await AsyncStorage.setItem("appLanguage", newLanguage);
      console.log("Language saved:", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  return (
    <KeyboardAvoidingContainer>
      <View style={styles.outerSectionTop}>
        <View style={styles.languageContainer}>
          <LanguageToggle
            onLanguageChange={handleLanguageChange}
            language={language}
          />
        </View>
        <Text style={styles.compNameText}>Elevator</Text>
        <Text style={styles.registerText}>{i18n.t("registerText")}</Text>
      </View>

      <View style={styles.middleSection}>
        {/* Name and Surname in a row */}
        <View style={styles.rowContainer}>
          <View
            style={[
              styles.textBorder,
              styles.halfWidth,
              focusedField === "name" && styles.textBorderFocused,
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={wp(6)} color="#00CED1" />
            </View>
            <View style={styles.textContainer}>
              <TextInput
                style={styles.dataText}
                numberOfLines={1}
                minimumFontScale={0.5}
                placeholder={i18n.t("namePlaceholder")}
                placeholderTextColor="#A9B8B6"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                editable={!loading}
              />
            </View>
          </View>
          <View
            style={[
              styles.textBorder,
              styles.halfWidth,
              focusedField === "surname" && styles.textBorderFocused,
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={wp(6)} color="#00CED1" />
            </View>
            <View style={styles.textContainer}>
              <TextInput
                style={styles.dataText}
                numberOfLines={1}
                minimumFontScale={0.5}
                placeholder={i18n.t("surnamePlaceholder")}
                placeholderTextColor="#A9B8B6"
                value={surname}
                onChangeText={setSurname}
                onFocus={() => setFocusedField("surname")}
                onBlur={() => setFocusedField(null)}
                editable={!loading}
              />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "email" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("emailPlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={mail}
              onChangeText={setMail}
              keyboardType="email-address"
              autoComplete="off"
              textContentType="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "number" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="call" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("phonePlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={number}
              maxLength={9}
              onChangeText={setNumber}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField("number")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "idNumber" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="id-card-outline" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("idNumberPlaceholder")}
              keyboardType="phone-pad"
              placeholderTextColor="#A9B8B6"
              value={idNumber}
              maxLength={11}
              onChangeText={setIdNumber}
              onFocus={() => setFocusedField("idNumber")}
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
            <Ionicons name="key" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("passwordPlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoComplete="off"
              textContentType="none"
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "repeatPassword" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("repeatPasswordPlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry={true}
              autoComplete="off"
              textContentType="none"
              onFocus={() => setFocusedField("repeatPassword")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>
        </View>

        <View
          style={[
            styles.textBorder,
            focusedField === "building" && styles.textBorderFocused,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={wp(6)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.dataText}
              numberOfLines={1}
              minimumFontScale={0.5}
              placeholder={i18n.t("buildingPlaceholder")}
              placeholderTextColor="#A9B8B6"
              value={building}
              onChangeText={setBuilding}
              keyboardType="numeric"
              maxLength={3}
              onFocus={() => setFocusedField("building")}
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
            title={i18n.t("signUpButton")}
            onPress={handleSignUp}
            color="#00CED1"
          />
        )}
      </View>
    </KeyboardAvoidingContainer>
  );
}

// Styles remain unchanged as requested
const styles = StyleSheet.create({
  outerSectionTop: {
    alignItems: "center",
    paddingBottom: hp(3), // ~30px on 1080px height
    paddingTop: hp(3), // ~30px on 1080px height
    position: "relative",
  },
  languageContainer: {
    position: "absolute",
    right: wp(5), // ~18px on 360px width
  },
  compNameText: {
    fontSize: hp(7), // ~60px on 1080px height
    fontWeight: "bold",
    color: "#00CED1",
    textAlign: "center",
  },
  registerText: {
    fontSize: hp(2.5), // ~24px on 1080px height
    fontWeight: "bold",
    color: "#D1E8E6",
    textAlign: "center",
    marginTop: hp(1), // ~10px on 1080px height
  },
  middleSection: {
    width: "100%",
    paddingHorizontal: wp(5), // ~20px on 360px width
    marginBottom: hp(4), // ~40px on 1080px height
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hp(1), // ~10px on 1080px height
  },
  textBorder: {
    flexDirection: "row",
    backgroundColor: "#2F3634",
    width: "100%",
    height: hp(6.5), // ~50px on 1080px height
    borderWidth: wp(0.5), // ~2px on 360px width
    borderColor: "#228B22",
    borderRadius: wp(5), // ~20px on 1080px width
    paddingStart: wp(3), // ~10px on 360px width
    paddingEnd: wp(3), // ~10px on 360px width
    alignItems: "center",
    marginVertical: hp(1), // ~10px on 1080px height
  },
  halfWidth: {
    width: "48%", // Slightly less than 50% to account for spacing
  },
  textBorderFocused: {
    borderColor: "#00CED1",
  },
  dataText: {
    height: "100%",
    width: "100%",
    fontSize: hp(2), // ~18px on 1080px height
    fontWeight: "bold",
    color: "#D1E8E6",
    textAlign: "center",
  },
  iconContainer: {
    marginRight: wp(3), // ~10px on 360px width
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outerSection: {
    alignItems: "center",
    paddingBottom: hp(2), // ~20px on 1080px height
  },
});
