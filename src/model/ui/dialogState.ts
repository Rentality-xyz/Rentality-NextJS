import { AlertColor, SnackbarOrigin } from "@mui/material";
import { ReactNode } from "react";

export type DialogState = {
  isOpen: boolean;
  alertColor: AlertColor;
  message: string;
  action: ReactNode;
  anchorOrigin: SnackbarOrigin;
  backgroundColor: string;
  autoHideDuration: number;
  isDialog: boolean;
};

export const defaultDialogState: DialogState = {
  isOpen: false,
  alertColor: "info",
  message: "",
  action: null,
  anchorOrigin: { vertical: "top", horizontal: "center" },
  backgroundColor: "#22d7d3",
  autoHideDuration: 6000,
  isDialog: false,
};
