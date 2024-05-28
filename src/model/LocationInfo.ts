export type LocationInfo = {
  address: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  timeZoneId?: string;
};

export const emptyLocationInfo = {
  address: "",
  country: "",
  state: "",
  city: "",
  latitude: 0,
  longitude: 0,
  timeZoneId: "",
};
