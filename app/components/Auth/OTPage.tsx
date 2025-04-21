import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Dimensions,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { logOut, signIn } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import { OtpInput } from "react-native-otp-entry";
import { AntDesign } from '@expo/vector-icons';
import { showErrorToast, showInfoToast } from '@/utils/toastUtils';
const { width, height } = Dimensions.get('window');

export default function OTPage() {
  const router = useRouter();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const { width } = useWindowDimensions();

  const { phonenumber } = useSelector((state: RootState) => state.agent);
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState<String>('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const { verificationId } = useLocalSearchParams();

  // Firebase auth state listener effect
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        // User is logged in - treat this like successful OTP verification
        dispatch(signIn());
        router.dismissAll();
        router.replace('/(tabs)/properties');
        setIsVerifying(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer, canResend]);

  const handleVerify = async () => {
    setErrorMessage('');
    setIsVerifying(true);

    if (!otp || otp.length < 6) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      setIsVerifying(false);
      return;
    }

    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId as string, otp.toString());

      const userCredential = await auth().signInWithCredential(credential);

      if (userCredential?.user?.phoneNumber) {
        dispatch(signIn());
        router.dismissAll();
        router.replace('/(tabs)/properties');
        setIsVerifying(false);
      } else {

        setErrorMessage('Failed to sign in. Please try again.');
        setIsVerifying(false);
      }
    } catch (error: any) {
      setErrorMessage('Invalid OTP code.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const confirmation = await auth().signInWithPhoneNumber(phonenumber || '', true);
      setResendTimer(30);
      setCanResend(false);
      //Alert.alert('Success', `OTP resent to ${phonenumber}`);
      showInfoToast('OTP resent successfully!')
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      //Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      showErrorToast('Failed to resend OTP. Please try again.')
    }
  };

  const handleBack = () => {
    dispatch(logOut());
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { fontSize: 28 }]}>Welcome to ACN</Text>
      <Text style={[styles.otpInfo, { fontSize: 16 }]}>
        OTP sent to <Text style={styles.phone}> {phonenumber?.slice(0, 3)} {phonenumber?.slice(3)}</Text>
      </Text>
      <TouchableOpacity
        onPress={handleResend}
        style={[
          styles.resendButton,
          canResend ? styles.resendButtonActive : styles.resendButtonDisabled
        ]}
        disabled={!canResend}
      >
        <Text style={[
          styles.resendText,
          canResend ? styles.resendTextActive : styles.resendTextDisabled
        ]}>
          {canResend ? 'Resend Code' : `Resend Code (${resendTimer})`}
        </Text>
      </TouchableOpacity>

      <View style={styles.otpRow}>
        <OtpInput
          numberOfDigits={6}
          autoFocus={true}
          blurOnFilled={true}
          onTextChange={(text) => setOtp(text)}
          theme={{
            pinCodeContainerStyle: styles.pinCodeContainer,
            focusStickStyle: styles.focusStick,
            focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            pinCodeTextStyle: styles.otpText,
          }}

        />
      </View>
      <View style={{ marginBottom: 40, minHeight: 24 }}>
        {errorMessage && (
          <Text style={{ color: '#EF4444', fontFamily: 'System', fontSize: 12, lineHeight: 21 }}>
            *{errorMessage}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.verifyButton,
          otp.length === 6 && !isVerifying && styles.verifyButtonActive,
          // { padding: width * 0.04 },
        ]}
        onPress={handleVerify}
        disabled={otp.length !== 6 || isVerifying}
      >
        <Text style={[styles.verifyText, { fontSize: width * 0.045 }]}>
          {isVerifying ?
            <ActivityIndicator size="large" color="#ffffff" />
            :
            "Verify OTP"
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backContiner} onPress={handleBack}>
        <AntDesign name="arrowleft" size={20} color="#153E3B" />
        <Text style={[styles.backText, { fontSize: 18 }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: width * 0.05, backgroundColor: '#fff' },
  heading: { fontWeight: 'bold', marginBottom: 12, marginTop: 0, textAlign: 'left' },
  otpInfo: { color: '#888', marginBottom: 11, textAlign: 'left', marginTop: 8 },
  phone: { fontWeight: 'bold', color: '#153E3B', textDecorationLine: 'underline' },
  resendButton: {
    marginTop: 11,
    // marginBottom: 40,
    alignSelf: 'flex-start',
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  resendButtonActive: {
    backgroundColor: '#F0FFFF',
    borderColor: '#153E3B',
  },
  resendButtonDisabled: {
    backgroundColor: 'rgba(240, 255, 255, 0.2)',
    borderColor: 'rgba(21, 62, 59, 0.2)',
  },
  resendText: {
    fontWeight: 'semibold',
    fontSize: 12,
    fontFamily: 'sans-serif',
    lineHeight: 18,
  },
  resendTextActive: {
    color: '#153E3B',
  },
  resendTextDisabled: {
    color: 'rgba(21, 62, 59, 0.5)',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 40,
    marginTop: 40,
  },
  otpInput: {
    borderBottomWidth: 2,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  otpText: {
    fontWeight: 'semibold',
    fontSize: 20,
    fontFamily: 'sans-serif',
  },
  verifyButton: {
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: "center",
    borderRadius: 12,
    height: 60,
  },
  verifyButtonActive: {
    backgroundColor: '#153E3B',
  },
  verifyText: { color: '#fff', fontWeight: 'bold', fontSize: 16, },
  backContiner: {
    flexDirection: "row",
    marginTop: 24,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  backText: {

    color: '#153E3B',
    fontWeight: 'bold',
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  lText: {
    color: '#333',
    marginTop: 2,
  },
  cHere: {
    color: '#1a0dab',
    fontWeight: 'bold',
    marginTop: 2,
  },
  subheading: {
    fontSize: width * 0.045,
    color: '#888',
    marginBottom: height * 0.04,
  },
  activePinCodeContainer: {
    borderColor: "#000000",
  },
  pinCodeContainer: {
    borderWidth: 2,
    width: 50,
    height: 50,
    borderRadius: 10
  },
  focusStick: {
    width: 1,
    backgroundColor: "#000000"
  }
});
