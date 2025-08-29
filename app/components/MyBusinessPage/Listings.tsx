import { View, Text } from "react-native";
import { MobileHits } from "../property/MobileHits";

interface MyBusinessListingsProps {
  data: any;
  loadMore: any;
  refresh: any;
}

const MyBusinessListings = ({
  data,
  loadMore,
  refresh,
}: MyBusinessListingsProps) => {
  console.log("siofhsaujiauidh", data.cpId);
  return (
    <View className="w-full flex-1">
      <MobileHits
        results={data.allResults}
        loading={data.loading}
        loadingMore={data.loadingMore}
        hasMore={data.hasMore}
        error={data.error}
        totalHits={data.totalHits}
        onLoadMore={loadMore}
        onRefresh={refresh}
      />
    </View>
  );
};

export default MyBusinessListings;
