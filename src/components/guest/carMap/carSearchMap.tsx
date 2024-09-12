import { useState, useMemo, useRef, CSSProperties } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/contexts/googleMapsContext";
import {
  DEFAULT_GOOGLE_MAPS_SEARCH_CENTER,
  DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM,
  GOOGLE_MAPS_MAP_ID,
} from "@/utils/constants";
import { SearchCarInfo, SearchCarsResult } from "@/model/SearchCarsResult";
import Marker from "./carMapMarker";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { MapRenderer } from "./carMapRenderer";

export default function CarSearchMap({
  searchResult,
  setSelected,
  isExpanded,
  defaultCenter,
}: {
  searchResult: SearchCarsResult;
  setSelected: (carID: number) => void;
  isExpanded: boolean;
  defaultCenter: google.maps.LatLng | null;
}) {
  const mapRef = useRef<google.maps.Map | null>();
  const [isSticked, setIsSticked] = useState<boolean>(false);
  const mapLeft = useRef<number>(0);
  const mapTop = useRef<number>(0);
  const mapWidth = useRef<number>(0);
  const [mapHeight, setMapHeight] = useState<number>(0);
  const markerClusterer = useRef<MarkerClusterer>();

  const mapContainerStyle = useMemo<CSSProperties>(() => {
    if (typeof window == "undefined" || window.innerWidth < 1280) {
      return {
        borderRadius: "30px",
        height: isExpanded ? "100vh" : "0vh",
      };
    }

    var height = "";

    if (!isSticked && searchResult.carInfos.length == 0) {
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
  }, [searchResult, isSticked, mapHeight, isExpanded]);

  const handleScroll = () => {
    if (window.innerWidth < 1280) {
      return;
    }

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

    var newHeight = parentRect.height;

    if (parentRect.top <= 0) {
      newHeight += parentRect.top;
    }

    if (parentRect.bottom > window.innerHeight) {
      newHeight -= parentRect.bottom - window.innerHeight;
    }

    setMapHeight(newHeight);

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

  const selectedCar = searchResult.carInfos.find((item) => {
    return item.highlighted;
  });

  if (mapRef.current && selectedCar) {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(selectedCar.location.lat, selectedCar.location.lng));
    mapRef.current.fitBounds(bounds);
    mapRef.current.setZoom(18);
  }

  if (mapRef.current) {
    markerClusterer.current = new MarkerClusterer({ map: mapRef.current, renderer: new MapRenderer() });
  }

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      window.addEventListener("scroll", handleScroll);
    }

    window.addEventListener("resize", handleResize);

    handleScroll();
  };

  const onUnload = () => {
    mapRef.current = null;

    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
  };

  const { googleMapsAPIIsLoaded } = useGoogleMapsContext();

  const markerClassName = "text-center text-lg w-24 h-8";
  const carIdClassName = markerClassName + "z-0 text-white bg-rnt-button-gradient rounded-full";
  const selectedCarIdClassName =
    markerClassName + "z-20 rounded-lg text-black font-medium bg-white border-2 border-[#805FE4]";

  return googleMapsAPIIsLoaded ? (
    <GoogleMap
      id="google-maps-guest-search-page"
      options={{ mapId: GOOGLE_MAPS_MAP_ID }}
      mapContainerClassName={"max-xl:transition-height max-xl:duration-300 max-xl:ease-in-out"}
      mapContainerStyle={mapContainerStyle}
      center={selectedCar?.location || defaultCenter || DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
      zoom={selectedCar ? 11 : DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
      onLoad={onLoad}
      onUnmount={onUnload}
    >
      {searchResult.carInfos.map((carInfo: SearchCarInfo) => {
        const className = carInfo.highlighted ? selectedCarIdClassName : carIdClassName;
        const zIndex = carInfo.highlighted ? 20 : 0;

        return (
          <Marker
            key={carInfo.carId}
            map={mapRef.current!}
            position={carInfo.location}
            onClick={(e) => setSelected(Number(e.domEvent.target.id))}
            markerClusterer={markerClusterer.current!}
            zIndex={zIndex}
          >
            <div id={carInfo.carId.toString()} className={className}>
              ${carInfo.pricePerDayWithDiscount}
            </div>
          </Marker>
        );
      })}
    </GoogleMap>
  ) : (
    <></>
  );
}
