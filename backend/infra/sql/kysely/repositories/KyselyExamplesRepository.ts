import type { ExamplesRepository } from "@uniplan/domain";
import type { Kysely } from "kysely";
import type { DB } from "../types";

export class KyselyExamplesRepository implements ExamplesRepository {
	constructor(private readonly db: Kysely<DB>) {}
}
