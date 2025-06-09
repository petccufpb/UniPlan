import { styles } from './styles.css'

export interface SubtitleProps {
	children?: string
}

export const Subtitle = ({ children }: SubtitleProps) => {
	return <h2 className={styles.subtitle}>{children}</h2>
}
