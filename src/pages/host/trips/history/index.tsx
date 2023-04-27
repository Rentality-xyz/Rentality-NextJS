import HostLayout from "@/components/host/layout/hostLayout";
import TripItem from "@/components/host/tripItem";

export default function History() {
  return (
    <HostLayout>
      <div className="flex flex-col pl-8 pt-4">
        <div className="text-2xl">History</div>
        <div className="flex flex-col">
          <TripItem />
          <TripItem />
          <TripItem />
          <TripItem />
          <TripItem />
        </div>
      </div>
    </HostLayout>
  );
}
