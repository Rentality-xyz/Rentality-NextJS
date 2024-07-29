import RntDialogs from "@/components/common/rntDialogs";
import { DialogState, defaultDialogState } from "@/model/ui/dialogState";
import { DialogActions } from "@/utils/dialogActions";
import { AlertColor } from "@mui/material";
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface IRntDialogs {
  showInfo: (message: string, action?: ReactNode) => void;
  showError: (message: string, action?: ReactNode) => void;
  showDialog: (message: string, action?: ReactNode) => void;
  showCustomDialog: (customForm: ReactNode) => void;
  hideDialogs: () => void;
}

const RntDialogsContext = createContext<IRntDialogs | undefined>(undefined);

export const RntDialogsProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dialogState, setDialogState] = useState<DialogState>(defaultDialogState);

  const showInfo = useCallback((message: string, action?: ReactNode) => {
    setDialogState((prev) => {
      return {
        ...prev,
        message: message,
        action: action,
        alertColor: "info",
        isOpen: true,
      };
    });
  }, []);

  const showError = useCallback((message: string, action?: ReactNode) => {
    setDialogState((prev) => {
      return {
        ...prev,
        message: message,
        action: action,
        alertColor: "error",
        isOpen: true,
      };
    });
  }, []);

  const showCustomDialog = useCallback((customForm: ReactNode) => {
    setDialogState((prev) => {
      return {
        ...prev,
        customForm: customForm,
        isDialog: true,
        isOpen: true,
      };
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setDialogState(defaultDialogState);
  }, []);

  const showDialog = useCallback(
    (message: string, action?: ReactNode) => {
      setDialogState((prev) => {
        return {
          ...prev,
          message: message,
          action: action ?? DialogActions.OK(hideSnackbar),
          isDialog: true,
          isOpen: true,
        };
      });
    },
    [hideSnackbar]
  );

  const showMessager = useCallback((message: string, color: AlertColor | undefined, action?: ReactNode) => {
    const colorValue = color ?? "info";
    setDialogState((prev) => {
      return {
        ...prev,
        message: message,
        action: action,
        alertColor: colorValue,
        isOpen: true,
      };
    });
  }, []);

  const value: IRntDialogs = useMemo(() => {
    return {
      showInfo: showInfo,
      showError: showError,
      showDialog: showDialog,
      showCustomDialog: showCustomDialog,
      hideDialogs: hideSnackbar,
    };
  }, [showInfo, showError, showDialog, showCustomDialog, hideSnackbar]);

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
