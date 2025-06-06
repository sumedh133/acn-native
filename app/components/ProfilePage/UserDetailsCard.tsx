import { RootState } from "@/store/store";
import { getInitials, getRandomColor } from "@/utils/userUtils";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const UserDetailsCard = ({ userType }: { userType: string | null }) => {
  const name: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.name) || "";
  const phonenumber: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.phonenumber) || "";
  const initials = getInitials(name);
  const avatarColor = getRandomColor(initials);

  useEffect(() => {
    try {
      logEvent(analytics, "user_details_view", {
        event_category: "profile",
        event_label: "view",
        has_name: !!name,
        has_phone: !!phonenumber,
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging user details view:", error);
    }
  }, [name, phonenumber, userType]);

  return (
    <View style={styles.card}>
      {userType === "premium" && (
        <LinearGradient
          colors={["#205E59", "#E3E3E3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.2391, 0.697]}
          style={styles.gradientBorder}
        />
      )}
      <LinearGradient
        colors={["#DAF8F4", "#FFFFFF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: userType === "premium" ? 0.95 : 0, y: 0.5 }}
        locations={[0.3024, 0.9583]}
        style={styles.content}
      >
        <View style={[styles.initials, { backgroundColor: avatarColor }]}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <View style={styles.information}>
          <View style={styles.userData}>
            <Text style={{ fontFamily: "Montserrat_700Bold" }}>{name}</Text>
            <Text
              style={{ fontFamily: "Montserrat_500Medium", color: "#5A5555" }}
            >
              {"+91-" + phonenumber?.slice(3)}
            </Text>
          </View>
          <View style={styles.memberContainer}>
            {/* {userType && (
              <Text
                style={[
                  styles.userType,
                  userType === "premium"
                    ? { backgroundColor: "#FFFFFF", borderColor: "##F2F2F2" }
                    : { backgroundColor: "#F4FBF8", borderColor: "#BFE9E6" },
                ]}
              >
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </Text>
            )} */}
            {userType && (
              <View
                className="border-[1px] rounded-full"
                style={[
                  userType === "premium"
                    ? { backgroundColor: "#FFFFFF", borderColor: "##F2F2F2" }
                    : { backgroundColor: "#F4FBF8", borderColor: "#BFE9E6" },
                ]}
              >
                <Text style={[styles.userType]}>
                  {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </Text>
              </View>
            )}
            <Text style={styles.member}>Member</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default React.memo(UserDetailsCard);

const styles = StyleSheet.create({
  card: {
    position: "relative",
    height: 104,
    width: "100%",
  },
  gradientBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  content: {
    position: "absolute",
    left: 1,
    right: 1,
    top: 1,
    bottom: 1,
    backgroundColor: "white",
    borderRadius: 7,
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  initials: {
    width: 80,
    height: 80,
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 32,
    color: "#F4FBF8",
  },
  information: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  userData: {
    display: "flex",
    flexDirection: "column",

    gap: 4,
    alignItems: "flex-start",
  },
  memberContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userType: {
    // borderWidth: 1,
    // borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontFamily: "Lato",
    fontSize: 12,
    fontWeight: 600,
    color: "#313534",
  },
  member: {
    fontFamily: "Lato",
    fontSize: 12,
    fontWeight: 600,
    color: "#10302D",
  },
});
