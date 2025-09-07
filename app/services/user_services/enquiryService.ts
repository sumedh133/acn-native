// services/enquiryService.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  limit, QueryConstraint,
   WhereFilterOp 
} from "firebase/firestore";
import { db } from "../../config/firebase"; // your firebase config
import { Enquiry, EnquiryWithProperty, IReview } from "../../types";
import { getPropertyById } from "../property_services/propertyService"; // reuse property service

// References
const adminDocRef = doc(db, "acn-admin", "lastEnqId");
const enquiriesCollection = collection(db, "acnEnquiries");

/**
 * Generate new enquiryId using acn-admin/lastEnqId
 */
export const generateEnquiryId = async (): Promise<string> => {
  const adminDoc = await getDoc(adminDocRef);

  if (!adminDoc.exists()) {
    throw new Error("Admin document (lastEnqId) not found");
  }

  const { count, label, prefix } = adminDoc.data() as {
    count: number;
    label: string;
    prefix: string;
  };

  const nextCount = count + 1;
  const paddedCount = String(nextCount).padStart(3, "0");
  const enquiryId = `${label}${prefix}${paddedCount}`;

  await updateDoc(adminDocRef, {
    count: increment(1),
    lastGeneratedId: enquiryId,
    updatedAt: Date.now(),
  });

  return enquiryId;
};

/**
 * Create new enquiry
 */
export const createEnquiry = async (
  enquiryData: Omit<Enquiry, "enquiryId" | "added" | "lastModified" | "reviews">
): Promise<string> => {
  const enquiryId = await generateEnquiryId();

  const newEnquiry: Enquiry = {
    ...enquiryData,
    enquiryId,
    added: Date.now(),
    lastModified: Date.now(),
    reviews: [],
  };

  await setDoc(doc(db, "acnEnquiries", enquiryId), newEnquiry);

  return enquiryId;
};

/**
 * Get enquiry by ID
 */
export const getEnquiry = async (
  enquiryId: string,
  withProperty: boolean = false
): Promise<Enquiry | EnquiryWithProperty | null> => {
  const snap = await getDoc(doc(db, "acnEnquiries", enquiryId));
  if (!snap.exists()) return null;

  const enquiry = snap.data() as Enquiry;

  if (withProperty) {
    const property = await getPropertyById(enquiry.propertyId);
    return { ...enquiry, property };
  }

  return enquiry;
};

/**
 * Update enquiry
 */
export const updateEnquiry = async (
  enquiryId: string,
  updates: Partial<Enquiry>
): Promise<void> => {
  await updateDoc(doc(db, "acnEnquiries", enquiryId), {
    ...updates,
    lastModified: Date.now(),
  });
};

/**
 * Delete enquiry
 */
export const deleteEnquiry = async (enquiryId: string): Promise<void> => {
  await deleteDoc(doc(db, "acnEnquiries", enquiryId));
};

/**
 * Add review to an enquiry
 */
export const addEnquiryReview = async (
  enquiryId: string,
  review: Omit<IReview, "timestamp">
): Promise<void> => {
  const snap = await getDoc(doc(db, "acnEnquiries", enquiryId));
  if (!snap.exists()) throw new Error("Enquiry not found");

  const enquiry = snap.data() as Enquiry;

  const updatedReviews: IReview[] = [
    ...enquiry.reviews,
    { ...review, timestamp: Date.now() },
  ];

  await updateDoc(doc(db, "acnEnquiries", enquiryId), {
    reviews: updatedReviews,
    lastModified: Date.now(),
  });
};

/**
 * Get all enquiries for a buyerCpId
 */
export const getEnquiriesByBuyer = async (
  buyerCpId: string
): Promise<Enquiry[]> => {
  const q = query(enquiriesCollection, where("buyerCpId", "==", buyerCpId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data() as Enquiry);
};

/**
 * Get all enquiries for a sellerCpId
 */
export const getEnquiriesBySeller = async (
  sellerCpId: string
): Promise<Enquiry[]> => {
  const q = query(enquiriesCollection, where("sellerCpId", "==", sellerCpId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data() as Enquiry);
};

/**
 * Get enquiries by status
 */
export const getEnquiriesByStatus = async (
  status: Enquiry["status"]
): Promise<Enquiry[]> => {
  const q = query(
    enquiriesCollection,
    where("status", "==", status),
    orderBy("added", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data() as Enquiry);
};

/**
 * Get enquiries for a property
 */

export const getEnquiriesByPropertyID = async (
  propertyId: Enquiry["propertyId"]
): Promise<number> => {
  const q = query(enquiriesCollection, where("propertyId", "==", propertyId));
  const snap = await getDocs(q);
  return snap.docs.length;
};

/**
 * Fetch enquiries based on dynamic conditions
 * @param conditions - Array of { field, operator, value }
 * @param options - Optional ordering and limit
 */
export const getEnquiriesWithConditions = async (
  conditions: { field: string; operator: WhereFilterOp; value: any }[],
  options?: { orderByField?: string; orderDirection?: "asc" | "desc"; limitCount?: number }
): Promise<Enquiry[]> => {
  let constraints: QueryConstraint[] = [];

  // Add where conditions
  conditions.forEach((cond) => {
    constraints.push(where(cond.field, cond.operator, cond.value));
  });

  // Add optional orderBy
  if (options?.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
  }

  // Add optional limit
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const q = query(enquiriesCollection, ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data() as Enquiry);
};


