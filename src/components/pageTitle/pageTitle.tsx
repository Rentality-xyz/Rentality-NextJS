import Link from "next/link";

export type PageTitleLink = {
  text: string;
  link: string;
};

type Props = {
  title: string;
  actions?: PageTitleLink[];
};

export default function PageTitle({ title, actions }: Props) {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="text-2xl">
        <strong>{title}</strong>
      </div>
      {actions == undefined || actions.length === 0
        ? null
        : actions.map((action) => {
            return (
              <Link key={action.text} href={action.link}>
                <button className="w-56 h-16 bg-violet-700 disabled:bg-gray-500 rounded-md">
                  {action.text}
                </button>
              </Link>
            );
          })}
    </div>
  );
}
