import Loading from "@/components/common/Loading";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import RntSelect from "@/components/common/rntSelect";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractInsuranceDTO, InsuranceType } from "@/model/blockchain/schemas";
import { validateContractInsuranceDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { cn } from "@/utils";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { bigIntReplacer } from "@/utils/json";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const defaultFilters: HostInsuranceFiltersType = {};

export default function HostInsurance() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<HostInsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useHostInsurances();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: HostInsuranceFiltersType) {
    setFilters(filters);
    await fetchData(filters, 1, itemsPerPage);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(filters, page, itemsPerPage);
  }

  useEffect(() => {
    fetchData(defaultFilters, 1, itemsPerPage);
  }, [fetchData]);

  return (
    <>
      <PageTitle title={t("insurance.page_title")} />
      <p>{t("insurance.please_enter_your_insurance")}</p>
      <AddHostInsurance />
      <p>{t("insurance.insurance_list")}</p>
      <HostInsuranceFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPageCount}
          selectPage={fetchDataForPage}
        >
          <HostInsuranceTable isLoading={isLoading} data={data.data} />
        </PaginationWrapper>
      </div>
    </>
  );
}

export type HostInsuranceFiltersType = {};

export function useHostInsurances() {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TripInsurance[]>([]);
  const [allData, setAllData] = useState<TripInsurance[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const filterData = useCallback(
    (data: TripInsurance[], filters?: HostInsuranceFiltersType, page: number = 1, itemsPerPage: number = 10) => {
      const filteredData = !filters
        ? data
        : data.filter(
            (i) => i !== undefined
            // (filters.dateFrom === undefined || i.startDateTime >= filters.dateFrom) &&
            // (filters.dateTo === undefined || i.endDateTime <= filters.dateTo) &&
            // (filters.status === undefined || i.status === filters.status)
          );
      const slicedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      setCurrentPage(page);
      setData(slicedData);
      console.log(`slicedData.length: ${slicedData.length} | itemsPerPage: ${itemsPerPage}`);

      setTotalPageCount(Math.ceil(filteredData.length / itemsPerPage));
    },
    []
  );

  const fetchData = useCallback(
    async (
      filters?: HostInsuranceFiltersType,
      page: number = 1,
      itemsPerPage: number = 10
    ): Promise<Result<boolean, string>> => {
      if (allData !== undefined) {
        filterData(allData, filters, page, itemsPerPage);
        return Ok(true);
      }

      if (!rentalityContract) {
        console.error("fetchData error: rentalityContract is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);
        console.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

        const insuranceData: ContractInsuranceDTO[] = await rentalityContract.getInsurancesBy(true);

        if (insuranceData && insuranceData.length > 0) {
          validateContractInsuranceDTO(insuranceData[0]);
        }

        const data: TripInsurance[] = insuranceData.map((i) => ({
          tripId: Number(i.tripId),
          tripInfo:
            i.insuranceInfo.insuranceType === InsuranceType.General
              ? "For all trips"
              : `#${i.tripId} ${i.carBrand} ${i.carModel} ${i.carYear} ${dateRangeFormatShortMonthDateYear(new Date(), new Date())}`,
          insurance: {
            type:
              i.insuranceInfo.insuranceType === InsuranceType.General
                ? "General Insurance ID"
                : "One-Time trip insurance",
            photos: [i.insuranceInfo.photo],
            companyName: i.insuranceInfo.companyName,
            policyNumber: i.insuranceInfo.policyNumber,
            comment: i.insuranceInfo.comment,
            uploadedBy: `${i.insuranceInfo.createdBy}`,
          },
          hostPhoneNumber: i.creatorPhoneNumber,
          guestPhoneNumber: i.creatorPhoneNumber,
        }));

        setAllData(data);
        filterData(data, filters, page, itemsPerPage);

        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityContract, allData, filterData]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
}

export function AddHostInsurance() {
  const { t } = useTranslation();

  return <RntButtonTransparent>{t("insurance.add_insurance")}</RntButtonTransparent>;
}

interface HostInsuranceFiltersProps {
  defaultFilters?: HostInsuranceFiltersType;
  onApply: (filters: HostInsuranceFiltersType) => Promise<void>;
}

export function HostInsuranceFilters({ defaultFilters, onApply }: HostInsuranceFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col self-end">
      <p>{t("insurance.trip_filter")}</p>
      <div className="flex gap-4">
        <RntSelect></RntSelect>
        <RntButton>{t("common.apply")}</RntButton>
      </div>
    </div>
  );
}

type HostInsuranceTableProps = {
  isLoading: boolean;
  data: TripInsurance[];
};

type Insurance = {
  type: string; // General Insurance ID | ?
  photos: string[];
  companyName: string;
  policyNumber: string;
  comment: string;
  uploadedBy: string; // `Guest ${guestName} uploaded ${dateTime, DD.MM.YY hh:mm tt}` | `Guest ${guestName} deleted ${dateTime, DD.MM.YY hh:mm tt}`
};

type TripInsurance = {
  tripId: number;
  tripInfo: string; // "For all trips" | `#${tripId} ${carBrand} ${carModel} ${carYear} ${dateFrom, MMM DD} - ${dateTo, MMM DD YYYY}`
  insurance: Insurance;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
};

export function HostInsuranceTable({ isLoading, data }: HostInsuranceTableProps) {
  const { t } = useTranslation();

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  if (isLoading) {
    return (
      <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="text-xl lg:hidden">{t("common.low_resolution")}</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.trip")}</th>
            <th className={`${headerSpanClassName} min-w-[20h]`}>{t("insurance.insurance_type")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.view_document")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.insurance_company_name")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.insurance_policy_number")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.comment")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.uploaded_by")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.trip_details")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((i, index) => {
            return (
              <tr key={index} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{i.tripInfo}</td>
                <td className={rowSpanClassName}>{i.insurance.type}</td>
                <td
                  className={cn(rowSpanClassName, "text-rentality-secondary")}
                >{`See ${i.insurance.photos.length} photo`}</td>
                <td className={rowSpanClassName}>{i.insurance.companyName}</td>
                <td className={rowSpanClassName}>{i.insurance.policyNumber}</td>
                <td className={rowSpanClassName}>{i.insurance.comment}</td>
                <td className={rowSpanClassName}>{i.insurance.uploadedBy}</td>
                <td className={rowSpanClassName}></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
