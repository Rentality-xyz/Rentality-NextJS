import CarSearchMap from "@/components/guest/carMap/carSearchMap";
import { GoogleMapsProvider } from '@/contexts/googleMapsContext';
import { SearchCarInfo } from "@/model/SearchCarsResult";

export default function MapsTest() {

	const testCar: SearchCarInfo = {
		carId: 1,
		totalPrice: 100,
		location: {
			lat: 25.935423,
			lng: -80.276184
		}
	};

	return (
		<GoogleMapsProvider libraries={['maps','marker']}>
			<CarSearchMap
				carInfos={[testCar]}
				width='50%'
				height='50vh'
			>
			</CarSearchMap>
		</GoogleMapsProvider>
	)
}
