# 🚀 Like2Win Environment Setup

## Quick Fix for Environment Variable Errors

Si estás viendo errores como:
```
❌ Like2Win: Missing environment variables. Check Vercel settings.
```

### For Local Development

1. **Asegúrate que `.env.local` existe** con estas variables mínimas:
```bash
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Like2Win
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#F59E0B
```

2. **Reinicia el servidor de desarrollo**:
```bash
npm run dev
# or
bun run dev
```

### For Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these required variables**:
```bash
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Like2Win
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#F59E0B
```

3. **Optional but recommended** (for enhanced features):
```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
DATABASE_URL=your_supabase_connection_string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Redeploy** after adding environment variables

### Testing Configuration

Run this to check if environment variables are working:
```bash
npm run build
```

If the build succeeds, your environment is configured correctly!

## Complete Environment Variables Reference

### Core (Required)
- `NEXT_PUBLIC_URL` - Your app's URL
- `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME` - Set to "Like2Win"
- `NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR` - Set to "#F59E0B"

### Enhanced Features (Optional)
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Coinbase OnchainKit API key
- `DATABASE_URL` - Supabase PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REDIS_URL` - Upstash Redis connection
- `NEYNAR_API_KEY` - Farcaster protocol access

### Authentication (Optional)
- `PRIVY_APP_ID` - Privy application ID
- `PRIVY_APP_SECRET` - Privy application secret

## Troubleshooting

### Still seeing errors?
1. Check that all environment variable names are exactly correct
2. Make sure there are no spaces around the `=` sign
3. Restart your development server after adding variables
4. For Vercel, make sure to redeploy after adding variables

### Need API keys?
- **OnchainKit**: Get free API key from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- **Supabase**: Create free project at [supabase.com](https://supabase.com)
- **Neynar**: Get API key at [neynar.com](https://neynar.com)

The app will work with minimal configuration, but enhanced features require the optional API keys.