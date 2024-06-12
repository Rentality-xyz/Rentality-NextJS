import React, {memo, MutableRefObject, useState} from "react";
import Checkbox, {CheckboxLight} from "@/components/common/checkbox";
import RntPlaceAutoComplete from "@/components/common/rntPlaceAutocomplete";
import {SearchCarRequest} from "@/model/SearchCarRequest";
import {emptyLocationInfo, LocationInfo} from "@/model/LocationInfo";
import {t} from "i18next";

export default function  SearchDeliveryLocations({
     searchCarRequest,
     setSearchCarRequest
 }: {
    searchCarRequest: SearchCarRequest;
    setSearchCarRequest: (value: SearchCarRequest) => void;
}) {

    const [pickupLocationInfo, setPickupLocationInfo] = useState<LocationInfo | undefined>(undefined);
    const [returnLocationInfo, setReturnLocationInfo] = useState<LocationInfo | undefined>(undefined);

    return (
        <div className="flex flex-wrap items-center gap-4 mt-4">
            <hr className="w-full border-t-2 border-gray-300" />
            <div className="flex flex-col gap-2">
                <RntPlaceAutoComplete
                    className="min-w-[34ch]"
                    id="pickupLocation"
                    label="Pick up location"
                    placeholder="Enter address"
                    includeStreetAddress={true}
                    readOnly={
                        searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
                    }
                    initValue={
                        !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
                            ? searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address
                            : ""
                    }
                    onAddressChange={async (placeDetails) => {
                        if (
                            searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
                        )
                            return;

                        const locationLat = placeDetails.location?.latitude ?? 0;
                        const locationLng = placeDetails.location?.longitude ?? 0;
                        setPickupLocationInfo({
                            address: placeDetails.addressString,
                            country: placeDetails.country?.short_name ?? "",
                            state: placeDetails.state?.short_name ?? "",
                            city: placeDetails.city?.long_name ?? "",
                            latitude: locationLat,
                            longitude: locationLng,
                            timeZoneId: "",
                        });
                        setSearchCarRequest({
                            ...searchCarRequest,
                            deliveryInfo: {
                                ...searchCarRequest.deliveryInfo,
                                pickupLocation: {
                                    isHostHomeLocation: false,
                                    locationInfo: {
                                        address: placeDetails.addressString,
                                        country: placeDetails.country?.short_name ?? "",
                                        state: placeDetails.state?.short_name ?? "",
                                        city: placeDetails.city?.long_name ?? "",
                                        latitude: locationLat,
                                        longitude: locationLng,
                                        timeZoneId: "",
                                    },
                                },
                            },
                        });
                    }}
                />
                <CheckboxLight
                    className="ml-4 mt-0.5"
                    title="Host home locatione"
                    value={searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation}
                    onChange={(e) =>
                        setSearchCarRequest({
                            ...searchCarRequest,
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
                        })
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
                    readOnly={
                        searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
                    }
                    initValue={
                        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
                            ? searchCarRequest.deliveryInfo.returnLocation.locationInfo.address
                            : ""
                    }
                    onAddressChange={async (placeDetails) => {
                        if (
                            searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
                        )
                            return;

                        const locationLat = placeDetails.location?.latitude ?? 0;
                        const locationLng = placeDetails.location?.longitude ?? 0;

                        setReturnLocationInfo({
                            address: placeDetails.addressString,
                            country: placeDetails.country?.short_name ?? "",
                            state: placeDetails.state?.short_name ?? "",
                            city: placeDetails.city?.long_name ?? "",
                            latitude: locationLat,
                            longitude: locationLng,
                            timeZoneId: "",
                        });

                        setSearchCarRequest({
                            ...searchCarRequest,
                            deliveryInfo: {
                                ...searchCarRequest.deliveryInfo,
                                returnLocation: {
                                    isHostHomeLocation: false,
                                    locationInfo: {
                                        address: placeDetails.addressString,
                                        country: placeDetails.country?.short_name ?? "",
                                        state: placeDetails.state?.short_name ?? "",
                                        city: placeDetails.city?.long_name ?? "",
                                        latitude: locationLat,
                                        longitude: locationLng,
                                        timeZoneId: "",
                                    },
                                },
                            },
                        });
                    }}
                />
                <CheckboxLight
                    className="ml-4 mt-0.5"
                    title="Host home locatione"
                    value={searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation}
                    onChange={(e) =>
                        setSearchCarRequest({
                            ...searchCarRequest,
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
                        })
                    }
                />
            </div>
            <hr className="w-full border-t-2 border-gray-300" />
        </div>
    );
}


