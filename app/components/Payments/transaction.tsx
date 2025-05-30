import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  Image,
  Linking,
} from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Header } from "react-native-elements";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { Feather, AntDesign, MaterialIcons } from "@expo/vector-icons";
import PaymentHeader from "./PaymentHeader";
import { formatCardType } from "@/app/helpers/formatCardType";
import { formatCost, formatCost2 } from "@/app/helpers/common";
import EmailInvoiceIcon from "@/assets/icons/billing/emailInvoice.svg";
import DownloadPDFIcon from "@/assets/icons/billing/downloadPDF.svg";
import ContactSupportIcon from "@/assets/icons/billing/contactSupport.svg";
import RetryPaymentIcon from "@/assets/icons/billing/retryPayment.svg";

interface PaymentDetails {
  id: string;
  data: {
    amount: number;
    feesContext: {
      amount: number;
    };
    merchantId: string;
    merchantTransactionId: string;
    paymentInstrument: {
      accountType: string;
      bankId: string;
      cardType: string;
      cardNetwork: string;
      type: string;
    };
    transactionId: string;
    state: string;
    responseCode: string;
  };
  status: string;
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const Transaction = () => {
  const { id } = useLocalSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const docRef = doc(db, "payments", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaymentDetails({
            id: docSnap.id,
            ...docSnap.data(),
          } as PaymentDetails);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    };
    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);

  const paymentMethod = paymentDetails?.data?.paymentInstrument?.type;

  if (!paymentDetails) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // Format date and time
  const dateObj = new Date(paymentDetails.updatedAt.seconds * 1000);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateStr = `${
    monthNames[dateObj.getMonth()]
  } ${dateObj.getDate()} ${dateObj.getFullYear()}`;
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const timeStr = `${
    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  }:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

  // Copy logic
  const handleCopy = async () => {
    await Clipboard.setStringAsync(paymentDetails.id);
  };

  const handleRetryPayment = async () => {
    if (paymentDetails.data.amount === 24900) {
      router.push("/(pages)/Credits");
    } else {
      router.push("/billings");
    }
  };

  const handleContactSupport = async () => {
    const phone = `tel:+919415006092`;
    Linking.openURL(phone);
  };

  const handleEmailInvoice = async () => {
    try {
      const response = await fetch(
        `http://192.168.7.9:3000/mail/send-invoice/${paymentDetails.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      // LOG  {"message": "Invoice sent successfully!", "messageId": "<13286786-cd8d-f52c-097d-9589099e74f6@acnonline.in>", "success": true}
      console.log(data);
    } catch (error) {
      console.error("Error sending invoice email:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Section */}
      <PaymentHeader
        status={paymentDetails.status}
        txnId={paymentDetails.data.transactionId}
        dateStr={dateStr}
        timeStr={timeStr}
        handleCopy={handleCopy}
        paymentDetails={paymentDetails}
      />

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Payment ID:</Text>
          <Text style={styles.value}>{paymentDetails.data.transactionId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>
            {paymentDetails.status === "PAYMENT_SUCCESS"
              ? paymentMethod === "UPI"
                ? "UPI"
                : formatCardType(
                    paymentDetails.data.paymentInstrument.cardType
                  ) +
                  " (" +
                  paymentDetails.data.paymentInstrument.bankId +
                  ")"
              : "Not available"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.planTitle}>ACN Premium Plan</Text>
          <Text style={styles.planAmount}>
            {formatCost((paymentDetails.data.amount / 100 / 1.18).toFixed(2))}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.planSubLabel}>Valid until 25 May 2035</Text>
          <Text style={styles.planSubLabel}>Exclusive of taxes/-</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.taxTitle}>Tax Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Taxable Value</Text>
          <Text style={styles.value}>
            {formatCost((paymentDetails.data.amount / 100 / 1.18).toFixed(2))}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CGST (9%)</Text>
          <Text style={styles.value}>
            {formatCost(
              ((paymentDetails.data.amount / 100 / 1.18) * 0.09).toFixed(2)
            )}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SGST (9%)</Text>
          <Text style={styles.value}>
            {formatCost(
              ((paymentDetails.data.amount / 100 / 1.18) * 0.09).toFixed(2)
            )}
          </Text>
        </View>
        <View style={styles.dashedLine} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCost((paymentDetails.data.amount / 100).toFixed(2))}
          </Text>
        </View>
      </View>

      {paymentDetails.status !== "PAYMENT_SUCCESS" && (
        <Text style={styles.errorMsg}>
          Your payment did not go through. Please try again or contact support
          for assistance.
        </Text>
      )}

      <View style={styles.footer}>
        {paymentDetails.status === "PAYMENT_SUCCESS" ? (
          <>
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={handleEmailInvoice}
            >
              <EmailInvoiceIcon width={18} height={18} />
              <Text style={styles.footerBtnText}>Email Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerBtnPrimary]}
            >
              <DownloadPDFIcon width={18} height={18} />
              <Text style={[styles.footerBtnText, { color: "#fff" }]}>
                Download PDF Invoice
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={handleContactSupport}
            >
              <ContactSupportIcon width={18} height={18} />
              <Text style={styles.footerBtnText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerBtnPrimary]}
              onPress={handleRetryPayment}
            >
              <RetryPaymentIcon width={18} height={18} />
              <Text style={[styles.footerBtnText, { color: "#fff" }]}>
                Retry Payment
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Top Banner Styles
  topBannerSuccess: {
    backgroundColor: "#153E3B",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  topBannerFailed: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  headerRowBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTextBanner: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    marginLeft: 8,
  },
  headerTextBannerFailed: {
    color: "#000",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    marginLeft: 8,
  },
  statusRowBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTextSuccess: {
    color: "#4ADE80",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  statusTextFailed: {
    color: "#E53935",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  txnRowBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  txnIdBanner: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
  },
  txnIdBannerFailed: {
    color: "#000",
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
  },
  infoRowBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  infoTextBanner: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
    fontFamily: "Montserrat_400Regular",
  },
  infoTextBannerFailed: {
    color: "#707070",
    fontSize: 13,
    marginLeft: 4,
    marginRight: 16,
    fontFamily: "Montserrat_400Regular",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#707070",
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
  },
  value: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
  },
  planTitle: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  planAmount: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  planSubLabel: {
    color: "#707070",
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
  },
  taxTitle: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 8,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    marginVertical: 8,
  },
  totalLabel: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
  },
  totalValue: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  errorMsg: {
    color: "#707070",
    fontSize: 13,
    margin: 16,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFF",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#153E3B",
    borderRadius: 6,
    paddingVertical: 8,
    gap: 8,
  },
  footerBtnPrimary: {
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
  },
  footerBtnText: {
    fontFamily: "Lato_500Medium",
    fontSize: 14,
    color: "#000",
    marginLeft: 6,
    lineHeight: 18,
  },
  bannerRowCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 43,
  },
  footerBtnIcon: {
    width: 18,
    height: 18,
  },
});

export default Transaction;
