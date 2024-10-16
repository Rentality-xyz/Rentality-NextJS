import RntPlaceAutocompleteInput from "./rntPlaceAutocompleteInput";
import { RntPlaceAutocompleteInputProps } from "./rntPlaceAutocompleteInput";
import RntInput from "./rntInput";
import {useApiIsLoaded} from '@vis.gl/react-google-maps';

export default function RntPlaceAutoComplete(props: RntPlaceAutocompleteInputProps) {

  const apiIsLoaded = useApiIsLoaded();

  if (apiIsLoaded) return <RntPlaceAutocompleteInput {...props} />;

  const { initValue, includeStreetAddress, onAddressChange, ...inputProps } = props;
  return <RntInput {...inputProps} />;
}
