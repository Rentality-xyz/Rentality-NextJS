import { isEmpty } from "@/utils/string";
import { FocusEvent } from "react";
import { twMerge } from "tailwind-merge";
import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function RntDatePicker({
  className,
  labelClassName,
  inputClassName,
  validationClassName,
  id,
  label,
  type,
  value,
  readOnly,
  validationError,
  onDateChange,
  onBlur: onBlurHandler,
  maxDate,
}: {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  id: string;
  type?: string;
  label?: string;
  readOnly?: boolean;
  value: Date | undefined;
  validationError?: string;
  onDateChange?: (date: Date | null) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
  maxDate?: Date | undefined;
}) {
  const isShowLabel = label !== undefined && label?.length > 0;

  type = type ?? "text";
  const cClassName = twMerge("text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
  const iClassName = twMerge(
    "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
    inputClassName
  );
  const vClassName = twMerge("text-red-400 mt-2", validationClassName);

  const newTheme = createTheme({
    components: {
      MuiFormControl: {
        styleOverrides: {
          root: {
            color: "black",
            backgroundColor: "white",
            paddingLeft: "15px",
            width: "100%",
            height: "48px",
            borderRadius: "24px",
            border: "2px solid white",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "white",
            position: "initial",
            borderRadius: "24px",
            width: "calc(100% - 4px)",
            height: "calc(48px - 4px)",
          },
        },
      },
    },
  });

  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={newTheme}>
          <DesktopDatePicker
            className={iClassName}
            readOnly={readOnly}
            disabled={readOnly}
            onChange={(date) => onDateChange != null && onDateChange(date!)}
            maxDate={maxDate}
            renderInput={(params) => (
              <TextField
                id={id}
                onBlur={onBlurHandler}
                {...params}
                inputProps={{
                  ...params.inputProps,
                  placeholder: "MM/DD/YYYY",
                }}
                autoComplete="off"
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&.Mui-focused fieldset": {
                      border: "2px solid black",
                    },
                    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                      borderColor: "transparent",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "black",
                    },
                    fontSize: "14px",
                    fontFamily: "sans-serif",
                  },
                }}
              />
            )}
            value={value ?? null}
          />
        </ThemeProvider>
      </LocalizationProvider>

      {!isEmpty(validationError) ? <p className={vClassName}>* {validationError}</p> : null}
    </div>
  );
}
