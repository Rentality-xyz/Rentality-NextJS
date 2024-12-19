import { useCallback, useState } from "react";

function useToggleState(initialState: boolean) {
  const [state, setState] = useState(initialState);

  const toggle = useCallback((newState?: boolean) => {
    setState((prev) => (newState !== undefined ? newState : !prev));
  }, []);
  return [state, toggle] as const;
}

export default useToggleState;
