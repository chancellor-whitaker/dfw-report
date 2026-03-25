export const generateColDefs = (data) => {
  const rows = [data].filter((element) => element).flat();

  return [...new Set(rows.map((row) => Object.keys(row)).flat())].map(
    (field) => ({ field })
  );
};
