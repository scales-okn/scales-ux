export const addMissingYears = (yearsData) => {
  const allYears = [];
  const firstYear = parseInt(yearsData[0], 10);
  const lastYear = parseInt(yearsData[yearsData.length - 1], 10);

  for (let year = firstYear; year <= lastYear; year++) {
    allYears.push(year.toString());
  }

  return allYears.map((year) => (yearsData.includes(year) ? year : null));
};
