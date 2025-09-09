// BottomSheetModal.tsx
import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Background overlay
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text>Update Status Modal</Text>
          {/* Placeholder content */}
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: "red", marginTop: 20 }}>Close Modal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BottomSheetModal;
