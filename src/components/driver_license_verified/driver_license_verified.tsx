import {ButtonMode, IdentityButton} from "@civic/ethereum-gateway-react";
import {useState} from "react";
import {UNLIMITED_MILES_VALUE_TEXT} from "@/model/HostCarInfo";
import Checkbox, {CheckboxLight, CheckboxOld} from "@/components/common/checkbox";
import RntButton from "@/components/common/rntButton";

export default function DriverLicenseVerified() {
    const [isVerifiedDL, setIsVerifiedDL] = useState(true);
    const [isConfirm, setIsConfirm] = useState(true);
    const [isTerms, setIsTerms] = useState(false);
    const [isCancellation, setIsCancellation] = useState(false);
    const [isProhibited, setIsProhibited] = useState(false);
    const [isPrivacy, setIsPrivacy] = useState(false);

    return (
        <div id="driver_license_verification" className="mt-1.5">
            <p>Please pass driver license verification</p>
            <div className="flex mt-4 items-center">
                <IdentityButton mode={ButtonMode.LIGHT} className="civicButton" />
                <div className="ml-2 md:ml-6">
                    {isVerifiedDL ? <GetVerifiedDriverLicense/> : <GetNotVerifiedDriverLicense/>}
                </div>
            </div>
            <p className="mt-8 w-full md:w-3/4 xl:w-3/5 2xl:w-1/3">For booking or listing a vehicle, please agree to the following documents by clicking on them below and read each one</p>
            <CheckboxLight
                className="ml-4 mt-4"
                title="Terms of service"
                value={isTerms}
                onChange={(e) => {
                    if (!isTerms) {
                        window.open('https://rentality.xyz/legalmatters/terms', '_blank');
                    }
                    setIsTerms(!isTerms);
                }}
            />
            <CheckboxLight
                className="ml-4 mt-2"
                title="Cancellation policy"
                value={isCancellation}
                onChange={(e) => {
                    if (!isCancellation) {
                        window.open('https://rentality.xyz/legalmatters/cancellation', '_blank');
                    }
                    setIsCancellation(!isCancellation);
                }}
            />
            <CheckboxLight
                className="ml-4 mt-2"
                title="Prohibited uses"
                value={isProhibited}
                onChange={(e) => {
                    if (!isProhibited) {
                        window.open('https://rentality.xyz/legalmatters/prohibiteduses', '_blank');
                    }
                    setIsProhibited(!isProhibited);
                }}
            />
            <CheckboxLight
                className="ml-4 mt-2"
                title="Privacy policy"
                value={isPrivacy}
                onChange={(e) => {
                    if (!isPrivacy) {
                        window.open('https://rentality.xyz/legalmatters/privacy', '_blank');
                    }
                    setIsPrivacy(!isPrivacy);
                }}
            />
            <p className="mt-8">I Have read and agree</p>
            <div className="flex mt-4 items-center">
                <RntButton
                           onClick={async () => {
                               setIsConfirm(!isConfirm)
                           }}
                >
                    Confirm
                </RntButton>
                <div className="ml-2 md:ml-6">
                    {isConfirm ? <GetConfirm/> : <GetNotConfirm/>}
                </div>
            </div>

        </div>
    );
}

function GetNotVerifiedDriverLicense() {
    return (
        <div className="flex items-center">
            <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
            <span className="ml-2">You driver license not verified</span>
        </div>
    );
}

function GetVerifiedDriverLicense() {
    return (
        <div className="flex items-center">
            <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
            <span className="ml-2">You driver license verified</span>
        </div>
    );
}

function GetNotConfirm() {
    return (
        <div className="flex items-center">
            <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
            <span className="ml-2">You did not confirm</span>
        </div>
    );
}

function GetConfirm() {
    return (
        <div className="flex items-center">
            <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
            <span className="ml-2">You Confirm</span>
        </div>
    );
}