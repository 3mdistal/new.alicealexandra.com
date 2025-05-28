# GraphQL Type Generation with PayloadCMS

This document explains how to use GraphQL Code Generator to create type-safe GraphQL queries for your PayloadCMS backend.

## Overview

We use [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) to automatically generate TypeScript types from your PayloadCMS GraphQL schema. This provides:

- ✅ **Type Safety**: Compile-time checking of GraphQL queries
- ✅ **Autocomplete**: IntelliSense support in your IDE
- ✅ **Error Prevention**: Catch typos and schema mismatches early
- ✅ **Automatic Updates**: Types stay in sync with your schema

## Setup

### 1. Dependencies

The following packages are already installed:

```json
{
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@graphql-codegen/typescript": "^4.0.1",
    "@graphql-codegen/typescript-operations": "^4.0.1",
    "@graphql-codegen/typed-document-node": "^5.0.1"
  },
  "dependencies": {
    "@graphql-typed-document-node/core": "^3.2.0"
  }
}
```

### 2. Configuration

The configuration is in `codegen.ts`:

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    'https://payload.alicealexandra.com/api/graphql': {
      headers: {
        'users': `API-Key ${process.env.PAYLOAD_API_KEY}`
      }
    }
  },
  documents: ['src/**/*.{ts,tsx,svelte}', 'src/**/*.graphql'],
  generates: {
    './src/lib/graphql/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Upload: 'File',
          JSON: 'Record<string, any>',
          EmailAddress: 'string',
          JSONObject: 'Record<string, any>',
          ID: 'string'
        }
      }
    }
  },
  ignoreNoDocuments: true
};

export default config;
```

### 3. Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

## Usage

### 1. Generate Types

Run the code generator:

```bash
pnpm run codegen
```

This creates the following files:
- `src/lib/graphql/graphql.ts` - All TypeScript types
- `src/lib/graphql/gql.ts` - Typed document creation function
- `src/lib/graphql/schema.ts` - Schema types
- `src/lib/graphql/index.ts` - Main exports

### 2. Write GraphQL Queries

Create queries in `.graphql` files or inline:

```typescript
// src/lib/graphql/queries.graphql
query GetBlogs($limit: Int, $page: Int) {
  Blogs(limit: $limit, page: $page) {
    docs {
      id
      title
      content
      createdAt
      updatedAt
    }
    totalDocs
    totalPages
  }
}
```

### 3. Use in Your Code

```typescript
import { graphql } from '$lib/graphql';
import { graphqlClient } from '$lib/utils/graphql-client.js';
import type { Blogs } from '$lib/graphql/graphql';

// Create typed GraphQL document
const GET_BLOGS = graphql(`
  query GetBlogs($limit: Int, $page: Int) {
    Blogs(limit: $limit, page: $page) {
      docs {
        id
        title
        content
        createdAt
        updatedAt
      }
      totalDocs
      totalPages
    }
  }
`);

// Use in your component
async function fetchBlogs() {
  const variables = { limit: 10, page: 1 };
  
  const result = await graphqlClient.request(
    GET_BLOGS,
    variables
  ) as { Blogs: Blogs };
  
  // result.Blogs.docs is fully typed!
  return result.Blogs.docs;
}
```

## PayloadCMS Collections

Based on your schema introspection, the following collections are available:

### Blogs
- `Blog(id: String!)` - Get single blog
- `Blogs(limit: Int, page: Int)` - Get paginated blogs

### Users
- `User(id: String!)` - Get single user
- `Users(limit: Int)` - Get paginated users

### Media
- `Media(id: String!)` - Get single media item
- `allMedia(limit: Int)` - Get paginated media

### OG Info
- `OgInfo(id: String!)` - Get single OG info
- `OgInfos` - Get all OG info

## Example Queries

### Get Blogs with Pagination

```graphql
query GetBlogs($limit: Int, $page: Int) {
  Blogs(limit: $limit, page: $page) {
    docs {
      id
      title
      content
      author
      slug
      createdAt
      updatedAt
    }
    totalDocs
    totalPages
    page
    limit
    hasNextPage
    hasPrevPage
  }
}
```

### Get Single Blog

```graphql
query GetBlog($id: String!) {
  Blog(id: $id) {
    id
    title
    content
    author
    slug
    createdAt
    updatedAt
    ogInfo {
      id
      ogTitle
      ogDescription
    }
  }
}
```

### Get Media Files

```graphql
query GetMedia($limit: Int) {
  allMedia(limit: $limit) {
    docs {
      id
      alt
      filename
      mimeType
      filesize
      url
      width
      height
      createdAt
    }
    totalDocs
  }
}
```

## Development Workflow

1. **Make schema changes** in PayloadCMS
2. **Run codegen** to update types: `pnpm run codegen`
3. **Update queries** if needed
4. **Use typed results** in your components

## Watch Mode

For development, use watch mode to automatically regenerate types:

```bash
pnpm run codegen:watch
```

## Security

- API keys are stored in environment variables
- Client-side requests go through the `/api/graphql` proxy
- Server-side code can access the API directly with the key

## Troubleshooting

### Unknown Scalar Types

If you encounter unknown scalar types, add them to the `scalars` config:

```typescript
scalars: {
  DateTime: 'string',
  EmailAddress: 'string',
  JSON: 'Record<string, any>',
  // Add new scalars here
}
```

### Query Validation Errors

Make sure your queries match the actual PayloadCMS schema. Use GraphiQL or introspection to verify field names.

### Type Import Errors

Ensure you're importing types from the correct generated files:

```typescript
import type { Blogs, Blog } from '$lib/graphql/graphql';
import { graphql } from '$lib/graphql';
```

## Best Practices

1. **Use fragments** for reusable field sets
2. **Keep queries focused** - only request needed fields
3. **Use variables** for dynamic queries
4. **Regenerate types** after schema changes
5. **Use TypeScript strict mode** for better type checking

## Resources

- [GraphQL Code Generator Docs](https://the-guild.dev/graphql/codegen)
- [SvelteKit Guide](https://the-guild.dev/graphql/codegen/docs/guides/svelte)
- [PayloadCMS GraphQL](https://payloadcms.com/docs/graphql/overview) 