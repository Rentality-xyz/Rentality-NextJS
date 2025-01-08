import RntDialogs from "@/components/common/rntDialogs";
import RntSnackbar from "@/components/common/rntSnackbar";
import { DialogState, defaultDialogState } from "@/model/ui/dialogState";
import { defaultSnackbarState, SnackbarState } from "@/model/ui/snackbarState";
import { DialogActions } from "@/utils/dialogActions";
import { AlertColor } from "@mui/material";
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface IRntDialogs {
  showDialog: (message: string, action?: ReactNode) => void;
  showCustomDialog: (customForm: ReactNode) => void;
  hideDialogs: () => void;
}

interface IRntSnackbars {
  showInfo: (message: string, action?: ReactNode) => void;
  showError: (message: string, action?: ReactNode) => void;
  hideSnackbars: () => void;
}

const RntDialogsContext = createContext<IRntDialogs | undefined>(undefined);
const RntSnackbarsContext = createContext<IRntSnackbars | undefined>(undefined);

export const RntDialogsProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dialogState, setDialogState] = useState<DialogState>(defaultDialogState);
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(defaultSnackbarState);

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

  const hideDialogs = useCallback(() => {
    setDialogState(defaultDialogState);
  }, []);

  const showDialog = useCallback(
    (message: string, action?: ReactNode) => {
      setDialogState((prev) => {
        return {
          ...prev,
          message: message,
          action: action ?? DialogActions.OK(hideDialogs),
          isDialog: true,
          isOpen: true,
        };
      });
    },
    [hideDialogs]
  );

  const showInfo = useCallback((message: string, action?: ReactNode) => {
    setSnackbarState((prev) => {
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
    setSnackbarState((prev) => {
      return {
        ...prev,
        message: message,
        action: action,
        alertColor: "error",
        isOpen: true,
      };
    });
  }, []);

  const hideSnackbars = useCallback(() => {
    setSnackbarState(defaultSnackbarState);
  }, []);

  const showMessager = useCallback((message: string, color: AlertColor | undefined, action?: ReactNode) => {
    const colorValue = color ?? "info";
    setSnackbarState((prev) => {
      return {
        ...prev,
        message: message,
        action: action,
        alertColor: colorValue,
        isOpen: true,
      };
    });
  }, []);

  const valueDialogs: IRntDialogs = useMemo(() => {
    return {
      showDialog: showDialog,
      showCustomDialog: showCustomDialog,
      hideDialogs: hideDialogs,
    };
  }, [showDialog, showCustomDialog, hideDialogs]);

  const valueSnackbars: IRntSnackbars = useMemo(() => {
    return {
      showInfo: showInfo,
      showError: showError,
      hideSnackbars: hideSnackbars,
    };
  }, [showInfo, showError, hideSnackbars]);

  return (
    <>
      <RntDialogsContext.Provider value={valueDialogs}>
        <RntSnackbarsContext.Provider value={valueSnackbars}>{children}</RntSnackbarsContext.Provider>
      </RntDialogsContext.Provider>
      <RntDialogs state={dialogState} hide={hideDialogs} />
      <RntSnackbar state={snackbarState} hide={hideSnackbars} />
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

export const useRntSnackbars = () => {
  const context = useContext(RntSnackbarsContext);
  if (!context) {
    throw new Error("useRntSnackbars must be used within an RntSnackbarsContext");
  }
  return context;
};
