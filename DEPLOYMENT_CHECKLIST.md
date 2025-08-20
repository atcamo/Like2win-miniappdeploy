# 🚀 Like2Win Deployment Checklist

## ✅ Pasos Completados

- [x] **Git**: Cambios committeados y subidos
- [x] **Variables de entorno**: Configuración base lista
- [x] **TypeScript**: Sin errores de compilación
- [x] **Linting**: Código limpio
- [x] **Vercel Config**: vercel.json configurado

## 🔧 Deploy a Vercel - Pasos Siguientes

### 1. Crear Proyecto en Vercel
```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Deploy desde la terminal
vercel --prod
```

### 2. Configurar Variables de Entorno en Vercel Dashboard

#### Variables Críticas (REQUERIDAS):
```
DATABASE_URL = postgresql://postgres:AtcamoSupabase@db.zginxalrgugktrohlawi.supabase.co:5432/postgres
NEYNAR_API_KEY = A5C2E9ED-5EC7-49AB-B862-6F9C79931F81
LIKE2WIN_FID = 1206612
NEXT_PUBLIC_URL = https://tu-dominio.vercel.app
```

#### Variables Opcionales (para funcionalidad completa):
```
# Redis (Upstash) - para caching
REDIS_URL = rediss://your-redis.upstash.io:6380
REDIS_TOKEN = your_redis_token

# OnchainKit (Coinbase) - para features avanzadas
NEXT_PUBLIC_ONCHAINKIT_API_KEY = your_coinbase_key

# Supabase adicional
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
```

### 3. Verificación Post-Deploy

#### URLs a Testear:
- `https://tu-app.vercel.app/` - Landing page
- `https://tu-app.vercel.app/miniapp` - Like2Win MiniApp
- `https://tu-app.vercel.app/api/raffle/status` - API status

#### Funcionalidades a Verificar:
- [ ] **Frame Detection**: Página se adapta al contexto
- [ ] **Database Connection**: APIs responden correctamente
- [ ] **Farcaster Integration**: MiniKit funciona
- [ ] **Raffle System**: Estado y participación funcionan

## 🎯 Próximos Pasos (Después del Deploy)

### Semana 1: Testing & Optimización
1. **Day 1**: Deploy y verificación básica
2. **Day 2-3**: Test completo del sistema de sorteos
3. **Day 4-5**: Optimización de performance
4. **Day 6-7**: Setup de monitoring

### Features Pendientes:
- [ ] **Redis Setup**: Para caching y performance
- [ ] **Tests Automatizados**: Jest/Vitest
- [ ] **Analytics**: Tracking de usuarios
- [ ] **Admin Dashboard**: Gestión de sorteos
- [ ] **Notificaciones**: Para ganadores

## 🚨 Troubleshooting

### Build Issues:
- Si el build falla: verificar dependencias con `bun install`
- Si hay errores de TypeScript: revisar con `bun run type-check`

### Deploy Issues:
- Verificar todas las variables de entorno en Vercel Dashboard
- Revisar logs en Vercel para errores específicos
- Asegurar que DATABASE_URL es accesible desde Vercel

### Runtime Issues:
- Verificar conexión a Supabase desde el dashboard
- Validar que Neynar API key está activa
- Revisar logs de las funciones serverless

## 📞 Soporte

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Neynar**: https://docs.neynar.com
- **MiniKit**: https://docs.farcaster.xyz