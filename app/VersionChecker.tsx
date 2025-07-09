import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Modal,
  BackHandler,
  Platform,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";

interface VersionData {
  version: string;
  forceUpdate: boolean;
  updateMessage?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

const VersionChecker = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [versionData, setVersionData] = useState<VersionData | null>(null);

  // Get version directly from build.gradle versionName
  const currentVersion = "2.0.1"; // This should match android/app/build.gradle versionName

  useEffect(() => {
    const docRef = doc(db, "acn-admin", "version");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as VersionData;
        setVersionData(data);

        // Check if update is required
        if (
          data.forceUpdate &&
          isUpdateRequired(currentVersion, data.version)
        ) {
          setShowUpdateModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, [currentVersion]);

  // Disable back button when force update is required
  useEffect(() => {
    if (showUpdateModal && versionData?.forceUpdate) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          return true; // Prevent back navigation
        }
      );

      return () => backHandler.remove();
    }
  }, [showUpdateModal, versionData?.forceUpdate]);

  const isUpdateRequired = (current: string, required: string): boolean => {
    const currentParts = current.split(".").map(Number);
    const requiredParts = required.split(".").map(Number);

    for (
      let i = 0;
      i < Math.max(currentParts.length, requiredParts.length);
      i++
    ) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;

      if (currentPart < requiredPart) return true;
      if (currentPart > requiredPart) return false;
    }

    return false;
  };

  const handleUpdate = () => {
    const isIOS = Platform.OS === "ios";
    const updateUrl = isIOS
      ? versionData?.appStoreUrl
      : versionData?.playStoreUrl;

    if (updateUrl) {
      Linking.openURL(updateUrl);
    } else {
      // Fallback URLs
      const fallbackUrl = isIOS
        ? "https://apps.apple.com/app/id-your-app-id"
        : "https://play.google.com/store/apps/details?id=your.package.name";
      Linking.openURL(fallbackUrl);
    }
  };

  if (!showUpdateModal || !versionData) {
    return null;
  }

  return (
    <Modal
      visible={showUpdateModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        // Prevent closing if force update is enabled
        if (!versionData.forceUpdate) {
          setShowUpdateModal(false);
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-download-outline" size={64} color="#2D5A4A" />
          </View>

          <Text style={styles.title}>Update Available</Text>

          <Text style={styles.versionText}>
            New Version: {versionData.version}
          </Text>

          <Text style={styles.currentVersionText}>
            Current Version: {currentVersion}
          </Text>

          <Text style={styles.message}>
            {versionData.updateMessage ||
              "A new version of the app is available with important updates and improvements."}
          </Text>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          {!versionData.forceUpdate && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => setShowUpdateModal(false)}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
          )}

          {versionData.forceUpdate && (
            <Text style={styles.forceUpdateText}>
              This update is required to continue using the app.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F0F5F4",
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D5A4A",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
  versionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D5A4A",
    marginBottom: 4,
    textAlign: "center",
  },
  currentVersionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  updateButton: {
    backgroundColor: "#2D5A4A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
  },
  laterButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  forceUpdateText: {
    fontSize: 14,
    color: "#D92D20",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default VersionChecker;
