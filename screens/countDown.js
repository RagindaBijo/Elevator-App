// countDown.js

import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Set to midnight of the current day
      const timeDifference = midnight - now; // Get the difference in milliseconds
      setTimeLeft(timeDifference);
    };

    // Update the countdown every second
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    // Initial call to set the time left
    calculateTimeLeft();

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    // position: "absolute",
    fontSize: 18,
    fontWeight: "bold",
    color: "cyan",
    letterSpacing: 3,
    minWidth: 100, // Ensures the text container does not shrink below this width
    textAlign: "center", // Centers the text
  },
});

export default CountdownTimer;
