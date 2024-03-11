import CarSearchMap from "@/components/guest/carSearchMap";
import { GoogleMapsProvider } from '@/contexts/googleMapsContext';
import { SearchCarInfo } from "@/model/SearchCarsResult";

export default function MapsTest() {

	const testCar: SearchCarInfo = {
		carId: 1,
		location: {
			lat: 25.935423,
			lng: -80.276184
		}
	};

	return (
		<GoogleMapsProvider>
			<CarSearchMap
				carInfos={[testCar]}
				width='100%'
				height='100vh'
			>
			</CarSearchMap>
		</GoogleMapsProvider>
	)
}
