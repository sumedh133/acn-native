import { toastConfig } from "@/utils/toastUtils";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CloseIcon from "@/assets/icons/svg/CloseIcon";

type ConfirmModalProps = {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  generatingEnquiry?: boolean;
  onModalHide: () => void;
  visible: boolean;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message = "You have unsaved changes in the form. Any unsaved data will be lost.",
  onConfirm,
  onCancel,
  generatingEnquiry = false,
  onModalHide,
  visible,
}) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const handleConfirm = () => {
    try {
      logEvent(analytics, "confirm_modal_action", {
        event_category: "modal",
        event_label: "confirm",
        modal_title: title,
        action: "confirm",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging confirm action:", error);
    }
    onConfirm();
  };

  const handleCancel = () => {
    try {
      logEvent(analytics, "confirm_modal_action", {
        event_category: "modal",
        event_label: "cancel",
        modal_title: title,
        action: "cancel",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging cancel action:", error);
    }
    onCancel();
  };

  const handleModalHide = () => {
    try {
      logEvent(analytics, "confirm_modal_hide", {
        event_category: "modal",
        event_label: "hide",
        modal_title: title,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging modal hide:", error);
    }
    onModalHide();
  };

  // Track modal visibility
  React.useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, "confirm_modal_show", {
          event_category: "modal",
          event_label: "show",
          modal_title: title,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging modal show:", error);
      }
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onDismiss={handleModalHide}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <Toast config={toastConfig} />
        <View className="bg-white rounded-xl px-8 py-9 w-full max-w-[340px]">
          <TouchableOpacity
            className="absolute top-3 right-4 z-50"
            onPress={(e: any) => {
              e.stopPropagation();
              handleCancel()
            }}
          >
            <CloseIcon height={28} width={28} />
          </TouchableOpacity>
          {generatingEnquiry ? (
            <View className="items-center justify-center p-5 gap-4">
              <ActivityIndicator size="large" color="#153E3B" />
              {/* <Text className="text-base font-semibold text-[#153E3B] text-center font-['Montserrat_600SemiBold']">
                Processing your enquiry...
              </Text> */}
            </View>
          ) : (
            <>
              <Text className="text-base font-bold text-[#153E3B] mb-2.5 font-['Montserrat_700Bold']">
                {title}
              </Text>
              <Text className="text-sm text-[#433F3E] mb-5 font-['Lato']">
                {message}
              </Text>
              <View className="flex-row gap-2.5">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 border-[1.5px] border-[#10302D] py-2.5 rounded-[4px] items-center"
                >
                  <Text className="text-[#153E3B] font-semibold text-sm">
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex-1 bg-[#10302D] py-2.5 rounded-[4px] items-center"
                >
                  <Text className="text-[#FAFBFC] font-semibold text-sm">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;