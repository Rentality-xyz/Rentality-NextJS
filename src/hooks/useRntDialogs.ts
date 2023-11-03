import { ReactNode, useState } from "react";
import { AlertColor } from "@mui/material";
import { DialogState, defaultDialogState } from "@/model/ui/dialogState";

const useRntDialogs = () => {
  const [dialogState, setDialogState] = useState<DialogState>(defaultDialogState);

  const showInfo = (message: string, action?: ReactNode) => {
    setDialogState({
      ...dialogState,
      message: message,
      action: action,
      alertColor: "info",
      isOpen: true,
    });
  };

  const showError = (message: string, action?: ReactNode) => {
    setDialogState({
      ...dialogState,
      message: message,
      action: action,
      alertColor: "error",
      isOpen: true,
    });
  };

  const showMessager = (message: string, color: AlertColor | undefined, action?: ReactNode) => {
    if (color === undefined) {
      color = "info";
    }
    setDialogState({
      ...dialogState,
      message: message,
      action: action,
      alertColor: color,
      isOpen: true,
    });
  };
  const hideSnackbar = () => {
    setDialogState(defaultDialogState);
  };

  return [dialogState, showInfo, showError, showMessager, hideSnackbar] as const;
};

export default useRntDialogs;
