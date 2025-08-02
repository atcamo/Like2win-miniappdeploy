# Vercel Environment Variables Reference

## Quick Setup Commands

### Option 1: Run the setup script
```bash
./vercel-env-setup.sh
```

### Option 2: Add variables individually

#### 🚨 CRITICAL Variables (Must Set First)
```bash
# OnchainKit API (get from https://portal.cdp.coinbase.com/)
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production preview development
# Enter your Coinbase Developer Platform API key

# Production URL (use your Vercel domain)
vercel env add NEXT_PUBLIC_URL production preview development  
# Enter: https://your-project-name.vercel.app

# Redis for notifications (get from https://console.upstash.com/)
vercel env add REDIS_URL production preview development
# Enter your Upstash Redis URL

vercel env add REDIS_TOKEN production preview development
# Enter your Upstash Redis token

# Smart contract address (already deployed)
vercel env add NEXT_PUBLIC_PROOF_OF_VERANO_ADDRESS production preview development
# Enter: 0xc50dc3d7a967393a4ebf7944b0c6c819d10aa250
```

#### 📱 App Branding Variables
```bash
vercel env add NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME production preview development
# Enter: Like2Win

vercel env add NEXT_PUBLIC_APP_SUBTITLE production preview development
# Enter: "Cultivando ideas y generando impacto"

vercel env add NEXT_PUBLIC_APP_DESCRIPTION production preview development
# Enter: "talento colectivo que cultiva ideas y genera impacto"

vercel env add NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR production preview development
# Enter: #10B981

vercel env add NEXT_PUBLIC_APP_PRIMARY_CATEGORY production preview development
# Enter: social

vercel env add NEXT_PUBLIC_APP_TAGLINE production preview development
# Enter: "descubre el jardín infinito de la regeneración"
```

#### 🎭 Farcaster Variables
```bash
# Get these from Farcaster developer tools
vercel env add NEYNAR_API_KEY production preview development
# Enter your Neynar API key

vercel env add FARCASTER_HUB_URL production preview development
# Enter: https://hub.farcaster.xyz:2281
```

## Verify Setup
```bash
# List all environment variables
vercel env ls

# Pull environment variables to local file (optional)
vercel env pull .env.local

# Deploy with environment variables
vercel --prod
```

## Environment-Specific Values

### Production
- `NEXT_PUBLIC_URL`: Your custom domain or Vercel domain
- All API keys should be production-ready

### Preview (Staging)
- `NEXT_PUBLIC_URL`: Preview branch domain
- Can use same API keys as production for testing

### Development
- `NEXT_PUBLIC_URL`: http://localhost:3000
- Can use development/testing API keys

## Variable Categories

### Public Variables (NEXT_PUBLIC_*)
- ✅ Exposed to client-side code
- ✅ Safe to use in React components
- ⚠️ Visible in browser - don't put secrets here

### Private Variables
- 🔒 Server-side only
- 🔒 Used in API routes and server functions
- 🔒 Keep secrets and sensitive data here

## Required for Features

### Core App Functionality
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_PROOF_OF_VERANO_ADDRESS`

### Notifications & Webhooks  
- `REDIS_URL`
- `REDIS_TOKEN`

### Farcaster Mini App
- `NEYNAR_API_KEY`
- `FARCASTER_*` variables

### Future Challenge System
- `CLANKER_API_KEY` (for token launches)
- `PRIVY_*` (for enhanced auth)

## Troubleshooting

### Common Issues
1. **App won't load**: Check `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
2. **Notifications fail**: Verify Redis credentials
3. **Farcaster features broken**: Check Neynar API key
4. **Images not loading**: Verify all `*_IMAGE` and `*_URL` variables

### Debug Commands
```bash
# Check what variables are set
vercel env ls

# Remove a variable if needed
vercel env rm VARIABLE_NAME

# Update a variable
vercel env add VARIABLE_NAME production preview development
```