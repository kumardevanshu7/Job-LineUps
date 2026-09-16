import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#533afd",
          deep: "#4434d4",
          press: "#2e2b8c",
          soft: "#665efd",
          subdued: "#b9b9f9",
        },
        brand: {
          dark: "#1c1e54",
        },
        ink: {
          DEFAULT: "#0d253d",
          secondary: "#273951",
          mute: "#64748d",
          "mute-2": "#61718a",
        },
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#f6f9fc",
          cream: "#f5e9d4",
        },
        hairline: {
          DEFAULT: "#e3e8ee",
          input: "#a8c3de",
        },
        ruby: "#ea2261",
        magenta: "#f96bee",
        lemon: "#9b6829",
        "shadow-blue": "#003770",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        "display-xxl": "-1.4px",
        "display-xl": "-0.96px",
        "display-lg": "-0.64px",
        "display-md": "-0.26px",
        "heading-lg": "-0.22px",
        "heading-md": "-0.2px",
        tabular: "-0.42px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
      },
      boxShadow: {
        level1: "rgba(0, 55, 112, 0.08) 0px 1px 3px",
        level2:
          "rgba(0, 55, 112, 0.08) 0px 8px 24px, rgba(0, 55, 112, 0.04) 0px 2px 6px",
        level3:
          "rgba(0, 55, 112, 0.12) 0px 16px 36px, rgba(0, 55, 112, 0.06) 0px 4px 12px",
      },
    },
  },
  plugins: [],
};

export default config;
