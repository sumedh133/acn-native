import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  Linking,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome as FAIcon, Feather } from "@expo/vector-icons";
import { FontAwesome5 as FA5Icon } from "@expo/vector-icons";
import { getFunctions, httpsCallable } from "firebase/functions";
import { WebView } from "react-native-webview";

// did not exist before IAP
import {
  initConnection,
  endConnection,
  getProducts,
  requestSubscription,
  SubscriptionPurchase,
  ProductPurchase,
  PurchaseError,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  Purchase,
} from "react-native-iap";

import { formatCost } from "../../helpers/common.js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store.js";
import { Coupon, SubscriptionPlan } from "@/app/types.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/utils/toastUtils";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { WebViewNavigationEvent } from "react-native-webview/lib/RNCWebViewNativeComponent.js";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime.js";
import { useDispatch } from "react-redux";
import { updateAgentDocData } from "@/store/slices/agentSlice";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type BillingContainerProps = {
  onOpenBusinessModal: () => void;
};

type BillingContainerRouteProp = RouteProp<{
  BillingContainer: {
    planId?: string;
  };
}>;

const iapProductIds = {
  premiumAnnual: "acn_9999",
  // boosterPack: "acn_booster_pack",
};

// Enhanced error messages for better UX
const getErrorMessage = (error: any): string => {
  if (error instanceof PurchaseError) {
    switch (error.code) {
      case "E_USER_CANCELLED":
        return "Purchase was cancelled";
      case "E_ITEM_UNAVAILABLE":
        return "This item is not available for purchase";
      case "E_NETWORK_ERROR":
        return "Network error. Please check your connection and try again";
      case "E_SERVICE_ERROR":
        return "App Store service error. Please try again later";
      case "E_RECEIPT_FAILED":
        return "Receipt validation failed";
      case "E_ALREADY_OWNED":
        return "You already own this subscription";
      case "E_DEVELOPER_ERROR":
        return "Configuration error. Please contact support";
      case "E_NOT_PREPARED":
        return "Billing service is not prepared";
      default:
        return error.message || "Purchase failed. Please try again";
    }
  }
  return error.message || "An unexpected error occurred";
};

const BillingContainer: React.FC<BillingContainerProps> = ({
  onOpenBusinessModal,
}) => {
  const route = useRoute<BillingContainerRouteProp>();
  const router = useRouter();
  const dispatch = useDispatch();
  const planId = route.params?.planId || "premium";

  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();

  const redirectUrl = "https://acnonline.in/billing";
  const [processing, setProcessing] = useState(false);
  const [restoring, setRestoring] = useState(false); // New state for restore operations
  const scrollRef = useRef<ScrollView>(null);

  // did not exist before IAP, next 3 lines
  const [product, setProduct] = useState<any>(null);
  const [iapError, setIapError] = useState<string | null>(null);
  const [isIAPInitialized, setIsIAPInitialized] = useState(false);
  const purchaseUpdateSubscription = useRef<any>(null);
  const purchaseErrorSubscription = useRef<any>(null);

  const [originalAmount, setOriginalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(
    parseFloat((originalAmount * 0.18).toFixed(2))
  );
  const [totalAmount, setTotalAmount] = useState(originalAmount + taxAmount);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(
      doc(db, "admin", "subscriptionPlans"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.plans)) {
            setAvailablePlans(data.plans);
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const plan = availablePlans.find((p) => p.id === planId);
    setSelectedPlan(plan);
    setOriginalAmount(plan?.productPrice!);
  }, [planId, availablePlans]);

  useEffect(() => {
    // For iOS, don't calculate discounts - use App Store pricing
    if (Platform.OS === "ios") {
      setDiscountAmount(0);
      setTaxAmount(0);
      setTotalAmount(originalAmount);
      return;
    }

    const tax = parseFloat(
      (
        (originalAmount - discountAmount) *
        (selectedPlan?.taxPercentage! / 100)
      ).toFixed(2)
    );
    setTaxAmount(tax);
    let newAmount = Math.round(originalAmount - discountAmount + tax);
    setTotalAmount(newAmount);
  }, [discountAmount, originalAmount, selectedPlan]);

  const businessName =
    useSelector((state: RootState) => state?.agent?.docData?.businessName) ||
    null;
  const gstNo =
    useSelector((state: RootState) => state?.agent?.docData?.gstNo) || null;
  const phoneNumber =
    useSelector((state: RootState) => state?.agent?.phoneNumber) || null;
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "view_billing_page", {
        event_category: "billing",
        event_label: "page_view",
        user_type: userType,
        has_business_details: !!(businessName || gstNo),
        platform: Platform.OS,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, []);

  const [allCoupons, setAllCoupons] = useState<Coupon[] | []>([]);
  const [couponCode, setCouponCode] = useState("");
  const [matchedCoupon, setMatchedCoupon] = useState<Coupon | null>(null);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");

  useEffect(() => {
    // Don't load coupons for iOS users
    if (Platform.OS === "ios") return;

    const unsubscribe = onSnapshot(doc(db, "admin", "coupons"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data && Array.isArray(data.coupons)) {
          setAllCoupons(data.coupons);
        } else {
          console.error("Invalid or missing 'coupons' field in the document.");
          setAllCoupons([]);
        }
      } else {
        console.error("Document does not exist.");
        setAllCoupons([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === "ios") {
      const initializeIAP = async () => {
        try {
          console.log("🚀 Starting IAP initialization...");

          // End any existing connection first
          try {
            await endConnection();
            console.log("✅ Previous connection ended");
          } catch (e) {
            console.log("ℹ️ No existing connection to end");
          }

          // Wait a moment before reinitializing
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Initialize new connection with timeout
          console.log("🔌 Establishing new IAP connection...");
          const initPromise = initConnection();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("IAP initialization timeout")),
              10000
            )
          );

          await Promise.race([initPromise, timeoutPromise]);
          console.log("✅ IAP connection established successfully");

          // Set up purchase listeners
          console.log("👂 Setting up purchase listeners...");
          purchaseUpdateSubscription.current = purchaseUpdatedListener(
            async (purchase: Purchase) => {
              console.log("📱 Purchase updated:", purchase.transactionId);
              await handlePurchaseUpdate(purchase);
            }
          );

          purchaseErrorSubscription.current = purchaseErrorListener(
            (error: PurchaseError) => {
              console.error("❌ Purchase error listener triggered:", error);
              const errorMessage = getErrorMessage(error);
              setIapError(errorMessage);
              showErrorToast(errorMessage);
              setProcessing(false);
            }
          );

          // Fetch products with enhanced retry logic
          console.log("🛒 Fetching available products...");
          let products;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              products = await getProducts({
                skus: [iapProductIds.premiumAnnual],
              });

              if (products && products.length > 0) {
                console.log(
                  "✅ Products loaded successfully:",
                  products[0].productId
                );
                setProduct(products[0]);
                break;
              } else {
                throw new Error("No products returned from App Store");
              }
            } catch (error) {
              retryCount++;
              console.log(
                `⚠️ Product fetch attempt ${retryCount} failed:`,
                error.message
              );

              if (retryCount < maxRetries) {
                console.log(`🔄 Retrying in ${retryCount * 1000}ms...`);
                await new Promise((resolve) =>
                  setTimeout(resolve, retryCount * 1000)
                );
              } else {
                throw new Error(
                  `Failed to fetch products after ${maxRetries} attempts`
                );
              }
            }
          }

          // Only set as initialized if everything succeeded
          setIsIAPInitialized(true);
          console.log("🎉 IAP initialization completed successfully");

          // Clear any previous errors
          setIapError(null);

          // Schedule pending purchases check with proper initialization check
          console.log("⏰ Scheduling pending purchases check...");
          setTimeout(async () => {
            console.log("🔍 Starting pending purchases check...");
            await checkPendingPurchases();
          }, 3000); // Increased delay to ensure stability
        } catch (error: any) {
          console.error("💥 IAP initialization failed:", error.message);
          setIapError(`Initialization failed: ${error.message}`);
          setIsIAPInitialized(false);

          // Show user-friendly error based on error type
          if (error.message.includes("timeout")) {
            console.log(
              "⏱️ IAP initialization timed out - App Store may be slow"
            );
          } else if (error.message.includes("No products")) {
            console.log("🛒 Products not available in App Store");
          } else {
            console.log(
              "🚫 IAP features will be limited due to initialization failure"
            );
          }
        }
      };

      initializeIAP();

      return () => {
        console.log("🧹 Cleaning up IAP connections...");
        if (purchaseUpdateSubscription.current) {
          purchaseUpdateSubscription.current.remove();
          console.log("✅ Purchase update listener removed");
        }
        if (purchaseErrorSubscription.current) {
          purchaseErrorSubscription.current.remove();
          console.log("✅ Purchase error listener removed");
        }

        // Only end connection if it was initialized
        if (isIAPInitialized) {
          endConnection()
            .then(() => console.log("✅ IAP connection ended"))
            .catch((e) =>
              console.log("⚠️ Error ending connection:", e.message)
            );
        }
      };
    }
  }, []);

  const checkPendingPurchases = async () => {
    console.log(
      "🔍 checkPendingPurchases called, isIAPInitialized:",
      isIAPInitialized
    );

    if (!isIAPInitialized) {
      console.log("⚠️ IAP not initialized, skipping pending purchases check");
      return;
    }

    try {
      console.log("📋 Checking for pending purchases...");
      const purchases = await getAvailablePurchasesWithRetry(2, 500);

      if (purchases && purchases.length > 0) {
        console.log(
          `📦 Found ${purchases.length} pending purchase(s):`,
          purchases.map((p) => p.transactionId)
        );

        // Process each pending purchase
        for (const purchase of purchases) {
          try {
            console.log(
              `🔄 Processing pending purchase: ${purchase.transactionId}`
            );
            await handlePurchaseUpdate(purchase as Purchase);
            console.log(`✅ Successfully processed: ${purchase.transactionId}`);
          } catch (error) {
            console.error(
              `❌ Error processing pending purchase ${purchase.transactionId}:`,
              error
            );
          }
        }
      } else {
        console.log("✅ No pending purchases found");
      }
    } catch (error) {
      console.error("💥 Error checking pending purchases:", error);
      // Don't show error to user for background checks
    }
  };

  // Helper function to get available purchases with retry logic
  const getAvailablePurchasesWithRetry = async (
    maxRetries = 3,
    delay = 1000
  ) => {
    console.log(
      `🔄 Getting available purchases (max ${maxRetries} attempts)...`
    );

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🎯 Attempt ${attempt}/${maxRetries} to get available purchases`
        );

        // Small delay before each attempt (except first)
        if (attempt > 1) {
          console.log(`⏸️ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Try to get purchases
        const purchases = await getAvailablePurchases();
        console.log(
          `✅ Successfully retrieved ${
            purchases?.length || 0
          } purchases on attempt ${attempt}`
        );
        return purchases;
      } catch (error: any) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          console.error("💥 All attempts failed, throwing error");
          throw error; // Re-throw if this was the last attempt
        }

        // If connection closed, try to re-establish
        if (error.message?.includes("Connection has been closed")) {
          console.log("🔌 Connection closed, attempting to re-establish...");
          try {
            await endConnection();
            await new Promise((resolve) => setTimeout(resolve, 500));
            await initConnection();
            console.log("✅ Connection re-established");
          } catch (reconnectError) {
            console.error(
              "💥 Failed to re-establish connection:",
              reconnectError
            );
          }
        }
      }
    }
  };

  // Helper function to ensure IAP connection is ready
  const ensureIAPConnection = async () => {
    try {
      // First check if we can get products (quick connection test)
      const products = await getProducts({
        skus: [iapProductIds.premiumAnnual],
      });
      if (products && products.length > 0) {
        console.log("Connection verified - products available");
        return true;
      }
    } catch (error) {
      console.log("Connection test failed, reinitializing...");
    }

    // If products check failed, try to reinitialize
    try {
      await endConnection();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await initConnection();
      setIsIAPInitialized(true);
      console.log("IAP connection reinitialized");
      return true;
    } catch (error) {
      console.error("Failed to reinitialize IAP:", error);
      setIsIAPInitialized(false);
      return false;
    }
  };

  const restorePurchases = async () => {
    if (Platform.OS !== "ios") return;

    console.log("🔄 Starting purchase restoration...");
    setRestoring(true);

    try {
      // Track restore attempt
      logEvent(analytics, "restore_purchases_attempt", {
        event_category: "billing",
        event_label: "restore",
        user_type: userType,
        iap_initialized: isIAPInitialized,
      });

      // Check if IAP is initialized first
      if (!isIAPInitialized) {
        console.log("⚠️ IAP not initialized, attempting to initialize...");
        const connectionReady = await ensureIAPConnection();
        if (!connectionReady) {
          throw new Error("Unable to establish stable connection to App Store");
        }
      }

      console.log("🔍 Getting available purchases for restoration...");
      const purchases = await getAvailablePurchasesWithRetry(3, 1000);

      console.log(
        "📋 Restore purchases result:",
        purchases?.length || 0,
        "purchases found"
      );

      if (!purchases || purchases.length === 0) {
        Alert.alert("Oops!", "No purchases found to restore.");
        logEvent(analytics, "restore_purchases_none_found", {
          event_category: "billing",
          event_label: "restore",
          user_type: userType,
        });
        return;
      }

      console.log(`🔄 Restoring ${purchases.length} purchase(s)...`);
      let restoredCount = 0;
      let failedCount = 0;

      for (const purchase of purchases) {
        try {
          console.log(`🔄 Restoring purchase: ${purchase.transactionId}`);
          await handlePurchaseUpdate(purchase as Purchase);
          restoredCount++;
          console.log(`✅ Successfully restored: ${purchase.transactionId}`);
        } catch (error) {
          console.error(
            `❌ Failed to restore ${purchase.transactionId}:`,
            error
          );
          failedCount++;
        }
      }

      // Show appropriate success/error messages
      if (restoredCount > 0) {
        const message = `Successfully restored ${restoredCount} purchase(s)`;
        console.log(`🎉 ${message}`);
        showSuccessToast(message);

        logEvent(analytics, "restore_purchases_success", {
          event_category: "billing",
          event_label: "restore",
          restored_count: restoredCount,
          failed_count: failedCount,
          user_type: userType,
        });

        // Navigate back after successful restore
        setTimeout(() => {
          router.dismissAll();
          router.push("/(pages)/Profile");
        }, 2000);
      } else {
        const message =
          "Purchases found but failed to restore. Please contact support.";
        console.error(`💥 ${message}`);
        showErrorToast(message);

        logEvent(analytics, "restore_purchases_failed", {
          event_category: "billing",
          event_label: "restore",
          total_purchases: purchases.length,
          failed_count: failedCount,
          user_type: userType,
        });
      }
    } catch (error: any) {
      console.error("💥 Restore purchases error:", error.message);

      let errorMessage = "Failed to restore purchases. Please try again.";

      // Handle specific error cases with better messages
      if (error.message?.includes("Connection has been closed")) {
        errorMessage =
          "App Store connection is unstable. Please try again in a moment.";
      } else if (error.message?.includes("Unable to establish")) {
        errorMessage =
          "Unable to connect to App Store. Please check your internet connection and try again.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      showErrorToast(errorMessage);
      logEvent(analytics, "restore_purchases_error", {
        event_category: "billing",
        event_label: "error",
        error_message: error.message,
        user_type: userType,
      });
    } finally {
      setRestoring(false);
      console.log("🏁 Purchase restoration completed");
    }
  };
  const handlePurchaseUpdate = async (purchase: Purchase) => {
    try {
      setProcessing(true);

      // Log purchase attempt
      logEvent(analytics, "iap_purchase_processing", {
        event_category: "billing",
        event_label: "payment",
        product_id: purchase.productId,
        transaction_id: purchase.transactionId,
        user_type: userType,
      });

      console.log(
        "Processing purchase with backend validation:",
        purchase.transactionId
      );

      // Prepare data for backend validation
      // Validate required fields
      if (!phoneNumber || !cpId) {
        throw new Error("Missing user identification details");
      }

      if (!purchase.transactionId || !purchase.transactionReceipt) {
        throw new Error("Invalid purchase data");
      }

      if (!selectedPlan?.id && !planId) {
        throw new Error("Plan details not found");
      }

      const validationData = {
        phoneNumber: phoneNumber,
        transactionDate: purchase.transactionDate,
        transactionId: purchase.transactionId,
        transactionReceipt: purchase.transactionReceipt,
        originalTransactionId:
          purchase.originalTransactionIdentifierIOS || purchase.transactionId,
        productId: purchase.productId,
        planId: selectedPlan?.id || planId,
        amount: product?.price || totalAmount,
        currency: product?.currency || "INR",
        localizedPrice: product?.localizedPrice || formatCost(totalAmount),
        isTestPurchase: __DEV__,
        environment: __DEV__ ? "sandbox" : "production",
        cpId: cpId,
      };

      // Additional validation of data structure
      const requiredFields = Object.entries(validationData).filter(
        ([_, value]) => value === undefined || value === null
      );

      if (requiredFields.length > 0) {
        throw new Error(
          `Missing required fields: ${requiredFields
            .map(([key]) => key)
            .join(", ")}`
        );
      }

      const validationRequest = JSON.stringify(validationData);

      if (!validationRequest) {
        throw new Error(`Error in parsing JSON: ${validationData}`);
      }

      // Call backend for validation and processing
      const backendUrl = "https://notification-server-acn-zdgg.onrender.com";
      const response = await fetch(`${backendUrl}/iap/validate-ios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: validationRequest,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Backend validation failed");
      }

      if (result.success) {
        // Finish the transaction only after successful backend validation
        await finishTransaction({ purchase, isConsumable: false });

        // Update local Redux state with the user update data
        if (result.userUpdate) {
          dispatch(updateAgentDocData(result.userUpdate));
        }

        // Log successful purchase
        logEvent(analytics, "iap_purchase_success", {
          event_category: "billing",
          event_label: "payment",
          product_id: purchase.productId,
          transaction_id: purchase.transactionId,
          amount: totalAmount,
          payment_id: purchase.transactionId,
          user_type: userType,
        });

        if (result.alreadyProcessed) {
          showSuccessToast("Purchase already processed!");
        } else {
          showSuccessToast(
            "Purchase successful! Your subscription is now active."
          );
        }

        // Navigate back after a delay
        setTimeout(() => {
          router.dismissAll();
          router.push("/(pages)/Profile");
        }, 1000);
      } else {
        throw new Error(result.error || "Purchase validation failed");
      }
    } catch (error: any) {
      console.error("Error processing purchase:", error);

      // Log purchase failure
      logEvent(analytics, "iap_purchase_failed", {
        event_category: "billing",
        event_label: "error",
        error_message: error.message,
        product_id: purchase.productId,
        user_type: userType,
      });

      showErrorToast(
        error.message ||
          "Failed to process purchase. Please contact support if you were charged."
      );

      // Don't finish the transaction if validation failed
      // This allows retry on next app launch
    } finally {
      setProcessing(false);
    }
  };

  const initiatePayment = async () => {
    // This function should only be called for non-iOS platforms
    if (Platform.OS === "ios") {
      console.error(
        "PhonePe payment attempted on iOS - this should not happen"
      );
      return;
    }

    setProcessing(true);

    try {
      // Track payment initiation
      logEvent(analytics, "initiate_payment", {
        event_category: "billing",
        event_label: "payment",
        amount: totalAmount,
        original_amount: originalAmount,
        discount_applied: discountAmount,
        coupon_code: matchedCoupon?.code || null,
        has_business_details: !!(businessName || gstNo),
        user_type: userType,
        platform: Platform.OS,
      });

      const functions = getFunctions();
      const initiatePhonePePayment = httpsCallable(
        functions,
        "initiatePhonePePayment"
      );

      const transactionId = "TXN" + Date.now();
      const mobileNumber = phoneNumber;
      const userId = cpId;

      const response: any = await initiatePhonePePayment({
        amount: totalAmount,
        transactionId,
        redirectUrl,
        mobileNumber,
        userId,
      });

      if (response.data.success) {
        const paymentUrl: string = response.data.paymentUrl;

        // Track successful payment initiation
        logEvent(analytics, "payment_url_generated", {
          event_category: "billing",
          event_label: "payment",
          transaction_id: transactionId,
          amount: totalAmount,
          user_type: userType,
        });

        setPaymentUrl(paymentUrl);
        setShowWebView(true);
      } else {
        // Track payment initiation failure
        logEvent(analytics, "payment_initiation_failed", {
          event_category: "billing",
          event_label: "error",
          error_message: response.data.error || "Unknown error",
          transaction_id: transactionId,
          amount: totalAmount,
          user_type: userType,
        });

        console.error("Payment failed:", response.data.error);
        Alert.alert(
          "Payment Failed",
          response.data.error || "Something went wrong."
        );
      }
    } catch (error: any) {
      // Track payment error
      logEvent(analytics, "payment_error", {
        event_category: "billing",
        event_label: "error",
        error_message: error.message || "Unknown error",
        amount: totalAmount,
        user_type: userType,
      });

      console.error("Payment initiation error:", error.message);
      Alert.alert("Error", error.message || "Payment could not be initiated.");
    }

    setProcessing(false);
  };

  const handleNavigationStateChange = async (
    navState: WebViewNavigationEvent
  ) => {
    if (navState.url.startsWith(redirectUrl)) {
      // Track payment flow completion
      try {
        logEvent(analytics, "payment_flow_completed", {
          event_category: "billing",
          event_label: "payment",
          final_url: navState.url,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging payment flow completion:", error);
      }
      setShowWebView(false);
    }
  };

  useEffect(() => {
    // Don't apply coupons for iOS users
    if (Platform.OS === "ios") {
      setDiscountAmount(0);
      setMatchedCoupon(null);
      return;
    }

    if (matchedCoupon) {
      const offPrice = Math.floor(
        originalAmount * (matchedCoupon.discount_percent / 100)
      );
      setDiscountAmount(offPrice);
    } else {
      setDiscountAmount(0);
    }
  }, [matchedCoupon, originalAmount]);

  const applyCoupon = () => {
    // This function should only be called for non-iOS platforms
    if (Platform.OS === "ios") return;

    if (!allCoupons || allCoupons?.length === 0) {
      try {
        logEvent(analytics, "coupon_error", {
          event_category: "billing",
          event_label: "error",
          error_type: "no_coupons_available",
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging coupon error:", error);
      }
      setMatchedCoupon(null);
      showErrorToast("Invalid Coupon Code");
      return;
    }

    const match =
      allCoupons?.find(
        (item) =>
          item?.code === couponCode &&
          item.active &&
          item.plansApplicable.includes(planId)
      ) || null;

    try {
      logEvent(analytics, "apply_coupon", {
        event_category: "billing",
        event_label: "interaction",
        coupon_code: couponCode,
        is_valid: !!match,
        discount_amount: discountAmount || 0,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging coupon application:", error);
    }

    if (match) {
      setMatchedCoupon(match);
      showSuccessToast("Coupon Applied");
    } else {
      setMatchedCoupon(null);
      showErrorToast("Invalid Coupon Code");
    }
  };

  const removeCoupon = () => {
    // This function should only be called for non-iOS platforms
    if (Platform.OS === "ios") return;

    try {
      logEvent(analytics, "remove_coupon", {
        event_category: "billing",
        event_label: "interaction",
        coupon_code: matchedCoupon?.code,
        discount_amount: discountAmount || 0,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging coupon removal:", error);
    }
    setMatchedCoupon(null);
    setCouponCode("");
    showInfoToast("Coupon Removed");
  };

  // did not exist before IAP
  const initiateIAPPayment = async () => {
    if (!product) {
      Alert.alert("Error", "Product not available. Please try again later.");
      return;
    }

    setProcessing(true);
    setIapError(null);

    try {
      // Ensure connection is ready before attempting purchase
      const connectionReady = await ensureIAPConnection();
      if (!connectionReady) {
        throw new Error("Unable to connect to App Store");
      }

      // Track IAP purchase attempt
      logEvent(analytics, "iap_purchase_attempt", {
        event_category: "billing",
        event_label: "payment",
        product_id: product.productId,
        user_type: userType,
      });

      console.log("Initiating IAP purchase for:", product.productId);

      const purchase = await requestSubscription({
        sku: product.productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      // Purchase will be handled by purchaseUpdatedListener
      console.log("Purchase request initiated:", purchase);
    } catch (error: any) {
      console.error("IAP purchase error:", error);
      const errorMessage = getErrorMessage(error);
      setIapError(errorMessage);

      // Log IAP error
      logEvent(analytics, "iap_purchase_error", {
        event_category: "billing",
        event_label: "error",
        error_code: error.code,
        error_message: errorMessage,
        user_type: userType,
      });

      // Show user-friendly error message
      if (error.code === "E_USER_CANCELLED") {
        showInfoToast(errorMessage);
      } else if (error.message?.includes("Connection has been closed")) {
        Alert.alert(
          "Connection Error",
          "Connection to App Store was lost. Please try again in a moment.",
          [
            { text: "OK", style: "default" },
            {
              text: "Contact Support",
              onPress: () => Linking.openURL("mailto:support@acnonline.in"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Purchase Failed",
          errorMessage +
            "\n\nPlease try again or contact support if the issue persists.",
          [
            { text: "OK", style: "default" },
            {
              text: "Contact Support",
              onPress: () => Linking.openURL("mailto:support@acnonline.in"),
            },
          ]
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to get display price based on platform
  const getDisplayPrice = () => {
    if (Platform.OS === "ios" && product) {
      return product.localizedPrice;
    }
    return formatCost(totalAmount);
  };

  // Helper function to determine if coupons should be shown
  const shouldShowCoupons = () => {
    return Platform.OS !== "ios" && planId !== "booster";
  };

  // Helper function to determine if GST details should be shown
  const shouldShowGSTDetails = () => {
    return Platform.OS !== "ios" && (businessName || gstNo);
  };

  return (
    <>
      <Modal
        visible={showWebView}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowWebView(false)}
      >
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
        ></WebView>
      </Modal>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            {/* price container */}
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {selectedPlan?.productName}
                  {"\n"}
                  <Text style={styles.subtext}>
                    {selectedPlan?.productDescription}
                  </Text>
                </Text>
                <Text style={styles.costText}>
                  {Platform.OS === "ios" && product
                    ? product.localizedPrice
                    : formatCost(originalAmount)}
                  {"\n"}
                  <Text style={styles.subtext}>
                    {selectedPlan?.validityPeriod &&
                      `For ${selectedPlan?.validityPeriod}`}
                  </Text>
                </Text>
              </View>

              <View style={styles.validitySection}>
                {selectedPlan?.id === "premium" && (
                  <View style={styles.validityView}>
                    <View style={styles.validityLine}>
                      <View className="w-4 h-4 rounded-full bg-gray-900"></View>
                      <Text>Today: 100 Credits per month for a year</Text>
                    </View>
                    <View className="w-0.5 h-[14px] bg-gray-900 ml-[7px]"></View>
                    <View style={styles.validityLine}>
                      <View className="w-4 h-4 rounded-full bg-transparent border-2 border-gray-900"></View>
                      <Text>
                        Valid till{" "}
                        {(() => {
                          const futureDate = new Date(
                            Date.now() + 365 * 24 * 60 * 60 * 1000
                          );
                          const day = futureDate.getDate();
                          const month = futureDate.toLocaleString("en-US", {
                            month: "short",
                          });
                          const year = futureDate.getFullYear();
                          return `${day} ${month} ${year}`;
                        })()}
                      </Text>
                    </View>
                  </View>
                )}
                <Text style={styles.refundText}>
                  Non-refundable & Non-transferable.**
                </Text>
              </View>

              {/* Only show GST prompt for non-iOS users */}
              {Platform.OS !== "ios" && !(businessName || gstNo) && (
                <Text style={styles.gstText}>
                  Have a GST?{" "}
                  <Text style={styles.linkText} onPress={onOpenBusinessModal}>
                    Click here
                  </Text>{" "}
                  to submit details
                </Text>
              )}
            </View>

            {/* Only show GST details for non-iOS users */}
            {shouldShowGSTDetails() && (
              <View style={[styles.gstCard, { paddingVertical: 20, gap: 16 }]}>
                <View style={styles.header}>
                  <Text
                    style={[styles.title, { fontSize: 16, lineHeight: 24 }]}
                  >
                    GST details added :
                  </Text>
                  <TouchableOpacity
                    style={styles.gstEditButton}
                    onPress={onOpenBusinessModal}
                  >
                    <Feather name="edit-3" size={20} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={{ width: "100%", gap: 12 }}>
                  <View style={{ width: "100%", gap: 8 }}>
                    <Text style={styles.validityText}>
                      Business Name:{" "}
                      <Text style={styles.bold}>{businessName}</Text>
                    </Text>
                    <Text style={styles.validityText}>
                      GSTIN: <Text style={styles.bold}>{gstNo}</Text>
                    </Text>
                  </View>
                  <Text style={styles.refundText}>
                    Your invoice will include the submitted GST details.
                  </Text>
                </View>
              </View>
            )}

            {/* coupon container - only for non-iOS users */}
            {shouldShowCoupons() && (
              <View style={styles.couponContainer}>
                <Text style={styles.heading}>Coupon code</Text>
                <Text style={styles.couponSubtext}>
                  Have a coupon? Enter the code here to avail discounts!
                </Text>

                {!matchedCoupon ? (
                  <View style={styles.inputRow}>
                    <TextInput
                      value={couponCode}
                      onChangeText={setCouponCode}
                      placeholder="Coupon code"
                      style={styles.input}
                      placeholderTextColor="#747474"
                    />
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={applyCoupon}
                    >
                      <Text style={styles.applyText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.couponRow}>
                    <View style={styles.appliedCoupon}>
                      <FAIcon name="tag" size={20} style={styles.icon} />
                      <Text style={styles.couponCodeText} numberOfLines={1}>
                        {matchedCoupon.code}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={removeCoupon}
                    >
                      <CloseIcon width={20} height={20} />
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* order container */}
            <View style={styles.orderContainer}>
              <Text style={styles.orderHeader}>Order Summary</Text>

              <View style={styles.summaryCard}>
                {/* Payment Breakdown */}
                <View style={styles.paymentBreakdown}>
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.label}>{selectedPlan?.product}</Text>
                      <Text style={styles.value}>
                        {Platform.OS === "ios" && product
                          ? product.localizedPrice
                          : formatCost(originalAmount)}
                      </Text>
                    </View>
                    {selectedPlan?.validityPeriod && (
                      <Text style={styles.orderDescription}>
                        Valid for {selectedPlan?.validityPeriod}
                      </Text>
                    )}
                  </View>

                  {/* Only show coupon discount for non-iOS users */}
                  {Platform.OS !== "ios" && matchedCoupon && (
                    <View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.label}>{matchedCoupon.name}</Text>
                        <Text style={[styles.value, { color: "#898483" }]}>
                          - {formatCost(discountAmount)}
                        </Text>
                      </View>
                      <Text style={styles.orderDescription}>
                        {matchedCoupon.description}
                      </Text>
                    </View>
                  )}

                  {/* Only show GST for non-iOS users */}
                  {Platform.OS !== "ios" && (
                    <View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.label}>
                          GST {selectedPlan?.taxPercentage}%
                        </Text>
                        <Text style={styles.value}>
                          {formatCost(taxAmount)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.rowBetween}>
                  <Text style={styles.totalLabel}>
                    Total (
                    {Platform.OS === "ios" ? product?.currency || "USD" : "INR"}
                    )
                  </Text>
                  <Text style={styles.totalAmount}>{getDisplayPrice()}</Text>
                </View>

                <Text style={styles.taxInfo}>
                  {Platform.OS === "ios"
                    ? "Price includes applicable taxes**"
                    : "Total includes applicable taxes**"}
                </Text>
              </View>

              {/* Bottom section */}
              <View style={styles.bottomSection}>
                {/* Only show savings for non-iOS users */}
                {Platform.OS !== "ios" && matchedCoupon && (
                  <View style={styles.row}>
                    <FA5Icon
                      name="birthday-cake"
                      size={20}
                      style={styles.iconSmall}
                    />
                    <Text style={styles.savingText}>
                      Nice! You saved {formatCost(discountAmount)} on your
                      order.
                    </Text>
                  </View>
                )}

                <View style={styles.paymentMethods}>
                  <View style={styles.row}>
                    <FAIcon name="lock" size={24} style={styles.iconSmall} />
                    <Text style={styles.secureText}>Secure Payment</Text>
                  </View>

                  {/* Show different payment method icons based on platform */}
                  <View style={styles.row}>
                    {Platform.OS === "ios" ? (
                      <>
                        <Image
                          source={require("../../../assets/icons/billing/visa-icon.png")}
                          style={styles.upiIcon}
                        />
                        <Image
                          source={require("../../../assets/icons/billing/master-card-icon.png")}
                          style={styles.upiIcon}
                        />
                        <Text style={styles.paymentMethodText}>App Store</Text>
                      </>
                    ) : (
                      <>
                        <Image
                          source={require("../../../assets/icons/billing/visa-icon.png")}
                          style={styles.upiIcon}
                        />
                        <Image
                          source={require("../../../assets/icons/billing/master-card-icon.png")}
                          style={styles.upiIcon}
                        />
                        <Image
                          source={require("../../../assets/icons/billing/credit-card-color-icon.png")}
                          style={styles.upiIcon}
                        />
                        <Image
                          source={require("../../../assets/icons/billing/upi-icon (3).png")}
                          style={styles.upiIcon}
                        />
                        <Image
                          source={require("../../../assets/icons/billing/rupay-logo-icon.png")}
                          style={styles.upiIcon}
                        />
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Terms and conditions - always show for iOS */}
            {Platform.OS === "ios" && (
              <Text className="w-full px-[16px] my-[16px] items-center justify-center text-left font-lato font-medium text-[14px] leading-[150%] text-[#8A8A8A]">
                By proceeding with the payment, you acknowledge and agree to our{" "}
                <Text
                  className="font-bold underline p-2"
                  onPress={() =>
                    router.push({
                      pathname: "/(pages)/Legal",
                      params: { id: "privacy" },
                    })
                  }
                >
                  Privacy Policy
                </Text>{" "}
                and{" "}
                <Text
                  className="font-bold underline p-2"
                  onPress={() =>
                    router.push({
                      pathname: "/(pages)/Legal",
                      params: { id: "tnc" },
                    })
                  }
                >
                  Terms of Use
                </Text>
                .
              </Text>
            )}

            {/* Main payment button */}
            <TouchableOpacity
              style={[
                styles.payButton,
                Platform.OS === "ios" &&
                  !isIAPInitialized &&
                  styles.payButtonDisabled,
              ]}
              onPress={
                Platform.OS === "ios" ? initiateIAPPayment : initiatePayment
              }
              disabled={
                processing ||
                restoring ||
                (Platform.OS === "ios" && !isIAPInitialized)
              }
            >
              {processing ? (
                <Text style={styles.payText}>Processing...</Text>
              ) : Platform.OS === "ios" && !isIAPInitialized ? (
                <Text style={styles.payText}>Connecting to App Store...</Text>
              ) : (
                <View style={styles.row}>
                  <Text style={styles.payText}>{getDisplayPrice()}</Text>
                  <FAIcon
                    name="arrow-right"
                    size={20}
                    style={styles.iconSmall}
                    color={"white"}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Restore purchases button - only for iOS */}
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[
                  styles.restoreButton,
                  !isIAPInitialized && styles.restoreButtonDisabled,
                ]}
                onPress={restorePurchases}
                disabled={processing || restoring || !isIAPInitialized}
              >
                {restoring ? (
                  <Text style={styles.restoreText}>Restoring...</Text>
                ) : !isIAPInitialized ? (
                  <Text style={[styles.restoreText, styles.disabledText]}>
                    Connecting to App Store...
                  </Text>
                ) : (
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Show IAP status for iOS if there are issues */}
            {Platform.OS === "ios" && !isIAPInitialized && (
              <View style={styles.iapStatusContainer}>
                <Text style={styles.iapStatusText}>
                  ⚠️ Connecting to App Store...
                </Text>
                <Text style={styles.iapStatusSubtext}>
                  Please wait a moment for the connection to establish
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F6F7",
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  innerContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    justifyContent: "space-between",
    gap: 38,
    paddingVertical: 30,
  },
  gstCard: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    justifyContent: "space-between",
    gap: 38,
    paddingVertical: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    lineHeight: 27,
    color: "#433F3E",
  },
  subtext: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "600",
  },
  costText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 20,
    lineHeight: 27,
    color: "#205E59",
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: "#5A5555",
    fontFamily: "System",
  },
  bold: {
    color: "#0A0B0A",
    fontWeight: "700",
  },
  regular: {
    color: "#0A0B0A",
    fontWeight: "700",
  },
  keyBenefitsSection: {
    width: "100%",
    gap: 16,
  },
  keyBenefitsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  keyBenefitsTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    lineHeight: 21,
    color: "#5A5555",
    paddingBottom: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: "0deg" }],
  },
  arrowIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  benefitsList: {
    gap: 26,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    padding: 8,
    backgroundColor: "#DAFBEA",
    borderRadius: 4,
  },
  benefitText: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 21,
    color: "#0A0B0A",
  },
  validitySection: {
    alignItems: "flex-start",
    gap: 16,
  },
  validityView: {
    alignItems: "flex-start",
    // gap: 12,
  },
  validityLine: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  validityText: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
    color: "#433F3E",
  },
  refundText: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    color: "#433F3E",
  },
  gstText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#433F3E",
  },
  linkText: {
    color: "blue",
  },
  couponContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    gap: 10,
  },
  heading: {
    fontFamily: "Montserrat_700Bold",
    // fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 24,
    color: "#433F3E",
  },
  couponSubtext: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 20,
    color: "#0A0B0A",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  input: {
    height: 45,
    flex: 1,
    color: "#747474",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCCBCB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "center",
    fontSize: 17,
  },
  applyBtn: {
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#153E3B",
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#153E3B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  removeText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  couponRow: {
    padding: 5,
    flexDirection: "row",
    // alignItems: 's',
    gap: 10,
    width: "100%",
  },
  appliedCoupon: {
    height: 45,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCCBCB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#E3E3E3",
  },
  couponCodeText: {
    // height: 45,
    textAlignVertical: "center",
    fontSize: 17,
    fontWeight: "bold",
    color: "#747474",
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
  },
  orderContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    width: "100%",
    gap: 20,
  },
  orderHeader: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 20,
    lineHeight: 24,
    color: "#433F3E",
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#DAFBEA",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 20,
  },
  paymentBreakdown: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0B0A",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0B0A",
  },
  orderDescription: {
    paddingRight: 75,
    fontSize: 14,
    fontWeight: "500",
    color: "#898483",
  },
  divider: {
    height: 1,
    backgroundColor: "#E3E3E3",
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#252626",
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    color: "#205E59",
  },
  taxInfo: {
    fontSize: 14,
    fontWeight: "400",
    color: "#464748",
    textAlign: "center",
  },
  bottomSection: {
    gap: 20,
    alignItems: "center",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
  },
  savingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0B0A",
  },
  payButton: {
    marginTop: 20,
    backgroundColor: "#153E3B",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  payText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },
  payButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  paymentMethods: {
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  secureText: {
    paddingLeft: 5,
    fontSize: 18,
    fontWeight: "semibold",
    color: "#0A0B0A",
  },
  iconSmall: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  iconLarge: {
    width: 40,
    height: 26,
    resizeMode: "contain",
    marginHorizontal: 2,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 5,
    backgroundColor: "#DAFBEA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  upiIcon: {
    marginHorizontal: 2,
    height: 26,
    width: 40,
  },
  gstEditButton: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3E3E3",
    borderColor: "#CCCBCB",
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0B0A",
  },
  // New styles for restore purchases and error handling
  restoreButton: {
    marginTop: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#153E3B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  restoreText: {
    color: "#153E3B",
    fontSize: 16,
    fontWeight: "500",
  },
  restoreButtonDisabled: {
    borderColor: "#A0A0A0",
    backgroundColor: "#F5F5F5",
  },
  disabledText: {
    color: "#A0A0A0",
  },
  iapStatusContainer: {
    marginTop: 20,
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFB74D",
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  iapStatusText: {
    color: "#F57C00",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  iapStatusSubtext: {
    color: "#F57C00",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: "#FFE6E6",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFB3B3",
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  contactSupportButton: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactSupportText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BillingContainer;
