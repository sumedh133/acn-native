import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { useSelector } from "react-redux";
import { selectMyKam } from "@/store/slices/agentSlice";
import {
  selectKamModalVisible,
  selectKamName,
  selectKamNumber,
  setKamDataState,
  setKamModalVisible,
} from "@/store/slices/kamSlice";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { toCapitalizedWords } from "../helpers/common";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { getInitials, getRandomColor } from "@/utils/userUtils";

const KamManager = () => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const myKamId = useSelector(selectMyKam);
  const kamName = useSelector(selectKamName);
  const kamNumber = useSelector(selectKamNumber);
  const visible = useSelector(selectKamModalVisible);
  const initials = getInitials(kamName);
  const color = getRandomColor(initials);

  useEffect(() => {
    if (myKamId) {
      dispatch(setKamDataState(myKamId));
    }
  }, [myKamId, dispatch]);

  const closeModal = () => {
    dispatch(setKamModalVisible(false));
  };

  const handleCallPress = () => {
    const url = `tel:${kamNumber}`;
    Linking.openURL(url);
  };

  const handleWhatsAppPress = () => {
    const url = `https://wa.me/${kamNumber}`;
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <View style={styles.headerRow}>
                <Avatar
                  rounded
                  title={initials}
                  overlayContainerStyle={{
                    backgroundColor: color,
                  }}
                  size="medium"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.nameText}>
                    {toCapitalizedWords(kamName)}
                  </Text>
                  <Text style={styles.roleText}>Account Manager</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCallPress}
                >
                  <Ionicons name="call-outline" size={20} color="black" />
                  <Text style={styles.callText}>
                    {kamNumber.slice(0, 3)} {kamNumber.slice(3)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={handleWhatsAppPress}
                >
                  <FontAwesome
                    name="whatsapp"
                    size={24}
                    color="#FAFBFC"
                    style={styles.iconMargin}
                  />
                  <Text style={styles.whatsappText}>Whatsapp</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(KamManager);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 36,
    borderRadius: 12,
    borderColor: "#E5E5E5",
    borderWidth: 2,
    width: "85%",
    maxWidth: 360,
    position: "absolute",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
    marginLeft: 12,
  },
  nameText: {
    // fontWeight: "bold",
    fontSize: 16,
    color: "#2B2928",
    fontFamily: "Montserrat_700Bold",
  },
  roleText: {
    fontSize: 12,
    color: "#2B2928",
    marginTop: 4,
    fontFamily: "Lato",
  },
  divider: {
    height: 1,
    backgroundColor: "#CCCBCB",
    marginVertical: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderColor: "#153E3B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 4,
    gap: 4,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#153E3B",
    borderRadius: 4,
  },
  callText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0B0A",
  },
  whatsappText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAFBFC",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  iconMargin: {
    marginRight: 8,
  },
});
