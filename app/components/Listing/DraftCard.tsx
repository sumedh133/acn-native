import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Property } from "@/app/types";
import TrashIcon from "@/assets/icons/svg/Common/TrashIcon";
import { formatUnixDate, getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import DeleteDraft from "@/app/modals/DeleteDraft";

const DraftCard = ({
  item,
  deleteDraft,
  pressCard,
}: {
  item: Property;
  deleteDraft: (id: string) => void;
  pressCard: (item: Property) => void;
}) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const [propertyId, setPropertyId] = useState("")
  const cardSubText = React.useMemo(() => {
    const parts = [];


    if (item.plotArea) parts.push(item.plotArea + " Sqft");
    else if (item.sbua) parts.push(item.sbua + " Sqft");

    // Add assetType if it exists
    if (item.assetType) parts.push(item.assetType);

    // Add micromarket with "in" prefix if it exists
    if (item.micromarket) parts.push(`in ${item.micromarket}`);

    // Join parts with a single space
    return parts.join(" ");
  }, [item]);

  const handleDeleteModalClicked = (property: string) => {
    setPropertyId(property);
    setDeleteModal(true);
  }
  return (
    <View>
      <TouchableOpacity
        style={styles.propertyItem}
        onPress={() => pressCard(item)}
      >
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.propertyName}</Text>
          <Text style={styles.propertyDetails}>{cardSubText}</Text>
          <Text style={styles.propertyDetails}>
            {item.sbua} {item.sbua && "|"} {item.furnishing}
          </Text>
          <Text style={styles.editedDate}>
            Last Edited :{" "}
            <Text style={styles.lastEditedText}>
              {formatUnixDate(item.lastModified)}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            item.propertyId && handleDeleteModalClicked(item.propertyId);
          }}
        >
          <TrashIcon />
        </TouchableOpacity>
      </TouchableOpacity>
      <DeleteDraft
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        handleDelete={() => deleteDraft(propertyId)}
      />
    </View>
  );
};

export default React.memo(DraftCard);

const styles = StyleSheet.create({
  propertyItem: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Montserrat_700Bold",
  },
  propertyDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    fontFamily: "Lato",
    fontWeight: "400",
  },
  editedDate: {
    fontSize: 12,
    color: "#000",
    marginTop: 8,
    fontFamily: "Lato",
    fontWeight: "700",
  },
  lastEditedText: {
    fontFamily: "Lato",
    fontWeight: "300",
    color: "#2B3034",
    fontSize: 12,
  },
});
