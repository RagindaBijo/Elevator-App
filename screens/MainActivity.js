import * as React from "react";
import { useState, useEffect } from "react"; // Add useState, useEffect
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Add AsyncStorage
import i18n from "./i18n"; // Adjust path if needed

import MainPage from "./mainPage";
import ProfilePage from "./ProfilePage";
import LogInPage from "./LogInPage";
import SignUpPage from "./SignUpPage";
import SuccessPage from "./SuccessPage";

const Tab = createBottomTabNavigator();

function CodeScreen() {
  return (
    <View style={styles.container}>
      <MainPage />
    </View>
  );
}

function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ProfilePage navigation={navigation} />
    </View>
  );
}

export default function MainActivity() {
  const [language, setLanguage] = useState(i18n.locale); // Track language state

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.locale = savedLanguage; // Sync i18n with saved language
        }
      } catch (error) {
        console.error("Error loading language in MainActivity:", error);
      }
    };

    loadLanguage();

    // Optional: Listen for language changes in real-time
    const interval = setInterval(loadLanguage, 100); // Poll every secon1
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "#1C2523",
          marginBottom: 10,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: "#00CED1",
        tabBarInactiveTintColor: "#A9B8B6",
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Code") {
            iconName = "qr-code";
          } else if (route.name === "Profile") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Code"
        component={CodeScreen}
        options={{
          headerShown: false,
          tabBarLabel: i18n.t("codeTab"), // Dynamic label
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: i18n.t("profileTab"), // Dynamic label
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2523",
  },
});
