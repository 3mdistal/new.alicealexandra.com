# GraphQL Type Generation - Quick Reference

A quick reference for working with the type-safe GraphQL setup in this project.

## 🚀 Quick Start

```bash
# Generate types from PayloadCMS schema
pnpm run codegen

# Start development with auto-regeneration
pnpm run codegen:watch

# Test the setup
pnpm run dev
# Visit: http://localhost:5174/test-graphql
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `codegen.ts` | GraphQL Code Generator configuration |
| `src/lib/graphql/` | **Auto-generated** - All TypeScript types |
| `src/lib/graphql/queries.graphql` | Example GraphQL queries |
| `src/lib/utils/graphql-client.ts` | Main GraphQL client |
| `src/lib/utils/graphql-typed.ts` | PayloadCMS content utilities |

## 💡 Common Tasks

### Adding a New Query

1. Add query to `src/lib/graphql/queries.graphql`:
```graphql
query GetUsers($limit: Int) {
  Users(limit: $limit) {
    docs {
      id
      email
      createdAt
    }
  }
}
```

2. Run codegen: `pnpm run codegen`

3. Use in component:
```typescript
import { graphql } from '$lib/graphql';
import { graphqlClient } from '$lib/utils/graphql-client.js';

const GET_USERS = graphql(`
  query GetUsers($limit: Int) {
    Users(limit: $limit) {
      docs { id email createdAt }
    }
  }
`);

const result = await graphqlClient.request(GET_USERS, { limit: 10 });
```

### Adding New Scalar Types

If PayloadCMS adds new scalar types, update `codegen.ts`:
```typescript
scalars: {
  DateTime: 'string',
  EmailAddress: 'string',
  JSON: 'Record<string, any>',
  YourNewScalar: 'string', // Add here
}
```

### Handling PayloadCMS Rich Content

```typescript
import { formatPayloadContent } from '$lib/utils/graphql-typed.js';

// Extract readable text
const plainText = formatPayloadContent(blog.content);

// Or get the raw JSON
const rawContent = JSON.stringify(blog.content, null, 2);
```

## 🔧 Troubleshooting

### "Unknown scalar type" Error
Add the scalar to `codegen.ts` scalars configuration.

### "Syntax Error: Unexpected '{'" 
Make sure you're using the `print()` function (already implemented in graphql-client.ts).

### Types Not Updating
Run `pnpm run codegen` after schema changes.

### Import Errors
```typescript
// Correct imports
import { graphql } from '$lib/graphql';
import type { Blogs, Blog } from '$lib/graphql/graphql';
import { graphqlClient } from '$lib/utils/graphql-client.js';
```

## 📚 Available PayloadCMS Collections

| Collection | Single Query | List Query | Description |
|------------|--------------|------------|-------------|
| Blog | `Blog(id: String!)` | `Blogs(limit: Int, page: Int)` | Blog posts |
| User | `User(id: String!)` | `Users(limit: Int)` | User accounts |
| Media | `Media(id: String!)` | `allMedia(limit: Int)` | Media files |
| OgInfo | `OgInfo(id: String!)` | `OgInfos` | Open Graph info |

## 🔐 Security Notes

- API keys stay in `.env` file as `PAYLOAD_API_KEY`
- Client requests use `/api/graphql` proxy (keeps keys secure)
- Server-side code can access PayloadCMS directly
- Never import `$env/static/private` in client components

## 📖 Full Documentation

- **Setup Guide**: `docs/GRAPHQL_TYPE_GENERATION.md`
- **Security Model**: `docs/GRAPHQL_SETUP.md`
- **Changes Log**: `docs/CHANGELOG.md`

## 🎯 Development Patterns

### Server-Side Rendering (SSR)
```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // Direct PayloadCMS access with API key
  const result = await fetch('https://payload.alicealexandra.com/api/graphql', {
    headers: { 'users': `API-Key ${PAYLOAD_API_KEY}` },
    // ...
  });
  return { data: result };
};
```

### Client-Side (CSR)
```typescript
// +page.svelte
import { graphqlClient } from '$lib/utils/graphql-client.js';

// Goes through secure proxy
const data = await graphqlClient.request(query, variables);
```

### API Routes
```typescript
// +server.ts
// Custom server-side GraphQL processing
```

---

*Last updated: January 2024*
*For detailed documentation, see the `docs/` directory* 