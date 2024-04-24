import { Snackbar, Alert, Dialog, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { DialogState } from "@/model/ui/dialogState";

export default function RntDialogs({ state, hide }: { state: DialogState; hide: () => void }) {
  if (state.isDialog)
    return (
      <Dialog
        open={state.isOpen}
        onClose={hide}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "20px",
          },
        }}
      >
        <DialogContent
          sx={{
            background: "#240F50",
          }}
        >
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              color: "#fff",
            }}
          >
            {state.customForm ? state.customForm : state.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#240F50",
            justifyContent: "center",
          }}
        >
          {state.action}
        </DialogActions>
      </Dialog>
    );

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
      <div className="bg-[#009898] rounded-[30px_8px_30px_8px] max-w-[700px] text-lg p-[14px_16px] shadow-snackbar text-white">
        {state.message}
      </div>
    </Snackbar>
  );
}
