import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EnquiryCPModal from "@/app/modals/EnquiryCPModal";
import ConfirmModal from "@/app/modals/ConfirmModal";
import ShareModal from "@/app/modals/ShareModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Enquiry, Property } from "@/app/types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { handleIdGeneration } from "@/app/helpers/nextId";
import deductMonthlyCredit from "@/app/helpers/deductCredit";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { router } from "expo-router";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import {
  getDaysDifference,
  getUnixDateTime,
} from "@/app/helpers/getUnixDateTime";
import CreditLimitModal from "@/app/modals/CreditLimitModal";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { formatCost, formatCost2, getDaysFrom } from "@/app/helpers/common";

// import icons from "@/app/assets/icons";
import apartment from "@/assets/icons/apartment.svg";
import villa from "@/assets/icons/villa.svg";
import villament from "@/assets/icons/villament.svg";
import rowHouse from "@/assets/icons/rowHouse.svg";
import plot from "@/assets/icons/plot.svg";
import independentBuilding from "@/assets/icons/independentBuilding.svg";
import officeSpace from "@/assets/icons/officeSpace.svg";
import retailSpace from "@/assets/icons/retailSpace.svg";
import commercialBuilding from "@/assets/icons/commercialBuilding.svg";

// import icons
import Location from "@/assets/icons/svg/PropertyFolder/location.svg";
import Share from "@/assets/icons/svg/PropertyFolder/shareButton.svg";

interface PropertyCardProps {
  property: any;
}

interface IdGenerationResult {
  lastId: string;
  nextId: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const boosterCredits =
    useSelector((state: RootState) => state.agent?.docData?.boosterCredits) ||
    0;

  const [selectedCPID, setSelectedCPID] = useState("");
  const [isConfirmModelOpen, setIsConfirmModelOpen] = useState(false);
  const [isEnquiryCPModelOpen, setIsEnquiryCPModelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [creditLimitModalVisible, setCreditLimitModalVisible] = useState(false);
  const [isGeneratingEnquiry, setIsGeneratingEnquiry] = useState(false);
  const agentData = useSelector((state: RootState) => state.agent.docData);
  const phoneNumber = useSelector(
    (state: RootState) => state?.agent?.docData?.phoneNumber
  );
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const enquiryConfirmed = useRef<Boolean>(false);

  const getIcon = () => {
    switch (property.assetType) {
      case "apartment":
        return apartment;
      case "villa":
        return villa;
      case "villament":
        return villament;
      case "row-house":
        return rowHouse;
      case "plot":
        return plot;
      case "independent-building":
        return independentBuilding;
      case "office-space":
        return officeSpace;
      case "retail-space":
        return retailSpace;
      case "commercial-building":
        return commercialBuilding;
      default:
        return commercialBuilding;
    }
  };

  const generateNextEnqId = async (): Promise<string | null> => {
    try {
      const type = "lastEnqId";
      const result = (await handleIdGeneration(type)) as IdGenerationResult;
      if (!result || !result.nextId) {
        showErrorToast(
          "Failed to generate Enquiry ID. Please try again later."
        );
        return null;
      }
      showSuccessToast("Enquiry ID generated successfully!", {
        isInModal: true,
      });
      return result.nextId;
    } catch (error) {
      showErrorToast("Error generating Enquiry ID. Please try again later.", {
        isInModal: true,
      });
      console.error("Error generating IDs:", error);
      return null;
    }
  };

  // Get property name with first letter capitalized
  const getPropertyName = () => {
    const name = property.propertyName || "";
    if (!name) return "Unnamed Property";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Handle enquire button click
  const handleEnquireNowBtn = (e: any) => {
    e.stopPropagation();
    try {
      logEvent(analytics, "property_enquire_click", {
        event_category: "property",
        event_label: "interaction",
        property_id: property.propertyId,
        credits_available: monthlyCredits,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging enquire click:", error);
    }

    setSelectedCPID(property.cpId || "");
    if (monthlyCredits + boosterCredits > 0) {
      setIsConfirmModelOpen(true);
      return;
    } else {
      setCreditLimitModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsConfirmModelOpen(false);
  };
  const handleGoPremium = () => {
    setCreditLimitModalVisible(false);
    router.push({
      pathname: "/CheckoutScreen",
      params: { planId: "premium" },
    });
  };

  const handleBuyCredits = () => {
    setCreditLimitModalVisible(false);
    router.push({
      pathname: "/CheckoutScreen",
      params: { planId: "booster" },
    });
  };

  const submitEnquiry = async (nextEnqId: string) => {
    if (!property.cpId) {
      showErrorToast("Error: Seller CPID is missing. Please try again.");
      return;
    }
    const docRef = doc(db, "acnAgents", property.cpId);
    const docSnap = await getDoc(docRef);
    const sellerData = docSnap.data();
    const enq: Enquiry = {
      enquiryId: nextEnqId,
      // buyer details
      buyerCpId: agentData?.cpId,
      buyerName: agentData?.name,
      buyerNumber: phoneNumber,
      // propterty details
      propertyId: property?.propertyId,
      propertyName: property?.propertyName,
      //seller details
      sellerCpId: sellerData?.cpId,
      sellerName: sellerData?.name,
      sellerNumber: sellerData?.phoneNumber,
      status: "pending",
      added: getUnixDateTime(),
      lastModified: getUnixDateTime(),
      reviews: [],
    } as Enquiry;

    try {
      const enquiryDocRef = doc(db, "acnEnquiries", nextEnqId);
      await setDoc(enquiryDocRef, enq);
      showSuccessToast("Enquiry submitted successfully!", {
        isInModal: true,
      });
    } catch (error) {
      showErrorToast("Failed to submit enquiry. Please try again.", {
        isInModal: true,
      });
      console.error("Error in enquiry submission:", error);
    }
    return enq;
  };

  const onConfirmEnquiry = async () => {
    console.log("onConfirmEnquiry called");
    if (!selectedCPID) {
      showErrorToast("Error: Seller CPID is missing. Please try again.");
      setIsConfirmModelOpen(false);
      return;
    }

    if (!(monthlyCredits + boosterCredits > 0)) {
      showErrorToast(
        "You don't have enough credits. Please contact your account manager."
      );
      setIsConfirmModelOpen(false);
      return;
    }

    try {
      setIsGeneratingEnquiry(true);
      const nextEnqId = await generateNextEnqId();
      if (!nextEnqId) {
        showErrorToast(
          "Failed to generate Enquiry ID. Please try again later."
        );
        setIsConfirmModelOpen(false);
        setIsGeneratingEnquiry(false);
        return;
      }

      logEvent(analytics, "property_enquiry_submit", {
        event_category: "property",
        event_label: "conversion",
        credits_used: 1,
        credits_remaining: monthlyCredits - 1,
        user_type: userType,
      });

      // ✅ Deduct credits first
      await deductMonthlyCredit(
        phoneNumber,
        monthlyCredits,
        dispatch,
        boosterCredits
      );
      let enq: Enquiry | undefined;

      if (typeof nextEnqId === "string") {
        enq = await submitEnquiry(nextEnqId);
      }

      // ✅ Close the confirmation modal
      setIsConfirmModelOpen(false);
      setIsGeneratingEnquiry(false);

      if (Platform.OS === "ios") {
        enquiryConfirmed.current = true;
      } else {
        setIsEnquiryCPModelOpen(true);
      }
      await fetch(
        `https://acn-notification-server.onrender.com/notification/enquiry/${nextEnqId}`,
        {
          body: JSON.stringify({
            enq,
          }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).catch((error) => {
        console.error("Error:", error);
      });
    } catch (error) {
      logEvent(analytics, "property_enquiry_error", {
        event_category: "property",
        event_label: "error",
        property_id: property.propertyId,
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
      console.error("Error during enquiry process:", error);
      showErrorToast(
        "An error occurred while processing your enquiry. Please try again."
      );
      setIsGeneratingEnquiry(false);
    }
  };

  const handleShareButton = (e: any) => {
    e.stopPropagation();
    try {
      logEvent(analytics, "property_share_click", {
        event_category: "property",
        event_label: "interaction",
        property_id: property.propertyId,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging share click:", error);
    }
    setIsShareModalOpen(true);
  };

  // Function to open property details screen with routing
  const openPropertyDetails = async () => {
    try {
      logEvent(analytics, "property_details_view", {
        event_category: "property",
        event_label: "navigation",
        property_id: property.propertyId,
        property_type: property.assetType,
        micromarket: property.micromarket,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging property details view:", error);
    }

    if (property) {
      dispatch(setPropertyDataThunk(property));
      router.push({
        pathname: "/components/property/PropertyDetailsScreen",
        params: {
          parent: "properties",
        },
      });
    }
  };

  return (
    <SafeAreaView>
      {/* Property Card */}
      <View style={styles.propertyCard}>
        <TouchableOpacity
          style={styles.propertyCardTouchable}
          onPress={openPropertyDetails}
        >
          <View style={styles.propertyHeaderContainer}>
            {/* Header section with Property ID and MicroMarket */}
            <View style={styles.propertyIdSection}>
              {/* Property ID on the left - using width fit-content approach */}
              <View style={styles.propertyIdContainer}>
                <View style={styles.propertyIdInner}>
                  <Text style={styles.propertyTitle}>
                    {property.propertyId}
                  </Text>
                </View>
                {getDaysDifference(
                  property.added,
                  Math.floor(Date.now() / 1000)
                ) > 10 ? (
                  <View>
                    <Text
                      style={styles.statusUpdateText}
                    >{`Status updated ${getDaysFrom(
                      property.dateOfLastChecked
                    )} ago`}</Text>
                  </View>
                ) : (
                  <View style={styles.newContainer}>
                    <Text style={styles.new}>Newly Added</Text>
                  </View>
                )}
              </View>

              {/* newly added flag */}
              {/* {getDaysDifference(
                property.added,
                Math.floor(Date.now() / 1000) <= 10
              ) && (
                <View style={styles.newContainer}>
                  <Text style={styles.new}>Newly Added</Text>
                </View>
              )} */}
            </View>
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                {getIcon() &&
                  React.createElement(getIcon(), { width: 40, height: 40 })}
              </View>
              <View style={styles.propertyNameContainer}>
                {/* Property Name */}
                <View style={styles.propertyHeader}>
                  <Text style={styles.propertyName}>{getPropertyName()}</Text>
                  <View style={styles.locationContainer}>
                    <Location width={16} height={16} />
                    <Text style={styles.locationText}>
                      {property.micromarket || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tags section for Asset Type, Unit Type, and Facing */}
            <View style={styles.tagsContainer}>
              {[property.assetType, property.unitType, property.facing]
                .filter(Boolean) // Filter out any falsy values
                .map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
            </View>
          </View>
          {/* Price and SBUA (Super Built-Up Area) section */}
          <View style={styles.priceSection}>
            {/* Total Ask Price */}
            <View style={styles.priceContainer}>
              {property.type === "resale" ? (
                <View>
                  <Text style={styles.priceLabel}>Ask Price</Text>
                  <Text style={styles.priceValue}>
                    {formatCost2(property.totalAskPrice)}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.priceLabel}>Rent</Text>
                  <Text style={styles.priceValue}>
                    {formatCost2(property?.rent?.rent)}
                  </Text>
                </View>
              )}
            </View>

            {/* Per Sqft or deposit*/}
            <View style={styles.priceContainer}>
              {property.type === "resale" ? (
                <View>
                  <Text style={styles.priceLabel}>Per Sqft Price</Text>
                  <Text style={styles.priceValue}>
                    {formatCost(property.pricePerSqft)}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.priceLabel}>Deposit</Text>
                  <Text style={styles.priceValue}>
                    {formatCost2(property?.rent?.deposit)}
                  </Text>
                </View>
              )}
            </View>

            {/* SBUA */}
            {property.assetType === "Plot" ? (
              <View style={styles.sbuaContainer}>
                <Text style={styles.sbuaLabel}>Plot Size</Text>
                <Text style={styles.sbuaValue}>
                  {property.plotSize ? `${property.plotSize} Sq Ft` : "-"}
                </Text>
              </View>
            ) : (
              <View style={styles.sbuaContainer}>
                <Text style={styles.sbuaLabel}>SBUA</Text>
                <Text style={styles.sbuaValue}>
                  {property.sbua ? `${property.sbua} Sq Ft` : "-"}
                </Text>
              </View>
            )}
          </View>

          {/* Buttons for Drive Details and Enquire Now */}
          <View style={styles.buttonsContainer}>
            {/* Enquire Now Button */}
            <TouchableOpacity
              style={styles.enquireButton}
              onPress={handleEnquireNowBtn}
            >
              <Ionicons name="call-outline" size={16} color="white" />
              <Text style={styles.enquireButtonText}>Enquire Now</Text>
            </TouchableOpacity>

            {/* share button*/}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleEnquireNowBtn}
            >
              <Share />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <EnquiryCPModal
        setIsEnquiryCPModelOpen={setIsEnquiryCPModelOpen}
        generatingEnquiry={false}
        visible={isEnquiryCPModelOpen}
        selectedCPID={selectedCPID}
        property={property}
      />

      <ConfirmModal
        title="Confirm Enquiry"
        message={`Are you sure you want to enquire? You have ${
          monthlyCredits + boosterCredits
        } credits remaining for this month.`}
        onConfirm={onConfirmEnquiry}
        onCancel={handleCancel}
        onModalHide={() => {
          if (enquiryConfirmed.current) {
            setIsEnquiryCPModelOpen(true);
            enquiryConfirmed.current = false;
          }
        }}
        generatingEnquiry={isGeneratingEnquiry}
        visible={isConfirmModelOpen}
      />

      <ShareModal
        property={property}
        agentData={agentData}
        setProfileModalOpen={setIsShareModalOpen}
        visible={isShareModalOpen}
      />
      <CreditLimitModal
        isVisible={creditLimitModalVisible}
        onClose={() => setCreditLimitModalVisible(false)}
        onGoPremium={handleGoPremium}
        onBuyCredits={handleBuyCredits}
      />
    </SafeAreaView>
  );
};

export default React.memo(PropertyCard);

const styles = StyleSheet.create({
  // Property Card Container
  propertyCard: {
    zIndex: -999,
  },

  propertyCardTouchable: {
    borderWidth: 1,
    borderColor: "#CCCBCB",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 16,
    flexDirection: "column",
    gap: 12,
  },

  // Header Section
  propertyHeaderContainer: {
    flexDirection: "column",
    // marginBottom: 12,
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },

  iconWrapper: {
    marginTop: 6,
  },

  propertyIdSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  propertyIdContainer: {
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  propertyIdInner: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 10,
  },

  newFlag: {
    backgroundColor: "#E93B3E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },

  newFlagText: {
    color: "#FFF",
    fontFamily: "Lato",
    fontStyle: "normal",
    lineHeight: 18,
    fontSize: 12,
    fontWeight: "500",
  },

  statusUpdateText: {
    color: "#726C6C",
    fontSize: 14,
    fontStyle: "normal",
    fontFamily: "Lato",
    fontWeight: "600",
    lineHeight: 21,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E3E3",
  },

  propertyTitle: {
    color: "#5A5555",
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E3E3",
    fontFamily: "Lato",
    fontWeight: "600",
    lineHeight: 21,
    letterSpacing: 0.25,
    paddingBottom: 2,
  },

  propertyHeader: {
    marginTop: 8,
    gap: 8,
    flexDirection: "column",
  },

  propertyNameContainer: {
    flexDirection: "column",
    gap: 4,
  },

  propertySubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    // marginTop: 40,
  },

  // Newly Added Flag
  newContainer: {
    backgroundColor: "#E93B3E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  new: {
    color: "#FFF",
    fontFamily: "Lato, sans-serif",
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: 18,
  },

  // Property Name
  propertyName: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_700Bold",
  },

  // Location Section
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  locationText: {
    fontSize: 14,
  },

  // Tags Section
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  tagItem: {
    borderWidth: 1,
    borderColor: "#205E59",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: "#F3FFFE",
  },

  tagText: {
    fontSize: 12,
    color: "#525252",
  },

  // Price and SBUA Section
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "#E3E3E3",
    paddingTop: 8,
    marginBottom: 12,
  },

  priceContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    borderRightColor: "#E3E3E3",
    borderRightWidth: 1,
    paddingRight: 20,
  },

  priceLabel: {
    color: "#433F3E",
    fontSize: 12,
    fontFamily: "Montserrat_500normal",
  },

  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  sbuaContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  sbuaLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
  },

  sbuaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  // Buttons Section
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },

  enquireButton: {
    flex: 1,
    backgroundColor: "#153E3B",
    borderRadius: 6,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  enquireButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
  },

  // Share Button (if needed)
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#E3E3E3",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#153E3B",
    borderWidth: 1,
  },
});
