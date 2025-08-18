# 🧪 GUÍA DE TESTING EN FARCASTER - Like2Win

## 🚀 **DEPLOYMENT STATUS**

**✅ CÓDIGO SUBIDO**: GitHub actualizado con engagement system  
**⏳ VERCEL BUILD**: Procesando deployment automático  
**🔗 URL**: Se confirmará una vez complete el build  

---

## 📱 **CÓMO PROBAR EN FARCASTER**

### **Paso 1: Verificar Deployment**
1. **Esperar confirmación**: La URL de producción será proporcionada
2. **Check health**: Verificar que `/api/engagement/follow?userFid=1` responda
3. **UI Test**: Confirmar que `/miniapp` cargue correctamente

### **Paso 2: Testing Básico en Farcaster**

#### **2.1 - Frame Detection**
```
1. Abrir Farcaster client (Warpcast)
2. Ir a la URL de producción 
3. Verificar que se detecte como Frame/MiniApp
4. Confirmar que MiniKit se inicialice
```

#### **2.2 - User Context**
```
1. La app debe detectar tu FID automáticamente
2. Mostrar tu username/displayName
3. Engagement Demo debe ser interactivo
4. Follow toggle debe funcionar
```

### **Paso 3: Testing de Engagement**

#### **3.1 - Follow Testing**
```
1. Click "Follow @Like2Win" en la demo
2. Verificar que toggle cambie estado
3. Mensaje de confirmación debe aparecer
4. Estado debe persistir en la UI
```

#### **3.2 - Engagement Testing**
```
1. Usar botones "Test Engagement" en posts demo
2. Verificar diferentes escenarios:
   - Sin follow: "Debes seguir @Like2Win"
   - Con follow: Simular engagement completo
3. Ver feedback real-time
4. Tickets award simulation
```

### **Paso 4: API Testing**

#### **4.1 - Direct API Calls**
```bash
# Follow check
curl "https://[URL]/api/engagement/follow?userFid=[TU_FID]"

# Casts loading  
curl "https://[URL]/api/engagement/casts?limit=5"

# Engagement processing
curl -X POST "https://[URL]/api/engagement/check" \
  -H "Content-Type: application/json" \
  -d '{"userFid":[TU_FID],"castHash":"0xtest123"}'
```

#### **4.2 - Expected Responses**
```json
// Follow check - Success
{"success":true,"data":{"userFid":12345,"isFollowing":false,"like2winFid":99999}}

// Engagement check - Success
{"success":true,"data":{"success":false,"ticketAwarded":false,"message":"Must follow @Like2Win to participate"}}
```

---

## 🔍 **QUE BUSCAR (TESTING CHECKLIST)**

### **✅ Funcionalidad Básica**
- [ ] MiniApp carga en Farcaster
- [ ] User FID se detecta automáticamente
- [ ] UI responsive en mobile
- [ ] No errores en console

### **✅ Engagement Demo**
- [ ] Follow toggle funciona
- [ ] Messages aparecen y desaparecen
- [ ] Engagement testing responde
- [ ] System status muestra datos correctos

### **✅ APIs Funcionando**
- [ ] `/api/engagement/follow` responde 200
- [ ] `/api/engagement/casts` responde 200  
- [ ] `/api/engagement/check` responde 200
- [ ] JSON responses son válidos

### **✅ Error Handling**
- [ ] Páginas no crashean
- [ ] Errores de API se manejan gracefully
- [ ] Loading states aparecen
- [ ] Fallbacks funcionan

---

## 🚨 **PROBLEMAS POTENCIALES Y SOLUCIONES**

### **Problema: MiniApp no carga**
```
Síntomas: Página blanca o error 500
Solución: Verificar logs de Vercel, posible issue con env vars
Rollback: git revert + push si es crítico
```

### **Problema: APIs devuelven 500**
```
Síntomas: {"error": "Internal server error"} 
Solución: Check database connection, Neynar API status
Rollback: Desactivar engagement features temporalmente
```

### **Problema: MiniKit no inicializa**
```
Síntomas: "Initializing Like2Win..." permanente
Solución: Frame metadata issue, verificar layout.tsx
Rollback: Usar versión anterior del MiniApp
```

### **Problema: User FID no se detecta**
```
Síntomas: "Para participar en sorteos, necesitas abrir desde Farcaster"
Solución: Normal en web browser, debe funcionar en Farcaster client
Rollback: No necesario, working as intended
```

---

## 🔄 **PLAN DE ROLLBACK**

Si algo no funciona, tienes estas opciones:

### **Opción 1: Rollback Rápido**
```bash
# Revert to previous working commit
git revert HEAD
git push origin main
# Vercel auto-deploys previous version
```

### **Opción 2: Rollback Selectivo**
```bash
# Remove only problematic features
git checkout HEAD~1 -- app/components/EngagementDemo.tsx
git commit -m "Rollback engagement demo"
git push origin main
```

### **Opción 3: Emergency Disable**
```bash
# Replace engagement demo with simple message
# Keep everything else working
```

---

## 📊 **SUCCESS METRICS**

### **MVP Success Criteria**
- ✅ MiniApp loads in Farcaster without errors
- ✅ Demo interaction works smoothly  
- ✅ APIs respond correctly
- ✅ No critical bugs or crashes
- ✅ User experience is intuitive

### **Production Ready Criteria**
- ✅ All APIs working with real data
- ✅ Database integration stable
- ✅ Error handling comprehensive
- ✅ Performance acceptable (<3s load)
- ✅ Mobile optimization complete

---

## 🎯 **PRÓXIMOS PASOS POST-TESTING**

### **Si Todo Funciona**
1. ✅ **Production Stable** - Sistema listo
2. 🔄 **Next Feature** - Tip Allowance Integration
3. 📈 **Optimization** - Performance tuning
4. 🚀 **Scale Preparation** - Real user testing

### **Si Hay Issues Menores**
1. 🔍 **Document Issues** - Lista de fixes necesarios
2. 🛠️ **Quick Fixes** - Patch deployment
3. 📝 **Improvement Plan** - Próxima iteración

### **Si Hay Issues Críticos**
1. 🚨 **Rollback Immediate** - Volver a versión estable
2. 🔍 **Root Cause Analysis** - Entender qué falló
3. 🛠️ **Fix & Redeploy** - Corrección y nuevo deployment

---

## 📞 **TESTING SUPPORT**

Mientras probamos, estaré monitoreando para:
- ✅ **Confirmar deployment status**
- 🔍 **Revisar logs de errores**  
- 🛠️ **Fix issues in real-time**
- 🔄 **Execute rollback si necesario**

**¡El sistema está listo para testing!** 🚀

Una vez que tengas la URL de producción, podemos comenzar las pruebas sistemáticas.