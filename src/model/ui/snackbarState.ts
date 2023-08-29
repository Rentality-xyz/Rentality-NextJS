import { AlertColor, SnackbarOrigin } from "@mui/material";

export type SnackbarState = {
  isOpen: boolean;
  alertColor: AlertColor;
  message: string;
  anchorOrigin: SnackbarOrigin;
  backgroundColor: string;
  autoHideDuration: number;
};

export const defaultSnackbarState: SnackbarState = {
  isOpen: false,
  alertColor: "info",
  message: "",
  anchorOrigin: { vertical: "top", horizontal: "center" },
  backgroundColor: "#22d7d3",
  autoHideDuration: 6000,
};
