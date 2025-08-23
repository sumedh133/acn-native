import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DocsToUpload,
  FileObject,
  IdGenerationResult,
  ListingProperty,
  Places,
  UploadedFileUrls,
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
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { areasData } from "../helpers/areasData";
import { handleIdGeneration } from "../helpers/nextId";
import { getUnixDateTime } from "../helpers/getUnixDateTime";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import storage from "@react-native-firebase/storage";
import SaveAsDraft from "../modals/SaveAsDraft";
import { useBackToSaveDraft } from "@/hooks/useBackToSaveDraft";
import MultiSelectSlider from "../components/Listing/MuliSelectSliderButton";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

const API_URL = "https://uploadtodrive-ouurm6pska-uc.a.run.app";

const initialState: ListingProperty = {
  _geoloc: {
    lat: 0,
    lng: 0,
  },
  id: "",
  address: null,
  ageOfInventory: 0,
  agentName: null,
  agentPhoneNumber: null,
  ageOfStatus: 0,
  area: null,
  askPricePerSqft: 0,
  assetType: null,
  builerName: null,
  builderCategory: null,
  builderName: null,
  biappaApproved: false,
  bdaApproved: false,
  buildingAge: null,
  buildingKhata: null,
  carPark: null,
  carpet: null,
  communityType: null,
  cornerUnit: false,
  cpId: null,
  currentStatus: null,
  dateOfInventoryAdded: 0,
  dateOfStatusLastChecked: 0,
  driveLink: null,
  eKhata: false,
  exactFloor: null,
  extraRoom: null,
  exclusive: false,
  extraDetails: null,
  facing: null,
  floorNo: null,
  furnishing: null,
  handoverDate: null,
  balconyFacing: null,
  kamId: null,
  kamStatus: null,
  landKhata: null,
  mapLocation: null,
  micromarket: null,
  propertyName: null,
  noOfBalconies: null,
  noOfBathrooms: null,
  ocReceived: false,
  plotFacing: null,
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
  const getUploadedDocObjects = useCallback(
    async (parsedItem: ListingProperty): Promise<DocsToUpload> => {
      const returnValue: DocsToUpload = {
        photo: [],
        video: [],
        document: [],
      };
      if (!parsedItem?.propertyId) return returnValue;

      const storagePathPhoto = `media-files/${parsedItem.propertyId}/photo`;
      const referencePhoto = storage().ref(storagePathPhoto);
      if (parsedItem.photo) {
        for (let i = 0; i < parsedItem.photo?.length; i++) {
          const photoUri = parsedItem.photo[i];
          const fileName = photoUri.split("/").at(-1)?.split("?").at(0);
          if (!fileName) continue;
          const fileref = referencePhoto.child(fileName);
          const fileMetadata = await fileref.getMetadata();
          const fileUrl = await fileref.getDownloadURL();
          returnValue.photo.push({
            firebaseUri: fileUrl,
            name: fileName.slice(14),
            size: fileMetadata.size,
          });
        }
      }
      const storagePathVideo = `media-files/${parsedItem.propertyId}/video`;
      const referenceVideo = storage().ref(storagePathVideo);
      if (parsedItem.video) {
        for (let i = 0; i < parsedItem.video?.length; i++) {
          const videoUri = parsedItem.video[i];
          const fileName = videoUri.split("/").at(-1)?.split("?").at(0);
          if (!fileName) continue;
          const fileref = referenceVideo.child(fileName);
          const fileMetadata = await fileref.getMetadata();
          const fileUrl = await fileref.getDownloadURL();
          returnValue.video.push({
            firebaseUri: fileUrl,
            name: fileName.slice(14),
            size: fileMetadata.size,
          });
        }
      }
      const storagePathDocument = `media-files/${parsedItem.propertyId}/document`;
      const referenceDocument = storage().ref(storagePathDocument);
      if (parsedItem.document) {
        for (let i = 0; i < parsedItem.document?.length; i++) {
          const documentUri = parsedItem.document[i];
          const fileName = documentUri.split("/").at(-1)?.split("?").at(0);
          if (!fileName) continue;
          const fileref = referenceDocument.child(fileName);
          const fileMetadata = await fileref.getMetadata();
          const fileUrl = await fileref.getDownloadURL();
          returnValue.document.push({
            firebaseUri: fileUrl,
            name: fileName.slice(14),
            size: fileMetadata.size,
          });
        }
      }
      setDocsToUpload(returnValue);
      return returnValue;
    },
    []
  );

  const { item } = useLocalSearchParams();
  const parsedItem = React.useMemo(() => {
    if (item) {
      const parsedData = JSON.parse(item as string) as ListingProperty;
      getUploadedDocObjects(parsedData);
      return parsedData;
    }
    return null;
  }, [item, getUploadedDocObjects]);

  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
  const [property, setProperty] = useState<ListingProperty>(
    parsedItem ?? initialState
  );
  const [assetProperty, setAssetProperty] = useState<{
    [key: string]: { property: ListingProperty; docs: DocsToUpload };
  }>({});
  const [grayed, setGrayed] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [docsToUpload, setDocsToUpload] = useState<DocsToUpload>({
    photo: [],
    video: [],
    document: [],
  });
  const [isRendered, setIsRendered] = useState(false);
  const [emptyState, setEmptyState] = useState(true);

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const agentData = useSelector((state: RootState) => state.agent.docData);

  const [saveAsDraftModalVisible, setSaveAsDraftModalVisible] = useState(false);

  // Add userType selector
  const userType = useSelector(
    (state: RootState) => state.agent.docData?.userType || "free"
  );

  // New state to track if the form has any data filled
  const isFormEmpty = useMemo(() => {
    // Check if property has any non-default values
    for (const key in property) {
      if (key === "_geoloc") {
        if (
          property._geoloc?.lat !== initialState._geoloc?.lat ||
          property._geoloc?.lng !== initialState._geoloc?.lng
        ) {
          return false;
        }
      } else if (
        key in property &&
        Array.isArray(property[key as keyof ListingProperty])
      ) {
        if ((property[key as keyof ListingProperty] as unknown[]).length > 0) {
          return false;
        }
      } else if (
        property[key as keyof ListingProperty] !==
        initialState[key as keyof ListingProperty]
      ) {
        return false;
      }
    }

    // Check if there are any documents to upload
    if (
      docsToUpload.photo.length > 0 ||
      docsToUpload.video.length > 0 ||
      docsToUpload.document.length > 0
    ) {
      return false;
    }

    return true;
  }, [property, docsToUpload]);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "add_inventory_page_view", {
        event_category: "inventory",
        event_label: "page_view",
        is_edit_mode: !!parsedItem,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [parsedItem, userType]);

  const handleSetValue = (field: keyof ListingProperty, value: any) => {
    try {
      logEvent(analytics, "inventory_field_update", {
        event_category: "inventory",
        event_label: "field_update",
        field_name: field,
        asset_type: property.assetType || "not_selected",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging field update:", error);
    }

    setGrayed(false);
    setProperty((prevProperty) => ({
      ...prevProperty,
      [field]: value,
    }));
  };

  const handleSetValueMultiSelect = (
    field: keyof ListingProperty,
    value: string[]
  ) => {
    setProperty((prevProperty) => ({
      ...prevProperty,
      [field]: value,
    }));
    console.log(value, "This is value from function");
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
    const key = component.field as keyof ListingProperty;
    switch (component.type) {
      case "radioSelect":
        return (
          <RadioButtonSelect
            value={property[key] as string | null}
            setvalue={(value: any) => handleSetValue(component.field, value)}
            title={component.label}
            options={component.options}
            required={component.required}
            disable={
              property.assetType === "Independent Building" &&
              component.field === "communityType"
            }
          />
        );
      case "multiSelectSlider":
        return (
          <MultiSelectSlider
            value={(property[key] as string[]) || []}
            setvalue={(value: string[]) =>
              handleSetValueMultiSelect(component.field, value)
            }
            title={component.label}
            options={component.options}
            required={component.required}
            footer=""
          />
        );
      case "slider":
        if (component.field === "buildingAge") {
          if (!!property.currentStatus) {
            return (
              <SliderButtonSelect
                value={property[key] as string | null}
                setvalue={(value) => handleSetValue(component.field, value)}
                title={component.label}
                options={component.options}
                required={component.required}
                footer={component.footer}
              />
            );
          } else {
            return <></>;
          }
        } else {
          return (
            <SliderButtonSelect
              value={property[key] as string | null}
              setvalue={(value) => handleSetValue(component.field, value)}
              title={component.label}
              options={component.options}
              required={component.required}
              footer={component.footer}
            />
          );
        }
      case "textInput":
        return (
          <TextInputField
            value={property[key] as string | null}
            setValue={(value: any) => handleSetValue(component.field, value)}
            title={component.label}
            prefix={component.prefix}
            suffix={component.suffix}
            placeholder={component.placeholder}
            required={component.required}
            keyboardType={component.keyboardType}
            numberToStringFooter={component.numberToStringFooter}
            footer={component.footer}
          />
        );
      case "Dropdown":
        return (
          <DropdownSelect
            value={property[key] as string | null}
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
            checked={property[key] as boolean}
            setChecked={(checked) => handleSetValue(component.field, checked)}
            title={component.label}
            required={component.required}
          />
        );
      case "MonthYearPicker":
        return (
          <MonthYearPicker
            value={property[key] as string}
            setValue={(value) => handleSetValue(component.field, value)}
            title={component.label}
            required={component.required}
            disabled={!!property.currentStatus}
          />
        );
      case "TotalAskPrice":
        return (
          <TotalAskPrice
            initialPrice={property[key] as number | undefined}
            onPriceChange={(field, value) =>
              handleSetValue(field as keyof ListingProperty, value)
            }
            title={component.label}
            required={component.required}
          />
        );
      case "ExtraDetails":
        return (
          <ExtraDetailsField
            value={property[key] as string | null}
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
      case "Project Name":
        return (
          <View>
            <PlacesSearch
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              communityType={property.communityType}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const renderFormComponents = () => {
    const components = getFormComponents();
    const rows = [];
    let currentRow: any = [];
    let currentWidth = 0;

    components.forEach((component: any) => {
      const width = component.colspan === 2 ? 2 : 1;

      if (currentWidth + width > 2) {
        rows.push([...currentRow]);
        currentRow = [component];
        currentWidth = width;
      } else {
        currentRow.push(component);
        currentWidth += width;
      }
    });

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
    try {
      logEvent(analytics, "inventory_form_clear", {
        event_category: "inventory",
        event_label: "clear",
        asset_type: property.assetType || "not_selected",
        had_property_id: !!property.propertyId,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging form clear:", error);
    }

    setProperty({ ...initialState, propertyId: property.propertyId });
    setSelectedPlace(null);
    setDocsToUpload({
      photo: [],
      video: [],
      document: [],
    });
    setAssetProperty({});
    setGrayed(true);
  };

  const fieldLabels: { [K in keyof ListingProperty]?: string } = {
    propertyName:
      property.communityType === "Independent"
        ? "Nearby LandMark"
        : "Project Name",
    communityType: "Community Type",
    subType: "Apartment Type",
    sbua: "SBUA",
    totalAskPrice: "Total Ask Price",
    exactFloor: "Floor No.",
    facing: "Door Facing",
    unitType: "No. of Bedrooms",
    structure: "Structure",
    plotSize: "Plot Size",
  };

  const checkCompulsoryFields = () => {
    const assetType = property.assetType;

    // If assetType is not valid, return false
    if (!assetType || !(assetType in compulsoryFields)) {
      showErrorToast(`Missing field: Asset Type`);
      return false;
    }

    switch (assetType) {
      case "Apartment":
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Villa":
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Plot":
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Row House":
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Villament":
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Independent Building":
        // Check if any required field is null or empty
        for (let elem of compulsoryFields[assetType]) {
          if (elem === "handoverDate") {
            // If handoverDate is empty, set it to "NA"
            if (property.currentStatus === false) {
              const friendlyName = fieldLabels[elem] || elem;
              showErrorToast(`Missing field: ${friendlyName}`);
              return false;
            } else {
              property.handoverDate = 0;
              continue;
            }
          }
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`Missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      default:
        return false;
    }

    if (
      (property["totalAskPrice"] === null || property["totalAskPrice"] === 0) &&
      (property["askPricePerSqft"] === null ||
        property["askPricePerSqft"] === 0)
    ) {
      showErrorToast(`Missing field: Total Ask Price or Ask Price per Sqft`);
      return false;
    }

    return true;
  };

  // const getArea = () => {
  //   if (!property.micromarket || property.micromarket === "") {
  //     throw new Error(`micromarket is empty`);
  //   } else {
  //     const selectedArea = areasData.find((area) =>
  //       area.MicroMarkets.includes(property.micromarket || "")
  //     )?.Area;
  //     console.log("selectedArea", selectedArea);
  //     return "selectArea";
  //   }
  // };

  const getAskPrice = () => {
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

    return { askPricePerSqft, totalAskPrice: totalAskPrice };
  };

  const getFloor = () => {
    let val = property.exactFloor;
    if (!val) {
      return null;
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

  const getName = () => {
    if (property.communityType === "Gated") {
      return property.propertyName;
    } else if (property.assetType === "Independent Building") {
      return `${property.assetType} in ${property.micromarket}`;
    } else {
      return `Independent ${property.assetType} in ${property.micromarket}`;
    }
  };

  const parseHandoverDate = (handoverString: string): Date => {
    const [month, year] = handoverString
      .split("/")
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1);
  };

  const isUnderConstruction = (
    handoverDate: string | null | undefined
  ): boolean => {
    if (!handoverDate) return false;

    const parsedHandoverDate = parseHandoverDate(handoverDate);
    const currentDate = new Date();

    return parsedHandoverDate >= currentDate;
  };

  const getCurrentStatus = () => {
    const crStatus = property.currentStatus;
    const handover = property.handoverDate;

    if (crStatus) {
      return "Ready to move";
    } else if (handover && isUnderConstruction(handover.toString())) {
      return "Under Construction";
    } else {
      return "Unconfirmed";
    }
  };

  const getUnitType = () => {
    let unitType = property.unitType;
    if (property.extraRoom && property.unitType != "studio") {
      let unit = unitType?.split(" ");
      if (unit) {
        unit[0] += ".5";
      }
      unitType = unit?.join(" ") || null;
    }
    return unitType;
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

  const handleUploadToStorage = async (propId: string) => {
    const uploadedFileUrls: UploadedFileUrls = {
      photo: [],
      video: [],
      document: [],
    };
    const copyOfDocs = { ...docsToUpload };
    for (const [type, files] of Object.entries(copyOfDocs)) {
      for (const file of files) {
        if (file.firebaseUri) {
          uploadedFileUrls[type].push(file.firebaseUri);
          continue;
        }
        try {
          const uniqueFileName = `${Date.now()}-${file.name}`;
          const storagePath = `media-files/${propId}/${type}/${uniqueFileName}`;

          const reference = storage().ref(storagePath);

          const filePath = file.uri ? file.uri.replace("file://", "") : null;

          if (!filePath) {
            console.error(`File path not found for ${file.name}`);
            continue;
          }

          await reference.putFile(filePath);

          const downloadURL = await reference.getDownloadURL();

          uploadedFileUrls[type].push(downloadURL);
          file.firebaseUri = downloadURL;
        } catch (error: any) {
          console.error(`Failed to upload ${type} file (${file.name}):`, error);
          throw new Error(
            `Error uploading ${type} file (${file.name}): ${error.message}`
          );
        }
      }
    }
    setDocsToUpload(copyOfDocs);
    return uploadedFileUrls; // Return the URLs of uploaded files
  };

  const handleUploadToDrive = async (
    propId: string,
    uploadedFileUrls: UploadedFileUrls
  ) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propId, uploadedFileUrls }),
      });

      const data = await response.json();
      console.log("Google Drive Response:", data);
      return data.sharableFolderUrl;
    } catch (error: any) {
      console.error("Error sending to Google Drive:", error);
      throw new Error(`Error sending files to Google Drive: ${error.message}`);
    }
  };

  const handleSubmitButton = async () => {
    try {
      setSaving(true);

      // Track submission attempt
      logEvent(analytics, "inventory_submit_attempt", {
        event_category: "inventory",
        event_label: "submit",
        asset_type: property.assetType || "not_selected",
        is_edit_mode: !!parsedItem,
        has_photos: docsToUpload.photo.length > 0,
        has_videos: docsToUpload.video.length > 0,
        has_documents: docsToUpload.document.length > 0,
        user_type: userType,
      });

      console.log(property, "This is property");

      const areCompulsoryFieldsValid = checkCompulsoryFields();
      if (!areCompulsoryFieldsValid) {
        logEvent(analytics, "inventory_submit_error", {
          event_category: "inventory",
          event_label: "error",
          error_type: "missing_fields",
          asset_type: property.assetType || "not_selected",
          user_type: userType,
        });
        setSaving(false);
        return;
      }

      // const selectedArea = getArea();

      const { askPricePerSqft, totalAskPrice } = getAskPrice();

      const floorNo = getFloor();

      const propertyName = getName();

      const currentStatus = getCurrentStatus();

      const unitType = getUnitType();

      let propId = property.propertyId;
      if (!property.propertyId) {
        propId = await generateNextQcId();
      }
      if (!propId) {
        console.error("Error generating Property ID. Please try again later");
        showErrorToast("Error generating Property ID. Please try again later");
        setSaving(false);
        return;
      }

      const autoFields: Partial<ListingProperty> = {
        propertyId: propId,
        dateOfInventoryAdded: getUnixDateTime(),
        dateOfStatusLastChecked: getUnixDateTime(),
        cpId: agentData.cpId,
        agentName: agentData.name,
        agentPhoneNumber: agentData.phoneNumber,
        kamId: agentData.kamId,
        // area: selectedArea,
        askPricePerSqft,
        totalAskPrice,
        floorNo,
        propertyName,
        currentStatus,
        unitType: unitType,
        kamStatus: "pending",
        qcStatus: "pending",
        stage: "kam",
        status: "pending",
      };

      let uploadedFileUrls: UploadedFileUrls = {
        photo: [],
        video: [],
        document: [],
      };
      try {
        uploadedFileUrls = await handleUploadToStorage(propId);
      } catch (error) {
        console.error("Error uploading files to Firebase Storage:", error);
        showErrorToast("Error uploading files. Please try again.");
        setSaving(false);
        return;
      }

      let driveLink = null;
      if (
        uploadedFileUrls?.document?.length > 0 ||
        uploadedFileUrls?.photo?.length > 0 ||
        uploadedFileUrls?.video?.length > 0
      ) {
        try {
          driveLink = await handleUploadToDrive(propId, uploadedFileUrls);
        } catch (error) {
          console.error("Error uploading files to Drive:", error);
          showErrorToast("Error uploading files. Please try again.");
          setSaving(false);
          return;
        }
      }

      const dataToSave: ListingProperty = {
        ...property,
        ...autoFields,
        ...uploadedFileUrls,
        driveLink,
      };

      console.log("dataToSave", dataToSave);
      await setDoc(doc(db, "acnQCInventories", propId), dataToSave);
      console.log("Document successfully written with ID:", propId);
      showSuccessToast("Property sent for verification!");
      handleSetValue("propertyId", propId);
      router.dismissAll();
      router.replace("/(tabs)/dashboardTab");
      setSaving(false);

      // Track successful submission
      logEvent(analytics, "inventory_submit_success", {
        event_category: "inventory",
        event_label: "success",
        asset_type: property.assetType,
        property_id: propId,
        total_files:
          docsToUpload.photo.length +
          docsToUpload.video.length +
          docsToUpload.document.length,
        user_type: userType,
      });
      fetch(
        `https://acn-notification-server.onrender.com/notification/add-inventory`,
        {
          body: JSON.stringify({
            dataToSave,
          }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // Track submission failure
      logEvent(analytics, "inventory_submit_error", {
        event_category: "inventory",
        event_label: "error",
        error_type: "submission_failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        asset_type: property.assetType || "not_selected",
        user_type: userType,
      });
      console.log(error);
      setSaving(false);
      showErrorToast("Please fill all mandatory fields before submiting.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);

      // Track draft save attempt
      logEvent(analytics, "inventory_draft_save_attempt", {
        event_category: "inventory",
        event_label: "draft",
        asset_type: property.assetType || "not_selected",
        has_photos: docsToUpload.photo.length > 0,
        has_videos: docsToUpload.video.length > 0,
        has_documents: docsToUpload.document.length > 0,
        user_type: userType,
      });

      if (!property.assetType || !property.propertyName) {
        logEvent(analytics, "inventory_draft_error", {
          event_category: "inventory",
          event_label: "error",
          error_type: "missing_required_fields",
          user_type: userType,
        });
        showErrorToast("Asset Type and Name are necessary for draft.");
        setSavingDraft(false);
        return;
      }

      let propId = property.propertyId;
      if (!property.propertyId) {
        propId = await generateNextQcId();
      }
      if (!propId) {
        console.error("Error generating Property ID. Please try again later");
        showErrorToast("Error generating Property ID. Please try again later");
        setSaving(false);
        return;
      }

      const autoFields: Partial<ListingProperty> = {
        propertyId: propId,
        lastModified: getUnixDateTime(),
        cpId: agentData.cpId,
        status: "draft",
      };

      let uploadedFileUrls: UploadedFileUrls = {
        photo: [],
        video: [],
        document: [],
      };
      try {
        uploadedFileUrls = await handleUploadToStorage(propId);
      } catch (error) {
        console.error("Error uploading files to Firebase Storage:", error);
        showErrorToast("Error uploading files. Please try again.");
        setSaving(false);
        return;
      }

      let driveLink = null;
      if (
        uploadedFileUrls?.document?.length > 0 ||
        uploadedFileUrls?.photo?.length > 0 ||
        uploadedFileUrls?.video?.length > 0
      ) {
        try {
          driveLink = await handleUploadToDrive(propId, uploadedFileUrls);
        } catch (error) {
          console.error("Error uploading files to Drive:", error);
          showErrorToast("Error uploading files. Please try again.");
          setSaving(false);
          return;
        }
      }

      const dataToSave: ListingProperty = {
        ...property,
        ...autoFields,
        ...uploadedFileUrls,
        driveLink,
      };
      console.log(property);

      await setDoc(doc(db, "acnQCInventories", propId), dataToSave);
      showSuccessToast("Property saved as draft successfully!");
      handleSetValue("propertyId", propId);
      setSavingDraft(false);

      // Track successful draft save
      logEvent(analytics, "inventory_draft_success", {
        event_category: "inventory",
        event_label: "success",
        asset_type: property.assetType,
        property_id: propId,
        total_files:
          docsToUpload.photo.length +
          docsToUpload.video.length +
          docsToUpload.document.length,
        user_type: userType,
      });
    } catch (error) {
      // Track draft save failure
      logEvent(analytics, "inventory_draft_error", {
        event_category: "inventory",
        event_label: "error",
        error_type: "save_failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        asset_type: property.assetType || "not_selected",
        user_type: userType,
      });
      console.error("An unexpected error occurred during submission:", error);
      showErrorToast("An unexpected error occurred during submission");
      setSavingDraft(false);
    }
    router.back();
  };

  const handleChangeAssetType = (value: string) => {
    try {
      logEvent(analytics, "asset_type_change", {
        event_category: "inventory",
        event_label: "asset_type",
        previous_type: property.assetType || "none",
        new_type: value,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging asset type change:", error);
    }

    setAssetProperty((prev) => {
      if (property.assetType)
        return {
          ...prev,
          [property.assetType]: { property: property, docs: docsToUpload },
        };
      else return prev;
    });
    if (assetProperty?.[value]) {
      setProperty(assetProperty?.[value]?.property);
      setDocsToUpload(assetProperty?.[value]?.docs);
    } else {
      setProperty((prev) => ({
        ...initialState,
        propertyName: prev.propertyName,
        address: prev.address,
        mapLocation: prev.mapLocation,
        micromarket: prev.micromarket,
        area: prev.area,
        _geoloc: prev?._geoloc
          ? {
              lat: prev?._geoloc?.lat || null,
              lng: prev?._geoloc?.lng || null,
            }
          : initialState._geoloc,
        assetType: value,
        communityType: value === "Independent Building" ? "Independent" : null,
        propertyId: prev?.propertyId ?? null,
      }));
      setDocsToUpload({ photo: [], video: [], document: [] });
    }
    setGrayed(false);
  };

  useEffect(() => {
    if (selectedPlace) {
      const mm = getMicromarketFromCoordinates(selectedPlace);

      setProperty((prevProperty) => ({
        ...prevProperty,
        propertyName: selectedPlace.name,
        address: selectedPlace.address,
        mapLocation: selectedPlace.mapLocation,
        micromarket: mm[0],
        area: mm[1],
        _geoloc: {
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
        },
      }));
      setIsNew(false);
    } else if (!selectedPlace && property.propertyName && item && isNew) {
      setSelectedPlace({
        name: property?.propertyName,
        lat: property?._geoloc?.lat || null,
        lng: property?._geoloc?.lng || null,
        address: property?.address || null,
        mapLocation: property?.mapLocation || null,
      });
      setIsNew(false);
    } else {
      setProperty((prevProperty) => ({
        ...prevProperty,
        propertyName: null,
        address: null,
        mapLocation: null,
        micromarket: null,
        _geoloc: {
          lat: null,
          lng: null,
        },
      }));
      setIsNew(false);
    }
  }, [selectedPlace]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRendered(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    // Back button handler
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Only handle back press when the form is visible
        if (
          !saveAsDraftModalVisible &&
          property.assetType &&
          property.propertyName
        ) {
          setSaveAsDraftModalVisible(true);
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior when modal is showing
      }
    );

    return () => backHandler.remove();
  }, [saveAsDraftModalVisible, property]);

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
            <TouchableOpacity
              onPress={() => {
                if (property.assetType && property.propertyName)
                  setSaveAsDraftModalVisible(true);
                else router.back();
              }}
            >
              <ArrowLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle} className="text-red-200">Add Property</Text>
          </View>

          <TouchableOpacity style={styles.headerRight} onPress={handleClear}>
            {grayed ? (
              <Text style={styles.clearTextGrayed}>Clear</Text>
            ) : (
              <Text style={styles.clearText}>Clear</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <AssetTypeSelection
            selectedAsset={property.assetType}
            setSelectedAsset={(value) => {
              handleChangeAssetType(value);
            }}
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
            <ActivityIndicator size={"small"} color={"#153E3B"} />
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
      <SaveAsDraft
        visible={saveAsDraftModalVisible}
        onClose={() => setSaveAsDraftModalVisible(false)}
        handleSaveDraft={handleSaveDraft}
        isSaving={savingDraft}
      />
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
  clearTextGrayed: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    color: "#9E9E9E",
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
  disabledSaveAsDraftButton: {
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
    backgroundColor: "FAFAFA",
  },
  secondaryButtonText: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#153E3B",
  },
  disabledSaveAsDraft: {
    fontFamily: "sans-serif",
    fontWeight: "bold",
    fontSize: 14,
    color: "#9E9E9E",
  },
});

export default AddInventoryForm;
