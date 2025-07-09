import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/app/config/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import RightIcon from "@/assets/icons/Notification/rightIcon.svg";
import useNotification from "./useNotification";
import { useRouter } from "expo-router";

const NOTIFICATION_OPTIONS = [
  {
    slug: "all",
    text: "All Notifications",
    desc: "Receive all updates including enquiries, listings, billing, marketing, and new features.",
  },
  {
    slug: "essential",
    text: "Essential Only",
    desc: "Only get important alerts like enquiries, listing status changes, and billing updates.",
  },
];

type NotificationPreference = "all" | "essential";

const NotificationSettings: React.FC = () => {
  const navigation = useNavigation();
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId);
  const { getArchivedNotifications, getArchivedNotificationsCount } =
    useNotification();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [preference, setPreference] = useState<NotificationPreference>("all");
  const [archivedNotificationsCount, setArchivedNotificationsCount] =
    useState(0);
  useEffect(() => {
    const fetchSettings = async () => {
      if (!cpId) return;
      setLoading(true);
      const agentRef = doc(db, "acnAgents", cpId);
      const agentSnap = await getDoc(agentRef);
      let pref: NotificationPreference = "all";
      if (!agentSnap.exists()) {
        await setDoc(agentRef, { notificationPreference: "all" });
      } else {
        const data = agentSnap.data();
        if (!data?.notificationPreference) {
          await updateDoc(agentRef, { notificationPreference: "all" });
        } else {
          pref = data.notificationPreference;
        }
      }
      setPreference(pref);
      setLoading(false);
    };
    fetchSettings();
  }, [cpId]);

  const updateSetting = async (pref: NotificationPreference) => {
    if (!cpId) return;
    const agentRef = doc(db, "acnAgents", cpId);
    await updateDoc(agentRef, { notificationPreference: pref });
  };

  const handleToggle = (slug: NotificationPreference) => (value: boolean) => {
    if (value) {
      setPreference(slug);
      updateSetting(slug);
    } else {
      // If toggled off, switch to the other option
      const other = NOTIFICATION_OPTIONS.find((o) => o.slug !== slug)
        ?.slug as NotificationPreference;
      setPreference(other);
      updateSetting(other);
    }
  };

  const handleArchivedNotifications = () => {
    router.push("/components/Notification/ArchivedNotifications" as any);
  };

  const handleArchivedNotificationsCount = async () => {
    const count = await getArchivedNotificationsCount();
    setArchivedNotificationsCount(count || 0);
  };

  useEffect(() => {
    handleArchivedNotificationsCount();
  }, [archivedNotificationsCount]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#153E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.sectionTitle}>Push Notifications</Text>
      {NOTIFICATION_OPTIONS.map((option) => (
        <View style={styles.row} key={option.slug}>
          <View style={styles.textContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#E3E3E3",
                width: "100%",
                borderRadius: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={styles.label}>{option.text}</Text>
              <Switch
                value={preference === option.slug}
                onValueChange={handleToggle(
                  option.slug as NotificationPreference
                )}
                trackColor={{ false: "#E0E0E0", true: "#153E3B" }}
                thumbColor="#fff"
                ios_backgroundColor="#E0E0E0"
              />
            </View>
            <Text style={styles.desc}>{option.desc}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: "#E3E3E3",
          width: "100%",
          borderRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
        onPress={handleArchivedNotifications}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Lato_500Medium",
              lineHeight: 21,
            }}
          >
            Archived Notifications
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Lato_500Medium",
              lineHeight: 18,
            }}
          >
            ({archivedNotificationsCount})
          </Text>
        </View>
        <RightIcon width={16} height={16} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Lato_700Bold",
    letterSpacing: 0.25,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginLeft: 20,
    marginBottom: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  textContainer: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    fontFamily: "Lato_500Medium",
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    fontFamily: "Montserrat_400Regular",
  },
});

export default NotificationSettings;
