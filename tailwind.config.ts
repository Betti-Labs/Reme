import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // GitHub theme colors
        "github-bg": "var(--github-bg)",
        "github-surface": "var(--github-surface)",
        "github-border": "var(--github-border)",
        "github-text": "var(--github-text)",
        "github-text-secondary": "var(--github-text-secondary)",
        "github-primary": "var(--github-primary)",
        "github-success": "var(--github-success)",
        "github-warning": "var(--github-warning)",
        "github-error": "var(--github-error)",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["var(--font-code)", "JetBrains Mono", "Monaco", "Consolas", "monospace"],
        ui: ["var(--font-ui)", "Inter", "system-ui", "sans-serif"],
        code: ["var(--font-code)", "JetBrains Mono", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-from-right": {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin-slow 2s linear infinite",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      minHeight: {
        "screen-75": "75vh",
        "screen-80": "80vh",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "github": "0 8px 24px rgba(140, 149, 159, 0.2)",
        "github-lg": "0 12px 28px rgba(140, 149, 159, 0.3)",
      },
      transitionProperty: {
        "spacing": "margin, padding",
        "layout": "width, height, margin, padding",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Custom plugin for GitHub theme utilities
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.scrollbar-github': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--github-border) var(--github-bg)',
        },
        '.scrollbar-github::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-github::-webkit-scrollbar-track': {
          background: 'var(--github-bg)',
        },
        '.scrollbar-github::-webkit-scrollbar-thumb': {
          background: 'var(--github-border)',
          'border-radius': '4px',
        },
        '.scrollbar-github::-webkit-scrollbar-thumb:hover': {
          background: 'var(--github-text-secondary)',
        },
        '.text-shadow-sm': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        '.text-shadow': {
          'text-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      })
    }
  ],
} satisfies Config;
