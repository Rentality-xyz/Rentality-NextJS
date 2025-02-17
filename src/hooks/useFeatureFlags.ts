import { hasFeatureFlag } from "@/utils/featureFlags";

const useFeatureFlags = () => {
  return { hasFeatureFlag } as const;
};

export default useFeatureFlags;
