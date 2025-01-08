import { cn } from "@/utils";
import { isEmpty } from "@/utils/string";

interface RntValidationErrorProps extends React.ComponentPropsWithoutRef<"p"> {
  validationError?: string;
}

const RntValidationError = ({ className, validationError, ...rest }: RntValidationErrorProps) => {
  const vClassName = cn("text-rentality-alert-text mt-2", className);

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
