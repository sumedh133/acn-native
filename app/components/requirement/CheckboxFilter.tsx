import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRefinementList } from "react-instantsearch";
import { useSelector } from "react-redux";
import { RefinementItem } from "../DropdownMoreFilters";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

interface RootState {
  agent: {
    docData: {
      cpId: string;
      userType: string;
    };
  };
}

const CheckboxFilter = ({
  attribute,
  items,
  refine,
}: {
  attribute: string;
  items: RefinementItem[];
  refine: any;
}) => {
  const cpId = useSelector((state: RootState) => state.agent?.docData?.cpId);
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";
  // const cpId = "CPA537"
  // const { items, refine } = useRefinementList({ attribute });
  const [isToggled, setIsToggled] = useState(
    items.some((item) => item.value === cpId && item.isRefined),
  );

  const handleToggle = () => {
    const shouldRefine = !isToggled;
    setIsToggled(shouldRefine);
    refine(cpId);

    try {
      logEvent(analytics, 'requirement_filter_toggle', {
        event_category: 'filters',
        event_label: 'interaction',
        filter_type: 'my_requirements',
        filter_value: shouldRefine ? 'on' : 'off',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging filter toggle:', error);
    }
  };

  return (
    <View style={styles.Maincontainer}>
      <Text style={styles.text}>Requirements :</Text>
      <TouchableOpacity style={styles.container} onPress={handleToggle}>
        <View style={styles.checkbox}>
          {isToggled && <View style={styles.checkboxInner} />}
        </View>
        <Text style={styles.label}>My Requirements</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckboxFilter;

const styles = StyleSheet.create({
  Maincontainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: "4%",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 8,
    borderColor: "#E6E6E6",
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#103D35", // Primary color
    borderRadius: 2,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
