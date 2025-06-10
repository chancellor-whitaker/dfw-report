export const groupRows = (data, categoricalCols, numericalCols) => {
  if (categoricalCols.length === 0) return data;

  const initialTotals = Object.fromEntries(
    numericalCols.map((col) => [col, 0])
  );

  const rows = [data].filter((element) => element).flat();

  const array = [];

  const tree = {};

  rows.forEach((row) => {
    let node = tree;

    const categoricalPairs = categoricalCols.map((col) => [col, row[col]]);

    categoricalPairs.forEach(([, value], index) => {
      if (!(value in node)) {
        if (index === categoricalPairs.length - 1) {
          node[value] = {
            ...Object.fromEntries(categoricalPairs),
            ...initialTotals,
          };

          array.push(node[value]);
        } else {
          node[value] = {};
        }
      }

      node = node[value];
    });

    const numericalPairs = numericalCols.map((col) => [col, row[col]]);

    numericalPairs.forEach(([col, value]) => {
      if (typeof value === "number") node[col] += value;
    });
  });

  return array;
};
