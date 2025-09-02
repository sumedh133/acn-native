import { View, Text } from "react-native";
import { MobileHits } from "../property/MobileHits";
import { Property } from "@/app/types";

interface MyBusinessListingsProps {
  data: any;
  loadMore: any;
  refresh: any;
  selectedProperties: Set<string>;
  loading: boolean;
}

const MyBusinessListings = ({
  data,
  loadMore,
  refresh,
  selectedProperties,
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
      />
    </View>
  );
};

export default MyBusinessListings;
