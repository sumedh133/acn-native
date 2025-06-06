import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";

import { RouteProp, useRoute } from "@react-navigation/native";
import PremiumModal from "../modals/PremiumModal";
import PaymentUnsuccessfulModal from "../modals/PaymentUnsuccessfulModal";
import { router } from "expo-router";
import { RootState } from "@/store/store";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { updateAgentDocData } from "@/store/slices/agentSlice";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";
import { getUnixDateTime } from "../helpers/getUnixDateTime";

type CheckoutScreenRouteProp = RouteProp<{
  CheckoutScreen: {
    planId?: string;
  };
}>;

const CheckoutScreen: React.FC = () => {
  // Refs
  const webViewRef = useRef<WebView>(null);
  const dispatch = useDispatch();

  // Routes and params
  const route = useRoute<CheckoutScreenRouteProp>();
  const planId = route.params?.planId || "premium";

  const userData = useSelector((state: RootState) => state.agent);
  const {
    docData: {
      businessName = null,
      gstNo = null,
      cpId = null,
      userType = "free",
    } = {},
    phonenumber: phoneNumber = null,
  } = userData || {};

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<
    string | null
  >(null);
  const [paymentListenerActive, setPaymentListenerActive] = useState(false);

  useEffect(() => {
    if (!currentTransactionId && cpId) {
      const newTransactionId = "TXN" + Date.now();
      setCurrentTransactionId(newTransactionId);
      console.log("Generated transaction ID:", newTransactionId);
    }
  }, [cpId, currentTransactionId]);

  const checkoutUrl = React.useMemo(() => {
    const baseUrl = "https://acnonline.in/CheckoutPage";
    //const baseUrl ='https://test-acn-resale-inventories-dde03.web.app/CheckoutPage'

    const params = new URLSearchParams();
    params.append("planId", planId);

    if (phoneNumber) params.append("phoneNumber", phoneNumber);
    if (cpId) params.append("cpId", cpId);
    if (businessName) params.append("businessName", businessName);
    if (gstNo) params.append("gstNo", gstNo);
    if (currentTransactionId)
      params.append("transactionId", currentTransactionId);

    return `${baseUrl}?${params.toString()}`;
  }, [planId, phoneNumber, cpId, businessName, gstNo, currentTransactionId]);

  useEffect(() => {
    const backAction = () => {
      if (webViewCanGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [webViewCanGoBack]);

  useEffect(() => {
    if (!currentTransactionId || !cpId || paymentListenerActive) return;

    console.log(
      "Setting up payment listener for transaction:",
      currentTransactionId
    );
    setPaymentListenerActive(true);

    // Firebase listener for payment status
    const unsubscribe = onSnapshot(
      doc(db, "payments", currentTransactionId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const paymentData = docSnapshot.data();
          console.log("Payment status update:", paymentData);

          if (paymentData.status === "PAYMENT_SUCCESS") {
            updateUserSubscription(cpId, planId, paymentData);
            setShowSuccessModal(true);
          } else if (
            paymentData.status === "PAYMENT_ERROR" ||
            paymentData.status === "PAYMENT_FAILED"
          ) {
            setLastError(paymentData.failureReason || "Payment failed");
            setShowFailedModal(true);
          }
        }
      },
      (error) => {
        console.error("Error listening to payment updates:", error);
        setPaymentListenerActive(false);
      }
    );

    // Cleanup listener s
    return () => {
      console.log("Cleaning up payment listener");
      unsubscribe();
      setPaymentListenerActive(false);
    };
  }, [currentTransactionId, cpId, planId]);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "checkout_page_view", {
        event_category: "checkout",
        event_label: "page_view",
        plan_id: planId,
        transaction_id: currentTransactionId,
        business_name: businessName || "not_provided",
        has_gst: !!gstNo,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [planId, currentTransactionId, businessName, gstNo, userType]);

  const updateUserSubscription = async (
    cpId: string,
    planId: string,
    paymentData: any
  ) => {
    try {
      // Track payment success before updating subscription
      logEvent(analytics, "payment_success", {
        event_category: "checkout",
        event_label: "payment",
        plan_id: planId,
        transaction_id: currentTransactionId,
        amount: paymentData.data.amount,
        currency: "INR",
        user_type: userType,
      });

      const agentRef = doc(db, "agents", cpId);

      // Get current document to access existing payment history
      const agentSnap = await getDoc(agentRef);
      const agentData = agentSnap.data();

      const now = getUnixDateTime();

      let planExpiry = getUnixDateTime() + 31536000;

      const newPaymentEntry = {
        paymentDate: now,
        paymentAmount: paymentData.data.amount,
        paymentId: currentTransactionId,
        planId: planId,
      };

      const existingPaymentHistory = agentData?.paymentHistory || [];

      let updatedPaymentHistory = [];

      if (Array.isArray(existingPaymentHistory)) {
        updatedPaymentHistory = [...existingPaymentHistory, newPaymentEntry];
      } else if (
        existingPaymentHistory &&
        typeof existingPaymentHistory === "object"
      ) {
        updatedPaymentHistory = [existingPaymentHistory, newPaymentEntry];
      } else {
        updatedPaymentHistory = [newPaymentEntry];
      }

      let updateData: any = {
        paymentHistory: updatedPaymentHistory,
      };

      switch (planId) {
        case "premium":
          updateData = {
            ...updateData,
            userType: "premium",
            trialUsed: true,
            planExpiry: planExpiry,
            monthlyCredits: 100,
          };
          break;
        case "booster":
          updateData = {
            ...updateData,
            boosterCredits: (agentData?.boosterCredits || 0) + 5,
          };
          break;
        default:
          console.log("Unknown plan ID:", planId);
          return false;
      }

      await updateDoc(agentRef, updateData);
      console.log("Successfully updated user subscription");

      dispatch(updateAgentDocData(updateData));

      // Track subscription update success
      logEvent(analytics, "subscription_updated", {
        event_category: "checkout",
        event_label: "subscription",
        plan_id: planId,
        user_type: userType,
        credits_added: planId === "premium" ? 100 : 5,
      });

      return true;
    } catch (error) {
      // Track error in subscription update
      logEvent(analytics, "subscription_update_error", {
        event_category: "checkout",
        event_label: "error",
        plan_id: planId,
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
      console.error("Error updating user subscription:", error);
      return false;
    }
  };

  const injectUserData = useCallback((): void => {
    if (!webViewRef.current) return;

    const dataScript = `
      window.userPhoneNumber = ${JSON.stringify(phoneNumber || "")};
      window.userCpId = ${JSON.stringify(cpId || "")};
      window.userBusinessName = ${JSON.stringify(businessName || "")};
      window.userGstNo = ${JSON.stringify(gstNo || "")};
      window.userTransactionId = ${JSON.stringify(currentTransactionId || "")};
      
      // Dispatch a custom event that the web page can listen for
      if (!window.userDataInjected) {
        document.dispatchEvent(new CustomEvent('app:userData', { 
          detail: {
            phoneNumber: window.userPhoneNumber,
            cpId: window.userCpId,
            businessName: window.userBusinessName,
            gstNo: window.userGstNo,
            transactionId: window.userTransactionId
          }
        }));
        
        // Set flag to avoid triggering multiple times
        window.userDataInjected = true;
        
        // For backward compatibility
        if (typeof setUserData === 'function') {
          setUserData();
        }
      }
      
      true;
    `;

    webViewRef.current.injectJavaScript(dataScript);
  }, [phoneNumber, cpId, businessName, gstNo, currentTransactionId]);

  const retryPayment = (): void => {
    try {
      logEvent(analytics, "payment_retry", {
        event_category: "checkout",
        event_label: "retry",
        plan_id: planId,
        previous_transaction_id: currentTransactionId,
        error: lastError || "Unknown error",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging payment retry:", error);
    }

    setShowFailedModal(false);
    const newTransactionId = "TXN" + Date.now();
    setCurrentTransactionId(newTransactionId);

    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const browsePlans = (): void => {
    try {
      logEvent(analytics, "post_payment_navigation", {
        event_category: "checkout",
        event_label: "navigation",
        destination: "properties",
        plan_id: planId,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging navigation:", error);
    }

    setShowSuccessModal(false);
    router.push("/(tabs)/properties");
  };

  const handleWebViewNavigationStateChange = useCallback(
    (navState: { loading: boolean; url: string; canGoBack: boolean }): void => {
      setWebViewCanGoBack(navState.canGoBack);

      // Handle loading completed
      if (navState.loading === false) {
        setIsLoading(false);

        setTimeout(() => {
          injectUserData();
        }, 300);
      }
    },
    [injectUserData]
  );

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }): void => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case "PAYMENT_INITIATED":
            console.log("Payment initiated:", data.payload);
            logEvent(analytics, "payment_initiated", {
              event_category: "checkout",
              event_label: "payment",
              plan_id: planId,
              transaction_id:
                data.payload.transactionId || currentTransactionId,
              user_type: userType,
            });
            setCurrentTransactionId(
              data.payload.transactionId || currentTransactionId
            );
            break;

          case "PAYMENT_SUCCESS":
            logEvent(analytics, "payment_callback_success", {
              event_category: "checkout",
              event_label: "payment",
              plan_id: planId,
              transaction_id: currentTransactionId,
              user_type: userType,
            });
            setShowSuccessModal(true);
            break;

          case "PAYMENT_FAILED":
            console.log("Payment failed:", data.payload);
            logEvent(analytics, "payment_callback_failed", {
              event_category: "checkout",
              event_label: "payment",
              plan_id: planId,
              transaction_id: currentTransactionId,
              error:
                data.payload?.error || data.payload?.reason || "Unknown error",
              user_type: userType,
            });
            setLastError(data.payload?.error || data.payload?.reason || null);
            setShowFailedModal(true);
            break;

          case "ERROR":
            console.error("Web error:", data.payload);
            logEvent(analytics, "checkout_web_error", {
              event_category: "checkout",
              event_label: "error",
              plan_id: planId,
              error_message: JSON.stringify(data.payload),
              user_type: userType,
            });
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling WebView message:", error);
        logEvent(analytics, "checkout_message_error", {
          event_category: "checkout",
          event_label: "error",
          plan_id: planId,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          user_type: userType,
        });
      }
    },
    [planId, currentTransactionId, userType]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {currentTransactionId ? (
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webView}
          onMessage={handleMessage}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#153E3B" />
              <Text style={styles.loadingText}>Loading checkout page...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error:", nativeEvent);
            Alert.alert(
              "Connection Error",
              "Failed to load the checkout page. Please check your internet connection and try again.",
              [
                {
                  text: "Retry",
                  onPress: () => webViewRef.current?.reload(),
                },
              ]
            );
          }}
          originWhitelist={["*"]}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#153E3B" />
          <Text style={styles.loadingText}>Preparing checkout...</Text>
        </View>
      )}

      {/* Success Modal */}
      <PremiumModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        onBrowsePress={browsePlans}
        planId={planId}
      />

      {/* Failed Payment Modal */}
      <PaymentUnsuccessfulModal
        visible={showFailedModal}
        onClose={() => {
          setShowFailedModal(false);
          router.back();
        }}
        onTryAgain={retryPayment}
        planId={planId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#153E3B",
    fontWeight: "500",
  },
  webView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default CheckoutScreen;
