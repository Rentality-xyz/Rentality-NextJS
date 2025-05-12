import path from "node:path";

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
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
  		sans: [
  			'Inter',
  			'sans-serif'
  		]
  	},
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		boxShadow: {
  			snackbar: 'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px'
  		},
  		colors: {
  			'rentality-bg-main': '#28174A',
  			'rentality-bg-left-sidebar': '#1E1E30',
  			'rentality-bg-dark': '#0b0b0d',
  			'rentality-bg': '#1E1E32',
  			'rentality-primary': '#6600CC',
  			'rentality-additional': '#6633CC',
  			'rentality-additional-dark': '#240F50',
  			'rentality-additional-light': '#B398FF',
  			'rentality-additional-tint': '#7E59D7',
  			'rentality-secondary': '#5CF4E8',
  			'rentality-secondary-shade': '#24D8D4',
  			'rentality-secondary-dark': '#26B4B1',
  			'rentality-star-point': '#EAB600',
  			'rentality-button-light': '#7da2f6',
  			'rentality-button-medium': '#7f5ee7',
  			'rentality-button-dark': '#593ec0',
  			'rentality-icons': '#C0AEFF',
  			'rnt-button-disabled': '#363659',
  			'rnt-text-button-disabled': '#B2B9DB',
  			'status-pending': '#7c58d7',
  			'status-on-trip': '#220e50',
  			'status-completed': '#22d7d3',
  			'rentality-alert-text': '#f87171',
  			'rnt-checkbox-border': '#7257ce',
  			'rnt-checkbox-check-mark': '#C0AEFF',
  			'rnt-temp-header-bg': '#e5e7eb',
  			'rnt-temp-header-text': '#ffffff',
  			'rnt-temp-sidemenu-bg': '#4b5563',
  			'rnt-temp-sidemenu-text': '#ffffff',
  			'rnt-temp-main-bg': '#e5e7eb',
  			'rnt-temp-main-text': '#ffffff',
  			'rnt-temp-card-bg': '#fce7f3',
  			'rnt-temp-card-text': '#0f172a',
  			'rnt-temp-footer-bg': '#93c5fd',
  			'rnt-temp-footer-text': '#ffffff',
  			'rnt-temp-status-text': '#ffffff',
  			'rnt-temp-image-bg': '#94a3b8',
  			'rnt-temp-slide-panel-container-bg': '#6b7280',
  			'rnt-temp-slide-panel-bg': '#9ca3af',
  			'rnt-temp-textbox-bg': '#ffffff',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		screens: {
  			mac: '1680px',
  			fullHD: '1920px'
  		},
  		fontFamily: {
  			display: 'DM Sans, sans-serif'
  		},
  		fill: {
  			default: 'var(--bg-default)',
  			alternate: 'var(--bg-alternate)',
  			inverse: 'var(--bg-inverse)',
  			primary: 'var(--bg-primary)',
  			secondary: 'var(--bg-secondary)',
  			error: 'var(--bg-error)',
  			warning: 'var(--bg-warning)',
  			success: 'var(--bg-success)'
  		},
  		textColor: {
  			inverse: 'var(--text-inverse)',
  			foreground: 'var(--text-foreground)',
  			'foreground-muted': 'var(--text-foreground-muted)',
  			error: 'var(--text-error)',
  			primary: 'var(--text-primary)',
  			success: 'var(--text-success)',
  			warning: 'var(--text-warning)',
  			disabled: 'var(--text-disabled)'
  		},
  		backgroundColor: {
  			default: 'var(--bg-default)',
  			'default-hover': 'var(--bg-default-hover)',
  			'default-active': 'var(--bg-default-active)',
  			alternate: 'var(--bg-alternate)',
  			'alternate-hover': 'var(--bg-alternate-hover)',
  			'alternate-active': 'var(--bg-alternate-active)',
  			inverse: 'var(--bg-inverse)',
  			'inverse-hover': 'var(--bg-inverse-hover)',
  			'inverse-active': 'var(--bg-inverse-active)',
  			primary: 'var(--bg-primary)',
  			'primary-hover': 'var(--bg-primary-hover)',
  			'primary-active': 'var(--bg-primary-active)',
  			secondary: 'var(--bg-secondary)',
  			'secondary-hover': 'var(--bg-secondary-hover)',
  			'secondary-active': 'var(--bg-secondary-active)',
  			error: 'var(--bg-error)',
  			warning: 'var(--bg-warning)',
  			success: 'var(--bg-success)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  safelist: ["bg-[#FFFF00]", "bg-[#7355D7]"],
  plugins: [require("tailwindcss-animate")],
};
