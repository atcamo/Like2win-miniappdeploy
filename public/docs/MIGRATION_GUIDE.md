# 🚀 Guía de Migración: Like2Win → Proyecto Farcaster Funcional

## 📋 Resumen de Migración

Migrar la estética, funcionalidad y modelo de negocio del proyecto Like2Win a un proyecto Farcaster que sí despliega correctamente.

---

## 🎨 **ESTÉTICA Y DISEÑO VISUAL**

### **1. Paleta de Colores Principal**
```css
/* Colores primarios */
--primary-amber: #F59E0B;
--primary-yellow: #EAB308; 
--primary-orange: #F97316;

/* Gradientes signature */
background: linear-gradient(to right, #F59E0B, #EAB308, #F97316);
background: linear-gradient(45deg, #fbbf24, #f59e0b, #f97316);

/* Backgrounds de pantalla */
background: linear-gradient(to bottom right, #fef3c7, #fef08a, #fed7aa);
/* Dark mode */
background: linear-gradient(to bottom right, #1f2937, #1f2937, #451a03);
```

### **2. Tipografía y Espaciado**
```css
/* Font principal */
font-family: "Geist", ui-sans-serif, system-ui;

/* Títulos principales */
.main-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(to right, #d97706, #f59e0b);
  background-clip: text;
  color: transparent;
}

/* Subtítulos */
.subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #92400e;
}
```

### **3. Componentes UI Signature**

#### **Botón Principal (Gradient)**
```tsx
<button className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 
  hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 
  text-white shadow-lg hover:shadow-2xl transform hover:scale-105 
  px-6 py-3 rounded-lg font-medium transition-all duration-300">
  Participar Ahora
</button>
```

#### **Cards con Glassmorphism**
```tsx
<div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 
  backdrop-blur-lg border border-amber-200/30 dark:border-amber-700/30 
  rounded-xl p-6 shadow-lg">
  {/* Contenido */}
</div>
```

#### **Logo Component**
```tsx
// Implementar logo con animación de loading
<div className="relative">
  <img src="/logo.png" className="w-16 h-16 animate-pulse" />
  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 
    rounded-full opacity-20 animate-ping"></div>
</div>
```

### **4. Animaciones Características**

#### **Falling Likes Animation**
```css
@keyframes fall {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

@keyframes showLike {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 1; transform: scale(1); }
  55% { opacity: 1; transform: scale(1.2); filter: brightness(1.8) drop-shadow(0 0 12px gold); }
  60% { opacity: 0; transform: scale(0); }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes showCoin {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 0; transform: scale(0); }
  55% { opacity: 1; transform: scale(1.2); filter: brightness(1.8) drop-shadow(0 0 12px gold); }
  60% { opacity: 1; transform: scale(1); }
  100% { opacity: 1; transform: scale(1); }
}

.falling-item {
  position: relative;
  width: 32px;
  height: 32px;
  animation: fall linear infinite;
}
```

#### **Sparkle Effects**
```css
@keyframes sparkle {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    filter: brightness(1.5) drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  }
}
```

---

## 🎮 **MODELO DE NEGOCIO Y MECÁNICAS**

### **1. Estructura de Datos Principal**

#### **Schema de Base de Datos**
```sql
-- Usuarios participantes
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fid BIGINT UNIQUE NOT NULL, -- Farcaster ID
  username VARCHAR(255),
  display_name VARCHAR(255),
  pfp_url TEXT,
  wallet_address VARCHAR(42),
  tip_allowance_enabled BOOLEAN DEFAULT false,
  is_following_like2win BOOLEAN DEFAULT false,
  total_lifetime_tickets INTEGER DEFAULT 0,
  total_winnings DECIMAL(18, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rifas bi-semanales
CREATE TABLE raffles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming',
  prize_pool DECIMAL(18, 8) DEFAULT 0,
  total_tickets INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participaciones en posts
CREATE TABLE post_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  engagement_type VARCHAR(50) NOT NULL,
  has_liked BOOLEAN DEFAULT false,
  has_commented BOOLEAN DEFAULT false,
  has_recasted BOOLEAN DEFAULT false,
  tickets_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Lógica de Participación**

#### **Reglas de Engagement**
```typescript
interface EngagementRules {
  // Usuario CON tip allowance
  tipAllowanceUser: {
    required: ['like'];
    ticketsPerAction: 1;
  };
  
  // Usuario SIN tip allowance  
  standardUser: {
    required: ['like', 'comment', 'recast'];
    ticketsPerAction: 1;
  };
  
  // Prerequisitos
  prerequisites: {
    mustFollow: '@Like2Win';
    mustBeActive: true;
  };
}
```

#### **API de Participación**
```typescript
// POST /api/raffle/participate
{
  "user_fid": 12345,
  "post_cast_hash": "0xabcd...",
  "engagement_type": "like_comment_recast",
  "engagement_data": {
    "has_liked": true,
    "has_commented": true, 
    "has_recasted": true
  }
}
```

### **3. Sistema de Rifas**

#### **Configuración de Rifas**
```typescript
const raffleConfig = {
  schedule: {
    days: [0, 3], // Domingo y Miércoles
    hour: 20, // 8PM UTC
    duration: 72, // 72 horas
  },
  
  rewards: {
    currency: '$DEGEN',
    distribution: {
      winners: 0.9, // 90% a ganadores
      operations: 0.1 // 10% operacional
    },
    positions: [
      { place: 1, percentage: 0.5 }, // 50% al 1er lugar
      { place: 2, percentage: 0.3 }, // 30% al 2do lugar  
      { place: 3, percentage: 0.2 }  // 20% al 3er lugar
    ]
  }
};
```

#### **Selección de Ganadores**
```typescript
// Weighted random selection basado en tickets
function selectWinners(participants: Participant[]): Winner[] {
  const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
  
  return participants.map(participant => ({
    ...participant,
    probability: (participant.tickets / totalTickets) * 100
  })).sort((a, b) => b.tickets - a.tickets);
}
```

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **1. Hooks Personalizados**

#### **useRaffleStatus**
```typescript
export function useRaffleStatus(fid: number) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchStatus = async () => {
    const response = await fetch(`/api/raffle/status?fid=${fid}`);
    const result = await response.json();
    setData(result.data);
  };
  
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, [fid]);
  
  return { data, isLoading, refresh: fetchStatus };
}
```

### **2. Componentes Principales**

#### **RaffleStatus Card**
```tsx
function RaffleStatusCard({ userFid }: { userFid: number }) {
  const { data, isLoading } = useRaffleStatus(userFid);
  
  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <TrophyIcon className="text-amber-600 mr-2" />
          <span className="text-lg font-semibold">Current Raffle</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {data?.raffle?.prize_pool || '0'} $DEGEN
            </div>
            <div className="text-sm text-gray-600">Prize Pool</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {data?.user?.current_tickets || 0}
            </div>
            <div className="text-sm text-gray-600">Your Tickets</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

#### **Participation Button**
```tsx
function ParticipationButton({ postHash, userFid }: Props) {
  const [isParticipating, setIsParticipating] = useState(false);
  
  const handleParticipate = async () => {
    setIsParticipating(true);
    try {
      const response = await fetch('/api/raffle/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_fid: userFid,
          post_cast_hash: postHash,
          engagement_type: 'like_comment_recast'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Show success animation
        showSuccessAnimation();
      }
    } finally {
      setIsParticipating(false);
    }
  };
  
  return (
    <Button
      variant="gradient"
      onClick={handleParticipate}
      loading={isParticipating}
      className="w-full transform hover:scale-105 transition-all duration-300"
    >
      <HeartIcon className="mr-2" />
      {isParticipating ? 'Participating...' : 'Participate Now'}
    </Button>
  );
}
```

### **3. Leaderboard Component**
```tsx
function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    fetch('/api/raffle/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data.data));
  }, []);
  
  return (
    <Card className="bg-white/90 backdrop-blur-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          🏆 Leaderboard
        </h3>
        
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div key={user.fid} className="flex items-center justify-between p-3 
              bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3
                  ${index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-gray-300' : 
                    index === 2 ? 'bg-orange-400' : 'bg-amber-200'}`}>
                  <span className="text-sm font-bold">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{user.display_name}</div>
                  <div className="text-sm text-gray-600">@{user.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-600">{user.tickets}</div>
                <div className="text-xs text-gray-500">tickets</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
```

---

## 📱 **CONFIGURACIÓN PARA FARCASTER**

### **1. Metadata para Mini App**
```typescript
// En layout.tsx o metadata
export const metadata = {
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${baseUrl}/hero.png`,
      button: {
        title: `Launch Like2Win`,
        action: {
          type: "launch_frame",
          name: "Like2Win",
          url: `${baseUrl}/miniapp`,
          splashImageUrl: `${baseUrl}/splash.png`,
          splashBackgroundColor: "#F59E0B",
        },
      },
    }),
  },
};
```

### **2. CSP Headers para Embedding**
```javascript
// En next.config.js
async headers() {
  return [
    {
      source: '/miniapp',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com;",
        },
      ],
    },
  ];
}
```

### **3. Inicialización del SDK**
```typescript
// Componente de inicialización defensiva
useEffect(() => {
  const initializeMiniApp = async () => {
    try {
      if (typeof sdk?.actions?.ready === 'function') {
        await sdk.actions.ready();
        console.log('✅ SDK ready() called successfully');
      }
    } catch (error) {
      console.error('❌ Error calling SDK ready():', error);
    }
    
    // Mostrar UI independientemente del estado del SDK
    setIsLoading(false);
    setIsVisible(true);
  };

  initializeMiniApp();
}, []);
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **Fase 1: Setup Visual (1-2 días)**
1. ✅ Implementar paleta de colores y gradientes
2. ✅ Crear componentes UI base (Button, Card, Logo)
3. ✅ Configurar animaciones y efectos visuales
4. ✅ Adaptar layout responsive

### **Fase 2: Lógica de Negocio (3-4 días)**
1. ✅ Implementar schema de base de datos
2. ✅ Crear APIs de participación y estado
3. ✅ Desarrollar sistema de rifas
4. ✅ Integrar hooks personalizados

### **Fase 3: Integración Farcaster (2-3 días)**
1. ✅ Configurar metadata y headers
2. ✅ Implementar SDK initialization
3. ✅ Testing en Farcaster environment
4. ✅ Optimización de performance

### **Fase 4: Testing y Deploy (1-2 días)**
1. ✅ Testing de funcionalidades principales
2. ✅ Verificación de deployment en Farcaster
3. ✅ Monitoreo y ajustes finales

---

## 📋 **CHECKLIST DE MIGRACIÓN**

### **Estética ✨**
- [ ] Paleta de colores amber/yellow/orange implementada
- [ ] Gradientes en botones principales y backgrounds
- [ ] Animaciones falling likes y sparkle effects
- [ ] Componentes Card con glassmorphism
- [ ] Typography system con Geist font
- [ ] Logo component con loading states
- [ ] Dark mode support

### **Funcionalidad 🎮**
- [ ] Sistema de usuarios con FID de Farcaster
- [ ] Lógica de tip allowance vs standard users
- [ ] Tracking de engagement (like/comment/recast)
- [ ] Sistema de tickets y participación
- [ ] Rifas bi-semanales automatizadas
- [ ] Leaderboard en tiempo real
- [ ] Cálculo de probabilidades

### **Integración Farcaster 🔗**
- [ ] Frame metadata configurado
- [ ] CSP headers para iframe embedding
- [ ] SDK initialization defensiva
- [ ] Context detection (web vs frame)
- [ ] Manifest.json para mini app
- [ ] Testing en Farcaster client

### **APIs y Backend 🔧**
- [ ] Endpoint /api/raffle/status
- [ ] Endpoint /api/raffle/participate  
- [ ] Endpoint /api/raffle/leaderboard
- [ ] Validación con Zod schemas
- [ ] Error handling centralizado
- [ ] Rate limiting implementado

---

## 🎯 **RESULTADO ESPERADO**

Un proyecto Farcaster completamente funcional que replique la experiencia Like2Win:

- **Visual**: Estética amber/gold con animaciones signature
- **Funcional**: Sistema de rifas gamificado con $DEGEN rewards
- **Técnico**: Integración completa con Farcaster Mini Apps
- **Escalable**: Arquitectura preparada para crecimiento

Este documento te servirá como blueprint completo para replicar Like2Win en cualquier proyecto Farcaster funcional. ¡El resultado será una experiencia idéntica pero en una base técnica que sí despliega correctamente! 🚀