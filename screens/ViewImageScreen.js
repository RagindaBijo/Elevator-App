import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function ViewImageScreen({ route, navigation }) {
  const { imageUrl } = route.params; // Get image URL from navigation

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("./assets/close.png")}
          style={styles.closeIcon}
        />
      </TouchableOpacity>

      <Image source={{ uri: imageUrl }} style={styles.fullImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeIcon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
});
