/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Custom Neutral Palette (Linear-esque)
                background: '#0a0a0a', // Almost black
                surface: '#171717',    // Slightly lighter for cards
                surfaceHighlight: '#262626',

                border: '#2e2e2e',     // Subtle borders
                borderHighlight: '#404040',

                text: {
                    primary: '#ededed',
                    secondary: '#a1a1aa',
                    tertiary: '#52525b',
                },

                // High contrast accent (Electric Violet/Indigo)
                accent: {
                    DEFAULT: '#6366f1',
                    hover: '#818cf8',
                    glow: 'rgba(99, 102, 241, 0.15)'
                },

                // Semantic
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
