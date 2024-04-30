import RntSelect from "../common/rntSelect";
import { useState } from "react";
import RntInputMultiline from "../common/rntInputMultiline";
import RntInput from "../common/rntInput";
import Checkbox from "../common/checkbox";
import RntButton from "../common/rntButton";
import { getClaimTypeTextFromClaimType } from "@/model/Claim";
import Link from "next/link";
import { isEmpty } from "@/utils/string";
import { CreateClaimRequest, TripInfoForClaimCreation } from "@/model/CreateClaimRequest";
import { ClaimType } from "@/model/blockchain/schemas";
import RntFileButton from "@/components/common/rntFileButton";
import {t} from "i18next";
import {resizeImage} from "@/utils/image";
import Image from "next/image";
import mirror from "../../images/ic_mirror_logo.svg";
import ClaimAddPhoto from "@/components/claims/claimAddPhoto";
import addCircleOutline from "@/images/add_circle_outline_white_48dp.svg";

type CreateClaimParams = {
  selectedTripId: string;
  incidentType: string;
  description: string;
  amountInUsd: string;
  isChecked: boolean;
};

const emptyCreateClaimParams: CreateClaimParams = {
  selectedTripId: "",
  incidentType: "Tolls",
  description: "",
  amountInUsd: "",
  isChecked: false,
};

export default function CreateClaim({
  tripInfos,
  createClaim,
}: {
  tripInfos: TripInfoForClaimCreation[];
  createClaim: (createClaimRequest: CreateClaimRequest) => Promise<void>;
}) {
  const [createClaimParams, setCreateClaimParams] = useState<CreateClaimParams>(emptyCreateClaimParams);

  const allClaimTypes = Object.keys(ClaimType).filter((v) => !isFinite(Number(v)));

  const handleCreateClaim = async () => {
    if (!createClaimParams.isChecked) return;

    const createClaimRequest: CreateClaimRequest = {
      tripId: Number(createClaimParams.selectedTripId),
      guestAddress: tripInfos.find((ti) => ti.tripId === Number(createClaimParams.selectedTripId))?.guestAddress ?? "",
      claimType: BigInt(ClaimType[createClaimParams.incidentType as keyof typeof ClaimType]),
      description: createClaimParams.description,
      amountInUsdCents: (Number(createClaimParams.amountInUsd) ?? 0) * 100,
    };
    createClaim(createClaimRequest);
  };

  return (
    <div className="w-full p-4  mt-5 flex flex-col gap-4">
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
          className="lg:w-60"
          id="type"
          label="Incident type"
          value={createClaimParams.incidentType}
          onChange={(e) =>
            setCreateClaimParams({
              ...createClaimParams,
              incidentType: e.target.value,
            })
          }
        >
          {allClaimTypes.map((i, index) => (
            <option key={index} value={i.toString()}>
              {getClaimTypeTextFromClaimType(BigInt(index))}
            </option>
          ))}
        </RntSelect>

        {!isEmpty(createClaimParams.selectedTripId) ? (
          <Link href={`/host/trips/tripInfo/${createClaimParams.selectedTripId}`} target="_blank">
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
        <div className="my-2">
            <p className="mt-2 mb-1">
                Up to 5 photos possible
            </p>
            <ClaimAddPhoto />
        </div>

      <RntInput
        id="amount"
        label="What compensation amount do you think the guest should pay for the incident?"
        value={createClaimParams.amountInUsd}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            amountInUsd: e.target.value,
          })
        }
      />
      <p>After your trip ends, you have 72 hours to respond before your complaints become public</p>

      <Checkbox
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
