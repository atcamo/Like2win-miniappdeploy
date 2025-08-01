"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./DemoComponents";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";

// Enhanced Icon component with more icons for landing page
type LandingIconProps = {
  name: "sparkles" | "users" | "zap" | "shield" | "trending" | "code" | "gift" | "chevron-down" | "external-link";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LandingIcon({ name, size = "md", className = "" }: LandingIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const icons = {
    sparkles: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    zap: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7Z" />
      </svg>
    ),
    shield: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    trending: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    code: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    gift: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
    "chevron-down": (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    ),
    "external-link": (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

// Hero Section Component
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-[var(--app-background)] via-[var(--app-accent-light)] to-[var(--app-background)]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-[var(--app-foreground)] leading-tight">
                Like2Win{" "}
                <span className="text-[var(--app-accent)] relative">
                  Farcaster
                  <LandingIcon name="sparkles" className="absolute -top-2 -right-8 text-[var(--app-accent)]" size="lg" />
                </span>
              </h1>
              <p className="text-xl text-[var(--app-foreground-muted)] leading-relaxed max-w-lg">
                Follow @Like2Win y dale like a posts oficiales para participar en sorteos bi-semanales de $DEGEN. Zero friction, maximum fun!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <a 
                href="/miniapp" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🎲 Participar Ahora
              </a>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Ver Estadísticas
              </Button>
              <a 
                href="https://warpcast.com/like2win" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-2 border-amber-500 hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                💜 Follow @Like2Win
              </a>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-[var(--app-card-border)]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--app-foreground)]">500+</div>
                <div className="text-sm text-[var(--app-foreground-muted)]">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--app-foreground)]">2x</div>
                <div className="text-sm text-[var(--app-foreground-muted)]">Por Semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--app-foreground)]">$DEGEN</div>
                <div className="text-sm text-[var(--app-foreground-muted)]">Premios</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-3xl p-8 border border-[var(--app-card-border)] shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--app-accent)] rounded-full flex items-center justify-center">
                      <LandingIcon name="code" className="text-white" size="sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--app-foreground)]">AI Todo App</div>
                      <div className="text-sm text-[var(--app-foreground-muted)]">by @creator</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[var(--app-accent)]">$2,340</div>
                    <div className="text-sm text-[var(--app-foreground-muted)]">85% funded</div>
                  </div>
                </div>
                <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
                  <div className="bg-[var(--app-accent)] h-2 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between text-sm text-[var(--app-foreground-muted)]">
                  <span>127 backers</span>
                  <span>3 days left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Benefits Section Component
export function BenefitsSection() {
  const benefits = [
    {
      icon: "gift" as const,
      title: "Zero Friction",
      description: "Solo follow @Like2Win y dale like a posts oficiales. No wallet, no signup, no complications."
    },
    {
      icon: "zap" as const,
      title: "Sorteos Bi-semanales",
      description: "Miércoles y domingo 8PM UTC. Premios reales en $DEGEN distribuidos automáticamente."
    },
    {
      icon: "shield" as const,
      title: "Transparente & Justo",
      description: "Algoritmo público: más engagement = más tickets. VRF randomization para fairness."
    }
  ];

  return (
    <section className="py-20 px-4 bg-[var(--app-background)]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[var(--app-foreground)] mb-4">
            ¿Por qué Like2Win?
          </h2>
          <p className="text-xl text-[var(--app-foreground-muted)] max-w-2xl mx-auto">
            La forma más simple de ganar $DEGEN en Farcaster
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="mb-6 inline-flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent-hover)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <LandingIcon name={benefit.icon} className="text-white" size="lg" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
                {benefit.title}
              </h3>
              <p className="text-[var(--app-foreground-muted)] leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Marketplace Section Component  
export function MarketplaceSection() {
  const projects = [
    {
      title: "DeFi Dashboard",
      creator: "@alice",
      funded: 92,
      amount: "$4,520",
      backers: 89,
      category: "DeFi",
      image: "🏦"
    },
    {
      title: "NFT Marketplace",
      creator: "@bob",
      funded: 67,
      amount: "$8,150", 
      backers: 156,
      category: "NFT",
      image: "🎨"
    },
    {
      title: "Social Token Platform",
      creator: "@charlie",
      funded: 78,
      amount: "$3,200",
      backers: 72,
      category: "Social",
      image: "💬"
    },
    {
      title: "Gaming DAO Tools",
      creator: "@diana",
      funded: 45,
      amount: "$6,800",
      backers: 134,
      category: "Gaming",
      image: "🎮"
    },
    {
      title: "Climate Action App",
      creator: "@eco",
      funded: 89,
      amount: "$2,940",
      backers: 203,
      category: "Impact",
      image: "🌱"
    },
    {
      title: "Web3 Learning Hub",
      creator: "@teacher",
      funded: 56,
      amount: "$5,670",
      backers: 98,
      category: "Education",
      image: "📚"
    }
  ];

  return (
    <section className="py-20 px-4 bg-[var(--app-gray)]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[var(--app-foreground)] mb-4">
            Discover & Support Innovation
          </h2>
          <p className="text-xl text-[var(--app-foreground-muted)] max-w-2xl mx-auto">
            Browse active projects and talented creators in our tokenized marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={index} className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{project.image}</div>
                <div>
                  <h3 className="font-bold text-[var(--app-foreground)]">{project.title}</h3>
                  <p className="text-sm text-[var(--app-foreground-muted)]">{project.creator}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[var(--app-accent)]">{project.amount}</span>
                  <span className="px-2 py-1 bg-[var(--app-accent-light)] text-[var(--app-accent)] text-xs rounded-full">
                    {project.category}
                  </span>
                </div>
                
                <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
                  <div 
                    className="bg-[var(--app-accent)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.funded}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-[var(--app-foreground-muted)]">
                  <span>{project.backers} backers</span>
                  <span>{project.funded}% funded</span>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Project
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg">View All Projects</Button>
        </div>
      </div>
    </section>
  );
}

// AI Superpower Section Component
export function AISection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-hover)] text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <LandingIcon name="sparkles" size="xl" className="mx-auto mb-4" />
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            AI: Our Superpower
          </h2>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            Intelligent project matching, automated due diligence, and smart funding recommendations powered by advanced AI that understands what makes projects successful.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold mb-2">Smart Matching</h3>
            <p>AI connects projects with perfect collaborators and backers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold mb-2">Due Diligence</h3>
            <p>Automated analysis of project feasibility and success potential</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-bold mb-2">Recommendations</h3>
            <p>Personalized suggestions based on your interests and expertise</p>
          </div>
        </div>

        <Button variant="secondary" size="lg" className="bg-white text-[var(--app-accent)] hover:bg-gray-100">
          Experience AI Magic
        </Button>
      </div>
    </section>
  );
}

// How It Works Section Component
export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Follow",
      description: "Sigue @Like2Win en Farcaster para ser elegible",
      icon: "users" as const
    },
    {
      number: "02", 
      title: "Like",
      description: "Dale like a posts oficiales de @Like2Win",
      icon: "sparkles" as const
    },
    {
      number: "03",
      title: "Earn", 
      description: "Recibe tickets automáticamente por tu engagement",
      icon: "gift" as const
    },
    {
      number: "04",
      title: "Win",
      description: "Participa en sorteos bi-semanales de $DEGEN",
      icon: "trending" as const
    }
  ];

  return (
    <section className="py-20 px-4 bg-[var(--app-background)]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[var(--app-foreground)] mb-4">
            Cómo Funciona
          </h2>
          <p className="text-xl text-[var(--app-foreground-muted)] max-w-2xl mx-auto">
            De follow a premio en cuatro pasos simples
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="mb-6">
                <div className="text-6xl font-bold text-[var(--app-accent-light)] mb-4">
                  {step.number}
                </div>
                <div className="w-16 h-16 bg-[var(--app-accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LandingIcon name={step.icon} className="text-white" size="lg" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
                {step.title}
              </h3>
              <p className="text-[var(--app-foreground-muted)] leading-relaxed">
                {step.description}
              </p>
              
              {/* Arrow connector (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-4 text-[var(--app-accent-light)]">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section Component
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Qué es Like2Win?",
      answer: "Like2Win es una MiniApp de Farcaster que convierte tus likes en tickets para sorteos bi-semanales de $DEGEN. Solo sigue @Like2Win y dale like a posts oficiales."
    },
    {
      question: "¿Cómo funciona el sistema de tickets?",
      answer: "Con tip allowance: cada like = 1 ticket automático. Sin tip allowance: like + comment + recast = 1 ticket. Más engagement = más oportunidades de ganar."
    },
    {
      question: "¿Cuándo son los sorteos?",
      answer: "Los sorteos se realizan cada miércoles y domingo a las 8PM UTC. Los premios se distribuyen automáticamente: 60% al primer lugar, 30% al segundo, 10% al tercero."
    },
    {
      question: "¿Cómo empiezo a participar?",
      answer: "Es súper simple: 1) Sigue @Like2Win en Farcaster, 2) Dale like a posts oficiales de @Like2Win, 3) Recibe tickets automáticamente, 4) Participa en sorteos."
    },
    {
      question: "¿Hay costos o comisiones?",
      answer: "¡No! Like2Win es completamente gratis. No hay costos de participación, no necesitas wallet, no hay signup. Solo follow + like = participar."
    },
    {
      question: "¿Cómo se financian los premios?",
      answer: "Like2Win redistribuye el 90% de los tips recibidos como premios. Cuando el pool supera 5000 $DEGEN, el sistema se vuelve auto-sustentable."
    }
  ];

  return (
    <section className="py-20 px-4 bg-[var(--app-gray)]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[var(--app-foreground)] mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-[var(--app-foreground-muted)]">
            Todo lo que necesitas saber sobre Like2Win
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl border border-[var(--app-card-border)] overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[var(--app-accent-light)] transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-[var(--app-foreground)]">
                  {faq.question}
                </span>
                <LandingIcon 
                  name="chevron-down" 
                  className={`text-[var(--app-accent)] transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-[var(--app-foreground-muted)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section Component

export function FinalCTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[var(--app-background)] via-[var(--app-accent-light)] to-[var(--app-background)]">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold text-[var(--app-foreground)] leading-tight">
            ¿Listo para ganar $DEGEN?
          </h2>
          <p className="text-xl text-[var(--app-foreground-muted)] max-w-2xl mx-auto leading-relaxed">
            Únete a cientos de usuarios que ya están participando en los sorteos bi-semanales de Like2Win.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/miniapp" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🎲 Participar Ahora
            </a>
            <a 
              href="https://warpcast.com/like2win" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg border-2 border-[var(--app-accent)] text-[var(--app-accent)] hover:bg-[var(--app-accent-light)] transition-all duration-200"
            >
              💜 Follow @Like2Win
            </a>
          </div>

          <div className="pt-8 border-t border-[var(--app-card-border)]">
            <p className="text-sm text-[var(--app-foreground-muted)]">
              Zero friction • Sorteos 2x/semana • Premios reales en $DEGEN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Navigation Header Component
export function NavigationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-[var(--app-accent)]">Like2Win</div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/miniapp" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              Participar
            </a>
            <a href="https://warpcast.com/like2win" target="_blank" rel="noopener noreferrer" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              @Like2Win
            </a>
            <a href="#how-it-works" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              Cómo Funciona
            </a>
            <a href="#faq" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-[var(--app-foreground-muted)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Wallet className="z-10">
              <ConnectWallet className="px-4 py-2">
                <Name className="text-inherit" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--app-card-border)]">
            <nav className="flex flex-col space-y-4">
              <a 
                href="/verano" 
                className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                🌞 Únete al Bootcamp Web3
              </a>
              <a href="#projects" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors px-4 py-2">
                Projects
              </a>
              <a href="#creators" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors px-4 py-2">
                Creators
              </a>
              <a href="#how-it-works" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors px-4 py-2">
                How It Works
              </a>
              <a href="#about" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors px-4 py-2">
                About
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Footer Component
export function Footer() {
  return (
    <footer className="bg-[var(--app-foreground)] text-[var(--app-background)] py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-[var(--app-accent)]">Like2Win</div>
            <p className="text-gray-300 leading-relaxed">
              Donde cada like se convierte en una oportunidad real de ganar $DEGEN en Farcaster.
            </p>
            <div className="flex space-x-4">
              <a href="https://warpcast.com/like2win" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Farcaster</a>
              <a href="/miniapp" className="text-gray-300 hover:text-white transition-colors">MiniApp</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Participar</h3>
            <div className="space-y-2">
              <a href="/miniapp" className="block text-gray-300 hover:text-white transition-colors">Dashboard</a>
              <a href="https://warpcast.com/like2win" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-white transition-colors">Follow @Like2Win</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors">Cómo Funciona</a>
              <a href="#faq" className="block text-gray-300 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Información</h3>
            <div className="space-y-2">
              <Link href="/?view=frame-info" className="block text-gray-300 hover:text-white transition-colors">Farcaster Frame</Link>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">Estadísticas</a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">Leaderboard</a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">Ganadores</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Like2Win. Built on Base with ❤️ for the Farcaster community.
          </p>
        </div>
      </div>
    </footer>
  );
}