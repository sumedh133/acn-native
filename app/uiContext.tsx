import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  showNewEnquiryPopup: boolean;
  setShowNewEnquiryPopup: (value: boolean) => void;
  storedCount: number;
  setStoredCount: (value: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [showNewEnquiryPopup, setShowNewEnquiryPopup] = useState<boolean>(false);
  const [storedCount, setStoredCount] = useState<number>(0);

  return (
    <UIContext.Provider
      value={{ showNewEnquiryPopup, setShowNewEnquiryPopup, storedCount, setStoredCount }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};
