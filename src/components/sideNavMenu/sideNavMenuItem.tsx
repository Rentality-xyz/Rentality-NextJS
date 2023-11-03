import Link from "next/link";

export default function SideNavMenuItem({ text, href }: { text: string; href: string }) {
  const removeBodyHidden = () => {
    const body = document.body;
    body.classList.remove("max-lg:overflow-hidden");
  };

  return (
    <div className="py-1 h-12">
      <Link href={href} onClick={removeBodyHidden}>
        {text}
      </Link>
    </div>
  );
}
