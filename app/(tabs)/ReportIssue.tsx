import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ARPrimaryButton from "../components/Button/ARPrimaryButton";
import submitIssue from "../helpers/submitIssue";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CustomSelectDropdown from "../components/CustomSelectDropdown";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/utils/toastUtils";
import Offline from "../components/Offline";
import { getUnixDateTime } from "../helpers/getUnixDateTime";

const ReportIssue = () => {
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean;}>({});
  const handleFocus = (fieldName: string) => {setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));};
  const handleBlur = (fieldName: string) => {setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));};

  const [issue, setIssue] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState(false);

  const [isRendered, setIsRendered] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<{
    issue?: string;
    issueType?: string;
    description?: string;
    confirm?: string;
  }>({});

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const issueOptions = [
    { label: "User Behavior", value: "User Behavior" },
    { label: "Content", value: "Content" },
    { label: "Account Misuse", value: "Account Misuse" },
    { label: "Other", value: "Other" },
  ];

  const issueTypeOptions = [
    { label: "Spam", value: "Spam" },
    { label: "Misleading Data", value: "Misleading Data" },
    { label: "Fraud", value: "Fraud" },
    { label: "Hate Speech", value: "Hate Speech" },
    { label: "Security Concern", value: "Security Concern" },
    { label: "Other", value: "Other" },
  ];

  const clearForm = () => {
    // Reset form fields
    setIssue("");
    setIssueType("");
    setDescription("");
    setConfirm(false); // Reset to default value

    // Clear errors
    setError({});

    // Reset focus states
    setFocusedFields({});
    showInfoToast("Form cleared successfully!");
  };

  const handleSubmit = async () => {
    const newErrors: any = {};

    if (!issue.trim()) {
      newErrors.issue = "Please select an issue.";
    }

    if (!issueType.trim()) {
      newErrors.issueType = "Please select issue type.";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description of the issue.";
    }

    if (!confirm) {
      newErrors.confirm = "Please confirm before submiting.";
    }

    setError(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }
    setSaving(true);

    try {
      const issueReport = {
        issue,
        issueType,
        description,
      };

      await submitIssue(issueReport, cpId);

      clearForm();
      showSuccessToast("Requirement submitted successfully!");
    } catch (error) {
      showErrorToast(
        "An error occurred while submitting the requirement. Please try again."
      );
      console.error("An error occurred:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRendered(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isConnectedToInternet) {
    return <Offline />;
  }

  if (!isRendered) {
    return (
      <ActivityIndicator
        style={{ margin: "auto" }}
        size="large"
        color="#153E3B"
      />
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              What would you like to report?{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <View>
              <CustomSelectDropdown
                selectedValue={issue}
                onValueChange={setIssue}
                options={issueOptions}
                placeholder="Select"
              />
            </View>
            {error.issue && <Text style={styles.errorText}>{error.issue}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Issue type <Text style={styles.required}>*</Text>
            </Text>
            <View>
              <CustomSelectDropdown
                selectedValue={issueType}
                onValueChange={setIssueType}
                options={issueTypeOptions}
                placeholder="Select"
              />
            </View>
            {error.issueType && (
              <Text style={styles.errorText}>{error.issueType}</Text>
            )}
          </View>

          {/* Requirement Details */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Please describe issue in detail.{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              onFocus={() => handleFocus("issueDetails")}
              onBlur={() => handleBlur("issueDetails")}
              placeholder="Type here..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[
                styles.textInput,
                styles.textArea,
                focusedFields["issueDetails"] && styles.focusedInput,
              ]}
            />
            {error.description && (
              <Text style={styles.errorText}>{error.description}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setConfirm(!confirm)}
          >
            <View style={[styles.checkbox, confirm && styles.checkedBox]}>
              {confirm && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I confirm this report is accurate and truthful.{" "}
              <Text style={styles.required}>*</Text>
            </Text>
          </TouchableOpacity>
          {error.confirm && (
            <Text style={styles.errorText}>{error.confirm}</Text>
          )}

          {/* Bottom spacing */}
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footerButtons}>
          {/* Submit Button */}
          <ARPrimaryButton
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size={"small"} color={"white"} />
            ) : (
              "Submit Issue"
            )}
          </ARPrimaryButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 60,
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    // paddingBottom: 80,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F6F7",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Montserrat_700Bold",
  },
  required: {
    color: "red",
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  focusedInput: {
    borderColor: "#F59E0B", // Yellow-600 equivalent
    borderWidth: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#9CA3AF", // Gray-400 equivalent
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 12,
  },
  checkedBox: {
    backgroundColor: "#003F3B", // Blue-500 equivalent
    borderColor: "#003F3B", // Blue-600 equivalent
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444", // Red-500 equivalent
    fontSize: 12,
    marginTop: 4,
  },
  footerButtons: {
    // position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: "60%",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#153E3B",
    flexShrink: 1,
  },
});

export default ReportIssue;
