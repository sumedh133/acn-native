// footerConstants.ts
import React, { ReactNode } from "react";
import ActiveDashboardIcon from "@/assets/icons/svg/Footer/ActiveDashboardIcon";
import ActivePropertiesIcon from "@/assets/icons/svg/Footer/ActivePropertiesIcon";
import ActiveRequirementsIcon from "@/assets/icons/svg/Footer/ActiveRequirementsIcon";
import DashboardIcon from "@/assets/icons/svg/Footer/DashboardIcon";
import PropertiesIcon from "@/assets/icons/svg/Footer/PropertiesIcon";
import RequirementsIcon from "@/assets/icons/svg/Footer/RequirementsIcon";
import PlusIcon from "@/assets/icons/svg/Common/PlusIcon";
import MyBusiness from "@/assets/icons/svg/Footer/MyBuisness.svg";
import ActiveMyBusiness from "@/assets/icons/ActiveMyBusiness.svg";
import AddInventoryIcon from "@/assets/icons/svg/Footer/AddInventoryIcon";
import AddRequirementsIcon from "@/assets/icons/svg/Footer/AddRequirementsIcon";

export interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

export interface PopupItem {
  id: string;
  text: string;
  subText: string;
  icon: ReactNode;
  colors: string[];
  iconColor: string;
  free?: boolean;
  onPress: () => void;
}

export const menuItems: MenuItem[] = [
  {
    title: "Properties",
    path: "/properties",
    icon: React.createElement(PropertiesIcon, { width: 24, height: 24 }),
    activeIcon: React.createElement(ActivePropertiesIcon, { width: 24, height: 24 }),
  },
  {
    title: "Requirements",
    path: "/requirements",
    icon: React.createElement(RequirementsIcon, { width: 24, height: 24 }),
    activeIcon: React.createElement(ActiveRequirementsIcon, { width: 24, height: 24 }),
  },
  {
    title: "",
    path: "/add",
    icon: React.createElement(PlusIcon, { width: 24, height: 24 }),
    activeIcon: null,
  },
  {
    title: "My Business",
    path: "/MyBusinessPage",
    icon: React.createElement(MyBusiness, { width: 24, height: 24 }),
    activeIcon: React.createElement(ActiveMyBusiness, { width: 24, height: 24 }),
  },
  {
    title: "Dashboard",
    path: "/dashboardTab",
    icon: React.createElement(DashboardIcon, { width: 24, height: 24 }),
    activeIcon: React.createElement(ActiveDashboardIcon, { width: 24, height: 24 }),
  },
];

export const getPopupItems = (handlePopupCardClick: (path: string) => void): PopupItem[] => [
  {
    id: "add_inventory",
    text: "Add Inventory",
    subText: "Add your inventory to increase visibility",
    icon: React.createElement(AddInventoryIcon, { width: 24, height: 24 }),
    colors: ["#FFFCEC", "#FFFFFF"],
    iconColor: "#FFE86A",
    free: true,
    onPress: () => handlePopupCardClick("(pages)/Drafts"),
  },
  {
    id: "add_requirement",
    text: "Add Requirement",
    subText: "Add your requirements to find inventory.",
    icon: React.createElement(AddRequirementsIcon, { width: 24, height: 24 }),
    colors: ["#F1FFFE", "#FFFFFF"],
    iconColor: "#BFE9E6",
    onPress: () => handlePopupCardClick("(tabs)/UserRequirementForm"),
  },
];