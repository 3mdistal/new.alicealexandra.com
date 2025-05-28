# Secure GraphQL Integration with SvelteKit

This document explains how GraphQL is securely integrated into this SvelteKit application using native `fetch` API and following SvelteKit security best practices for environment variables.

## Overview

The GraphQL integration follows SvelteKit security best practices and provides three different patterns for making GraphQL requests:

1. **Server Load Functions (SSR)** - Direct GraphQL access with private API key on server
2. **GraphQL Proxy API Route** - Secure proxy endpoint at `/api/graphql`
3. **Client-side** - Requests through proxy to keep API key secure

## Security Model

### ✅ Secure Approach (What We Implemented)
- Private API keys only used in server-side code (`$env/static/private`)
- Client-side requests go through secure proxy endpoint
- API key never exposed to browser/client code
- Follows SvelteKit environment variable best practices

### ❌ Insecure Approach (What We Avoided)
- Importing `$env/static/private` in client-side code
- Exposing API keys in client bundles
- Direct client-to-GraphQL requests with credentials

## Files Created

### Core GraphQL Client
- `src/lib/utils/graphql-client.ts` - Client-side GraphQL client (uses proxy)

### Secure Server Implementation
- `src/routes/api/graphql/+server.ts` - Secure GraphQL proxy endpoint
- `src/routes/test-graphql/+page.server.ts` - Server load function example
- `src/routes/api/test-graphql/+server.ts` - Additional API route example

### Test Implementation
- `src/routes/test-graphql/+page.svelte` - Test page demonstrating all patterns

## Usage Patterns

### 1. Server Load Function (SSR) - Direct Access

```typescript
// src/routes/your-page/+page.server.ts
import type { ServerLoad } from '@sveltejs/kit';
import { PAYLOAD_API_KEY } from '$env/static/private';

export const load: ServerLoad = async () => {
  const response = await fetch('https://payload.alicealexandra.com/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${PAYLOAD_API_KEY}`
    },
    body: JSON.stringify({
      query: `
        query {
          users {
            id
            name
            email
          }
        }
      `
    })
  });
  
  const result = await response.json();
  return { users: result.data };
};
```

### 2. Client-side - Through Secure Proxy

```typescript
// In any Svelte component
import { graphqlClient } from '$lib/utils/graphql-client';

const query = `
  query {
    users {
      id
      name
      email
    }
  }
`;

// This goes through /api/graphql proxy, keeping API key secure
const data = await graphqlClient.query(query);
```

### 3. Direct API Route Usage

```typescript
// In any component or server code
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `query { users { id name } }`,
    variables: { limit: 10 }
  })
});

const result = await response.json();
```

## Configuration

### Environment Variables

Your `.env` file should contain:

```bash
PAYLOAD_API_KEY=your-actual-api-key-here
```

**Important Security Notes:**
- Only use `PAYLOAD_API_KEY` in server-side code
- Never import `$env/static/private` in client-side components
- The GraphQL endpoint URL is hardcoded as it's not sensitive

### Customizing the GraphQL Endpoint

If you need to change the GraphQL endpoint, edit:

```typescript
// src/routes/api/graphql/+server.ts
const GRAPHQL_ENDPOINT = 'https://your-new-endpoint.com/graphql';
```

Or make it configurable with an environment variable:

```typescript
// .env
GRAPHQL_ENDPOINT=https://your-endpoint.com/graphql

// src/routes/api/graphql/+server.ts
import { GRAPHQL_ENDPOINT } from '$env/static/private';
```

## Testing the Setup

1. Start your SvelteKit development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/test-graphql` to see the test page

3. The page will demonstrate:
   - Server-side data loading with direct GraphQL access
   - Secure GraphQL proxy endpoint testing
   - Client-side GraphQL requests through proxy

## Benefits of This Secure Approach

- **🔒 Secure**: API keys never exposed to client-side code
- **🚀 Fast**: Direct server-side access when possible
- **🛡️ Protected**: Follows SvelteKit security best practices
- **📦 Lightweight**: No heavy GraphQL client dependencies
- **🔧 Flexible**: Works for all use cases while maintaining security
- **✅ Compliant**: Passes SvelteKit environment variable validation

## When to Use Each Pattern

### Server Load Functions (Direct Access)
- ✅ Initial page data that should be server-rendered
- ✅ SEO-critical content
- ✅ Data that doesn't change frequently
- ✅ When you need maximum performance

### GraphQL Proxy Endpoint
- ✅ Client-side interactive features
- ✅ Real-time updates
- ✅ User-specific data that changes frequently
- ✅ When you need to keep API keys secure

### Direct API Route Usage
- ✅ Custom server-side processing
- ✅ Webhooks and external integrations
- ✅ Complex authentication flows

## Advanced Usage

### Error Handling

```typescript
try {
  const data = await graphqlClient.query(query);
} catch (error) {
  if (error.message.includes('GraphQL error')) {
    // Handle GraphQL-specific errors
  } else {
    // Handle network/proxy errors
  }
}
```

### Variables and Mutations

```typescript
// Query with variables through proxy
const data = await graphqlClient.query(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`, { id: '123' });

// Mutations through proxy
const result = await graphqlClient.mutate(`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`, { input: { name: 'John', email: 'john@example.com' } });
```

### Custom Headers

```typescript
// Add custom headers to the proxy request
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({ query, variables })
});
```

## Security Considerations

### What's Protected
- ✅ API keys never reach the browser
- ✅ Private environment variables only in server modules
- ✅ GraphQL endpoint credentials secured
- ✅ SvelteKit validates environment variable usage

### Best Practices Followed
- ✅ Use `$env/static/private` only in `.server.ts` files
- ✅ Proxy sensitive requests through API routes
- ✅ Never expose credentials in client bundles
- ✅ Validate all inputs in proxy endpoints

## Troubleshooting

### Common Errors

**Error: "Cannot import $env/static/private into client-side code"**
- ✅ **Solution**: This setup avoids this error by using the proxy pattern

**Error: "GraphQL request failed"**
- Check your `PAYLOAD_API_KEY` environment variable
- Verify the GraphQL endpoint is accessible
- Check server logs for detailed error messages

**Error: "Query is required"**
- Ensure you're sending a valid GraphQL query in the request body

## Next Steps

1. ✅ Environment variables properly configured
2. ✅ Secure GraphQL proxy implemented
3. ✅ Client-side GraphQL client configured
4. 📝 Replace introspection queries with your actual Payload CMS queries
5. 🎨 Add loading states and error handling to your UI
6. 🚀 Deploy with confidence knowing your API keys are secure

## Resources

- [SvelteKit Environment Variables Documentation](https://svelte.dev/docs/kit/$env-static-private)
- [SvelteKit Security Best Practices](https://svelte.dev/docs/kit/server-only-modules)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Payload CMS GraphQL Documentation](https://payloadcms.com/docs/graphql/overview) 