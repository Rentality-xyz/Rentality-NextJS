import { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMapsContext } from '@/contexts/googleMapsContext';
import { DEFAULT_GOOGLE_MAPS_SEARCH_CENTER, DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM, GOOGLE_MAPS_MAP_ID } from '@/utils/constants';
import { SearchCarInfo } from '@/model/SearchCarsResult';
import Marker from './carMapMarker';
import RntButton from '@/components/common/rntButton';

export default function CarSearchMap({ carInfos, width, height, onMarkerClick }: {
	carInfos: SearchCarInfo[],
	width: string,
	height: string,
	onMarkerClick: (carID: Number) => void
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
				mapContainerStyle={{ width: width, height: height, borderRadius: '30px', margin:"1rem" }}
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
						onClick = {({ domEvent }) => {
							const { target } = domEvent;
							onMarkerClick(target.id);
				        }}
					>
						<RntButton id={carInfo.carId} className="w-24 h-8">${carInfo.totalPrice}</RntButton>
					</Marker>
				))}
			</GoogleMap>
		) : <></>
	);
}
