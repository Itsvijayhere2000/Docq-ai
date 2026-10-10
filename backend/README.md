# DocQ AI Backend

NestJS backend foundation for authentication, workspace isolation, document metadata, local storage, and asynchronous processing.

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Install dependencies inside `backend`:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the API:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000/api`.

Current modules:

- Authentication with access JWT and refresh cookie
- Users and refresh sessions
- Workspaces and membership authorization
- PDF upload metadata and local storage
- Processing queue abstraction

PDF extraction, embeddings, pgvector retrieval, and LLM responses are the next backend milestone.
