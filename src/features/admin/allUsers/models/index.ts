import moment from "moment";

export type AdminUserDetails = {
  name: string;
  surname: string;
  mobilePhoneNumber: string;
  profilePhoto: string;
  licenseNumber: string;
  expirationDate: Date;
  createDate: Date;
  isTCPassed: boolean;
  TCSignature: string;
  issueCountry: string;
  email: string;
  walletAddress: string;
};

const MOCK_DATA: AdminUserDetails[] = [
  {
    name: "Bob",
    surname: "Michael Johnson",
    mobilePhoneNumber: "(555) 555-1234",
    profilePhoto: "",
    licenseNumber: "ABC123471",
    expirationDate: moment().toDate(),
    createDate: moment().toDate(),
    isTCPassed: false,
    TCSignature: "",
    issueCountry: "UAE",
    email: "name@name.xyz",
    walletAddress: "",
  },
  {
    name: "Angela",
    surname: "Sarah Williams",
    mobilePhoneNumber: "(111) 111-1234",
    profilePhoto: "",
    licenseNumber: "ABC123472",
    expirationDate: moment().toDate(),
    createDate: moment().toDate(),
    isTCPassed: false,
    TCSignature: "",
    issueCountry: "US",
    email: "name1@name.xyz",
    walletAddress: "",
  },
  {
    name: "Kim",
    surname: "Emily Brown",
    mobilePhoneNumber: "(222) 222-1234",
    profilePhoto: "",
    licenseNumber: "ABC123473",
    expirationDate: moment().toDate(),
    createDate: moment().toDate(),
    isTCPassed: false,
    TCSignature: "",
    issueCountry: "UA",
    email: "name2@name.xyz",
    walletAddress: "",
  },
];
