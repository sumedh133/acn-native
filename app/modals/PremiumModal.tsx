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
import { Svg, Path, Circle } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";

interface Plan {
  description: string;
}


interface Desc {
  booster: Plan;
  premium: Plan;
}
interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onBrowsePress: () => void;
  planId?:string;
}
const Desc: Desc = {
  premium: {
    description: `Your account is now on ACN Premium. Unlimited-ish enquiries, zero friction—go check out the latest listings.`,
  },
  booster: {
    description: `We’ve added 5 credits to your account. Start enquiring.`,
  },
};
const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  onBrowsePress,
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
         
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }} 
          colors={["#8EE8DE", "#EFFCFA", "#FFFFFF"]} 
          locations={[-0.1051, 0.4663, 0.9107]} 
          style={{borderTopRightRadius:12,borderTopLeftRadius:12}}
        >
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            
            <View style={styles.iconContainer}>
              <Svg width={100} height={100} viewBox="0 0 100 100" fill="none">
                {/* Phone outline */}
                <Path
                  d="M30 15C30 12.2386 32.2386 10 35 10H65C67.7614 10 70 12.2386 70 15V85C70 87.7614 67.7614 90 65 90H35C32.2386 90 30 87.7614 30 85V15Z"
                  stroke="#0A393A"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Phone notch */}
                <Path
                  d="M42 10H58C58 12 55 15 50 15C45 15 42 12 42 10Z"
                  fill="#0A393A"
                />
                {/* Phone home button */}
                <Path
                  d="M45 82H55"
                  stroke="#0A393A"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Check circle */}
                <Circle cx="60" cy="50" r="20" fill="#3CBFC7" />
                <Circle
                  cx="60"
                  cy="50"
                  r="17"
                  stroke="#0A393A"
                  strokeWidth="3"
                  fill="transparent"
                />

                {/* Checkmark */}
                <Path
                  d="M50 50L57 57L70 44"
                  stroke="#0A393A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            
            <Text style={styles.title}>Premium Activated!</Text>
            <Text style={styles.description}>
            {Desc[planId as keyof Desc]?.description}
            </Text>

            
            <View style={styles.button}>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={onBrowsePress}
              >
                <Text style={styles.browseButtonText}>Browse Properties</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  
  modalContent: {
    width: width,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderTopEndRadius: 12,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    color: "#9F9C9C",
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
    color: "#464748",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    width: width,
    borderRadius: 12,
    paddingHorizontal: 26,
    gap: 12,
  },
  browseButton: {
    backgroundColor: "#153E3B", // Dark teal/green color for the button
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  browseButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default PremiumModal;
