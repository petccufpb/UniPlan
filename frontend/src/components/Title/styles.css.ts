import { vars } from '@styles/themes'
import { style } from '@vanilla-extract/css'

export const styles = {
	title: style({
		color: vars.colors.text.secondary,
		fontSize: vars.typography.fontSize.title,
	}),
}
