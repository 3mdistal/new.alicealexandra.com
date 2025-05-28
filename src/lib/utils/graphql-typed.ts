// This file will contain utilities for working with generated GraphQL types
// It will be populated after running the codegen command

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { GraphQLClient } from './graphql-client.js';

// Re-export the client for convenience
export { graphqlClient } from './graphql-client.js';

// Utility function to create a typed GraphQL client
export function createTypedClient(client: GraphQLClient) {
  return {
    // Add typed request methods here after code generation
    async query<TResult, TVariables = Record<string, unknown>>(
      document: TypedDocumentNode<TResult, TVariables> | string,
      variables?: TVariables
    ): Promise<TResult> {
      return client.request<TResult, TVariables>(document, variables);
    }
  };
}

// Note: After running codegen, you can import the generated types like:
// import { graphql } from '$lib/graphql';
// import type { GetPostsQuery, GetPostsQueryVariables } from '$lib/graphql/graphql'; 