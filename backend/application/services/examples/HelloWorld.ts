export class HelloWorld {
	constructor(private readonly exampleDep: Record<string, any> = {}) {}

	public async execute(): Promise<string> {
		return "Hello, World!";
	}
}
