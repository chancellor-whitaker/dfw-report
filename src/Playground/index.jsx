import { useMemo } from "react";

import { transformData } from "./helpers/transformData";
import "./index";
import { useData } from "./hooks/useData";

export default function Playground() {
  const fileList = useData("Data/fileList.json");

  const file = Array.isArray(fileList) && fileList.length > 0 && fileList[0];

  const fileName = file && file.filename;

  const data = useData(fileName);

  const transformedData = useMemo(() => transformData(data), [data]);

  console.log(transformedData);

  return (
    <>
      <div>Chance</div>
      <div>Chancellor</div>
    </>
  );
}
