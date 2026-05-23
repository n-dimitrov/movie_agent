# ADR-0004: Output Format and Delivery

**Date**: 2026-05-22
**Status**: Accepted
**Deciders**: Solo (with Claude architect assist)

---

## Context

The Box Office Tracker Agent (ADR-0002, ADR-0003) produces a newsletter-style digest of current box office standings, trends, and notable performances. A decision is needed on how the digest is stored, displayed, and shared.

The existing app is a stateless Next.js web app on Cloud Run with no persistent storage (ADR-0001, Decision 3). The agent runs as a Next.js API route (ADR-0002). The digest needs to be viewable within the app, accessible via a standalone shareable link (suitable for email), and persisted beyond the request lifecycle.

The project already runs on Google Cloud (Cloud Run), making Google Cloud Storage (GCS) a natural fit for file persistence without introducing a database.

---

## Decision

**Store agent-generated digests as files in Google Cloud Storage, serve them as viewable pages in the app, and provide standalone shareable links.**

Each agent run produces a digest file (HTML or JSON) stored in a GCS bucket. The app has a digest viewer page that loads and renders a specific digest by ID. Each digest also has a standalone public URL (either a signed GCS URL or a direct app route) that can be shared via email or messaging.

This introduces the project's first persistent storage — but as flat files in an object store, not a database. The operational complexity is minimal: a GCS bucket with lifecycle rules to auto-delete old digests.

---

## Consequences

### Positive
- Digests persist beyond the request lifecycle — users can revisit past digests indefinitely
- Shareable links work without authentication — paste into email, Slack, etc.
- GCS is native to the existing Cloud Run deployment — same GCP project, IAM, billing
- No database needed — flat files keep the architecture simple
- Future features (digest history, comparison) have a natural data store

### Negative / Trade-offs
- Introduces persistent state into a previously stateless app (ADR-0001, Decision 3 is now partially superseded)
- Requires GCS client library (`@google-cloud/storage`) as a new dependency
- Need to manage GCS bucket permissions — public read for shareable links, or signed URLs for access control
- Adds a new environment variable (GCS bucket name) to the deployment configuration

### Risks and mitigations
- **Risk**: Public bucket exposes all digests to the internet
  **Mitigation**: Use signed URLs with expiration for shareable links instead of making the bucket public. App route serves digests via the backend, keeping the bucket private.
- **Risk**: Storage costs grow unbounded
  **Mitigation**: Digest files are small (< 100KB each) — even years of daily digests cost pennies. Can add lifecycle rules later if needed.
- **Risk**: GCS unavailability prevents digest viewing
  **Mitigation**: Acceptable for a personal project. GCS has 99.95% SLA. The agent can still generate digests even if old ones can't be loaded.

---

## Options considered

### Option A: GCS Files with App Viewer + Shareable Links (Chosen)
Flat file storage in GCS, rendered by the app and shareable via links. Accepted for simplicity — adds persistence without a database, fits naturally into the existing GCP infrastructure.

### Option B: Render as a New Page in the App Only (No Persistence)
Generate HTML on the fly during the agent request, display it, done. Rejected because digests would be lost after the request — no history, no sharing, no revisiting.

### Option C: Email Delivery via SendGrid/Mailgun
Send the digest directly as an email newsletter. Rejected as the primary delivery method — adds an email service dependency, requires recipient management, and doesn't support in-app viewing. Email sharing is still supported by sending a link to the GCS-hosted digest.

### Option D: Database (Firestore/PostgreSQL)
Store digests in a structured database. Rejected as overkill — digests are self-contained documents, not relational data. A GCS bucket is simpler to operate and sufficient for flat file storage.

---

## Revisit triggers

This decision should be revisited if:
- Digests need to be queried or filtered by structured fields (e.g., "show me all digests where Movie X appeared") — GCS can't do this; would need a database or index
- The number of concurrent users accessing digests causes GCS egress costs to become significant — would need a CDN or caching layer
- Email delivery becomes a primary requirement (not just sharing links) — would need to add an email service and potentially store digests in a format optimized for email rendering
