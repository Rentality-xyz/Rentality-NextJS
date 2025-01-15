import { ContractFullKYCInfoDTO } from "@/model/blockchain/schemas";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { AdminUserDetails } from "..";

export function mapContractFullKYCInfoDTOToAdminUserDetails(fullKYCInfoDTO: ContractFullKYCInfoDTO): AdminUserDetails {
  return {
    name: fullKYCInfoDTO.kyc.name,
    surname: fullKYCInfoDTO.kyc.surname,
    mobilePhoneNumber: fullKYCInfoDTO.kyc.mobilePhoneNumber,
    profilePhoto: fullKYCInfoDTO.kyc.profilePhoto,
    licenseNumber: fullKYCInfoDTO.kyc.licenseNumber,
    expirationDate: getDateFromBlockchainTime(fullKYCInfoDTO.kyc.expirationDate),
    createDate: getDateFromBlockchainTime(fullKYCInfoDTO.kyc.createDate),
    isTCPassed: fullKYCInfoDTO.kyc.isTCPassed,
    TCSignature: fullKYCInfoDTO.kyc.TCSignature,
    issueCountry: fullKYCInfoDTO.additionalKYC.issueCountry,
    email: fullKYCInfoDTO.additionalKYC.email,
    walletAddress: ETH_DEFAULT_ADDRESS,
  };
}
