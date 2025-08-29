import { View, Text } from "react-native";
import { MobileHits } from "../property/MobileHits";

interface MyBusinessListingsProps {
  data: any;
}

const MyBusinessListings = ({ data }: MyBusinessListingsProps) => {
  console.log("siofhsaujiauidh", data);
  return (
    <View className="w-full flex-1">
      <MobileHits
        results={data.allResults}
        loading={data.loading}
        loadingMore={data.loadingMore}
        hasMore={data.hasMore}
        error={data.error}
        totalHits={data.totalHits}
        onLoadMore={data.onLoadMore}
        onRefresh={data.onRefresh}
      />
    </View>
  );
};

export default MyBusinessListings;
