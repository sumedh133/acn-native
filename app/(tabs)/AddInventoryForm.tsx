import React, { useState } from "react";
import { PropertyFormScreen } from "@/app/components/addInventoryForm/PropertyFormScreen";
import { Property } from "../types";
import {
  createProperty,
  updateProperty,
} from "../services/property_services/propertyService";
import { convertMonthYearToUnix } from "../helpers/format/format";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { MediaUploadQueue as MediaUploadQueueClass } from "@/app/services/media_services/MediaUploadQueue";
import type { UploadResult } from "@/app/services/media_services/mediaService";
import type { MediaObj } from "@/app/types/MediaTypes";
import { trackEvent } from "../services/logAnalyticsService";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

const AddInventoryForm = () => {
  const { item, formType } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [editData, _] = useState<Partial<UIProperty> | undefined>(() => {
    if (item) {
      try {
        return JSON.parse(item as string) as Partial<UIProperty>;
      } catch (error) {
        console.error("Invalid JSON in item:", item);
        return undefined;
      }
    }
    return undefined;
  });

  const normalizePropertyBeforeSubmit = (
    data: Partial<UIProperty>
  ): Partial<Property> => {
    const temp: Partial<UIProperty> = { ...data };

    const normalized: Partial<Property> = {
      ...temp,
      handOverDate:
        typeof temp.handOverDate === "string"
          ? convertMonthYearToUnix(temp.handOverDate) ?? undefined
          : temp.handOverDate,
    };

    return normalized;
  };

  const handleFormComplete = async (data: Partial<UIProperty>) => {
    try {
      setIsSubmitting(true);
      // Normalize and clean data
      const normalizedData = normalizePropertyBeforeSubmit(data);
      const cleanData = JSON.parse(
        JSON.stringify(normalizedData, (_, value) =>
          value === undefined ? null : value
        )
      );

      console.log("Normalized & Cleaned Data:", cleanData);
      const rawMedia = (data as any)?._rawMedia as
        | { photos: MediaObj[]; videos: MediaObj[]; documents: MediaObj[] }
        | undefined;
      let finalPropId = cleanData.propertyId as string | undefined;

      // Update for underReviewEdit
      if (formType === "underReviewEdit") {
        await updateProperty(cleanData.propertyId, cleanData, "qc", true);
        finalPropId = cleanData.propertyId;
        console.log("Property updated in QC review:", cleanData);
        showSuccessToast(
          `Property updated successfully and sent for QC review!`
        );
        setIsSubmitting(false);
        router.back();
        // Fire background upload if raw media present
        if (rawMedia && finalPropId) {
          const queue = new MediaUploadQueueClass({
            propId: finalPropId,
            userId: (cleanData as any)?.cpId || "unknown",
            onComplete: async (results: UploadResult[]) => {
              const uploaded = {
                photos: [] as string[],
                videos: [] as string[],
                documents: [] as string[],
              };
              results.forEach((r) => {
                if (!r.success || !r.uploadUrl) return;
                const id = r.fileId || "";
                if (id.includes("-photo-")) uploaded.photos.push(r.uploadUrl);
                else if (id.includes("-video-"))
                  uploaded.videos.push(r.uploadUrl);
                else if (id.includes("-document-"))
                  uploaded.documents.push(r.uploadUrl);
              });
              try {
                await updateProperty(
                  finalPropId!,
                  { media: uploaded } as any,
                  "qc",
                  true
                );
              } catch {}
            },
          });
          queue.uploadMedia(
            rawMedia.photos,
            rawMedia.videos,
            rawMedia.documents
          );
        }
        return;
      }

      // Update for verifiedEdit
      if (formType === "verifiedEdit") {
        await updateProperty(cleanData.propertyId, cleanData, "verified", true);
        finalPropId = cleanData.propertyId;
        console.log("Property updated in Verified stage:", cleanData);
        showSuccessToast(`Property updated successfully in verified stage!`);
        setIsSubmitting(false);
        router.back();
        if (rawMedia && finalPropId) {
          const queue = new MediaUploadQueueClass({
            propId: finalPropId,
            userId: (cleanData as any)?.cpId || "unknown",
            onComplete: async (results: UploadResult[]) => {
              const uploaded = {
                photos: [] as string[],
                videos: [] as string[],
                documents: [] as string[],
              };
              results.forEach((r) => {
                if (!r.success || !r.uploadUrl) return;
                const id = r.fileId || "";
                if (id.includes("-photo-")) uploaded.photos.push(r.uploadUrl);
                else if (id.includes("-video-"))
                  uploaded.videos.push(r.uploadUrl);
                else if (id.includes("-document-"))
                  uploaded.documents.push(r.uploadUrl);
              });
              try {
                await updateProperty(
                  finalPropId!,
                  { media: uploaded } as any,
                  "verified",
                  true
                );
              } catch {}
            },
          });
          queue.uploadMedia(
            rawMedia.photos,
            rawMedia.videos,
            rawMedia.documents
          );
        }
        return;
      }

      // If property is draft → move to pending
      if (cleanData.status === "draft") {
        await updateProperty(
          cleanData.propertyId,
          { ...cleanData, status: "draft" },
          "qc"
        );
        finalPropId = cleanData.propertyId;

        console.log("Draft property moved to pending QC:", cleanData);
        showSuccessToast(`New property created and sent for verification!`);
      } else {
        // New property creation
        const newProperty = await createProperty(
          cleanData as Omit<Property, "propertyId">,
          "qc"
        );
        finalPropId = (newProperty as any)?.propertyId || cleanData.propertyId;
        console.log("New property created:", {
          ...cleanData,
          propertyId: finalPropId,
        });
        showSuccessToast(`New property created and sent for verification!`);
      }
      fetch(
        `https://notification-server-acn.onrender.com/addinventory/${finalPropId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      try {

        trackEvent("add_inventory_submit").catch((error) => {
          console.error(`Error logging event: ${error}`);
        });
      } catch (error) {
        console.error(`Unexpected error: ${error}`);
      }

      // Start background TUS upload using the real propertyId, if raw media present
      if (rawMedia && finalPropId) {
        const queue = new MediaUploadQueueClass({
          propId: finalPropId,
          userId: (cleanData as any)?.cpId || "unknown",
          onComplete: async (results: UploadResult[]) => {
            const uploaded = {
              photos: [] as string[],
              videos: [] as string[],
              documents: [] as string[],
            };
            results.forEach((r) => {
              if (!r.success || !r.uploadUrl) return;
              const id = r.fileId || "";
              if (id.includes("-photo-")) uploaded.photos.push(r.uploadUrl);
              else if (id.includes("-video-"))
                uploaded.videos.push(r.uploadUrl);
              else if (id.includes("-document-"))
                uploaded.documents.push(r.uploadUrl);
            });
            try {
              await updateProperty(
                finalPropId!,
                { media: uploaded } as any,
                "qc",
                true
              );
            } catch {}
          },
        });
        queue.uploadMedia(rawMedia.photos, rawMedia.videos, rawMedia.documents);
      }
      setIsSubmitting(false);
      // Navigation after success for create or draft update
      router.dismissAll();
      router.replace("/(tabs)/dashboardTab");
    } catch (error: any) {
      console.error("Error while saving/updating property:", error);

      if (editData) {
        showErrorToast(
          `Something went wrong while updating the property. Please try again.`
        );
      } else {
        try {

          trackEvent("inventory_addition_error").catch((error) => {
            console.error(`Error logging event: ${error}`);
          });
        } catch (error) {
          console.error(`Unexpected error: ${error}`);
        }
        showErrorToast(
          `Something went wrong while saving the property. Please try again.`
        );
      }
    }
  };

  return (
    <PropertyFormScreen
      initialData={editData}
      onComplete={handleFormComplete}
      isEdit={
        formType == "underReviewEdit" || formType == "verifiedEdit"
          ? true
          : false
      }
      isSubmitting={isSubmitting}
    />
  );
};
export default AddInventoryForm;
