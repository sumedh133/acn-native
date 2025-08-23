import React, {
  useState,
  useEffect,
} from "react";
import {
  View,
  StyleSheet,
  Keyboard,
} from "react-native";
import algoliasearch from "algoliasearch";
import {
  InstantSearch,
  Configure,
  useInstantSearch,
} from "react-instantsearch";
import PropertyFilters from "../components/PropertyFilters";
import { Landmark } from "../types";
import MoreFilters from "../components/MoreFilters";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { MobileHits } from "../components/property/MobileHits";

// Initialize Algolia search client
const searchClient = algoliasearch(
  "CGRV5YKD8Y",
  "6790dabe95e962dcb64be2a64106c5b2"
);

const indexName = "acnTest";

// SearchRefresher component that accesses the refresh method
function SearchRefresher({
  onRefreshAvailable,
}: {
  onRefreshAvailable: (refresh: Function) => void;
}) {
  const { refresh } = useInstantSearch();

  useEffect(() => {
    if (refresh && onRefreshAvailable) {
      onRefreshAvailable(refresh);
    }
  }, [refresh, onRefreshAvailable]);

  // This component doesn't render anything visible
  return null;
}

export default function PropertiesScreen() {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "properties_page_view", {
        event_category: "page_view",
        event_label: "properties",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [userType]);

  const handleToggleMoreFilters = () => {
    try {
      logEvent(analytics, "property_filters_toggle", {
        event_category: "interaction",
        event_label: "filters",
        filter_state: !isMoreFiltersModalOpen ? "open" : "close",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging filter toggle:", error);
    }
    setIsMoreFiltersModalOpen((prev) => !prev);
    Keyboard.dismiss();
  };

  // Track landmark selection
  useEffect(() => {
    if (selectedLandmark) {
      try {
        logEvent(analytics, "property_landmark_selected", {
          event_category: "search",
          event_label: "landmark",
          landmark_name: selectedLandmark.name,
          landmark_radius: selectedLandmark.radius,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging landmark selection:", error);
      }
    }
  }, [selectedLandmark, userType]);

  useDoubleBackPressExit();

  if (!isConnectedToInternet) {
    try {
      logEvent(analytics, "properties_offline_view", {
        event_category: "error",
        event_label: "offline",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging offline state:", error);
    }
    return <Offline />;
  }

  return (
    <View className="flex-1 bg-[#F5F6F7]">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <Configure
          analytics={true}
          hitsPerPage={20}
          // filters={`status:'available'`}
          aroundLatLng={
            selectedLandmark?.lat && selectedLandmark?.lng
              ? `${selectedLandmark.lat},${selectedLandmark.lng}`
              : undefined
          }
          aroundRadius={selectedLandmark?.radius || undefined}
        />
        <View className="flex-1 relative">
          <View>
            <PropertyFilters
              handleToggleMoreFilters={handleToggleMoreFilters}
              selectedLandmark={selectedLandmark}
              setSelectedLandmark={setSelectedLandmark}
            />
          </View>
          <View className="w-full flex-1">
            <MobileHits />
          </View>
        </View>
        <MoreFilters
          isOpen={isMoreFiltersModalOpen}
          setIsOpen={setIsMoreFiltersModalOpen}
          handleToggle={handleToggleMoreFilters}
          isMobile={true}
          selectedLandmark={selectedLandmark}
          setSelectedLandmark={setSelectedLandmark}
        />
      </InstantSearch>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    // fontFamily: 'Montserrat_400Regular',
    color: "#6B7280",
    fontSize: 16,
  },
  title: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontFamily: "Montserrat_500Medium",
    color: "#3B82F6",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  detailText: {
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    fontSize: 14,
  },
});
