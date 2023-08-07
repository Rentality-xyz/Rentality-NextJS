import Link from "next/link";

export default function SideNavMenuItem({
  text,
  href,
}: {
  text: string;
  href: string;
}) {
  return (
    <div className="py-1 h-12">
      <Link href={href}>{text}</Link>
    </div>
  );
}
