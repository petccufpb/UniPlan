import { type MemberInfo, type ProjectSchema, memberCategories, memberRoles } from '@app/pibic/data'
import { Dropdown } from '@components/Dropdown'
import { Input } from '@components/Input'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { styles } from './styles.css'

export interface AddMemberProps {
	index: number
	members: ProjectSchema['members']
	onFinish: () => void
	setState: Dispatch<SetStateAction<ProjectSchema>>
}

export const AddMember = ({ index = 0, members, onFinish, setState }: AddMemberProps) => {
	const [memberData, setMemberData] = useState(
		(members[index] ?? {
			category: '',
			name: '',
			role: '',
			workload: 0,
		}) as MemberInfo,
	)

	const handleInputChange = (key: keyof MemberInfo, value: string | number) => {
		setMemberData(old => ({
			...old,
			[key]: value,
		}))
	}

	const addMember = () => {
		setState(old => {
			const newData = { ...old }

			newData.members[index] = memberData

			return newData
		})
		onFinish()
	}

	return (
		<div className={styles.container}>
			{/* Discentes mestrandos ou doutorandos e Servidores Técnico-Administrativos somente poderão figurar como membros colaboradores */}

			{/* O Plano Individual do Docente (PID) determina que a Carga Horária Máxima para Coordenação de Iniciação Científica é de 6h semanais que devem ser distribuídas entre todos os projetos  */}

			<form
				className={styles.form}
				onSubmit={e => {
					e.preventDefault()
					addMember()
				}}
			>
				<Dropdown
					name="category"
					placeholder="Categoria"
					options={memberCategories}
					onChange={value => handleInputChange('category', value)}
				/>

				<Input name="name" placeholder="Nome" onChange={value => handleInputChange('name', value)} />

				<Dropdown name="role" placeholder="Função" options={memberRoles} onChange={value => handleInputChange('role', value)} />

				<Input name="workload" type="number" placeholder="CH (semanal)" onChange={value => handleInputChange('workload', value)} />

				<button type="submit" onClick={addMember}>
					Salvar Membro
				</button>
			</form>
		</div>
	)
}
