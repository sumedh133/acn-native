import Appartments from "@/assets/icons/svg/AddInventory/Appartments";
import Plots from "@/assets/icons/svg/AddInventory/Plots";
import RowHouse from "@/assets/icons/svg/AddInventory/RowHouse";
import ShowLessButton from "@/assets/icons/svg/AddInventory/ShowLessButton";
import ShowMoreButton from "@/assets/icons/svg/AddInventory/ShowMoreButton";
import Villa from "@/assets/icons/svg/AddInventory/Villa";
import Villaments from "@/assets/icons/svg/AddInventory/Villaments";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type AssetOption = {
    title: string;
    assetType: string;
    icon: React.ReactNode;
};

interface AssetTypeSelectionProps {
    selectedAsset: string | null;
    setSelectedAsset: (value: string | null) => void;
}

const AssetTypeSelection = ({
    selectedAsset,
    setSelectedAsset,
}: AssetTypeSelectionProps) => {
    const [seeMore, setSeeMore] = useState(false);

    const assetOptions: AssetOption[] = [
        {
            title: "Flats/Apartments",
            assetType: "Apartment",
            icon: <Appartments />,
        },
        { title: "Villa", assetType: "Villa", icon: <Villa /> },
        { title: "Plot", assetType: "Plot", icon: <Plots /> },
        { title: "Row House", assetType: "Row House", icon: <RowHouse /> },
        { title: "Villament", assetType: "Villament", icon: <Villaments /> },
        // { title: "Office Space", assetType: "Office Space", icon: <OfficeSpace /> },
        {
            title: "Independent Building",
            assetType: "Independent Building",
            icon: <Appartments />,
        },
    ];

    const toggleSeeMore = () => {
        setSeeMore((prev) => !prev);
    };

    const getCombinedData = () => {
        if (assetOptions.length <= 3) {
            return assetOptions;
        }

        if (!seeMore) {
            const visibleOptions = assetOptions.slice(0, 3);
            return [
                ...visibleOptions,
                {
                    title: "More",
                    assetType: "toggle-button",
                    icon: <ShowMoreButton />,
                } as AssetOption,
            ];
        }

        return [
            ...assetOptions,
            {
                title: "Less",
                assetType: "toggle-button",
                icon: <ShowLessButton />,
            } as AssetOption,
        ];
    };

    const renderItem = ({
        item,
        index,
    }: {
        item: AssetOption;
        index: number;
    }) => {
        if (item.assetType === "toggle-button") {
            return (
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleSeeMore}>
                    {item.icon}
                    <Text
                        style={styles.assetItemText}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        {item.title}
                    </Text>
                </TouchableOpacity>
            );
        }

        const isSelected = selectedAsset === item.assetType;

        return (
            <TouchableOpacity
                style={[
                    styles.assetItem,
                    isSelected && styles.selectedAssetItem,
                ]}
                onPress={() => setSelectedAsset(item.assetType)}>
                {/* Icon */}
                {React.cloneElement(item.icon as React.ReactElement, {
                    color: "#2B3034",
                })}

                {/* Text */}
                <Text
                    style={styles.assetItemText}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.section}>
            <View style={styles.headingContainer}>
                <Text style={styles.sectionHeading}>Asset Type</Text>
                <Text style={styles.compulsoryStar}>*</Text>
            </View>

            <View style={styles.assetGridContainer}>
                <FlatList
                    data={getCombinedData()}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.assetType}
                    numColumns={2}
                    columnWrapperStyle={styles.assetGridRow}
                    scrollEnabled={false}
                    contentContainerStyle={styles.gridContent}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        width: "100%",
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 10,
    },
    headingContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 6,
    },
    sectionHeading: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
    },
    compulsoryStar: {
        fontFamily: "sans-serif",
        color: "#DC3545",
        fontSize: 14,
        fontWeight: "400",
    },
    assetGridContainer: {
        width: "100%",
    },
    gridContent: {
        width: "100%",
    },
    assetGridRow: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    toggleButton: {
        width: "48%",
        height: 68,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        gap: 8,
    },
    assetItem: {
        width: "48%",
        height: 68,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2B3034",
        gap: 8,
    },
    selectedAssetItem: {
        borderColor: "#2B3034",
        backgroundColor: "#DFF4F3",
    },
    assetItemText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 13,
        color: "#2B3034",
        flexShrink: 1,
        flexWrap: "wrap",
    },
});

export default AssetTypeSelection;
