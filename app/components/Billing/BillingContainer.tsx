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
} from "react-native-iap";

import { formatCost } from "../../helpers/common.js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store.js";
import { Coupon, SubscriptionPlan } from "@/app/types.js";
import { doc, onSnapshot } from "firebase/firestore";
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
  premiumAnnual: "acn_premium",
  // boosterPack: "acn_booster_pack",
};

const BillingContainer: React.FC<BillingContainerProps> = ({
  onOpenBusinessModal,
}) => {
  const route = useRoute<BillingContainerRouteProp>();
  const router = useRouter();
  const planId = route.params?.planId || "premium";

  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();

  const redirectUrl = "https://acnonline.in/billing";
  const [processing, setProcessing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // did not exist before IAP, next 3 lines
  const [product, setProduct] = useState<any>(null);
  const [iapError, setIapError] = useState<string | null>(null);
  const [isIAPInitialized, setIsIAPInitialized] = useState(false);

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
    const tax = parseFloat(
      (
        (originalAmount - discountAmount) *
        (selectedPlan?.taxPercentage! / 100)
      ).toFixed(2)
    );
    setTaxAmount(tax);
    // const newAmount = originalAmount - discountAmount + tax;
    let newAmount = Math.round(originalAmount - discountAmount + tax);
    // if (discountAmount == 0) { newAmount += 1 }
    setTotalAmount(newAmount);
  }, [discountAmount, originalAmount]);

  const businessName =
    useSelector((state: RootState) => state?.agent?.docData?.businessName) ||
    null;
  const gstNo =
    useSelector((state: RootState) => state?.agent?.docData?.gstNo) || null;
  const phoneNumber =
    useSelector((state: RootState) => state?.agent?.phonenumber) || null;
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

  // did not exist before IAP
  useEffect(() => {
    if (Platform.OS === "ios") {
      const initializeIAP = async () => {
        try {
          await initConnection();
          setIsIAPInitialized(true);

          // For testing, you can use a mock product
          if (__DEV__) {
            setProduct({
              productId: "acn_premium",
              localizedPrice: "₹9,999.00",
              price: "9999",
              currency: "INR",
              title: "ACN Premium Annual",
              description: "Annual subscription to ACN Premium",
            });
            return;
          }

          // Try to fetch real products
          const products = await getProducts({ skus: [iapProductIds.premiumAnnual] });
          if (products.length > 0) {
            setProduct(products[0]);
          } else {
            console.log("No products found");
            // For testing, set a mock product if no real products are found
            if (__DEV__) {
              setProduct({
                productId: "acn_premium",
                localizedPrice: "₹9,999.00",
                price: "9999",
                currency: "INR",
                title: "ACN Premium Annual",
                description: "Annual subscription to ACN Premium",
              });
            }
          }
        } catch (error) {
          console.error("IAP initialization error:", error);
          setIapError("Failed to initialize in-app purchases");

          // For testing, set a mock product on error
          if (__DEV__) {
            setProduct({
              productId: "acn_premium",
              localizedPrice: "₹9,999.00",
              price: "9999",
              currency: "INR",
              title: "ACN Premium Annual",
              description: "Annual subscription to ACN Premium",
            });
          }
        }
      };

      initializeIAP();

      return () => {
        endConnection();
      };
    }
  }, []);

  const initiatePayment = async () => {
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
    if (matchedCoupon) {
      const offPrice = Math.floor(
        originalAmount * (matchedCoupon.discount_percent / 100)
      );
      setDiscountAmount(offPrice);
    } else {
      setDiscountAmount(0);
    }
  }, [matchedCoupon]);

  const applyCoupon = () => {
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
      Alert.alert("Error", "Product not available");
      return;
    }

    setProcessing(true);
    try {
      if (__DEV__) {
        // Simulate a successful purchase in development
        console.log("Simulating purchase in development mode");
        const mockPurchase = {
          productId: product.productId,
          transactionId: "mock_transaction_" + Date.now(),
          transactionDate: Date.now(),
          receipt: "mock_receipt",
        };

        // Track successful purchase
        logEvent(analytics, "iap_purchase_success", {
          event_category: "billing",
          event_label: "payment",
          product_id: product.productId,
          amount: product.price,
          user_type: userType,
          is_sandbox: true,
        });

        console.log("Mock purchase successful:", mockPurchase);
        Alert.alert("Success", "Mock purchase completed successfully");
        return;
      }

      const purchase = await requestSubscription({
        sku: product.productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      console.log("Purchase successful:", purchase);

      // Track successful purchase
      logEvent(analytics, "iap_purchase_success", {
        event_category: "billing",
        event_label: "payment",
        product_id: product.productId,
        amount: product.price,
        user_type: userType,
      });
    } catch (error: any) {
      console.error("IAP purchase error:", error);
      setIapError(error.message || "Purchase failed");

      // Track purchase error
      logEvent(analytics, "iap_purchase_error", {
        event_category: "billing",
        event_label: "error",
        error_message: error.message || "Unknown error",
        product_id: product?.productId,
        user_type: userType,
      });

      Alert.alert("Error", error.message || "Purchase failed");
    } finally {
      setProcessing(false);
    }
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
                  {formatCost(originalAmount)}
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

              {!(businessName || gstNo) && (
                <Text style={styles.gstText}>
                  Have a GST?{" "}
                  <Text style={styles.linkText} onPress={onOpenBusinessModal}>
                    Click here
                  </Text>{" "}
                  to submit details
                </Text>
              )}
            </View>

            {(businessName || gstNo) && (
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
                    {/* <Icon name="edit" size={20} color="#000000" /> */}
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

            {/* coupon container */}
            {Platform.OS != "ios" && planId != "booster" && (
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
                        {/* {matchedCoupon
                          ? formatCost(originalAmount)
                          : formatCost(originalAmount + 1)} */}
                        {formatCost(originalAmount)}
                      </Text>
                    </View>
                    {selectedPlan?.validityPeriod && (
                      <Text style={styles.orderDescription}>
                        Valid for {selectedPlan?.validityPeriod}
                      </Text>
                    )}
                  </View>

                  {matchedCoupon && (
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

                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.label}>
                        GST {selectedPlan?.taxPercentage}%
                      </Text>
                      <Text style={styles.value}>{formatCost(taxAmount)}</Text>
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.rowBetween}>
                  <Text style={styles.totalLabel}>Total (INR)</Text>
                  <Text style={styles.totalAmount}>
                    {formatCost(totalAmount)}
                  </Text>
                </View>

                <Text style={styles.taxInfo}>
                  Total includes applicable taxes**
                </Text>
              </View>

              {/* Bottom section */}
              <View style={styles.bottomSection}>
                {matchedCoupon && (
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

                  <View style={styles.row}>
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
                  </View>
                </View>
              </View>
            </View>

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

            <TouchableOpacity
              style={styles.payButton}
              // before IAP
              // onPress={initiatePayment}

              onPress={
                Platform.OS === "ios" ? initiateIAPPayment : initiatePayment
              }
              disabled={processing}
            >
              {processing ? (
                <Text style={styles.payText}>Processing...</Text>
              ) : (
                <View style={styles.row}>
                  <Text style={styles.payText}>
                    {/* before IAP */}
                    {/* Pay {formatCost(totalAmount)} */}
                    Pay {product?.localizedPrice}
                    {/* {Platform.OS === "ios" && product
                      ? product.localizedPrice
                      : formatCost(totalAmount)} */}
                  </Text>
                  <FAIcon
                    name="arrow-right"
                    size={20}
                    style={styles.iconSmall}
                    color={"white"}
                  />
                </View>
              )}
            </TouchableOpacity>
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
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.8,
    //     shadowRadius: 5,
    //   },
    //   android: {
    //     elevation: 8, // Android shadow
    //   },
    // }),
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
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.8,
    //     shadowRadius: 5,
    //   },
    //   android: {
    //     elevation: 8, // Android shadow
    //   },
    // }),
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
});

export default BillingContainer;
