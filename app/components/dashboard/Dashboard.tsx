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
  doc,
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
import PropertyTabCarousel from "./PropertyTabCarousel";
import PropertyCard from "./PropertyCard";
import RequirementCard from "./RequirementCard";
import PlusIconWithCircle from "@/assets/icons/svg/Common/PlusIconWithCircle";
import PropertiesIcon from "@/assets/icons/svg/Footer/PropertiesIcon";
import AddRequirementsIcon from "@/assets/icons/svg/Footer/AddRequirementsIcon";
import AddInventoryIcon from "@/assets/icons/svg/Footer/AddInventoryIcon";
import { propertyUserStatus } from "@/app/constants/PropertyConstants";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import { RouteProp, useRoute } from "@react-navigation/native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

type DashboardRouteProp = RouteProp<{
  Dashboard: {
    tab?: string;
  };
}>;

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
  const route = useRoute<DashboardRouteProp>();
  const tab = route.params?.tab || "inventories";

  const [activeTab, setActiveTab] = useState(tab || "inventories");
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
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

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
              (listing) => listing.status === propertiesTab
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

  // Track initial dashboard view and tab parameter
  useEffect(() => {
    try {
      logEvent(analytics, "view_dashboard", {
        event_category: "dashboard",
        event_label: "page_view",
        initial_tab: tab,
        user_type: userType,
        inventory_count: myProperties.length + myListing.length,
        requirements_count: myRequirements.length,
        enquiries_count: myEnquiries.length,
      });
    } catch (error) {
      console.error("Error logging dashboard view:", error);
    }
  }, []);

  // Track month filter changes
  useEffect(() => {
    if (!initalLoad.current && monthFilter) {
      try {
        logEvent(analytics, "dashboard_filter_change", {
          event_category: "dashboard",
          event_label: "filter",
          filter_value: monthFilter,
          active_tab: activeTab,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging filter change:", error);
      }
    }
  }, [monthFilter]);

  // Track tab changes
  useEffect(() => {
    if (!initalLoad.current) {
      try {
        logEvent(analytics, "dashboard_tab_change", {
          event_category: "dashboard",
          event_label: "navigation",
          tab: activeTab,
          user_type: userType,
          filtered_items_count:
            activeTab === "inventories"
              ? properties.length + listings.length
              : activeTab === "requirements"
              ? requirements.length
              : enquiries.length,
        });
      } catch (error) {
        console.error("Error logging tab change:", error);
      }
    }
  }, [activeTab]);

  // Enhanced property status change handler with analytics
  const handlePropertyStatusChange = useCallback(
    async (id: string, status: string) => {
      const newStatus = status;
      try {
        await updateDoc(doc(db, "acnProperties", id), {
          status: newStatus,
          ageOfStatus: 0,
          dateOfStatusLastChecked: getUnixDateTime(),
        });

        // Track successful status change
        logEvent(analytics, "inventory_status_update", {
          event_category: "dashboard",
          event_label: "status_change",
          property_id: id,
          new_status: newStatus,
          user_type: userType,
        });

        showSuccessToast("Inventory status updated Successfully!");
      } catch (error) {
        // Track failed status change
        logEvent(analytics, "inventory_status_update_error", {
          event_category: "dashboard",
          event_label: "error",
          property_id: id,
          attempted_status: newStatus,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          user_type: userType,
        });

        showErrorToast("Error updating Inventory status!");
        console.error("Error updating status in Firestore:", error);
      }
    },
    [userType]
  );

  // Enhanced requirement status change handler with analytics
  const handleRequirementStatusChange = useCallback(
    async (id: string, status: string) => {
      const newStatus = status;

      try {
        const requirementsRef = collection(db, "acnRequirements");
        const q = query(requirementsRef, where("requirementId", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, { requirementStatus: newStatus });

          // Track successful status change
          logEvent(analytics, "requirement_status_update", {
            event_category: "dashboard",
            event_label: "status_change",
            requirement_id: id,
            new_status: newStatus,
            user_type: userType,
          });
        }
        showSuccessToast("Requirement status updated Successfully!");
      } catch (error) {
        // Track failed status change
        logEvent(analytics, "requirement_status_update_error", {
          event_category: "dashboard",
          event_label: "error",
          requirement_id: id,
          attempted_status: newStatus,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          user_type: userType,
        });

        showErrorToast("Error updating Requirement status!");
      }
    },
    [userType]
  );

  // Track property tab changes
  const handlePropertyTabChange = (slug: string): void => {
    if (slug === propertiesTab) return;
    try {
      logEvent(analytics, "inventory_tab_change", {
        event_category: "dashboard",
        event_label: "navigation",
        previous_tab: propertiesTab,
        new_tab: slug,
        items_count: propertyCounts[slug] || 0,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging property tab change:", error);
    }
    setPropertiesTab(slug);
  };

  // Track infinite scroll
  useEffect(() => {
    if (renderingNewBatch) {
      try {
        logEvent(analytics, "dashboard_load_more", {
          event_category: "dashboard",
          event_label: "pagination",
          active_tab: activeTab,
          properties_tab: propertiesTab,
          batch_size: batchSize,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging load more:", error);
      }
    }
  }, [renderingNewBatch]);

  const openAddInventory = (): void => {
    router.push("/(pages)/Drafts");
  };

  // Memoize the tab rendering to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
    if (activeTab === "inventories") {
      return (
        <>
          {propertiesTab === "listed" ? (
            // Listed tab logic
            properties.length === 0 || bufferring ? (
              <EmptyTabContent
                text="No Inventory"
                sub_text={propertyUserStatus?.[propertiesTab]?.emptySubText}
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
                      isListing={false}
                    />
                  );
                })}
              </View>
            )
          ) : // Other tabs logic - check filtered listings instead of myProperties
          listings.filter((listing) => listing.status === propertiesTab)
              .length === 0 || bufferring ? (
            <EmptyTabContent
              text="No Inventory"
              sub_text={propertyUserStatus?.[propertiesTab]?.emptySubText}
              loading={loading?.listingLoading || bufferring}
            />
          ) : (
            <View className="mx-3 mb-3">
              {listings
                .filter((listing) => listing.status === propertiesTab)
                .slice(0, batchSize)
                .map((listing, index) => {
                  return (
                    <PropertyCard
                      key={listing.propertyId}
                      property={listing}
                      onStatusChange={() => {}}
                      index={index}
                      totalCount={Math.min(
                        batchSize,
                        listings.filter(
                          (listing) => listing.status === propertiesTab
                        ).length
                      )}
                      isListing={true}
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
              sub_text="Upload details of property type you need."
              icon={<AddRequirementsIcon width={24} height={24} />}
              buttonText="Add Requirement"
              handleOnPress={() => router.push("/(tabs)/UserRequirementForm")}
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
              icon={
                <PropertiesIcon width={24} height={24} fillColor="#FFFFFF" />
              }
              buttonText="Explore Inventories"
              handleOnPress={() => {
                router.dismissAll();
                router.push("/(tabs)/properties");
              }}
              loading={loading.enquiriesLoading || bufferring}
            />
          ) : (
            <View className="mx-3 mb-3">
              {enquiries.slice(0, batchSize).map((enquiry, index) => {
                return (
                  <EnquiryCard
                    key={enquiry.enquiryId}
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
        if (item?.status) acc[item?.status] = (acc[item?.status] || 0) + 1;
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
          loading={loading.listingLoading}
        />
      )}

      {/* Content Area */}
      <StyledScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {renderTabContent && (
          <StyledView onLayout={renderMore} style={{ flex: 1 }}>
            {renderTabContent}
          </StyledView>
        )}
        {renderingNewBatch && (
          <ActivityIndicator
            className="absolute bottom-0 w-full"
            color="#153E3B"
          />
        )}
      </StyledScrollView>
    </StyledView>
  );
}
