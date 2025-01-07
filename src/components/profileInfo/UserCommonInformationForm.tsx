import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import RntInput from "@/components/common/rntInput";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import { resizeImage } from "@/utils/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { ChangeEvent, useEffect } from "react";
import RntPhoneInput from "../common/rntPhoneInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileInfoFormValues, profileInfoFormSchema } from "./profileInfoFormSchema";
import DotStatus from "./dotStatus";
import { useTranslation } from "react-i18next";
import { CheckboxTerms } from "../common/rntCheckbox";
import { verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE, LEGAL_TERMS_NAME } from "@/utils/constants";
import { signMessage } from "@/utils/ether";
import { isUserHasEnoughFunds } from "@/utils/wallet";

function UserCommonInformationForm({
  savedProfileSettings,
  saveProfileSettings,
  isHost,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
  isHost: boolean;
}) {
  const ethereumInfo = useEthereum();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { t } = useTranslation();

  const { register, handleSubmit, formState, control, setValue, watch } = useForm<ProfileInfoFormValues>({
    defaultValues: {
      profilePhotoUrl: savedProfileSettings.profilePhotoUrl,
      nickname: savedProfileSettings.nickname,
      phoneNumber: savedProfileSettings.phoneNumber,
      tcSignature: savedProfileSettings.tcSignature,
      reflink: savedProfileSettings.reflink,
    },
    resolver: zodResolver(profileInfoFormSchema),
  });
  const { errors, isSubmitting } = formState;

  function fileChangeCallback(field: ControllerRenderProps<ProfileInfoFormValues, "profilePhotoUrl">) {
    return async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) {
        return;
      }

      let file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        file = await resizeImage(file, 300);
      } else if (file.size > 5 * 1024 * 1024) {
        alert("File is too big");
        return;
      }

      if (!isEmpty(field.value) && field.value.startsWith("blob")) {
        console.log("Revoking ObjectURL");
        URL.revokeObjectURL(field.value);
      }
      const fileNameExt = file.name.slice(file.name.lastIndexOf(".") + 1);
      if (fileNameExt == "heic") {
        const convertHeicToPng = await import("@/utils/heic2any");
        const convertedFile = await convertHeicToPng.default(file);
        field.onChange(convertedFile.localUrl);
      } else {
        const urlImage = URL.createObjectURL(file);
        field.onChange(urlImage);
      }
    };
  }

  async function onFormSubmit(formData: ProfileInfoFormValues) {
    if (!ethereumInfo) return;
    if (!formData.isTerms) return;

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      showInfo(t("common.add_fund_to_wallet"));
      return;
    }

    try {
      const signature = await signMessage(ethereumInfo.signer, DEFAULT_AGREEMENT_MESSAGE);
      console.debug(`tcSignature before: ${formData.tcSignature}`);
      setValue("tcSignature", signature);
      formData.tcSignature = signature;
      console.debug(`tcSignature after: ${formData.tcSignature}`);

      var profilePhotoUrl = savedProfileSettings.profilePhotoUrl;
      if (formData.profilePhotoUrl !== savedProfileSettings.profilePhotoUrl) {
        const blob = await (await fetch(formData.profilePhotoUrl)).blob();
        const profileImageFile = new File([blob], "profileImage", { type: "image/png" });

        const response = await uploadFileToIPFS(profileImageFile, "RentalityProfileImage", {
          createdAt: new Date().toISOString(),
          createdBy: ethereumInfo?.walletAddress ?? "",
          version: SMARTCONTRACT_VERSION,
          chainId: ethereumInfo?.chainId ?? 0,
        });

        if (!response.success || !response.pinataURL) {
          throw new Error("Uploaded image to Pinata error");
        }

        profilePhotoUrl = response.pinataURL;
      }

      const dataToSave: ProfileSettings = {
        ...formData,
        profilePhotoUrl: profilePhotoUrl,
        fullname: "",
        documentType: "",
        drivingLicenseNumber: "",
        drivingLicenseExpire: undefined,
        issueCountry: "",
        email: "",
      };

      showInfo(t("common.info.sign"));
      const result = await saveProfileSettings(dataToSave);

      hideDialogs();
      hideSnackbars();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t("profile.save_err"));
      return;
    }
  }

  const isTerms = watch("isTerms");

  useEffect(() => {
    const checkSignature = async () => {
      if (!ethereumInfo) return;

      if (isEmpty(savedProfileSettings.tcSignature) || savedProfileSettings.tcSignature === "0x") {
        setValue("isTerms", false);
        return;
      }

      const userAddress = await ethereumInfo.signer.getAddress();
      const verifyAddress = verifyMessage(DEFAULT_AGREEMENT_MESSAGE, savedProfileSettings.tcSignature);
      const isSignatureCorrect = verifyAddress === userAddress;
      setValue("isTerms", isTerms || isSignatureCorrect);
    };

    checkSignature();
  }, [ethereumInfo, savedProfileSettings.tcSignature, setValue]);

  return (
    <form className="flex flex-col gap-4 lg:my-8" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <Controller
        name="profilePhotoUrl"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-row items-center gap-4">
              <Avatar alt={`${savedProfileSettings.nickname}`} src={field.value} sx={{ width: "7rem", height: "7rem" }}>
                {savedProfileSettings.nickname}
              </Avatar>
              <div className="text-xl">{savedProfileSettings.nickname}</div>
            </div>
            <RntFileButton
              className="h-16 w-40"
              id="profilePhotoUrl"
              onChange={fileChangeCallback(field)}
              accept="image/png,image/jpeg"
            >
              {t("common.upload")}
            </RntFileButton>
          </>
        )}
      />

      <fieldset className="mt-4">
        <div className="mb-4 pl-[16px] text-lg">
          {!isEmpty(savedProfileSettings.tcSignature) && savedProfileSettings.tcSignature !== "0x" ? (
            <strong>{t("profile.basic_info")}</strong>
          ) : (
            <strong>{t("profile.welcome_create_account")}</strong>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInput
            className="lg:w-60"
            labelClassName="pl-[16px]"
            id="nickname"
            label={t("profile.nickname")}
            {...register("nickname")}
            validationError={errors.nickname?.message}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <RntPhoneInput
                className="lg:w-60"
                labelClassName="pl-[16px]"
                id="phoneNumber"
                label={t("profile.phone")}
                type="tel"
                value={field.value}
                onChange={field.onChange}
                validationError={errors.phoneNumber?.message}
              />
            )}
          />

          <RntInput
            className="lg:w-72"
            labelClassName="pl-[16px]"
            id="reflink"
            label={t("profile.ref_link")}
            {...register("reflink")}
            validationError={errors.reflink?.message}
          />
        </div>
      </fieldset>

      <p className="w-full pl-4 md:w-3/4 xl:w-3/5 2xl:w-1/3">{t("profile.agreement_info")}</p>

      <Controller
        name="isTerms"
        control={control}
        render={({ field }) => (
          <CheckboxTerms
            className="ml-4 underline"
            label={t("profile.tc_and_privacy_title")}
            checked={field.value}
            onChange={() => {
              field.onChange(!field.value);
            }}
            onLabelClick={(e) => {
              field.onChange(true);
              console.log(`onLabelClick. ${JSON.stringify(e.type)}`);
              const windowsProxy = window.open(`/${isHost ? "host" : "guest"}/legal?tab=${LEGAL_TERMS_NAME}`, "_blank");
              if (windowsProxy === null || typeof windowsProxy == "undefined")
                showError("Please, turn off your pop-up blocker!");
            }}
          />
        )}
      />
      <p className="pl-[16px] text-sm">{t("profile.read_agree")}</p>

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton type="submit" disabled={isSubmitting || !isTerms}>
          {t("profile.confirm&save")}
        </RntButton>

        {!isEmpty(savedProfileSettings.tcSignature) && savedProfileSettings.tcSignature !== "0x" ? (
          <DotStatus color="success" text={t("profile.confirmed")} />
        ) : (
          <DotStatus color="error" text={t("profile.not_confirmed")} />
        )}
      </div>
    </form>
  );
}

export default UserCommonInformationForm;
