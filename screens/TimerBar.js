import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import CountdownTimer from "./countDown";
import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TimerBar = () => {
  // Calculate the time left until midnight (00:00)
  const calculateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set to midnight of the current day
    return Math.floor((midnight - now) / 1000); // Convert to seconds
  };

  const totalTime = 86400; // Total time in seconds (24 hours = 86400 seconds)
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeLeft()); // Time left in seconds
  const animatedValue = useRef(new Animated.Value(calculateTimeLeft())).current;

  const size = 330; // Wrapper size (200px inner + 2*10px border)
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const [code, setCode] = useState("..."); // Store fetched code
  const [isOffline, setIsOffline] = useState(false); // Track internet status

  useEffect(() => {
    const fetchCode = async () => {
      try {
        // Check internet connection
        const netInfo = await NetInfo.fetch();
        setIsOffline(!netInfo.isConnected); // Set offline status

        // Load cached data first
        const cachedCode = await AsyncStorage.getItem("cachedCode");
        if (cachedCode) {
          setCode(cachedCode); // Show cached data first
        }

        // Fetch new data from Firestore
        const docRef = doc(db, "Elevator", "T9iqwrUFebbSxGS317oG");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.number) {
            const newCode = data.number.toString(); // Extract only the "number" field
            setCode(newCode); // Update UI
            await AsyncStorage.setItem("cachedCode", newCode); // Save new data in cache
          } else {
            setCode("No Number Found"); // In case "number" is missing
          }
        } else {
          setCode("No Data");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setCode("Error");
      }
    };

    fetchCode();
  }, []);

  useEffect(() => {
    // Update timer every second
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;
        return newTime < 0 ? totalTime : newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate percentage of time remaining
    const percentageLeft = (timeRemaining / totalTime) * 100;

    // Animate the change in time remaining
    Animated.timing(animatedValue, {
      toValue: timeRemaining,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Set the strokeDashoffset based on the percentage left
    const strokeDashoffset = (percentageLeft / 100) * circumference;
    setStrokeDashoffset(strokeDashoffset);
  }, [timeRemaining]);

  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference); // State to store the strokeDashoffset

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.above}>
        {/* Background lime circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="lime"
          strokeWidth={strokeWidth}
          fill="transparent"
          rotation="-90" // Start at 12 o’clock
          originX={size / 2}
          originY={size / 2}
        />
        {/* Animated gray circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="gray"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90" // Starting at 12 o’clock
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.innerCircle}>
        <View style={styles.timeBorder}>
          <CountdownTimer />
        </View>

        <View style={styles.codeBorder}>
          <Text style={styles.codeText}>{code}</Text>
          {/* Display Firestore Data */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  above: {
    flex: 1,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    width: 220,
    height: 220,
    position: "relative",
  },
  innerCircle: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 200,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    margin: 5,
  },
  timer: {
    fontSize: 24,
  },

  codeBorder: {
    backgroundColor: "#3b3b3b",
    width: "50%",
    height: "18%",
    borderWidth: 4,
    borderColor: "gray",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  timeBorder: {
    backgroundColor: "#3b3b3b",
    width: "38%",
    height: "10%",
    borderWidth: 3,
    borderColor: "gray",
    borderRadius: 20,
    top: "-20%",
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    position: "absolute",
    fontSize: 45,
    fontWeight: "bold",
    color: "cyan",
    letterSpacing: 5,
  },
});

export default TimerBar;
