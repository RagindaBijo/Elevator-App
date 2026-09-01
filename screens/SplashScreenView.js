import { View, StyleSheet, Image } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../assets/icon.png")}
          style={styles.Image}
        ></Image>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C2523",
  },
  Image: {
    borderRadius: 20,
    width: 150,
    height: 150,
    resizeMode: "cover",
  },
});
