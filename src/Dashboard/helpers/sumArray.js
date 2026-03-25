export const sumArray = (arr) => {
  return arr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
};
