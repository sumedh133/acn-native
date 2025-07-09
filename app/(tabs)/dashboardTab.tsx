import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  getCountFromServer,
  documentId,
  orderBy,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import {
  Property,
  Requirement,
  Enquiry,
  EnquiryWithProperty,
  ListingProperty,
  IReview,
} from "../types";
import Dashboard from "../components/dashboard/Dashboard";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  handlePropertyStatusChange: (value: string, propertyId: string) => void;
}

interface UseEnquiriesResult {
  myEnquiries: EnquiryWithProperty[];
  loading: boolean;
  error: string | null;
  handleGiveReview: (enqId: string, reviews: IReview) => void;
}

interface UseListingResult {
  myListings: ListingProperty[];
  loading: boolean;
  error: string | null;
}

const useCpId = (): string | undefined => {
  const reduxCpId: string | undefined = useSelector(
    (state: RootState) => state.agent?.docData?.cpId
  );
  return reduxCpId;
};

const useEnquiries = (): UseEnquiriesResult => {
  const [myEnquiries, setMyEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cpId = useCpId();
  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  useEffect(() => {
    if (!cpId) {
      setError("No channel partner ID found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Create the query the same way as before
      const enquiriesQuery = query(
        collection(db, "acnEnquiries"),
        where("buyerCpId", "==", cpId)
      );

      // Set up real-time listener for enquiries
      const unsubscribe = onSnapshot(
        enquiriesQuery,
        async (snapshot) => {
          const enquiriesData: Enquiry[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Enquiry),
          }));

          // Track enquiries data load
          try {
            logEvent(analytics, "dashboard_enquiries_loaded", {
              event_category: "dashboard",
              event_label: "enquiries",
              enquiries_count: enquiriesData.length,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging enquiries load:", error);
          }

          const propertyIds = [
            ...new Set(enquiriesData.map((enquiry) => enquiry.propertyId)),
          ];
          let propertyDocs: Map<string, DocumentData> = new Map();

          for (let i = 0; i < propertyIds.length; i += 30) {
            const batch = propertyIds.slice(i, i + 30);
            const properties = await getDocs(
              query(
                collection(db, "acnProperties"),
                where(documentId(), "in", batch),
                orderBy("propertyId", "desc")
              )
            );
            properties.docs.map((item) => {
              propertyDocs.set(item.id, item.data());
            });
          }

          const enquiriesWithProperty = enquiriesData.map((enquiry) => {
            if (enquiry.propertyId && propertyDocs.has(enquiry.propertyId)) {
              return {
                ...enquiry,
                property: {
                  ...propertyDocs.get(enquiry.propertyId),
                } as Property,
              };
            }
            // Return the enquiry without property if propertyId doesn't exist or fetch fails
            return {
              ...enquiry,
              property: null,
            };
          });

          setMyEnquiries(enquiriesWithProperty);
          setLoading(false);
        },
        (err) => {
          setError(err.message || "Error fetching enquiries");
          console.error("Fetch error:", err);
          setLoading(false);

          // Track error
          try {
            logEvent(analytics, "dashboard_enquiries_error", {
              event_category: "dashboard",
              event_label: "error",
              error_type: "fetch_enquiries",
              error_message: err.message || "Error fetching enquiries",
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging enquiries error:", error);
          }
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Error fetching enquiries");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [cpId, userType]);

  const handleGiveReview = (enqId: string, reviews: IReview) => {
    try {
      logEvent(analytics, "enquiry_review_added", {
        event_category: "dashboard",
        event_label: "review",
        enquiry_id: enqId,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging review addition:", error);
    }

    setMyEnquiries((prev) =>
      prev.map((enq) => {
        return enq.enquiryId === enqId
          ? enq?.reviews?.length
            ? { ...enq, reviews: [...enq.reviews, reviews] }
            : { ...enq, reviews: [reviews] }
          : enq;
      })
    );
  };

  return { myEnquiries, loading, error, handleGiveReview };
};

const useProperties = (): UsePropertiesResult => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cpId = useCpId();
  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  useEffect(() => {
    if (!cpId) {
      setError("No channel partner ID found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Create query the same way as before
      const q = query(
        collection(db, "acnProperties"),
        where("cpId", "==", cpId)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const propertiesData: Property[] = querySnapshot.docs.map(
            (docSnap) =>
              ({
                ...docSnap.data(),
              } as Property)
          );

          // Track properties data load
          try {
            logEvent(analytics, "dashboard_properties_loaded", {
              event_category: "dashboard",
              event_label: "properties",
              properties_count: propertiesData.length,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging properties load:", error);
          }

          setProperties(propertiesData);
          setLoading(false);
        },
        (err) => {
          setError(err.message || "Error fetching properties");
          console.error("Fetch error:", err);
          setLoading(false);

          // Track error
          try {
            logEvent(analytics, "dashboard_properties_error", {
              event_category: "dashboard",
              event_label: "error",
              error_type: "fetch_properties",
              error_message: err.message || "Error fetching properties",
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging properties error:", error);
          }
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Error fetching properties");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [cpId, userType]);

  const handlePropertyStatusChange = (
    value: string,
    propertyId: string
  ): void => {
    try {
      // Track status change
      logEvent(analytics, "property_status_change", {
        event_category: "dashboard",
        event_label: "status",
        property_id: propertyId,
        new_status: value,
        user_type: userType,
      });

      const newStatus = value;
      setProperties((prev) =>
        prev.map((property) =>
          property.propertyId === propertyId
            ? { ...property, status: newStatus }
            : property
        )
      );
    } catch (err) {
      console.error("Error updating property status:", err);
      setError("Failed to update property status. Please try again.");
    }
  };

  return { properties, loading, error, handlePropertyStatusChange };
};

const useRequirements = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cpId = useCpId();
  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  useEffect(() => {
    if (!cpId) {
      setError("No channel partner ID found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "acnRequirements"),
        where("cpId", "==", cpId)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const requirementsData: Requirement[] = querySnapshot.docs.map(
            (doc) =>
              ({
                ...doc.data(),
              } as Requirement)
          );

          // Track requirements data load
          try {
            logEvent(analytics, "dashboard_requirements_loaded", {
              event_category: "dashboard",
              event_label: "requirements",
              requirements_count: requirementsData.length,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging requirements load:", error);
          }

          setRequirements(requirementsData);
          setLoading(false);
        },
        (err) => {
          setError(err.message || "Error fetching requirements");
          console.error("Fetch error:", err);
          setLoading(false);

          // Track error
          try {
            logEvent(analytics, "dashboard_requirements_error", {
              event_category: "dashboard",
              event_label: "error",
              error_type: "fetch_requirements",
              error_message: err.message || "Error fetching requirements",
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging requirements error:", error);
          }
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Error fetching requirements");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [cpId, userType]);

  const hanldeRequirementsStatusChange = (
    value: string,
    requirementsId: string
  ): void => {
    try {
      // Track status change
      logEvent(analytics, "requirement_status_change", {
        event_category: "dashboard",
        event_label: "status",
        requirement_id: requirementsId,
        new_status: value,
        user_type: userType,
      });

      const newStatus = value;
      setRequirements((prev) =>
        prev.map((requirements) =>
          requirements.requirementId === requirementsId
            ? { ...requirements, status: newStatus }
            : requirements
        )
      );
    } catch (err) {
      console.error("Error updating enquiry status:", err);
      setError("Failed to update enquiry status. Please try again.");
    }
  };

  return { requirements, loading, error, hanldeRequirementsStatusChange };
};

const useListings = (): UseListingResult => {
  const [myListings, setMyListings] = useState<ListingProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cpId = useCpId();
  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  useEffect(() => {
    if (!cpId) {
      setError("No channel partner ID found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "acnQCInventories"),
        where("cpId", "==", cpId),
        orderBy("propertyId", "desc")
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const listingData: ListingProperty[] = querySnapshot.docs.map(
            (doc) => {
              return {
                ...doc.data(),
              } as ListingProperty;
            }
          );

          // Track listings data load
          try {
            logEvent(analytics, "dashboard_listings_loaded", {
              event_category: "dashboard",
              event_label: "listings",
              listings_count: listingData.length,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging listings load:", error);
          }

          setMyListings(listingData);
          setLoading(false);
        },
        (err) => {
          setError(err.message || "Error fetching requirements");
          console.error("Fetch error:", err);
          setLoading(false);

          // Track error
          try {
            logEvent(analytics, "dashboard_listings_error", {
              event_category: "dashboard",
              event_label: "error",
              error_type: "fetch_listings",
              error_message: err.message || "Error fetching listings",
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging listings error:", error);
          }
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Error fetching requirements");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [cpId, userType]);

  return { myListings, loading, error };
};

export default function DashboardTab() {
  const {
    myEnquiries,
    loading: enquiriesLoading,
    error: enquiriesError,
    handleGiveReview: handleGiveReview,
  } = useEnquiries();
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    handlePropertyStatusChange,
  } = useProperties();
  const {
    requirements,
    loading: requirementsLoading,
    error: requirementsError,
    hanldeRequirementsStatusChange: hanldeRequirementsStatusChange,
  } = useRequirements();

  const {
    myListings,
    loading: listingLoading,
    error: listingError,
  } = useListings();

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  // Track dashboard page view
  useEffect(() => {
    try {
      logEvent(analytics, "dashboard_page_view", {
        event_category: "dashboard",
        event_label: "page_view",
        user_type: userType,
        has_enquiries: myEnquiries.length > 0,
        has_properties: properties.length > 0,
        has_requirements: requirements.length > 0,
        has_listings: myListings.length > 0,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [
    userType,
    myEnquiries.length,
    properties.length,
    requirements.length,
    myListings.length,
  ]);

  if (!isConnectedToInternet) return <Offline />;

  return (
    <View style={{ flex: 1 }}>
      <Dashboard
        myEnquiries={myEnquiries}
        myProperties={properties}
        myRequirements={requirements}
        myListing={myListings}
        loading={{
          enquiriesLoading: enquiriesLoading,
          propertiesLoading: propertiesLoading,
          requirementsLoading: requirementsLoading,
          listingLoading: listingLoading,
        }}
      />
    </View>
  );
}
