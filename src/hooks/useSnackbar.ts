import { useState } from "react";
import { SnackbarState, defaultSnackbarState } from "@/model/ui/snackbarState";
import { AlertColor } from "@mui/material";

const useSnackbar = () => {
  const [snackbarState, setSnackbarState] =
    useState<SnackbarState>(defaultSnackbarState);

  const showInfo = (message: string) => {
    setSnackbarState({
      ...snackbarState,
      message: message,
      alertColor: "info",
      isOpen: true,
    });
  };

  const showError = (message: string) => {
    setSnackbarState({
      ...snackbarState,
      message: message,
      alertColor: "error",
      isOpen: true,
    });
  };

  const showMessager = (message: string, color: AlertColor | undefined) => {
    if (color === undefined) {
      color = "info";
    }
    setSnackbarState({
      ...snackbarState,
      message: message,
      alertColor: color,
      isOpen: true,
    });
  };
  const hideSnackbar = () => {
    setSnackbarState(defaultSnackbarState);
  };

  return [
    snackbarState,
    showInfo,
    showError,
    showMessager,
    hideSnackbar,
  ] as const;
};

export default useSnackbar;
