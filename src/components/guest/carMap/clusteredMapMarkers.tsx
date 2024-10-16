import { SearchCarInfo } from "@/model/SearchCarsResult";
import CarMapMarker from "@/components/guest/carMap/carMapMarker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Marker, MarkerClusterer } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { MapRenderer } from "@/components/guest/carMap/carMapRenderer";

export const ClusteredMapMarkers = ({
    carInfos,
    selectedCar,
    setSelected,
  } : {
    carInfos : SearchCarInfo[],
    selectedCar: SearchCarInfo | undefined,
    setSelected?: (carID: number) => void | null;
  }) => {

  const map = useMap()

  const [markers, setMarkers] = useState<{[key: number]: Marker}>({});

  const setMarkerRef = useCallback((marker: Marker | null, carId: number) => {
    setMarkers(markers => {
      if ((marker && markers[carId]) || (!marker && !markers[carId]))
        return markers;

      if (marker) {
        return {...markers, [carId]: marker};
      } else {
        const {[carId]: _, ...newMarkers} = markers;

        return newMarkers;
      }
    });
  }, []);

  const clusterer = useMemo(() => {
    if (!map) return null;
    return new MarkerClusterer({map, renderer: new MapRenderer() });
  }, [map]);

  useEffect(() => {
    if (!clusterer) return;

    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  useEffect(() => {
    if (!map) return;

    if (selectedCar) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(selectedCar.location.lat, selectedCar.location.lng));
      map.fitBounds(bounds);
      map.setZoom(18);
    }
  }, [map, selectedCar]);

  return (
    <>
    {carInfos.map((carInfo: SearchCarInfo) =>
        (
          <CarMapMarker
            key={carInfo.carId}
            carInfo={carInfo}
            setSelected={setSelected}
            setMarkerRef={setMarkerRef}
          />
        )
      )
    }
    </>
  )
}