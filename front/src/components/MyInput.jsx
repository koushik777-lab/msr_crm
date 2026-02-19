import { TextField } from "@mui/material";

export default function MyInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  width = "full",
  ...restProps
}) {
  // console.log("LABEL", label, "VALUE", value);
  return (
    <TextField
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      className={`w-${width}  `}
      size="small"
      {...restProps}
    />
  );
}
