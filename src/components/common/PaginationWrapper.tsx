import ReactPaginate from "react-paginate";

type PaginationWrapperProps = {
  children?: React.ReactNode;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => Promise<void>;
};

export default function PaginationWrapper({
  children,
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationWrapperProps) {
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
          forcePage={currentPage}
          onPageChange={async ({ selected }) => {
            await setCurrentPage(selected);
          }}
        />
      )}
    </div>
  );
}
