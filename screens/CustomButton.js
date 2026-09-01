import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomButton({ title, onPress, color = "#FF4500" }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFE5D9", // New primary text color
    textAlign: "center",
  },
});
