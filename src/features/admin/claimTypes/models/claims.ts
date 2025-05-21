import { ContractClaimTypeV2 } from "@/model/blockchain/schemas";

export type ClaimType = {
    claimTypeId: number;
    claimTypeName: string;
    claimUser: ClaimUsers;
}

export enum ClaimUsers {
    Host,
    Guest,
    Both
}

export function mapContractClaimTypeToClaimType(
    contractClaimType: ContractClaimTypeV2
): ClaimType {
    return {
        claimTypeId: Number(contractClaimType.claimType),
        claimTypeName: contractClaimType.claimName,
        claimUser: Number(contractClaimType.creator),
    };
}