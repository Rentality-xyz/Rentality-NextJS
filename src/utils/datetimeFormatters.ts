import moment from "moment";

/**
 * return date in format "MMM DD"
 */
export const dateFormatShortMonthDate = (value: Date, timeZone?: string) => {
  const format = "MMM DD";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "MMM D, h:mm A"
 */
export const dateFormatShortMonthDateTime = (value: Date, timeZone?: string) => {
  const format = "MMM D, h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "MMMM D, h:mm A"
 */
export const dateFormatLongMonthDateTime = (value: Date, timeZone?: string) => {
  const format = "MMMM D, h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "MMM DD YYYY"
 */
export const dateFormatShortMonthDateYear = (value: Date, timeZone?: string) => {
  const format = "MMM DD YYYY";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "MMM D, YYYY h:mm A"
 */
export const dateFormatLongMonthYearDateTime = (value: Date, timeZone?: string) => {
  const format = "MMM D, YYYY h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "MMM D, YYYY"
 */
export const dateFormatLongMonthYearDate = (value: Date, timeZone?: string) => {
  const format = "MMM D, YYYY";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

/**
 * return date in format "YYYY-MM-DD"
 */
export const dateToHtmlDateFormat = (value: Date | undefined) => {
  if (value === undefined) return "";
  return moment(value).format("YYYY-MM-DD");
};

/**
 * return date in format "YYYY-MM-DDTHH:mm"
 */
export const dateToHtmlDateTimeFormat = (value: Date | undefined) => {
  if (value === undefined) return "";
  return moment(value).format("YYYY-MM-DDTHH:mm");
};

/**
 * return date range in format "MMM DD - MMM DD YYYY"
 */
export const dateRangeFormatShortMonthDateYear = (valueFrom: Date, valueTo: Date, timeZone?: string) => {
  if (!valueFrom || !valueTo) return "";

  const year = valueTo.getFullYear();

  return `${dateFormatShortMonthDate(valueFrom, timeZone)} - ${dateFormatShortMonthDate(valueTo, timeZone)} ${year}`;
};
