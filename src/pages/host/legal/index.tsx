import HostLayout from "@/components/host/layout/hostLayout";
import LegalContent from "@/pages/legal_content";
import GuestLayout from "@/components/guest/layout/guestLayout";

export default function Legal() {
  return (
    <div>
      <HostLayout>
        <LegalContent />
      </HostLayout>
    </div>
  );
}
