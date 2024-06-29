import { Renderer } from "@googlemaps/markerclusterer";

export class MapRenderer implements Renderer {
	render({ count, position }, stats, map) {
		// change color if this cluster has more markers than the mean cluster
		const color = count > Math.max(3, stats.clusters.markers.mean) ? "#06af8f" : "#0000ff";
		// create svg literal with fill color
		const svg = `<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100" height="100">
			<circle cx="120" cy="120" opacity=".6" r="70" />
			<circle cx="120" cy="120" opacity=".3" r="90" />
			<circle cx="120" cy="120" opacity=".2" r="110" />
			<text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${count}</text>
		</svg>`;
		const title = `Cluster of ${count} markers`,
		// adjust zIndex to be above other markers
		zIndex = Number(google.maps.Marker.MAX_ZINDEX) + count;
		// create cluster SVG element
		const parser = new DOMParser();
		const svgEl = parser.parseFromString(svg, "image/svg+xml").documentElement;
		svgEl.setAttribute("transform", "translate(0 25)");
		const clusterOptions = {
			map,
			position,
			zIndex,
			title,
			content: svgEl,
		};
		return new google.maps.marker.AdvancedMarkerElement(clusterOptions);
	}
}
