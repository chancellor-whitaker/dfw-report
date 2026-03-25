export default function App({
  className = "",
  children = [],
  as = "main",
  ...rest
}) {
  const As = as;

  return (
    <As
      className={["container", className]
        .filter((element) => element)
        .join(" ")}
      {...rest}
    >
      {[children]
        .filter((element) => element)
        .flat()
        .map((child, index) => (
          <div className="my-3 p-3 bg-body rounded shadow-sm" key={index}>
            {child}
          </div>
        ))}
    </As>
  );
}
