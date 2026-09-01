import CustomButton from "./CustomButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions, // Added Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import KeyboardAvoidingContainer from "./KeyboardAvoidingContainer";
import LanguageToggle from "./LanguageToggle";
import i18n from "./i18n"; // Adjust path if needed

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Helper functions for responsive sizing
const wp = (percentage) => (width * percentage) / 100; // Width percentage
const hp = (percentage) => (height * percentage) / 100; // Height percentage

export default function ProfilePage({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showId, setShowId] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    email: "",
    idNumber: "",
    number: "",
    profileImageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(i18n.locale);
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log("ProfilePage useEffect triggered, isFocused:", isFocused);

    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.locale = savedLanguage;
        }
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        console.log("User ID from AsyncStorage:", userId);
        if (!userId) {
          navigation.replace("Login");
          return;
        }

        const response = await fetch(
          `https://new-elevator-api.elevator-rand.workers.dev/user/${userId}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched user data:", data);

        // Ensure all fields are strings and handle null/undefined values
        setUserData({
          name: data.name?.toString() || "",
          surname: data.surname?.toString() || "",
          email: data.email?.toString() || "",
          idNumber: data.idNumber?.toString() || "",
          number: data.number?.toString() || "",
          profileImageUrl: data.profileImageUrl?.toString() || "",
        });

        // Set phone number for editing
        setPhoneNumber(data.number?.toString() || "");

        // Set profile image with cache-busting timestamp
        setProfileImage(
          data.profileImageUrl
            ? { uri: `${data.profileImageUrl}?t=${new Date().getTime()}` }
            : null
        );
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        Alert.alert(i18n.t("errorTitle"), i18n.t("errorMessage"));
        navigation.replace("Login");
      } finally {
        setLoading(false);
      }

      if (isFocused) {
        setShowId(false);
        setIsEditingPhone(false);
        setShowStatusInfo(false);
      }
    };

    loadLanguage();
    fetchUserData();
  }, [isFocused, navigation]);

  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
    try {
      await AsyncStorage.setItem("appLanguage", newLanguage);
      console.log("Language saved:", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(i18n.t("logOutTitle"), "", [
      {
        text: i18n.t("logOutNo"),
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: i18n.t("logOutYes"),
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("isAdmin");
            await AsyncStorage.removeItem("isSignedIn");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
            console.log("User logged out successfully");
          } catch (error) {
            Alert.alert(i18n.t("errorTitle"), error.message);
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        i18n.t("permissionDeniedTitle"),
        i18n.t("permissionDeniedMessage")
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      await uploadImage(imageUri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("No user ID found");

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Prepare FormData for upload
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: blob.type || "image/jpeg",
        name: "profile.jpg",
      });
      formData.append("userId", userId);

      const uploadResponse = await fetch(
        "https://new-elevator-api.elevator-rand.workers.dev/upload-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed: ${uploadResponse.status}`);
      }

      const data = await uploadResponse.json();
      if (data.success) {
        const newImageUrl = `${data.url}?t=${new Date().getTime()}`;
        setUserData((prev) => ({ ...prev, profileImageUrl: data.url }));
        setProfileImage({ uri: newImageUrl });
        console.log("Image uploaded successfully, URL:", data.url);
      } else {
        throw new Error("Upload response indicated failure");
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
      Alert.alert(i18n.t("uploadFailedTitle"), i18n.t("uploadFailedMessage"));
    }
  };

  const handleEditPhone = () => {
    if (!isEditingPhone) {
      setTempPhoneNumber(phoneNumber);
    }
    setIsEditingPhone(!isEditingPhone);
  };

  const handleSavePhone = async () => {
    const trimmedPhone = tempPhoneNumber.trim();
    if (!trimmedPhone) {
      Alert.alert(i18n.t("invalidPhoneTitle"), i18n.t("invalidPhoneMessage"));
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("No user ID found");

      const response = await fetch(
        `https://new-elevator-api.elevator-rand.workers.dev/user/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: trimmedPhone }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error(`Failed to update phone: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPhoneNumber(trimmedPhone);
        setUserData((prev) => ({ ...prev, number: trimmedPhone }));
        setIsEditingPhone(false);
        console.log("Phone number updated successfully:", trimmedPhone);
      } else {
        throw new Error("Update response indicated failure");
      }
    } catch (error) {
      console.error("Error updating phone number:", error.message);
      Alert.alert(i18n.t("updateFailedTitle"), i18n.t("errorMessage"));
    }
  };

  const handleCancelEdit = () => {
    setTempPhoneNumber("");
    setIsEditingPhone(false);
  };

  const handleIdVisibility = () => {
    if (isEditingPhone) {
      handleCancelEdit();
    }
    setShowId(!showId);
  };

  const handleProfileImagePress = () => {
    if (isEditingPhone) {
      handleCancelEdit();
    }
    setModalVisible(true);
  };

  const handleStatusInfoToggle = () => {
    if (isEditingPhone) {
      handleCancelEdit();
    }
    setShowStatusInfo(!showStatusInfo);
  };

  const handlePhotoChangePress = () => {
    if (isEditingPhone) {
      handleCancelEdit();
    }
    pickImage();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00CED1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.middleSection}>
        <View style={styles.profileWrapper}>
          <TouchableOpacity onPress={handleProfileImagePress}>
            <View style={styles.profileContainer}>
              <Image
                source={profileImage || require("../assets/icon1.jpg")}
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePhotoChangePress}
            style={styles.changePhotoContainer}
          >
            <Ionicons name="add" size={wp(6)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.profileName}
        >{`${userData.name} ${userData.surname}`}</Text>

        <View style={styles.textBorder}>
          <View style={styles.logoContainer}>
            <Ionicons name="mail" size={wp(8)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={styles.dataText}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              minimumFontScale={0.5}
            >
              {userData.email}
            </Text>
          </View>
        </View>

        <View style={styles.textBorder}>
          <View style={styles.logoContainer}>
            <Ionicons name="id-card-outline" size={wp(8)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={styles.dataText}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              minimumFontScale={0.5}
            >
              {showId ? userData.idNumber : "••••••••"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleIdVisibility}
            style={styles.editContainer}
          >
            <Ionicons
              name={showId ? "eye-off" : "eye"}
              size={wp(6)}
              color="#D1E8E6"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.textBorder}>
          <View style={styles.logoContainer}>
            <Ionicons name="call" size={wp(8)} color="#00CED1" />
          </View>
          <View style={styles.textContainer}>
            {isEditingPhone ? (
              <TextInput
                style={styles.dataInput}
                value={tempPhoneNumber}
                onChangeText={setTempPhoneNumber}
                keyboardType="phone-pad"
                autoFocus={true}
              />
            ) : (
              <Text
                style={styles.dataText}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                minimumFontScale={0.5}
              >
                {phoneNumber}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={isEditingPhone ? handleCancelEdit : handleEditPhone}
            style={styles.editContainer}
          >
            <Ionicons
              name={isEditingPhone ? "close-sharp" : "pencil"}
              size={wp(6)}
              color="#D1E8E6"
            />
          </TouchableOpacity>
          {isEditingPhone && (
            <TouchableOpacity
              onPress={handleSavePhone}
              style={styles.saveContainer}
            >
              <Ionicons name="checkmark" size={wp(6)} color="#D1E8E6" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusBorder}>
          <View style={styles.logoContainer}>
            <Ionicons name="checkmark-circle" size={wp(8)} color="lime" />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={styles.statusText}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              minimumFontScale={0.5}
            >
              {i18n.t("activeStatus")}
            </Text>
          </View>
          <View style={styles.placeholderContainer}>
            <TouchableOpacity onPress={handleStatusInfoToggle}>
              <Ionicons name="alert" size={wp(6)} color="#D1E8E6" />
            </TouchableOpacity>
            {showStatusInfo && (
              <View style={styles.statusOverlay}>
                <Text style={styles.overlayText}>{i18n.t("statusInfo")}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.languageToggleContainer}>
          <LanguageToggle
            onLanguageChange={handleLanguageChange}
            language={language}
          />
        </View>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBackground}
              onPress={() => setModalVisible(false)}
              activeOpacity={1}
            >
              <Image
                source={profileImage || require("../assets/icon1.jpg")}
                style={styles.fullImage}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

      <View style={styles.outerSection}>
        <CustomButton
          title={i18n.t("logOutButton")}
          onPress={handleLogout}
          color="#32CD32"
        />
      </View>
    </View>
  );
}

// Styles remain unchanged as requested
const styles = StyleSheet.create({
  container: {
    flex: 1, // 100% of screen height
    backgroundColor: "#1C2523",
    justifyContent: "center",
  },
  middleSection: {
    paddingTop: hp(6), // ~50px on 1080px height
    paddingStart: wp(8), // ~30px on 360px width
    paddingEnd: wp(8),
    backgroundColor: "#1C2523",
    flex: 8, // 80% of container height
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  outerSection: {
    backgroundColor: "#1C2523",
    flex: 1, // 10% of container height
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(2), // ~20px
  },
  profileWrapper: {
    position: "relative",
    width: wp(40), // ~150px on 360px width
    height: wp(40), // Square aspect ratio
  },
  profileContainer: {
    width: "100%", // Full width of profileWrapper
    height: "100%", // Full height of profileWrapper
    borderRadius: wp(20), // Half of width for circular shape
    overflow: "hidden",
    borderWidth: wp(1), // ~4px
    borderColor: "#228B22",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changePhotoContainer: {
    position: "absolute",
    bottom: wp(2.5), // ~9px
    right: wp(2.5),
    width: wp(8), // ~30px
    height: wp(8),
    borderRadius: wp(5), // ~18px
    backgroundColor: "#228B22",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#1C2523",
  },
  profileName: {
    fontSize: hp(3), // ~24px on 1080px height
    fontWeight: "bold",
    color: "#D1E8E6",
    marginVertical: hp(1), // ~10px
  },
  modalContainer: {
    flex: 1, // Full screen
    backgroundColor: "rgba(28, 37, 35, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%", // 90% of screen width
    height: "80%", // 80% of screen height
    resizeMode: "contain",
  },
  textBorder: {
    flexDirection: "row",
    backgroundColor: "#2F3634",
    width: "100%", // Full width of middleSection
    height: hp(7), // ~10% adjusted to fit better
    borderWidth: wp(0.5), // ~2px
    borderColor: "#228B22",
    borderRadius: wp(5), // ~20px
    paddingStart: wp(3), // ~10px
    paddingEnd: wp(3),
    alignItems: "center",
    marginVertical: hp(1), // ~10px
  },
  statusBorder: {
    flexDirection: "row",
    backgroundColor: "#2F3634",
    width: "100%",
    height: hp(7), // ~10% adjusted
    borderWidth: wp(0.5),
    borderColor: "#228B22",
    borderRadius: wp(5),
    paddingStart: wp(3),
    paddingEnd: wp(3),
    alignItems: "center",
    marginVertical: hp(1),
  },
  languageToggleContainer: {
    alignSelf: "flex-end",
    marginTop: hp(1), // ~10px
  },
  dataText: {
    fontSize: hp(2.2), // ~18px
    fontWeight: "bold",
    color: "cyan",
  },
  statusText: {
    fontSize: hp(2.2), // ~18px
    fontWeight: "bold",
    color: "lime",
  },
  dataInput: {
    fontSize: hp(2.2), // ~18px
    fontWeight: "bold",
    color: "#D1E8E6",
    flex: 1,
  },
  logoContainer: {
    marginRight: wp(3), // ~10px
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  editContainer: {
    marginLeft: wp(3), // ~10px
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveContainer: {
    marginLeft: wp(3), // ~10px
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  placeholderContainer: {
    marginLeft: wp(3), // ~10px
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "relative",
  },
  textContainer: {
    paddingStart: wp(3), // ~10px
    paddingEnd: wp(3),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: hp(5), // ~45px
    right: wp(-3), // ~ -10px
    backgroundColor: "#2F3634",
    padding: wp(3), // ~10px
    borderRadius: wp(3), // ~10px
    borderWidth: wp(0.3), // ~1px
    borderColor: "#228B22",
    width: wp(50), // ~200px
    zIndex: 10,
  },
  overlayText: {
    color: "#D1E8E6",
    fontSize: hp(1.8), // ~14px
  },
});
