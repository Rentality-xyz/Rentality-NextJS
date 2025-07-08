export type UserProfile = {
  profilePhotoUrl: string;
  nickname: string;
  phoneNumber: string;
  isPhoneNumberVerified: boolean;
  tcSignature: string;
  isSignatureCorrect: boolean;
  fullname: string;
  documentType: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
  issueCountry: string;
  email: string;
  isEmailVerified: boolean;
};

export const emptyUserProfile: UserProfile = {
  profilePhotoUrl: "",
  nickname: "",
  phoneNumber: "",
  isPhoneNumberVerified: false,
  tcSignature: "",
  isSignatureCorrect: false,
  fullname: "",
  documentType: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  issueCountry: "",
  email: "",
  isEmailVerified: false,
};
