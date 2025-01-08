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
      <div className="max-w-[700px] rounded-[30px_8px_30px_8px] bg-[#009898] p-[14px_16px] text-lg text-white shadow-snackbar">
        {state.message}
      </div>
    </Snackbar>
  );
}
