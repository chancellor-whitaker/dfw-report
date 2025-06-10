import { useDeferredValue, useCallback, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component

import { categoricalColumns } from "./constants/categoricalColumns";
import { findColumnValues } from "./helpers/findColumnValues";
import { getDataFileName } from "./helpers/getDataFileName";
import { generateColDefs } from "./helpers/generateColDefs";
import { DropdownItem } from "./components/DropdownItem";
import { transformData } from "./helpers/transformData";
import { Dropdown } from "./components/Dropdown";
import { getFileId } from "./helpers/getFileId";
import { groupRows } from "./helpers/groupRows";
import { useData } from "./hooks/useData";

export default function App() {
  const fileList = useData("Data/fileList.json");

  const [fileId, setFileId] = useState();

  const deferredFileId = useDeferredValue(fileId);

  if (!fileId && Array.isArray(fileList) && fileList.length > 0) {
    setFileId(getFileId(fileList[0]));
  }

  const file =
    deferredFileId &&
    fileList.find((file) => getFileId(file) === deferredFileId);

  const dataFileName = file && getDataFileName(file);

  const data = useData(dataFileName);

  const transformedData = useMemo(() => transformData(data), [data]);

  const dataColumnValues = useMemo(
    () => findColumnValues(transformedData),
    [transformedData]
  );

  const numericalCols = useMemo(
    () =>
      Object.keys(dataColumnValues).filter(
        (col) => !categoricalColumns.has(col)
      ),
    [dataColumnValues]
  );

  const columnLists = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(dataColumnValues)
          .map(([name, set]) => [name, [...set].sort()])
          .filter(([column]) => categoricalColumns.has(column))
      ),
    [dataColumnValues]
  );

  const [parameters, setParameters] = useState(new Set());

  const [checklistChanges, setChecklistChanges] = useState([]);

  const deferredParameters = useDeferredValue(parameters);

  const deferredChecklistChanges = useDeferredValue(checklistChanges);

  const onChecklistItemClicked = useCallback(
    (event) =>
      setChecklistChanges((state) => {
        const { checked, value, name } = event;

        const filterCallback =
          value === null
            ? (element) => element.name !== name
            : (element) => !(element.value === value && element.name === name);

        const filteredState = state.filter(filterCallback);

        const uncheckAllElement = filteredState.find(
          (element) =>
            element.checked === false &&
            element.name === name &&
            element.value === null
        );

        if (uncheckAllElement && checked) return [...filteredState, event];

        if (uncheckAllElement && !checked) return filteredState;

        if (!uncheckAllElement && checked) return filteredState;

        if (!uncheckAllElement && !checked) return [...filteredState, event];
      }),
    []
  );

  const checkedLookup = useMemo(() => {
    const object = {};

    deferredChecklistChanges.forEach(({ checked, value, name }) => {
      if (!(name in object)) {
        object[name] = { except: new Set(), checked: true };
      }

      if (value === null) {
        object[name].checked = checked;
      } else {
        object[name].except.add(value);
      }
    });

    return object;
  }, [deferredChecklistChanges]);

  const isChecked = useCallback(
    ({ value, name }) => {
      if (!(name in checkedLookup)) return true;

      const { checked, except } = checkedLookup[name];

      if (value === null) {
        if (checked && except.size === 0) return true;

        return false;
      }

      if (except.has(value)) return !checked;

      return checked;
    },
    [checkedLookup]
  );

  const filteredData = useMemo(
    () =>
      transformedData.filter((row) => {
        for (const [name, value] of Object.entries(row)) {
          if (!isChecked({ value, name })) return false;
        }
        return true;
      }),
    [isChecked, transformedData]
  );

  const rowData = useMemo(
    () => groupRows(filteredData, [...deferredParameters], numericalCols),
    [filteredData, deferredParameters, numericalCols]
  );

  const quantifyCondition = (condition) => (condition ? 1 : 0);

  const colDefs = useMemo(
    () =>
      generateColDefs(rowData).sort(
        ({ field: a }, { field: b }) =>
          quantifyCondition(categoricalColumns.has(b)) -
          quantifyCondition(categoricalColumns.has(a))
      ),
    [rowData]
  );

  console.log(rowData);

  const onParameterClicked = useCallback(
    (parameter) =>
      setParameters(
        (set) =>
          new Set(
            set.has(parameter)
              ? [...set].filter((element) => element !== parameter)
              : [...set, parameter]
          )
      ),
    []
  );

  const fileDropdown = (
    <Dropdown
      items={[fileList]
        .filter((element) => element)
        .flat()
        .map((file) => (
          <DropdownItem
            active={getFileId(file) === deferredFileId}
            onClick={() => setFileId(getFileId(file))}
            key={getFileId(file)}
          >
            {getFileId(file)}
          </DropdownItem>
        ))}
      label={deferredFileId}
    ></Dropdown>
  );

  const checklists = Object.entries(columnLists).map(([name, values]) => (
    <Dropdown
      items={[
        <DropdownItem
          onClick={() =>
            onChecklistItemClicked({
              checked: !isChecked({ value: null, name }),
              value: null,
              name,
            })
          }
        >
          <span className="icon-link">
            {isChecked({ value: null, name }) ? (
              <svg
                className="bi bi-check-square-fill"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                height={16}
                width={16}
              >
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="bi bi-square"
                fill="currentColor"
                viewBox="0 0 16 16"
                height={16}
                width={16}
              >
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              </svg>
            )}
            All
          </span>
        </DropdownItem>,
        ...values.map((value) => (
          <DropdownItem
            onClick={() =>
              onChecklistItemClicked({
                checked: !isChecked({ value, name }),
                value,
                name,
              })
            }
          >
            <span className="icon-link">
              {isChecked({ value, name }) ? (
                <svg
                  className="bi bi-check-square-fill"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="bi bi-square"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                </svg>
              )}
              {value}
            </span>
          </DropdownItem>
        )),
      ]}
      variant={isChecked({ value: null, name }) ? "secondary" : "warning"}
      label={name}
      key={name}
    ></Dropdown>
  ));

  const parametersDropdown = (
    <Dropdown
      items={[...categoricalColumns].map((parameter) => (
        <DropdownItem
          onClick={() => onParameterClicked(parameter)}
          key={parameter}
        >
          <span className="icon-link">
            {deferredParameters.has(parameter) ? (
              <svg
                className="bi bi-check-square-fill"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                height={16}
                width={16}
              >
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="bi bi-square"
                fill="currentColor"
                viewBox="0 0 16 16"
                height={16}
                width={16}
              >
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              </svg>
            )}
            {parameter}
          </span>
        </DropdownItem>
      ))}
      label={`Parameters: ${[...deferredParameters].join(", ")}`}
    ></Dropdown>
  );

  return (
    <main className="container">
      <div className="my-3 p-3 bg-body rounded shadow-sm">{fileDropdown}</div>
      <div className="my-3 p-3 bg-body rounded shadow-sm">
        <div className="d-flex flex-wrap gap-2">{checklists}</div>
      </div>
      <div className="my-3 p-3 bg-body rounded shadow-sm">
        {parametersDropdown}
      </div>
      <div className="my-3 p-3 bg-body rounded shadow-sm">
        <div style={{ height: 500 }}>
          <AgGridReact columnDefs={colDefs} rowData={rowData} />
        </div>
      </div>
    </main>
  );
}
