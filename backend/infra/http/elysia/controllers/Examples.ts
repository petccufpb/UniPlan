import { HelloWorld } from "@uniplan/application";
import { Elysia, t } from "elysia";
import { examplesRepository } from "~/sql/kysely";

export const ExamplesController = new Elysia()
	.decorate({
		examplesRepository
	})
	.group("/examples", app => {
		const { examplesRepository } = app.decorator;

		return app
			.decorate({
				helloWorld: new HelloWorld()
			})
			.get("/", ({ helloWorld }) => helloWorld.execute(), {
				detail: {
					tags: ["Examples"],
				},
				response: t.String(),
			});
	});
