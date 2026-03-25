import { isStringNumeric } from "./isStringNumeric";
import { sumArray } from "./sumArray";

export const summarizeData = (data) => {
  const rows = [data].filter((element) => element).flat();

  const object = {};

  rows.forEach((row) => {
    Object.keys(row).forEach((field) => {
      if (!(field in object)) {
        object[field] = { isNumeric: true, distinct: 0, values: {}, sum: 0 };
      }

      object[field].sum++;

      const value = row[field];

      if (!(value in object[field].values)) {
        if (!isStringNumeric(`${value}`)) object[field].isNumeric = false;

        object[field].values[value] = 0;

        object[field].distinct++;
      }

      object[field].values[value]++;
    });
  });

  return Object.fromEntries(
    Object.entries(object).map(
      ([field, { isNumeric, distinct, values, sum }]) => [
        field,
        {
          average: !isNumeric
            ? null
            : sumArray(
                Object.entries(values).map(
                  ([value, count]) => Number(value) * count
                )
              ) / sum,
          values: Object.fromEntries(
            Object.entries(values).map(([value, count]) => [
              value,
              { ratio: count / sum, count },
            ])
          ),
          min: !isNumeric
            ? null
            : Math.min(
                ...Object.entries(values).map(([value]) => Number(value))
              ),
          max: !isNumeric
            ? null
            : Math.max(
                ...Object.entries(values).map(([value]) => Number(value))
              ),
          isNumeric,
          distinct,
          sum,
        },
      ]
    )
  );
};
