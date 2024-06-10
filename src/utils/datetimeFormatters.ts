import moment from "moment";

//MMM DD
export const dateFormatShortMonthDate = (value: Date, timeZone?: string) => {
  const format = "MMM DD";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

//MMM D, h:mm A
export const dateFormatShortMonthDateTime = (value: Date, timeZone?: string) => {
  const format = "MMM D, h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

//MMMM D, h:mm A
export const dateFormatLongMonthDateTime = (value: Date, timeZone?: string) => {
  const format = "MMMM D, h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

//MMM DD YYYY
export const dateFormatShortMonthDateYear = (value: Date, timeZone?: string) => {
  const format = "MMM DD YYYY";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

export const dateFormatYearMonthDay = (value: Date, timeZone?: string) => {
  const format = "MM/DD/YYYY  ";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

export const dateFormatLongMonthYearDateTime = (value: Date, timeZone?: string) => {
  const format = "MMM D, YYYY h:mm A";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
};

//yyyy-MM-ddTHH:mm
export const dateToHtmlDateTimeFormat = (value: Date | undefined) => {
  if (value === undefined) return "";

  // return moment(value).format("yyyy-MM-DDTHH:mm");

  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  let month = (value.getMonth() + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  const year = value.getFullYear().toString();
  let hours = value.getHours().toString();
  if (hours.length === 1) {
    hours = "0" + hours;
  }
  let minutes = value.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

//MMM dd - MMM dd yyyy
export const dateRangeFormatShortMonthDateYear = (valueFrom: Date, valueTo: Date, timeZone?: string) => {
  if (!valueFrom || !valueTo) return "";

  const year = valueTo.getFullYear();

  return `${dateFormatShortMonthDate(valueFrom, timeZone)} - ${dateFormatShortMonthDate(valueTo, timeZone)} ${year}`;
};

export const dateFormatYearMonthDayTime = (value: Date | undefined) => {
  if (value === undefined) return "";
  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }

  const monthString = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(value);

  const year = value.getFullYear().toString();

  let hours = value.getHours().toString();
  if (hours.length === 1) {
    hours = "0" + hours;
  }
  let minutes = value.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  return `${day} ${monthString} ${year} ${hours}:${minutes}`;
};
