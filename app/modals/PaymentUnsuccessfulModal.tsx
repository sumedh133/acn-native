import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Svg, Path, Rect, Circle } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";

interface PaymentUnsuccessfulModalProps {
  visible: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  planId?:string,
}
interface Plan {
  description: string;
}

interface Desc {
  booster: Plan;
  premium: Plan;
}


const Desc: Desc = {
  premium: {
    description: `Payment failed—subscription not activated. Please retry or use another method.`,
  },
  booster: {
    description: `Transaction declined—no credits added. Please try again or use a different payment method.`,
  },
};

const PaymentUnsuccessfulModal: React.FC<PaymentUnsuccessfulModalProps> = ({
  visible,
  onClose,
  onTryAgain,
  planId,
}) => {
 
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          // For a 130.55deg angle (approx. from top-left to bottom-right)
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          colors={["#FFEDED", "#FFFFFF"]}
          locations={[0, 0.8867]}
          style={{ borderTopRightRadius: 12, borderTopLeftRadius: 12 }}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Svg width={100} height={100} viewBox="0 0 100 100" fill="none">
                {/* Credit card */}
                <Rect
                  x="10"
                  y="25"
                  width="70"
                  height="50"
                  rx="10"
                  stroke="#000"
                  strokeWidth="4"
                  fill="none"
                />

                {/* Gold strip */}
                <Rect x="10" y="48" width="70" height="3" fill="black" />
                <Rect x="10" y="40" width="70" height="8" fill="#EFB72E" />
                <Rect x="10" y="38" width="70" height="3" fill="black" />

                {/* Card details */}
                <Rect x="20" y="55" width="15" height="5" rx="2" fill="#000" />
                <Rect x="20" y="65" width="25" height="5" rx="2" fill="#000" />

                {/* Error circle */}
                <Circle cx="70" cy="70" r="16" fill="#E71D36" />
                <Circle
                  cx="70"
                  cy="70"
                  r="14"
                  stroke="#000"
                  strokeWidth="3"
                  fill="transparent"
                />

                {/* X mark */}
                <Path
                  d="M63 63L77 77M77 63L63 77"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            {/* Text content */}
            <Text style={styles.title}>Payment unsuccessful</Text>
            <Text style={styles.description}>{Desc[planId as keyof Desc]?.description}</Text>

            {/* Try again button */}
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={onTryAgain}
            >
              <Text style={styles.tryAgainButtonText}>Try again!</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    // backgroundColor: '#FFEDED', // Light pink background
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#433F3E",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontWeight: 500,
    paddingHorizontal: 20,
    color: "#464748",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  tryAgainButton: {
    backgroundColor: "#0A393A", // Dark teal/green button color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: "90%",
    alignItems: "center",
  },
  tryAgainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PaymentUnsuccessfulModal;
