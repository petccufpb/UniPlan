import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { HttpException } from "@uniplan/domain";
import { Elysia } from "elysia";
import { ExamplesController } from "./controllers";

export const app = new Elysia()
	.error({ HttpException })
	.onError(({ code, error, set }) => {
		switch (code) {
			case "HttpException":
				set.status = error.statusCode;
				return error.message;
		}
	})
	.onTransform(ctx => {
		if (typeof ctx.body === "string") {
			ctx.body = JSON.parse(ctx.body);
		}

		for (const name in ctx.query) {
			if (Array.isArray(ctx.query[name])) {
				ctx.query[name] = ctx.query[name][0].split(",");
			}
		}
	})
	.use(cors())
	.use(
		swagger({
			documentation: {
				info: {
					title: "UniPlan API",
					description: "",
					version: "1.0.0",
					contact: {
						email: "example@email.com",
						name: "",
						url: "",
					},
				},
				tags: [
					{
						name: "Examples",
						description: "Módulo de exemplos.",
					},
				],
			},
			path: "/docs",
			exclude: ["/docs", "/docs/json"],
		}),
	)
	.use(ExamplesController)
	.listen(process.env.PORT || 3333);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
