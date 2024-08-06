import RntSelect from "../common/rntSelect";
import RntInputMultiline from "../common/rntInputMultiline";
import RntInput from "../common/rntInput";
import RntCheckbox from "../common/rntCheckbox";
import RntButton from "../common/rntButton";
import { getClaimTypeTextFromClaimType } from "@/model/Claim";
import Link from "next/link";
import { isEmpty } from "@/utils/string";
import { CreateClaimRequest, TripInfoForClaimCreation } from "@/model/CreateClaimRequest";
import { ClaimType } from "@/model/blockchain/schemas";
import ClaimAddPhoto from "@/components/claims/ClaimAddPhoto";
import { usePathname } from "next/navigation";
import { createClaimFormSchema, CreateClaimFormValues } from "./createClaimFormSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function CreateClaim({
  tripInfos,
  createClaim,
  isHost,
}: {
  tripInfos: TripInfoForClaimCreation[];
  createClaim: (createClaimRequest: CreateClaimRequest) => Promise<boolean>;
  isHost: boolean;
}) {
  const pathname = usePathname();
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
    const success = await createClaim(createClaimRequest);
    if (success) {
      reset();
    }
  }

  // const handleCreateClaim = async () => {
  //   if (!createClaimParams.isChecked) return;

  //   const createClaimRequest: CreateClaimRequest = {
  //     tripId: Number(createClaimParams.selectedTripId),
  //     guestAddress: tripInfos.find((ti) => ti.tripId === Number(createClaimParams.selectedTripId))?.guestAddress ?? "",
  //     claimType: BigInt(createClaimParams.incidentType),
  //     description: createClaimParams.description,
  //     amountInUsdCents: (Number(createClaimParams.amountInUsd) ?? 0) * 100,
  //     localFileUrls: createClaimParams.localFileUrls,
  //   };
  //   const success = await createClaim(createClaimRequest);
  //   if (success) {
  //     setCreateClaimParams({
  //       ...emptyCreateClaimParams,
  //       incidentType: isHost ? hostClaimTypes[0].toString() : guestClaimTypes[0].toString(),
  //     });
  //   }
  // };

  return (
    <form
      className="mt-5 flex w-full flex-col gap-4 p-4"
      onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}
    >
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
        <RntSelect
          className="lg:w-1/2"
          id="trip"
          label="Trip"
          {...register("selectedTripId")}
          validationError={errors.selectedTripId?.message}
        >
          <option className="hidden" disabled></option>
          {tripInfos.map((i) => (
            <option key={i.tripId} value={i.tripId.toString()}>
              {i.tripDescription}
            </option>
          ))}
        </RntSelect>
        <RntSelect
          className="lg:w-80"
          id="type"
          label={isHost ? "Incident type" : "Issues type"}
          {...register("incidentType")}
          validationError={errors.incidentType?.message}
        >
          {(isHost ? hostClaimTypes : guestClaimTypes).map((i) => (
            <option key={i.toString()} value={i.toString()}>
              {getClaimTypeTextFromClaimType(i)}
            </option>
          ))}
        </RntSelect>

        {!isEmpty(selectedTripId) ? (
          <Link href={`/host/trips/tripInfo/${selectedTripId}?back=${pathname}`} target="_blank">
            {/* <Image className="sm:hidden" src={icInfo} width={25} alt="" /> max-sm:hidden */}
            <span className="text-rentality-secondary">Trip information</span>
          </Link>
        ) : null}
      </div>
      <RntInputMultiline
        id="description"
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

      <RntInput
        className="w-full lg:w-1/2"
        id="amount"
        autoComplete="off"
        label={`What compensation amount do you think the ${isHost ? "guest" : "host"} should pay for the incident?`}
        {...register("amountInUsd", { valueAsNumber: true })}
        validationError={errors.amountInUsd?.message}
      />
      <p>After your trip ends, you have 72 hours to respond before your complaints become public</p>

      <Controller
        name="isChecked"
        control={control}
        render={({ field }) => (
          <RntCheckbox
            className="w-full"
            label="I certify that all charges are accurate, and I understand that any false submission or representation may result in restrictions or removal from the Rentality marketplace."
            checked={field.value}
            onChange={(e) => {
              field.onChange(e.target.checked);
            }}
          />
        )}
      />

      <RntButton type="submit" className="w-72" disabled={isSubmitting || !isChecked}>
        Confirm and send to {textSendTo}
      </RntButton>
    </form>
  );
}
