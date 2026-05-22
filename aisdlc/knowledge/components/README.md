# Component Registry

| Component | Description | Doc |
|---|---|---|
| TMDb Client | Server-side TMDb API client with typed Movie interface | [tmdb-client.md](./tmdb-client.md) |
| Movie Discovery UI | Single-page client-side UI with poster grid and discovery controls | [movie-ui.md](./movie-ui.md) |
| Movies API Route | Server-side proxy endpoint that hides TMDb API key from browser | [api-route.md](./api-route.md) |
| Box Office Agent | Claude agent with TMDb tools that generates box office digest reports | [boxoffice-agent.md](./boxoffice-agent.md) |
| Box Office API Routes | POST to generate digest, GET to list/fetch digests from GCS | [boxoffice-api.md](./boxoffice-api.md) |
| GCS Storage Layer | Upload/download digest files to Google Cloud Storage with signed URLs | [gcs-storage.md](./gcs-storage.md) |
| Box Office UI | Page with generate button, digest viewer (HTML renderer), and history list | [boxoffice-ui.md](./boxoffice-ui.md) |

---

_Add a row per major component. Create `aisdlc/knowledge/components/[name].md` for each._
