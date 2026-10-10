# Lalu Kumar — Applied AI Systems Lab

Next.js App Router portfolio with static engineering case studies, a streaming AI assistant, and an evidence investigation workbench. React 19, TypeScript, Tailwind CSS 4, and Zustand; no new runtime dependencies were introduced for the redesign.

## Run locally

Use a current Node.js version supported by the installed Next.js release. The existing TypeScript tests use Node's native type stripping (validated with Node 25.6.1).

```sh
npm install
cp .env.example .env.local
npm run dev
```

The written portfolio needs no AI credentials. To enable live AI features, set the server-only `BACKEND_API_BASE` and `BACKEND_API_SECRET_KEY` to match the backend service. Never use `NEXT_PUBLIC_` for either. If the backend cannot be reached, the document workbench serves bundled documents and recorded replay with live execution disabled. Refresh the page to reconnect.

## Pages

- `/`: positioning, selected work, capabilities, experience, principles, contact.
- `/projects`: curated engineering work and a concise NeuroSight note.
- `/projects/[slug]`: statically generated case studies with architecture disclosures and decision records. Unknown slugs return 404.
- `/about`: professional background and education.
- `/lab`: the portfolio assistant and links into the workbench.
- `/lab/documents`: source inspection, run comparison, replay, and report export.

## Content and implementation

`src/data/portfolio.ts` is the curated public content model. `src/data/resume.json` is the original owner-provided material; unsupported metrics and credentials are not automatically rendered in the new pages. The existing PDF remains an owner-provided download and requires a separate content review. Backend résumé/vector data is managed separately.

`src/components/portfolio/` contains server-rendered composition, diagrams, project lists, and footer. `Header`, `Chat`, and the existing lab workbench are interactive islands. `src/lib/chat/stream.ts` parses named SSE events; `chatStore.ts` manages request exclusivity, bounded waits, source validation, and interrupted responses.

`src/data/lab/corpus.json` is a bundled snapshot of the backend corpus for offline browsing. When updating documents, copy the prepared corpus and review recorded-run source offsets together. Recorded replay is historical output, never a live measurement.

## Validation

```sh
npm run lint
npm run test:chat
npm run test:lab
npm run build
npm run typecheck
npm run start
```

Run the build and typecheck sequentially: the build regenerates `.next/types`. Next's existing Google font integration needs network access on an uncached build; fonts are served locally after building.

See `../docs/portfolio-research.md`, `../docs/portfolio-redesign-plan.md`, and `../docs/portfolio-validation.md` for the rationale, actual validation results, and known backend limitations. Production hosting needs the existing backend only for live AI requests. No deployment was performed by the redesign.
