import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";

interface PaymentHeaderProps {
  status: string;
  txnId: string;
  dateStr: string;
  timeStr: string;
  paymentDetails: any;
  handleCopy: () => void;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  status,
  txnId,
  paymentDetails,
  dateStr,
  timeStr,
  handleCopy,
}) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    handleCopy();
    setIsCopied(true);
  };
  const isSuccess =
    status === "PAYMENT_SUCCESS" || status === "Paid Successfully";

  return paymentDetails.status === "PAYMENT_SUCCESS" ||
    paymentDetails.status === "completed" ? (
    <View style={styles.topBannerSuccess}>
      <View style={styles.headerRowBanner}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTextBanner}>Back</Text>
      </View>
      {/* Two-column layout for status/txn and date/time */}
      <View style={styles.bannerRowCols}>
        {/* Left column: status and txn id */}
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={styles.statusTextSuccess}>Payment Successful</Text>
            <AntDesign
              name="checkcircleo"
              size={18}
              color="#4ADE80"
              style={{ marginLeft: 6 }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.txnIdBanner}>{paymentDetails.id}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather
                name="copy"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Right column: date and time */}
        <View
          style={{
            flex: 1,
            // alignItems: "flex-end",
            justifyContent: "flex-start",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather name="clock" size={16} color="#fff" />
            <Text style={styles.infoTextBanner}>{dateStr}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AntDesign name="calendar" size={16} color="#fff" />
            <Text style={styles.infoTextBanner}>{timeStr}</Text>
          </View>
        </View>
      </View>
    </View>
  ) : (
    <LinearGradient
      colors={["#FFF1F3", "#FFFFFF"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.topBannerFailed}
    >
      <View style={styles.headerRowBanner}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTextBannerFailed}>Back</Text>
      </View>
      {/* Two-column layout for status/txn and date/time */}
      <View style={styles.bannerRowCols}>
        {/* Left column: status and txn id */}
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={styles.statusTextFailed}>Payment Failed</Text>
            <AntDesign
              name="closecircleo"
              size={18}
              color="#E53935"
              style={{ marginLeft: 6 }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.txnIdBannerFailed}>{paymentDetails.id}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather
                name="copy"
                size={18}
                color="#000"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Right column: date and time */}
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather name="clock" size={16} color="#707070" />
            <Text style={styles.infoTextBannerFailed}>{dateStr}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AntDesign name="calendar" size={16} color="#707070" />
            <Text style={styles.infoTextBannerFailed}>{timeStr}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
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
  txnIdBanner: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
  },
  txnIdBannerFailed: {
    color: "#000",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
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
    fontFamily: "Montserrat_400Regular",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 16,
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
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  footerBtnPrimary: {
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
  },
  footerBtnText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#153E3B",
    marginLeft: 6,
  },
  bannerRowCols: {
    flexDirection: "row",
    // justifyContent: "space-between",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 43,
  },
});

export default PaymentHeader;
