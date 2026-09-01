import CountdownTimer from "./countDown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
  Animated,
  Platform,
  Dimensions, // Added Dimensions
} from "react-native";
import i18n from "./i18n"; // Adjust path if needed
import { useIsFocused } from "@react-navigation/native";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Helper functions for responsive sizing
const wp = (percentage) => (width * percentage) / 100; // Width percentage
const hp = (percentage) => (height * percentage) / 100; // Height percentage

export default function MainPage({ navigation }) {
  const [code, setCode] = useState("...");
  const [isOffline, setIsOffline] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadLanguageAndCode = async () => {
      try {
        // Load language from AsyncStorage
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          i18n.locale = savedLanguage;
        }

        // Check network status
        const netInfo = await NetInfo.fetch();
        setIsOffline(!netInfo.isConnected);

        // Load cached code first
        const cachedCode = await AsyncStorage.getItem("cachedCode");
        if (cachedCode) {
          setCode(cachedCode);
        } else {
          setCode("..."); // Default placeholder if no cached code
        }

        // Fetch new code if online
        if (netInfo.isConnected) {
          const apiUrl =
            "https://new-elevator-api.elevator-rand.workers.dev/get";
          const response = await fetch(apiUrl);

          if (!response.ok) {
            if (response.status === 404) {
              setCode(i18n.t("noNumberFound"));
              return;
            }
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          console.log("Fetched code data:", data);

          if (data.number !== null && data.number !== undefined) {
            const newCode = data.number.toString();
            setCode(newCode);
            await AsyncStorage.setItem("cachedCode", newCode);
            console.log("New code set and cached:", newCode);
          } else {
            setCode(i18n.t("noNumberFound"));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        const cachedCode = await AsyncStorage.getItem("cachedCode");
        if (cachedCode) {
          setCode(cachedCode); // Use cached code if available
        } else {
          setCode(i18n.t("error")); // Fallback to error message
        }
      }
    };

    loadLanguageAndCode();
  }, [isFocused]);

  const handlePress = () => {
    const fullCode = `${code}#`;
    Clipboard.setString(fullCode);
    console.log(`Copied to clipboard: ${fullCode}`);

    if (Platform.OS === "ios") {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.outerSectionTop}>
        <Text style={styles.compNameText}>Elevator</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOffline ? "#B71C1C" : "#02f702" },
            ]}
          />
          <Text style={styles.statusText}>
            {isOffline ? "Offline" : "Online"}
          </Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <TouchableOpacity
          style={styles.controlHub}
          onPress={handlePress}
          activeOpacity={1}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={styles.labelSection}>
              <Text style={styles.codeLabel}>{i18n.t("tapToCopy")}</Text>
            </View>
            <View style={styles.codeSection}>
              <View style={styles.codeContainer}>
                <View style={styles.codeView}>
                  <Text style={styles.codeText}>{code}</Text>
                </View>
                <View style={styles.hashView}>
                  <Text style={styles.hashText}>#</Text>
                </View>
              </View>
            </View>
            <View style={styles.timerSection}>
              <CountdownTimer />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" && (
        <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
          <Text style={styles.popupText}>{i18n.t("codeCopied")}</Text>
        </Animated.View>
      )}
    </View>
  );
}

// Styles remain unchanged as requested
const styles = StyleSheet.create({
  container: {
    flex: 1, // 100% of screen height
    backgroundColor: "#1C2523",
  },
  outerSectionTop: {
    flex: 2, // 33% of container height
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp(2.5), // ~20px on 1080px height
  },
  contentSection: {
    flex: 4, // 66% of container height
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: hp(5), // ~40px
  },
  compNameText: {
    fontSize: hp(8), // ~70px on 1080px height
    fontWeight: "800",
    color: "cyan",
    letterSpacing: wp(0.3), // ~1px on 360px width
    shadowColor: "#228B22",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: wp(1.5), // ~6px
    elevation: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1), // ~10px
  },
  statusDot: {
    width: wp(3), // ~12px on 360px width
    height: wp(3),
    borderRadius: wp(1.5), // ~6px
    marginRight: wp(2), // ~8px
    borderWidth: wp(0.3), // ~1px
    borderColor: "#D1E8E6",
  },
  statusText: {
    fontSize: hp(2), // ~16px
    color: "#D1E8E6",
    fontWeight: "600",
  },
  controlHub: {
    width: wp(85), // ~320px on 360px width
    height: wp(85), // Square aspect ratio
    borderRadius: wp(42.5), // Half of width (~160px)
    backgroundColor: "#2F3634",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5), // ~20px
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.5) }, // ~4px
    shadowOpacity: 0.25,
    shadowRadius: wp(2), // ~8px
    elevation: 5,
    borderWidth: wp(0.5), // ~2px
    borderColor: "#228B22",
  },
  labelSection: {
    alignItems: "center",
    marginBottom: hp(1), // ~10px
  },
  codeSection: {
    alignItems: "center",
    marginBottom: hp(1), // ~10px
  },
  codeContainer: {
    flexDirection: "row",
    borderWidth: wp(0.5), // ~2px
    borderColor: "#228B22",
    borderRadius: wp(2.5), // ~10px
    backgroundColor: "#1C2523",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.25) }, // ~2px
    shadowOpacity: 0.3,
    shadowRadius: wp(1), // ~4px
    elevation: 4,
  },
  codeView: {
    paddingHorizontal: wp(4), // ~15px
    paddingVertical: hp(0.6), // ~5px
  },
  hashView: {
    backgroundColor: "#2F3634",
    paddingHorizontal: wp(3), // ~10px
    paddingVertical: hp(0.6), // ~5px
    borderTopRightRadius: wp(2), // ~8px
    borderBottomRightRadius: wp(2), // ~8px
  },
  timerSection: {
    alignItems: "center",
  },
  codeLabel: {
    fontSize: hp(2.2), // ~18px
    color: "#D1E8E6",
    textAlign: "center",
  },
  codeText: {
    fontSize: hp(8), // ~70px
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  hashText: {
    fontSize: hp(8), // ~70px
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  popup: {
    position: "absolute",
    bottom: hp(2.5), // ~20px
    alignSelf: "center",
    backgroundColor: "#2F3634",
    paddingVertical: hp(1), // ~8px
    paddingHorizontal: wp(4), // ~16px
    borderRadius: wp(5), // ~20px
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.25) }, // ~2px
    shadowOpacity: 0.3,
    shadowRadius: wp(1), // ~4px
    elevation: 3,
  },
  popupText: {
    fontSize: hp(1.8), // ~14px
    fontWeight: "500",
    color: "#D1E8E6",
    textAlign: "center",
  },
});
