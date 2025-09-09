import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectPropertyStateData } from "@/store/slices/propertySlice";
import { Enquiry } from "@/app/types";
import { db } from "@/app/config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";

interface UseEnquiriesReturn {
  enquiries: Enquiry[];
  enquiryCount: number;
  newEnquiryCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  handleRefresh: () => Promise<void>;
}

interface UseEnquiriesOptions {
  propertyId?: string;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
}

export const useEnquiries = (
  options: UseEnquiriesOptions = {}
): UseEnquiriesReturn => {
  const {
    propertyId,
    orderByField = "createdAt",
    orderDirection = "desc",
  } = options;

  // State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Selectors
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId);

  // ✅ Setup enquiries listener
  const setupEnquiriesListener = useCallback(() => {
    if (!cpId) {
      setLoading(false);
      setError("Missing required data (cpId)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const enquiriesRef = collection(db, "acnEnquiries");

      // ✅ Build query constraints dynamically
      const constraints: QueryConstraint[] = [
        where("sellerCpId", "==", cpId),
        orderBy("added", "desc"),
      ];

      if (propertyId) {
        constraints.push(where("propertyId", "==", propertyId));
      }

      const q = query(enquiriesRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            setEnquiries([]);
          } else {
            const enquiriesData: Enquiry[] = snapshot.docs.map(
              (doc) =>
                ({
                  enquiryId: doc.id,
                  ...doc.data(),
                } as Enquiry)
            );

            setEnquiries(enquiriesData);
          }
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error("Error in enquiries listener:", error);
          setError("Failed to load enquiries");
          setLoading(false);
          setRefreshing(false);
        }
      );

      // Save unsubscribe function
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error setting up enquiries listener:", error);
      setError("Failed to setup real-time updates");
      setLoading(false);
      setRefreshing(false);
    }
  }, [cpId, propertyId, orderByField, orderDirection]);

  // ✅ Setup listener on mount and dependency changes
  useEffect(() => {
    setupEnquiriesListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [setupEnquiriesListener]);

  // ✅ Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setTimeout(() => {
      setupEnquiriesListener();
    }, 100);
  }, [setupEnquiriesListener]);

  // ✅ Calculate counts
  const enquiryCount = enquiries.length;
  const newEnquiryCount = enquiries.filter(
    (enquiry) => enquiry.isNew === true
  ).length;

  return {
    enquiries,
    enquiryCount,
    newEnquiryCount,
    loading,
    refreshing,
    error,
    handleRefresh,
  };
};
