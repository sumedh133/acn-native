import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { setMonthlyCredit } from "@/store/slices/agentSlice";
import { useSelector } from "react-redux";

/**
 * Deducts 1 credit from the user's monthly credits.
 * @param {string} phoneNumber - The phone number of the agent.
 * @param {number} currentCredits - The current number of monthly credits.
 * @param {Function} dispatch - Redux dispatch function to update state.
 * @returns {Promise<void>} - Resolves when the operation completes.
 */
const deductMonthlyCredit = async (phoneNumber, currentCredits, dispatch, boosterCredits) => {
  if (!phoneNumber) {
    const errorMessage = "Phone number is required. Please try logging in again.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // const boosterCredits = useSelector((state) => state?.agent?.docData?.boosterCredits) || 0;

  if ((typeof currentCredits !== "number" || currentCredits <= 0) && boosterCredits <= 0) {
    const errorMessage = `Invalid credit value. Cannot deduct.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  let finalCredit = currentCredits;
  let finalBoosterCredit = boosterCredits;

  if (currentCredits <= 0) {
    // If no monthly credits left, deduct from booster credits
    finalBoosterCredit = Math.max(0, boosterCredits - 1);
  }
  else {
    // If monthly credits left, deduct from monthly credits
    finalCredit = Math.max(0, currentCredits - 1);
  }

  try {
    const agentsCollection = collection(db, "agents");
    const q = query(agentsCollection, where("phonenumber", "==", phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const errorMessage = `No agent found for phone number: ${phoneNumber}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const docRef = querySnapshot.docs[0].ref;

    await updateDoc(docRef, { monthlyCredits: finalCredit, boosterCredits: finalBoosterCredit });

    dispatch(setMonthlyCredit({ monthlyCredits: finalCredit, boosterCredits: finalBoosterCredit }));
  } catch (error) {
    console.error("Error deducting credits:", error.message || error);
    throw error;
  }
};

export default deductMonthlyCredit;
