import { NextApiRequest } from "next";
import * as jose from "jose";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import { ApiError } from "next/dist/server/api-utils";

const RENTALITY_AUTH_HEADER = "authorization";
const PRIVY_TOKEN_ISSUER = "privy.io";

export async function checkRentalityAuthToken(
  req: NextApiRequest
): Promise<Result<jose.JWTVerifyResult, ApiError>> {
  const authToken = req.headers[RENTALITY_AUTH_HEADER] as string;

  if (isEmpty(authToken)) {
    return Err(new ApiError(401, `${RENTALITY_AUTH_HEADER} header is missing`));
  }

  if (!authToken.startsWith("Bearer ")) {
    return Err(new ApiError(401, `${RENTALITY_AUTH_HEADER} header should start with 'Bearer'`));
  }
  const rentalityAuthToken = authToken.slice(7);

  const privyAppId = env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privyVerificationKey = env.PRIVY_VERIFICATION_KEY;

  if (isEmpty(privyAppId)) {
    return Err(new ApiError(500, "NEXT_PUBLIC_PRIVY_APP_ID is not set"));
  }
  if (isEmpty(privyVerificationKey)) {
    return Err(new ApiError(500, " PRIVY_VERIFICATION_KEY is not set"));
  }

  const verificationKey = await jose.importSPKI(privyVerificationKey, "ES256");

  try {
    const payload = await jose.jwtVerify(rentalityAuthToken, verificationKey, {
      issuer: PRIVY_TOKEN_ISSUER,
      audience: privyAppId,
    });
    return Ok(payload);
  } catch (error) {
    return Err(
      new ApiError(401, error instanceof Error ? error.message : `Token verification failed with error ${error}.`)
    );
  }
}
