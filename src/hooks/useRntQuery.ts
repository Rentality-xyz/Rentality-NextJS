import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  DefinedUseQueryResult,
  DefinedInitialDataOptions,
  UndefinedInitialDataOptions,
  QueryKey,
  DefaultError,
  QueryClient,
} from "@tanstack/react-query";

function useRntQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError>;

function useRntQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError>;

function useRntQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError>;

function useRntQuery<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError> {
  const { initialData } = options;

  const modifiedOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> = {
    ...options,
    initialData: undefined,
  };

  const queryResult = useQuery<TQueryFnData, TError, TData, TQueryKey>(modifiedOptions, queryClient);

  const resolvedInitialData =
    initialData !== undefined && typeof initialData === "function"
      ? (initialData as () => TData)()
      : (initialData as TData | undefined);

  // @ts-ignore
  return {
    ...queryResult,
    data: queryResult.data ?? resolvedInitialData,
  };
}

export default useRntQuery;
