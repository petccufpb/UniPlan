import { vars } from '@styles/themes'
import { globalStyle } from '@vanilla-extract/css'

globalStyle('body', {
	backgroundColor: vars.colors.background.main,
	colorScheme: vars.colorScheme,
})
