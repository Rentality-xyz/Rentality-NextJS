import RntSelect from "../common/rntSelect";
import { useState } from "react";
import RntInputMultiline from "../common/rntInputMultiline";
import RntInput from "../common/rntInput";
import RntCheckbox from "../common/rntCheckbox";
import RntButton from "../common/rntButton";
import { getClaimTypeTextFromClaimType } from "@/model/Claim";
import Link from "next/link";
import { isEmpty } from "@/utils/string";
import { CreateClaimRequest, TripInfoForClaimCreation } from "@/model/CreateClaimRequest";
import { ClaimType } from "@/model/blockchain/schemas";
import ClaimAddPhoto from "@/components/claims/claimAddPhoto";
import { FileToUpload } from "@/model/FileToUpload";
import { usePathname } from "next/navigation";

type CreateClaimParams = {
  selectedTripId: string;
  incidentType: string;
  description: string;
  amountInUsd: string;
  isChecked: boolean;
  localFileUrls: FileToUpload[];
};

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

const emptyCreateClaimParams: CreateClaimParams = {
  selectedTripId: "",
  incidentType: "",
  description: "",
  amountInUsd: "",
  isChecked: false,
  localFileUrls: [],
};

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
  const [createClaimParams, setCreateClaimParams] = useState<CreateClaimParams>({
    ...emptyCreateClaimParams,
    incidentType: isHost ? hostClaimTypes[0].toString() : guestClaimTypes[0].toString(),
  });

  const handleCreateClaim = async () => {
    if (!createClaimParams.isChecked) return;

    const createClaimRequest: CreateClaimRequest = {
      tripId: Number(createClaimParams.selectedTripId),
      guestAddress: tripInfos.find((ti) => ti.tripId === Number(createClaimParams.selectedTripId))?.guestAddress ?? "",
      claimType: BigInt(createClaimParams.incidentType),
      description: createClaimParams.description,
      amountInUsdCents: (Number(createClaimParams.amountInUsd) ?? 0) * 100,
      localFileUrls: createClaimParams.localFileUrls,
    };
    const success = await createClaim(createClaimRequest);
    if (success) {
      setCreateClaimParams({
        ...emptyCreateClaimParams,
        incidentType: isHost ? hostClaimTypes[0].toString() : guestClaimTypes[0].toString(),
      });
    }
  };

  return (
    <div className="w-full p-4 mt-5 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
        <RntSelect
          className="lg:w-1/2"
          id="trip"
          label="Trip"
          value={createClaimParams.selectedTripId}
          onChange={(e) =>
            setCreateClaimParams({
              ...createClaimParams,
              selectedTripId: e.target.value,
            })
          }
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
          value={createClaimParams.incidentType}
          onChange={(e) =>
            setCreateClaimParams({
              ...createClaimParams,
              incidentType: e.target.value,
            })
          }
        >
          {(isHost ? hostClaimTypes : guestClaimTypes).map((i) => (
            <option key={i.toString()} value={i.toString()}>
              {getClaimTypeTextFromClaimType(i)}
            </option>
          ))}
        </RntSelect>

        {!isEmpty(createClaimParams.selectedTripId) ? (
          <Link href={`/host/trips/tripInfo/${createClaimParams.selectedTripId}?back=${pathname}`} target="_blank">
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
        value={createClaimParams.description}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            description: e.target.value,
          })
        }
      />

      <ClaimAddPhoto
        filesToUpload={createClaimParams.localFileUrls}
        setFilesToUpload={(newValue) => {
          setCreateClaimParams((prev) => {
            return {
              ...prev,
              localFileUrls: newValue,
            };
          });
        }}
      />

      <RntInput
        id="amount"
        label={`What compensation amount do you think the ${isHost ? "guest" : "host"} should pay for the incident?`}
        value={createClaimParams.amountInUsd}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            amountInUsd: e.target.value,
          })
        }
      />
      <p>After your trip ends, you have 72 hours to respond before your complaints become public</p>

      <RntCheckbox
        className="w-full"
        title="I certify that all charges are accurate, and I understand that any false submission or representation may result in restrictions or removal from the Rentality marketplace."
        value={createClaimParams.isChecked}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            isChecked: e.target.checked,
          })
        }
      />

      <RntButton className="w-72" onClick={handleCreateClaim} disabled={!createClaimParams.isChecked}>
        Confirm and send to guest
      </RntButton>
    </div>
  );
}
