import { useState, useRef, CSSProperties, useEffect } from "react";
import {
  DEFAULT_GOOGLE_MAPS_SEARCH_CENTER,
  DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM,
  GOOGLE_MAPS_MAP_ID,
} from "@/utils/constants";
import { SearchCarsResult } from "@/model/SearchCarsResult";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { env } from "@/utils/env";
import { ClusteredMapMarkers } from "@/components/guest/carMap/clusteredMapMarkers";

export default function CarSearchMap({
  searchResult,
  setSelected,
  isExpanded,
  defaultCenter,
}: {
  searchResult: SearchCarsResult;
  setSelected?: (carID: number) => void | null;
  isExpanded: boolean;
  defaultCenter?: google.maps.LatLngLiteral | null;
}) {
  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["maps", "marker"]} language="en">
      <CarSearchMapContent
        searchResult={searchResult}
        setSelected={setSelected}
        isExpanded={isExpanded}
        defaultCenter={defaultCenter}
      />
    </APIProvider>
  );
}

function CarSearchMapContent({
  searchResult,
  setSelected,
  isExpanded,
  defaultCenter,
}: {
  searchResult: SearchCarsResult;
  setSelected?: (carID: number) => void | null;
  isExpanded: boolean;
  defaultCenter?: google.maps.LatLngLiteral | null;
}) {
  const [isSticked, setIsSticked] = useState<boolean>(false);
  const mapLeft = useRef<number>(0);
  const mapTop = useRef<number>(0);
  const mapWidth = useRef<number>(0);
  const [mapHeight, setMapHeight] = useState<string>("0vh");
  const [mapContainerStyle, setMapContainerStyle] = useState<CSSProperties>();

  const handleScroll = () => {
    if (window.innerWidth < 1536) {
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

    let newHeight = parentRect.height;

    if (parentRect.top <= 0) {
      newHeight += parentRect.top;
    }

    if (parentRect.bottom > window.innerHeight) {
      newHeight -= parentRect.bottom - window.innerHeight;
    }

    setMapHeight(newHeight + "px");

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
    if (window.innerWidth < 1536) {
      window.removeEventListener("scroll", handleScroll);
      setIsSticked(false);
    } else {
      window.addEventListener("scroll", handleScroll);
    }
  };

  const selectedCar = searchResult.carInfos.find((item) => {
    return item.highlighted;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1536) {
      window.addEventListener("scroll", handleScroll);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1536) {
      setMapContainerStyle({
        borderRadius: "30px",
        height: isExpanded ? "100vh" : "0vh",
      });
    } else {
      setMapContainerStyle({
        position: isSticked ? "fixed" : "relative",
        top: isSticked ? "0px" : mapTop.current + "px",
        ...(isSticked && { left: mapLeft.current + "px" }),
        width: isSticked ? mapWidth.current + "px" : "100%",
        height: isSticked ? mapHeight : "70vh",
        borderRadius: "30px",
      });
    }
  }, [isSticked, mapHeight, isExpanded]);

  return (
    <Map
      id="google-maps-guest-search-page"
      mapId={GOOGLE_MAPS_MAP_ID}
      mapTypeId={"satellite"}
      //className="max-xl:transition-height max-xl:duration-300 max-xl:ease-in-out"
      style={mapContainerStyle}
      defaultCenter={selectedCar?.location || defaultCenter || DEFAULT_GOOGLE_MAPS_SEARCH_CENTER}
      defaultZoom={DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM}
    >
      <ClusteredMapMarkers carInfos={searchResult.carInfos} selectedCar={selectedCar} setSelected={setSelected} />
    </Map>
  );
}
