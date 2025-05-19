import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
  StatusUpdateEvent,
} from "sp-react-native-in-app-updates";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useRef } from "react";

// State should be defined inside a component or a custom hook
const useAppUpdate = () => {
  const alreadyPromptedOnce = useRef(false);
  const checkForUpdate = async () => {
    const inAppUpdates = new SpInAppUpdates(false); // isDebug
    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        let mustForce = true;
        if (Platform.OS === "android" && "versionCode" in result.other) {
          const gap =
            (result.other?.versionCode ?? 0) -
            Number(DeviceInfo.getBuildNumber());
          mustForce = (result.other?.updatePriority ?? 0) >= 4 || gap >= 3;
        }
        const updateOptions: StartUpdateOptions =
          Platform.OS === "android"
            ? {
                updateType: mustForce
                  ? IAUUpdateKind.IMMEDIATE
                  : IAUUpdateKind.FLEXIBLE,
              }
            : {
                title: "Update available",
                message:
                  "There is a new version of the app available on the App Store, do you want to update it?",
                buttonUpgradeText: "Update",
                forceUpgrade: true,
              };
        const toUpdate = mustForce || !alreadyPromptedOnce.current;
        if (Platform.OS === "android" && toUpdate) {
          const statusUpdateListener = (downloadStatus: StatusUpdateEvent) => {
            if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
              inAppUpdates.installUpdate();
              inAppUpdates.removeStatusUpdateListener(statusUpdateListener);
            }
          };
          inAppUpdates.addStatusUpdateListener(statusUpdateListener);
        }
        if (toUpdate) {
          if (!mustForce) alreadyPromptedOnce.current = true;
          await inAppUpdates.startUpdate(updateOptions);
        }
      }
    } catch (error) {
      console.error("Update check failed:", error);
    }
  };

  return { checkForUpdate, alreadyPromptedOnce };
};

export default useAppUpdate;
