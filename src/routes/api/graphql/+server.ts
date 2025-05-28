import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PAYLOAD_API_KEY } from '$env/static/private';

// Your actual GraphQL endpoint
const GRAPHQL_ENDPOINT = 'https://payload.alicealexandra.com/api/graphql';

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

async function makeGraphQLRequest<T = unknown>(
	query: string,
	variables?: Record<string, unknown>,
	operationName?: string
): Promise<GraphQLResponse<T>> {
	const response = await fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `users API-Key ${PAYLOAD_API_KEY}`
		},
		body: JSON.stringify({
			query,
			variables,
			operationName
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

// Handle POST requests (standard GraphQL)
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, variables, operationName }: GraphQLRequest = await request.json();

		if (!query) {
			return json(
				{ errors: [{ message: 'Query is required' }] },
				{ status: 400 }
			);
		}

		const result = await makeGraphQLRequest(query, variables, operationName);
		
		return json(result);
	} catch (error) {
		console.error('GraphQL request failed:', error);
		
		return json(
			{
				errors: [
					{
						message: error instanceof Error ? error.message : 'Unknown error occurred'
					}
				]
			},
			{ status: 500 }
		);
	}
};

// Handle GET requests (for GraphiQL or simple queries)
export const GET: RequestHandler = async ({ url }) => {
	try {
		const query = url.searchParams.get('query');
		const variables = url.searchParams.get('variables');
		const operationName = url.searchParams.get('operationName');

		if (!query) {
			// Return a simple introspection query for testing
			const introspectionQuery = `
				query {
					__schema {
						types {
							name
							kind
						}
					}
				}
			`;

			const result = await makeGraphQLRequest(introspectionQuery);
			return json({
				...result,
				message: 'GraphQL proxy is working! Use POST for actual queries.'
			});
		}

		const parsedVariables = variables ? JSON.parse(variables) : undefined;
		const result = await makeGraphQLRequest(query, parsedVariables, operationName || undefined);
		
		return json(result);
	} catch (error) {
		console.error('GraphQL request failed:', error);
		
		return json(
			{
				errors: [
					{
						message: error instanceof Error ? error.message : 'Unknown error occurred'
					}
				]
			},
			{ status: 500 }
		);
	}
}; 