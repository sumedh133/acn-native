import ActiveDashboardIcon from "@/assets/icons/svg/Footer/ActiveDashboardIcon";
import ActiveNotificationIcon from "@/assets/icons/svg/Footer/ActiveNotificationsIcon";
import ActivePropertiesIcon from "@/assets/icons/svg/Footer/ActivePropertiesIcon";
import ActiveRequirementsIcon from "@/assets/icons/svg/Footer/ActiveRequirementsIcon";
import DashboardIcon from "@/assets/icons/svg/Footer/DashboardIcon";
import NotificationIcon from "@/assets/icons/svg/Footer/NotificationIcon";
import PropertiesIcon from "@/assets/icons/svg/Footer/PropertiesIcon";
import RequirementsIcon from "@/assets/icons/svg/Footer/RequirementsIcon";
import PlusIcon from "@/assets/icons/svg/PlusIcon";
import { useNavigation, usePathname, useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";
import { StyleSheet, View } from "react-native";

interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

const menuItems: MenuItem[] = [
  {
    title: "Properties",
    path: "/properties",
    icon: <PropertiesIcon width={24} height={24} />,
    activeIcon: <ActivePropertiesIcon width={24} height={24} />,
  },
  {
    title: "Requirements",
    path: "/requirements",
    icon: <RequirementsIcon width={24} height={24} />,
    activeIcon: <ActiveRequirementsIcon width={24} height={24} />,
  },
  {
    title: "",
    path: "/add",
    icon: <PlusIcon width={24} height={24} />,
    activeIcon: null,
  },
  {
    title: "Notifications",
    path: "/notifications",
    icon: <NotificationIcon width={24} height={24} />,
    activeIcon: <ActiveNotificationIcon width={24} height={24} />,
  },
  {
    title: "Dashboard",
    path: "/dashboardTab",
    icon: <DashboardIcon width={24} height={24} />,
    activeIcon: <ActiveDashboardIcon width={24} height={24} />,
  },
];

const FooterNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useNavigation();

  const params = navigation?.getState()?.routes?.at(-1)?.params as {
    showFooter?: boolean;
  };

  const handleNavigation = (path: string) => {
    if (path === pathname) return;
    router.replace(path as any);
  };

  const handleInventorySubmit = () => {
    router.replace("/(tabs)/AddInventoryForm");
  };

  if (params?.showFooter === false) return null;

  return (
    <View style={styles.footer}>
      {menuItems?.map((item, idx) => {
        const active = item?.path === pathname;
        if (item?.path === "/add") {
          return (
            <TouchableOpacity onPress={handleInventorySubmit} key={idx}>
              <View style={styles?.addItem}>{item?.icon}</View>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            onPress={() => handleNavigation(item?.path)}
            key={idx}
          >
            <View style={active ? styles.activeItem : styles.item}>
              {active && <View style={styles.activeBar}></View>}
              {active ? item?.activeIcon : item?.icon}
              <Text style={active ? styles.itemActiveText : styles.itemText}>
                {item?.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 59,
    paddingHorizontal: 9.5,
  },
  addItem: {
    width: 56,
    height: 56,
    marginHorizontal: 4,
    backgroundColor: "#153E3B",
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    transform: "translateY(-18.5px)",
  },
  activeBar: {
    width: 52,
    position: "absolute",
    top: 0,
    height: 3,
    backgroundColor: "#153E3B",
  },
  activeItem: {
    position: "relative",
    width: 79,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  item: {
    width: 79,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemText: {
    fontSize: 10,
    fontWeight: 400,
    fontFamily: "Lato",
    color: "#433F3E",
  },
  itemActiveText: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "Lato",
    color: "#10302D",
  },
});

export default FooterNavigation;
