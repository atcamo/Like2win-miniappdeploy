PRODUCT REQUIREMENTS DOCUMENT (PRD)
Like2Win - MVP Social Gamification en Farcaster
Versión: 2.0 (MVP)
Fecha: Julio 2025
Owner: Product Team
Status: MVP Development Ready

1. PRODUCT OVERVIEW
Resumen Ejecutivo
Like2Win es una Mini App de Farcaster que convierte interacciones con publicaciones oficiales en tickets para sorteos bi-semanales de $DEGEN. Los usuarios con tip allowance ganan tickets con solo dar like, mientras usuarios sin allowance necesitan like + comment + recast. Like2Win redistribuye el 90% de los tips recibidos como premios.

Propuesta de Valor MVP
Para Users: Zero friction - solo follow + like para participar en sorteos
Para Like2Win: Revenue stream vía tips automáticos del nuevo sistema Degen
Para Ecosystem: Aumenta engagement en publicaciones oficiales

Posicionamiento en el Mercado
Categoría: Social-Fi Gamification (MVP)
Competencia Directa: Ninguna específica en Farcaster
Competencia Indirecta: Degen tips, Ham, otros token sociales
Diferenciador MVP: Participación sin wallet connection, redistribución transparente

2. USER PERSONAS & JOBS-TO-BE-DONE (MVP)
Persona Primaria: "El Farcaster User Activo" - Carlos (Costa Rica)
Demographics: 25-35 años, crypto-curious, activo en Farcaster
Farcaster Usage: 30+ casts/semana, da 15-20 likes diarios
Motivación: Diversión, community, oportunidad de ganar sin investment
Jobs-to-be-Done:

Participar en algo divertido sin complicaciones
Ganar rewards por behavior que ya hago
Ser parte de una comunidad engaged

Pain Points:

No hay rewards por engagement social
Demasiada friction en most crypto apps
Boring experience en social media

MVP Focus: Remover toda friction posible para maximum adoption

3. FUNCTIONAL REQUIREMENTS (MVP)
P0 - CRÍTICAS (Week 1-2)
F1: Follow Detection & Eligibility
User Story: Como usuario de Farcaster, quiero participar automáticamente al seguir @Like2Win.

Acceptance Criteria:
- Sistema detecta follows a @Like2Win en tiempo real
- Usuario se vuelve eligible automáticamente
- No wallet connection required para eligibility
- Estado de following se trackea en database

F2: Engagement Detection & Ticket Award
User Story: Como follower de @Like2Win, quiero recibir tickets por mi engagement según mi configuración de tips.

Acceptance Criteria:
- Usuario CON tip allowance: Like = 1 ticket
- Usuario SIN tip allowance: Like + Comment + Recast = 1 ticket
- Sistema detecta tip allowance status automáticamente
- Solo posts de @Like2Win oficial cuentan
- Duplicate engagement prevention por post
- Tickets se acumulan por raffle period
- Real-time feedback de actions requeridas

F3: Frame Dashboard
User Story: Como participante, quiero ver mi status actual y próximo sorteo.

Acceptance Criteria:
- Muestra tickets actuales del usuario
- Total participants y total tickets en pool
- Countdown preciso al próximo sorteo
- Últimos ganadores displayed
- Frame se actualiza en tiempo real

P1 - IMPORTANTES (Week 2-3)
F4: Bi-Weekly Raffle System
User Story: Como participante, quiero sorteos justos y transparentes dos veces por semana.

Acceptance Criteria:
- Sorteos automáticos miércoles y domingo 8PM UTC
- Pool calculation: 90% tips + minimum fund logic
- 3 ganadores: 60%/30%/10% del 90% redistribuible
- VRF randomization para fairness
- Automatic prize distribution

F5: Pool Management System
User Story: Como sistema, necesito manejar pools dinámicamente basado en tips recibidos.

Acceptance Criteria:
- Tips < 5000: Pool = 500 $DEGEN + 90% tips
- Tips ≥ 5000: Pool = 90% tips (self-sustaining)
- 10% operational fee always
- Real-time pool calculation
- Transparent pool display

Integraciones Técnicas Necesarias
```typescript
// Core Integrations MVP
1. Farcaster Hub API - follow/like/comment/recast detection
2. Degen Tip System - automatic tip reception + allowance detection
3. Base Network - smart contracts for randomness
4. Chainlink VRF - fair winner selection
5. Warpcast Frame API - UI rendering
```

4. USER EXPERIENCE (MVP)
User Flow Simplificado
1. DISCOVERY
   Usuario ve Frame compartido → "Like2Win: Follow + Like = Win $DEGEN"

2. ONBOARDING  
   Click Frame → Follow @Like2Win (1 click) → Ya participando

3. PARTICIPATION
   Like posts oficiales → Auto +1 ticket → Frame updates

4. RAFFLE
   Bi-weekly → Winners announced → Prizes distributed

5. VIRAL LOOP
   Winners share → Others see Frame → Follow + participate

Wireframes MVP
Frame 1: Dashboard Principal
```
┌─────────────────────────────┐
│        🎫 LIKE2WIN          │
├─────────────────────────────┤
│ Tus Tickets: 12             │
│ Total Participants: 347     │
│ Pool Actual: 2,240 $DEGEN   │
│ ⏰ Próximo Sorteo: 2d 14h   │
├─────────────────────────────┤
│ 🏆 Últimos Ganadores:       │
│ 🥇 @maria: 1,210 $DEGEN     │
│ 🥈 @carlos: 605 $DEGEN      │
│ 🥉 @ana: 202 $DEGEN         │
├─────────────────────────────┤
│ [Follow to Play] [Share]    │
└─────────────────────────────┘
```

Frame 2: Post-Engagement Confirmation
```
┌─────────────────────────────┐
│        🎉 +1 TICKET!        │
├─────────────────────────────┤
│ ✅ Like detectado           │
│ (Tip allowance: YES)        │
│ Total tickets: 13           │
│ Tu probabilidad: 3.7%       │
├─────────────────────────────┤
│ 🎯 Próximo Sorteo:          │
│ Domingo 8PM UTC             │
│ Pool: 2,240 $DEGEN          │
├─────────────────────────────┤
│ [Share Win] [View Pool]     │
└─────────────────────────────┘
```

Frame 3: Needs More Engagement
```
┌─────────────────────────────┐
│      ⚠️ ALMOST THERE!       │
├─────────────────────────────┤
│ ✅ Like                     │
│ ❌ Comment needed           │
│ ❌ Recast needed            │
│ (No tip allowance detected) │
├─────────────────────────────┤
│ Complete all 3 for ticket! │
│ Or configure tip allowance  │
├─────────────────────────────┤
│ [How to Setup Tips]         │
└─────────────────────────────┘
```

Puntos de Fricción Eliminados (MVP)
- ❌ Wallet connection requirement
- ❌ Complex tip mechanics
- ❌ Multi-step onboarding
- ❌ Target system complexity
- ❌ Manual prize claims

✅ Zero Friction Experience
- Follow button (1 click)
- Like detection (automatic)
- Ticket award (instant)
- Prize distribution (automatic)

5. TECHNICAL ARCHITECTURE (MVP)
Stack Tecnológico Simplificado
```typescript
// Frontend & Frames
Framework: Next.js 14 + TypeScript
Styling: TailwindCSS (minimal design)
Frames: @frames.js/render
Animation: None (MVP)

// Blockchain & Web3 (Minimal)
Network: Base L2 (only for VRF)
Randomness: Chainlink VRF
Smart Contracts: Only raffle execution

// Backend & Data  
Database: Supabase (PostgreSQL)
Hosting: Vercel (Edge Functions)
Caching: None (MVP)

// External APIs
Farcaster: Hub API (follows/likes detection)
Degen: Automatic tip reception
Analytics: Basic tracking only
```

Base de Datos Schema (MVP)
```sql
-- Core Tables MVP
CREATE TABLE users (
  fid INTEGER PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  display_name VARCHAR(100),
  is_following BOOLEAN DEFAULT FALSE,
  has_tip_allowance BOOLEAN DEFAULT FALSE, -- Si tiene tips configurados
  total_engagements_lifetime INTEGER DEFAULT 0, -- Total interactions (likes o like+comment+recast)
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_following ON users(is_following);
CREATE INDEX idx_users_stats ON users(total_tickets_lifetime DESC);

-- Bi-Weekly Raffle Rounds
CREATE TABLE raffles (
  id SERIAL PRIMARY KEY,
  week_period VARCHAR(20) NOT NULL, -- "2025-W30-A" (Wed), "2025-W30-B" (Sun)
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  
  -- Pool Management
  tips_received INTEGER DEFAULT 0,        -- Raw tips del período
  user_contribution INTEGER DEFAULT 0,    -- 90% de tips
  founder_contribution INTEGER DEFAULT 0, -- 500 o 0 (si tips >= 5000)
  operational_fee INTEGER DEFAULT 0,      -- 10% de tips
  total_pool INTEGER DEFAULT 0,           -- user + founder contribution
  is_self_sustaining BOOLEAN DEFAULT FALSE, -- tips >= 5000
  
  -- Participants
  total_participants INTEGER DEFAULT 0,
  total_tickets INTEGER DEFAULT 0,
  
  -- Results
  first_place_fid INTEGER REFERENCES users(fid),
  second_place_fid INTEGER REFERENCES users(fid), 
  third_place_fid INTEGER REFERENCES users(fid),
  first_prize INTEGER,  -- 54% (60% of 90%)
  second_prize INTEGER, -- 27% (30% of 90%)
  third_prize INTEGER,  -- 9% (10% of 90%)
  
  status VARCHAR(20) DEFAULT 'active', -- active, drawing, completed
  random_seed VARCHAR(66), -- VRF result
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_raffle_period ON raffles(week_period);
CREATE INDEX idx_raffle_status ON raffles(status);

-- User Participation per Raffle
CREATE TABLE user_tickets (
  id SERIAL PRIMARY KEY,
  raffle_id INTEGER REFERENCES raffles(id),
  user_fid INTEGER REFERENCES users(fid),
  tickets_count INTEGER DEFAULT 0,
  first_like_at TIMESTAMP,
  last_like_at TIMESTAMP,
  UNIQUE(raffle_id, user_fid)
);

CREATE INDEX idx_tickets_raffle_user ON user_tickets(raffle_id, user_fid);
CREATE INDEX idx_tickets_count ON user_tickets(tickets_count DESC);

-- Engagement Activity Log
CREATE TABLE engagement_log (
  id SERIAL PRIMARY KEY,
  raffle_id INTEGER REFERENCES raffles(id),
  user_fid INTEGER REFERENCES users(fid),
  cast_hash VARCHAR(66) NOT NULL,
  
  -- Engagement tracking
  has_liked BOOLEAN DEFAULT FALSE,
  has_commented BOOLEAN DEFAULT FALSE, 
  has_recasted BOOLEAN DEFAULT FALSE,
  has_tip_allowance BOOLEAN DEFAULT FALSE,
  
  -- Ticket award
  ticket_awarded BOOLEAN DEFAULT FALSE,
  ticket_awarded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cast_hash, user_fid) -- One engagement record per user per post
);

CREATE INDEX idx_engagement_raffle ON engagement_log(raffle_id);
CREATE INDEX idx_engagement_user ON engagement_log(user_fid);
CREATE INDEX idx_engagement_cast ON engagement_log(cast_hash);
CREATE INDEX idx_engagement_awarded ON engagement_log(ticket_awarded);

-- Basic Analytics
CREATE TABLE events_log (
  id SERIAL PRIMARY KEY,
  user_fid INTEGER REFERENCES users(fid),
  event_type VARCHAR(50) NOT NULL, -- follow, like, win, frame_view
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events_log(event_type);
CREATE INDEX idx_events_time ON events_log(created_at DESC);
```

Integraciones Específicas MVP
```typescript
// 1. Follow Detection Service
interface FollowDetectionService {
  // Monitor follows to @Like2Win
  monitorFollows(): AsyncIterator<FollowAction>;
  
  // Update user eligibility
  updateUserEligibility(userFid: number, isFollowing: boolean): Promise<void>;
}

// 2. Engagement Detection Service  
interface EngagementDetectionService {
  // Monitor all engagements on Like2Win posts
  monitorEngagements(): AsyncIterator<EngagementAction>;
  
  // Check tip allowance status
  checkTipAllowance(userFid: number): Promise<boolean>;
  
  // Process engagement and award tickets
  processEngagement(engagement: EngagementAction): Promise<void>;
  
  // Check if user completed required actions
  checkTicketEligibility(userFid: number, castHash: string): Promise<boolean>;
}

// 3. Pool Management Service
interface PoolManagementService {
  // Calculate pool for current raffle
  calculateCurrentPool(): Promise<PoolData>;
  
  // Check if self-sustaining threshold reached
  checkSelfSustaining(): Promise<boolean>;
}

// 4. Raffle Execution Service
interface RaffleExecutionService {
  // Execute bi-weekly raffle
  executeRaffle(raffleId: string): Promise<RaffleResult>;
  
  // Distribute prizes to winners
  distributePrizes(winners: Winner[], prizes: number[]): Promise<void>;
}
```

Pool Management Logic
```typescript
// Core Pool Calculation
async function calculatePrizePool(raffleId: string): Promise<PoolData> {
  const MINIMUM_POOL = 500;    // Founder minimum
  const THRESHOLD = 5000;      // Self-sustaining threshold
  
  // Get tips received for this period
  const tipsReceived = await getTipsReceived(raffleId);
  const userContribution = Math.floor(tipsReceived * 0.9); // 90%
  const operationalFee = Math.floor(tipsReceived * 0.1);   // 10%
  
  // Dynamic pool calculation
  let totalPool: number;
  let founderContribution: number;
  
  if (tipsReceived >= THRESHOLD) {
    // Self-sustaining mode
    totalPool = userContribution;
    founderContribution = 0;
  } else {
    // Bootstrap mode
    totalPool = MINIMUM_POOL + userContribution;
    founderContribution = MINIMUM_POOL;
  }
  
  return {
    tips_received: tipsReceived,
    user_contribution: userContribution,
    founder_contribution: founderContribution,
    operational_fee: operationalFee,
    total_pool: totalPool,
    is_self_sustaining: tipsReceived >= THRESHOLD
  };
}
```

6. SUCCESS METRICS & KPIs (MVP)
Métricas de Validación (Week 1-4)
```typescript
interface MVPValidationMetrics {
  // Adoption
  total_followers: number;        // Target: 500+ in month 1
  daily_active_users: number;     // Target: 100+ DAU
  likes_per_day: number;          // Target: 300+ likes/day
  
  // Engagement  
  retention_week_1: number;       // Target: 60%+
  avg_likes_per_user: number;     // Target: 5+ per week
  frame_interaction_rate: number; // Target: 80%+
  
  // Economics
  tips_received_monthly: number;  // Track growth toward 5000
  pool_size_average: number;      // Monitor prize attractiveness
  self_sustaining_date: Date;     // Goal: Month 2
}
```

Métricas de Crecimiento (Month 2-3)
```typescript
interface GrowthMetrics {
  // Scale
  total_participants: number;     // Target: 2000+ users
  viral_coefficient: number;      // Target: 1.5+ (each user brings 1.5 more)
  organic_growth_rate: number;    // Target: 30%+ week over week
  
  // Economics
  monthly_tips_volume: number;    // Target: 10,000+ $DEGEN/month
  average_pool_size: number;      // Target: 3000+ $DEGEN per raffle
  operational_sustainability: boolean; // Self-sustaining achieved
}
```

7. GO-TO-MARKET STRATEGY (MVP)
Launch Plan Simplificado
Phase 1: Silent Launch (Week 1)
Objetivo: Validate core mechanics

Audiencia: 50 Farcaster power users
Estrategia: Direct DMs, personal invites
Success Metric: 80%+ follow-through rate, zero critical bugs

Phase 2: Community Launch (Week 2-3)
Objetivo: Achieve initial scale

Audiencia: /degen channel + Base ecosystem
Estrategia:
- Post in /degen with live demo
- Partner with 1-2 micro-influencers
- First few raffles with attractive pools

Success Metric: 200+ followers, 500+ total tickets

Phase 3: Viral Growth (Week 4-8)
Objetivo: Reach self-sustaining scale

Audiencia: Broader Farcaster community
Estrategia:
- Winner announcements for social proof
- Frame optimization for viral sharing
- Cross-promotion with other Farcaster apps

Success Metric: 1000+ participants, self-sustaining pool

Canales de Distribución MVP
Primary: Farcaster Native
- /degen channel posts
- Direct sharing del Frame
- Winner celebration posts
- Organic word-of-mouth

Secondary: External Amplification  
- Twitter threads (technical/results)
- Discord communities (Base, Degen)
- Personal networks

Content Strategy MVP
Week 1-2: Educational
- "How Like2Win Works" (simple explainer)
- "First Raffle Results" (transparency)

Week 3-4: Social Proof
- Winner spotlights
- Pool size announcements
- Community growth stats

Week 5+: Optimization
- Feature updates
- Community feedback integration
- Scale preparation

8. MONETIZATION MODEL (MVP)
Revenue Structure Simplificada
Primary Revenue: Automatic Tips (100%)
```typescript
interface MVPMonetization {
  // Automatic Revenue
  tips_received: number;        // From Degen tip system
  operational_fee: 0.10;        // 10% of tips received
  
  // Cost Structure  
  redistribution_rate: 0.90;    // 90% back to users
  founder_contribution: 500;    // Bootstrap fund per raffle
  operational_costs: number;    // Hosting, tools, development
}
```

Bootstrap Economics
```typescript
// Month 1 Projection
interface Month1Economics {
  expected_tips: 2000;          // Conservative estimate
  operational_fee: 200;         // 10% of tips
  founder_contribution: 4000;   // 500 × 8 raffles
  total_prizes_distributed: 5220; // 90% del total pool
  operational_fee_retained: 580;  // 10% del total pool
  
  // Break-even analysis
  monthly_costs: 300;           // Hosting + tools
  deficit: 100;                 // Need growth to sustainability
}

// Month 3 Target (Self-Sustaining)
interface Month3Target {
  expected_tips: 8000;          // Growth target
  operational_fee: 800;         // 10% of tips
  founder_contribution: 0;      // Zero (self-sustaining)
  total_prizes_distributed: 6480; // 90% del total pool
  operational_fee_retained: 720;  // 10% del total pool
  
  // Profitability
  monthly_costs: 500;           // Scale costs
  profit: 300;                  // Sustainable model
}
```

9. TECHNICAL MILESTONES (MVP)
Phase 1: Core MVP (Week 1-2)
Milestone 1.1: Basic Infrastructure
Timeline: Days 1-4
Deliverables:
- Database setup with MVP schema
- Farcaster Hub API integration
- Basic Frame rendering
- Follow detection working

Success Criteria:
✅ Users can follow and get tracked
✅ Basic Frame loads in <3 seconds
✅ Database handles 1000+ users
✅ No critical errors in follow detection

Milestone 1.2: Like Detection & Ticketing
Timeline: Days 3-6
Deliverables:
- Like detection on official posts
- Ticket award system
- Real-time Frame updates
- Duplicate prevention

Success Criteria:
✅ Likes detected in <5 minutes
✅ Tickets awarded accurately
✅ Frame updates automatically
✅ No duplicate ticket awards

Milestone 1.3: Pool Management
Timeline: Days 5-8
Deliverables:
- Pool calculation logic
- Bootstrap/self-sustaining logic
- Real-time pool display
- Basic analytics

Success Criteria:
✅ Pool calculates correctly
✅ Bootstrap mode works
✅ Pool updates in real-time
✅ Basic metrics tracked

Phase 2: Raffle System (Week 2-3)
Milestone 2.1: Raffle Execution
Timeline: Days 8-12
Deliverables:
- VRF integration for randomness
- Winner selection algorithm
- Prize distribution logic
- Automated bi-weekly execution

Success Criteria:
✅ Provably fair randomness
✅ Correct winner selection
✅ Automated execution works
✅ Prize distribution functional

Milestone 2.2: User Experience Polish
Timeline: Days 10-14
Deliverables:
- Frame optimization
- Error handling
- User feedback integration
- Performance optimization

Success Criteria:
✅ Frame interactions smooth
✅ Error rates <1%
✅ User feedback positive
✅ Performance targets met

Phase 3: Launch Preparation (Week 3-4)
Milestone 3.1: Testing & Security
Timeline: Days 15-18
Deliverables:
- Load testing
- Security review
- Bug fixes
- Documentation

Success Criteria:
✅ Handles 500+ concurrent users
✅ No security vulnerabilities
✅ All critical bugs fixed
✅ Documentation complete

Milestone 3.2: Go-Live
Timeline: Days 19-21
Deliverables:
- Production deployment
- Monitoring setup
- First live raffle
- Community launch

Success Criteria:
✅ Zero-downtime deployment
✅ Monitoring systems active
✅ First raffle executes successfully
✅ Community response positive

10. RISK ASSESSMENT (MVP)
Riesgos Técnicos Principales
🔴 ALTO RIESGO
R1: Degen Tip System Dependency
Riesgo: New Degen tip system changes or fails
Probabilidad: Media (30%)
Impacto: Crítico (revenue model breaks)
Mitigación:
- Direct relationship con Degen team
- Backup manual tip collection
- Diversification plan for other tokens

R2: Farcaster API Rate Limits
Riesgo: Hub API limits affect like/follow detection
Probabilidad: Alta (40%)
Impacto: Alto (delayed ticket awards)
Mitigación:
- Multiple API endpoints
- Graceful degradation
- Caching strategies

🟡 MEDIO RIESGO
R3: Pool Size Too Small
Riesgo: Not enough tips to make attractive prizes
Probabilidad: Media (35%)
Impacto: Medio (low engagement)
Mitigación:
- Founder bootstrap fund
- Aggressive early marketing
- Partnerships for prize supplements

Riesgos de Mercado
🔴 ALTO RIESGO
M1: Low User Adoption
Riesgo: Users don't find value proposition compelling
Probabilidad: Media (40%)
Impacto: Existencial (product failure)
Mitigación:
- Aggressive A/B testing of messaging
- Rapid iteration based on feedback
- Strong launch partnerships

🟡 MEDIO RIESGO
M2: Regulatory Concerns
Riesgo: Gambling regulations affect raffle mechanics
Probabilidad: Baja (20%)
Impacto: Alto (model change required)
Mitigación:
- Legal consultation pre-launch
- Geographic restrictions if needed
- Alternative reward mechanisms ready

Planes de Mitigación
Emergency Response Protocol
```typescript
interface EmergencyProtocol {
  // Service Degradation
  degraded_mode: {
    manual_ticket_awards: boolean;
    extended_raffle_periods: boolean;
    communication_to_users: string;
  };
  
  // Critical Failure
  critical_failure: {
    pause_new_participants: boolean;
    protect_existing_pools: boolean;
    emergency_contact_list: string[];
  };
}
```

CONCLUSIÓN MVP
Executive Summary
Like2Win MVP focuses on validating the core value proposition: zero-friction participation in social gamification. By eliminating wallet requirements and complex mechanics, we maximize adoption potential while building toward sustainable economics.

Immediate Actions (Next 7 days)
✅ Setup: Database, APIs, development environment
✅ Team: Assign technical milestones ownership
✅ Community: Identify 50 beta users for silent launch
✅ Legal: Basic compliance review for raffle mechanics

Success Criteria MVP
Week 2: 100+ followers, first successful raffle
Week 4: 500+ participants, positive user feedback
Week 8: Self-sustaining pool achieved
Week 12: 2000+ users, proven viral mechanics

Risk Management Priority MVP
1. User adoption - ship fast, iterate faster
2. Technical reliability - robust core systems
3. Economic sustainability - path to self-sufficiency
4. Regulatory compliance - address proactively

El éxito del MVP de Like2Win depende de rapid execution y ruthless focus en user adoption. Este PRD proporciona la foundation técnica para un producto que puede escalar desde 100 a 10,000+ users con el modelo económico correcto.