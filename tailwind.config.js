import path from "node:path";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/**/tailwind.ts",
    path.join(path.dirname(require.resolve("@coinbase/onchainkit")), "**/*.js"),
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },

    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        snackbar:
          "rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px",
      },
      colors: {
        "rentality-bg-main": "#28174A",
        "rentality-bg-left-sidebar": "#1E1E30",

        "rentality-bg-dark": "#0b0b0d",

        "rentality-bg": "#1E1E32", //menu bg, filter, your chat msg bg
        "rentality-primary": "#6600CC", // menu selected bg, other chat msg bg
        "rentality-additional": "#6633CC",
        "rentality-additional-dark": "#240F50",
        "rentality-additional-light": "#B398FF",
        "rentality-additional-tint": "#7E59D7",
        "rentality-secondary": "#5CF4E8",
        "rentality-secondary-shade": "#24D8D4", //sale bg, some (i) text,
        "rentality-secondary-dark": "#26B4B1",
        "rentality-star-point": "#EAB600",

        "rentality-button-light": "#7da2f6",
        "rentality-button-medium": "#7f5ee7",
        "rentality-button-dark": "#593ec0",
        "rentality-icons": "#C0AEFF",

        "status-pending": "#7c58d7",
        "status-on-trip": "#220e50",
        "status-completed": "#22d7d3",

        "rentality-alert-text": "#f87171",

        "rnt-temp-header-bg": "#e5e7eb", //#e5e7eb bg-gray-200
        "rnt-temp-header-text": "#ffffff", //#0f172a text-gray-900
        "rnt-temp-sidemenu-bg": "#4b5563", //#4b5563 bg-gray-600
        "rnt-temp-sidemenu-text": "#ffffff", //#ffffff text-white
        "rnt-temp-main-bg": "#e5e7eb", //#e5e7eb bg-gray-200
        "rnt-temp-main-text": "#ffffff", //#0f172a text-gray-900
        "rnt-temp-card-bg": "#fce7f3", //#fce7f3 bg-pink-100
        "rnt-temp-card-text": "#0f172a", //#0f172a text-gray-900
        "rnt-temp-footer-bg": "#93c5fd", //#93c5fd bg-blue-300
        "rnt-temp-footer-text": "#ffffff", //#ffffff text-white
        "rnt-temp-status-text": "#ffffff", //#ffffff text-white
        "rnt-temp-image-bg": "#94a3b8", //#94a3b8 bg-slate-400
        "rnt-temp-slide-panel-container-bg": "#6b7280", //#6b7280 bg-gray-500
        "rnt-temp-slide-panel-bg": "#9ca3af", //#9ca3af bg-gray-400
        "rnt-temp-textbox-bg": "#ffffff", //#ffffff text-white

        // 'rnt-temp-header-bg': '#1C1038',      //#e5e7eb bg-gray-200 transparent
        // 'rnt-temp-header-text': '#ffffff',    //#0f172a text-gray-900
        // 'rnt-temp-sidemenu-bg': '#1e1e30',    //#4b5563 bg-gray-600
        // 'rnt-temp-sidemenu-text': '#ffffff',  //#ffffff text-white
        // 'rnt-temp-main-bg': '#1C1038',        //#e5e7eb bg-gray-200
        // 'rnt-temp-main-text': '#ffffff',      //#0f172a text-gray-900
        // 'rnt-temp-card-bg': '#1e1e30',        //#fce7f3 bg-pink-100
        // 'rnt-temp-card-text': '#ffffff',      //#0f172a text-gray-900
        // 'rnt-temp-footer-bg': '#1C1038',      //#93c5fd bg-blue-300
        // 'rnt-temp-footer-text': '#ffffff',    //#ffffff text-white
        // 'rnt-temp-status-text': '#ffffff',    //#ffffff text-white
        // 'rnt-temp-image-bg': '#94a3b8',       //#94a3b8 bg-slate-400
        // 'rnt-temp-slide-panel-container-bg': '#6b7280', //#6b7280 bg-gray-500
        // 'rnt-temp-slide-panel-bg': '#1e1e30', //#9ca3af bg-gray-400
        // 'rnt-temp-textbox-bg': 'transparent', //#9ca3af bg-gray-400
      },
      screens: {
        // Standart
        // sm: "640px",
        // md: "768px",
        // lg: "1024px",
        // xl: "1280px",
        // "2xl": "1536px",
        fullHD: "1920px",

        // TODO Obsolete
        // sm_inverted: "736px",
        // "1xl": "1308px",
        // oldLaptop: "1440px",
        // "3xl": "1624px",
      },

      fontFamily: {
        display: "DM Sans, sans-serif", // Set to font of your choice
      },
      fill: {
        default: "var(--bg-default)",
        alternate: "var(--bg-alternate)",
        inverse: "var(--bg-inverse)",
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        error: "var(--bg-error)",
        warning: "var(--bg-warning)",
        success: "var(--bg-success)",
      },
      textColor: {
        inverse: "var(--text-inverse)",
        foreground: "var(--text-foreground)",
        "foreground-muted": "var(--text-foreground-muted)",
        error: "var(--text-error)",
        primary: "var(--text-primary)",
        success: "var(--text-success)",
        warning: "var(--text-warning)",
        disabled: "var(--text-disabled)",
      },
      backgroundColor: {
        default: "var(--bg-default)",
        "default-hover": "var(--bg-default-hover)",
        "default-active": "var(--bg-default-active)",
        alternate: "var(--bg-alternate)",
        "alternate-hover": "var(--bg-alternate-hover)",
        "alternate-active": "var(--bg-alternate-active)",
        inverse: "var(--bg-inverse)",
        "inverse-hover": "var(--bg-inverse-hover)",
        "inverse-active": "var(--bg-inverse-active)",
        primary: "var(--bg-primary)",
        "primary-hover": "var(--bg-primary-hover)",
        "primary-active": "var(--bg-primary-active)",
        secondary: "var(--bg-secondary)",
        "secondary-hover": "var(--bg-secondary-hover)",
        "secondary-active": "var(--bg-secondary-active)",
        error: "var(--bg-error)",
        warning: "var(--bg-warning)",
        success: "var(--bg-success)",
      },
    },
  },
  safelist: ["bg-[#FFFF00]", "bg-[#7355D7]"],
  plugins: [],
};
