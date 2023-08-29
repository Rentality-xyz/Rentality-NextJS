import { Snackbar, Alert, Backdrop } from "@mui/material";
import { DialogState } from "@/model/ui/dialogState";

export default function RntDialogs({
  state,
  hide,
}: {
  state: DialogState;
  hide: () => void;
}) {
  return state.action === null ? (
    <Snackbar
      anchorOrigin={state.anchorOrigin}
      autoHideDuration={state.autoHideDuration}
      open={state.isOpen}
      onClose={hide}
      message={state.message}
    >
      <Alert
        severity={state.alertColor}
        sx={{
          width: "100%",
          //backgroundColor: snackbarState.backgroundColor,
          color: "#000",
          borderRadius: "9999px",
        }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  ) : (
    <Snackbar
      anchorOrigin={state.anchorOrigin}
      autoHideDuration={state.autoHideDuration}
      open={state.isOpen}
      onClose={hide}
      message={state.message}
      action={state.action}
    ></Snackbar>
  );
}
