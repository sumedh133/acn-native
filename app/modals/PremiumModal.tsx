import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onBrowsePress: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  onBrowsePress,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Phone with checkmark icon */}
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
              <Circle cx="60" cy="50" r="17" stroke="#0A393A" strokeWidth="3" fill="transparent" />
              
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

          {/* Text content */}
          <Text style={styles.title}>Premium Activated!</Text>
          <Text style={styles.description}>
            Your account is now on ACN Premium.{'\n'}
            Unlimited-ish enquiries, zero friction—go check{'\n'}
            out the latest listings.
          </Text>

          {/* Browse button */}
          <TouchableOpacity style={styles.browseButton} onPress={onBrowsePress}>
            <Text style={styles.browseButtonText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#d7f5f0', // Light teal background
    // Gradient effect created using backgroundColor for simplicity
    // Use a library like react-native-linear-gradient for actual gradient
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#0A393A', // Dark teal/green color for the button
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumModal;
