import * as React from "react";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import RntButton from "./rntButton";
import { TripInfo } from "@/model/TripInfo";

export default function RntWalletsModal({ tripInfo }: { tripInfo: TripInfo }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const maskWallet = (str: string) => {
    return (
      str.substring(0, 6) +
      str.substring(6, str.length - 6).replace(/./g, ".") +
      str.substring(str.length - 6, str.length)
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <React.Fragment>
      <Link href="#" onClick={handleClickOpen}>
        View
      </Link>
      <Dialog
        maxWidth="sm"
        open={open}
        onClose={handleClose}
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
            sx={{
              color: "#fff",
            }}
            id="alert-dialog-description"
          >
            <div className="flex flex-col divide-y">
              <div className="p-2">
                <strong>{"Guest's wallet:"}</strong>
                <span className="ms-2 text-gray-500">{maskWallet(tripInfo.guest.walletAddress)}</span>
                <RntButton className="ms-2 w-20 h-8" onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}>
                  Copy
                </RntButton>
              </div>
              <div className="p-2">
                <strong>{"Host's wallet:"}</strong>
                <span className="ms-2 text-gray-500">{maskWallet(tripInfo.host.walletAddress)}</span>
                <RntButton className="ms-2 w-20 h-8" onClick={() => copyToClipboard(tripInfo.host.walletAddress)}>
                  Copy
                </RntButton>
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#240F50",
            justifyContent: "center",
          }}
        >
          <RntButton onClick={handleClose} autoFocus>
            Close
          </RntButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
