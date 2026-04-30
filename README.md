# PortraitStudio

A premium, dark-themed AI portrait generation web application. Upload reference images and receive four professionally composed portraits powered by OpenAI's gpt-image-2.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + custom design system
- **Animations:** Framer Motion
- **Image Generation:** OpenAI gpt-image-2
- **Auth:** NextAuth.js with Google OAuth
- **State:** Zustand
- **Database:** Prisma + SQLite (local) / PostgreSQL (production)
- **Payments:** Lemon Squeezy (checkout overlay)
- **File handling:** react-dropzone + native getUserMedia

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd portrait-studio
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` — From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
- `OPENAI_API_KEY` — Your OpenAI API key

### 3. Setup database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable the Google+ API
4. Under "Credentials", create an OAuth 2.0 Client ID
5. Set Authorized redirect URIs to:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to `.env.local`

## Credits System

- New users receive 100 free credits on first login
- Generating 4 portraits costs 4 credits
- Redoing a single portrait costs 1 credit
- Credits are deducted server-side (API route) to prevent manipulation

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/generate` | POST | Generate 4 portraits |
| `/api/credits` | GET | Fetch user credits |
| `/api/upload` | POST | Upload reference image |
| `/api/webhooks/lemonsqueezy` | POST | Lemon Squeezy webhook |

## Deployment

### Deploy to Vercel

The project is ready for Vercel deployment:

```bash
npm i -g vercel
vercel
```

For production:

```bash
vercel --prod
```

### Production Database

Swap SQLite for PostgreSQL (via Vercel Postgres or Supabase):

1. Update `DATABASE_URL` in `.env.local`
2. Update `prisma/schema.prisma` datasource to `postgresql`
3. Run `npx prisma db push`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── credits/route.ts
│   │   ├── generate/route.ts
│   │   ├── upload/route.ts
│   │   └── webhooks/lemonsqueezy/route.ts
│   ├── session/[id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
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
│   └── store.ts
└── types/
    └── index.ts
```
