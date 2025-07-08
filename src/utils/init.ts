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

export function initFacebookPixel() {

  if (env.NEXT_PUBLIC_FB_PIXEL_ID <= 0) return;

  // @ts-ignore
  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  // @ts-ignore
  window.fbq("init", env.NEXT_PUBLIC_FB_PIXEL_ID);
  // @ts-ignore
  window.fbq("track", "PageView");
}
