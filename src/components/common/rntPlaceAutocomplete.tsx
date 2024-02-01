import { ChangeEvent, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

type Props = {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  initValue: string;
  includeStreetAddress?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (praceDetails: PlaceDetails) => void;
};

type PlaceDetails = {
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
  location: {
    latitude: number;
    longitude: number;
  };
};

export default function RntPlaceAutocomplete({
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
}: Props) {
  const isShowLabel = label !== undefined && label?.length > 0;
  const [enteredAddress, setEnteredAddress] = useState(initValue);
  const [isEditing, setIsEditing] = useState(false);

  const { placesService, placePredictions, getPlacePredictions, isPlacePredictionsLoading } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    options: {
      input: "",
      types: includeStreetAddress ? ["address"] : ["(cities)"],
      componentRestrictions: { country: "us" },
    },
    language: "en",
    debounce: 500,
  });

  useEffect(() => {
    setEnteredAddress(initValue);
  }, [initValue]);

  useEffect(() => {
    if (!enteredAddress) {
      onAddressChangeHandler({
        addressString: "",
        location: { latitude: 0, longitude: 0 },
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

          const latitude = placeDetails.geometry?.viewport?.getCenter().lat() ?? 0;
          const longitude = placeDetails.geometry?.viewport?.getCenter().lng() ?? 0;

          onAddressChangeHandler({
            addressString: addressString,
            country: country,
            state: state,
            city: city,
            street: street,
            street_number: street_number,
            location: { latitude: latitude, longitude: longitude },
          });
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placePredictions]);

  type = type ?? "text";
  const cClassName = twMerge("relative text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
  const iClassName = twMerge(
    "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
    inputClassName
  );
  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        // ref={ref}
        className={iClassName}
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
      {isEditing && placePredictions && placePredictions.length > 1 ? (
        <div className="block absolute top-[105%] w-full bg-white text-black border-2 rounded-xl border-black z-50">
          {placePredictions.map((item, index) => {
            return (
              <option
                className="py-2 px-4 rounded-xl hover:bg-gray-400 cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis"
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

      {/* <div
        style={{
          marginTop: "20px",
          width: "200px",
          height: "200px",
          display: "flex",
          flex: "1",
          flexDirection: "column",
          marginBottom: "100px",
        }}
      >
        {!isPlacePredictionsLoading && (
          <ul>
            {placePredictions.map((item, index) => {
              return (<li key={index}>{item.description}</li>)
            })}
          </ul>
          // <List
          //   dataSource={placePredictions}
          //   renderItem={(item) => (
          //     <List.Item onClick={() => setValue(item.description)}>
          //       <List.Item.Meta title={item.description} />
          //     </List.Item>
          //   )}
          // />
        )}
      </div> */}
    </div>
  );
}
