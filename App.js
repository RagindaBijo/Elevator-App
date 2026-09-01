// App.js
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Platform, StatusBar } from "react-native"; // Added StatusBar
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import SplashScreenView from "./screens/SplashScreenView";
import LogInPage from "./screens/LogInPage";
import MainActivity from "./screens/MainActivity";
import SignUpPage from "./screens/SignUpPage";
import AdminPage from "./screens/AdminPage";
import SuccessPage from "./screens/SuccessPage";
import ProfilePage from "./screens/ProfilePage";

const Stack = createNativeStackNavigator();

function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isSignedIn = await AsyncStorage.getItem("isSignedIn");
        const isAdmin = await AsyncStorage.getItem("isAdmin");
        console.log(
          "SplashScreen - isSignedIn:",
          isSignedIn,
          "isAdmin:",
          isAdmin
        );

        let nextScreen;
        if (isSignedIn === "true") {
          nextScreen = isAdmin === "1" ? "AdminPage" : "MainActivity";
        } else {
          nextScreen = "Login";
        }

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace(nextScreen);
        });
      } catch (error) {
        console.log("Error checking login status:", error);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace("Login");
        });
      }
    };

    setTimeout(() => {
      checkLoginStatus();
    }, 1500);
  }, [navigation, fadeAnim]);

  return (
    <Animated.View style={[styles.splashScreen, { opacity: fadeAnim }]}>
      <SplashScreenView />
    </Animated.View>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#1C2523"); // Bottom navigation bar
      NavigationBar.setPositionAsync("absolute");
      StatusBar.setBackgroundColor("#1C2523"); // Solid gray status bar
      StatusBar.setBarStyle("light-content"); // Light text for contrast
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          contentStyle: { backgroundColor: "#1C2523" },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LogInPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainActivity"
          component={MainActivity}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpPage"
          component={SignUpPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminPage"
          component={AdminPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SuccessPage"
          component={SuccessPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfilePage"
          component={ProfilePage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    backgroundColor: "#1C2523",
  },
});
