/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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

        "rentality-button-light": "#7da2f6",
        "rentality-button-medium": "#7f5ee7",
        "rentality-button-dark": "#593ec0",
        "rentality-icons": "#C0AEFF",

        "status-pending": "#7c58d7",
        "status-on-trip": "#220e50",
        "status-completed": "#22d7d3",

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
        sm_inverted: "736px",
        "1xl": "1308px",
      },
    },
  },
  plugins: [],
};
