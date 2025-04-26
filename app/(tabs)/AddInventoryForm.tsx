import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import { ListingProperty, Places } from "../types";
import { getMicromarketFromCoordinates } from "../helpers/getMicromarketFromCoordinates";
import React from "react";
import AssetTypeSelection from "../components/Listing/AssetTypeSelection";
import RadioButtonSelect from "../components/Listing/RadioButtonSelect";
import {
    appartmentComponents,
    assetTypes,
} from "../components/Listing/formComponents";
import SliderButtonSelect from "../components/Listing/SliderButtonSelect";
import TextInputField from "../components/Listing/TextInput";
import DropdownSelect from "../components/Listing/Dropdown";
import Checkbox from "../components/Listing/CheckBox";
import MonthYearPicker from "../components/Listing/MonthYearPicker";

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
    const [property, setProperty] = useState<ListingProperty>(initialState);

    console.log("property", property);

    const handleSetValue = (field: string, value: any) => {
        setProperty((prevProperty) => ({
            ...prevProperty,
            [field]: value,
        }));
    };

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
                        required={component.required}
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
                            required={component.required}
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
                                suffix={component.suffix}
                                placeholder={component.placeholder}
                            />
                        );
                        case "Dropdown":
                            return (
                                <DropdownSelect
                                    value={property[component.field]}
                                    setValue={(value) =>
                                        handleSetValue(component.field, value)
                                    }
                                    title={component.label}
                                    options={component.option}
                                    alignment={component.alignment}
                                />
                            );
                            case "Checkbox":
                                return (
                                    <Checkbox
                                        checked={property[component.field]}
                                        setChecked={(checked) =>
                                            handleSetValue(component.field, checked)
                                        }
                                        title={component.label}
                                        // options={component.option}
                                        alignment={component.alignment}
                                    />
                                );
                                case "MonthYearPicker":
                                    return (
                                        <MonthYearPicker
                                            value={property[component.field]}
                                            setValue={(value) =>
                                                handleSetValue(component.field, value)
                                            }
                                            title={component.label}
                                            // options={component.option}
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

                {assetTypes?.[property?.assetType ?? "Apartment"]?.map((component) => {
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
