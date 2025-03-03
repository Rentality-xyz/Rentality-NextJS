import { useEffect, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { isEmpty } from "@/utils/string";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import { env } from "@/utils/env";
import Image, { StaticImageData } from "next/image";
import * as React from "react";
import bgInput from "@/images/bg_input.png";

export type PlaceDetails = {
  addressString: string;
  country?: {
    short_name: string;
    long_name: string;
  };
  state?: {
    short_name: string;
    long_name: string;
  };
  city?: {
    short_name: string;
    long_name: string;
  };
  street?: {
    short_name: string;
    long_name: string;
  };
  street_number?: {
    short_name: string;
    long_name: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  utcOffsetMinutes: number;
  isEditing: boolean;
};

export interface RntPlaceAutocompleteInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  label?: string;
  initValue: string;
  includeStreetAddress?: boolean;
  onAddressChange: (praceDetails: PlaceDetails) => void;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  isAsRntInputTransparent?: boolean;
  iconFrontLabel?: StaticImageData;
}

export default function RntPlaceAutocompleteInput({
  className,
  labelClassName,
  inputClassName,
  id,
  label,
  placeholder,
  type,
  initValue,
  readOnly,
  includeStreetAddress,
  onChange: onChangeHandler,
  onAddressChange: onAddressChangeHandler,
  validationClassName,
  validationError,
  isTransparentStyle = false,
  isAsRntInputTransparent = false,
  iconFrontLabel,
}: RntPlaceAutocompleteInputProps) {
  const [enteredAddress, setEnteredAddress] = useState(initValue);
  const [isEditing, setIsEditing] = useState(false);

  const { placesService, placePredictions, getPlacePredictions, isPlacePredictionsLoading } = usePlacesService({
    apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    options: {
      input: "",
      types: includeStreetAddress
        ? ["airport", "locality", "administrative_area_level_1", "administrative_area_level_3", "route"]
        : ["(cities)"],
      componentRestrictions: { country: "us" },
    },
    language: "en",
    debounce: 500,
  });

  useEffect(() => {
    setEnteredAddress(initValue);
  }, []);

  useEffect(() => {
    if (!enteredAddress) {
      onAddressChangeHandler({
        addressString: "",
        location: { latitude: 0, longitude: 0 },
        utcOffsetMinutes: 0,
        isEditing,
      });
      return;
    }

    getPlacePredictions({ input: enteredAddress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredAddress]);

  const getAddressComponents = (placeDetails: google.maps.places.PlaceResult, fieldName: string) => {
    return placeDetails.address_components?.find((i) => i?.types?.includes(fieldName));
  };

  useEffect(() => {
    // fetch place details for the first element in placePredictions array
    if (!placesService) return;
    if (!placePredictions || !placePredictions.length) return;

    placesService.getDetails(
      {
        placeId: placePredictions[0].place_id,
        fields: ["address_components", "geometry", "place_id", "formatted_address", "utc_offset_minutes"],
      },
      (placeDetails) => {
        if (placeDetails) {
          const addressString = placeDetails.formatted_address ?? "";
          const country = getAddressComponents(placeDetails, "country");
          const state = getAddressComponents(placeDetails, "administrative_area_level_1");
          const city =
            getAddressComponents(placeDetails, "locality") ?? getAddressComponents(placeDetails, "sublocality_level_1");
          const street = getAddressComponents(placeDetails, "route");
          const street_number = getAddressComponents(placeDetails, "street_number");

          const latitude = placeDetails.geometry?.viewport?.getCenter().lat();
          const longitude = placeDetails.geometry?.viewport?.getCenter().lng();
          const location =
            latitude !== undefined && longitude !== undefined
              ? { latitude: latitude, longitude: longitude }
              : undefined;
          const utcOffsetMinutes = placeDetails.utc_offset_minutes ?? 0;

          onAddressChangeHandler({
            addressString: addressString,
            country: country,
            state: state,
            city: city,
            street: street,
            street_number: street_number,
            location: location,
            utcOffsetMinutes: utcOffsetMinutes,
            isEditing,
          });
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placePredictions]);

  type = type ?? "text";
  const cClassName = cn("relative text-black flex flex-col w-full", className);
  const lClassName = cn("text-rnt-temp-main-text whitespace-nowrap pl-4 mb-1", labelClassName);
  const iClassName = cn(
    "w-full h-12 rounded-full pl-4",
    inputClassName,
    isAsRntInputTransparent
      ? "btn_input_border-gradient disabled:text-gray-400 disabled:cursor-not-allowed input-inner"
      : "border-2 disabled:bg-gray-300 disabled:text-gray-600"
  );

  return (
    <div className={cClassName}>
      {!isEmpty(label) &&
        (isTransparentStyle ? (
          <label className={cn("flex items-center", lClassName)} htmlFor={id}>
            {!isEmpty(iconFrontLabel?.src) && <Image src={iconFrontLabel!!} alt="" className="mr-2" />}
            {label}
            <Image src={bgInput} alt="" className="absolute left-0 top-[34px] h-[60%] w-full rounded-full" />
          </label>
        ) : (
          <label className={lClassName} htmlFor={id}>
            {label}
          </label>
        ))}
      <div
        className={cn(
          `rounded-full ${isAsRntInputTransparent && readOnly ? "border-2 border-gray-500" : isAsRntInputTransparent && !readOnly && "btn_input_border-gradient"} ${!isEmpty(label) && "mt-1"}`
        )}
      >
        <div className={`input-wrapper pl-2`}>
          <input
            // ref={ref}
            className={iClassName}
            style={{
              backgroundColor: isTransparentStyle || isAsRntInputTransparent ? "transparent" : undefined,
              border: isTransparentStyle ? "0px" : undefined,
              color: isTransparentStyle || isAsRntInputTransparent ? "white" : undefined,
            }}
            autoComplete="off"
            id={id}
            name={id}
            type={type}
            readOnly={readOnly}
            disabled={readOnly}
            placeholder={placeholder}
            onChange={(e) => {
              setEnteredAddress(e.target.value);
              setIsEditing(true);
              onChangeHandler != null && onChangeHandler(e);
            }}
            onClick={() => {
              setIsEditing((current) => !current);
            }}
            value={enteredAddress}
            list="places"
            // loading={isPlacePredictionsLoading}
          />
        </div>
      </div>

      {isEditing && placePredictions && placePredictions.length > 1 ? (
        <div
          className={`absolute top-[105%] z-50 block w-full rounded-xl ${isAsRntInputTransparent ? "mt-1 border border-white bg-rentality-bg-left-sidebar text-white" : "border-2 border-black bg-white text-black"}`}
        >
          {placePredictions.map((item, index) => {
            return (
              <option
                className={`cursor-pointer truncate rounded-xl px-4 py-2 ${isAsRntInputTransparent ? "hover:bg-gray-600" : "hover:bg-gray-400"}`}
                onClick={() => {
                  setEnteredAddress(item.description);
                  setIsEditing(false);
                }}
                key={index}
              >
                {item.description}
              </option>
            );
          })}
        </div>
      ) : null}

      <RntValidationError className={validationClassName} validationError={validationError} />
    </div>
  );
}
