import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface DeleteDraftProps {
  visible: boolean;
  onClose: () => void;
  handleDelete: () => void;
}

const DeleteDraft: React.FC<DeleteDraftProps> = ({
  visible,
  onClose,
  handleDelete,
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  // Track modal visibility
  React.useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, 'delete_draft_modal_show', {
          event_category: 'modal',
          event_label: 'delete_draft',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging modal show:', error);
      }
    }
  }, [visible]);

  const handleDiscard = () => {
    try {
      logEvent(analytics, 'delete_draft_action', {
        event_category: 'modal',
        event_label: 'delete_draft',
        action: 'cancel',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging discard action:', error);
    }
    onClose();
  };

  const handleSave = async () => {
    try {
      logEvent(analytics, 'delete_draft_action', {
        event_category: 'modal',
        event_label: 'delete_draft',
        action: 'confirm_delete',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging delete action:', error);
    }
    handleDelete();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        try {
          logEvent(analytics, 'delete_draft_modal_close', {
            event_category: 'modal',
            event_label: 'delete_draft',
            action: 'system_close',
            user_type: userType
          });
        } catch (error) {
          console.error('Error logging modal close:', error);
        }
        onClose();
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Delete Draft?</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Do you want to delete your this draft?
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.discardButton}
              onPress={handleDiscard}
            >
              <Text style={styles.discardButtonText}>No</Text>
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalContent: {
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 4,
  },
  modalText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#344054",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
    width: "48%",
  },
  primaryButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  secondaryButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#344054",
  },
  discardButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FDA29B",
    width: "48%",
  },
  discardButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#D92D20",
  },
  buttonSpacer: {
    width: 12,
  },
});

export default DeleteDraft;
