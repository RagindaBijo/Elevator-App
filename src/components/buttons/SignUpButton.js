import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const SignUpButton = ({ title, onPress, color, disabled, icon }) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: color },
      disabled && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {icon}
    {title && <Text style={styles.text}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});

export default SignUpButton;
