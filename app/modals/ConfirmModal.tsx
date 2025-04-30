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
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onDismiss={onModalHide}
    >
      <View style={styles.overlay}>
        <Toast config={toastConfig} />
        <View style={styles.modalContainer}>
          {generatingEnquiry ? (
            <View style={styles.row}>
              <Text style={styles.title}>
                Generating Enquiry! Please wait...
              </Text>
              <ActivityIndicator size="small" color="#153E3B" />
            </View>
          ) : (
            <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
