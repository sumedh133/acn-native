import React, { useState, useEffect } from "react";
import BusinessDetailsModal from "../components/Billing/BusinessDetailsModal";
import BillingContainer from "../components/Billing/BillingContainer";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import Offline from "../components/Offline";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

export default function Billings() {
  const [showModal, setShowModal] = useState(false);
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet,
  );

  const agentData = useSelector((state: RootState) => state.agent.docData);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "billings_page_view", {
        event_category: "billing",
        event_label: "page_view",
        user_type: agentData?.userType || "free",
        has_business_details: !!(agentData?.businessName && agentData?.gstNo)
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [agentData]);

  const openBusinessModal = () => {
    try {
      logEvent(analytics, "business_modal_open", {
        event_category: "billing",
        event_label: "modal",
        action: "open",
        user_type: agentData?.userType || "free",
        has_existing_details: !!(agentData?.businessName && agentData?.gstNo)
      });
    } catch (error) {
      console.error("Error logging modal open:", error);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    try {
      logEvent(analytics, "business_modal_close", {
        event_category: "billing",
        event_label: "modal",
        action: "close",
        user_type: agentData?.userType || "free",
        has_business_details: !!(agentData?.businessName && agentData?.gstNo)
      });
    } catch (error) {
      console.error("Error logging modal close:", error);
    }
    setShowModal(false);
  };

  if (!isConnectedToInternet) return <Offline />;

  return (
    <>
      <BillingContainer onOpenBusinessModal={openBusinessModal} />

      <BusinessDetailsModal
        isVisible={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
