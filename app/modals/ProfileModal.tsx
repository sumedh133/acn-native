import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { logOut } from "@/store/slices/authSlice";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { toCapitalizedWords } from "../helpers/common";
import { showErrorToast, toastConfig } from "@/utils/toastUtils";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import Toast from "react-native-toast-message";
import { getInitials, getRandomColor } from "@/utils/userUtils";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

// ✅ Props typing
type ProfileModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, setVisible }) => {
  const router = useRouter();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const name: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.name) || "";
  const phonenumber: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.phonenumber) || "";
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";
  const initials = getInitials(name);
  const avatarColor = getRandomColor(initials);

  useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, 'profile_modal_show', {
          event_category: 'modal',
          event_label: 'profile',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging modal show:', error);
      }
    }
  }, [visible]);

  const handleClose = () => {
    try {
      logEvent(analytics, 'profile_modal_close', {
        event_category: 'modal',
        event_label: 'profile',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging modal close:', error);
    }
    setVisible(false);
  };

  const handleLogOut = async () => {
    try {
      logEvent(analytics, 'profile_action', {
        event_category: 'modal',
        event_label: 'profile',
        action: 'logout',
        user_type: userType
      });

      await dispatch(logOut());

      setTimeout(() => {
        router.dismissAll();
        router.replace("/");
      }, 300);
    } catch (error) {
      console.error("Error during logout:", error);
      showErrorToast("Some error occured. Please try again.", {
        isInModal: true,
      });
    } finally {
      setVisible(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <Toast config={toastConfig} />

          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* ❌ Close Button */}
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={handleClose}
              >
                <CloseIcon />
              </TouchableOpacity>

              {/* ✅ Header */}
              <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>

              {/* 🧑‍🦱 Avatar and Info */}
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    {/* <MaterialIcons name="person" size={20} color="#726C6C" /> */}
                    <Feather name="user" size={24} color="black" />
                    <Text style={styles.infoText}>
                      {toCapitalizedWords(name)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    {/* <MaterialIcons name="call" size={20} color="#726C6C" /> */}
                    <Ionicons name="call-outline" size={24} color="black" />
                    <Text style={styles.infoText}>{phonenumber?.slice(3)}</Text>
                  </View>
                </View>
              </View>

              {/* 🔴 Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogOut}
              >
                {/* <MaterialIcons name="logout" size={18} color="#DE1135" /> */}
                <SimpleLineIcons name="logout" size={18} color="#DE1135" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ProfileModal;

// ✅ Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    borderColor: "#E5E5E5",
    borderWidth: 2,
    width: "100%",
    maxWidth: 360,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    //fontWeight: 'bold',
    color: "#252626",
    marginRight: 1,
    fontFamily: "Montserrat_700Bold",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#726C6C",
    marginLeft: 8,
    marginRight: 15,
    fontFamily: "Lato",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#DE1135",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 4,
    gap: 4,
  },
  logoutText: {
    color: "#DE1135",
    //fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "bold",
  },
});
