import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
  StatusUpdateEvent,
} from "sp-react-native-in-app-updates";
import { Platform } from "react-native";
import { useState } from "react";

// State should be defined inside a component or a custom hook
const useAppUpdate = () => {
  const checkForUpdate = async () => {
    const inAppUpdates = new SpInAppUpdates(false); // isDebug

    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        const updateOptions: StartUpdateOptions =
          Platform.OS === "android"
            ? {
                updateType: IAUUpdateKind.IMMEDIATE,
              }
            : {
                title: "Update available",
                message:
                  "There is a new version of the app available on the App Store, do you want to update it?",
                buttonUpgradeText: "Update",
                forceUpgrade: true,
              };

        if (Platform.OS === "android") {
          const statusUpdateListener = (downloadStatus: StatusUpdateEvent) => {
            if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
              inAppUpdates.installUpdate();
              inAppUpdates.removeStatusUpdateListener(statusUpdateListener);
              // setUpdateAvailable(false);
            }
          };
          inAppUpdates.addStatusUpdateListener(statusUpdateListener);
        }
        await inAppUpdates.startUpdate(updateOptions);
      }
    } catch (error) {
      console.error("Update check failed:", error);
    }
  };

  return { checkForUpdate };
};

export default useAppUpdate;
