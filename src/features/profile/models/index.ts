export type UserProfile = {
  profilePhotoUrl: string;
  nickname: string;
  phoneNumber: string;
  tcSignature: string;
  isSignatureCorrect: boolean;
  fullname: string;
  documentType: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
  issueCountry: string;
  email: string;
};

export const emptyUserProfile: UserProfile = {
  profilePhotoUrl: "",
  nickname: "",
  phoneNumber: "",
  tcSignature: "",
  isSignatureCorrect: false,
  fullname: "",
  documentType: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  issueCountry: "",
  email: "",
};
