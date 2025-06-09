'use client'
import { Input, Subtitle, Title } from '@components'
import { useState } from 'react'
import { AddMember } from './components/AddMember'
import type { ProjectSchema } from './data'
import { styles } from './styles.css'

// Os projetos de pesquisas envolvendo seres humanos devem ser analisados pelo Comitê de Ética em Pesquisa (CEP), visando salvaguardar a dignidade, os direitos, a segurança e o bem-estar do participante da pesquisa. Desta forma, os projetos enquadrados nesta categoria devem ser previamente registrados na Plataforma Brasil e, no ato de inscrição do projeto, deverá ser informado o número CAAE.

// Os projetos de pesquisa que utilizam modelos animais devem ser analisados pela Comissão de Ética no Uso de Animais (CEUA), visando à qualificação dos projetos e evitando o uso inapropriado ou abusivo de animais. Desta forma, os projetos enquadrados nesta categoria devem ser previamente registrados na CEUA e no ato de inscrição do projeto deverá ser informado o número do protocolo de registro.

export default () => {
	const [currentMember, setCurrentMember] = useState<number>()
	const [projectData, setProjectData] = useState<ProjectSchema>({
		info: {
			description: '',
			reasoning: '',
			objectives: '',
			methodology: '',
			references: '',
		},
		members: [],
	})

	return (
		<>
			<Title>Projeto de pesquisa</Title>

			<main className="flex flex-col gap-12">
				<form className={styles.form}>
					<section>
						<Subtitle>Detalhes do projeto</Subtitle>

						<div>
							<Input name="description" placeholder="Descrição Resumida" maxLength={15000} defaultValue={projectData.info.description} />

							<Input name="reasoning" placeholder="Introdução/Justificativa" maxLength={15000} defaultValue={projectData.info.reasoning} />

							<Input name="objectives" placeholder="Objetivos" maxLength={15000} defaultValue={projectData.info.objectives} />

							<Input name="methodology" placeholder="Metodologia" maxLength={15000} defaultValue={projectData.info.methodology} />

							<Input name="references" placeholder="Referências" maxLength={15000} defaultValue={projectData.info.references} />
						</div>
					</section>

					<section>
						<Subtitle>Membros do projeto</Subtitle>

						<div>
							{projectData.members.map((member, i) => (
								<div key={i} onClick={() => setCurrentMember(i)}>
									<p>{member.name}</p>
									<p>{member.category}</p>
									<p>
										{member.role} - {member.workload}h
									</p>
								</div>
							))}
						</div>

						<button type="button" onClick={() => setCurrentMember(projectData.members.length)}>
							Adicionar membro
						</button>
					</section>
				</form>

				{currentMember !== undefined && (
					<AddMember
						index={currentMember}
						members={projectData.members}
						onFinish={() => setCurrentMember(undefined)}
						setState={setProjectData}
					/>
				)}
			</main>
		</>
	)
}
