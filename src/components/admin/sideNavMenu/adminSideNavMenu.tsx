import Link from "next/link";
import BaseSideNavMenu from "@/components/baseSideNavMenu/baseSideNavMenu";

export default function AdminSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <div className="pt-4">
        <div className="py-2 text-xl font-bold">
          <Link href="/admin">Contract info</Link>
        </div>
      </div>
    </BaseSideNavMenu>
  );
}
