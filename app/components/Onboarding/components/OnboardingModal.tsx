import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, BackHandler } from 'react-native';
import { useOnboardingContext } from './OnboardingContext';
import OnboardingFlow from './OnboardingFlow';
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  // Force re-render when modal becomes visible to ensure navigator is properly displayed
  const [forceRender, setForceRender] = React.useState(false);
  const { onboardingCompleted } = useOnboardingContext();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  // Track modal visibility
  useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, 'onboarding_modal_open', {
          event_category: 'onboarding',
          event_label: 'modal',
          completed: onboardingCompleted,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging modal open:', error);
      }
    }
  }, [visible]);

  // Handle hardware back button press (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && !onboardingCompleted) {
        try {
          logEvent(analytics, 'onboarding_back_button', {
            event_category: 'onboarding',
            event_label: 'navigation',
            action: 'prevented',
            completed: onboardingCompleted,
            user_type: userType
          });
        } catch (error) {
          console.error('Error logging back button:', error);
        }
        return true; // Prevents default behavior
      }
      return false; // Allows default behavior
    });

    return () => backHandler.remove();
  }, [visible, onboardingCompleted]);

  // Auto-close when onboarding is completed
  useEffect(() => {
    if (onboardingCompleted && visible) {
      try {
        logEvent(analytics, 'onboarding_modal_auto_close', {
          event_category: 'onboarding',
          event_label: 'modal',
          reason: 'completion',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging modal auto-close:', error);
      }
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