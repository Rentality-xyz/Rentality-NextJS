//MMM dd
export const dateFormatShortMonthDate = (value: Date, timeZone?: string) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timeZone,
  }).format(value);

  return `${dateString}`;
};

//MMM d, h:mm AM
export const dateFormatShortMonthDateTime = (value: Date, timeZone?: string) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timeZone,
  }).format(value);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    timeZone: timeZone,
  }).format(value);

  return `${dateString}, ${timeString}`;
};

//MMMM d, h:mm AM
export const dateFormatLongMonthDateTime = (value: Date, timeZone?: string) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: timeZone,
  }).format(value);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    timeZone: timeZone,
  }).format(value);

  return `${dateString}, ${timeString}`;
};

//yyyy-MM-ddTHH:mm
export const dateToHtmlDateTimeFormat = (value: Date | undefined) => {
  if (value === undefined) return "";

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

  return `${dateFormatShortMonthDate(valueFrom)} - ${dateFormatShortMonthDate(valueTo)} ${year}`;
};
