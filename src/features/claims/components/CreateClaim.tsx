import { getClaimTypeTextFromClaimType } from "@/features/claims/models";
import Link from "next/link";
import { isEmpty } from "@/utils/string";
import { CreateClaimRequest } from "@/features/claims/models/CreateClaimRequest";
import { ClaimType } from "@/model/blockchain/schemas";
import ClaimAddPhoto from "@/features/claims/components/ClaimAddPhoto";
import { usePathname } from "next/navigation";
import { createClaimFormSchema, CreateClaimFormValues } from "./createClaimFormSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Err, Result } from "@/model/utils/result";
import RntSelect from "@/components/common/rntSelect";
import RntInputMultiline from "@/components/common/rntInputMultiline";
import RntInput from "@/components/common/rntInput";
import RntCheckbox, { CheckboxLight } from "@/components/common/rntCheckbox";
import RntButton from "@/components/common/rntButton";
import useUserMode from "@/hooks/useUserMode";
import useCreateClaim from "../hooks/useCreateClaim";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";
import useTripsForClaimCreation from "../hooks/useTripsForClaimCreation";
import { FileToUpload } from "@/model/FileToUpload";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import * as React from "react";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

const hostClaimTypes = [
  ClaimType.Tolls,
  ClaimType.Tickets,
  ClaimType.LateReturn,
  ClaimType.Cleanliness,
  ClaimType.Smoking,
  ClaimType.ExteriorDamage,
  ClaimType.InteriorDamage,
  ClaimType.Other,
];

const guestClaimTypes = [
  ClaimType.FaultyVehicle,
  ClaimType.ListingMismatch,
  ClaimType.Cleanliness,
  ClaimType.ExteriorDamage,
  ClaimType.InteriorDamage,
  ClaimType.Other,
];

export default function CreateClaim() {
  const { userMode } = useUserMode();
  const isHost = userMode === "Host";
  const pathname = usePathname();
  const { data: tripInfos } = useTripsForClaimCreation(false);
  const { mutateAsync: createClaim } = useCreateClaim();
  const { register, handleSubmit, formState, control, reset, watch } = useForm<CreateClaimFormValues>({
    defaultValues: {
      selectedTripId: "",
      incidentType: isHost ? hostClaimTypes[0].toString() : guestClaimTypes[0].toString(),
      description: "",
      amountInUsd: 0,
      isChecked: false,
      localFileUrls: [],
    },
    resolver: zodResolver(createClaimFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { t } = useTranslation();

  const textSendTo = isHost ? "guest" : "host";
  const selectedTripId = watch("selectedTripId");
  const isChecked = watch("isChecked");

  async function onFormSubmit(formData: CreateClaimFormValues) {
    if (!formData.isChecked) return;

    const createClaimRequest: CreateClaimRequest = {
      tripId: Number(formData.selectedTripId),
      guestAddress: tripInfos.find((ti) => ti.tripId === Number(formData.selectedTripId))?.guestAddress ?? "",
      claimType: BigInt(formData.incidentType),
      description: formData.description,
      amountInUsdCents: (Number(formData.amountInUsd) ?? 0) * 100,
      localFileUrls: formData.localFileUrls,
    };

    const result = await handleCreateClaim(createClaimRequest);
    if (result.ok) {
      reset();
    }
  }

  async function handleCreateClaim(createClaimRequest: CreateClaimRequest): Promise<Result<boolean, Error>> {
    if (!createClaimRequest.tripId) {
      showError(t("claims.host.select_trip"));
      return Err(new Error("ERROR"));
    }
    if (!createClaimRequest.claimType && createClaimRequest.claimType !== BigInt(0)) {
      showError(t("claims.host.select_type"));
      return Err(new Error("ERROR"));
    }
    if (!createClaimRequest.description) {
      showError(t("claims.host.enter_description"));
      return Err(new Error("ERROR"));
    }
    if (!createClaimRequest.amountInUsdCents) {
      showError(t("claims.host.enter_amount"));
      return Err(new Error("ERROR"));
    }

    showInfo(t("common.info.sign"));

    const result = await createClaim(createClaimRequest);

    hideSnackbars();

    if (!result.ok) {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("claims.host.claim_failed"));
      }
    }
    return result;
  }

  return (
    <form
      className="mt-5 flex w-full flex-col gap-4 py-4"
      onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}
    >
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
        <Controller
          name="selectedTripId"
          control={control}
          render={({ field }) => (
            <RntFilterSelect
              className="lg:min-w-80"
              id="trip"
              label="Trip"
              placeholder="Select trip"
              value={field.value}
              validationError={errors.selectedTripId?.message}
            >
              {tripInfos.map((i) => (
                <RntFilterSelect.Option key={i.tripId} value={i.tripId.toString()}>
                  {i.tripDescription}
                </RntFilterSelect.Option>
              ))}
            </RntFilterSelect>
          )}
        />
        <Controller
          name="incidentType"
          control={control}
          render={({ field }) => (
            <RntFilterSelect
              className="lg:w-80"
              id="type"
              label={isHost ? "Incident type" : "Issues type"}
              value={field.value}
              validationError={errors.incidentType?.message}
            >
              {(isHost ? hostClaimTypes : guestClaimTypes).map((i) => (
                <RntFilterSelect.Option key={i.toString()} value={i.toString()}>
                  {getClaimTypeTextFromClaimType(i)}
                </RntFilterSelect.Option>
              ))}
            </RntFilterSelect>
          )}
        />
        {!isEmpty(selectedTripId) ? (
          <Link href={`/host/trips/tripInfo/${selectedTripId}?back=${pathname}`} target="_blank">
            <span className="text-rentality-secondary">Trip information</span>
          </Link>
        ) : null}
      </div>
      <RntInputMultiline
        isTransparentStyle={true}
        id="description"
        labelClassName="pl-3.5"
        rows={3}
        label="Describe your claim in detail"
        placeholder="enter your message"
        {...register("description")}
        validationError={errors.description?.message}
      />

      <Controller
        name="localFileUrls"
        control={control}
        render={({ field }) => (
          <ClaimAddPhoto
            filesToUpload={field.value}
            setFilesToUpload={(newValue) => {
              field.onChange(newValue);
            }}
          />
        )}
      />

      <RntInputTransparent
        className="w-full lg:w-1/2"
        labelClassName="pl-4"
        id="amount"
        autoComplete="off"
        label={`What compensation amount do you think the ${isHost ? "guest" : "host"} should pay for the incident?`}
        {...register("amountInUsd", { valueAsNumber: true })}
        validationError={errors.amountInUsd?.message}
      />
      <p className="pl-4">After your trip ends, you have 72 hours to respond before your complaints become public</p>

      <Controller
        name="isChecked"
        control={control}
        render={({ field }) => (
          <CheckboxLight
            className="w-full"
            label="I certify that all charges are accurate, and I understand that any false submission or representation may result in restrictions or removal from the Rentality marketplace."
            checked={field.value}
            onChange={(e) => {
              field.onChange(e.target.checked);
            }}
          />
        )}
      />

      <RntButton type="submit" className="w-[310px]" disabled={isSubmitting || !isChecked}>
        Confirm and send to {textSendTo}
      </RntButton>
    </form>
  );
}
