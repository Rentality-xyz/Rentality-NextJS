import useTripInfo from "@/hooks/useTripInfo";
import PageTitle from "../pageTitle/pageTitle";
import RntButton from "../common/rntButton";
import { useRouter } from "next/router";
import TripCard from "@/components/tripCard/tripCard";
import { TFunction } from "@/pages/i18n";
import Image from "next/image";
import carDoorsIcon from "@/images/car_doors.png";
import carSeatsIcon from "@/images/car_seats.png";
import carEngineTypeIcon from "@/images/car_engine_type.png";
import carTransmissionIcon from "@/images/car_transmission.png";
import carTankSizeIcon from "@/images/car_tank_size.png";
import carColourIcon from "@/images/car_colour.png";
import { getEngineTypeString } from "@/model/EngineType";
import moment from "moment";

export default function tripInfo({ tripId, t }: { tripId: bigint; t: TFunction }) {
	const [isLoading, tripInfo] = useTripInfo(tripId);
	const router = useRouter();
	const t_details: TFunction = (name, options) => {
		return t("booked.details." + name, options);
	};

	if (tripId == null || tripId === BigInt(0)) return null;

	return (
		<>
			<PageTitle title={t_details("title", { tripId: tripId.toString() })} />
			{isLoading ? (
				<div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
					{t("common.info.loading")}
				</div>
			) : (
				<>
					<TripCard
						key={tripId}
						tripInfo={tripInfo}
						disableButton={true}
						isHost={false}
						showMoreInfo={false}
						t={t}
					/>

					<div className="flex flex-wrap my-6">
						<div class="w-full xl:w-2/3">
							<div className="rnt-card flex flex-col rounded-xl bg-rentality-bg my-2 mr-2">
								<div class="flex flex-row grow p-2">
									<strong class="text-2xl text-[#52D1C9]">{t_details("about_car")}</strong>
								</div>
								<div class="flex flex-row grow p-2">
									<strong class="text-xl text-[#52D1C9]">{t_details("basic_car_details")}</strong>
								</div>
								<div class="flex flex-wrap p-2">
									<div class="flex w-40 items-center m-2">
										<Image className="me-1" src={carDoorsIcon} width={30} height={30} alt="" />
										{tripInfo.carDoorsNumber} {t_details("doors")}
									</div>
									<div class="flex w-40 items-center m-2">
										<Image className="me-1" src={carSeatsIcon} width={30} height={30} alt="" />
										{tripInfo.carSeatsNumber} {t_details("seats")}
									</div>
									<div class="flex w-40 items-center m-2">
										<Image className="me-1" src={carEngineTypeIcon} width={30} height={30} alt="" />
										{t("vehicles.engine_type")} {getEngineTypeString(tripInfo.engineType)}
									</div>
									<div class="flex w-40 items-center m-2 word-break">
										<Image className="me-1" src={carTransmissionIcon} width={30} height={30} alt="" />
										{t("vehicles.transmission")}: {tripInfo.carTransmission}
									</div>
									<div class="flex w-40 items-center m-2">
										<Image className="me-1" src={carTankSizeIcon} width={30} height={30} alt="" />
										{t("vehicles.tank_size")}: {tripInfo.tankVolumeInGal}
									</div>
									<div class="flex w-40 items-center m-2">
										<Image className="me-1" src={carColourIcon} width={30} height={30} alt="" />
										{t_details("car_colour")}: {tripInfo.carColour}
									</div>
								</div>
								<div class="flex flex-row grow p-2">
									<strong class="text-xl text-[#52D1C9]">{t_details("more_car_details")}</strong>
								</div>
								<div class="flex-row grow p-2">
									{tripInfo.carDescription}
								</div>
							</div>
							<div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg my-2 mr-2">
								<div class="flex flex-row grow p-2">
									<strong class="text-2xl text-[#52D1C9]">{t_details("trip_status_details")}</strong>
								</div>
							</div>
						</div>
						<div class="w-full xl:w-1/3">
							<div class="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg my-2 ml-2">
								<div class="flex flex-row grow p-2">
									<strong class="text-2xl text-[#52D1C9]">{t_details("trip_receipt")}</strong>
								</div>
								<div class="flex flex-row grow p-2">
									{t_details("reservation")} # {tripInfo.tripId}
								</div>
								<hr class="my-4" />
								<table class="m-2">
									<tbody>
										<tr>
											<td>{t_details("price_per_day")}</td>
											<td class="text-end">${tripInfo.pricePerDayInUsdCents}</td>
										</tr>
										<tr>
											<td>{t_details("trip_days")}</td>
											<td class="text-end">{moment(tripInfo.tripEnd).diff(tripInfo.tripStart, 'days')}</td>
										</tr>
										<tr>
											<td>{t_details("trip_price")}</td>
											<td class="text-end">${tripInfo.totalPrice}</td>
										</tr>
										<tr>
											<td>{t_details("discount_amount")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td>{t_details("sales_tax")}</td>
											<td class="text-end">${tripInfo.taxPriceInUsd}</td>
										</tr>
										<tr>
											<td>{t_details("government_tax")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td class="pt-5"><strong>{t_details("trip_total")}</strong></td>
											<td class="text-end text-red-700 pt-5">UNMAPPED</td>
										</tr>
									</tbody>
								</table>
								<hr class="my-4" />
								<div class="flex flex-row grow p-2">
									{t_details("security_deposit_info")}:
								</div>
								<table class="m-2">
									<tbody>
										<tr>
											<td>{t_details("received")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td>{t_details("reimbursement")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td>{t_details("returned")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
									</tbody>
								</table>
								<hr class="my-4" />
								<div class="flex flex-row grow p-2">
									{t_details("reimbursement_info")}:
								</div>
								<table class="m-2">
									<tbody>
										<tr>
											<td>{t_details("refuel_gal")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td>{t_details("price_per_gal")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
										<tr>
											<td>{t_details("refuel_or_recharge")}</td>
											<td class="text-end text-red-700">UNMAPPED</td>
										</tr>
									</tbody>
								</table>								
							</div>
						</div>
					</div>
					<div className="flex flex-row gap-4 mb-8 mt-4 items-center">
						<RntButton className="w-40 h-16" onClick={() => router.back()}>
							{t("common.back")}
						</RntButton>
					</div>
				</>
			)}
		</>
	);
}
