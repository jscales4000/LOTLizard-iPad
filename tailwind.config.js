/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS-style colors for iPad optimization
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-gray': '#8E8E93',
        'ios-gray-light': '#F2F2F7',
        'ios-gray-dark': '#1C1C1E',
      },
      screens: {
        // iPad-specific breakpoints
        'ipad': '768px',
        'ipad-pro-11': '834px',
        'ipad-pro-12': '1024px',
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
      },
      spacing: {
        // Touch-friendly spacing
        'touch-sm': '44px',
        'touch-md': '54px',
        'touch-lg': '64px',
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
