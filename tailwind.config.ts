import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Galaxy Misfits theme colors
        space: {
          dark: '#0a0e27',
          purple: '#6b46c1',
          blue: '#2563eb',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
