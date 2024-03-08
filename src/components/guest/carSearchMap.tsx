import { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMapsContext } from '@/contexts/googleMapsContext';
import { DEFAULT_GOOGLE_MAPS_SEARCH_CENTER, DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM } from '@/utils/constants';
import { SearchCarInfo } from '@/model/SearchCarsResult';

export default function CarSearchMap({ carInfos, width, height }: {
	carInfos: SearchCarInfo[],
	width: string,
	height: string,
}) {
	const [map, setMap] = useState(null)

	const onLoad = (map: google.maps.Map) => {
		carInfos?.forEach((carInfo) => {
			const bounds = new window.google.maps.LatLngBounds(carInfo.location);
			map.fitBounds(bounds);
		});
		setMap(map);
	}

	const onUnmount = (map: google.maps.Map) => {
		setMap(null);
	}

	const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

	return (
		googleMapsAPIIsLoaded ? (
			<GoogleMap
				mapContainerStyle={{ width: width, height: height }}
				center={DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
				zoom={DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
				onLoad={onLoad}
				onUnmount={onUnmount}
			>
				{carInfos?.map((carInfo:SearchCarInfo) => (
					<Marker key={carInfo.carId} position={carInfo.location} />
				))}
			</GoogleMap>
		) : <></>
	);
}
