export const findColumnValues = (data) => {
  const rows = [data].filter((element) => element).flat();

  const columnValues = {};

  rows.forEach((row) =>
    Object.entries(row).forEach(([column, value]) => {
      if (!(column in columnValues)) columnValues[column] = new Set();

      columnValues[column].add(value);
    })
  );

  return columnValues;
};
