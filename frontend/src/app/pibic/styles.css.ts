import { globalStyle, style } from '@vanilla-extract/css'

export const styles = {
	form: style({
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5em', // 24px
	}),
}

globalStyle(`${styles.form} > section > div`, {
	display: 'grid',
	gridTemplateColumns: 'repeat(2, 1fr)',
	gap: '0.75em', // 12px
})
