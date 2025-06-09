import { vars } from '@styles/themes'
import { style } from '@vanilla-extract/css'

export const styles = {
	container: style({
		backgroundColor: vars.colors.background.cards,
		borderRadius: vars.radius.default,
		padding: vars.padding.default,
	}),
	form: style({
		display: 'flex',
		flexDirection: 'column',
	}),
}
