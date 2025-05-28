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

async function makeGraphQLRequest<T = unknown>(
	query: string,
	variables?: Record<string, unknown>
): Promise<T> {
	const response = await fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `users API-Key ${PAYLOAD_API_KEY}`
		},
		body: JSON.stringify({
			query,
			variables
		})
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

export const GET: RequestHandler = async () => {
	try {
		// Test with a simple introspection query to see what's available
		const query = `
			query {
				__schema {
					types {
						name
						kind
					}
				}
			}
		`;

		// Now we can actually test with your real GraphQL endpoint
		const data = await makeGraphQLRequest(query);

		return json({
			success: true,
			data: data,
			message: 'Successfully connected to your GraphQL endpoint!'
		});
	} catch (error) {
		console.error('GraphQL request failed:', error);
		
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				endpoint: GRAPHQL_ENDPOINT
			},
			{ status: 500 }
		);
	}
}; 