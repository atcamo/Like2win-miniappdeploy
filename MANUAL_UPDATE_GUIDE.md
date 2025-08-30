# 🔄 Manual Update Guide

## Cuando necesites actualizar likes inmediatamente:

### 📱 **Para usuarios (cuando des un like):**
1. Da like al post de @Like2Win
2. Espera hasta el próximo cron diario (12:00 PM UTC), O
3. Solicita update manual (ver abajo)

### ⚡ **Update Manual Inmediato:**
```bash
# Desde terminal
curl -X POST "https://like2win-app.vercel.app/api/cron/update-local-data"
```

### 🌐 **Desde navegador:**
Visita: `https://like2win-app.vercel.app/api/cron/update-local-data` con POST request

### ⏰ **Cron Automático:**
- **Frecuencia**: Diario a las 12:00 PM UTC
- **Función**: Actualiza todos los likes automáticamente
- **Límite**: Vercel Hobby permite solo crons diarios

## 🚀 **Para Tiempo Real (Futuro):**
- Upgrade a Vercel Pro ($20/mes)
- O implementar webhooks directos
- O usar otro proveedor de cron jobs

## 📊 **Estado Actual:**
- ✅ Sistema funciona correctamente
- ✅ Update manual disponible 24/7
- ✅ Update automático diario
- ⏰ Para tiempo real: requiere plan Pro