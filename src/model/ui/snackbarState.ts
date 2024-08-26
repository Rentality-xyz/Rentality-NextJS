import { AlertColor, SnackbarOrigin } from "@mui/material";
import { ReactNode } from "react";

export type SnackbarState = {
  isOpen: boolean;
  alertColor: AlertColor;
  message: string;
  action: ReactNode;
  anchorOrigin: SnackbarOrigin;
  backgroundColor: string;
  autoHideDuration: number;
};

export const defaultSnackbarState: SnackbarState = {
  isOpen: false,
  alertColor: "info",
  message: "",
  action: null,
  anchorOrigin: { vertical: "top", horizontal: "center" },
  backgroundColor: "#22d7d3",
  autoHideDuration: 6000,
};
