import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import axios from "axios";

export async function getDimoSignature(
  walletAddress: string | null,
  dimoToken: number,
  chainId: number
): Promise<Result<string>> {
  if (isEmpty(walletAddress) || dimoToken === 0) return Ok("0x");

  try {
    const response = await axios.post("/api/dimo/signDIMOId", { address: walletAddress, chainId, dimoToken });

    if (response.status === 404) return Ok("0x");

    if (response.status !== 200) {
      logger.error("Sign DIMO error: " + response.status + " with data " + response.data);
      return Err(new Error(response.data));
    }

    logger.info("Dimo signature: ", response.data.signature);
    return Ok(response.data.signature);
  } catch (error) {
    logger.error("Sign DIMO error: ", error);
    return UnknownErr(error);
  }
}
