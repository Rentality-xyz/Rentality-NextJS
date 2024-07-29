import { isEmpty } from "@/utils/string";
import { twMerge } from "tailwind-merge";

interface RntValidationErrorProps extends React.ComponentPropsWithoutRef<"p"> {
  validationError?: string;
}

const RntValidationError = ({ className, validationError, ...rest }: RntValidationErrorProps) => {
  const vClassName = twMerge("text-red-400 mt-2", className);

  return (
    <>
      {!isEmpty(validationError) && (
        <p className={vClassName} {...rest}>
          * {validationError}
        </p>
      )}
    </>
  );
};

export default RntValidationError;
