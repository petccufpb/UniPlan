import { z } from 'zod'

export const memberCategories = ['Docente', 'Discente', 'Servidor Técnico-Administrativo', 'Externo'] as const
export const memberRoles = ['Coordenador', 'Coordenador Adjunto', 'Colaborador'] as const

export const projectSchema = z.object({
	info: z.object({
		description: z.string(),
		methodology: z.string(),
		objectives: z.string(),
		reasoning: z.string(),
		references: z.string(),
	}),
	members: z
		.array(
			z.object({
				category: z.enum(memberCategories),
				name: z.string(),
				role: z.enum(memberRoles),
				workload: z.number().min(0, 'Defina uma carga horária para este membro.'),
			}),
		)
		.min(1, ''),
})
export type ProjectSchema = z.infer<typeof projectSchema>
export type MemberInfo = ProjectSchema['members'][number]
