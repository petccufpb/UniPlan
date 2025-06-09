import { createTheme } from '@vanilla-extract/css'
import { commonValues, vars } from '.'

export const pet = createTheme(vars, {
	...commonValues,
	colorScheme: 'dark',
	colors: {
		background: {
			cards: '#103169',
			main: '#182240',
		},
		text: {
			primary: '#FFFFFF',
			secondary: '#DEE1F4',
		},
	},
})
