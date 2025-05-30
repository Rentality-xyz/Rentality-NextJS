import RntButton from "@/components/common/rntButton";
import RntFileButton from "@/components/common/rntFileButton";
import { resizeImage } from "@/utils/image";
import { isEmpty } from "@/utils/string";
import { Avatar } from "@mui/material";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCommonInformationFormValues, userCommonInformationFormSchema } from "./userCommonInformationFormSchema";
import { useTranslation } from "react-i18next";
import { DEFAULT_AGREEMENT_MESSAGE, LEGAL_TERMS_NAME } from "@/utils/constants";
import { signMessage } from "@/utils/ether";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import useUserMode from "@/hooks/useUserMode";
import { Result } from "@/model/utils/result";
import { UserProfile } from "@/features/profile/models";
import { SaveUserProfileRequest } from "@/features/profile/hooks/useSaveUserProfile";
import RntPhoneInput from "@/components/common/rntPhoneInput";
import DotStatus from "@/components/dotStatus";
import { CheckboxTerms } from "@/components/common/rntCheckbox";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { logger } from "@/utils/logger";
import getNetworkName from "@/model/utils/NetworkName";

function UserCommonInformationForm({
  userProfile,
  saveUserProfile,
}: {
  userProfile: UserProfile;
  saveUserProfile: (request: SaveUserProfileRequest) => Promise<Result<boolean, Error>>;
}) {
  const ethereumInfo = useEthereum();
  const { showInfo, showError, showSuccess, hideSnackbars } = useRntSnackbars();
  const { t } = useTranslation();
  const { userMode, isHost } = useUserMode();
  const { register, handleSubmit, formState, control, setValue, watch, reset } =
    useForm<UserCommonInformationFormValues>({
      defaultValues: {
        profilePhotoUrl: userProfile.profilePhotoUrl,
        nickname: userProfile.nickname,
        phoneNumber: userProfile.phoneNumber,
        isPhoneNumberVerified: userProfile.isPhoneNumberVerified,
        email: userProfile.email,
        smsCode: "",
        tcSignature: userProfile.tcSignature,
        isTerms: userProfile.isSignatureCorrect,
      },
      resolver: zodResolver(userCommonInformationFormSchema),
    });
  const { errors, isSubmitting } = formState;
  const isTerms = watch("isTerms");
  const enteredCode = watch("smsCode");
  const enteredPhoneNumber = watch("phoneNumber");

  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState(userProfile.phoneNumber);

  useEffect(() => {
    reset({
      profilePhotoUrl: userProfile.profilePhotoUrl,
      nickname: userProfile.nickname,
      phoneNumber: userProfile.phoneNumber,
      email: userProfile.email,
      isPhoneNumberVerified: userProfile.isPhoneNumberVerified,
      tcSignature: userProfile.tcSignature,
      isTerms: userProfile.isSignatureCorrect,
      smsCode: "",
    });

    if (userProfile.isPhoneNumberVerified) {
      setVerifiedPhoneNumber(userProfile.phoneNumber);
    }
  }, [userProfile]);

  function fileChangeCallback(field: ControllerRenderProps<UserCommonInformationFormValues, "profilePhotoUrl">) {
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
        logger.info("Revoking ObjectURL");
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

  async function onFormSubmit(formData: UserCommonInformationFormValues) {
    if (!ethereumInfo) return;
    if (!formData.isTerms) return;

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      showInfo(
        t("common.add_fund_to_wallet", {
          network: getNetworkName(ethereumInfo),
        })
      );
      return;
    }

    showInfo(t("common.info.sign"));

    try {
      const result = await saveUserProfile({
        ...formData,
        profilePhotoSrc: formData.profilePhotoUrl,
        oldProfilePhotoUrl: userProfile.profilePhotoUrl,
      });

      hideSnackbars();
      if (!result) {
        throw new Error("Save profile info error");
      }
      showSuccess(t("common.info.save_profile_success"));
    } catch (error) {
      logger.error("handleSubmit error:" + error);
      showError(t("profile.save_err"));
      return;
    }
  }

  const [smsHash, setSmsHash] = useState<string | undefined>(undefined);
  const [smsTimestamp, setSmsTimestamp] = useState<number | undefined>(undefined);
  const [isEnteredCodeCorrect, setIsEnteredCodeCorrect] = useState(false);

  const [isResendCodeTimerRunning, setIsResendCodeTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentPhoneNotVerified =
    (!userProfile.isPhoneNumberVerified && !isEnteredCodeCorrect) || enteredPhoneNumber !== verifiedPhoneNumber;

  useEffect(() => {
    if (isResendCodeTimerRunning && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsResendCodeTimerRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResendCodeTimerRunning, secondsLeft]);

  const startTimer = () => {
    if (!isResendCodeTimerRunning) {
      setIsResendCodeTimerRunning(true);
      setSecondsLeft(60);
    }
  };

  async function sendSmsVerificationCode() {
    try {
      if (!enteredPhoneNumber) {
        showError(t("profile.pls_phone"));
        return;
      }

      const response = await fetch("/api/sendSmsVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: enteredPhoneNumber,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        setSmsHash(result.hash);
        setSmsTimestamp(result.timestamp);
        startTimer();
      } else {
        logger.error("sendSmsVerificationCode error:" + result.error);
        showError(t("profile.send_sms_err"));
      }
    } catch (error) {
      logger.error("sendSmsVerificationCode error:" + error);
      showError(t("profile.send_sms_err"));
    }
  }

  async function compareVerificationCode() {
    try {
      if (!smsHash && !smsTimestamp) return;
      showInfo(t("profile.verification"));
      const response = await fetch("/api/compareVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: ethereumInfo?.walletAddress,
          phoneNumber: enteredPhoneNumber,
          enteredCode: enteredCode,
          smsHash: smsHash,
          timestamp: smsTimestamp,
          chainId: ethereumInfo?.chainId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error("compareVerificationCode error:" + result.error);
        showError(t("profile.verify_number_err"));
        return;
      }

      if (result.isVerified) {
        setIsResendCodeTimerRunning(false);
        setIsEnteredCodeCorrect(true);
        setVerifiedPhoneNumber(enteredPhoneNumber);
        setValue("smsCode", "");
        setSmsHash(undefined);
        setSmsTimestamp(undefined);
        return;
      }

      showError(t("profile.invalid_code"));
    } catch (error) {
      logger.error("compareVerificationCode error:" + error);
      showError(t("profile.verify_number_err"));
    }
  }

  return (
    <form className="flex flex-col gap-4 lg:my-8" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <Controller
        name="profilePhotoUrl"
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-row items-center gap-4">
              <Avatar alt={`${userProfile.nickname}`} src={field.value} sx={{ width: "7rem", height: "7rem" }}>
                {userProfile.nickname}
              </Avatar>
              <div className="text-xl">{userProfile.nickname}</div>
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
          {!isEmpty(userProfile.tcSignature) && userProfile.tcSignature !== "0x" ? (
            <strong>{t("profile.basic_info")}</strong>
          ) : (
            <strong>{t("profile.welcome_create_account")}</strong>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <RntInputTransparent
            className="lg:w-60"
            labelClassName="pl-[16px]"
            id="nickname"
            label={t("profile.nickname")}
            {...register("nickname")}
            validationError={errors.nickname?.message}
          />
          <RntInputTransparent
            className="lg:w-60"
            labelClassName="pl-[16px]"
            id="email"
            label={t("profile.email")}
            {...register("email")}
            validationError={errors.email?.message}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <RntPhoneInput
                className="z-10 lg:w-60"
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
          {isCurrentPhoneNotVerified && (
            <RntButton className="lg:w-60" onClick={sendSmsVerificationCode} disabled={isResendCodeTimerRunning}>
              {smsHash === undefined ? t("profile.verify") : t("profile.resend_code")}
            </RntButton>
          )}
        </div>

        {isResendCodeTimerRunning && isCurrentPhoneNotVerified && (
          <p className="mt-2 w-full pl-4">{t("profile.resend_code_hint", { secondsLeft: secondsLeft })}</p>
        )}

        {isCurrentPhoneNotVerified && smsHash && smsTimestamp && (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <Controller
              name="smsCode"
              control={control}
              render={({ field }) => (
                <RntInputTransparent
                  className="lg:w-60"
                  labelClassName="pl-[16px]"
                  id="smsCode"
                  value={field.value}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\D/g, "");
                    field.onChange(newValue.slice(0, 6));
                  }}
                  label={t("profile.sms_code")}
                />
              )}
            />

            <RntButton onClick={compareVerificationCode} disabled={enteredCode?.length != 6}>
              {t("profile.confirm")}
            </RntButton>
          </div>
        )}
      </fieldset>

      {userProfile.isPhoneNumberVerified || isEnteredCodeCorrect ? (
        <DotStatus color="success" text={t("profile.phone_verified")} />
      ) : (
        <DotStatus color="error" text={t("profile.phone_not_verified")} />
      )}

      <p className="w-full pl-4 md:w-3/4 xl:w-3/5 2xl:w-1/3">{t("profile.agreement_info")}</p>

      <Controller
        name="isTerms"
        control={control}
        render={({ field }) => (
          <CheckboxTerms
            className="ml-4 underline"
            label={t("profile.tc_and_privacy_title")}
            checked={field.value}
            onChange={async () => {
              if (!field.value) {
                if (!ethereumInfo) return;
                try {
                  const signature = await signMessage(ethereumInfo.signer, DEFAULT_AGREEMENT_MESSAGE);
                  setValue("tcSignature", signature);
                } catch (error) {
                  logger.error("sign error: ", error);
                }
              }
              field.onChange(!field.value);
            }}
            onLabelClick={(e) => {
              field.onChange(true);
              logger.info(`onLabelClick. ${JSON.stringify(e.type)}`);
              const windowsProxy = window.open(
                `/${isHost(userMode) ? "host" : "guest"}/legal?tab=${LEGAL_TERMS_NAME}`,
                "_blank"
              );
              if (windowsProxy === null || typeof windowsProxy == "undefined")
                showError("Please, turn off your pop-up blocker!");
            }}
          />
        )}
      />

      <p className="pl-[16px] text-sm">{t("profile.read_agree")}</p>

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton className="max-sm:w-80" type="submit" disabled={isSubmitting || !isTerms}>
          {t("profile.confirm&save")}
        </RntButton>

        {!isEmpty(userProfile.tcSignature) && userProfile.tcSignature !== "0x" ? (
          <DotStatus color="success" text={t("profile.confirmed")} />
        ) : (
          <DotStatus color="error" text={t("profile.not_confirmed")} />
        )}
      </div>
    </form>
  );
}

export default UserCommonInformationForm;
