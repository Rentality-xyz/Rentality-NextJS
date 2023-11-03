import Link from "next/link";

export default function SideNavMenuGroup({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const removeBodyHidden = () => {
    const body = document.body;
    body.classList.remove("max-lg:overflow-hidden");
  };

  return (
    <div className="pt-4">
      <div className="py-2 text-xl font-bold">
        {href != null ? (
          <Link href={href} onClick={removeBodyHidden}>
            {title}
          </Link>
        ) : (
          title
        )}
      </div>
      {children}
    </div>
  );
}
