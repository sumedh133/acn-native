import { toastConfig } from "@/utils/toastUtils";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type ConfirmModalProps = {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  generatingEnquiry?: boolean;
  onModalHide: () => void;
  visible: boolean;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message = "You have unsaved changes in the form. Any unsaved data will be lost.",
  onConfirm,
  onCancel,
  generatingEnquiry = false,
  onModalHide,
  visible,
}) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const handleConfirm = () => {
    try {
      logEvent(analytics, "confirm_modal_action", {
        event_category: "modal",
        event_label: "confirm",
        modal_title: title,
        action: "confirm",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging confirm action:", error);
    }
    onConfirm();
  };

  const handleCancel = () => {
    try {
      logEvent(analytics, "confirm_modal_action", {
        event_category: "modal",
        event_label: "cancel",
        modal_title: title,
        action: "cancel",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging cancel action:", error);
    }
    onCancel();
  };

  const handleModalHide = () => {
    try {
      logEvent(analytics, "confirm_modal_hide", {
        event_category: "modal",
        event_label: "hide",
        modal_title: title,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging modal hide:", error);
    }
    onModalHide();
  };

  // Track modal visibility
  React.useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, "confirm_modal_show", {
          event_category: "modal",
          event_label: "show",
          modal_title: title,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging modal show:", error);
      }
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onDismiss={handleModalHide}
    >
      <View style={styles.overlay}>
        <Toast config={toastConfig} />
        <View style={styles.modalContainer}>
          {generatingEnquiry ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#153E3B" />
              <Text style={styles.loadingText}>Processing your enquiry...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#153E3B",
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: "#433F3E",
    fontFamily: "Lato",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#153E3B",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#153E3B",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelText: {
    color: "#153E3B",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmText: {
    color: "#FAFBFC",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ConfirmModal;
