import crypto from "crypto";

export function getEmailVerificationHash(
  privateKet: string,
  walletAddress: string,
  email: string,
  verificationCode: string,
  timestamp: number,
  chainId: number
) {
  return crypto
    .createHmac("sha256", privateKet)
    .update(walletAddress + email + verificationCode + timestamp.toString() + chainId.toString())
    .digest("hex");
}
