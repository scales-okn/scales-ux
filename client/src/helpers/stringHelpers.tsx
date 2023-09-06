import dayjs from "dayjs";

export const isAlphabetical = (str) => /^[a-zA-Z ]+$/.test(str);

export const includesSlash = (str) => str.includes("/");

export const convertToEpoch = (dateString: string) => {
  return dayjs(dateString, "YYYY/MM").toDate().valueOf();
};

export const convertToMMYYYY = (dateString: string) => {
  return dayjs(dateString, "YYYY/MM").format("M/YYYY");
};

export const stringIsNumber = (str) => isFinite(+str);

export const formatXUnits = (resultLabel, { formatMonths }) => {
  if (typeof resultLabel !== "string") return resultLabel;

  if (isAlphabetical(resultLabel)) {
    return resultLabel;
  } else if (resultLabel?.includes("/")) {
    if (formatMonths) return convertToMMYYYY(resultLabel);
    return convertToEpoch(resultLabel);
  } else {
    return parseInt(resultLabel);
  }
};

export const numberToMonth = (month: string): string => {
  if (!month || parseInt(month) < 1 || parseInt(month) > 12) {
    console.warn("Invalid month number"); // eslint-disable-line no-console
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
