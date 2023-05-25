export const calculateDays = (dateFrom: Date, dateTo: Date) => {
    let difference = dateTo.getTime() - dateFrom.getTime();
    let totalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return totalDays;
  };