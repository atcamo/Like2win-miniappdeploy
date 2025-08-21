#!/bin/bash

# Configuración del Webhook de Neynar para Like2Win
# Reemplaza TU_API_KEY_AQUI con tu API key real de Neynar

API_KEY="TU_API_KEY_AQUI"
WEBHOOK_URL="https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar"
LIKE2WIN_FID="1206612"

echo "🔗 Configurando Webhook de Neynar para Like2Win..."
echo "Webhook URL: $WEBHOOK_URL"
echo "FID Oficial: $LIKE2WIN_FID"
echo ""

# Crear webhook para detectar likes en posts de Like2Win
curl -X POST "https://api.neynar.com/v2/farcaster/webhook" \
  -H "accept: application/json" \
  -H "api_key: $API_KEY" \
  -H "content-type: application/json" \
  -d "{
    \"name\": \"Like2Win Engagement Tracker\",
    \"url\": \"$WEBHOOK_URL\",
    \"subscription\": {
      \"cast.created\": {
        \"author_fids\": [$LIKE2WIN_FID]
      },
      \"reaction.created\": {
        \"cast_author_fids\": [$LIKE2WIN_FID]
      }
    }
  }"

echo ""
echo "✅ Webhook configurado!"
echo "🎯 Ahora el sistema detectará automáticamente:"
echo "   - Likes en posts del FID $LIKE2WIN_FID"
echo "   - Nuevos posts del usuario oficial"
echo ""
echo "📋 Para verificar webhooks activos:"
echo "curl -H 'api_key: $API_KEY' https://api.neynar.com/v2/farcaster/webhook"