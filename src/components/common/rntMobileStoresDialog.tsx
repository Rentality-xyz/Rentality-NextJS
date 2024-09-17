import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Image from "next/image";
import imgBg from "@/images/rectangle_midnight_purple_without_shadow.png";
import { Dialog, DialogContent } from "@mui/material";
import imgStore from "@/images/app-google-store.svg";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { useState } from "react";
import sendCommunityDataToGoogleTable from "@/utils/sendCommunityDataToGoogleTable";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";

export default function RntMobileStoresDialog() {
  const [isOpened, setIsOpened] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formInputEmail, setFormInputEmail] = useState("");
  const { showInfo, showError } = useRntSnackbars();
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsButtonDisabled(true);
    const sendResult = await sendCommunityDataToGoogleTable({
      email: formInputEmail,
    });
    if (sendResult.ok) {
      showInfo(t("common.success"));
      setFormInputEmail("");
      setIsOpened(false);
    } else {
      showError(sendResult.error);
    }
    setIsButtonDisabled(false);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormInputEmail(e.target.value);
  }

  return (
    <>
      <button
        className="flex items-center rounded-md border border-gray-500 hover:border-gray-400 lg:px-4"
        onClick={() => {
          setIsOpened(true);
        }}
      >
        <Image src={imgStore} alt="Mobile Store" className="min-w-[54px] lg:min-w-[94px]" />
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
                {t("mobile_stores_dialog.title")}
              </p>
              <p className="text-center font-['Montserrat',Arial,sans-serif] text-lg font-medium text-white lg:px-6 lg:text-xl">
                {t("mobile_stores_dialog.app_is_coming_soon")}
                <br />
                {t("mobile_stores_dialog.leave_your_email")}
              </p>
              <form
                className="mt-8 flex w-full flex-col max-lg:items-center lg:flex-row lg:px-12"
                onSubmit={handleSubmit}
              >
                <RntInputTransparent
                  id="mobile_stores_input_email"
                  className="w-full text-white"
                  placeholder="Enter your email"
                  type="email"
                  autoComplete="off"
                  required
                  value={formInputEmail}
                  onChange={handleEmailChange}
                />
                <RntButtonTransparent
                  className="w-36 px-8 max-lg:mt-6 lg:ml-8"
                  type="submit"
                  disabled={isButtonDisabled}
                >
                  <div className="text-white">
                    <strong className="text-l">{t("common.submit")}</strong>
                  </div>
                </RntButtonTransparent>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
