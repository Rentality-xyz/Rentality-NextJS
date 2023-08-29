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

export const dateToHtmlDateFormat = (value: Date| undefined) => {
  if (value === undefined) return "";
  
  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  let month = (value.getMonth()+1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  const year = value.getFullYear();
  return `${year}-${month}-${day}`;
};

export const dateToHtmlDateTimeFormat = (value: Date | undefined) => {
  if (value === undefined) return "";
  
  let day = value.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  let month = (value.getMonth()+1).toString();
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