export const DropdownItem = ({
  children = "Action",
  type = "button",
  className = "",
  active = false,
  as = "button",
  ...rest
}) => {
  const As = as;

  return (
    <As
      className={["dropdown-item", className, active && "active"]
        .filter((element) => element)
        .join(" ")}
      type={type}
      {...rest}
    >
      {children}
    </As>
  );
};
