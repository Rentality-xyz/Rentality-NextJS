import { useEffect } from "react";
import { DevicePlatform, getDevicePlatform } from "@/utils/devicePlatform";
import icAppstore from "@/images/marketplace/ic_appstore.svg";
import icGooglePlay from "@/images/marketplace/ic_google_play.png";
import Image from "next/image";
import Link from "next/link";

function MobileAppRedirect() {
  useEffect(() => {
    const devicePlatform = getDevicePlatform();

    if (devicePlatform === DevicePlatform.iOS) {
      window.location.href = "https://apps.apple.com/ua/app/rentality/id6736899320";
      return;
    }

    if (devicePlatform === DevicePlatform.Android) {
      window.location.href = "https://play.google.com/store/apps/details?id=xyz.rentality.rentality";
      return;
    }

    console.log("Unable to detect device.");
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center text-center sm:mt-14">
      <h1>Redirecting...</h1>
      <p>If you are not redirected automatically, select your platform:</p>
      <div className="mt-4 sm:flex">
        <Link href="https://apps.apple.com/ua/app/rentality/id6736899320">
          <Image src={icAppstore} alt="" className="w-[200px] sm:mr-4" />
        </Link>
        <Link href="https://play.google.com/store/apps/details?id=xyz.rentality.rentality">
          <Image src={icGooglePlay} alt="" className="max-sm:mt-4" />
        </Link>
      </div>
    </div>
  );
}

export default MobileAppRedirect;
