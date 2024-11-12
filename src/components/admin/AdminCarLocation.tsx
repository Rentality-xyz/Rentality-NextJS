import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { useState } from "react";
import Image from 'next/image';

import { VinInfo } from "@/pages/api/car-api/vinInfo";

const rowSpanClassName = "px-2 h-12 text-center whitespace-pre-line";
type VinData = {
  checked: boolean,
  vinInfo?: VinInfo
}

const AdminCarLocation = ({  carDetails, checkVin, index}:{index: number, carDetails: AdminCarDetails, checkVin: (vin: string) => Promise<VinInfo | undefined>}) => {
    const [verifyVin, setVerifyVin] = useState<VinData>({checked: false})
    const buttonColor = verifyVin.checked ? verifyVin.vinInfo!.exists ? "green" : 'red' : 'green' 
    const buttonText = verifyVin.checked ? verifyVin.vinInfo!.exists ? "Correct Vin" : "Incorect" : "Uncheked"
   
return (
<tr key={carDetails.carId} className="border-b-[1px] border-b-gray-500">
<td className={rowSpanClassName}>{index + 1}</td>
<td className={rowSpanClassName}>{carDetails.carId}</td>
<td className={rowSpanClassName}>{carDetails.hostName}</td>
<td className={rowSpanClassName}>{carDetails.isListed ? "Listed" : "Not listed"}</td>
<td className={rowSpanClassName}>
  <Image src={carDetails.carPhotoUrl} alt="" width={150} height={100} className="object-cover py-2" />
</td>
<td className={rowSpanClassName}>
  <div>{`${carDetails.country} / ${carDetails.state}`}</div>
  <div>{carDetails.city}</div>
</td>
<td className={rowSpanClassName}>
  <div className={`${carDetails.isUniue ? "" : "text-red-500"}`}>{carDetails.locationLatitude}</div>
  <div className={`${carDetails.isUniue ? "" : "text-red-500"}`}>{carDetails.locationLongitude}</div>
  <div>{carDetails.timeZoneId}</div>
</td>
<td className={rowSpanClassName}>
  <span className={`${carDetails.isUserAddressFull ? "" : "text-red-500"}`}>
    {carDetails.userAddress}
  </span>
</td>

<td className={rowSpanClassName}>
  <button
    className="text-blue-500 underline"
    style={{
        backgroundColor: buttonColor,
        border: "solid black 2px"
    }}
    onClick={async () => {
      const response = await checkVin(carDetails.vinNumber);
      console.log("RESPONSE", response)
        setVerifyVin({checked: true, vinInfo: response!})
    }}
  >{"Check Vin " +"(" + buttonText + ")" }
  </button>
  {(verifyVin.vinInfo && verifyVin.vinInfo.exists) && <text>{verifyVin.vinInfo.brand! + " " + verifyVin.vinInfo.model! + " " + verifyVin.vinInfo.yearOfProduction}</text>}
  
</td>
</tr>
);
}
export default AdminCarLocation;