import { handleIdGeneration } from "./nextId";
import { getUnixDateTime } from "./getUnixDateTime";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { Requirement } from "../types";

const generateNextReqId = async () => {
  try {
    const type = "lastReqId"; // Replace with "lastCpId" or others as needed
    const { nextId } = await handleIdGeneration(type);
    return nextId;
  } catch (error) {
    console.error("Error generating IDs:", error);
    return null;
  }
};

export default async function submitRequirement(
  userRequirement: Omit<Requirement, "requirementId">,
  cpId: string
) {
  try {
    const timestamp = getUnixDateTime();
    const nextReqId = await generateNextReqId();
    if (!nextReqId) {
      throw new Error(
        "Failed to generate the Requirement ID. Please try again later."
      );
    }

    const formData = {
      added: timestamp,
      lastModified: timestamp,
      cpId: cpId,
      agentPhoneNumber: userRequirement.agentPhoneNumber,
      agentName: userRequirement.agentName,
      kamId: userRequirement.kamId,
      kamName: userRequirement.kamName,
      kamPhoneNumber: userRequirement.kamPhoneNumber,
      area: userRequirement.area || 0,
      assetType: userRequirement.assetType,
      budget: {
        from: userRequirement.budget.from || "", // Convert budgetFrom to a number
        to: userRequirement.budget.to || "", // Convert budgetTo to a number
      },
      configuration: userRequirement.configuration || "",
      marketValue: userRequirement.marketValue,
      propertyName: userRequirement.propertyName,
      requirementDetails: userRequirement.requirementDetails,
      requirementId: nextReqId,
      requirementStatus: userRequirement.requirementStatus,
      internalStatus: userRequirement.internalStatus,
    };

    const docRef = doc(db, "acnRequirements", nextReqId);
    const result = await setDoc(docRef, formData);
    console.log(formData, "formData");
    await fetch(
      `https://acn-notification-server.onrender.com/notification/add-requirement`,
      {
        body: JSON.stringify({
          formData,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, requirementId: nextReqId };
  } catch (error) {
    console.error("Error submitting requirement:", error);
    throw error;
  }
}
