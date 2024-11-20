export type Insurance = {
  type: string; // General Insurance ID | ?
  photos: string[];
  companyName: string;
  policyNumber: string;
  comment: string;
  uploadedBy: string; // `Guest ${guestName} uploaded ${dateTime, DD.MM.YY hh:mm tt}` | `Guest ${guestName} deleted ${dateTime, DD.MM.YY hh:mm tt}`
};

export type TripInsurance = {
  tripId: number;
  tripInfo: string; // "For all trips" | `#${tripId} ${carBrand} ${carModel} ${carYear} ${dateFrom, MMM DD} - ${dateTo, MMM DD YYYY}`
  insurance: Insurance;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
};
