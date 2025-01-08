import Hotjar from "@hotjar/browser";
import { env } from "@/utils/env";

export function initHotjar() {
  Hotjar.init(env.NEXT_PUBLIC_HOTJAR_SITE_ID, env.NEXT_PUBLIC_HOTJAR_VERSION);
}
export function initEruda() {
  if (env.NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS === "true") {
    import("eruda").then((eruda) => eruda.default.init({ useShadowDom: true, autoScale: true }));
  }
}
