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
    },
    './src/lib/graphql/schema.ts': {
      plugins: ['typescript'],
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