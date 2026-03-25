import { useState } from "react";

export const usePrevious = (value, callback) => {
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);

    typeof callback === "function" && callback(prevValue);
  }

  return prevValue;
};
