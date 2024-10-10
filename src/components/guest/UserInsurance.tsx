import { Controller, useForm } from "react-hook-form";
import RntButton from "../common/rntButton";
import RntValidationError from "../common/RntValidationError";
import DotStatus from "../profileInfo/dotStatus";
import Loading from "../common/Loading";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import useGuestInsurance from "@/hooks/guest/useGuestInsurance";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { UserInsurancePhoto } from "./UserInsurancePhoto";
import { userInsuranceFormSchema, UserInsuranceFormValues } from "./userInsuranceFormSchema";

export function UserInsurance() {
  const { isLoading, guestInsurance, saveGuestInsurance } = useGuestInsurance();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { handleSubmit, formState, control, setValue, watch } = useForm<UserInsuranceFormValues>({
    defaultValues: {},
    resolver: zodResolver(userInsuranceFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const { t } = useTranslation();

  const userInsurancePhoto = watch("userInsurancePhoto");

  async function onFormSubmit(formData: UserInsuranceFormValues) {
    if (!("file" in formData.userInsurancePhoto)) return;

    try {
      showInfo(t("common.info.sign"));

      const result = await saveGuestInsurance(formData.userInsurancePhoto);
      hideSnackbars();

      if (!result) {
        throw new Error("Save Guest Insurance info error");
      }
      showInfo(t("common.info.success"));
    } catch (e) {
      console.error("handleSubmit error:" + e);
      showError(t("profile.save_err"));
      return;
    }
  }

  function handleInfoClick() {}

  useEffect(() => {
    setValue("userInsurancePhoto", { url: guestInsurance.photo });
  }, [guestInsurance.photo, setValue]);

  if (isLoading) return <Loading />;

  return (
    <form className="flex flex-col gap-4 lg:my-8" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <strong>{t("profile.user_insurance.please_upload_photo")}</strong>

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
            />
            <RntValidationError validationError={errors.userInsurancePhoto?.message?.toString()} />
          </>
        )}
      />

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton type="submit" disabled={isSubmitting}>
          {t("common.save")}
        </RntButton>

        {"url" in userInsurancePhoto && !isEmpty(userInsurancePhoto.url) ? (
          <DotStatus color="success" text={t("profile.user_insurance.insurance_uploaded")} />
        ) : (
          <DotStatus color="error" text={t("profile.user_insurance.insurance_not_uploaded")} />
        )}
      </div>
    </form>
  );
}
