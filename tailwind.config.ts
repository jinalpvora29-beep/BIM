import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#1E1E1E',      // main viewport background (AEC dark)
        panel: '#26262B',       // solid panel fallback
        accent: '#4DA6FF',      // selection blue (Revit-adjacent)
        accentDim: '#2E6FB0',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
