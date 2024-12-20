export const UTC_TIME_ZONE_ID = "Etc/UTC";

export const calculateDays = (dateFrom: Date, dateTo: Date) => {
  let difference = dateTo.getTime() - dateFrom.getTime();
  let totalDays = Math.max(Math.ceil(difference / (24 * 60 * 60 * 1000)), 1);
  return totalDays;
};
