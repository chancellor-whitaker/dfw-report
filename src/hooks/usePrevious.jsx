import { useState } from "react";

export function usePrevious(value, callback) {
  const [previousValue, setPreviousValue] = useState(value);

  if (previousValue !== value) {
    setPreviousValue(value);

    typeof callback === "function" && callback(previousValue);
  }

  return previousValue;
}
