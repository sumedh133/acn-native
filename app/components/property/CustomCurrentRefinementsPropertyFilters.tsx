import React from "react";
import {
  useClearRefinements,
  useCurrentRefinements,
} from "react-instantsearch";

interface CustomCurrentRefinementsProps {
  selectedLandmark?: any;
  setSelectedLandmark?: (landmark: any) => void;
}

export default function CustomCurrentRefinementsPropertyFilters({
  selectedLandmark,
  setSelectedLandmark,
}: CustomCurrentRefinementsProps) {
  const { items, refine } = useCurrentRefinements();
  const { refine: clearRefinements } = useClearRefinements();
  
  // Mock userType - replace with your actual state management
  const userType = "free";

  if (items.length === 0 && !selectedLandmark) {
    return null;
  }

  // Flatten refinements from all items into a single array for inline display
  const allRefinements = items.flatMap((item) =>
    item.refinements.map((refinement) => ({
      attribute: item.attribute,
      refinement: refinement,
    })),
  );

  const handleRefinementRemove = (refinement: any, attribute: string) => {
    try {
      // Analytics logging - replace with your analytics implementation
      console.log('remove_refinement', {
        event_category: 'filters',
        event_label: 'remove',
        filter_type: attribute,
        filter_value: refinement.label || refinement.value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging refinement removal:', error);
    }
    refine(refinement);
  };

  const handleClearAll = () => {
    try {
      // Analytics logging - replace with your analytics implementation
      console.log('clear_all_refinements', {
        event_category: 'filters',
        event_label: 'clear_all',
        active_filters: items.map(item => item.attribute),
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging clear all:', error);
    }
    clearRefinements();
    if (setSelectedLandmark) {
      setSelectedLandmark(null);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2 px-4">
        {selectedLandmark && (
          <button
            onClick={() => {
              try {
                // Analytics logging - replace with your analytics implementation
                console.log('remove_landmark_filter', {
                  event_category: 'filters',
                  event_label: 'remove',
                  landmark_name: selectedLandmark.name,
                  radius: selectedLandmark.radius,
                  user_type: userType
                });
              } catch (error) {
                console.error('Error logging landmark removal:', error);
              }
              setSelectedLandmark && setSelectedLandmark(null);
            }}
            className="flex items-center bg-gray-200 hover:bg-gray-300 transition-colors px-3 py-1.5 rounded-2xl"
          >
            <span className="text-sm text-gray-700 mr-1 font-normal">
              {selectedLandmark.name} ({selectedLandmark.radius / 1000}km)
            </span>
            <span className="text-base text-gray-600">×</span>
          </button>
        )}

        {allRefinements.map((item, index) => (
          <button
            key={`${item.attribute}-${item.refinement.value || index}`}
            onClick={() => handleRefinementRemove(item.refinement, item.attribute)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 transition-colors px-3 py-1.5 rounded-2xl"
          >
            <span className="text-sm text-gray-700 mr-1 font-normal">
              {item.refinement.attribute === "agentCpid"
                ? "My Requirements"
                : item.refinement.label}
            </span>
            <span className="text-base text-gray-600">×</span>
          </button>
        ))}

        {(items.length > 0 || selectedLandmark) && (
          <button
            onClick={handleClearAll}
            className="ml-1"
          >
            <div className="flex items-center border border-red-500 bg-red-50 hover:bg-red-100 transition-colors px-2 py-1.5 rounded-2xl">
              <span className="text-xs text-red-500 font-semibold">Clear All</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}