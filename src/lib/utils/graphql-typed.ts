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

// Utility function to extract plain text from PayloadCMS rich text content
export function extractTextFromPayloadContent(content: unknown): string {
  if (!content || typeof content !== 'object') {
    return '';
  }

  const contentObj = content as Record<string, unknown>;
  
  // Handle different PayloadCMS rich text formats
  if (Array.isArray(contentObj)) {
    return contentObj.map(extractTextFromPayloadContent).join(' ');
  }

  if (contentObj.type === 'text' && typeof contentObj.text === 'string') {
    return contentObj.text;
  }

  if (contentObj.children && Array.isArray(contentObj.children)) {
    return contentObj.children.map(extractTextFromPayloadContent).join(' ');
  }

  if (typeof contentObj.text === 'string') {
    return contentObj.text;
  }

  return '';
}

// Utility function to format PayloadCMS content for display
export function formatPayloadContent(content: unknown): string {
  const plainText = extractTextFromPayloadContent(content);
  return plainText.trim() || '[Rich content - see JSON below]';
}

// Note: After running codegen, you can import the generated types like:
// import { graphql } from '$lib/graphql';
// import type { GetBlogsQuery, GetBlogsQueryVariables } from '$lib/graphql/graphql'; 