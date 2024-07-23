import { join } from 'path'

import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			gridTemplateColumns: {
				// Simple 16 column grid
				'3': 'repeat(autofit, minmax(300px, 1fr))',

				// Complex site-specific column configuration
				'footer': '200px minmax(900px, 1fr) 100px',
			}
		},
	},
	plugins: [
		daisyui,
	],
	daisyui: { themes: true }
};
