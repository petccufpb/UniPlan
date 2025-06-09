import { styles } from './styles.css'

export interface DropdownProps<T extends string> {
	defaultValue?: unknown
	name?: string
	onChange?: (value: T) => void | Promise<void>
	placeholder?: string
	options:
		| Array<{
				label: string
				value: string
		  }>
		| readonly T[]
}

export function Dropdown<T extends string>({ defaultValue, name, placeholder, onChange, options }: DropdownProps<T>) {
	return (
		<select
			className={styles.container}
			defaultValue={(defaultValue ?? '') as string}
			name={name}
			onChange={e => {
				if (!onChange) return

				let value = e.target.value
				if (typeof options[0] === 'string') {
					value = options[Number(value)] as string
				}

				onChange(value as T)
			}}
		>
			{placeholder && (
				<option value="" hidden>
					{placeholder}
				</option>
			)}

			{options.map((each, i) => {
				if (typeof each === 'string') {
					return (
						<option key={each} value={i}>
							{each}
						</option>
					)
				}

				return (
					<option key={each.label} value={each.value}>
						{each.label}
					</option>
				)
			})}
		</select>
	)
}
