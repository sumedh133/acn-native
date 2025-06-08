import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
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
  const windowWidth = Dimensions.get("window").width;

  const isSuccess =
    status === "PAYMENT_SUCCESS" || status === "Paid Successfully";

  return paymentDetails.status === "PAYMENT_SUCCESS" ? (
    <View
      style={[
        styles.topBannerSuccess,
        { paddingHorizontal: windowWidth * 0.05 },
      ]}
    >
      <View style={styles.headerRowBanner}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerTextBanner}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.bannerRowCols]}>
        <View style={[styles.columnContainer]}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusTextSuccess}>Payment Successful</Text>
            <AntDesign
              name="checkcircleo"
              size={windowWidth * 0.045}
              color="#4ADE80"
              style={{ marginLeft: 6 }}
            />
          </View>
          <View style={[styles.txnContainer]}>
            <Text style={[styles.txnIdBanner]}>{paymentDetails.id}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather
                name="copy"
                size={windowWidth * 0.045}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.columnContainer, { gap: 6 }]}>
          <View style={[styles.infoContainer]}>
            <Feather name="clock" size={windowWidth * 0.04} color="#fff" />
            <Text style={[styles.infoTextBanner]} numberOfLines={1}>
              {dateStr}
            </Text>
          </View>
          <View style={[styles.infoContainer]}>
            <AntDesign name="calendar" size={windowWidth * 0.04} color="#fff" />
            <Text style={[styles.infoTextBanner]} numberOfLines={1}>
              {timeStr}
            </Text>
          </View>
        </View>
      </View>
    </View>
  ) : (
    <LinearGradient
      colors={["#FFF1F3", "#FFFFFF"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={[
        styles.topBannerFailed,
        { paddingHorizontal: windowWidth * 0.05 },
      ]}
    >
      <View style={styles.headerRowBanner}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerTextBannerFailed}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.bannerRowCols]}>
        <View style={[styles.columnContainer]}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusTextFailed}>Payment Failed</Text>
            <AntDesign
              name="closecircleo"
              size={windowWidth * 0.045}
              color="#E53935"
              style={{ marginLeft: 6 }}
            />
          </View>
          <View style={styles.txnContainer}>
            <Text style={styles.txnIdBannerFailed}>{paymentDetails.id}</Text>
            <TouchableOpacity onPress={handleCopy}>
              <Feather
                name="copy"
                size={windowWidth * 0.045}
                color="#000"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.columnContainer, { gap: 6 }]}>
          <View style={[styles.infoContainer]}>
            <Feather name="clock" size={windowWidth * 0.04} color="#707070" />
            <Text style={[styles.infoTextBannerFailed]} numberOfLines={1}>
              {dateStr}
            </Text>
          </View>
          <View style={[styles.infoContainer]}>
            <AntDesign
              name="calendar"
              size={windowWidth * 0.04}
              color="#707070"
            />
            <Text style={styles.infoTextBannerFailed} numberOfLines={1}>
              {timeStr}
            </Text>
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
    paddingTop: 32,
    paddingBottom: 20,
  },
  topBannerFailed: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
    width: "auto",
  },
  txnIdBannerFailed: {
    color: "#000",
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    width: "auto",
  },
  infoTextBanner: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
    fontFamily: "Montserrat_400Regular",
    width: "auto",
  },
  infoTextBannerFailed: {
    color: "#707070",
    fontSize: 13,
    marginLeft: 4,
    fontFamily: "Montserrat_400Regular",
    width: "auto",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
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
    justifyContent: "space-between",
    marginTop: 8,
    width: "100%",
  },
  columnContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  txnContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-end",
  },
});

export default PaymentHeader;
