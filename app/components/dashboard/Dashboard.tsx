import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  FontAwesome,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import MonthFilterDropdown from "../../components/MonthFilterDropdown";
import PropertyDetailsScreen from "../../components/property/PropertyDetailsScreen";
import { styled } from "nativewind";
import EnquiryCard from "../Enquiries/EnquiryCard";
import TabCarousel from "./TabCarousel";
import {
  Property,
  Requirement,
  EnquiryWithProperty,
  Enquiry,
  ListingProperty,
} from "@/app/types";
import { formatCost2, toCapitalizedWords } from "@/app/helpers/common";
import DashboardDropdown from "./DashboardDropdown";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import RequirementDetailsModal from "../requirement/RequirementDetailsModal";
import RequirementDetailsScreen from "../requirement/RequirementDetailsScreen";
import ShareModal from "@/app/modals/ShareModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  generatePropertyMonths,
  filterPropertiesByMonth,
  generateRequirementMonths,
  filterRequirementsByMonth,
  generateEnquiryMonths,
  filterEnquiriesByMonth,
  generateListingAndPropertyMonths,
  filterListingsByMonth,
} from "../../helpers/dashboardMonthFiltersHelper";
import { router } from "expo-router";
import EmptyTabContent from "./EmptyTabContent";
import { selectKamNumber } from "@/store/slices/kamSlice";
import MyRequirementIcon from "@/assets/icons/svg/Dashboard/MyRequirementsIcon";
import MyInverntoriesIcon from "@/assets/icons/svg/Dashboard/MyInventoriesIcon";
import MyEnquiriesIcon from "@/assets/icons/svg/Dashboard/MyEnquiryIcon";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import PropertyTabCarousel from "./InventoriesCarousel";
import PropertyCard from "./PropertyCard";
import RequirementCard from "./RequirementCard";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

type DashboardProps = {
  myEnquiries: EnquiryWithProperty[];
  myProperties: Property[];
  myRequirements: Requirement[];
  myListing: ListingProperty[];
  loading: {
    enquiriesLoading: boolean;
    propertiesLoading: boolean;
    requirementsLoading: boolean;
    listingLoading: boolean;
  };
};

export default function Dashboard({
  myEnquiries,
  myProperties,
  myRequirements,
  myListing,
  loading,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("inventories");
  const [properties, setProperties] = useState<Property[] | []>([]);
  const [requirements, setRequirements] = useState<Requirement[] | []>([]);
  const [enquiries, setEnquiries] = useState<EnquiryWithProperty[] | []>([]);
  const [listings, setListings] = useState<ListingProperty[] | []>([]);
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [monthFilterOptions, setMonthFilterOptions] = useState<
    Array<{ label: string; value: any }>
  >([]);
  const [propertiesTab, setPropertiesTab] = useState("listed");
  const [propertyCounts, setPropertyCounts] = useState<{
    [slug: string]: number;
  }>({});
  const [batchSize, setBatchSize] = useState(10);
  const [bufferring, setBuffering] = useState(false);
  const [renderingNewBatch, setRenderingNewBatch] = useState(false);

  const isBatchSizePendingLock = useRef(false);
  const initalLoad = useRef(true);

  const kam_number = useSelector(selectKamNumber);

  const renderMore = () => {
    if (isBatchSizePendingLock.current) return;
    let totalCount = 0;
    switch (activeTab) {
      case "inventories":
        switch (propertiesTab) {
          case "listed":
            totalCount = properties.length;
            break;
          default:
            totalCount = listings.filter(
              (listing) => listing.userStatus === propertiesTab
            ).length;
            break;
        }
        break;
      case "requirements":
        totalCount = requirements.length;
        break;
      case "enquiries":
        totalCount = enquiries.length;
        break;
      default:
        break;
    }
    if (Math.min(batchSize + 10, totalCount) > batchSize) {
      isBatchSizePendingLock.current = true;
      setRenderingNewBatch(true);
      setBatchSize((prev) => Math.min(prev + 10, totalCount));
    }
  };

  // Use useCallback to prevent recreation of handler functions on each render
  const handlePropertyStatusChange = useCallback(
    async (id: string, status: string) => {
      const newStatus = status;
      try {
        const propertyRef = collection(db, "ACN123");
        const q = query(propertyRef, where("propertyId", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, { status: newStatus });
        }
        showSuccessToast("Inventory status updated Succesfully!");
      } catch (error) {
        showErrorToast("Error updating Inventory status!");
        console.error("Error updating status in Firestore:", error);
      }
    },
    []
  );

  const handleRequirementStatusChange = useCallback(
    async (id: string, status: string) => {
      const newStatus = status;

      try {
        const requirementsRef = collection(db, "requirements");
        const q = query(requirementsRef, where("requirementId", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, { status: newStatus });
        }
        showSuccessToast("Requirement status updated Succesfully!");
      } catch (error) {
        showErrorToast("Error updating Requirement status!");
        //console.error("Error updating status in Firestore:", error);
      }
    },
    []
  );

  const handlePropertyTabChange = (slug: string): void => {
    if (slug === propertiesTab) return;
    setPropertiesTab(slug);
  };

  const handleWhatsAppEnquiry = (): void => {
    if (!kam_number) return;
    Linking.openURL(`whatsapp://send?phone=${kam_number}`);
  };

  // Memoize the tab rendering to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
    if (activeTab === "inventories") {
      return (
        <>
          {propertiesTab === "listed" ? (
            properties.length === 0 || bufferring ? (
              <EmptyTabContent
                text="No inventory added yet."
                sub_text="Contact your KAM on Whatsapp to add an inventory."
                icon={<FontAwesome name="whatsapp" size={20} color="white" />}
                buttonText="Add Inventory"
                handleOnPress={handleWhatsAppEnquiry}
                loading={loading?.propertiesLoading || bufferring}
              />
            ) : (
              <View className="mx-3 mb-3">
                {properties.slice(0, batchSize).map((property, index) => {
                  return (
                    <PropertyCard
                      key={property.propertyId}
                      property={property}
                      onStatusChange={handlePropertyStatusChange}
                      index={index}
                      totalCount={Math.min(batchSize, properties.length)}
                      showEnquiriesSection={true}
                    />
                  );
                })}
              </View>
            )
          ) : listings.filter((listing) => listing.userStatus === propertiesTab)
              .length === 0 || bufferring ? (
            <EmptyTabContent
              text="No inventory added yet."
              sub_text="Contact your KAM on Whatsapp to add an inventory."
              icon={<FontAwesome name="whatsapp" size={20} color="white" />}
              buttonText="Add Inventory"
              handleOnPress={handleWhatsAppEnquiry}
              loading={loading?.listingLoading || bufferring}
            />
          ) : (
            <View className="mx-3 mb-3">
              {listings
                .filter((listing) => listing.userStatus === propertiesTab)
                .slice(0, batchSize)
                .map((listing, index) => {
                  return (
                    <PropertyCard
                      key={listing.propertyId}
                      property={listing as unknown as Property}
                      onStatusChange={handlePropertyStatusChange}
                      index={index}
                      totalCount={Math.min(batchSize, properties.length)}
                      showEnquiriesSection={false}
                    />
                  );
                })}
            </View>
          )}
        </>
      );
    } else if (activeTab === "requirements") {
      return (
        <>
          {requirements?.length === 0 || bufferring ? (
            <EmptyTabContent
              text="You haven't added any requirements"
              sub_text="Upload details of property type you need"
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="white"
                />
              }
              buttonText="Add Requirement"
              handleOnPress={() =>
                router.navigate("/(tabs)/UserRequirementForm")
              }
              loading={loading.requirementsLoading || bufferring}
            />
          ) : (
            <View className="mx-3 mb-3">
              {requirements.slice(0, batchSize).map((requirement, index) => {
                return (
                  <RequirementCard
                    key={requirement.requirementId}
                    requirement={requirement}
                    onStatusChange={handleRequirementStatusChange}
                    index={index}
                    totalCount={Math.min(batchSize, requirements.length)}
                  />
                );
              })}
            </View>
          )}
        </>
      );
    } else {
      return (
        <>
          {enquiries.length === 0 || bufferring ? (
            <EmptyTabContent
              text="No enquiries made yet."
              sub_text="Browse and enquire about available properties."
              icon={<FontAwesome6 name="house" size={20} color="white" />}
              buttonText="Explore Inventories"
              handleOnPress={() => router.push("/(tabs)/properties")}
              loading={loading.enquiriesLoading || bufferring}
            />
          ) : (
            <View className="mx-3 mb-3">
              {enquiries.slice(0, batchSize).map((enquiry, index) => {
                return (
                  <EnquiryCard
                    key={enquiry.id}
                    index={index}
                    enquiry={enquiry}
                  />
                );
              })}
            </View>
          )}
        </>
      );
    }
  }, [
    activeTab,
    properties,
    requirements,
    enquiries,
    bufferring,
    loading,
    batchSize,
    propertiesTab,
    handlePropertyStatusChange,
    handleRequirementStatusChange,
  ]);

  const tabData = [
    {
      key: "inventories",
      label: "My Inventories",
      icon: MyInverntoriesIcon,
      count: myProperties.length + myListing.length,
      loading: loading.propertiesLoading,
    },
    {
      key: "requirements",
      label: "My Requirements",
      icon: MyRequirementIcon,
      count: myRequirements.length,
      loading: loading.requirementsLoading,
    },
    {
      key: "enquiries",
      label: "My Enquiries",
      icon: MyEnquiriesIcon,
      count: myEnquiries.length,
      loading: loading.enquiriesLoading,
    },
  ];

  useEffect(() => {
    if (isBatchSizePendingLock.current) {
      setRenderingNewBatch(false);
      isBatchSizePendingLock.current = false;
    }
  }, [batchSize]);

  useEffect(() => {
    setMonthFilter("");
    setBatchSize(10);
    setBuffering(false);
    setRenderingNewBatch(false);
    isBatchSizePendingLock.current = false;
    switch (activeTab) {
      case "inventories":
        setProperties(myProperties);
        setListings(myListing);
        setMonthFilterOptions(
          generateListingAndPropertyMonths(myProperties, myListing)
        );
        break;
      case "requirements":
        setRequirements(myRequirements);
        setMonthFilterOptions(generateRequirementMonths(myRequirements));
        break;
      case "enquiries":
        setEnquiries(myEnquiries);
        setMonthFilterOptions(generateEnquiryMonths(myEnquiries));
        break;
      default:
        break;
    }
    initalLoad.current = false;
  }, [activeTab]);

  useEffect(() => {
    if (myProperties) {
      if (activeTab === "inventories") {
        setMonthFilterOptions(
          generateListingAndPropertyMonths(myListing, myProperties)
        );
        setProperties(filterPropertiesByMonth(myProperties, monthFilter));
      } else {
        setProperties(myProperties);
      }
    }
  }, [myProperties]);

  useEffect(() => {
    if (myListing) {
      if (activeTab === "inventories") {
        setMonthFilterOptions(
          generateListingAndPropertyMonths(myListing, myProperties)
        );
        setListings(filterListingsByMonth(myListing, monthFilter));
      } else {
        setListings(myListing);
      }
    }
  }, [myListing]);

  useEffect(() => {
    if (myRequirements) {
      if (activeTab === "requirements") {
        setMonthFilterOptions(generateRequirementMonths(myRequirements));
        setRequirements(filterRequirementsByMonth(myRequirements, monthFilter));
      } else {
        setRequirements(myRequirements);
      }
    }
  }, [myRequirements]);

  useEffect(() => {
    if (myEnquiries) {
      if (activeTab === "enquiries") {
        setMonthFilterOptions(generateEnquiryMonths(myEnquiries));
        setEnquiries(filterEnquiriesByMonth(myEnquiries, monthFilter));
      } else {
        setEnquiries(myEnquiries);
      }
    }
  }, [myEnquiries]);

  useEffect(() => {
    if (initalLoad.current) return;
    switch (activeTab) {
      case "inventories":
        setProperties(filterPropertiesByMonth(myProperties, monthFilter));
        setListings(filterListingsByMonth(myListing, monthFilter));
        break;
      case "requirements":
        setRequirements(filterRequirementsByMonth(myRequirements, monthFilter));
        break;
      case "enquiries":
        setEnquiries(filterEnquiriesByMonth(myEnquiries, monthFilter));
        break;
      default:
        break;
    }
    setBuffering(false);
  }, [monthFilter]);

  useEffect(() => {
    const listingCounts = listings.reduce(
      (acc: Record<string, number>, item) => {
        if (item?.userStatus)
          acc[item?.userStatus] = (acc[item?.userStatus] || 0) + 1;
        return acc;
      },
      {}
    );
    setPropertyCounts({ listed: properties?.length ?? 0, ...listingCounts });
  }, [properties, listings]);

  return (
    <StyledView className="flex bg-gray-50 h-full">
      <StatusBar style="auto" />

      {/* Carousel Tab Header */}
      <TabCarousel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setBuffering={setBuffering}
        initialLoad={initalLoad}
        tabData={tabData}
      />

      <MonthFilterDropdown
        options={monthFilterOptions}
        value={monthFilter}
        setValue={setMonthFilter}
        setBuffering={setBuffering}
        setBatchSize={setBatchSize}
      />

      {activeTab === "inventories" && (
        <PropertyTabCarousel
          activeSlug={propertiesTab}
          handleTabChange={handlePropertyTabChange}
          counts={propertyCounts}
        />
      )}

      {/* Content Area */}
      <StyledScrollView>
        {renderTabContent && (
          <StyledView onLayout={renderMore}>{renderTabContent}</StyledView>
        )}
        {renderingNewBatch && (
          <ActivityIndicator className="absolute bottom-0 w-full" />
        )}
      </StyledScrollView>
    </StyledView>
  );
}
