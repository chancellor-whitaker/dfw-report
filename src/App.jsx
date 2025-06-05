import { useCallback, useState, useMemo } from "react";

import { usePopover } from "./hooks/usePopover";
import { useData } from "./hooks/useData";

// should you use inputs because it minimizes confusion & overthinking?

const useFileData = ({
  url = "Data/fileList.json",
  primaryKey = "term_code",
  nameKey = "filename",
}) => {
  const fileList = useData(url);

  const [fileId, setFileId] = useState(null);

  const canInitializeFileId =
    Array.isArray(fileList) && fileList.length > 0 && fileId === null;

  if (canInitializeFileId) setFileId(fileList[0][primaryKey]);

  const file = fileId
    ? fileList.find(({ [primaryKey]: id }) => id === fileId)
    : null;

  const fileName = file ? file[nameKey] : null;

  const data = useData(fileName);

  return { data };
};

const findEveryValuePresent = (data) => {
  const object = {};

  const rows = [data].filter((element) => element).flat();

  rows.forEach((row) =>
    Object.entries(row).forEach(([key, value]) => {
      if (!(key in object)) object[key] = new Set();

      object[key].add(value);
    })
  );

  return object;
};

export default function App() {
  const [dropdownChanges, setDropdownChanges] = useState([]);

  const { data } = useFileData({});

  const everyValuePresent = useMemo(() => findEveryValuePresent(data), [data]);

  const handleDropdownItemClicked = useCallback(
    ({ target }) =>
      setDropdownChanges((changes) => {
        if (target.role === "multiple") {
          const filteredChanges = changes.filter(
            ({ name }) => name !== target.name
          );

          if (!target.checked) return [...filteredChanges, target];

          return filteredChanges;
        }

        if (target.role === "single") {
          const uncheckAllOccurrence = changes.find(
            ({ checked, name, role }) =>
              !checked && name === target.name && role === "multiple"
          );

          const filteredChanges = changes.filter(
            ({ value, name, role }) =>
              !(
                value === target.value &&
                name === target.name &&
                role === "single"
              )
          );

          if (
            (uncheckAllOccurrence && target.checked) ||
            (!uncheckAllOccurrence && !target.checked)
          ) {
            return [...filteredChanges, target];
          }

          return filteredChanges;
        }
      }),
    []
  );

  const dropdownsBreakdown = useMemo(() => {
    const lookup = {};

    dropdownChanges.forEach(({ checked, value, name, role }) => {
      if (role === "single") {
        if (!(name in lookup))
          lookup[name] = { unchecked: new Set(), checked: new Set() };

        if (checked) {
          lookup[name].checked.add(value);
        } else {
          lookup[name].unchecked.add(value);
        }
      }
    });

    const uncheckAllOccurrences = dropdownChanges.filter(
      ({ checked, role }) => !checked && role === "multiple"
    );

    const uncheckedByDefault = new Set(
      uncheckAllOccurrences.map(({ name }) => name)
    );

    const getExceptions = (name) => {
      if (!(name in lookup)) return new Set();

      if (!uncheckedByDefault.has(name)) {
        return lookup[name].unchecked;
      } else {
        lookup[name].checked;
      }
    };

    return Object.fromEntries(
      Object.keys(everyValuePresent).map((name) => [
        name,
        {
          default: !uncheckedByDefault.has(name),
          exceptions: getExceptions(name),
        },
      ])
    );
  }, [dropdownChanges, everyValuePresent]);

  const isChecked = useCallback(
    ({ value, name }) => {
      const { default: defaultStatus, exceptions } = dropdownsBreakdown[name];

      return (
        (defaultStatus && !exceptions.has(value)) ||
        (!defaultStatus && exceptions.has(value))
      );
    },
    [dropdownsBreakdown]
  );

  const dropdowns = useMemo(
    () =>
      Object.entries(everyValuePresent).map(([name, values]) => [
        name,
        [...values].sort().map((value) => ({
          checked: isChecked({ value: `${value}`, name }),
          onChange: handleDropdownItemClicked,
          type: "checkbox",
          role: "single",
          label: value,
          value,
          name,
        })),
      ]),
    [everyValuePresent, handleDropdownItemClicked, isChecked]
  );

  console.log(dropdownsBreakdown);

  return (
    <>
      <main className="container">
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div className="d-flex flex-wrap gap-2">
            {dropdowns.map(([name, items]) => (
              <Dropdown label={name} key={name}>
                <ListGroup>{items}</ListGroup>
              </Dropdown>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

const Dropdown = ({ label = "Dropdown", children }) => {
  const { popover, isOpen, open } = usePopover();

  return (
    <div className="dropdown">
      <button
        className={["btn btn-secondary dropdown-toggle", isOpen && "active"]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {label}
      </button>
      {isOpen && (
        <ul className="dropdown-menu show" ref={popover}>
          {children}
        </ul>
      )}
    </div>
  );
};

const ListGroup = ({ children = [] }) => {
  return (
    <div
      className="list-group list-group-flush overflow-y-scroll"
      style={{ maxHeight: 200 }}
    >
      {[children]
        .filter((element) => element)
        .flat()
        .map(({ label, ...item }) => (
          <label className="list-group-item d-flex gap-2" key={item.value}>
            <input className="form-check-input flex-shrink-0" {...item} />
            <span>{label}</span>
          </label>
        ))}
    </div>
  );
};
