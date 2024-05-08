import { useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/contexts/googleMapsContext";
import {
  DEFAULT_GOOGLE_MAPS_SEARCH_CENTER,
  DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM,
  GOOGLE_MAPS_MAP_ID,
} from "@/utils/constants";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import Marker from "./carMapMarker";

export default function CarSearchMap({
  carInfos,
  width,
  height,
  setSelected,
  selectedCarID
}: {
  carInfos: SearchCarInfo[];
  width: string;
  height: string;
  setSelected: (carID: Number) => void;
  selectedCarID : Number | null
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();

    carInfos?.forEach((carInfo) => {
      if (!carInfo.location.lat || !carInfo.location.lng) return;
      bounds.extend(new google.maps.LatLng(carInfo.location.lat, carInfo.location.lng));
    });

    map.fitBounds(bounds);

    setMap(map);
  };

  const onUnmount = (map: google.maps.Map) => {
    setMap(null);
  };

  const { googleMapsAPIIsLoaded } = useGoogleMapsContext();
  
  return googleMapsAPIIsLoaded ? (
    <GoogleMap
      options={{ mapId: GOOGLE_MAPS_MAP_ID }}
      mapContainerStyle={{ width: width, height: height, borderRadius: "30px", margin: "1rem" }}
      center={DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
      zoom={DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {carInfos?.map((carInfo: SearchCarInfo) => (
        <Marker
          key={carInfo.carId}
          map={map!}
          position={carInfo.location}
          onClick={(e) => setSelected(Number(e.domEvent.target.id))}
        >
          <div 
          	id={carInfo.carId.toString()}
          	className={"text-center rounded-full text-white text-lg buttonGradient w-24 h-8" + (selectedCarID == carInfo.carId ? " border-2":"")}>
            ${carInfo.totalPriceWithDiscount}
          </div>
        </Marker>
      ))}
    </GoogleMap>
  ) : (
    <></>
  );
}
