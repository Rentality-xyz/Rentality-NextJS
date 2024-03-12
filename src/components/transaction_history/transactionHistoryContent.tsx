import Link from "next/link";
import {TransactionHistoryInfo} from "@/model/TransactionHistoryInfo";
import {
    dateFormat,
    dateFormatDayMonthTime,
    dateFormatYearMonthDayTime,
    dateToHtmlDateTimeFormat
} from "@/utils/datetimeFormatters";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import React, {useState} from "react";
import RntSelect from "@/components/common/rntSelect";
import ReactPaginate from 'react-paginate';

export const sortOptions = {
    completed: "Completed",
    start: "Start",
    finish: "Finish",
};
export type SortOptionKey = keyof typeof sortOptions;
export function isSortOptionKey(key: string): key is SortOptionKey {
    return sortOptions.hasOwnProperty(key);
}

type Props =
    | {
    isHost: true;
    transactions: TransactionHistoryInfo[];
}
    | {
    isHost: false;
    transactions: TransactionHistoryInfo[];
};

export default function TransactionHistoryContent(props: Props) {
    const dateNow = new Date();
    const defaultDateFrom = new Date(dateNow.getTime() + 1 * 60 * 60 * 1000);
    const defaultDateTo = new Date(dateNow.getTime() + 25 * 60 * 60 * 1000);
    const {isHost, transactions} = props;
    const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
    const rowSpanClassName = "px-2 h-12 text-center";
    const [sortBy, setSortBy] = useState<SortOptionKey | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(0); // Текущая страница
    const itemsPerPage = 5; // Количество элементов на странице
    const totalItems = transactions.length; // Общее количество элементов
    const totalPages = Math.ceil(totalItems / itemsPerPage); // Вычисляем общее количество страниц
    const handlePageChange = ({ selected }: { selected: number }) => {
        setCurrentPage(selected);
    };

    const handleSearchClick = async () => {
        // const result = await searchAvailableCars(searchCarRequest);
        // if (result) {
        //     setSortBy(undefined);
        // }
    };

    return (
        <div className="w-full bg-rentality-bg p-4 rounded-2xl mt-5">
            <div className="flex max-md:flex-col md:items-end">
                <RntInput
                    className="max-w-[210px] mr-4"
                    id="dateFrom"
                    label="From"
                    type="datetime-local"
                    value={ dateToHtmlDateTimeFormat(defaultDateFrom) }
                    // onChange={handleSearchInputChange}
                />
                <RntInput
                    className="max-w-[210px] mr-8"
                    id="dateTo"
                    label="To"
                    type="datetime-local"
                    value={dateToHtmlDateTimeFormat(defaultDateTo)}
                    // onChange={handleSearchInputChange}
                />

                <RntSelect
                    className="w-40 max-xl:mt-4 mr-8"
                    id="sort"
                    readOnly={false}
                    value={sortBy ?? ""}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (isSortOptionKey(newValue)) {
                            setSortBy(newValue);
                        }
                    }}
                >
                    <option className="hidden" value={""} disabled>
                        Status
                    </option>
                    {(Object.keys(sortOptions) as (keyof typeof sortOptions)[]).map((key) => (
                        <option key={key} value={key}>
                            {sortOptions[key]}
                        </option>
                    ))}
                </RntSelect>

                <RntButton
                    className="sm:w-40"
                    // disabled={searchButtonDisabled}
                    onClick={
                        () => handleSearchClick()
                    }
                >
                    Search
                </RntButton>
            </div>

            <table className="mt-12 w-full table-auto border-spacing-2 max-lg:hidden">
                <thead className="mb-2">
                <tr>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName} colSpan={2}>
                        <div className="flex flex-col text-rentality-secondary-shade">
                            Guest Payments
                            <span className="w-full h-1 border-b-2 border-[#24D8D4]" />
                        </div>
                    </th>
                    <th className={headerSpanClassName} colSpan={3}>
                        <div className="flex flex-col text-rentality-button-medium">
                            Host Earnings
                            <span className="w-full h-1 border-b-2 border-[#7f5ee7]" />
                        </div>
                    </th>
                    <th className={headerSpanClassName}></th>
                    <th className={headerSpanClassName}></th>
                </tr>
                </thead>
                <thead className="mb-2">
                <tr className="border-b-[2px] border-b-gray-500">
                    <th className={headerSpanClassName}>Car</th>
                    <th className={headerSpanClassName}>Status</th>
                    <th className={headerSpanClassName}>Days</th>
                    <th className={headerSpanClassName}>Start date</th>
                    <th className={headerSpanClassName}>End date</th>
                    <th className={headerSpanClassName}>Trip payment</th>
                    <th className={headerSpanClassName}>Refund</th>
                    <th className={headerSpanClassName}>Trip earnings</th>
                    <th className={headerSpanClassName}>Cancellation fee</th>
                    <th className={headerSpanClassName}>Reimbursements</th>
                    <th className={headerSpanClassName}>Rentality fee</th>
                    <th className={headerSpanClassName}></th>
                </tr>
                </thead>
                <tbody className="text-sm">
                {Array.from({ length: currentPage === 0 ? Math.min(itemsPerPage, transactions.length) : Math.max(0, transactions.length - currentPage * itemsPerPage) }).map((_, index) => {
                    const itemNumber = currentPage * itemsPerPage + index;
                    const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transactions[itemNumber].transHistoryId}`;

                    return (
                        <tr key={transactions[itemNumber].transHistoryId} className="border-b-[2px] border-b-gray-500">
                            <td className={rowSpanClassName}>{transactions[itemNumber].car}</td>
                            <td className={rowSpanClassName}>{transactions[itemNumber].status}</td>
                            <td className={rowSpanClassName}>{transactions[itemNumber].days}</td>
                            <td className={rowSpanClassName}>{dateFormatYearMonthDayTime(transactions[itemNumber].startDateTime)}</td>
                            <td className={rowSpanClassName}>{dateFormatYearMonthDayTime(transactions[itemNumber].endDateTime)}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].tripPayment}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].refund}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].tripEarnings}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].cancellationFee}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].reimbursements}</td>
                            <td className={rowSpanClassName}>${transactions[itemNumber].rentalityFee}</td>
                            <td className={rowSpanClassName}>
                                <Link href={detailsLink}>
                                    <span className="text-rentality-secondary">Details</span>
                                </Link>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <div className="">
                <ReactPaginate
                    previousLabel={'←'}
                    nextLabel={'→'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                />
            </div>
            {/*<div className="lg:hidden">*/}
            {/*    {claims.map((claim, index) => {*/}
            {/*        return isHost ? (*/}
            {/*            <ClaimHistoryMobileCard*/}
            {/*                key={claim.claimId}*/}
            {/*                isHost={isHost}*/}
            {/*                claim={claim}*/}
            {/*                index={index}*/}
            {/*                cancelClaim={props.cancelClaim}*/}
            {/*            />*/}
            {/*        ) : (*/}
            {/*            <ClaimHistoryMobileCard*/}
            {/*                key={claim.claimId}*/}
            {/*                isHost={isHost}*/}
            {/*                claim={claim}*/}
            {/*                index={index}*/}
            {/*                payClaim={props.payClaim}*/}
            {/*            />*/}
            {/*        );*/}
            {/*    })}*/}
            {/*</div>*/}
        </div>
    );
}