import { db } from "@/app/config/firebase";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { updateAgentDocData } from "@/store/slices/agentSlice";
import { RootState } from "@/store/store";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

interface UpdateDetails {
  businessName?: string;
  gstNo?: string;
  [key: string]: any;
}

type BusinessDetailsModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  isVisible,
  onClose,
}) => {
  const dispatch = useDispatch();

  const bName =
    useSelector((state: RootState) => state?.agent?.docData?.businessName) ||
    null;
  const gNum =
    useSelector((state: RootState) => state?.agent?.docData?.gstNo) || null;
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const [businessName, setBusinessName] = useState(bName || "");
  const [gstNo, setGstNo] = useState(gNum || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);

    if (!cpId) {
      showErrorToast("Unexpected Error Occured. Please try again later.");
      setSaving(false);
      return;
    }

    const trimmedBusinessName = businessName?.trim() || "";
    const trimmedGstNo = gstNo?.trim() || "";

    if (!trimmedBusinessName && !trimmedGstNo) {
      showErrorToast("No data entered.");
      setSaving(false);
      return;
    }

    let updateDetails: UpdateDetails = {};

    if (trimmedBusinessName !== bName) {
      updateDetails.businessName = trimmedBusinessName;
    }

    if (trimmedGstNo !== gNum) {
      updateDetails.gstNo = trimmedGstNo;
    }

    if (Object.keys(updateDetails).length === 0) {
      showErrorToast(
        "No changes detected. Please fill or change the details to submit.",
      );
      setSaving(false);
      return;
    }

    try {
      const docRef = doc(db, "agents", cpId);
      await updateDoc(docRef, updateDetails);

      dispatch(updateAgentDocData(updateDetails));

      showSuccessToast("Business details updated successfully");
      setSaving(false);

      setTimeout(() => {
        onClose();
      }, 1000);

      return;
    } catch (error) {
      console.error(error);
      showErrorToast("Unexpected Error Occured. Please try again later.");
      setSaving(false);
      return;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Text style={styles.heading}>Please enter details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>GST No.</Text>
                <TextInput
                  style={styles.input}
                  value={gstNo}
                  onChangeText={setGstNo}
                  placeholder="Enter GST no."
                  placeholderTextColor="#A9A9A9"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name</Text>
                <TextInput
                  style={styles.input}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Enter business name"
                  placeholderTextColor="#A9A9A9"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.submitButtonText}>
                  {saving ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BusinessDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 25,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    elevation: 5,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#153E3B",
    marginBottom: 24,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#313534",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#153E3B",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 12,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "condensedBold",
    color: "#666",
  },
});
