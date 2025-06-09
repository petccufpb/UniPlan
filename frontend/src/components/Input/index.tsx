import { styles } from './styles.css'

export interface InputProps {
	defaultValue?: unknown
	maxLength?: number
	name?: string
	onChange?: (value: any) => void | Promise<void>
	placeholder?: string
	type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'
}

export const Input = ({ defaultValue, maxLength, name, placeholder, onChange, type }: InputProps) => {
	return (
		<input
			className={styles.input}
			defaultValue={(defaultValue ?? '') as string}
			maxLength={maxLength}
			name={name}
			onChange={e => {
				onChange?.(e.target.value)
			}}
			placeholder={placeholder}
			type={type}
		/>
	)
}
