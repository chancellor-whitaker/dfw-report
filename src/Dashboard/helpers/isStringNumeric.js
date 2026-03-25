export const isStringNumeric = (string) => {
  const method1 = (value) => !Number.isNaN(value);

  const method2 = (value) => /^[+-]?\d+(\.\d+)?$/.test(value);

  const method3 = (value) => !Number.isNaN(Number(value));

  const method4 = (value) => Number.isFinite(+value);

  const method5 = (value) => value == Number.parseFloat(value);

  return ![method1, method2, method3, method4, method5]
    .map((method) => method(string))
    .some((value) => !value);
};
