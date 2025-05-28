interface GraphQLResponse<T = unknown> {
	data?: T;
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: Array<string | number>;
	}>;
}

interface GraphQLRequest {
	query: string;
	variables?: Record<string, unknown>;
	operationName?: string;
}

export class GraphQLClient {
	private endpoint: string;
	private headers: Record<string, string>;

	constructor(endpoint: string, headers: Record<string, string> = {}) {
		this.endpoint = endpoint;
		this.headers = {
			'Content-Type': 'application/json',
			...headers
		};
	}

	async request<T = unknown>(
		query: string,
		variables?: Record<string, unknown>,
		operationName?: string
	): Promise<T> {
		const body: GraphQLRequest = {
			query,
			variables,
			operationName
		};

		const response = await fetch(this.endpoint, {
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: GraphQLResponse<T> = await response.json();

		if (result.errors) {
			throw new Error(`GraphQL error: ${result.errors.map(e => e.message).join(', ')}`);
		}

		return result.data as T;
	}

	// Helper method for queries
	async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
		return this.request<T>(query, variables);
	}

	// Helper method for mutations
	async mutate<T = unknown>(mutation: string, variables?: Record<string, unknown>): Promise<T> {
		return this.request<T>(mutation, variables);
	}
}

// Client-side GraphQL client - this will make requests through our API routes
// This way the API key stays secure on the server
export const graphqlClient = new GraphQLClient('/api/graphql'); 