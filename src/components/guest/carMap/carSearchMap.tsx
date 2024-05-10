import { useState, useMemo, useRef, CSSProperties } from "react";
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
  setSelected,
  selectedCarID,
  isExpanded,
  defaultCenter
}: {
  carInfos: SearchCarInfo[];
  setSelected: (carID: Number) => void;
  selectedCarID: Number | null;
  isExpanded: boolean;
  defaultCenter: google.maps.LatLng | null,
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isSticked, setIsSticked] = useState<boolean>(false);
  const mapLeft = useRef<number>(0);
  const mapTop = useRef<number>(0);
  const mapWidth = useRef<number>(0);
  const [mapHeight, setMapHeight] = useState<number>(0);
  
  const mapContainerStyle = useMemo<CSSProperties>(
    () => {
		var height = "";
		if(isSticked){
			if(mapHeight){
				height = mapHeight + "px"
			} else {
				height = "100vh";
			}		
		} else {
			height = typeof window !== "undefined" && window.screen.width >= 1280 ? "60vh" : (isExpanded ? "80vh" : "12rem");
		}
		return {
      position: isSticked ? "fixed" : "relative",
      top: isSticked ? "0px" : mapTop.current + "px",
      ...(isSticked && { left: mapLeft.current + "px" }),
      width: isSticked ? mapWidth.current + "px" : "100%",
      height:  height,
      borderRadius: "30px",
    }
	},
    [isSticked, mapHeight, isExpanded]
  );

  const handleScroll = () => {
    const googleMapElement = document.getElementById("google-maps-guest-search-page");
    if (!googleMapElement) {
      console.log("Cannot find Google Map Element to set up stickyness");
      return;
    }

    const googleMapElementParent = googleMapElement.parentElement;

    if (!googleMapElementParent) {
      console.log("Cannot find Google Map Parent Element to set up stickyness");
      return;
    }
    
    const parentRect = googleMapElementParent.getBoundingClientRect();

	if(parentRect.top <= 0 && window.screen.width >= 1280 && parentRect.bottom < window.innerHeight){
		setMapHeight(Math.ceil(parentRect.bottom));
	} else {
		setMapHeight(0);
	}

    if (parentRect.top <= 0 && window.screen.width >= 1280 && !isSticked) {
      const rect = googleMapElement.getBoundingClientRect();
      mapLeft.current = Math.ceil(rect.left);
      mapTop.current = Math.ceil(rect.top);
      mapWidth.current = Math.ceil(rect.width);
      setIsSticked(true);
    } else if (parentRect.top > 0) {
      setIsSticked(false);
    }
  };

  const onLoad = (map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();

    carInfos?.forEach((carInfo) => {
      if (!carInfo.location.lat || !carInfo.location.lng) return;
      bounds.extend(new google.maps.LatLng(carInfo.location.lat, carInfo.location.lng));
    });

	if(carInfos.length){
    	map.fitBounds(bounds);
    }
    setMap(map);

    window.addEventListener("scroll", handleScroll, true);
  };

  const onUnmount = (map: google.maps.Map) => {
    setMap(null);

    window.removeEventListener("scroll", handleScroll);
  };

  const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

  return googleMapsAPIIsLoaded ? (
    <GoogleMap
      id="google-maps-guest-search-page"
      options={{ mapId: GOOGLE_MAPS_MAP_ID }}
      mapContainerClassName={"max-xl:transition-height max-xl:duration-300 max-xl:ease-in-out"}
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter || DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
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
            className={
              "text-center rounded-full text-white text-lg buttonGradient w-24 h-8" +
              (selectedCarID == carInfo.carId ? " border-2" : "")
            }
          >
            ${carInfo.pricePerDayWithDiscount}
          </div>
        </Marker>
      ))}
    </GoogleMap>
  ) : (
    <></>
  );
}
