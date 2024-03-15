import { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMapsContext } from '@/contexts/googleMapsContext';
import { DEFAULT_GOOGLE_MAPS_SEARCH_CENTER, DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM, GOOGLE_MAPS_MAP_ID } from '@/utils/constants';
import { SearchCarInfo } from '@/model/SearchCarsResult';
import Marker from './carMapMarker';

export default function CarSearchMap({ carInfos, width, height }: {
	carInfos: SearchCarInfo[],
	width: string,
	height: string,
}) {
	const [map, setMap] = useState(null)

	const onLoad = (map: google.maps.Map) => {
		const bounds = new google.maps.LatLngBounds();

		carInfos?.forEach((carInfo) => {
			bounds.extend(new google.maps.LatLng(carInfo.location.lat, carInfo.location.lng));
		});

		map.fitBounds(bounds);

		setMap(map);
	}

	const onUnmount = (map: google.maps.Map) => {
		setMap(null);
	}

	const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

	return (
		googleMapsAPIIsLoaded ? (
			<GoogleMap
				options={{ mapId: GOOGLE_MAPS_MAP_ID }}
				mapContainerStyle={{ width: width, height: height, borderRadius: '30px' }}
				center={DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
				zoom={DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
				onLoad={onLoad}
				onUnmount={onUnmount}
			>
				{carInfos?.map((carInfo: SearchCarInfo) => (
					<Marker
						key={carInfo.carId}
						map={map}
						position={carInfo.location}
						text={carInfo.totalPrice}
					/>
				))}
			</GoogleMap>
		) : <></>
	);
}
