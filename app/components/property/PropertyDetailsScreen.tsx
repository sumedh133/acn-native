import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import ImageCarousel from "./ImageCarousel";
import { Enquiry, IdGenerationResult } from "@/app/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { handleIdGeneration } from "@/app/helpers/nextId";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import deductMonthlyCredit from "@/app/helpers/deductCredit";
import EnquiryCPModal from "@/app/modals/EnquiryCPModal";
import ConfirmModal from "@/app/modals/ConfirmModal";
import ShareModal from "@/app/modals/ShareModal";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import ReviewModal from "../Enquiries/ReviewModal";
import DashboardDropdown from "../dashboard/DashboardDropdown";
import HandOverIcon from "@/assets/icons/svg/HandoverIcon";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { LinearGradient } from "react-native-linear-gradient";
import { styled } from "nativewind";
import ShareIconInsidePropertyDetails from "@/assets/icons/svg/PropertiesPage/SHareIconPropertyDetailsModal";
import DriveIcon from "@/assets/icons/svg/PropertiesPage/DriveIcon";
import {
  selectPropertyStateData,
  listenToPropertyChanges,
} from "@/store/slices/propertySlice";
import Offline from "../Offline";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { propertyUserStatus } from "@/app/constants/PropertyConstants";
import { setKamModalVisible } from "@/store/slices/kamSlice";
import CreditLimitModal from "@/app/modals/CreditLimitModal";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { FormPreview } from "../Listing/listingPropertyDetails";
import {
  camelCaseToCapitalizedWords,
  formatCost2,
  toCapitalizedWords,
} from "@/app/helpers/common";
import { inventoryFormConfig } from "@/app/config/AddInventoryFormConfig/inventoryFormConfig";
import Share from "@/assets/icons/svg/PropertyFolder/shareButton.svg";

const { width } = Dimensions.get("window");

const StyledView = styled(View);
const StyledText = styled(Text);
interface AgentData {
  phoneNumber: string;
  [key: string]: any;
}

// Helper function to format currency similar to web implementation
const formatCost = (value: number) => {
  if (!value) return "N/A";

  if (value >= 100) {
    return `₹${(value / 100).toFixed(2)} Cr`;
  } else {
    return `₹${value} L`;
  }
};

// Helper function to format date
const formatDate = (timestamp?: number) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
export const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return "";
  const stringValue = String(value);
  const numericPart = stringValue.replace(/[^\d.]/g, "");
  const numValue = parseFloat(numericPart);

  if (isNaN(numValue)) return stringValue;
  const formattedNumber = numValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return stringValue.replace(numericPart, formattedNumber);
};

export const timeAgo = (seconds: number): string => {
  if (seconds < 0) {
    throw new Error("Input must be a non-negative number of seconds");
  }

  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Determine the appropriate unit
  if (seconds < day) {
    return `Today`;
  } else {
    const days = Math.floor(seconds / day);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
};

// InfoRow component for property details
const InfoRow = ({
  label,
  value,
  bottomPadding,
}: {
  label: string;
  value: any;
  bottomPadding?: number;
}) => (
  <View
    style={[
      styles.infoRow,
      bottomPadding ? { marginBottom: bottomPadding } : null,
    ]}
  >
    <Text style={styles.infoLabel}>{label}:</Text>
    <View style={styles.infoSeparator} />
    <Text style={styles.infoValue}>{formatNumber(value) || "-"}</Text>
  </View>
);

export default function PropertyDetailsScreen() {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const params = useLocalSearchParams();

  const property = useSelector(selectPropertyStateData);
  const agentData = useSelector(
    (state: RootState) => state?.agent?.docData
  ) as AgentData;
  const phoneNumber = useSelector(
    (state: RootState) => state?.agent?.docData?.phoneNumber
  );
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );
  const boosterCredits =
    useSelector((state: RootState) => state.agent?.docData?.boosterCredits) ||
    0;

  const parent = (params.parent as string) || "properties";
  const enqId = params.enqId as string;

  const [localImages, setLocalImages] = useState<string[]>([]);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCPID, setSelectedCPID] = useState(property.cpId);
  const [isConfirmModelOpen, setIsConfirmModelOpen] = useState(false);
  const [isEnquiryCPModelOpen, setIsEnquiryCPModelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [creditLimitModalVisible, setCreditLimitModalVisible] = useState(false);
  const [isGeneratingEnquiry, setIsGeneratingEnquiry] = useState(false);

  const enquiryConfirmed = useRef<Boolean>(false);

  const handlePropertyStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        logEvent(analytics, "property_status_change", {
          event_category: "property",
          event_label: "update",
          property_id: id,
          new_status: status,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging status change:", error);
      }

      const newStatus = status;
      try {
        await updateDoc(doc(db, "acnProperties", id), {
          status: newStatus,
          ageOfStatus: 0,
          dateOfStatusLastChecked: getUnixDateTime(),
        });
        showSuccessToast("Inventory status updated Successfully!");
      } catch (error) {
        showErrorToast("Error updating Inventory status!");
        console.error("Error updating status in Firestore:", error);
      }
    },
    []
  );

  const giveReviewClick = (e: any, enqId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReviewModalOpen(true);
  };

  const generateNextEnqId = async (): Promise<string | null> => {
    try {
      const type = "lastEnqId"; // Replace with "lastCpId" or others as needed
      const result = (await handleIdGeneration(type)) as IdGenerationResult;
      return result.nextId;
    } catch (error) {
      console.error("Error generating IDs:", error);
      return null;
    }
  };

  const openKamModal = () => {
    dispatch(setKamModalVisible(true));
  };

  // Return to previous screen
  const handleGoBack = () => {
    try {
      logEvent(analytics, "property_details_close", {
        event_category: "property",
        event_label: "navigation",
        property_id: property.propertyId,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging details close:", error);
    }
    router.back();
  };

  // Dummy handler functions
  const handleOpenGoogleMap = () => {
    try {
      logEvent(analytics, "property_map_click", {
        event_category: "property",
        event_label: "interaction",
        property_id: property.propertyId,
        has_map_location: !!property.mapLocation,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging map click:", error);
    }

    if (!property.mapLocation) {
      showErrorToast("Map location not available.");
      return;
    }
    Linking.openURL(property.mapLocation);
  };

  const handleOpenDriveDetails = () => {
    try {
      logEvent(analytics, "property_details_drive_click", {
        event_category: "property",
        event_label: "interaction",
        property_id: property.propertyId,
        has_drive_link: !!property.driveLink,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging drive click:", error);
    }

    if (!property.driveLink) {
      showErrorToast("Drive link not available.");
      return;
    }
    Linking.openURL(property.driveLink);
    showSuccessToast("Opening drive details...");
  };

  const handleEnquireNowBtn = (e: any) => {
    try {
      logEvent(analytics, "property_details_enquire_click", {
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
      isNew: true,
      isContactShared: false
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
    // axios.post(`https://notification-server-acn.onrender.com/${nextEnqId}`, {}, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    return enq;
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

  const onConfirmEnquiry = async () => {
    if (!selectedCPID) {
      showErrorToast("Error: Seller CPID is missing. Please try again.");
      setIsConfirmModelOpen(false);
      return;
    }

    if (!(monthlyCredits + boosterCredits > 0)) {
      setCreditLimitModalVisible(true);
      setIsConfirmModelOpen(false);
      return;
    }

    try {
      setIsGeneratingEnquiry(true);
      const nextEnqId = await generateNextEnqId();
      if (!nextEnqId) {
        showErrorToast(
          "Failed to generate the next Enquiry ID. Please try again later."
        );
        setIsConfirmModelOpen(false);
        setIsGeneratingEnquiry(false);
        return;
      }

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
      showErrorToast(
        "An error occurred while processing your enquiry. Please try again."
      );
      setIsGeneratingEnquiry(false);
    }
  };

  const handleShareButtonPress = () => {
    try {
      logEvent(analytics, "property_details_share_click", {
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

  const renderFooter = useCallback(() => {
    switch (parent) {
      case "properties":
        return (
          <>

            <TouchableOpacity
              className="flex-1 bg-[#153E3B] rounded-[4px] py-2 px-5 flex-row justify-center items-center"
              onPress={handleEnquireNowBtn}
            >
              <Ionicons name="call-outline" size={16} color="white" />
              <Text className="text-xs text-white font-medium ml-1">
                Enquire Now
              </Text>
            </TouchableOpacity>
            {/* share button*/}
            <TouchableOpacity
              className="w-[34px] h-[34px] rounded p-1.5 bg-[#FFFFFF] justify-center items-center border border-[#C3C3C3]"
              onPress={handleShareButtonPress}
            >
              <Share />

            </TouchableOpacity>
          </>
        );
      case "dashboardEnquiry":
        return (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOpenDriveDetails}
            >
              <DriveIcon />
              <Text style={styles.secondaryButtonText}>Open Details</Text>
            </TouchableOpacity>
            <Pressable
              onPress={(e) => giveReviewClick(e, enqId!)}
              style={styles.primaryButton}
            >
              <MaterialIcons name="edit" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Give review</Text>
            </Pressable>
          </>
        );
      case "dashboardInventory":
        return (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOpenDriveDetails}
            >
              <DriveIcon />
              <Text style={styles.secondaryButtonText}>Open Details</Text>
            </TouchableOpacity>
            <View>
              <DashboardDropdown
                value={property.status || "Available"}
                setValue={(val) =>
                  handlePropertyStatusChange!(property?.propertyId, val)
                }
                options={[
                  { label: "Available", value: "Available" },
                  { label: "Hold", value: "Hold" },
                  { label: "Sold", value: "Sold" },
                ]}
                type={"inventory"}
                openDropdownUp={true}
                parent="dashboardInventory"
                updatePropertySlice={true}
              />
            </View>
          </>
        );
      case "dashboardListing":
        return (
          <>
            <Text style={styles.footerText}>Have any Issue?</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openKamModal}
            >
              <Ionicons name="call-outline" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Call your KAM</Text>
            </TouchableOpacity>
          </>
        );
      default:
        break;
    }
  }, [
    parent,
    property,
    handleOpenDriveDetails,
    handlePropertyStatusChange,
    giveReviewClick,
    handleEnquireNowBtn,
    openKamModal,
  ]);

  useEffect(() => {
    const photos = property.photo || [];
    const videos = property.video || [];
    setLocalImages([...photos, ...videos]);
  }, [property.photo, property.video]);

  // Update useEffect to handle loading state
  useEffect(() => {
    const initializeContent = async () => {
      try {
        // Initialize images array
        const images = [...(property.photo || []), ...(property.video || [])];
        setLocalImages(images);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    initializeContent();
  }, [property.photo, property.video]);

  // Track initial view of property details
  useEffect(() => {
    try {
      logEvent(analytics, "property_details_screen_view", {
        event_category: "property",
        event_label: "view",
        property_id: property.propertyId,
        property_type: property.assetType,
        micromarket: property.micromarket,
        parent_screen: parent,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging screen view:", error);
    }
  }, [
    property.propertyId,
    property.assetType,
    property.micromarket,
    parent,
    userType,
  ]);

  // Track image viewer interactions
  useEffect(() => {
    if (isImageViewerVisible) {
      try {
        logEvent(analytics, "property_image_viewer_open", {
          event_category: "property",
          event_label: "interaction",
          property_id: property.propertyId,
          total_images: localImages.length,
          current_image: currentImageIndex + 1,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging image viewer:", error);
      }
    }
  }, [
    isImageViewerVisible,
    property.propertyId,
    localImages.length,
    currentImageIndex,
    userType,
  ]);

  // Set up firestore listener for live updates
  useEffect(() => {
    if (property?.propertyId) {
      const unsubscribe = dispatch(
        listenToPropertyChanges(property.propertyId)
      ) as (() => void) | undefined;
      return () => {
        if (typeof unsubscribe === "function") unsubscribe();
      };
    }
  }, [property?.propertyId]);

  if (!isConnectedToInternet) return <Offline />;

  return (
    <View style={styles.container}>

      <FormPreview config={inventoryFormConfig} data={property} previewType="listing" />
      <ShareModal
        property={property}
        agentData={agentData}
        setProfileModalOpen={setIsShareModalOpen}
        visible={isShareModalOpen}
      />

      <ConfirmModal
        title="Confirm Enquiry"
        message={`Are you sure you want to enquire? You have ${monthlyCredits + boosterCredits
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

      <EnquiryCPModal
        setIsEnquiryCPModelOpen={setIsEnquiryCPModelOpen}
        generatingEnquiry={false}
        visible={isEnquiryCPModelOpen}
        selectedCPID={selectedCPID || ""}
        property={property}
      />
      <CreditLimitModal
        isVisible={creditLimitModalVisible}
        onClose={() => setCreditLimitModalVisible(false)}
        onGoPremium={handleGoPremium}
        onBuyCredits={handleBuyCredits}
      />
      {parent !== "properties" && (<>

        {/* Fixed share button */}
        < TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareButtonPress}
        >
          <ShareIconInsidePropertyDetails />
        </TouchableOpacity>
      </>)
      }

      {/* Footer Actions */}
      <View style={styles.footer}>{renderFooter()}</View>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          enqId={enqId!}
        />
      )}

      {/* Image Viewer Modal for full-screen images */}
      {isImageViewerVisible && (
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeImageViewer}
            onPress={() => setIsImageViewerVisible(false)}
          >
            <CloseIcon />
          </TouchableOpacity>

          {localImages.length > 0 && (
            <Image
              source={{ uri: localImages[currentImageIndex] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.imageNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              disabled={currentImageIndex === 0}
              onPress={() => setCurrentImageIndex((prev) => prev - 1)}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={currentImageIndex === 0 ? "#999999" : "white"}
              />
            </TouchableOpacity>

            <Text style={styles.imageCounter}>
              {currentImageIndex + 1}/{localImages.length}
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              disabled={currentImageIndex === localImages.length - 1}
              onPress={() => setCurrentImageIndex((prev) => prev + 1)}
            >
              <Ionicons
                name="chevron-forward"
                size={28}
                color={
                  currentImageIndex === localImages.length - 1
                    ? "#999999"
                    : "white"
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#CFCECE",
  },
  headerTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  propertyIdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: "#747474",
  },
  propertyIdText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FAFBFC",
    fontFamily: "Lato",
  },
  propertyStatusBadge: {
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  propertyStatusText: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  propertyName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    lineHeight: 21,
    color: "#0A0B0A",
  },
  locationInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "48%",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#2B2928",
    fontFamily: "Lato",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  infoSectionContainer: {
    borderWidth: 1,
    borderColor: "#CCCBCB",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    gap: 16,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A5555",
    fontFamily: "Montserrat_600SemiBold",
  },
  infoSeparator: {
    flex: 1,
    height: 1,
    backgroundColor: "#E3E3E3",
    marginHorizontal: 16,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B2928",
  },
  locationSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    marginHorizontal: 16,
  },
  locationDetails: {
    gap: 8,
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A5555",
    fontFamily: "Montserrat_600SemiBold",
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B2928",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#153E3B",
    borderRadius: 8,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#10302D",
  },
  extraDetailsSection: {
    backgroundColor: "#F5F6F7",
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  extraDetailsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5A5555",
    fontFamily: "Montserrat_600SemiBold",
  },
  extraDetailsContent: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    color: "#2B2928",
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B2928",
  },
  noDetailsText: {
    color: "#6B7280",
  },
  additionalInfo: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    gap: 12,
    paddingHorizontal: 16,
  },
  additionalInfolable: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
  },
  shareButton: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#153E3B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#153E3B",
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#153E3B",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#153E3B",
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  imageViewerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    zIndex: 1000,
  },
  closeImageViewer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1010,
  },
  fullImage: {
    width: width,
    height: width,
  },
  imageNavigation: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  footerText: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 700,
    height: "100%",
    textAlignVertical: "center",
  },
});
