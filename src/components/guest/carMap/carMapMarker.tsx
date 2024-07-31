import { useRef, useState, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

export default function Marker({
  map,
  position,
  onClick,
  markerClusterer,
  zIndex,
  children,
}: {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral;
  onClick: (...args: any[]) => void;
  markerClusterer: MarkerClusterer;
  zIndex: number;
  children: React.ReactNode;
}) {
  const [markerRef, setMarkerRef] = useState<AdvancedMarkerElement | null>(null);
  const rootRef = useRef<Root>();

  useEffect(() => {
    var advancedMarker = markerRef;

    const container = document.createElement("div");
    rootRef.current = createRoot(container);

    advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: container,
      gmpClickable: true,
      zIndex: zIndex,
    });

    advancedMarker.addListener("click", onClick);

    if (markerClusterer) {
      markerClusterer.addMarker(advancedMarker);
    }

    setMarkerRef(advancedMarker);

    rootRef.current.render(children);
  }, []);

  useEffect(() => {
    if (!markerRef || !rootRef.current) return;

    const newMarker = markerRef;

    newMarker.position = position;
    newMarker.map = map;
    newMarker.zIndex = zIndex;

    setMarkerRef(newMarker);

    rootRef.current.render(children);
  }, [map, position, zIndex, children]);

  return <></>;
}
