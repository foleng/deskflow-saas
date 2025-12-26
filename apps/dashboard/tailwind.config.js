/** @type {import('tailwindcss').Config} */
export default {
  // 确保这里包含 src 下的所有文件
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 这里的颜色配置非常重要，确保没丢失
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      }
    },
  },
  plugins: [],
}