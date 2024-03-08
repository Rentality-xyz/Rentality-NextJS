import { createContext, PropsWithChildren, useState, useEffect, useContext } from "react";

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/js';

export interface GoogleMapsContextType {
	googleMapsAPIIsLoaded: boolean;
}

export interface GoogleMapsAPIUrlParameters {
	googleMapsAPIKey: string;
	libraries?: string[];
	language?: string;
	region?: string;
	version?: string;
	authReferrerPolicy?: string;
}

export interface GoogleMapsProviderProps extends GoogleMapsAPIUrlParameters {
	onLoadScript?: () => void;
}

export const GoogleMapsContext = createContext<GoogleMapsContextType>({
	googleMapsAPIIsLoaded: false
});

export const GoogleMapsProvider = ({
	children,
	libraries,
	language,
	region,
	version,
	authReferrerPolicy,
	onLoadScript
}: PropsWithChildren<GoogleMapsProviderProps>) => {

	const [isLoadingAPI, setIsLoadingAPI] = useState<boolean>(true);

	// Handle Google Maps API loading
	// eslint-disable-next-line complexity
	useEffect(() => {
		const apiLoadingFinished = () => {
			setIsLoadingAPI(false);
			onLoadScript && onLoadScript();
		};

		const defaultLanguage = navigator.language.slice(0, 2);
		const defaultRegion = navigator.language.slice(3, 5);

		/* eslint-disable camelcase */
		const params = new URLSearchParams({
			loading: "async",
			key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
			language: language || defaultLanguage,
			region: region || defaultRegion,
			...(libraries?.length && { libraries: libraries.join(',') }),
			...(version && { v: version }),
			...(authReferrerPolicy && { auth_referrer_policy: authReferrerPolicy })
		});
		/* eslint-enable camelcase */

		const existingScriptTag: HTMLScriptElement | null = document.querySelector(
			`script[src^="${GOOGLE_MAPS_API_URL}"]`
		);

		// Check if Google Maps API was loaded with the passed parameters
		if (existingScriptTag) {
			const loadedURL = new URL(existingScriptTag.src);
			const loadedParams = loadedURL.searchParams.toString();
			const passedParams = params.toString();

			if (loadedParams !== passedParams) {
				console.error(
					'The Google Maps API Parameters passed to the `GoogleMapsProvider` components do not match. The Google Maps API can only be loaded once. Please make sure to pass the same API parameters to all of your `GoogleMapsProvider` components.',
					'\n\nExpected parameters:',
					Object.fromEntries(loadedURL.searchParams),
					'\n\nReceived parameters:',
					Object.fromEntries(params)
				);
			}
		}

		if (typeof google === 'object' && typeof google.maps === 'object') {
			// Google Maps API is already loaded
			apiLoadingFinished();
		} else if (existingScriptTag) {
			// Google Maps API is already loading
			setIsLoadingAPI(true);

			const onload = existingScriptTag.onload;
			existingScriptTag.onload = event => {
				onload?.call(existingScriptTag, event);
				apiLoadingFinished();
			};
		} else {
			// Load Google Maps API
			setIsLoadingAPI(true);

			const scriptTag = document.createElement('script');
			scriptTag.type = 'text/javascript';
			scriptTag.src = `${GOOGLE_MAPS_API_URL}?${params.toString()}`;
			document.getElementsByTagName('head')[0].appendChild(scriptTag);
		}
	}, [
		JSON.stringify(libraries),
		language,
		region,
		version,
		authReferrerPolicy
	]);;

	return (
		<GoogleMapsContext.Provider value={{ googleMapsAPIIsLoaded: !isLoadingAPI }}>
			{children}
		</GoogleMapsContext.Provider>
	);
};

export const useGoogleMapsContext = () => {
	const context = useContext(GoogleMapsContext);
	if (!context) {
		throw new Error("useGoogleMapsContext must be used within an GoogleMapsProvider");
	}
	return context;
};
