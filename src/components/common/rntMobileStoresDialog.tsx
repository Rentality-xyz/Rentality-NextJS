import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Image from "next/image";
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
          <div className="border-rnt-gradient-2 bg-rnt-dialog shadow-rnt-dialog-inner flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-white lg:p-12">
            <p className="text-2xl font-bold leading-[64px] text-rentality-secondary lg:text-4xl">
              {t("mobile_stores_dialog.title")}
            </p>
            <p className="text-center text-lg lg:text-xl">
              {t("mobile_stores_dialog.app_is_coming_soon")}
              <br />
              {t("mobile_stores_dialog.leave_your_email")}
            </p>
            <form className="mt-4 flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-8" onSubmit={handleSubmit}>
              <RntInputTransparent
                className="w-full"
                id="mobile_stores_input_email"
                placeholder="Enter your email"
                type="email"
                autoComplete="off"
                required
                value={formInputEmail}
                onChange={handleEmailChange}
              />
              <RntButtonTransparent className="w-44" type="submit" disabled={isButtonDisabled}>
                <strong className="text-l">{t("common.submit")}</strong>
              </RntButtonTransparent>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
