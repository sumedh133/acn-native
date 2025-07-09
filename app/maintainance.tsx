import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { Ionicons } from "@expo/vector-icons";

const Maintenance = () => {
  const [maintenanceFlag, setMaintenanceFlag] = useState(false);

  useEffect(() => {
    const docRef = doc(db, "acn-admin", "admin");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data?.maintainance === true) {
          setMaintenanceFlag(true);
        } else {
          setMaintenanceFlag(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleContactSupport = () => {
    const phoneNumber = "+919415006092";
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  if (maintenanceFlag) {
    return (
      <View style={styles.container}>
        {/* Green Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Under Maintenance</Text>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Gear Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="settings-outline" size={120} color="#2D5A4A" />
          </View>

          {/* Main Message */}
          <Text style={styles.mainMessage}>We'll be back soon</Text>

          {/* Support CTA Button */}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#2D5A4A", // Dark green matching the design
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 60, // Account for status bar
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 60,
    padding: 20,
  },
  mainMessage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D5A4A",
    textAlign: "center",
    marginBottom: 60,
    fontFamily: "Montserrat_700Bold",
    lineHeight: 40,
  },
  supportButton: {
    backgroundColor: "#2D5A4A",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
  },
});

export default Maintenance;
