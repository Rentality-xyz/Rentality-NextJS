import { CreateClaimRequest, TripInfoForClaimCreation } from "@/model/blockchain/ContractCreateClaimRequest";
import RntSelect from "../common/rntSelect";
import { useState } from "react";
import { ClaimType, getClaimTypeTextFromClaimType } from "@/model/blockchain/ContractClaimInfo";
import RntInputMultiline from "../common/rntInputMultiline";
import RntInput from "../common/rntInput";
import Checkbox from "../common/checkbox";
import RntButton from "../common/rntButton";

type Props = {
  tripInfos: TripInfoForClaimCreation[];
  createClaim: (createClaimRequest: CreateClaimRequest) => Promise<void>;
};

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

export default function CreateClaim({ tripInfos, createClaim }: Props) {
  const [createClaimParams, setCreateClaimParams] = useState<CreateClaimParams>(emptyCreateClaimParams);

  const allClaimTypes = Object.keys(ClaimType).filter((v) => !isFinite(Number(v)));

  const handleCreateClaim = async () => {
    if (!createClaimParams.isChecked) return;

    const createClaimRequest: CreateClaimRequest = {
      tripId: Number(createClaimParams.selectedTripId),
      claimType: Number(ClaimType[createClaimParams.incidentType as keyof typeof ClaimType]),
      description: createClaimParams.description,
      amountInUsdCents: (Number(createClaimParams.amountInUsd) ?? 0) * 100,
    };
    createClaim(createClaimRequest);
  };

  return (
    <div className="w-full p-4  mt-5 flex flex-col gap-4">
      <div className="flex flex-row gap-10 items-center">
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
              {getClaimTypeTextFromClaimType(index)}
            </option>
          ))}
        </RntSelect>
        <div className="text-rentality-secondary">Trip information</div>
      </div>
      <RntInputMultiline
        id="description"
        rows={3}
        label="Describe you claim in detail"
        placeholder="enter your message"
        value={createClaimParams.description}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            description: e.target.value,
          })
        }
      />

      <RntInput
        className="lg:w-60"
        id="amount"
        label="How much you estimate the incident must be compensated by Guest in USD"
        value={createClaimParams.amountInUsd}
        onChange={(e) =>
          setCreateClaimParams({
            ...createClaimParams,
            amountInUsd: e.target.value,
          })
        }
      />
      <p>Response timeout for a guest 72 hours after trip end Your complaints will be public</p>

      <Checkbox
        className="w-full"
        title="I certify that all charges are accurate, and i understand that any false submission or representation may result in restrictions or removal from the Rentality marketplace."
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
