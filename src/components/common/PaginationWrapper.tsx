import ReactPaginate from "react-paginate";

type PaginationWrapperProps = {
  children?: React.ReactNode;
  currentPage: number;
  totalPages: number;
  selectPage: (page: number) => Promise<void>;
};

export default function PaginationWrapper({ children, currentPage, totalPages, selectPage }: PaginationWrapperProps) {
  return (
    <div className="flex flex-col justify-between gap-4">
      {children}
      {totalPages > 1 && (
        <ReactPaginate
          containerClassName={"flex gap-2 text-gray-400 self-end mr-4"}
          activeClassName={"bg-rentality-primary text-white rounded-full px-2"}
          previousLabel={"←"}
          nextLabel={"→"}
          breakLabel={"..."}
          breakClassName={""}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          forcePage={Math.max(0, currentPage - 1)}
          onPageChange={async ({ selected: zeroBaseSelectedPage }) => {
            await selectPage(zeroBaseSelectedPage + 1);
          }}
        />
      )}
    </div>
  );
}
