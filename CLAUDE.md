# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Like2Win** is a Next.js-based Farcaster MiniKit app that gamifies social engagement through bi-weekly $DEGEN raffles. Users simply follow @Like2Win and like official posts to earn raffle tickets - zero friction, maximum fun!

## Current Development Status

**Current Branch**: main (production-ready)
- **Last Update**: Complete migration from kiwik to Like2Win identity
- **Recent Changes**: 
  - Replaced main landing page with Like2Win social gamification focus
  - Updated FrameAwareLanding to showcase Like2Win features only
  - Applied amber/gold theme consistently across all components  
  - Removed all kiwik and Proof of Verano references
  - Maintained Like2Win MiniApp at `/miniapp` route

**Migration Status**: COMPLETED - Full Like2Win brand identity implementation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Farcaster**: MiniKit integration for Frame SDK
- **Social**: Neynar SDK for Farcaster protocol access
- **UI**: Tailwind CSS with Like2Win amber/gold theme, custom Like2WinComponents
- **Database**: Supabase PostgreSQL + Upstash Redis for caching
- **Rewards**: $DEGEN token integration for raffle prizes
- **Language**: TypeScript with strict mode
- **Package Manager**: Bun (npm/yarn compatible)

## Development Commands

```bash
# Development
bun run dev          # Start dev server on http://localhost:3000
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# TypeScript
# Note: No explicit type-check script in package.json
# TypeScript checking happens during build
```

## Architecture & Code Structure

### Directory Layout
```
/app                 # Next.js App Router
  /api              # API routes (raffle system, webhooks)
    /raffle         # Raffle participation and status endpoints
  /components       # React components
    Like2WinComponents.tsx  # Core Like2Win UI components
    FrameAwareLanding.tsx   # Landing page with Frame detection
  /miniapp          # Like2Win MiniApp (main functionality)
  layout.tsx        # Root layout with Like2Win metadata
  page.tsx          # Main landing page (Like2Win focused)
  providers.tsx     # MiniKitProvider wrapper
  theme.css         # Like2Win amber/gold theme variables
/lib                # Utilities (Redis, raffle logic)
  /hooks            # Custom React hooks (raffle status, participation)
/prisma             # Database schema (users, raffles, engagement)
/public/docs        # Like2Win documentation and guides
/scripts            # Initialization and maintenance scripts
```

### Documentation Structure (/public/docs)

The `/public/docs` directory contains Like2Win documentation and guides:

```
/public/docs/
  project-documentation.md       # Like2Win PRD and technical specifications
  like2win-getting-started.md   # User guide for participation
  MIGRATION_GUIDE.md            # Technical migration documentation
  
  /development-setup/           # Development environment setup
  /vercel/                      # Deployment configuration
  /todos/                       # Development task tracking
    feat-*.md                   # Active feature development
    /done/                      # Completed tasks archive
```

**Important**: Always check `/public/docs/project-documentation.md` for the complete Like2Win product requirements and technical specifications.

### Key Architectural Patterns

1. **MiniKit Provider Pattern**: The app is wrapped with `MiniKitProvider` in `providers.tsx` which handles:
   - Farcaster Frame SDK integration
   - User context and authentication state
   - Social graph access through Neynar

2. **Component Organization**: 
   - `Like2WinComponents.tsx`: Core UI components (buttons, cards, logos, animations)
   - `FrameAwareLanding.tsx`: Smart landing page that adapts to Frame vs web context
   - Specialized components for raffle status, participation, leaderboards

3. **Styling Approach**: 
   - Tailwind CSS with Like2Win amber/gold theme
   - CSS variables for consistent theming (--app-accent: amber, --app-background, etc.)
   - Signature animations for falling coins and sparkle effects
   - Mobile-first responsive design optimized for Farcaster

4. **Database Architecture**: 
   - Supabase PostgreSQL for persistent data (users, raffles, engagement)
   - Redis for caching and real-time features
   - Prisma ORM for type-safe database access

### Important Implementation Details

1. **Like2Win Components**: Complete custom component library with Like2Win branding and animations.

2. **Raffle System**: Core functionality built around:
   - Follow detection (@Like2Win)
   - Engagement tracking (likes on official posts)
   - Ticket allocation algorithm
   - Bi-weekly raffle execution

3. **Frame Integration**: The app works as both a standalone web app and Farcaster Frame with specific metadata in layout.tsx.

4. **State Management**: Custom React hooks for raffle status, participation, and leaderboard data.

5. **API Routes**: 
   - `/api/raffle/status` - Get user raffle status and tickets
   - `/api/raffle/participate` - Handle raffle participation
   - `/api/raffle/leaderboard` - Fetch current leaderboard

## Environment Variables Required

Critical environment variables that must be set:
- `NEXT_PUBLIC_URL` - Production URL for the app 
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase client config
- `REDIS_URL` & `REDIS_TOKEN` - Upstash Redis credentials for caching
- `NEYNAR_API_KEY` - Farcaster protocol access via Neynar
- `PRIVY_APP_ID` & `PRIVY_APP_SECRET` - Authentication integration

## Common Development Tasks

### Adding New Like2Win Components
- Add to `Like2WinComponents.tsx` following existing patterns
- Use amber/gold theme variables consistently
- Include signature animations where appropriate
- Follow mobile-first responsive design

### Working with Raffle System
- Use custom hooks: `useRaffleStatus`, `useRaffleParticipation`, `useLeaderboard`
- All raffle logic centralizes through `/api/raffle/` endpoints
- Follow detection happens via Neynar SDK integration
- Engagement tracking requires Farcaster webhook setup

### Like2Win MiniApp Features
The main Like2Win functionality is at `/miniapp`:
- **Raffle Status**: Shows current user tickets and raffle countdown
- **Participation Button**: Handles follow @Like2Win and engagement
- **Leaderboard**: Displays top participants by tickets
- **Falling Animations**: Visual feedback for user actions
- **Responsive Design**: Optimized for mobile Farcaster clients

### Testing Considerations
No test framework is currently set up. Consider adding Vitest or Jest for unit tests, especially for raffle logic and engagement tracking.

### Deployment
The app is configured for Vercel deployment with proper environment variable management. Ensure all Supabase, Redis, and Neynar credentials are set in the deployment environment.

## Theme & Design System

### Like2Win Visual Identity
The project uses a consistent amber/gold theme reflecting the Like2Win brand:
- **Primary Colors**: Amber (#F59E0B), Gold (#EAB308), Orange accent (#F97316)
- **Background**: Gradient from light amber to golden yellow
- **Typography**: Geist font family for clean, modern appearance
- **Animations**: Signature falling coins and sparkle effects

### CSS Variables (app/theme.css)
```css
--app-accent: #F59E0B (Like2Win amber)
--app-background: amber/gold gradient
--app-foreground: clean text colors
--app-card-bg: subtle amber backgrounds
--app-success, --app-error: status colors
```

### Mobile Design
- Touch-friendly interface optimized for Farcaster clients
- 44x44px minimum touch targets for accessibility
- Responsive design that works seamlessly in Frame and standalone contexts

## Development Priorities

Current focus areas for Like2Win development:
1. **Raffle System Optimization** - Improve ticket calculation and distribution
2. **Real-time Updates** - Enhanced WebSocket integration for live raffle status
3. **Analytics Dashboard** - Track engagement patterns and optimize rewards
4. **Community Features** - Social sharing and referral systems

See `/public/docs/project-documentation.md` for complete feature specifications.