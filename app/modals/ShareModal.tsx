import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Clipboard,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { RootState } from "@/store/store";

import { shareProperty, createPropertyMessage } from "../helpers/shareModal";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import {
  showErrorToast,
  showSuccessToast,
  toastConfig,
} from "@/utils/toastUtils";
import Toast from "react-native-toast-message";

interface ShareModalProps {
  visible: boolean;
  property: any;
  agentData: any;
  setProfileModalOpen: (open: boolean) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  property,
  agentData,
  setProfileModalOpen,
}) => {
  const dispatch = useDispatch();
  const phoneNumber = useSelector((state: any) => state.agent.phoneNumber);
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, "share_modal_show", {
          event_category: "modal",
          event_label: "share",
          property_id: property?.propertyId,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging modal show:", error);
      }
    }
  }, [visible]);

  const handleCopy = async () => {
    console.log("property", property);
    try {
      let details = await createPropertyMessage(
        property,
        agentData?.phoneNumber
      );
      details = decodeURIComponent(details);

      logEvent(analytics, "share_action", {
        event_category: "modal",
        event_label: "share",
        action: "copy",
        property_id: property?.propertyId,
        user_type: userType,
      });

      showSuccessToast("Inventory details copied Successfully!", {
        isInModal: true,
      });
      Clipboard.setString(details);
    } catch (err) {
      showErrorToast("Failed to copy details!", { isInModal: true });
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    try {
      logEvent(analytics, "share_action", {
        event_category: "modal",
        event_label: "share",
        action: "whatsapp",
        property_id: property?.propertyId,
        user_type: userType,
      });
      await shareProperty(property, agentData?.phoneNumber, phoneNumber);
    } catch (error) {
      console.error("Error in share action:", error);
    }
  };

  const handleClose = () => {
    setProfileModalOpen(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 bg-black/30 justify-center items-center px-4">
          <Toast config={toastConfig} />
          <TouchableWithoutFeedback>
            <View className="w-full max-w-[380px] bg-[#FAFAFA] py-6 px-5 rounded-xl relative">
              <View className="mb-6">
                <Text className="text-base font-bold text-[#153E3B] mb-2">Share this Property</Text>
                <Text className="text-sm text-[#313131]">
                  Share these details, including your contact information, with your clients via WhatsApp.
                </Text>
              </View>
              <View className="flex-row justify-between gap-2.5">
                <TouchableOpacity
                  className="flex-1 flex-row items-center rounded-[4px] h-[37px] border-[1.5px] border-[#10302D] px-4 py-[6px] bg-white"
                  onPress={handleShare}
                >
                  <View className="w-10 h-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="whatsapp"
                      size={18}
                      color="#25D366"
                    />
                  </View>
                  <Text className="flex-1 text-sm font-bold text-black text-center -ml-2.5">WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center rounded-[4px] h-[37px] border-[1.5px] border-[#10302D] px-4 py-[6px] bg-white"
                  onPress={handleCopy}
                >
                  <View className="w-10 h-full items-center justify-center">
                    <Ionicons name="copy-outline" size={18} color="#555" />
                  </View>
                  <Text className="flex-1 text-sm font-bold text-black text-center -ml-2.5">Copy Details</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="absolute top-4 right-4 w-[30px] h-[30px] items-center justify-center"
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ShareModal;