//MMMM d, h:mm AM
export const dateFormat = (value: Date) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(value);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(value);

  return `${dateString}, ${timeString}`;
};

//MMMM d, h:mm AM
export const dateFormatShortMonth = (value: Date) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(value);

  return `${dateString}, ${timeString}`;
};

//yyyy-MM-dd
export const dateToHtmlDateFormat = (value: Date | undefined) => {
  if (value === undefined) return "";

  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  let month = (value.getMonth() + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  const year = value.getFullYear();
  return `${year}-${month}-${day}`;
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

//MMM dd
export const dateFormatMonthDate = (value: Date) => {
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);

  return `${dateString}`;
};

//dd MMM, HH:mm
export const dateFormatDayMonthTime = (value: Date) => {
  if (value === undefined || !isFinite(value.getTime())) return "";

  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  const monthString = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(value);

  let hours = value.getHours().toString();
  if (hours.length === 1) {
    hours = "0" + hours;
  }
  let minutes = value.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  return `${day} ${monthString}, ${hours}:${minutes}`;
};

//dd MMM - dd MMM yyyy
export const dateRangeFormatDayMonth = (valueFrom: Date, valueTo: Date) => {
  if (!valueFrom || !valueTo) return "";

  let dayFrom = valueFrom.getDate().toString();
  if (dayFrom.length === 1) {
    dayFrom = "0" + dayFrom;
  }
  const monthFromString = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(valueFrom);

  let dayTo = valueTo.getDate().toString();
  if (dayTo.length === 1) {
    dayTo = "0" + dayTo;
  }
  const monthToString = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(valueTo);

  const year = valueTo.getFullYear();

  return `${dayFrom} ${monthFromString} - ${dayTo} ${monthToString} ${year}`;
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