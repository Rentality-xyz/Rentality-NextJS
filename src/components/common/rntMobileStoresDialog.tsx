import * as React from "react";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Image from "next/image";
import imgBg from "@/images/rectangle_midnight_purple_without_shadow.png";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import imgStore from "@/images/app-google-store.svg";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { useState } from "react";
import sendCommunityDataToGoogleTable from "@/utils/sendCommunityDataToGoogleTable";

export default function RntMobileStoresDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const [formInputEmail, setFormInputEmail] = useState("");

  const handleClose = async () => {
    setOpen(false);
    await sendCommunityDataToGoogleTable({
      email: formInputEmail,
    });
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormInputEmail(event.target.value);
  };

  return (
    <React.Fragment>
      <button
        className="flex items-center rounded-md border border-gray-500 hover:border-gray-400 lg:px-4"
        onClick={handleClickOpen}
      >
        <Image src={imgStore} alt="Mobile Store" className="min-w-[54px] lg:min-w-[94px]" />
      </button>
      <Dialog
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        aria-labelledby="mobile-stores-dialog-title"
        aria-describedby="mobile-stores-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            margin: "16px",
            background: "#110D1C",
          },
        }}
      >
        <DialogContent
          sx={{
            padding: "0px 0px",
          }}
        >
          <div className="relative">
            <Image src={imgBg} alt="" className="h-[420px] lg:max-h-[340px] lg:min-w-[750px]" />
            <div className="absolute left-0 top-0 flex flex-col items-center justify-center px-12">
              <p className="mt-4 font-['Montserrat',Arial,sans-serif] text-[26px] font-bold leading-[64px] text-[#24D8D4] lg:mt-12 lg:text-[40px]">
                Be the First to Know!
              </p>
              <p className="text-center font-['Montserrat',Arial,sans-serif] text-lg font-medium text-white lg:px-6 lg:text-xl">
                Our app is coming soon to the App Store and Play Market.
                <br />
                Leave your email, and we’ll notify you as soon as it’s available for download!
              </p>
              <div className="mt-8 flex w-full flex-col max-lg:items-center lg:flex-row lg:px-12">
                <RntInputTransparent
                  id="mobile_stores_input_email"
                  className="w-full text-white"
                  placeholder="Enter your email"
                  type="email"
                  value={formInputEmail}
                  onChange={handleEmailChange}
                />
                <RntButtonTransparent className="w-36 px-8 max-lg:mt-6 lg:ml-8" onClick={handleClose}>
                  <div className="text-white">
                    <strong className="text-l">Submit</strong>
                  </div>
                </RntButtonTransparent>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
