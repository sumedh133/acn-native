import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { ScrollView, StyleSheet, View } from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import { DocsToUpload, ListingProperty, Places } from "../types";
import { getMicromarketFromCoordinates } from "../helpers/getMicromarketFromCoordinates";
import React from "react";
import AssetTypeSelection from "../components/Listing/AssetTypeSelection";
import RadioButtonSelect from "../components/Listing/RadioButtonSelect";
import {
  assetTypes,
  compulsoryFields,
} from "../components/Listing/ComponentObjects/formComponents";
import SliderButtonSelect from "../components/Listing/SliderButtonSelect";
import TextInputField from "../components/Listing/TextInput";
import DropdownSelect from "../components/Listing/Dropdown";
import Checkbox from "../components/Listing/CheckBox";
import MonthYearPicker from "../components/Listing/MonthYearPicker";
import TotalAskPrice from "../components/Listing/TotalAskPrice";
import ExtraDetailsField from "../components/Listing/ExtraDetails";
import Document from "../components/Listing/document/Document";

const initialState: ListingProperty = {
  nameOfTheProperty: null,
  address: null,
  mapLocation: null,
  micromarket: null,
  _geoloc: {
    lat: null,
    lng: null,
  },
  assetType: "Apartment",
  communityType: null,
  subType: null,
  sbua: null,
  carpet: null,
  floorNo: null,
  facing: null,
  unitNo: null,
  furnishing: null,
};

const AddInventoryForm = () => {
  const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
  const [property, setProperty] = useState<ListingProperty>(initialState);
  const [docsToUpload, setDocsToUpload] = useState<DocsToUpload>({
    photo: [],
    video: [],
    document: [],
  });

  console.log("property", property);

  const handleSetValue = (field: string, value: any) => {
    setProperty((prevProperty) => ({
      ...prevProperty,
      [field]: value,
    }));
  };


  const handleSetTotalAskPrice = (field: string, value: string) => {
    if (field === "askPricePerSqft") {
      // console.log("inside askPricePerSqft");
      // console.log(field, value, "field and value");
      handleSetValue(field, value); 
    } else {
      // console.log("inside askTotalAskPrice");
      // console.log(field, value, "field and value");
      handleSetValue(field, value); 
    }
  };
  useEffect(() => {
    if (selectedPlace) {
      const mm = getMicromarketFromCoordinates(selectedPlace);

      setProperty((prevProperty) => ({
        ...prevProperty,
        nameOfTheProperty: selectedPlace.name,
        address: selectedPlace.address,
        mapLocation: selectedPlace.mapLocation,
        micromarket: mm,
        _geoloc: {
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
        },
      }));
    } else if (!selectedPlace) {
      setProperty((prevProperty) => ({
        ...prevProperty,
        nameOfTheProperty: null,
        address: null,
        mapLocation: null,
        micromarket: null,
        _geoloc: {
          lat: null,
          lng: null,
        },
      }));
    }
  }, [selectedPlace]);

  const getFormComponents = () => {
    const components =
      assetTypes?.[property?.assetType as keyof typeof assetTypes] || [];

    // Add an id property if not present
    return components.map((component: any, index: any) => ({
      ...component,
      id: `${component.field}-${index}`,
      required: property?.assetType
        ? compulsoryFields[
            property.assetType as keyof typeof compulsoryFields
          ]?.includes(component.field)
        : false,
    }));
  };

  const renderComponent = (component: any) => {
    switch (component.type) {
      case "radioSelect":
        return (
          <RadioButtonSelect
            value={property[component.field]}
            setvalue={(value: any) => handleSetValue(component.field, value)}
            title={component.label}
            options={component.options}
            required={component.required}
          />
        );
      case "slider":
        return (
          <SliderButtonSelect
            value={property[component.field]}
            setvalue={(value) => handleSetValue(component.field, value)}
            title={component.label}
            options={component.options}
            required={component.required}
          />
        );
      case "textInput":
        return (
          <TextInputField
            value={property[component.field]}
            setValue={(value: any) => handleSetValue(component.field, value)}
            title={component.label}
            suffix={component.suffix}
            placeholder={component.placeholder}
            required={component.required}
            keyboardType={component.keyboardType}
          />
        );
      case "Dropdown":
        return (
          <DropdownSelect
            value={property[component.field]}
            setValue={(value) => handleSetValue(component.field, value)}
            title={component.label}
            options={component.option}
            required={component.required}
            searchable={component.searchable}
          />
        );
      case "Checkbox":
        return (
          <Checkbox
            checked={property[component.field]}
            setChecked={(checked) => handleSetValue(component.field, checked)}
            title={component.label}
            required={component.required}
          />
        );
      case "MonthYearPicker":
        return (
          <MonthYearPicker
            value={property[component.field]}
            setValue={(value) => handleSetValue(component.field, value)}
            title={component.label}
            required={component.required}
          />
        );
      case "TotalAskPrice":
        return (
          <TotalAskPrice
            initialPrice={property[component.field]}
            onPriceChange={(field, value) =>
              handleSetTotalAskPrice(field, value)
            }
            title={component.label}
            required={component.required}
          />
        );
      case "ExtraDetails":
        return (
          <ExtraDetailsField
            value={property[component.field]}
            setValue={(value) => handleSetValue(component.field, value)}
            required={component.required}
          />
        );

      default:
        return null;
    }
  };

  // Instead of using FlatList, let's organize the components into rows
  const renderFormComponents = () => {
    const components = getFormComponents();
    const rows = [];
    let currentRow: any = [];
    let currentWidth = 0;

    components.forEach((component: any) => {
      const width = component.colspan === 2 ? 2 : 1;

      // If adding this component would exceed the row width (2), start a new row
      if (currentWidth + width > 2) {
        rows.push([...currentRow]);
        currentRow = [component];
        currentWidth = width;
      } else {
        currentRow.push(component);
        currentWidth += width;
      }
    });

    // Add the last row if it's not empty
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return (
      <View style={styles.formContainer}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.formRow}>
            {row.map((component: any) => (
              <View
                key={component.id}
                style={[
                  styles.gridItem,
                  component.colspan === 2
                    ? styles.fullWidthItem
                    : styles.halfWidthItem,
                ]}
              >
                {renderComponent(component)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <PlacesSearch
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
        />

        <AssetTypeSelection
          selectedAsset={property.assetType}
          setSelectedAsset={(value) => handleSetValue("assetType", value)}
        />

        {renderFormComponents()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    // backgroundColor: "#F5F6F7",
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: "100%",
  },
  container: {
    flex: 1,
    gap: 16,
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
  },
  gridItem: {
    // backgroundColor: "#aaffaa",
  },
  fullWidthItem: {
    flex: 2,
  },
  halfWidthItem: {
    flex: 1,
    maxWidth: "48%",
  },
});

export default AddInventoryForm;
