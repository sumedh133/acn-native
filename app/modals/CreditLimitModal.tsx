import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Using Expo icons
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CreditLimitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGoPremium: () => void;
  onBuyCredits: () => void;
}

const CreditLimitModal: React.FC<CreditLimitModalProps> = ({
  isVisible,
  onClose,
  onGoPremium,
  onBuyCredits,
}) => {
  const userType = useSelector(
    (state: RootState) => state?.agent?.docData?.userType
  );
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.title}>You've hit 0 credits</Text>

          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Out of credits—top-up
              {userType!=="premium" ? (
                <>
                  {" "}
                  or go <Text style={styles.boldText}>Premium</Text> for
                  unlimited enquiries.
                </>
              ) : (
                <> for more enquiries.</>
              )}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {userType!== "premium"  && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={onGoPremium}
              >
                <Text style={styles.premiumButtonText}>Go Premium</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.creditsButton}
              onPress={onBuyCredits}
            >
              <Text style={styles.creditsButtonText}>Buy Credits</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 36,
    paddingHorizontal: 28,
    position: "relative",
    gap: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#153E3B", // Dark green color matching the design
  },
  messageContainer: {
    marginBottom: 20,
    gap: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    color: "#313131",
  },
  boldText: {
    fontFamily: "Lato_700Bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  premiumButton: {
    flex: 1,
    backgroundColor: "#153E3B", // Dark green color matching the design
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  premiumButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "Lato",
  },
  creditsButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#153E3B", // Dark green color matching the design
  },
  creditsButtonText: {
    color: "#153E3B", // Dark green color matching the design
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "Lato",
  },
});

export default CreditLimitModal;
