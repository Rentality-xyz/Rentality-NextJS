import React from "react";
import RntButton from "../common/rntButton";
import { useEthereum } from "@/contexts/web3/ethereumContext";

import crypto from "crypto";

function encrypt(plainText: string, secretKeyData: string) {
  try {
    var hmac = crypto.createHmac("sha1", secretKeyData);
    var signed = hmac.update(Buffer.from(plainText, "utf-8")).digest("base64");
    return signed;
  } catch (e) {
    console.log(`HmacSHA1 encrypting exception, msg is ${e}`);
  }
  return null;
}

const buildLink = (address: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_ALHEMY_LINK!;
  const url = new URL(baseUrl);

  url.searchParams.append("appId", process.env.NEXT_PUBLIC_ALHEMY_APP_ID!);
  url.searchParams.append("fiat", "USD");
  url.searchParams.append("crypto", "ETH");
  url.searchParams.append("address", address);
  url.searchParams.append("callbackUrl", baseUrl);

  const sign = encrypt(process.env.NEXT_PUBLIC_ALHEMY_SECRET!, url.toString());
  url.searchParams.append("sign", sign!);

  return url.toString();
};
export default function Deposit(): JSX.Element {
  const ethereumInfo = useEthereum();
  return (
    <div className="bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden">
      <RntButton
        style={{ height: 30, weight: 40 }}
        className="h-14 w-44 text-base"
        onClick={() => window.open(buildLink(ethereumInfo?.walletAddress ?? ""))}
      >
        Deposit
      </RntButton>
    </div>
  );
}
