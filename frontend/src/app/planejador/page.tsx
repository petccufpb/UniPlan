'use client'
import { useStudentStore } from '@context/store'
import disciplines from '@public/data/disciplines.json'
import { Card } from 'actify'

export default function Planejador() {
	const { periodos, setPeriodos } = useStudentStore(state => state)

	return (
		<main className="flex flex-col gap-12">
			<div className="flex justify-between items-center gap-4 w-full bg-gray-900 p-4 rounded-lg shadow-md overflow-x-auto">
				{periodos.map((_periodo, i) => (
					<Card key={i} variant="outlined" className="flex-1 min-w-[150px] bg-gray-800 text-white px-6 py-4 text-lg text-center shadow-md">
						Período {i + 1}
					</Card>
				))}
			</div>

			<div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold text-white mb-2">Disciplinas</h2>

				<div className="max-h-80 overflow-y-auto p-2">
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
			</div>
		</main>
	)
}
