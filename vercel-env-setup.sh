#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set up all required environment variables for Like2Win deployment

echo "🚀 Setting up Vercel environment variables for Like2Win..."
echo "⚠️  You'll need to provide the actual values when prompted"
echo ""

# Critical variables (app won't work without these)
echo "📋 Setting up CRITICAL variables..."

echo "Setting NEXT_PUBLIC_ONCHAINKIT_API_KEY..."
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production preview development

echo "Setting NEXT_PUBLIC_URL (use your Vercel domain)..."
vercel env add NEXT_PUBLIC_URL production preview development

echo "Setting Redis configuration..."
vercel env add REDIS_URL production preview development
vercel env add REDIS_TOKEN production preview development

echo "Setting smart contract address..."
vercel env add NEXT_PUBLIC_PROOF_OF_VERANO_ADDRESS production preview development

echo ""
echo "📱 Setting up APP BRANDING variables..."

vercel env add NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME production preview development
vercel env add NEXT_PUBLIC_ICON_URL production preview development
vercel env add NEXT_PUBLIC_APP_ICON production preview development
vercel env add NEXT_PUBLIC_APP_SUBTITLE production preview development
vercel env add NEXT_PUBLIC_APP_DESCRIPTION production preview development
vercel env add NEXT_PUBLIC_APP_SPLASH_IMAGE production preview development
vercel env add NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR production preview development
vercel env add NEXT_PUBLIC_APP_PRIMARY_CATEGORY production preview development
vercel env add NEXT_PUBLIC_APP_HERO_IMAGE production preview development
vercel env add NEXT_PUBLIC_APP_TAGLINE production preview development
vercel env add NEXT_PUBLIC_APP_OG_TITLE production preview development
vercel env add NEXT_PUBLIC_APP_OG_DESCRIPTION production preview development
vercel env add NEXT_PUBLIC_APP_OG_IMAGE production preview development

echo ""
echo "🎭 Setting up FARCASTER variables..."

vercel env add FARCASTER_HEADER production preview development
vercel env add FARCASTER_PAYLOAD production preview development
vercel env add FARCASTER_SIGNATURE production preview development
vercel env add NEYNAR_API_KEY production preview development
vercel env add FARCASTER_HUB_URL production preview development

echo ""
echo "🔮 Setting up FUTURE FEATURE variables (optional)..."

vercel env add PRIVY_APP_ID production preview development
vercel env add PRIVY_APP_SECRET production preview development
vercel env add CLANKER_API_KEY production preview development
vercel env add CLANKER_API_URL production preview development

echo ""
echo "✅ Environment variable setup complete!"
echo "🌐 You can now deploy your project with: vercel --prod"
echo "📊 Check all variables with: vercel env ls"