import { useRentality } from "@/contexts/rentalityContext";
import { validateContractCheckPromoDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { bigIntReplacer } from "@/utils/json";
import { isEmpty } from "@/utils/string";
import moment from "moment";
import { useCallback } from "react";

function useCheckPromo() {
  const { rentalityContracts } = useRentality();

  const checkPromo = useCallback(
    async (
      code: string,
      startDateTimeStringFormat: string,
      endDateTimeStringFormat: string,
      timeZoneId: string
    ): Promise<Result<{ value: number }, Error>> => {
      if (!rentalityContracts) {
        console.error("fetchData error: rentalityContract is null");
        return Err(new Error("Contract is not initialized"));
      }

      try {
        const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
        const dateFrom = moment.tz(startDateTimeStringFormat, notEmtpyTimeZoneId).toDate();
        const dateTo = moment.tz(endDateTimeStringFormat, notEmtpyTimeZoneId).toDate();

        const startUnixTime = getBlockchainTimeFromDate(dateFrom);
        const endUnixTime = getBlockchainTimeFromDate(dateTo);
        const checkPromoDto = await rentalityContracts.gateway.checkPromo(code, startUnixTime, endUnixTime);
        validateContractCheckPromoDTO(checkPromoDto);

        console.debug("checkPromoDto", JSON.stringify(checkPromoDto, bigIntReplacer, 2));

        if (!checkPromoDto.isFound) {
          return Err(new Error("Promo is not found"));
        }
        if (!checkPromoDto.isValid || !checkPromoDto.isDiscount) {
          return Err(new Error("Promo is not valid"));
        }

        return Ok({ value: Number(checkPromoDto.value) });
      } catch (error) {
        return Err(new Error("checkPromo erro: " + error));
      }
    },
    [rentalityContracts]
  );

  return { checkPromo } as const;
}

export default useCheckPromo;
