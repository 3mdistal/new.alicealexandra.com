import type { ServerLoad } from '@sveltejs/kit';
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

export const load: ServerLoad = async () => {
	try {
		// Test with a simple query to get available types
		const query = `
			query {
				__schema {
					queryType {
						name
						fields {
							name
							type {
								name
							}
						}
					}
				}
			}
		`;

		// Now we can actually test with your real GraphQL endpoint
		const graphqlData = await makeGraphQLRequest(query);

		return {
			serverLoadData: {
				message: 'This data was fetched server-side during page load from your actual GraphQL endpoint!',
				timestamp: new Date().toISOString(),
				source: 'PageServerLoad function',
				endpoint: GRAPHQL_ENDPOINT,
				schemaInfo: graphqlData
			}
		};
	} catch (error) {
		console.error('Server-side GraphQL request failed:', error);
		
		return {
			serverLoadData: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}; 