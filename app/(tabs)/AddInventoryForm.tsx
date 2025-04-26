import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import { ListingProperty, Places } from "../types";
import { getMicromarketFromCoordinates } from "../helpers/getMicromarketFromCoordinates";
import React from "react";
import AssetTypeSelection from "../components/Listing/AssetTypeSelection";
import RadioButtonSelect from "../components/Listing/RadioButtonSelect";
import { appartmentComponents } from "../components/Listing/formComponents";
import SliderButtonSelect from "../components/Listing/SliderButtonSelect";
import TextInputField from "../components/Listing/TextInput";

const initialState: ListingProperty = {
    name: null,
    address: null,
    mapLink: null,
    micromarket: null,
    _geoloc: {
        lat: null,
        lng: null,
    },
    assetType: "Apartment",
    communityType: null,
};

const AddInventoryForm = () => {
    const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
    useEffect(() => {
        if (selectedPlace) {
            const mm = getMicromarketFromCoordinates(selectedPlace);

            setProperty((prevProperty) => ({
                ...prevProperty,
                name: selectedPlace.name,
                address: selectedPlace.address,
                mapLink: selectedPlace.mapLink,
                micromarket: mm,
                _geoloc: {
                    lat: selectedPlace.lat,
                    lng: selectedPlace.lng,
                },
            }));
        } else if (!selectedPlace) {
            setProperty((prevProperty) => ({
                ...prevProperty,
                name: null,
                address: null,
                mapLink: null,
                micromarket: null,
                _geoloc: {
                    lat: null,
                    lng: null,
                },
            }));
        }
    }, [selectedPlace]);

    const [property, setProperty] = useState<ListingProperty>(initialState);
    console.log("property", property);

    const handleSetValue = (field: string, value: any) => {
        setProperty((prevProperty) => ({
            ...prevProperty,
            [field]: value,
        }));
    };

    const renderComponent = (component: any) => {
        switch (component.type) {
            case "radioSelect":
                return (
                    <RadioButtonSelect
                        value={property[component.field]}
                        setvalue={(value) =>
                            handleSetValue(component.field, value)
                        }
                        title={component.label}
                        options={component.options}
                    />
                );
                case "slider":
                    return (
                        <SliderButtonSelect
                            value={property[component.field]}
                            setvalue={(value) =>
                                handleSetValue(component.field, value)
                            }
                            title={component.label}
                            options={component.options}
                        />
                    );
                    case "textInput":
                        return (
                            <TextInputField
                                value={property[component.field]}
                                setValue={(value) =>
                                    handleSetValue(component.field, value)
                                }
                                title={component.label}
                                // alignment="left"
                                alignment={component.alignment}
                            />
                        );
            default:
                return null;
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <PlacesSearch
                    selectedPlace={selectedPlace}
                    setSelectedPlace={setSelectedPlace}
                />

                <AssetTypeSelection
                    selectedAsset={property.assetType}
                    setSelectedAsset={(value) =>
                        handleSetValue("assetType", value)
                    }
                />

                {property?.assetType === "Apartment" &&
                    appartmentComponents.map((component) => {
                        return renderComponent(component);
                    })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        backgroundColor: "#F5F6F7",
        paddingVertical: 16,
        paddingHorizontal: 12,
        width: "100%",
    },
    container: {
        flex: 1,
        gap: 16,
    },
});

export default AddInventoryForm;
