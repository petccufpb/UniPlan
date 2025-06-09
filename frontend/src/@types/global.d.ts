declare type FormAction<CurrentState = unknown> = (
	currentState: CurrentState,
	formData: FormData,
) => Promise<
	{
		values?: Record<string, unknown>
	} & (
		| {
				success: true
				message?: string
		  }
		| {
				success: false
				errors: Record<string, string[]>
		  }
	)
>

declare type Themes = 'pet'
