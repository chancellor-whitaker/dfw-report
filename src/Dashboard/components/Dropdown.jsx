import { usePopover } from "../hooks/usePopover";

export const Dropdown = ({
  variant = "secondary",
  label = "Dropdown",
  items = [],
}) => {
  const { popover, isOpen, open } = usePopover();

  return (
    <div className="dropdown">
      <button
        className={[`btn btn-${variant} dropdown-toggle`, isOpen && "active"]
          .filter((element) => element)
          .join(" ")}
        onClick={open}
        type="button"
      >
        {label}
      </button>
      {isOpen && (
        <ul
          className="dropdown-menu show overflow-y-scroll"
          style={{ maxHeight: 210 }}
          ref={popover}
        >
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
