import * as React from "react";
import RntButton from "./rntButton";
import { TripInfo } from "@/model/TripInfo";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Image from "next/image";
import imgCopy from "@/images/ic_copy_24dp.svg";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";

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
      str.substring(6, str.length - 24).replace(/./g, ".") +
      str.substring(str.length - 6, str.length)
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <React.Fragment>
      <RntButtonTransparent className="w-36" onClick={handleClickOpen}>
        <div className="text-[#52D1C9]">
          <strong className="text-l">Wallets</strong>
        </div>
      </RntButtonTransparent>
      <Dialog
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            margin: "16px",
            background: "#240F50",
          },
        }}
      >
        <DialogContent
          sx={{
            padding: "20px 10px",
          }}
        >
          <DialogContentText
            sx={{
              color: "#fff",
            }}
            id="alert-dialog-description"
          >
            <div className="flex flex-col divide-y">
              <div className="flex items-center justify-between p-2">
                <strong>{"Guest's wallet:"}</strong>
                <span className="ms-2 text-gray-500">{maskWallet(tripInfo.guest.walletAddress)}</span>
                <RntButton
                  className="ms-2 flex h-8 w-16 items-center justify-center md:w-24"
                  onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
                >
                  <Image src={imgCopy} alt="Copy" className="h-5 w-5 md:mr-1" />
                  <span className="max-md:hidden">Copy</span>
                </RntButton>
              </div>
              <div className="flex items-center justify-between p-2">
                <strong>{"Host's wallet:"}</strong>
                <span className="ms-2 text-gray-500">{maskWallet(tripInfo.host.walletAddress)}</span>
                <RntButton
                  className="ms-2 flex h-8 w-16 items-center justify-center md:w-24"
                  onClick={() => copyToClipboard(tripInfo.host.walletAddress)}
                >
                  <Image src={imgCopy} alt="Copy" className="h-5 w-5 md:mr-1" />
                  <span className="max-md:hidden">Copy</span>
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
