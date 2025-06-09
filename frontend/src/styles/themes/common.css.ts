import { createThemeContract } from '@vanilla-extract/css'

const theme = {
	colorScheme: '',
	colors: {
		background: {
			cards: '',
			main: '',
		},
		text: {
			primary: '',
			secondary: '',
		},
	},
	padding: {
		default: '',
	},
	radius: {
		default: '',
	},
	typography: {
		fontFamily: '',
		fontSize: {
			subtitle: '',
			title: '',
		},
	},
}

export const vars = createThemeContract(theme)

export const commonValues = {
	padding: {
		default: '0.75em', // 12px
	},
	radius: {
		default: '0.5em', // 8px
	},
	typography: {
		fontFamily: 'Inter, sans-serif',
		fontSize: {
			subtitle: '1.25em', // 20px
			title: '1.875em', // 30px
		},
	},
} satisfies Partial<typeof theme>
