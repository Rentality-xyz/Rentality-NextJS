import { SearchCarInfo } from "@/model/SearchCarsResult";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";
import { useCallback } from "react";

export default function CarMapMarker({
  carInfo,
  setSelected,
  setMarkerRef,
}: {
  carInfo: SearchCarInfo;
  setSelected?: (carID: number) => void | null;
  setMarkerRef: (marker: Marker | null, carId: number) => void;
}) {
  const markerClassName = "text-center text-lg w-24 h-8";
  const carIdClassName = markerClassName + "z-0 text-white bg-rnt-button-gradient rounded-full";
  const selectedCarIdClassName =
    markerClassName + "z-20 rounded-lg text-black font-medium bg-white border-2 border-[#805FE4]";

  const className = carInfo.highlighted ? selectedCarIdClassName : carIdClassName;
  const zIndex = carInfo.highlighted ? 20 : 0;

  const ref = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) => setMarkerRef(marker, carInfo.carId),
    [setMarkerRef, carInfo.carId]
  );
  return (
    <AdvancedMarker
      // @ts-ignore
      id={carInfo.carId}
      ref={ref}
      key={carInfo.carId}
      position={carInfo.location}
      onClick={(e) => {
        if (setSelected !== undefined) {
          // @ts-ignore
          setSelected(Number(e.domEvent.target!.id));
        }
      }}
      zIndex={zIndex}
    >
      <div id={carInfo.carId.toString()} className={className}>
        ${carInfo.pricePerDayWithHostDiscount}
      </div>
    </AdvancedMarker>
  );
}
