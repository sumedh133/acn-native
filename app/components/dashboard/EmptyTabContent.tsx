import { styled } from "nativewind";
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type EmptyTabContentProps = {
  text?: string;
  sub_text?: string;
  icon?: React.ReactNode;
  handleOnPress?: () => void;
  buttonText?: string;
  loading: boolean;
};

// Define component
const EmptyTabContent: React.FC<EmptyTabContentProps> = ({
  text,
  sub_text,
  icon,
  handleOnPress,
  buttonText,
  loading,
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  useEffect(() => {
    if (!loading) {
      try {
        logEvent(analytics, 'view_empty_state', {
          event_category: 'dashboard',
          event_label: 'empty_state',
          empty_state_text: text,
          has_action_button: !!buttonText,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging empty state view:', error);
      }
    }
  }, [loading, text, buttonText]);

  const handleActionButtonPress = () => {
    try {
      logEvent(analytics, 'empty_state_action_click', {
        event_category: 'dashboard',
        event_label: 'interaction',
        button_text: buttonText,
        empty_state_text: text,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging empty state action:', error);
    }
    handleOnPress?.();
  };

  if (loading) return <ActivityIndicator className="mt-8" color="#153E3B" />;
  return (
    <View style={styles.bgContainer}>
      <LinearGradient
        colors={["#E0F7F4", "#FFFFFF"]}
        locations={[0, 1]}
        style={styles.container}
      >
        <Image
          source={require("../../../assets/icons/no-image-icon.webp")}
          style={{ width: 96, height: 96 }} // You can adjust the size
        />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
          <Text style={styles.subText}>{sub_text}</Text>
        </View>
        {icon && buttonText && (
          <TouchableOpacity onPress={handleActionButtonPress} style={styles.button}>
            {icon}
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 72,
    marginHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  text: {
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  subText: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#153E3B",
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 4,
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Lato",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#FAFBFC",
  },
});
export default React.memo(EmptyTabContent);
