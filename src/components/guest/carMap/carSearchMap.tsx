import { useState, useEffect, useMemo, useRef, CSSProperties, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/contexts/googleMapsContext";
import {
  DEFAULT_GOOGLE_MAPS_SEARCH_CENTER,
  DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM,
  GOOGLE_MAPS_MAP_ID,
} from "@/utils/constants";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import Marker from "./carMapMarker";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { MapRenderer } from "./carMapRenderer";

export default function CarSearchMap({
  carInfos,
  setSelected,
  selectedCarID,
  isExpanded,
  defaultCenter,
}: {
  carInfos: SearchCarInfo[];
  setSelected: (carID: number) => void;
  selectedCarID: number | null;
  isExpanded: boolean;
  defaultCenter: google.maps.LatLng | null;
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isSticked, setIsSticked] = useState<boolean>(false);
  const mapLeft = useRef<number>(0);
  const mapTop = useRef<number>(0);
  const mapWidth = useRef<number>(0);
  const [mapHeight, setMapHeight] = useState<number>(0);
  const markerClusterer = useRef<MarkerClusterer | null>(null);

  const mapContainerStyle = useMemo<CSSProperties>(() => {
    if (typeof window == "undefined" || window.innerWidth < 1280) {
      return {
        borderRadius: "30px",
        height: isExpanded ? "100vh" : "0vh",
      };
    }

    var height = "";

    if (!isSticked && carInfos.length == 0) {
      height = "55vh";
    } else {
      height = mapHeight + "px";
    }

    return {
      position: isSticked ? "fixed" : "relative",
      top: isSticked ? "0px" : mapTop.current + "px",
      ...(isSticked && { left: mapLeft.current + "px" }),
      width: isSticked ? mapWidth.current + "px" : "100%",
      height: height,
      borderRadius: "30px",
    };
  }, [carInfos.length, isSticked, mapHeight, isExpanded]);

  const handleScroll = () => {
    if (window.innerWidth < 1280) {
      return;
    }
    console.debug("Here");
    const googleMapElement = document.getElementById("google-maps-guest-search-page");
    if (!googleMapElement) {
      return;
    }
    const rect = googleMapElement.getBoundingClientRect();

    const googleMapElementParent = googleMapElement.parentElement;
    if (!googleMapElementParent) {
      return;
    }
    const parentRect = googleMapElementParent.getBoundingClientRect();

    if (parentRect.top <= 0 && parentRect.bottom < window.innerHeight) {
      setMapHeight(Math.ceil(parentRect.bottom));
    } else {
      setMapHeight(window.innerHeight - rect.top);
    }

    if (parentRect.top <= 0 && !isSticked) {
      mapLeft.current = Math.ceil(rect.left);
      mapTop.current = Math.ceil(rect.top);
      mapWidth.current = Math.ceil(rect.width);
      setIsSticked(true);
    } else if (parentRect.top > 0) {
      setIsSticked(false);
    }
  };

  const handleResize = () => {
    if (window.innerWidth < 1280) {
      window.removeEventListener("scroll", handleScroll);
      setIsSticked(false);
    } else {
      window.addEventListener("scroll", handleScroll);
    }
  };

  const selectedCar = useMemo(() => {
    return carInfos.find((item) => {
      return item.carId == selectedCarID;
    });
  }, [carInfos, selectedCarID]);

  const positionMapToCar = useCallback(() => {
    if (!map || !selectedCar) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(selectedCar.location.lat, selectedCar.location.lng));
    map.fitBounds(bounds);
    map.setZoom(11);
  }, [map, selectedCar]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      console.log("screen: " + window.innerWidth);
      window.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("resize", handleResize);
    if (selectedCarID != null) {
      positionMapToCar();
    }
    handleScroll();
    markerClusterer.current = new MarkerClusterer({ map: map, renderer: new MapRenderer() });
  };

  const onUnload = () => {
    setMap(null);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
  };

  const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

  useEffect(() => {
    if (carInfos.length && selectedCarID != null) {
      positionMapToCar();
    }
  }, [carInfos.length, selectedCarID]);

  const markerClassName = "text-center text-lg w-24 h-8";
  const carIdClassName = markerClassName + " text-white buttonGradient rounded-full";
  const selectedCarIdClassName =
    markerClassName + " rounded-lg text-black font-medium bg-white border-2 border-[#805FE4]";

  return googleMapsAPIIsLoaded ? (
    <GoogleMap
      id="google-maps-guest-search-page"
      options={{ mapId: GOOGLE_MAPS_MAP_ID }}
      mapContainerClassName={"max-xl:transition-height max-xl:duration-300 max-xl:ease-in-out"}
      mapContainerStyle={mapContainerStyle}
      center={selectedCar?.location || defaultCenter || DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
      zoom={selectedCarID ? 11 : DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
      onLoad={onLoad}
      onUnmount={onUnload}
    >
      {carInfos?.map((carInfo: SearchCarInfo) => (
        <Marker
          key={carInfo.carId}
          map={map!}
          position={carInfo.location}
          onClick={(e) => setSelected(Number(e.domEvent.target.id))}
          markerClusterer={markerClusterer.current!}
        >
          <div
            id={carInfo.carId.toString()}
            // className="text-[#805FE4]"
            className={selectedCarID == carInfo.carId ? selectedCarIdClassName : carIdClassName}
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
