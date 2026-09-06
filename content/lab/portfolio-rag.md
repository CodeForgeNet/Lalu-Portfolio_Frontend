# How the portfolio answers a question

## Implementation observed in this repository

The existing portfolio chat calls POST /api/ask-stream on an Express backend. The backend creates a 768-dimensional Gemini embedding for the visitor's question, checks a Redis semantic answer cache, and queries Pinecone when the cache misses. These are the implemented stages in Lalu-Portfolio_Backend/src/routes/ask.ts.

## Retrieval and answer context

The Pinecone query asks for the top matching vectors and their metadata. The ingestion script creates separate records for projects, experience, personal details, and other résumé sections. This is section-based ingestion, not a general PDF parser. Each retrieved record contributes its metadata content to the generation prompt.

The existing chat also appends the full résumé JSON as fallback context. Consequently, its answer may use résumé facts beyond the displayed retrieval results. The document workbench uses a separate pipeline: only passages from the visitor's selected documents enter its prompt. Excluding a document removes it from retrieval and generation context.

## Streaming and provider behavior

The existing Express route emits step_start and step_complete events around embedding, vector search, and generation. Generated text is sent as chunk events. A done event includes sources and suggested follow-up questions. If Gemini generation fails, the route tries OpenRouter. The current route labels the generation stage as Gemini even when that fallback executes.

## What this implementation does not establish

The source code describes behavior, not a measured production benchmark. It does not establish retrieval precision, production latency percentiles, or availability guarantees. The workbench reports timings from each actual run. Its source links validate where excerpts came from; they do not automatically prove every generated claim is correct.

## Source references

See Lalu-Portfolio_Backend/src/routes/ask.ts for request handling, Lalu-Portfolio_Backend/scripts/import_embeddings.ts for ingestion, and Lalu-Portfolio_Frontend/src/utils/avatarStore.ts for the existing streaming client. These paths refer to the repository snapshot used to prepare this collection.
