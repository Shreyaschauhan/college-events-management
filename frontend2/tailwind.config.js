/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        // Ensure these paths correctly cover ALL your component files (.jsx, .tsx, etc.)
        // Verify these match your actual project structure for this config file!
        "./index.html", // Keep if relevant (e.g., for Vite)
        "./src/**/*.{js,ts,jsx,tsx}",
        // You might need to add other paths if components live elsewhere:
        // "./components/**/*.{js,ts,jsx,tsx}",
        // "./pages/**/*.{js,ts,jsx,tsx}",
        // "./app/**/*.{js,ts,jsx,tsx}",
    ],
    prefix: "", // Added for explicit consistency with .ts file
    theme: {
        // Added container settings from .ts config for layout consistency
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            // Kept existing borderRadius from original .js (matches .ts)
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            // Kept existing colors from original .js
            // IMPORTANT: Ensure the corresponding CSS variables (--background, --primary, etc.)
            // are defined in your global CSS and match the values from your .ts setup.
            colors: {
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
            // Added fontFamily from .ts config for font consistency
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            // Kept existing keyframes and added 'fade-in' from .ts config
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                // Added fade-in for mobile menu consistency
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                // Add other keyframes from your .ts config if needed by other components
            },
            // Kept existing animations and added 'fade-in' from .ts config
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                // Added fade-in for mobile menu consistency
                'fade-in': 'fade-in 0.3s ease-out',
                // Add other animations from your .ts config if needed by other components
            },
            // Note: boxShadow and backgroundImage from .ts were not added here
            // as they didn't seem directly used by the Navbar. Add them if needed.
        }
    },
    plugins: [require("tailwindcss-animate")], // Kept plugin (matches .ts)
}