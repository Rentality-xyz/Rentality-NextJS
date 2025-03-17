import { hasFeatureFlag } from "@/features/featureFlags/utils/featureFlags";

const useFeatureFlags = () => {
  return { hasFeatureFlag } as const;
};

export default useFeatureFlags;
