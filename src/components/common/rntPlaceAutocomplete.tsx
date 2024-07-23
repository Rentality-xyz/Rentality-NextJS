import RntPlaceAutocompleteInput from "./rntPlaceAutocompleteInput";
import { useGoogleMapsContext } from "@/contexts/googleMapsContext";
import { RntPlaceAutocompleteInputProps } from "./rntPlaceAutocompleteInput";
import RntInput from "./rntInput";

export default function RntPlaceAutoComplete(props: RntPlaceAutocompleteInputProps) {
  const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

  if (googleMapsAPIIsLoaded) return <RntPlaceAutocompleteInput {...props} />;

  const { initValue, includeStreetAddress, onAddressChange, ...inputProps } = props;
  return <RntInput {...inputProps} />;
}
