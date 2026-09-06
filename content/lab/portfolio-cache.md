# How the portfolio semantic cache works

## Implemented lookup

The existing backend embeds the question before looking in Redis. The getCachedResponse function in Lalu-Portfolio_Backend/src/services/cache.ts reads keys matching cache:question:*, loads the cached question embeddings, and computes cosine similarity against each. The highest-scoring answer is reused when its score meets CACHE_SIMILARITY_THRESHOLD, which defaults to 0.92.

## What a cache hit saves

A cache hit returns the stored answer, sources, and suggestions. It skips the new Pinecone retrieval and answer generation, but it does not skip question embedding. A retrieval similarity score is not the probability that an answer is correct. Similar questions can require different answers when their constraints differ.

## Storage and failure behavior

Cached entries contain the original question, answer, embedding, sources, suggestions, and a timestamp. The key is an MD5 hash of the lowercased and trimmed question. CACHE_TTL defaults to zero, meaning no expiration. A missing Redis connection or cache lookup error falls through to normal retrieval. The implementation limits the key lookup wait, but it does not place an overall deadline around every sequential GET.

## Tradeoffs and proposed improvements

Scanning all cached keys makes lookup work grow with cache size. A future implementation could use indexed similarity search and explicit corpus versioning. These are proposed improvements, not claims about the current implementation. Existing cache keys do not include a selected document set or retrieval count.

The workbench intentionally performs fresh retrieval and generation on every investigation. Reusing this semantic cache could return an answer based on an excluded document and make an evidence comparison misleading. Replay reuses a captured event stream locally and is explicitly labeled; it is not a new live request.

## Source references

See Lalu-Portfolio_Backend/src/services/cache.ts for key lookup, cosine similarity, thresholds, and persistence; see Lalu-Portfolio_Backend/src/routes/ask.ts for the cache branch in the RAG pipeline. No measured cost reduction is asserted by this document.
