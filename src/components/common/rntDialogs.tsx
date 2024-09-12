import { Dialog, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { DialogState } from "@/model/ui/dialogState";

export default function RntDialogs({ state, hide }: { state: DialogState; hide: () => void }) {
  return (
    <Dialog
      open={state.isOpen}
      onClose={hide}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: "#240F50",
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
          component={"div"}
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
}
