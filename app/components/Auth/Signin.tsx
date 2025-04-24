import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  listenToAgentChanges,
  setAgentDataState,
  setPhonenumber,
} from "@/store/slices/agentSlice";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import auth from "@react-native-firebase/auth";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import { showErrorToast } from "@/utils/toastUtils";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const router = useRouter();

  const [phoneInput, setPhoneInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [addingNewAgent, setAddingNewAgent] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const { loading, phonenumber, isAgentInDb } = useSelector(
    (state: RootState) => state.agent,
  );

  const handlePhoneInputChange = (value: string) => {
    const fullPhoneNumber = "+91" + value;
    const regex = /^[0-9\b]+$/;

    if (value === "" || (regex.test(value) && !value.startsWith("0"))) {
      setPhoneInput(value);
      setPhoneNumber(fullPhoneNumber);
      if (value.length > 0) {
        const number = parsePhoneNumberFromString(fullPhoneNumber);

        if (number && number.isValid()) {
          setIsPhoneValid(true);
        } else {
          setIsPhoneValid(false);
        }
      } else {
        setIsPhoneValid(false);
      }
    }
  };

  const handleSupportClick = () => {
    const whatsappUrl = `https://wa.me/+919415006092`;
    Linking.openURL(whatsappUrl);
  };

  const handleCheckUser = async () => {
    if (!isPhoneValid) {
      setErrorMessage("Please enter a valid phone number and country code.");
      return;
    }

    try {
      const result = await dispatch(setAgentDataState(phoneNumber)).unwrap();

      dispatch(listenToAgentChanges(result.docId));
      const agentData = result.docData;

      if (agentData?.blacklisted) {
        showErrorToast("Your account is blacklisted. Please contact support.");
        router.push("/components/Auth/BlacklistedPage");
        return;
      }

      if (!agentData?.verified) {
        showErrorToast("Your account is not verified!");
        router.push("/components/Auth/VerificationPage");
        return;
      }

      // Proceed with Firebase phone sign-in
      await signInWithPhoneNumber();
    } catch (error) {
      await handleNewAgent();
    } finally {
      dispatch(setPhonenumber(phoneNumber));
    }
  };

  const handleNewAgent = async () => {
    if (phonenumber && isPhoneValid && !isAgentInDb && !addingNewAgent) {
      setAddingNewAgent(true);
      try {
        // Prepare the new agent data
        const newAgent = {
          phonenumber: phonenumber,
          admin: false,
          blacklisted: false,
          verified: false,
          added: getUnixDateTime(),
          lastModified: getUnixDateTime(),
        };

        await addDoc(collection(db, "agents"), newAgent);

        setAddingNewAgent(false);
        router.push("/components/Auth/VerificationPage");
      } catch (error) {
        console.error("Error adding new user:", error);
        // You might want to provide user feedback
        setErrorMessage(
          "There was an error adding the agent. Please try again.",
        );
        setAddingNewAgent(false);
      } finally {
        router.push("/components/Auth/VerificationPage");
        setAddingNewAgent(false);
      }
    }
  };

  const signInWithPhoneNumber = async () => {
    setIsSendingOTP(true);
    setErrorMessage(""); // Reset any previous errors

    try {
      const confirmation = await auth().signInWithPhoneNumber(
        phoneNumber,
        true,
      );

      router.push({
        pathname: "/components/Auth/OTPage",
        params: { verificationId: confirmation.verificationId },
      });
      setIsSendingOTP(false);
    } catch (error: any) {
      if (error.code === "auth/invalid-phone-number") {
        setErrorMessage("Please enter a valid phone number.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Too many attempts. Please try again later.");
      } else if (error.code === "auth/operation-not-allowed") {
        setErrorMessage(
          "Phone authentication is not enabled. Please contact support.",
        );
      } else {
        setErrorMessage(
          error.message || "Failed to send OTP. Please try again.",
        );
      }

      console.error("Error during OTP send:", error);
      setIsSendingOTP(false);
    } finally {
      setErrorMessage("");
      setIsSendingOTP(false);
    }
  };

  const handleSubmitEditing = () => {
    if (isPhoneValid && !loading && !addingNewAgent && !isSendingOTP) {
      handleCheckUser();
    }
  };

  useDoubleBackPressExit();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to ACN</Text>
      <Text style={styles.subheading}>
        Login or register with your Phone number
      </Text>

      <Text style={styles.label}>Phone Number*</Text>
      <View style={styles.inputRow}>
        <View style={styles.countryCodeBox}>
          <Text style={styles.countryCode}>+91</Text>
        </View>
        <TextInput
          placeholder="0000000000"
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
          onChangeText={handlePhoneInputChange}
          value={phoneInput}
          onSubmitEditing={handleSubmitEditing}
          editable={!loading && !addingNewAgent && !isSendingOTP}
        />
      </View>
      <View style={{ marginBottom: height * 0.04, minHeight: 24 }}>
        {errorMessage && (
          <Text
            style={{
              color: "#EF4444",
              fontFamily: "System",
              fontSize: 12,
              lineHeight: 21,
            }}
          >
            *{errorMessage}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          !(!isPhoneValid || loading || addingNewAgent || isSendingOTP) &&
            styles.buttonActive,
        ]}
        onPress={handleCheckUser}
        disabled={!isPhoneValid || loading || addingNewAgent || isSendingOTP}
      >
        <View>
          {loading || addingNewAgent || isSendingOTP ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View className="flex flex-row items-center justify-between gap-[10px]">
              <FontAwesome6
                name="arrow-right-to-bracket"
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>Login/Sign Up</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.whatsappRow}>
        <FontAwesome5 name="whatsapp" size={16} color="black" />
        <Text style={styles.whatsappText}>WhatsApp number mandatory!</Text>
      </View>

      <Text style={styles.footerText}>
        Unable to login?{" "}
        <Text style={styles.clickHere} onPress={handleSupportClick}>
          Click here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.08,
    paddingBottom: height * 0.05,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: "#888",
    marginBottom: height * 0.04,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: height * 0.01,
    alignItems: "center",
  },
  countryCodeBox: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.035,
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  countryCode: {
    fontSize: width * 0.045,
  },
  input: {
    flex: 1,
    height: 56,
    // paddingVertical: height * 0.0135,
    paddingHorizontal: width * 0.04,
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontSize: width * 0.045,
  },
  button: {
    backgroundColor: "#ccc",
    height: 60,
    justifyContent: "center",
    // paddingVertical: height * 0.018,
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonActive: {
    backgroundColor: "#153E3B",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  whatsappRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.08,
    gap: 6,
  },
  whatsappIcon: {
    width: width * 0.05,
    height: width * 0.05,
    marginRight: 8,
  },
  whatsappText: {
    color: "#555",
    fontSize: 14,
  },
  footerText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: 500,
  },
  clickHere: {
    color: "#4866FF",
    // textDecorationLine: 'underline',
  },
});
