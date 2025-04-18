import moment from "moment";
import { UTC_TIME_ZONE_ID } from "./constants";

export const calculateDaysByBlockchainLogic = (dateFrom: Date, dateTo: Date) => {
  let difference = moment.utc(dateTo).unix() - moment.utc(dateFrom).unix();
  let totalDays = Math.max(Math.ceil(difference / (24 * 60 * 60 * 1000)), 1);
  return totalDays;
};
