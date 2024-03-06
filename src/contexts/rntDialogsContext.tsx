import RntDialogs from "@/components/common/rntDialogs";
import { DialogState } from "@/model";
import { defaultDialogState } from "@/model/ui/dialogState";
import { DialogActions } from "@/utils/dialogActions";
import { AlertColor } from "@mui/material";
import { ReactNode, createContext, useCallback, useContext, useState } from "react";

interface IRntDialogs {
  showInfo: (message: string, action?: ReactNode) => void;
  showError: (message: string, action?: ReactNode) => void;
  showDialog: (message: string, action?: ReactNode) => void;
  hideDialogs: () => void;
}

const RntDialogsContext = createContext<IRntDialogs | undefined>(undefined);

export const RntDialogsProvider = ({ children }: { children?: React.ReactNode }) => {
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

  const showDialog = (message: string, action?: ReactNode) => {
    setDialogState({
      ...dialogState,
      message: message,
      action: action ?? DialogActions.OK(hideSnackbar),
      isDialog: true,
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

  const value: IRntDialogs = {
    showInfo: showInfo,
    showError: showError,
    showDialog: showDialog,
    hideDialogs: hideSnackbar,
  };

  return (
    <>
      <RntDialogsContext.Provider value={value}>{children}</RntDialogsContext.Provider>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </>
  );
};

export const useRntDialogs = () => {
  const context = useContext(RntDialogsContext);
  if (!context) {
    throw new Error("useRntDialogs must be used within an RntDialogsContext");
  }
  return context;
};
