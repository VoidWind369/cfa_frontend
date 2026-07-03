/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#FFF5F7",
          surface: "rgba(255, 255, 255, 0.75)",
          surfaceSolid: "#FFFFFF",
          soft: "#FFD9E2",
          primary: "#D8688A",
          primaryHover: "#C9557A",
          primaryActive: "#B4486A",
          accent: "#C084FC",
          glow: "#F472B6",
          text: "#5B4455",
          textLight: "#9A8A94",
          muted: "#F9EEF2",
          border: "#F5D9E1",
          borderLight: "#FAEEF3",
          success: "#6BBF9E",
          warning: "#EBB255",
          error: "#E07890",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      letterSpacing: {
        widest: '.15em',
      },
      boxShadow: {
        soft: "0 2px 12px rgba(216, 104, 138, 0.06)",
        card: "0 8px 32px rgba(216, 104, 138, 0.08)",
        float: "0 16px 48px rgba(216, 104, 138, 0.12)",
        glow: "0 0 24px rgba(216, 104, 138, 0.25)",
        glowLg: "0 0 40px rgba(192, 132, 252, 0.2)",
        inner: "inset 0 2px 8px rgba(216, 104, 138, 0.06)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(216, 104, 138, 0.2)' },
          '50%': { boxShadow: '0 0 32px rgba(216, 104, 138, 0.35)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
