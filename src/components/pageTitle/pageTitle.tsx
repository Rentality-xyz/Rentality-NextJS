import Link from "next/link";
import RntButton from "../common/rntButton";

export type PageTitleLink = {
  text: string;
  link: string;
};

export default function PageTitle({ title, actions }: { title: string; actions?: PageTitleLink[] }) {
  return (
    <div id="page-title" className="flex flex-row items-center justify-between">
      <div className="text-2xl pl-[15px]">
        <strong>{title}</strong>
      </div>
      {actions == undefined || actions.length === 0
        ? null
        : actions.map((action) => {
            return (
              <Link key={action.text} href={action.link}>
                <RntButton className="h-12 w-40 sm:h-16 sm:w-56">{action.text}</RntButton>
              </Link>
            );
          })}
    </div>
  );
}
