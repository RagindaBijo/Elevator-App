import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";

const KeyboardAvoidingContainer = ({ children, style, backgroundColor }) => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor || "#1C2523" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "transparent" }} // Transparent gap
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 20,
  },
});

export default KeyboardAvoidingContainer;
