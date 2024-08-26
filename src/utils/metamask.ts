import { Err, Ok, Result } from "@/model/utils/result";

export function tryParseMetamaskError(e: unknown): Result<{ message: string }, string> {
  if (
    e !== null &&
    typeof e === "object" &&
    "info" in e &&
    typeof e.info === "object" &&
    e.info !== null &&
    "error" in e.info &&
    typeof e.info.error === "object" &&
    e.info.error !== null &&
    "data" in e.info.error &&
    typeof e.info.error.data === "object" &&
    e.info.error.data !== null &&
    "message" in e.info.error.data &&
    typeof e.info.error.data.message === "string" &&
    e.info.error.data.message !== null
  ) {
    return Ok({ message: e.info.error.data.message });
  }

  return Err("'e' is not a metamask error message");
}
