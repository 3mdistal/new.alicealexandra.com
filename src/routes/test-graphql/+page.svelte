<script lang="ts">
	import { onMount } from 'svelte';
	import { graphqlClient } from '$lib/utils/graphql-client';

	// Data from server load function
	export let data: {
		serverLoadData?: unknown;
		error?: string;
	};

	let serverTestResult: unknown = null;
	let clientTestResult: unknown = null;
	let loading = false;
	let error = '';

	// Test server-side GraphQL endpoint
	async function testServerEndpoint() {
		try {
			loading = true;
			error = '';
			
			const response = await fetch('/api/test-graphql');
			const result = await response.json();
			
			serverTestResult = result;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
		} finally {
			loading = false;
		}
	}

	// Test client-side GraphQL request through our secure API proxy
	async function testClientGraphQL() {
		try {
			loading = true;
			error = '';
			
			// Test with a simple introspection query to see available mutations
			const query = `
				query {
					__schema {
						mutationType {
							name
							fields {
								name
								description
							}
						}
					}
				}
			`;

			// This now goes through our secure /api/graphql proxy
			const result = await graphqlClient.query(query);
			clientTestResult = {
				success: true,
				message: 'Successfully connected to your GraphQL endpoint through secure proxy!',
				data: result
			};
		} catch (graphqlError) {
			clientTestResult = {
				error: 'GraphQL request failed',
				details: graphqlError instanceof Error ? graphqlError.message : 'Unknown GraphQL error',
				note: 'Request goes through /api/graphql proxy to keep API key secure'
			};
		} finally {
			loading = false;
		}
	}

	// Test the new GraphQL proxy endpoint
	async function testGraphQLProxy() {
		try {
			loading = true;
			error = '';
			
			const response = await fetch('/api/graphql');
			const result = await response.json();
			
			serverTestResult = {
				...result,
				note: 'This is the new secure GraphQL proxy endpoint'
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
		} finally {
			loading = false;
		}
	}

	// Test server endpoint on component mount
	onMount(() => {
		testServerEndpoint();
	});
</script>

<div class="container">
	<h1>GraphQL Test Page</h1>
	<p>This page demonstrates secure GraphQL integration with SvelteKit using your Payload CMS GraphQL endpoint.</p>

	<div class="test-section">
		<h2>Server Load Data (SSR)</h2>
		<p>Data fetched server-side during page load from <code>https://payload.alicealexandra.com/api/graphql</code>:</p>
		
		{#if data.serverLoadData}
			<div class="result">
				<h3>Server Load Result:</h3>
				<pre>{JSON.stringify(data.serverLoadData, null, 2)}</pre>
			</div>
		{:else if data.error}
			<div class="error">
				<h3>Server Load Error:</h3>
				<p>{data.error}</p>
			</div>
		{:else}
			<p>No server load data available</p>
		{/if}
	</div>

	<div class="test-section">
		<h2>GraphQL Proxy Endpoint</h2>
		<p>Testing the new secure GraphQL proxy at <code>/api/graphql</code>:</p>
		
		<button on:click={testGraphQLProxy} disabled={loading}>
			{loading ? 'Testing...' : 'Test GraphQL Proxy'}
		</button>

		{#if serverTestResult}
			<div class="result">
				<h3>Proxy Test Result:</h3>
				<pre>{JSON.stringify(serverTestResult, null, 2)}</pre>
			</div>
		{/if}
	</div>

	<div class="test-section">
		<h2>Client-side GraphQL Test (Secure)</h2>
		<p>Testing GraphQL fetch from the browser through our secure proxy:</p>
		
		<button on:click={testClientGraphQL} disabled={loading}>
			{loading ? 'Testing...' : 'Test Client GraphQL'}
		</button>

		{#if clientTestResult}
			<div class="result">
				<h3>Client Test Result:</h3>
				<pre>{JSON.stringify(clientTestResult, null, 2)}</pre>
			</div>
		{/if}
	</div>

	{#if error}
		<div class="error">
			<h3>Error:</h3>
			<p>{error}</p>
		</div>
	{/if}

	<div class="instructions">
		<h2>GraphQL Integration Patterns</h2>
		<p>This page demonstrates three different ways to use GraphQL with SvelteKit and your Payload CMS:</p>
		<ol>
			<li><strong>Server Load Function (SSR):</strong> Data fetched during page load on the server</li>
			<li><strong>API Route:</strong> GraphQL requests through SvelteKit API endpoints</li>
			<li><strong>Client-side:</strong> Direct GraphQL requests from the browser</li>
		</ol>
		
		<h3>Setup Status</h3>
		<ol>
			<li>✅ GraphQL endpoint configured: <code>https://payload.alicealexandra.com/api/graphql</code></li>
			<li>✅ API key authentication set up with <code>PAYLOAD_API_KEY</code> environment variable</li>
			<li>✅ All three GraphQL patterns implemented and ready to test</li>
			<li>📝 Ready to replace introspection queries with your actual data queries</li>
		</ol>

		<h3>Your Environment Variables</h3>
		<p>Your <code>.env</code> file should contain:</p>
		<pre><code>PAYLOAD_API_KEY=your-actual-api-key-here</code></pre>
		<p>The GraphQL endpoint is hardcoded as <code>https://payload.alicealexandra.com/api/graphql</code> but you can also move this to an environment variable if needed.</p>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	.test-section {
		margin: 2rem 0;
		padding: 1.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background: #f9f9f9;
	}

	.result {
		margin-top: 1rem;
		padding: 1rem;
		background: #f0f8ff;
		border-radius: 4px;
		border-left: 4px solid #007acc;
	}

	.error {
		margin-top: 1rem;
		padding: 1rem;
		background: #fff0f0;
		border-radius: 4px;
		border-left: 4px solid #cc0000;
	}

	.instructions {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f0f8f0;
		border-radius: 8px;
		border-left: 4px solid #00cc00;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	button:hover:not(:disabled) {
		background: #005a99;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	pre {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.9rem;
	}

	code {
		background: #f0f0f0;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
	}

	h1 {
		color: #333;
		margin-bottom: 1rem;
	}

	h2 {
		color: #555;
		margin-bottom: 0.5rem;
	}

	h3 {
		color: #666;
		margin-bottom: 0.5rem;
	}
</style> 