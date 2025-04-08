import RntPlaceAutocompleteInput from "./rntPlaceAutocompleteInput";
import { RntPlaceAutocompleteInputProps } from "./rntPlaceAutocompleteInput";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import RntInputTransparent from "@/components/common/rntInputTransparent";

export default function RntPlaceAutoComplete(props: RntPlaceAutocompleteInputProps) {
  const apiIsLoaded = useApiIsLoaded();

  if (apiIsLoaded) return <RntPlaceAutocompleteInput {...props} />;

  const {
    initValue,
    includeStreetAddress,
    onAddressChange,
    isAsRntInputTransparent,
    isDarkPlacePredictions,
    ...inputProps
  } = props;
  return <RntInputTransparent {...inputProps} />;
}
