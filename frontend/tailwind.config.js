/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Emergency red palette
        primary: {
          DEFAULT: '#C62828',
          dark:    '#A61F24',
          deep:    '#8F2424',
          light:   '#F8E8E7',
          muted:   '#F3DDDA',
        },
        // Charcoal / dark surfaces
        charcoal: {
          900: '#181818',
          800: '#242424',
          700: '#2D2D2D',
          600: '#383838',
          500: '#4A4A4A',
          400: '#5E5E5E',
          300: '#77746F',
          200: '#B7B5B0',
          100: '#D8D5CF',
          50:  '#E7E5E0',
        },
        // Warm white / neutral
        warm: {
          white:  '#F7F6F3',
          '50':   '#EFEDE8',
          '100':  '#E7E5E0',
          '200':  '#D8D5CF',
          '300':  '#C4C1BA',
          '400':  '#B7B5B0',
          '500':  '#77746F',
          '600':  '#4A4847',
          '700':  '#343230',
          '800':  '#292929',
          '900':  '#181818',
        },
        // Severity / semantic
        severity: {
          critical:    '#A61F24',
          criticalBg:  '#F8E8E7',
          high:        '#8F2424',
          highBg:      '#F3DDDA',
          medium:      '#805515',
          mediumBg:    '#F5EBD7',
          low:         '#292929',
          lowBg:       '#E8E6E1',
          resolved:    '#4A4847',
          resolvedBg:  '#E7E5E0',
        },
        // Amber for warnings (non-red)
        amber: {
          DEFAULT: '#B7791F',
          dark:    '#805515',
          light:   '#F5EBD7',
        },
        // Legacy emergency / warn / info kept for backward compat
        emergency: {
          DEFAULT: '#C62828',
          light:   '#F8E8E7',
          dark:    '#A61F24',
        },
        warn: {
          DEFAULT: '#B7791F',
          light:   '#F5EBD7',
        },
        info: {
          DEFAULT: '#4A7FA8',
          light:   '#EAF1F7',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        xl2:  '12px',
      },
      boxShadow: {
        card:      '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'card-lg': '0 10px 20px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
