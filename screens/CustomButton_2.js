// CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomButton({
  title,
  onPress,
  color,
  style,
  textStyle,
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      onPress={onPress}
    >
      <Text style={[styles.defaultText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
