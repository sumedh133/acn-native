import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase"; // your Firebase config
import { Property } from "../../types";

// Firestore Collections
const ADMIN_COLLECTION = "acn-admin";
const INVENTORY_COLLECTION = "acnQCInventories";

/**
 * Generate a new unique Property ID using `acn-admin/lastQcId`.
 */
export const generatePropertyId = async (): Promise<string> => {
  const ref = doc(db, ADMIN_COLLECTION, "lastQcId");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("lastQcId doc not found in acn-admin");
  }

  const { count, label, prefix } = snapshot.data() as {
    count: number;
    label: string;
    prefix: string;
  };

  const newCount = count + 1;

  // Format count with leading zeros (e.g., 001, 023, 145)
  const paddedCount = newCount.toString().padStart(3, "0");

  const propertyId = `${label}${prefix}${paddedCount}`;

  // Update counter in admin doc
  await updateDoc(ref, { count: newCount });

  return propertyId;
};

/**
 * Create a new property in `acnQCInventories`.
 */
export const createProperty = async (property: Omit<Property, "propertyId">) => {
  const propertyId = await generatePropertyId();

  const ref = doc(collection(db, INVENTORY_COLLECTION), propertyId);

  const newProperty: Property = {
    ...property,
    propertyId,
    added: Date.now()/1000,
    lastModified: Date.now()/1000,
    status: property.status || "active",
  };

  await setDoc(ref, newProperty);

  return newProperty;
};

/**
 * Fetch a property by ID.
 */
export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);
  const snapshot = await getDoc(ref);

  return snapshot.exists() ? (snapshot.data() as Property) : null;
};

/**
 * Fetch all properties (optionally filtered).
 */
export const getAllProperties = async (filters?: {
  listingType?: "resale" | "rental";
  propertyType?: "residential" | "commercial";
  status?: string;
}) => {
  let q = collection(db, INVENTORY_COLLECTION);

  // Apply filters dynamically
  const conditions: any[] = [];
  if (filters?.listingType) conditions.push(where("listingType", "==", filters.listingType));
  if (filters?.propertyType) conditions.push(where("propertyType", "==", filters.propertyType));
  if (filters?.status) conditions.push(where("status", "==", filters.status));

  let queryRef = conditions.length > 0 ? query(q, ...conditions) : query(q);

  const snapshot = await getDocs(queryRef);

  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Update a property by ID.
 */
export const updateProperty = async (propertyId: string, updates: Partial<Property>) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);

  await updateDoc(ref, {
    ...updates,
    lastModified:Date.now()/1000,
  });
};

/**
 * Update a whole property object by property ID.
 */
export const updateWholeProperty = async (propertyId: string, updates: Partial<Property>) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);

  await setDoc(ref, {
    ...updates,
    lastModified: Date.now()/1000,
  });
};

/**
 * Delete a property by ID.
 */
export const deleteProperty = async (propertyId: string) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);
  await deleteDoc(ref);
};

/**
 * Assign a KAM to a property.
 */
export const assignKamToProperty = async (
  propertyId: string,
  kamId: string,
  kamName: string
) => {
  await updateProperty(propertyId, { kamId, kamName, kamStatus: "assigned" });
};

/**
 * Change QC status of a property.
 */
export const updateQcStatus = async (
  propertyId: string,
  kamStatus: string,
  dataStatus: string,
  stage: string
) => {
  await updateProperty(propertyId, { kamStatus, dataStatus, stage });
};

/**
 * Search properties by agent phone number or property name.
 */
export const searchProperties = async (field: "agentPhoneNumber" | "propertyName", value: string) => {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    where(field, "==", value)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Get recent properties (sorted by added date).
 */
export const getRecentProperties = async (limitCount = 10) => {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    orderBy("added", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};