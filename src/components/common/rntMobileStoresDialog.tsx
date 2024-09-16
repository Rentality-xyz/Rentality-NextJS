import * as React from "react";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Image from "next/image";
import imgBg from "@/images/rectangle_midnight_purple_without_shadow.png";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import imgStore from "@/images/app-google-store.svg";
import RntInputTransparent from "@/components/common/rntInputTransparent";

export default function RntMobileStoresDialog() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <button
                className="flex items-center px-4 border border-gray-500 rounded-md hover:border-gray-400"
                onClick={handleClickOpen}
            >
                <Image src={imgStore} alt="Mobile Store" className="min-w-[94px]" />
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
                        background: "#110D1C"
                    },
                }}
            >
                <DialogContent
                    sx={{
                        padding: "0px 0px",
                    }}
                >
                    <div className="relative">
                        <Image src={imgBg} alt="" className="min-w-[750px] max-h-[340px]" />
                        <div className="absolute top-0 left-0 flex flex-col justify-center items-center px-12">
                            <p className="mt-12 text-[#24D8D4] text-[40px] leading-[64px] font-bold font-['Montserrat',Arial,sans-serif]">
                                Be the First to Know!
                            </p>
                            <p className="px-6 text-white text-xl font-medium text-center font-['Montserrat',Arial,sans-serif]">
                                Our app is coming soon to the App Store and Play Market.
                                <br/>
                                Leave your email, and we’ll notify you as soon as it’s available for download!
                            </p>
                            <div className="flex mt-8 px-12 w-full">
                                <RntInputTransparent
                                    id="mobile_stores_input_email"
                                    className="w-full text-white"
                                    placeholder="Enter your email"
                                    type="email"
                                />
                                <RntButtonTransparent className="w-36 px-8 ml-8" onClick={handleClose}>
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