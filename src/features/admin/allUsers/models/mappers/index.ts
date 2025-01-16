import { ContractAdminKYCInfoDTO } from "@/model/blockchain/schemas";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { AdminUserDetails } from "..";

export function mapContractAdminKYCInfoDTOToAdminUserDetails(
  adminKYCInfoDTO: ContractAdminKYCInfoDTO
): AdminUserDetails {
  return {
    name: adminKYCInfoDTO.kyc.name,
    surname: adminKYCInfoDTO.kyc.surname,
    mobilePhoneNumber: adminKYCInfoDTO.kyc.mobilePhoneNumber,
    profilePhoto: adminKYCInfoDTO.kyc.profilePhoto,
    licenseNumber: adminKYCInfoDTO.kyc.licenseNumber,
    expirationDate: getDateFromBlockchainTime(adminKYCInfoDTO.kyc.expirationDate),
    createDate: getDateFromBlockchainTime(adminKYCInfoDTO.kyc.createDate),
    isTCPassed: adminKYCInfoDTO.kyc.isTCPassed,
    TCSignature: adminKYCInfoDTO.kyc.TCSignature,
    issueCountry: adminKYCInfoDTO.additionalKYC.issueCountry,
    email: adminKYCInfoDTO.additionalKYC.email,
    walletAddress: adminKYCInfoDTO.wallet,
  };
}
