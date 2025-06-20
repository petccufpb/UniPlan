import { HelloWorld } from "@application";
import { examplesRepository } from "@infra/sql/kysely";
import { Elysia, t } from "elysia";

export const ExamplesController = new Elysia()
  .decorate({
    examplesRepository,
  })
  .group("/examples", app => {
    const { examplesRepository } = app.decorator;

    return app
      .decorate({
        helloWorld: new HelloWorld(),
      })
      .get("/", ({ helloWorld }) => helloWorld.execute(), {
        detail: {
          tags: ["Examples"],
        },
        response: t.String(),
      });
  });
