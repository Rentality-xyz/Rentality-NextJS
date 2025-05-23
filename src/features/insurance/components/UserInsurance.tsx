import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { UserInsurancePhoto } from "./UserInsurancePhoto";
import { PlatformFile } from "@/model/FileToUpload";
import { DialogActions } from "@/utils/dialogActions";
import { userInsuranceFormSchema, UserInsuranceFormValues } from "@/features/insurance/models/userInsuranceFormSchema";
import Loading from "@/components/common/Loading";
import RntValidationError from "@/components/common/RntValidationError";
import RntButton from "@/components/common/rntButton";
import useFetchGuestGeneralInsurance from "../hooks/useFetchGuestGeneralInsurance";
import useSaveGuestGeneralInsurance from "../hooks/useSaveGuestGeneralInsurance";
import DotStatus from "@/components/dotStatus";
import { logger } from "@/utils/logger";

function UserInsurance() {
  const { isLoading, data: guestInsurance } = useFetchGuestGeneralInsurance();
  const { mutateAsync: saveGuestInsurance } = useSaveGuestGeneralInsurance();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, showSuccess, hideSnackbars } = useRntSnackbars();
  const { handleSubmit, formState, control, setValue, watch } = useForm<UserInsuranceFormValues>({
    defaultValues: {},
    resolver: zodResolver(userInsuranceFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const { t } = useTranslation();

  const userInsurancePhoto = watch("userInsurancePhoto");

  async function onFormSubmit(formData: UserInsuranceFormValues) {
    if (!("file" in formData.userInsurancePhoto) && !formData.userInsurancePhoto.isDeleted) return;

    if ("isDeleted" in formData.userInsurancePhoto && formData.userInsurancePhoto.isDeleted) {
      const action = (
        <>
          {DialogActions.Button(t("common.confirm"), async () => {
            await saveInsurance(formData.userInsurancePhoto);
            hideDialogs();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("profile.user_insurance.confirm_deletion"), action);
      return;
    }

    await saveInsurance(formData.userInsurancePhoto);
  }

  async function handlePhotoDelete() {
    const action = (
      <>
        {DialogActions.Button(t("common.confirm"), async (e) => {
          if ("disabled" in e.target) {
            e.target.disabled = true;
          }
          const oldUrl = "url" in userInsurancePhoto ? userInsurancePhoto.url : "";
          await saveInsurance({ url: oldUrl, isDeleted: true });
          hideDialogs();
          if ("disabled" in e.target) {
            e.target.disabled = false;
          }
        })}
        {DialogActions.Cancel(hideDialogs)}
      </>
    );
    showDialog(t("profile.user_insurance.confirm_deletion"), action);
  }

  async function saveInsurance(insurancePhoto: PlatformFile) {
    showInfo(t("common.info.sign"));
    const result = await saveGuestInsurance(insurancePhoto);
    hideSnackbars();

    if (!result.ok) {
      logger.error("saveInsurance error: Save Guest Insurance info error");
      showError(t("profile.save_err"));
    } else {
      showSuccessSaveInsurance("isDeleted" in insurancePhoto ? (insurancePhoto.isDeleted ?? false) : false);
    }
  }

  function showSuccessSaveInsurance(isDeleted: boolean) {
    if (isDeleted) {
      showSuccess(t("common.info.success"));
    } else {
      showSuccess(t("insurance.successfully_activated"));
    }
  }

  function handleInfoClick() {
    showDialog(t("profile.user_insurance.insurance_info"));
  }

  useEffect(() => {
    setValue("userInsurancePhoto", { url: guestInsurance.photo });
  }, [guestInsurance.photo, setValue]);

  if (isLoading) return <Loading />;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <strong className="pl-4">General Insurance ID</strong>

      <div className="ml-2 flex flex-row items-center gap-2 text-rentality-secondary-shade" onClick={handleInfoClick}>
        <i className="fi fi-rs-info"></i>
        <span className="mb-1">{t("profile.user_insurance.insurance_requirements")}</span>
      </div>

      <Controller
        name="userInsurancePhoto"
        control={control}
        render={({ field }) => (
          <>
            <UserInsurancePhoto
              insurancePhoto={field.value}
              onInsurancePhotoChanged={(newValue) => {
                field.onChange(newValue);
              }}
              onDelete={handlePhotoDelete}
            />
            <RntValidationError validationError={errors.userInsurancePhoto?.message?.toString()} />
          </>
        )}
      />

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton type="submit" disabled={isSubmitting}>
          {t("common.save")}
        </RntButton>

        {userInsurancePhoto !== undefined && "url" in userInsurancePhoto && !isEmpty(userInsurancePhoto.url) ? (
          <DotStatus color="success" text={t("profile.user_insurance.insurance_uploaded")} />
        ) : (
          <DotStatus color="error" text={t("profile.user_insurance.insurance_not_uploaded")} />
        )}
      </div>
    </form>
  );
}

export default UserInsurance;
