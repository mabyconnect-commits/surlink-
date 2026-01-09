/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  			heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius-lg)',
  			md: 'var(--radius)',
  			sm: 'var(--radius-sm)'
  		},
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)',
  				hover: 'var(--primary-hover)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			/* Teal Chart Colors - Surlink Brand Palette */
  			chart: {
  				'1': '#2AABAB', /* Primary teal */
  				'2': '#14B8A6', /* Teal accent */
  				'3': '#10B981', /* Success green */
  				'4': '#64748B', /* Slate gray */
  				'5': '#3B82F6'  /* Info blue */
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'accordion-up': 'accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  		},
  		boxShadow: {
  			/* Modern shadows with teal tint */
  			'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  			'teal-sm': '0 2px 8px rgba(42, 171, 171, 0.15)',
  			'teal-md': '0 4px 16px rgba(42, 171, 171, 0.2)',
  			'teal-lg': '0 8px 24px rgba(42, 171, 171, 0.25)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
