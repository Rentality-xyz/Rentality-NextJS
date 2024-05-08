import { useRef, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

export default function Marker({
  map,
  position,
  onClick,
  children,
}: {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral;
  onClick: (...args: any[]) => void;
  children: React.ReactNode;
}) {
  const markerRef = useRef<AdvancedMarkerElement>();
  const rootRef = useRef<Root>();

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: container,
        gmpClickable: true,
      });
      markerRef.current.addListener("click", onClick);
    }
  }, []);

  useEffect(() => {
    if (!markerRef.current || !rootRef.current) return;
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
  }, [map, position, children]);

  return <></>;
}
