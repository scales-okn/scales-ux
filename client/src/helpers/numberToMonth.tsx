const numberToMonth = (month: string): string => {
  if (!month || parseInt(month) < 1 || parseInt(month) > 12) {
    console.warn("Invalid month number");
    return "";
  }

  const months = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };

  return months[month] || "";
};

export default numberToMonth;
