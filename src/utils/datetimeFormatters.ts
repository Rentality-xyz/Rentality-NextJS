export const dateFormat = (value: Date) => {
  const dateString = new Intl.DateTimeFormat('en-US', { month: "long", day: "numeric" }).format(value);
  const timeString = new Intl.DateTimeFormat('en-US', { hour: "numeric", minute: "numeric" }).format(value);

  return `${dateString}, ${timeString}`;
};