import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import {
  DocsToUpload,
  IdGenerationResult,
  ListingProperty,
  Places,
} from "../types";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { router } from "expo-router";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { areasData } from "../helpers/areasData";
import { handleIdGeneration } from "../helpers/nextId";
import { getUnixDateTime } from "../helpers/getUnixDateTime";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const initialState: ListingProperty = {
  _geoloc: {
    lat: null,
    lng: null,
  },
  address: null,
  ageOfInventory: 0,
  ageOfStatus: 0,
  area: null,
  askPricePerSqft: null,
  assetType: null,
  biappaApproved: false,
  bdaApproved: false,
  buildingAge: null,
  buildingKhata: null,
  carPark: null,
  carpet: null,
  communityType: null,
  cornerUnit: false,
  cpCode: null,
  currentStatus: null,
  dateOfInventoryAdded: null,
  dateOfStatusLastChecked: null,
  driveLink: null,
  eKhata: false,
  exactFloor: null,
  exclusive: false,
  extraDetails: null,
  facing: null,
  floorNo: null,
  furnishing: null,
  handoverDate: null,
  insideOutside: null,
  kamId: null,
  kamStatus: null,
  landKhata: null,
  mapLocation: null,
  micromarket: null,
  nameOfTheProperty: null,
  noOfBalconies: null,
  noOfBathrooms: null,
  ocReceived: false,
  plotSize: null,
  propertyId: null,
  qcStatus: null,
  rentalIncome: null,
  sbua: null,
  stage: null, //stage
  status: null,
  structure: null,
  subType: null,
  tenanted: false,
  totalAskPrice: null,
  uds: null,
  unitNo: null,
  unitType: null,
  photo: [],
  video: [],
  document: [],
};

const AddInventoryForm = () => {
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
  const [property, setProperty] = useState<ListingProperty>(initialState);
  const [docsToUpload, setDocsToUpload] = useState<DocsToUpload>({
    photo: [],
    video: [],
    document: [],
  });
  const [isRendered, setIsRendered] = useState(false);

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const agentData = useSelector((state: RootState) => state.agent.docData);

  const handleSetValue = (field: string, value: any) => {
    setProperty((prevProperty) => ({
      ...prevProperty,
      [field]: value,
    }));
  };

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
            prefix={component.prefix}
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
            onPriceChange={(field, value) => handleSetValue(field, value)}
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
      case "Document":
        return (
          <Document
            setDocsToUpload={setDocsToUpload}
            docsToUpload={docsToUpload}
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

  const handleClear = () => {
    setProperty(initialState);
    setSelectedPlace(null);
    setDocsToUpload({
      photo: [],
      video: [],
      document: [],
    });
  };

  const checkCompulsoryFields = () => {
    return true;
  };

  const findArea = () => {
    if (!property.micromarket || property.micromarket === "") {
      throw new Error(`micromarket is empty`);
    } else {
      const selectedArea = areasData.find((area) =>
        area.MicroMarkets.includes(property.micromarket || "")
      )?.Area;
      console.log("selectedArea", selectedArea);
      return selectedArea;
    }
  };

  const findAskPrice = () => {
    let askPricePerSqft = property.askPricePerSqft || 0;
    let totalAskPrice = property.totalAskPrice || 0;

    if (askPricePerSqft != 0) {
      if (property.assetType === "Plot") {
        totalAskPrice = askPricePerSqft * (property?.plotSize ?? 0);
      } else {
        totalAskPrice = askPricePerSqft * (property?.sbua ?? 0);
      }
    } else if (totalAskPrice != 0) {
      if (property.assetType === "Plot") {
        askPricePerSqft = parseInt(
          (totalAskPrice / (property?.plotSize ?? 0)).toFixed(0)
        );
      } else {
        askPricePerSqft = parseInt(
          (totalAskPrice / (property?.sbua ?? 0)).toFixed(0)
        );
      }
    } else {
      throw new Error(`ask price is empty`);
    }

    return { askPricePerSqft, totalAskPrice };
  };

  const findFloor = () => {
    let val = property.exactFloor;
    if (!val) {
      throw new Error(`exactFloor is empty`);
    }

    if (val === 0) {
      return "Ground Floor";
    } else if (val <= 5) {
      return "Lower Floor (1-5)";
    } else if (val <= 10) {
      return "Middle Floor (6-10)";
    } else if (val <= 20) {
      return "Higher Floor (10+)";
    } else {
      return "Higher Floor (20+)";
    }
  };

  const generateNextQcId = async (): Promise<string | null> => {
    try {
      const type = "lastQcId"; // Replace with "lastCpId" or others as needed
      const result = (await handleIdGeneration(type)) as IdGenerationResult;
      return result.nextId;
    } catch (error) {
      console.error("Error generating IDs:", error);
      return null;
    }
  };

  const handleSubmitButton = async () => {
    // // this is for apartment
    // // property.address                  // places API
    // // property.ageOfInventory; // 0
    // // property.ageOfStatus; // 0
    // // property.area; // places API
    // // property.askPricePerSqft; // from totalAskPrice or vica versa
    // // property.buildingAge; // input
    // // property.cpCode; // agentSlice
    // // property.dateOfInventoryAdded; //unixtimestamp
    // // property.dateOfStatusLastChecked; // unixtimestamp
    // property.driveLink; // from generate functiom
    // // property.floorNo; // from exactFloor No
    // // property.kamId; // from Kam DB according to the agent from the cpCode
    // // property.kamStatus; // unnder verifcation
    // // property.mapLocation              // places API
    // // property.micromarket              // places API
    // // property.nameOfTheProperty        //places API
    // // property.plotSize; // input
    // // property.propertyId; // QC___ function
    // // property.qcStatus; // with Kam
    // // property.stage; // kam
    // // property.status; // under Verifcation
    // // property.structure; // input

    try {
      setSaving(true);

      const areCompulsoryFieldsValid = checkCompulsoryFields();
      if (!areCompulsoryFieldsValid) {
        console.error("Compulsory fields are missing or invalid");
        showErrorToast("Compulsory fields are missing or invalid");
        setSaving(false);
        return;
      }

      const selectedArea = findArea();

      const { askPricePerSqft, totalAskPrice } = findAskPrice();

      const floorNo = findFloor();

      const propId = await generateNextQcId();
      if (!propId) {
        console.error("Error generating Property ID. Please try again later");
        showErrorToast("Error generating Property ID. Please try again later");
        setSaving(false);
        return;
      }

      const autoFields = {
        propertyId: propId,
        dateOfInventoryAdded: getUnixDateTime(),
        dateOfStatusLastChecked: getUnixDateTime(),
        cpCode: agentData.cpId,
        kamId: agentData.kam,
        area: selectedArea,
        askPricePerSqft,
        totalAskPrice,
        floorNo,
        kamStatus: "Under Verification",
        qcStatus: "Under Verification",
        stage: "kam",
        status: "Under Verification",
      };

      const dataToSave = {
        ...property,
        ...autoFields,
        // ...uploadedFileUrls,
        // driveLink,
      };

      await setDoc(doc(db, "QC_Inventories", propId), dataToSave);
      console.log("Document successfully written with ID:", propId);
      showSuccessToast("Property added successfully!");
      handleClear();
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
      showErrorToast("Please fill all mandatory fields before submiting.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);

      if (!property.assetType || !property.nameOfTheProperty) {
        console.error("Asset Type or Name, missing or invalid.");
        showErrorToast("Asset Type and Name are necessary for draft.");
        setSavingDraft(false);
        return;
      }

      const autoFields = {
        lastModified: getUnixDateTime(),
        cpCode: agentData.cpId,
        status: "draft",
      };

      const dataToSave = {
        ...property,
        ...autoFields,
        // ...uploadedFileUrls,
        // driveLink,
      };

      await setDoc(doc(collection(db, "QC_Inventories")), dataToSave);

      showSuccessToast("Property added successfully!");
      handleClear();
      setSavingDraft(false);
    } catch (error) {
      console.error("An unexpected error occurred during submission:", error);
      showErrorToast("An unexpected error occurred during submission");
      setSavingDraft(false);
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

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRendered(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isConnectedToInternet) return <Offline />;

  if (!isRendered)
    return (
      <ActivityIndicator
        style={{ margin: "auto" }}
        size="large"
        color="#153E3B"
      />
    );

  return (
    <View style={styles.mainView}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Inventory</Text>
          </View>

          <TouchableOpacity style={styles.headerRight} onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSaveDraft}
          disabled={saving || savingDraft}
        >
          {savingDraft ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={styles.secondaryButtonText}>Save as Draft</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmitButton}
          disabled={saving || savingDraft}
        >
          {saving ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#fff",
    width: "100%",
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16, // Add margin from hamburger icon
  },
  headerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  clearText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    color: "#D92D20",
  },
  scrollContent: {
    // backgroundColor: "#F5F6F7",
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  footer: {
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#CCCBCB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  primaryButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    borderWidth: 1.25,
    borderRadius: 4,
    // paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
  },
  primaryButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#FAFBFC",
  },
  secondaryButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    borderWidth: 1.25,
    borderRadius: 4,
    // paddingVertical: 8,
    paddingHorizontal: 32,
    borderColor: "#153E3B",
  },
  secondaryButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#153E3B",
  },
});

export default AddInventoryForm;
