## GraphQL Integration

This project includes a complete type-safe GraphQL integration with PayloadCMS:

- **🔒 Secure**: API keys protected with SvelteKit environment variables
- **🎯 Type-Safe**: Auto-generated TypeScript types from GraphQL schema
- **⚡ Fast**: Multiple integration patterns (SSR, CSR, API routes)

### Quick Start
```bash
# Generate GraphQL types
pnpm run codegen

# Test the integration
pnpm run dev
# Visit: http://localhost:5174/test-graphql
```

### Documentation
- **[📚 Full Documentation](docs/README.md)** - Complete documentation index
- **GraphQL**:
  - **[Quick Reference](docs/graphql/quick-reference.md)** - Common tasks and examples
  - **[Type Generation](docs/graphql/type-generation.md)** - Type-safe development setup
  - **[Security Setup](docs/graphql/setup.md)** - Secure integration guide
- **Component System**:
  - **[Architecture Overview](docs/components/architecture-overview.md)** - System design and concepts
  - **[Implementation Guide](docs/components/implementation-guide.md)** - Step-by-step development
- **[Changelog](docs/changelog.md)** - Project history and updates

