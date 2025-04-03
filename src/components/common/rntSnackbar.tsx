import { SnackbarState } from "@/model/ui/snackbarState";
import { Snackbar, Alert } from "@mui/material";

export default function RntSnackbar({ state, hide }: { state: SnackbarState; hide: () => void }) {
  if (state.action === null)
    return (
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
            color: "#000",
            borderRadius: "9999px",
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    );
  return (
    <Snackbar
      anchorOrigin={state.anchorOrigin}
      autoHideDuration={state.autoHideDuration}
      open={state.isOpen}
      onClose={hide}
      message={state.message}
      action={state.action}
      sx={{ top: "8% !important" }}
    >
      <div
        className="max-w-[700px] rounded-[30px_8px_30px_8px] p-[14px_16px] text-lg shadow-snackbar"
        style={{
          backgroundColor: state.backgroundColor,
          color: state.textColor,
        }}
      >
        {state.message}
      </div>
    </Snackbar>
  );
}
