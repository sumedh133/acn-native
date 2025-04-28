import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useCallback, useEffect, useState } from "react";
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
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { areasData } from "../helpers/areasData";
import { handleIdGeneration } from "../helpers/nextId";
import { getUnixDateTime } from "../helpers/getUnixDateTime";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import storage from "@react-native-firebase/storage";

const API_URL = "https://uploadtodrive-ouurm6pska-uc.a.run.app";

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
  balconyFacing: null,
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
    [key: string]: ListingProperty;
  }>({});
  const [isNew, setIsNew] = useState(true);
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

  const handleSetValue = (field: keyof ListingProperty, value: any) => {
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
      case "slider":
        return (
          <SliderButtonSelect
            value={property[key] as string | null}
            setvalue={(value) => handleSetValue(component.field, value)}
            title={component.label}
            options={component.options}
            required={component.required}
          />
        );
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
          />
        );
      case "TotalAskPrice":
        return (
          <TotalAskPrice
            initialPrice={property[key] as string | undefined}
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
    setProperty({ ...initialState, propertyId: property.propertyId });
    setSelectedPlace(null);
    setDocsToUpload({
      photo: [],
      video: [],
      document: [],
    });
    setAssetProperty({});
  };

  const fieldLabels: { [key in keyof ListingProperty]: string } = {
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
      return false;
    }

    switch (assetType) {
      case "Apartment":
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Villa":
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Plot":
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Row House":
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Villament":
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      case "Independent Building":
        // Check if any required field is null or empty
        for (let elem of compulsoryFields[assetType]) {
          console.log(elem);
          if (property[elem] === null || property[elem] === "") {
            const friendlyName = fieldLabels[elem] || elem;
            showErrorToast(`missing field: ${friendlyName}`);
            return false;
          }
        }
        break;
      default:
        return false;
    }

    return true;
  };

  const getArea = () => {
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

    return { askPricePerSqft, totalAskPrice };
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
      return property.nameOfTheProperty;
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
    } else if (isUnderConstruction(handover)) {
      return "Under Construction";
    } else {
      return "Unconfirmed";
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

      const areCompulsoryFieldsValid = checkCompulsoryFields();
      if (!areCompulsoryFieldsValid) {
        console.error("Compulsory fields are missing or invalid");
        showErrorToast("Compulsory fields are missing or invalid");
        setSaving(false);
        return;
      }

      const selectedArea = getArea();

      const { askPricePerSqft, totalAskPrice } = getAskPrice();

      const floorNo = getFloor();

      const nameOfTheProperty = getName();

      const currentStatus = getCurrentStatus();

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

      const autoFields: ListingProperty = {
        propertyId: propId,
        dateOfInventoryAdded: getUnixDateTime(),
        dateOfStatusLastChecked: getUnixDateTime(),
        cpCode: agentData.cpId,
        kamId: agentData.kam,
        area: selectedArea,
        askPricePerSqft,
        totalAskPrice,
        floorNo,
        nameOfTheProperty,
        currentStatus,
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
      await setDoc(doc(db, "QC_Inventories", propId), dataToSave);
      console.log("Document successfully written with ID:", propId);
      showSuccessToast("Property added successfully!");
      handleSetValue("propertyId", propId);
      router.dismissAll();
      router.replace("/(tabs)/dashboardTab");
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

      const autoFields: ListingProperty = {
        propertyId: propId,
        lastModified: getUnixDateTime(),
        cpCode: agentData.cpId,
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

      await setDoc(doc(db, "QC_Inventories", propId), dataToSave);
      showSuccessToast("Property added successfully!");
      handleSetValue("propertyId", propId);
      setSavingDraft(false);
    } catch (error) {
      console.error("An unexpected error occurred during submission:", error);
      showErrorToast("An unexpected error occurred during submission");
      setSavingDraft(false);
    }
  };

  const handleChangeAssetType = (value: string) => {
    setAssetProperty((prev) => {
      if (property.assetType)
        return { ...prev, [property.assetType]: property };
      else return prev;
    });
    if (assetProperty?.[value]) {
      setProperty(assetProperty?.[value]);
    } else {
      setProperty((prev) => ({
        ...initialState,
        nameOfTheProperty: prev.nameOfTheProperty,
        address: prev.address,
        mapLocation: prev.mapLocation,
        micromarket: prev.micromarket,
        _geoloc: prev?._geoloc
          ? {
              lat: prev?._geoloc?.lat || null,
              lng: prev?._geoloc?.lng || null,
            }
          : initialState._geoloc,
        assetType: value,
        communityType: value === "Independent Building" ? "Independent" : null,
      }));
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
      setIsNew(false);
    } else if (!selectedPlace && property.nameOfTheProperty && item && isNew) {
      setSelectedPlace({
        name: property?.nameOfTheProperty,
        lat: property?._geoloc?.lat || null,
        lng: property?._geoloc?.lng || null,
        address: property?.address || null,
        mapLocation: property?.mapLocation || null,
      });
      setIsNew(false);
    } else {
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
      setIsNew(false);
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
