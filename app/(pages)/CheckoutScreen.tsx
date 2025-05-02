import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Checkbox from "../components/Listing/CheckBox";
import BusinessDetailsModal from "../components/Billing/BusinessDetailsModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FontAwesome as FAIcon, Feather } from "@expo/vector-icons";
import { Coupon } from "@/app/types.js";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/utils/toastUtils";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useRoute, RouteProp } from "@react-navigation/native";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { formatCost } from "../helpers/common.js";

// Define plan interface
interface Plan {
  id: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  validityPeriod: string;
  validUntil: string;
  monthlyCredits: number;
  basePrice: number;
  discount: number;
  taxPercentage: number;
}

// Sample plans data
const AVAILABLE_PLANS: Plan[] = [
  {
    id: "booster",
    productName: "Enquiry Booster Pack",
    productPrice: 249,
    productDescription: "5 Credits with no expiry",
    validityPeriod: "",
    validUntil: "",
    monthlyCredits: 0,
    basePrice: 204.18,
    discount: 0,
    taxPercentage: 18,
  },
  {
    id: "premium",
    productName: "ACN Premium",
    productPrice: 10000,
    productDescription: "1 Premium Account",
    validityPeriod: "For 12 Months",
    validUntil: "28 Apr 2026",
    monthlyCredits: 100,
    basePrice: 8200,
    discount: 0,
    taxPercentage: 18,
  },
];

type CheckoutScreenRouteProp = RouteProp<{
  CheckoutScreen: {
    planId?: string;
  };
}>;

const CheckoutScreen: React.FC = () => {
  // Find the selected plan or default to the first one
  const route = useRoute<CheckoutScreenRouteProp>();

  // Extract planId from route params, with a fallback to 'premium'
  const planId = route.params?.planId || "premium";
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    AVAILABLE_PLANS.find((plan) => plan.id === planId) || AVAILABLE_PLANS[1]
  );

  const [useGSTInvoice, setUseGSTInvoice] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(selectedPlan.discount);
  const [showModal, setShowModal] = useState(false);
  const [allCoupons, setAllCoupons] = useState<Coupon[] | []>([]);
  const [couponCode, setCouponCode] = useState("");
  const [matchedCoupon, setMatchedCoupon] = useState<Coupon | null>(null);
  const businessName =
    useSelector((state: RootState) => state?.agent?.docData?.businessName) ||
    null;
  const gstNo =
    useSelector((state: RootState) => state?.agent?.docData?.gstNo) || null;
  const phoneNumber =
    useSelector((state: RootState) => state?.agent?.phonenumber) || null;
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;
  // Calculate tax amount
  const calculateTax = (price: number) => {
    return (price * selectedPlan.taxPercentage) / 100;
  };

  const applyCoupon = () => {
    if (!allCoupons || allCoupons?.length === 0) {
      setMatchedCoupon(null);
      showErrorToast("Invalid Coupon Code");
      return;
    }

    const match =
      allCoupons?.find((item) => item?.code === couponCode && item.active) ||
      null;
    if (match) {
      setMatchedCoupon(match);
      showSuccessToast("Coupon Applied");
    } else {
      setMatchedCoupon(null);
      showErrorToast("Invalid Coupon Code");
    }

    return;
  };
  const removeCoupon = () => {
    setMatchedCoupon(null);
    setCouponCode("");
    showInfoToast("Coupon Removed");
  };

  const taxAmount = calculateTax(selectedPlan.productPrice);
  const total = selectedPlan.basePrice + taxAmount;
  const [totalAmount, setTotalAmount] = useState(total);

  // Handle plan changes (can be triggered from outside)
  const changePlan = (newPlanId: string) => {
    const newPlan = AVAILABLE_PLANS.find((plan) => plan.id === newPlanId);
    if (newPlan) {
      setSelectedPlan(newPlan);
      setAppliedDiscount(newPlan.discount);
    }
  };

  useEffect(() => {
    setShowModal(useGSTInvoice);
  }, [useGSTInvoice]);
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
  useEffect(() => {
    if (matchedCoupon) {
      const newAmount = totalAmount - matchedCoupon.discount;
      setTotalAmount(newAmount);
    } else {
      setTotalAmount(selectedPlan.productPrice);
    }
  }, [matchedCoupon]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Product Details Card */}
        <View style={styles.card}>
          <View style={styles.productDetails}>
            <View>
              <Text style={styles.productTitle}>
                {selectedPlan.productName}
              </Text>
              <Text style={styles.productDescription}>
                {selectedPlan.productDescription}
              </Text>
            </View>
            <View>
              <Text style={styles.productPrice}>
                ₹{selectedPlan.productPrice.toLocaleString("en-IN")}
              </Text>
              {selectedPlan.validityPeriod && (
                <Text style={styles.validityText}>
                  {selectedPlan.validityPeriod}
                </Text>
              )}
            </View>
          </View>

          {selectedPlan.monthlyCredits > 0 && (
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <Text style={styles.timelineText}>
                  Today: {selectedPlan.monthlyCredits} Credits per month for a
                  year
                </Text>
              </View>
              {selectedPlan.validUntil && (
                <>
                  <View style={styles.timelineConnector} />
                  <View style={styles.timelineItem}>
                    <View
                      style={[styles.timelineDot, styles.timelineDotEmpty]}
                    />
                    <Text style={styles.timelineText}>
                      Valid till {selectedPlan.validUntil}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          <Text style={styles.productTerms}>
            Non-refundable & Non-transferable.*
          </Text>
          {!(businessName || gstNo) && (
            <>
              <View style={styles.divider} />
              <View style={styles.gstOption}>
                <Checkbox
                  checked={useGSTInvoice}
                  setChecked={setUseGSTInvoice}
                />

                <Text style={styles.gstText}>Use GST Invoice</Text>
              </View>
            </>
          )}
        </View>
        {(businessName || gstNo) && (
          <View style={[styles.card]}>
            <View style={styles.gstheader}>
              <Text style={[styles.title, { fontSize: 16, lineHeight: 24 }]}>
                GST details added :
              </Text>
              <TouchableOpacity
                style={styles.gstEditButton}
                onPress={() => setShowModal(true)}
              >
                {/* <Icon name="edit" size={20} color="#000000" /> */}
                <Feather name="edit-3" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View style={{ width: "100%", gap: 12 }}>
              <View style={{ width: "100%", gap: 8 }}>
                <Text style={styles.validityText}>
                  Business Name: <Text style={styles.bold}>{businessName}</Text>
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

        {planId == "premium" &&
          (!matchedCoupon ? (
            <View style={styles.card}>
              <Text style={styles.couponTitle}>Coupon code</Text>
              <Text style={styles.couponDescription}>
                Have a coupon? Enter the code here to avail discounts!
              </Text>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyCoupon}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.couponTitle}>
                <FAIcon name="tag" size={20} style={styles.icon} />
                <Text style={styles.couponCodeText}>{matchedCoupon?.code}</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={removeCoupon}>
                <CloseIcon />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryText}>
                {selectedPlan.id === "premium"
                  ? "Annual membership"
                  : "5 Credits"}
              </Text>
              <Text style={styles.summaryPrice}>
                ₹{selectedPlan.basePrice.toLocaleString("en-IN")}
              </Text>
            </View>

            {appliedDiscount > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryText}>Discount</Text>
                <Text style={styles.summaryPrice}>
                  -₹{appliedDiscount.toLocaleString("en-IN")}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryText}>
                Tax {selectedPlan.taxPercentage}%
              </Text>
              <Text style={styles.summaryPrice}>
                ₹{taxAmount.toLocaleString("en-IN")}
              </Text>
            </View>
            {matchedCoupon && (
              <View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryText}>{matchedCoupon.name}</Text>
                  <Text style={[styles.summaryPrice, { color: "#898483" }]}>
                    - {formatCost(matchedCoupon.discount)}
                  </Text>
                </View>
                <Text style={styles.taxNote}>
                  {matchedCoupon.description}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total (INR)</Text>
              <Text style={styles.totalPrice}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </Text>
            </View>
            <Text style={styles.taxNote}>
              Total includes applicable taxes**
            </Text>
          </View>

          {/* Payment Section */}
          <View style={styles.paymentSection}>
            <View style={styles.securePayment}>
              <Icon name="lock-closed" size={18} color="#000" />
              <Text style={styles.securePaymentText}>Secure Payment</Text>
            </View>
            <View style={styles.row}>
              <Image
                source={require("../../assets/icons/billing/visa-icon.png")}
                style={styles.upiIcon}
              />
              <Image
                source={require("../../assets/icons/billing/master-card-icon.png")}
                style={styles.upiIcon}
              />
              <Image
                source={require("../../assets/icons/billing/credit-card-color-icon.png")}
                style={styles.upiIcon}
              />
              <Image
                source={require("../../assets/icons/billing/upi-icon (3).png")}
                style={styles.upiIcon}
              />
              <Image
                source={require("../../assets/icons/billing/rupay-logo-icon.png")}
                style={styles.upiIcon}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <TouchableOpacity style={styles.paymentButton}>
        <Text style={styles.paymentButtonText}>
          Pay ₹{totalAmount.toLocaleString("en-IN")}
        </Text>
        <Icon name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
      <BusinessDetailsModal
        isVisible={showModal}
        onClose={() => {
          setShowModal(false);
          setUseGSTInvoice(false);
        }}
      />
    </SafeAreaView>
  );
};
export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,

    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#433F3E",
  },
  productPrice: {
    fontSize: 20,
    fontFamily: "Montserrat_600SemiBold",
    color: "#205E59",
    textAlign: "right",
  },
  validityText: {
    fontSize: 14,
    color: "#575757",
    fontFamily: "Lato",
    fontWeight: 700,
    textAlign: "left",
  },
  productDescription: {
    fontSize: 14,
    color: "#726C6C",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 16,
  },
  timeline: {
    marginVertical: 2,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#292D32",
    marginRight: 12,
  },
  timelineDotEmpty: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#292D32",
  },
  timelineConnector: {
    width: 2,
    height: 12,
    backgroundColor: "#292D32",
    marginLeft: 7,
  },
  timelineText: {
    fontSize: 12,
    color: "#726C6C",
    fontFamily: "Lato",
    fontWeight: 700,
  },
  productTerms: {
    fontSize: 12,
    color: "#726C6C",
    marginBottom: 10,
    marginTop: 12,
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    backgroundColor: "#E3E3E3",
    marginVertical: 8,
  },
  gstOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  gstText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 700,
    fontFamily: "Lato",
    color: "#000000",
  },
  couponTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 8,
    color: "#433F3E",
  },
  couponDescription: {
    fontSize: 12,
    color: "#0A0B0A",
    fontFamily: "Lato",
    marginBottom: 16,
  },
  couponInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#153E3B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Lato",
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 16,
    color: "#433F3E",
  },
  summaryContainer: {
    backgroundColor: "#DAFBEA",
    borderRadius: 8,
    padding: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    color: "#0A0B0A",
  },
  summaryPrice: {
    fontSize: 16,
    fontFamily: "Lato",
    fontWeight: "700",
    color: "#0A0B0A",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalText: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
    color: "#252626",
  },
  totalPrice: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
    color: "#252626",
  },
  taxNote: {
    fontSize: 12,
    color: "#464748",
    textAlign: "center",
  },
  paymentSection: {
    marginTop: 24,
    alignItems: "center",
  },
  securePayment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  securePaymentText: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0A0B0A",
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
  },
  upiIcon: {
    marginHorizontal: 2,
    height: 26,
    width: 40,
  },
  paymentButton: {
    backgroundColor: "#153E3B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    margin: 16,
    borderRadius: 6,
  },
  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "Lato",
    marginRight: 8,
  },
  gstCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    justifyContent: "space-between",
    gap: 38,
    paddingVertical: 30,
  },
  refundText: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    color: "#433F3E",
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    lineHeight: 27,
    color: "#433F3E",
  },
  gstheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  validitySection: {
    alignItems: "flex-start",
    gap: 4,
  },
  // validityText: {
  //   fontFamily: "System",
  //   fontSize: 18,
  //   fontWeight: "500",
  //   lineHeight: 24,
  //   color: "#433F3E",
  // },
  bold: {
    color: "#0A0B0A",
    fontWeight: "700",
  },
  couponCodeText: {
    height: 45,
    textAlignVertical: "center",
    fontSize: 17,
    fontWeight: "bold",
    color: "#747474",
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
  icon: {
    width: 20,
    height: 20,
  },
});
