import Image from "next/image";
import { Dialog, DialogContent } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DevicePlatform, getDevicePlatform } from "@/utils/devicePlatform";

export default function RntMobileStoresDialog() {
  const [isOpened, setIsOpened] = useState(false);
  const { t } = useTranslation();
  const handleClick = () => {
    const devicePlatform = getDevicePlatform();

    if (devicePlatform === DevicePlatform.iOS) {
      window.location.href = "https://apps.apple.com/ua/app/rentality/id6736899320";
      return;
    }

    if (devicePlatform === DevicePlatform.Android) {
      window.location.href = "https://play.google.com/store/apps/details?id=xyz.rentality.rentality";
      return;
    }

    setIsOpened(true);
  };

  return (
    <>
      <button
        className="items-center rounded-md border border-gray-500 hover:border-gray-400 lg:px-4"
        onClick={handleClick}
      >
        <Image src={"/images/marketplace/app-google-store.svg"} width={51} height={24} alt="Mobile Store" className="min-w-[54px] lg:min-w-[94px]" />
      </button>
      <Dialog
        maxWidth="lg"
        open={isOpened}
        onClose={() => {
          setIsOpened(false);
        }}
        aria-labelledby="mobile-stores-dialog-title"
        aria-describedby="mobile-stores-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            margin: "16px",
          },
        }}
      >
        <DialogContent
          sx={{
            padding: "0px 0px",
          }}
        >
          <div className="bg-rnt-dialog shadow-rnt-dialog-inner flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-white lg:p-12">
            <p className="text-2xl font-bold leading-[64px] text-rentality-secondary lg:text-4xl">
              {t("mobile_stores_dialog.title")}
            </p>
            <p className="w-60 text-center">{t("mobile_stores_dialog.scan_qr_code")}</p>
            <Image src={"/images/qr_code_app.png"} width={328} height={328} alt="Mobile Store" className="min-w-[54px] lg:min-w-[94px]" />
            <p className="text-center">{t("mobile_stores_dialog.available_on")}</p>
            <Image src={"/images/marketplace/app-google-store.svg"} width={51} height={24} alt="Mobile Store" className="min-w-[54px] lg:min-w-[94px]" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
