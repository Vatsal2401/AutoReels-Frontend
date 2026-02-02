# AI Reels Frontend

Next.js frontend for the AI faceless reels generator platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (Shadcn-style)
- **State Management**: React Context (Auth) + TanStack Query (Server State)
- **HTTP Client**: Axios with interceptors

## Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # React Query & Auth providers
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Auth forms
│   ├── video/            # Video-related components
│   └── layout/           # Layout components (Header, Footer)
├── lib/                  # Utilities and hooks
│   ├── api/              # API client and endpoints
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
└── public/               # Static assets
```

## Features

- ✅ Landing page with hero, features, and pricing
- ✅ Authentication (Sign up / Log in)
- ✅ Dashboard with video list
- ✅ Create video page with topic input
- ✅ Video detail page with real-time progress polling
- ✅ Video player and download functionality
- ✅ Credits indicator (UI ready, backend integration pending)
- ✅ Mobile-responsive design
- ✅ Error handling and loading states

## API Integration

The frontend expects the following backend endpoints:

### Auth

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Videos

- `POST /videos` - Create new video (protected)
- `GET /videos/:id` - Get video details
- `GET /videos` - List user's videos (needs backend implementation)

## Notes

1. **Backend Gaps**: The `GET /videos` endpoint needs to be implemented in the backend to list user's videos.

2. **Credits System**: The credits UI is ready but needs backend integration. Update `lib/hooks/useCredits.ts` when the endpoint is available.

3. **S3 Video URLs**: Video URLs from S3 may need CORS configuration or a proxy endpoint for direct playback.

4. **Token Storage**: Currently using localStorage. For production, consider httpOnly cookies for better security.

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: http://localhost:3000)
