import React, { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db, analytics } from "../config/firebase";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import {
  showErrorToast,
  showSuccessToast,
  toastConfig,
} from "@/utils/toastUtils";

// import external
import LottieView from "lottie-react-native";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Property } from "../types";

// Define the AgentData interface separately
interface AgentData {
  phoneNumber: string;
  [key: string]: any;
}

// Props type for your EnquiryCPModal component
type EnquiryCPModalProps = {
  setIsEnquiryCPModelOpen: (isOpen: boolean) => void;
  generatingEnquiry?: boolean;
  visible: boolean;
  selectedCPID: string;
  property: Property;
};

const EnquiryCPModal: React.FC<EnquiryCPModalProps> = ({
  setIsEnquiryCPModelOpen,
  generatingEnquiry,
  visible,
  selectedCPID,
  property,
}) => {
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const user = useSelector((state: RootState) => state?.agent?.docData);

  useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, "enquiry_cp_modal_show", {
          event_category: "modal",
          event_label: "enquiry_cp",
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging modal show:", error);
      }
    }
  }, [visible]);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!selectedCPID) return;

      try {
        const docRef = doc(db, "acnAgents", selectedCPID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AgentData;
          setAgentData(data);
        } else {
          console.warn("No agent data found");
          setAgentData(null);
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgentData();
  }, [selectedCPID]);

  const handleWhatsAppEnquiry = (): void => {
    if (!agentData?.phoneNumber) return;

    try {
      logEvent(analytics, "enquiry_cp_action", {
        event_category: "modal",
        event_label: "enquiry_cp",
        action: "whatsapp",
        agent_id: selectedCPID,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging WhatsApp action:", error);
    }

    if (agentData != null) {
      const message = `Hi ${agentData?.name},

I came across your property on ACN and I'm interested in ${property?.propertyName} (ID: ${property?.propertyId}). 
Could you please share:
 
- Current pricing  
- When can the site visit happen?  
- Any other key details  

Thanks,
${user?.name}
${user?.phoneNumber}`;
      Linking.openURL(`https://wa.me/${agentData.phoneNumber}?text=${message}`);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!agentData?.phoneNumber) return;

    try {
      await Clipboard.setStringAsync(agentData.phoneNumber);
      showSuccessToast("Phone number copied to clipboard!", {
        isInModal: true,
      });

      logEvent(analytics, "enquiry_cp_action", {
        event_category: "modal",
        event_label: "enquiry_cp",
        action: "copy_phone",
        agent_id: selectedCPID,
        user_type: userType,
      });
    } catch (err) {
      showErrorToast("Failed to copy phone number.", { isInModal: true });
      console.error("Failed to copy phone number:", err);
    }
  };

  const handleCall = (): void => {
    if (!agentData?.phoneNumber) return;

    try {
      logEvent(analytics, "enquiry_cp_action", {
        event_category: "modal",
        event_label: "enquiry_cp",
        action: "call",
        agent_id: selectedCPID,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging call action:", error);
    }

    Linking.openURL(`tel:${agentData.phoneNumber}`);
  };

  const onClose = () => {
    try {
      logEvent(analytics, "enquiry_cp_modal_close", {
        event_category: "modal",
        event_label: "enquiry_cp",
        agent_id: selectedCPID,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging modal close:", error);
    }
    setIsEnquiryCPModelOpen(false);
  };

  const toCapitalizedWords = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [forceRender, setForceRender] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={() => setForceRender((prev) => !prev)}
    >
      {forceRender && <View className="h-0" />}
      <View className="flex-1 justify-center items-center z-50 bg-black/50 p-5">
        <Toast config={toastConfig} />
        <View className="bg-white rounded-[12px] py-8 px-7 w-full max-w-[440px] relative z-50">
          <TouchableOpacity
            className="absolute top-3 right-4 z-50"
            onPress={(e: any) => {
              e.stopPropagation();
              setIsEnquiryCPModelOpen(false);
            }}
          >
            <CloseIcon />
          </TouchableOpacity>

          <View className="items-center gap-3">
            <View className="items-start gap-2">
              <Text className="text-base text-motserrat font-bold text-[#153E3B]">
                Enquire Now
              </Text>
              <Text className="text-sm text-[#313131] text-left">
                {agentData ? (
                  <>
                    Connect directly with{" "}
                    <Text className="font-bold">
                      {toCapitalizedWords(agentData.name)}
                    </Text>{" "}
                    for this property.
                  </>
                ) : (
                  "Loading agent details..."
                )}
              </Text>
            </View>

            <View className="w-full gap-3">
              {agentData && (
                <View className="flex-row items-center justify-between border border-[#E3E3E3] rounded-[4px] bg-white overflow-hidden">
                  <View className="p-3">
                    <Text className="text-sm font-bold text-[#313131]">
                      {agentData.phoneNumber}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleCopy}
                    className="bg-[#F5F6F7] p-3 rounded-r-[4px]"
                  >
                    <Ionicons name="copy-outline" size={24} color="#555" />
                  </TouchableOpacity>
                </View>
              )}

             <View className="flex flex-row items-center space-x-[10px] justify-between">
                <TouchableOpacity
                  onPress={handleWhatsAppEnquiry}
                  className="flex-1 flex-row items-center justify-center space-x-2 border-[1.5px] border-[#153E3B] rounded-[4px] bg-white h-[37px]"
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  <Text className="text-sm font-bold text-[#313131]">WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCall}
                  className="flex-1 flex-row items-center justify-center space-x-2 border-[1.5px] border-[#153E3B] rounded-[4px] bg-white h-[37px]"
                >
                  <Ionicons name="call-outline" size={18} color="#313131" />
                  <Text className="text-sm font-bold text-[#313131]">Call Agent</Text>
                </TouchableOpacity>
              </View>



            </View>
          </View>
        </View>
      </View>
      {/* {visible && (
        <View className="z-50">
          <LottieView
            source={require("@/assets/LottieAnimation/confetti.json")}
            autoPlay
            loop={false}
            style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
          />
        </View>
      )} */}
    </Modal>
  );
};

export default EnquiryCPModal;