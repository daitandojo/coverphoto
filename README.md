# CoverPhoto

A premium, dark-themed AI portrait generation web application. Upload reference images and receive four professionally composed portraits — powered by Replicate SDXL with IP-Adapter face conditioning for consistent likeness.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + custom design system ("Dark Atelier")
- **Animations:** Framer Motion
- **Image Generation:** Replicate (SDXL + IP-Adapter)
- **Auth:** NextAuth.js with Google OAuth
- **State:** Zustand
- **Database:** Prisma + PostgreSQL (Neon)
- **Rate Limiting:** Upstash Redis
- **Payments:** Lemon Squeezy (checkout overlay)
- **File handling:** react-dropzone + native getUserMedia

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd coverphoto
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `OPENAI_API_KEY` | OpenAI key (logo/brand assets only) |

### 3. Setup database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:4050](http://localhost:4050).

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable the Google+ API
4. Under "Credentials", create an OAuth 2.0 Client ID
5. Set Authorized redirect URIs to:
   - `http://localhost:4050/api/auth/callback/google` (dev)
   - `https://coverphoto.vercel.app/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to `.env.local`

## Credits System

- New users receive 100 free credits on first login
- Generating 4 portraits costs 4 credits
- Redoing a single portrait costs 1 credit
- Credits are deducted server-side (API route) to prevent manipulation
- Free-tier downloads include a "Made with CoverPhoto" watermark

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/generate` | POST | Generate 4 portraits (rate limited: 10/min) |
| `/api/credits` | GET | Fetch user credits |
| `/api/upload` | POST | Upload reference image |
| `/api/session/[id]` | GET | Fetch session portraits (public) |
| `/api/webhooks/lemonsqueezy` | POST | Lemon Squeezy webhook (HMAC verified) |

## Deployment

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A Vercel API token from [vercel.com/account/tokens](https://vercel.com/account/tokens)
3. The GitHub repo pushed: `github.com/daitandojo/coverphoto`

### Option A: Vercel Web UI (recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `daitandojo/coverphoto`
3. Set all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

### Option B: Vercel CLI

```bash
VERCEL_TOKEN=<your-token> bash scripts/deploy.sh
```

### Post-deployment

1. Add your Vercel production URL to Google Cloud Console authorized redirect URIs
2. Set `LEMONSQUEEZY_WEBHOOK_SECRET` in Vercel env vars
3. Set `LEMONSQUEEZY_STORE_ID` and `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID`
4. Run database migrations: `npx prisma migrate deploy`

## Database

All CoverPhoto tables use the `Portrait` prefix to avoid conflicts in shared databases:

| Table | Purpose |
|-------|---------|
| `PortraitUser` | User accounts with credit balance |
| `PortraitAccount` | OAuth provider accounts |
| `PortraitSession` | Auth sessions |
| `PortraitVerificationToken` | Email verification |
| `PortraitSessionRecord` | Generated portrait sessions |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── credits/route.ts
│   │   ├── generate/route.ts          # Replicate SDXL + IP-Adapter + rate limited
│   │   ├── session/[id]/route.ts      # Public session API
│   │   ├── upload/route.ts
│   │   └── webhooks/lemonsqueezy/route.ts  # HMAC-SHA256 verified
│   ├── session/[id]/
│   │   ├── page.tsx                   # Public session page
│   │   ├── SessionViewer.tsx
│   │   └── opengraph-image.tsx        # Dynamic OG image for shares
│   ├── globals.css                    # Design system
│   ├── layout.tsx
│   └── page.tsx                       # Main app page
├── components/
│   ├── BuyCreditsModal.tsx
│   ├── ConfettiBurst.tsx
│   ├── ContextMenu.tsx
│   ├── GenerateCTA.tsx
│   ├── PortraitCard.tsx
│   ├── PortraitGallery.tsx
│   ├── Providers.tsx
│   ├── ShareCard.tsx
│   ├── StudioHeader.tsx
│   ├── UploadZone.tsx
│   └── WebcamModal.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── rate-limit.ts                  # Upstash rate limiter
│   ├── store.ts                       # Zustand store
│   └── watermark.ts                   # Server-side watermark compositing
└── types/
    └── index.ts
```

## Rate Limiting

The `/api/generate` endpoint is rate-limited to **10 requests per 60 seconds** per user using Upstash Redis. This prevents API budget drain by bad actors.

## Watermark

Free-tier downloads include a "Made with CoverPhoto" watermark applied server-side using Sharp. The watermark is composited into the image data before it reaches the client — not removable via browser inspection.
