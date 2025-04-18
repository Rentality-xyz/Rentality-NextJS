import moment from "moment";
import { isEmpty } from "./string";
import { UTC_TIME_ZONE_ID } from "./constants";

export const calculateDaysByBlockchainLogic = (dateFrom: Date, dateTo: Date) => {
  let difference = moment.utc(dateTo).unix() - moment.utc(dateFrom).unix();
  let totalDays = Math.max(Math.ceil(difference / (24 * 60 * 60 * 1000)), 1);
  return totalDays;
};

export function parseDateIntervalWithDSTCorrection(
  dateFromString: string,
  dateToString: string,
  timeZoneId: string
): { dateFrom: Date; dateTo: Date; totalDays: number } {
  const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;

  const dateFromMoment = moment.tz(dateFromString, notEmtpyTimeZoneId);
  const dateFrom = dateFromMoment.toDate();
  const dateFromUtcOffset = dateFromMoment.utcOffset();

  const dateToMoment = moment.tz(dateToString, notEmtpyTimeZoneId);
  const dateToUtcOffset = dateToMoment.utcOffset();

  const dateToCorrected =
    dateToUtcOffset - dateFromUtcOffset > 0
      ? dateToMoment.toDate()
      : dateToMoment.add(dateToUtcOffset - dateFromUtcOffset, "minutes").toDate();

  const totalDays = calculateDaysByBlockchainLogic(dateFrom, dateToCorrected);

  return { dateFrom, dateTo: dateToCorrected, totalDays };
}
