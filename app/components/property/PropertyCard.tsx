import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Pressable,
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
import { router, usePathname } from "expo-router";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import {
  getDaysDifference,
  getUnixDateTime,
} from "@/app/helpers/getUnixDateTime";
import CreditLimitModal from "@/app/modals/CreditLimitModal";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import {
  formatCost,
  formatCost2,
  getDaysFrom,
  toCapitalizedWords,
} from "@/app/helpers/common";

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
import Cross from "@/assets/icons/PropertyCard/cross.svg";
import Tick from "@/assets/icons/PropertyCard/ticke.svg";
import Selected from "@/assets/icons/PropertyCard/selected.svg";

// service
import { getEnquiriesByPropertyID } from "@/app/services/user_services/enquiryService";

interface PropertyCardProps {
  property: any;
  selectedProperties?: string[];
  setSelectedProperties?: (selectedProperties: string[]) => void;
}

interface IdGenerationResult {
  lastId: string;
  nextId: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  selectedProperties,
  setSelectedProperties,
}) => {
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
  const [enquiries, setEnquiries] = useState(0);
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

  const pathname = usePathname();

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

  // fetch number of enquiries on the given property
  useEffect(() => {
    const handleFetch = async () => {
      const count = await getEnquiriesByPropertyID(property.propertyId);
      setEnquiries(count);
    };
    if (pathname === "/MyBusinessPage") {
      handleFetch();
    }
  }, []);

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
      if (pathname === "/MyBusinessPage") {
        router.push({
          pathname: "/(pages)/MyBusiness/PropertiesDetailsScreen",
        });
      } else {
        router.push({
          pathname: "/components/property/PropertyDetailsScreen",
          params: {
            parent: "properties",
          },
        });
      }
    }
  };

  const handleLongPress = () => {
    if (
      setSelectedProperties &&
      selectedProperties &&
      selectedProperties.includes(property.propertyId)
    ) {
      const properties = selectedProperties;
      properties.filter((prop) => {
        prop === property.propertyId;
      });
      setSelectedProperties(properties);
    }
    if (setSelectedProperties && selectedProperties) {
      const properties = selectedProperties;
      properties.push(property.propertyId);
      setSelectedProperties(properties);
    }
  };

  return (
    <View>
      {/* Property Card */}
      <View className="flex flex-row items-center gap-3">
        {pathname === "/MyBusinessPage" &&
          selectedProperties &&
          selectedProperties.length > 0 && (
            <View>
              {selectedProperties &&
              selectedProperties.includes(property.propertyId.toString()) ? (
                <TouchableOpacity
                  className="min-w-[25px] min-h-[25]"
                  onPress={handleLongPress}
                >
                  <Selected />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="min-w-[25px] min-h-[25] border border-[#E3E3E3] rounded-full"
                  onPress={handleLongPress}
                ></TouchableOpacity>
              )}
            </View>
          )}
        <View className="flex-1">
          {(pathname === "/MyBusinessPage" ||
            pathname === "/UnderReviewProperties") && (
            <View
              className={`${
                property.listingType === "rental"
                  ? "bg-[#FCE9BA]"
                  : "bg-[#EADDFF]"
              } max-w-[56px] max-h-[19px] items-center ml-4 px-[11px] pt-1 rounded-t-sm`}
            >
              <Text className="text-[#10302D] text-xs font-medium leading-[150%]">
                {toCapitalizedWords(property.listingType)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onLongPress={handleLongPress}
            className="flex flex-col border bg-white border-[#CCCBCB] rounded-lg"
            onPress={openPropertyDetails}
          >
            {pathname === "/MyBusinessPage" &&
              (property.status === "de-listed" ||
                (property.status === "available" &&
                  getDaysDifference(
                    property.dateOfStatusLastChecked + 60 * 60 * 24 * 15,
                    Math.floor(Date.now() / 1000)
                  ))) && (
                <View className="flex flex-row items-center justify-between bg-[#E3E3E3] rounded-t-lg px-4 py-2">
                  <View className="flex flex-col">
                    {getDaysDifference(
                      property.dateOfStatusLastChecked + 60 * 60 * 24 * 15,
                      Math.floor(Date.now() / 1000)
                    ) <= 4 &&
                      property.status === "available" && (
                        <Text className="font-[Lato] text-sm font-bold leading-[150%] tracking-[0.25px]">
                          Will get de-listed in{" "}
                          {getDaysDifference(
                            property.dateOfStatusLastChecked +
                              60 * 60 * 24 * 15,
                            Math.floor(Date.now() / 1000)
                          )}{" "}
                          days,
                        </Text>
                      )}
                    <Text className="font-[Lato] text-sm font-bold leading-[150%] tracking-[0.25px]">
                      Is the property available?
                    </Text>
                  </View>
                  <View className="flex flex-row gap-[10px]">
                    <Cross />
                    <Tick />
                  </View>
                </View>
              )}
            <View className="p-4">
              <View className="flex-col">
                {/* Header section with Property ID and MicroMarket */}
                <View className="flex-row items-center">
                  {/* Property ID on the left - using width fit-content approach */}
                  <View className="flex-1 shrink flex-row justify-between">
                    <View className="self-start flex-row gap-2.5">
                      <Text className="text-[#5A5555] text-sm border-b border-b-[#E3E3E3] font-[Lato] font-semibold leading-[21px] tracking-wide pb-0.5">
                        {property.propertyId}
                      </Text>
                    </View>
                    {getDaysDifference(
                      property.added,
                      Math.floor(Date.now() / 1000)
                    ) > 10 ? (
                      <View>
                        <Text className="text-[#726C6C] text-sm font-[Lato] font-semibold leading-[21px] border-b border-b-[#E3E3E3]">{`Status updated ${getDaysFrom(
                          property.dateOfLastChecked
                        )} ago`}</Text>
                      </View>
                    ) : (
                      <View className="bg-[#E93B3E] px-2 py-1 rounded">
                        <Text className="text-white font-[Lato] text-xs font-medium leading-[18px]">
                          Newly Added
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center mb-2 gap-1.5">
                  <View className="mt-1.5">
                    {getIcon() &&
                      React.createElement(getIcon(), { width: 40, height: 40 })}
                  </View>
                  <View className="flex-col gap-1">
                    {/* Property Name */}
                    <View className="mt-2 gap-2 flex-col">
                      <Text className="text-black text-base font-[Montserrat_700Bold]">
                        {getPropertyName()}
                      </Text>
                      <View className="flex-row items-center gap-0.5">
                        <Location width={16} height={16} />
                        <Text className="text-sm">
                          {property.micromarket || "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Tags section for Asset Type, Unit Type, and Facing */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {[property.assetType, property.unitType, property.facing]
                    .filter(Boolean) // Filter out any falsy values
                    .map((tag, index) => (
                      <View
                        key={index}
                        className="border border-[#205E59] px-3 py-1 rounded-3xl bg-[#F3FFFE]"
                      >
                        <Text className="text-xs text-[#525252]">{tag}</Text>
                      </View>
                    ))}
                </View>
              </View>

              {/* Price and SBUA (Super Built-Up Area) section */}
              <View className="flex-row justify-between items-start border-t border-t-[#E3E3E3] pt-2 mb-3">
                {/* Total Ask Price */}
                <View className="flex-col items-start border-r border-r-[#E3E3E3] pr-5">
                  {property.listingType === "rental" ? (
                    <View>
                      <Text className="text-[#433F3E] text-xs font-[Montserrat_500normal]">
                        Rent
                      </Text>
                      <Text className="text-sm font-semibold text-[#111827]">
                        {formatCost2(property?.rent?.rent)}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-[#433F3E] text-xs font-[Montserrat_500normal]">
                        Ask Price
                      </Text>
                      <Text className="text-sm font-semibold text-[#111827]">
                        {property?.pricing?.totalAskPrice
                          ? formatCost2(property.pricing.totalAskPrice)
                          : formatCost(property.totalAskPrice)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Per Sqft or deposit*/}
                <View className="flex-col items-start border-r border-r-[#E3E3E3] pr-5">
                  {property.listingType === "rental" ? (
                    <View>
                      <Text className="text-[#433F3E] text-xs font-[Montserrat_500normal]">
                        Deposit
                      </Text>
                      <Text className="text-sm font-semibold text-[#111827]">
                        {formatCost2(property?.rent?.deposit)}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-[#433F3E] text-xs font-[Montserrat_500normal]">
                        Per Sqft Price
                      </Text>
                      <Text className="text-sm font-semibold text-[#111827]">
                        {property?.pricing?.pricePerSqft
                          ? formatCost(property.pricing.pricePerSqft)
                          : property?.askPricePerSqft
                          ? formatCost(property.askPricePerSqft)
                          : null}
                      </Text>
                    </View>
                  )}
                </View>

                {/* SBUA */}
                {property.assetType === "plot" ? (
                  <View className="flex-col items-start">
                    <Text className="text-[#6B7280] text-xs font-[Montserrat_600SemiBold]">
                      Plot Size
                    </Text>
                    <Text className="text-sm font-semibold text-[#111827]">
                      {property.plotArea ? `${property.plotArea} Sq Ft` : "-"}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-col items-start">
                    <Text className="text-[#6B7280] text-xs font-[Montserrat_600SemiBold]">
                      SBUA
                    </Text>
                    <Text className="text-sm font-semibold text-[#111827]">
                      {property.sbua ? `${property.sbua} Sq Ft` : "-"}
                    </Text>
                  </View>
                )}
              </View>
              {pathname === "/properties" && (
                <View className="flex-row gap-3">
                  {/* Enquire Now Button */}
                  <TouchableOpacity
                    className="flex-1 bg-[#153E3B] rounded-md py-2 flex-row justify-center items-center"
                    onPress={handleEnquireNowBtn}
                  >
                    <Ionicons name="call-outline" size={16} color="white" />
                    <Text className="text-xs text-white font-medium ml-1">
                      Enquire Now
                    </Text>
                  </TouchableOpacity>

                  {/* share button*/}
                  <TouchableOpacity
                    className="w-[34px] h-[34px] rounded p-1.5 bg-[#E3E3E3] justify-center items-center border border-[#153E3B]"
                    onPress={handleShareButton}
                  >
                    <Share />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {pathname === "/MyBusinessPage" && (
              <View
                className={`flex flex-row justify-between rounded-b-lg px-4 py-2 ${
                  property.status.toLowerCase() === "available"
                    ? "bg-[#EAFFEF]"
                    : property.status.toLowerCase() === "sold"
                    ? "bg-[#F2F2F2]"
                    : property.status.toLowerCase() === "hold"
                    ? "bg-[#FFFCF0]"
                    : property.status.toLowerCase() === "de-listed"
                    ? "bg-[#FFF0F0]"
                    : ""
                }`}
              >
                <View className="flex flex-col gap-[2px]">
                  <Text className="text-[#5A5555] text-xs font-medium leading-[150%] tracking-[0.25px]">
                    Enquiries Recieved
                  </Text>
                  <Text className="text-[#2B2928] text-sm font-bold leading-[150%]">
                    {`${enquiries} ${
                      enquiries === 1 ? "Enquiry" : "Enquiries"
                    }`}
                  </Text>
                </View>
                <View className="flex flex-col gap-[2px]">
                  <Text className="text-[#5A5555] text-xs font-medium leading-[150%] tracking-[0.25px]">
                    Status
                  </Text>
                  <Text className="text-[#2B2928] text-sm font-bold leading-[150%]">
                    {toCapitalizedWords(property.status)}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
    </View>
  );
};

export default PropertyCard;
