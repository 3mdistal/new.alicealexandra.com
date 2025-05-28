import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

export interface GraphQLClientOptions {
	endpoint: string;
	headers?: Record<string, string>;
}

export interface GraphQLResponse<T = unknown> {
	data?: T;
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: Array<string | number>;
	}>;
}

export class GraphQLClient {
	private endpoint: string;
	private headers: Record<string, string>;

	constructor(options: GraphQLClientOptions) {
		this.endpoint = options.endpoint;
		this.headers = options.headers || {};
	}

	async request<TResult, TVariables = Record<string, unknown>>(
		document: string | TypedDocumentNode<TResult, TVariables>,
		variables?: TVariables,
		requestHeaders?: Record<string, string>
	): Promise<TResult> {
		const query = typeof document === 'string' ? document : document.toString();
		
		const response = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...this.headers,
				...requestHeaders
			},
			body: JSON.stringify({
				query,
				variables: variables || {}
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
		}

		const result: GraphQLResponse<TResult> = await response.json();

		if (result.errors) {
			throw new Error(
				`GraphQL Error: ${result.errors.map(error => error.message).join(', ')}`
			);
		}

		if (!result.data) {
			throw new Error('No data returned from GraphQL query');
		}

		return result.data;
	}

	// Legacy method for non-typed queries
	async requestLegacy<T = unknown>(
		query: string,
		variables?: Record<string, unknown>,
		requestHeaders?: Record<string, string>
	): Promise<T> {
		return this.request<T>(query, variables, requestHeaders);
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
export const graphqlClient = new GraphQLClient({ endpoint: '/api/graphql' }); 