import { Snackbar, Alert, Backdrop } from "@mui/material";
import { DialogState } from "@/model/ui/dialogState";

export default function RntDialogs({ state, hide }: { state: DialogState; hide: () => void }) {
  return state.action === null ? (
    <Snackbar
      anchorOrigin={state.anchorOrigin}
      autoHideDuration={state.autoHideDuration}
      open={state.isOpen}
      onClose={hide}
      message={state.message}
      sx={{ top: "8% !important" }}
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
      sx={{ top: "8% !important" }}
    >
      <div className="bg-[#009898] rounded-[30px_8px_30px_8px] max-w-[700px] text-lg p-[14px_16px] shadow-snackbar">
        {state.message}
      </div>
    </Snackbar>
  );
}
