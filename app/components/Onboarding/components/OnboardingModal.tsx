import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, BackHandler } from 'react-native';
import { useOnboardingContext } from './OnboardingContext';
import OnboardingFlow from './OnboardingFlow';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  // Force re-render when modal becomes visible to ensure navigator is properly displayed
  const [forceRender, setForceRender] = React.useState(false);
  const { onboardingCompleted } = useOnboardingContext();

  // Handle hardware back button press (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent closing the modal by hardware back button during onboarding
      if (visible && !onboardingCompleted) {
        return true; // Prevents default behavior
      }
      return false; // Allows default behavior
    });

    return () => backHandler.remove();
  }, [visible, onboardingCompleted]);

  // Auto-close when onboarding is completed
  useEffect(() => {
    if (onboardingCompleted && visible) {
      onClose();
    }
  }, [onboardingCompleted, visible, onClose]);

  return (
    <Modal
      visible={visible}
      onShow={() => setForceRender((prev) => !prev)}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* This transparent view serves as a backdrop */}
        <View style={styles.backdrop} />
        
        <View style={styles.navigatorContainer}>
          <OnboardingFlow
            visible={visible}
            onComplete={() => setForceRender((prev) => !prev)}
            onClose={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  navigatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});