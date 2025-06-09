import { styles } from './styles.css'

export interface TitleProps {
	children?: string
}

export const Title = ({ children }: TitleProps) => {
	return <h1 className={styles.title}>{children}</h1>
}
