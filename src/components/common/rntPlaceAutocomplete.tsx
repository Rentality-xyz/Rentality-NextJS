import RntPlaceAutocompleteInput from "./rntPlaceAutocompleteInput";
import { useGoogleMapsContext } from '@/contexts/googleMapsContext';
import { RntPlaceAutocompleteInputProps } from "./rntPlaceAutocompleteInput";

export default function RntPlaceAutoComplete(props: RntPlaceAutocompleteInputProps){
	
	const { googleMapsAPIIsLoaded } = useGoogleMapsContext();
	
	return (
	  googleMapsAPIIsLoaded ? (
          <RntPlaceAutocompleteInput
          	{...props}
          />
	  ) : <></>		
	);
}