import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { showErrorToast, showSuccessToast, toastConfig } from '@/utils/toastUtils';
import CloseIcon from '@/assets/icons/svg/CloseIcon';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the AgentData interface separately
interface AgentData {
  phonenumber: string;
  [key: string]: any;
}

// Props type for your EnquiryCPModal component
type EnquiryCPModalProps = {
  setIsEnquiryCPModelOpen: (isOpen: boolean) => void;
  generatingEnquiry?: boolean;
  visible: boolean;
  selectedCPID: string
};

const EnquiryCPModal: React.FC<EnquiryCPModalProps> = ({
  setIsEnquiryCPModelOpen,
  generatingEnquiry,
  visible,
  selectedCPID
}) => {
  const [agentData, setAgentData] = useState<AgentData | null>(null);

  useEffect(() => {
    console.log("EnquiryCPModal mounted, visible =", visible);
    if (visible) {
      console.log("Modal should be visible now with CPID:", selectedCPID);
    }
    
    return () => {
      console.log("EnquiryCPModal unmounted");
    };
  }, [visible, selectedCPID]);



  useEffect(() => {
    const fetchAgentData = async () => {
      if (!selectedCPID) return;

      try {
        const docRef = doc(db, "agents", selectedCPID);
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
    if (!agentData?.phonenumber) return;

    if (agentData != null) {
      Linking.openURL(`whatsapp://send?phone=${agentData.phonenumber}`)
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!agentData?.phonenumber) return;

    try {
      await Clipboard.setStringAsync(agentData.phonenumber);
      // Alert.alert('Success', 'Phone number copied!');
      showSuccessToast("Phone number copied to clipboard!", { isInModal: true });
    } catch (err) {
      showErrorToast("Failed to copy phone number.", { isInModal: true });
      //console.error("Failed to copy phone number:", err);
    }
  };

  const handleCall = (): void => {
    if (!agentData?.phonenumber) return;
    Linking.openURL(`tel:${agentData.phonenumber}`);
  };

  const onClose = () => {
    setIsEnquiryCPModelOpen(false)
  }

  const toCapitalizedWords = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // if (!visible) return null;

    const [forceRender, setForceRender] = useState(false);
  


  return (
      <Modal visible={visible} transparent animationType='slide'       onShow={() => setForceRender(prev => !prev)}
>
{forceRender && <View style={{ height: 0 }} />}
      <View style={styles.modalOverlay}>
        <Toast config={toastConfig} />
        <View style={styles.modalContent}>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsEnquiryCPModelOpen(false)}
          >
            <CloseIcon />
          </TouchableOpacity>

          <View style={styles.contentContainer} >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Enquire Now</Text>
              <Text style={styles.description}>
                {agentData ? (
                  <>
                    Connect directly with{" "}
                    <Text style={styles.boldText}>
                      {toCapitalizedWords(agentData.name)}
                    </Text>{" "}
                    for this property.
                  </>
                ) : (
                  "Loading agent details..."
                )}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              {agentData && (
                <View style={styles.phoneContainer}>
                  <View style={styles.phoneNumberContainer}>
                    <Text style={styles.phoneNumber}>
                      {agentData.phonenumber}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleCopy}
                    style={styles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={24} color="#555" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleWhatsAppEnquiry}
                  style={styles.actionButton}
                >
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name='logo-whatsapp' size={24} color="#25D366" />
                  </View>
                  <Text style={styles.buttonText}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCall}
                  style={styles.actionButton}
                >
                  <Ionicons name='call-outline' size={24} color="#313131" />
                  <Text style={styles.buttonText}>
                    Call Agent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    {/* <Text style={styles.modalOverlay}>Hi</Text> */}
      </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 440,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
    zIndex: 10000,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
  contentContainer: {
    alignItems: 'center',
    gap: 24,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#153E3B',
  },
  description: {
    fontSize: 14,
    color: '#313131',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 100,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  phoneNumberContainer: {
    padding: 12,

  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#313131',
  },
  copyButton: {
    backgroundColor: '#F5F6F7',
    padding: 12,
    borderRadius: '100%',

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 100,
    padding: 12,
    backgroundColor: 'white',
  },
  buttonIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#313131',
  },
});

export default EnquiryCPModal;