import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { selectPropertyStateData } from '@/store/slices/propertySlice';
import { Enquiry } from '@/app/types';
import { db } from '@/app/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';

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
  orderDirection?: 'asc' | 'desc';
}

export const useEnquiries = (options: UseEnquiriesOptions = {}): UseEnquiriesReturn => {
  const {
    propertyId,
    orderByField = 'createdAt',
    orderDirection = 'desc'
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
  const property = useSelector(selectPropertyStateData);

  // Determine which property ID to use
  const targetPropertyId = propertyId || property?.propertyId;

  // Setup enquiries listener
  const setupEnquiriesListener = useCallback(() => {
    if (!cpId || !targetPropertyId) {
      setLoading(false);
      setError('Missing required data (cpId or propertyId)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const enquiriesRef = collection(db, 'acnEnquiries');

      // Build query constraints
      const constraints: QueryConstraint[] = [
        where('sellerCpId', '==', cpId),
        where('propertyId', '==', targetPropertyId),
        orderBy(orderByField, orderDirection)
      ];

      const q = query(enquiriesRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            console.log('No enquiries found');
            setEnquiries([]);
          } else {
            const enquiriesData: Enquiry[] = snapshot.docs.map(
              (doc) => ({
                enquiryId: doc.id,
                ...doc.data(),
              } as Enquiry)
            );

            console.log(`Fetched ${enquiriesData.length} enquiries`, enquiriesData);
            setEnquiries(enquiriesData);
          }
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Error in enquiries listener:', error);
          setError('Failed to load enquiries');
          setLoading(false);
          setRefreshing(false);
        }
      );

      // Save unsubscribe function
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up enquiries listener:', error);
      setError('Failed to setup real-time updates');
      setLoading(false);
      setRefreshing(false);
    }
  }, [cpId, targetPropertyId, orderByField, orderDirection]);

  // Setup listener on mount and dependency changes
  useEffect(() => {
    setupEnquiriesListener();

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [setupEnquiriesListener]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    // Re-establish the listener for manual refresh
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Small delay to show refresh animation
    setTimeout(() => {
      setupEnquiriesListener();
    }, 100);
  }, [setupEnquiriesListener]);

  // Calculate counts
  const enquiryCount = enquiries.length;
  const newEnquiryCount = enquiries.filter(enquiry => enquiry.isNew === true).length;

  return {
    enquiries,
    enquiryCount,
    newEnquiryCount,
    loading,
    refreshing,
    error,
    handleRefresh
  };
};