import { View, Text } from "react-native";
import { MobileHits } from "../property/MobileHits";
import { Property } from "@/app/types";

interface MyBusinessListingsProps {
  data: any;
  loadMore: any;
  refresh: any;
  selectedProperties: Set<string>;
  isSelectionMode: boolean;
  onToggleSelection: (propertyId: string, propertyStatus: string) => void;
  onLongPress: (propertyId: string, propertyStatus: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExitSelectionMode: () => void;
  loading: boolean;
}

const MyBusinessListings = ({
  data,
  loadMore,
  refresh,
  selectedProperties,
  isSelectionMode,
  onToggleSelection,
  onLongPress,
  onSelectAll,
  onDeselectAll,
  onExitSelectionMode,
  loading,
}: MyBusinessListingsProps) => {
  return (
    <View className="w-full flex-1">
      <MobileHits
        results={data.allResults}
        loading={data.loading || loading}
        loadingMore={data.loadingMore}
        hasMore={data.hasMore}
        error={data.error}
        totalHits={data.totalHits}
        onLoadMore={loadMore}
        onRefresh={refresh}
        selectedProperties={selectedProperties}
        isSelectionMode={isSelectionMode}
        onToggleSelection={onToggleSelection}
        onLongPress={onLongPress}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onExitSelectionMode={onExitSelectionMode}
      />
    </View>
  );
};

export default MyBusinessListings;
