import Link from "next/link";
import RntButton from "../common/rntButton";

export type PageTitleLink = {
  text: string;
  link: string;
};

export default function PageTitle({ title, actions }: { title: string; actions?: PageTitleLink[] }) {
  return (
    <div id="page-title" className="flex flex-row justify-between items-center">
      <div className="text-2xl">
        <strong>{title}</strong>
      </div>
      {actions == undefined || actions.length === 0
        ? null
        : actions.map((action) => {
            return (
              <Link key={action.text} href={action.link}>
                <RntButton className="w-40 sm:w-56 h-12 sm:h-16">{action.text}</RntButton>
              </Link>
            );
          })}
    </div>
  );
}
