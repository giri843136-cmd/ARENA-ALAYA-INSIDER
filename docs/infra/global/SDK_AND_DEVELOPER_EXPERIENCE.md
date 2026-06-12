# SDK & Developer Experience

## Internal TypeScript SDK
Located in sdk/typescript/

- Type-safe clients for all major platform APIs.
- Handles auth, retries, regional routing, and graceful degradation.
- Published internally (or as private npm package).

## Usage
```ts
import { alaya } from '@alaya/insider-sdk';

const status = await alaya.getGlobalStatus();
const recs = await alaya.getRecommendations('p123', currentUserId);
```

## Versioning
- Semantic versioning.
- Breaking changes require major version + migration guide.
- Changelogs generated from conventional commits.

## Documentation
Auto-generated from TypeScript + JSDoc + additional guides in this folder.
