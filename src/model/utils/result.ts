export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => {
  return { ok: true, value: data };
};

export const Err = <E>(error: E): Result<never, E> => {
  return { ok: false, error };
};

export const UnknownErr = (error: unknown): Result<never, Error> => {
  if (error === undefined || error === null) return Err(new Error("Unkown empty error!"));
  if (error instanceof Error) return Err(error);
  return Err(new Error(error.toString()));
};
