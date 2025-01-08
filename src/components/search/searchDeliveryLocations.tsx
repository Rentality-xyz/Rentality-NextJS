import React, { useState } from "react";
import RntPlaceAutoComplete from "@/components/common/rntPlaceAutocomplete";
import { emptyLocationInfo, LocationInfo } from "@/model/LocationInfo";
import { CheckboxLight } from "../common/rntCheckbox";
import { placeDetailsToLocationInfo } from "@/utils/location";
import { SearchCarRequest } from "@/model/SearchCarRequest";

export default function SearchDeliveryLocations({
  searchCarRequest,
  setSearchCarRequest,
}: {
  searchCarRequest: SearchCarRequest;
  setSearchCarRequest: (value: React.SetStateAction<SearchCarRequest>) => void;
}) {
  const [pickupLocationInfo, setPickupLocationInfo] = useState<LocationInfo | undefined>(undefined);
  const [returnLocationInfo, setReturnLocationInfo] = useState<LocationInfo | undefined>(undefined);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <hr className="w-full border-t-2 border-gray-300" />
      <div className="flex flex-col gap-2">
        <RntPlaceAutoComplete
          className="min-w-[34ch]"
          id="pickupLocation"
          label="Pick up location"
          placeholder="Enter address"
          includeStreetAddress={true}
          readOnly={searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation}
          initValue={
            !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
              ? searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address
              : ""
          }
          onAddressChange={async (placeDetails) => {
            if (searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation) return;

            const locationInfo = placeDetailsToLocationInfo(placeDetails);
            setPickupLocationInfo(locationInfo);
            setSearchCarRequest((prev) => ({
              ...prev,
              deliveryInfo: {
                ...prev.deliveryInfo,
                pickupLocation: {
                  isHostHomeLocation: false,
                  locationInfo: locationInfo,
                },
              },
            }));
          }}
        />
        <CheckboxLight
          className="ml-4 mt-0.5"
          label="Host home locatione"
          checked={searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation}
          onChange={(e) =>
            setSearchCarRequest((prev) => ({
              ...prev,
              deliveryInfo: {
                ...searchCarRequest.deliveryInfo,
                pickupLocation: e.target.checked
                  ? {
                      isHostHomeLocation: e.target.checked,
                    }
                  : {
                      isHostHomeLocation: e.target.checked,
                      locationInfo: pickupLocationInfo ?? emptyLocationInfo,
                    },
              },
            }))
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <RntPlaceAutoComplete
          className="min-w-[34ch]"
          id="returnLocation"
          label="Return location"
          placeholder="Enter address"
          includeStreetAddress={true}
          readOnly={searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation}
          initValue={
            !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
              ? searchCarRequest.deliveryInfo.returnLocation.locationInfo.address
              : ""
          }
          onAddressChange={async (placeDetails) => {
            if (searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation) return;

            const locationInfo = placeDetailsToLocationInfo(placeDetails);

            setReturnLocationInfo(locationInfo);

            setSearchCarRequest((prev) => ({
              ...prev,
              deliveryInfo: {
                ...prev.deliveryInfo,
                returnLocation: {
                  isHostHomeLocation: false,
                  locationInfo: locationInfo,
                },
              },
            }));
          }}
        />
        <CheckboxLight
          className="ml-4 mt-0.5"
          label="Host home locatione"
          checked={searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation}
          onChange={(e) =>
            setSearchCarRequest((prev) => ({
              ...prev,
              deliveryInfo: {
                ...searchCarRequest.deliveryInfo,
                returnLocation: e.target.checked
                  ? {
                      isHostHomeLocation: e.target.checked,
                    }
                  : {
                      isHostHomeLocation: e.target.checked,
                      locationInfo: returnLocationInfo ?? emptyLocationInfo,
                    },
              },
            }))
          }
        />
      </div>
      <hr className="w-full border-t-2 border-gray-300" />
    </div>
  );
}
