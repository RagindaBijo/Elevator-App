import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from "react-native";

const LanguageToggle = ({ onLanguageChange, language }) => {
  const [position] = useState(new Animated.Value(language === "en" ? 0 : 1)); // Initialize based on prop

  const languages = [
    { code: "en", flag: require("../assets/en.png") },
    { code: "ka", flag: require("../assets/ge.png") },
  ];

  useEffect(() => {
    // Sync position with the incoming language prop
    Animated.timing(position, {
      toValue: language === "en" ? 0 : 1,
      duration: 0, // No animation on initial load
      useNativeDriver: true,
    }).start();
  }, [language, position]);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ka" : "en";
    Animated.timing(position, {
      toValue: language === "en" ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const switchTranslateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container}>
      <View style={styles.switchBar}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.switchIndicator,
              { transform: [{ translateX: switchTranslateX }] },
            ]}
          />
        </View>
        <View style={styles.flagsContainer}>
          <Image source={languages[0].flag} style={styles.flagImage} />
          <Image source={languages[1].flag} style={styles.flagImage} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  switchBar: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  barBackground: {
    width: 80,
    height: 36,
    backgroundColor: "#2F3634",
    borderRadius: 18,
    position: "absolute",
    top: 0,
    left: 0,
  },
  switchIndicator: {
    width: 36,
    height: 36,
    backgroundColor: "#00CED1",
    borderRadius: 18,
    position: "absolute",
    top: 0,
    left: 0,
  },
  flagsContainer: {
    flexDirection: "row",
    width: 80,
    justifyContent: "space-between",
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  flagImage: {
    width: 30,
    height: 30,
    borderRadius: 18,
    resizeMode: "contain",
  },
});

export default LanguageToggle;
