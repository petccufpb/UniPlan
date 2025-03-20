'use client'
import { useStudentStore } from '@context/store'
import disciplines from '@public/data/disciplines.json'
import { Card } from 'actify'

export default function Planejador() {
	const { periodos } = useStudentStore(state => state)

	// Mapeamento dos tipos de disciplinas para seus nomes correspondentes
	const NomeTipoDisciplina: Record<number, string> = {
		0: 'Básica Profissional',
		1: 'Complementar Obrigatória',
		2: 'Complementar Flexível',
		3: 'Optativa',
		4: 'Complementar Obrigatória', // Índice 4 é a mesma categoria de índice 1
	}
	// Agrupa disciplinas por categoria
	const disciplinesByCategory = disciplines.reduce<Map<number, (typeof disciplines)[0][]>>((acc, discipline) => {
		const category = discipline.category
		if (!acc.has(category)) acc.set(category, [])
		acc.get(category)?.push(discipline)
		return acc
	}, new Map())
	return (
		<main className="flex flex-col gap-12">
			{/* Renderização dos períodos */}
			<div className="flex justify-between items-center gap-4 w-full bg-gray-900 p-4 rounded-lg shadow-md overflow-x-auto">
				{periodos.map((_periodo, i) => (
					<Card key={i} variant="outlined" className="flex-1 min-w-[150px] bg-gray-800 text-white px-6 py-4 text-lg text-center shadow-md">
						Período {i + 1}
					</Card>
				))}
			</div>

			{/* Renderização das disciplinas agrupadas por categoria */}
			<div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold text-white mb-2">Disciplinas</h2>
				<div className="max-h-80 overflow-y-auto p-2">
					{Array.from(disciplinesByCategory.entries()).map(([category, disciplines]) => (
						<div key={category} className="mb-4">
							<h2 className="text-xl font-bold text-white mb-2">{NomeTipoDisciplina[category] || `Categoria ${category}`}</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
								{disciplines.map(discipline => (
									<Card
										key={discipline.id}
										className="flex-1 min-w-[150px] bg-gray-800 text-white px-6 py-4 text-lg text-center shadow-md"
										variant="outlined"
									>
										{discipline.name}
									</Card>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	)
}
