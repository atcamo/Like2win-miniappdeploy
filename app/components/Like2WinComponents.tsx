"use client";

import { type ReactNode, useCallback, useState } from "react";
import { HeartIcon, TrophyIcon, SparklesIcon } from "lucide-react";

type Like2WinButtonProps = {
  children: ReactNode;
  variant?: "gradient" | "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  id?: string;
  name?: string;
}

export function Like2WinButton({
  children,
  variant = "gradient",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  loading = false,
  icon,
  id,
  name,
}: Like2WinButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105";

  const variantClasses = {
    gradient:
      "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-2xl",
    primary:
      "bg-[var(--app-primary-amber)] hover:bg-[var(--app-accent-hover)] text-white shadow-lg",
    secondary:
      "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border border-amber-200/30 hover:border-amber-300/50 text-[var(--app-foreground)]",
    outline:
      "border-2 border-amber-500 hover:bg-amber-500 hover:text-white text-amber-600",
    ghost:
      "hover:bg-amber-100 text-amber-700 hover:text-amber-800",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-2 rounded-lg",
    md: "text-sm px-6 py-3 rounded-lg",
    lg: "text-base px-8 py-4 rounded-xl",
  };

  return (
    <button
      type="button"
      id={id}
      name={name || id}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={typeof children === 'string' ? children : 'Like2Win button'}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
      ) : (
        icon && <span className="flex items-center mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
}

type Like2WinCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "glassmorphism" | "gradient" | "success" | "warning" | "info";
}

export function Like2WinCard({
  title,
  children,
  className = "",
  onClick,
  variant = "glassmorphism",
}: Like2WinCardProps) {
  const variantClasses = {
    default:
      "bg-[var(--app-card-bg)] backdrop-blur-md border border-[var(--app-card-border)]",
    glassmorphism:
      "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border border-amber-200/30 dark:border-amber-700/30",
    gradient:
      "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700",
    success:
      "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700",
    warning:
      "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700",
    info:
      "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
  };

  return (
    <div
      className={`${variantClasses[variant]} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ${className} ${onClick ? "cursor-pointer hover:scale-105" : ""}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

type Like2WinLogoProps = {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function Like2WinLogo({ 
  size = "md", 
  animated = true, 
  className = "" 
}: Like2WinLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img 
        src="/logo.png" 
        alt="Like2Win Logo" 
        className={`${sizeClasses[size]} object-contain ${animated ? 'animate-pulse' : ''}`}
      />
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-20 animate-ping"></div>
      )}
    </div>
  );
}

type RaffleStatusCardProps = {
  userTickets: number;
  totalParticipants: number;
  prizePool: number;
  nextRaffleTime: string;
  userProbability?: number;
  lastWinners?: Array<{
    username?: string;
    displayName?: string;
    prize: number;
    position: number;
  }>;
}

export function RaffleStatusCard({
  userTickets,
  totalParticipants,
  prizePool,
  nextRaffleTime,
  userProbability = 0,
  lastWinners = [],
}: RaffleStatusCardProps) {
  return (
    <Like2WinCard variant="glassmorphism" className="text-center">
      <div className="flex items-center justify-center mb-4">
        <TrophyIcon className="text-amber-600 mr-2 w-6 h-6" />
        <span className="text-lg font-semibold text-[var(--app-foreground)]">
          🎫 LIKE2WIN
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-2xl font-bold text-amber-600">
            {userTickets}
          </div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Tus Tickets</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-600">
            {prizePool} $DEGEN
          </div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Prize Pool</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-lg font-semibold text-[var(--app-foreground)]">
            {totalParticipants}
          </div>
          <div className="text-xs text-[var(--app-foreground-muted)]">Participants</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-600">
            {userProbability.toFixed(1)}%
          </div>
          <div className="text-xs text-[var(--app-foreground-muted)]">Tu Probabilidad</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-[var(--app-foreground-muted)] mb-1">
          ⏰ Próximo Sorteo
        </div>
        <div className="text-lg font-semibold text-[var(--app-foreground)]">
          {nextRaffleTime}
        </div>
      </div>

      {lastWinners.length > 0 && (
        <div className="border-t border-amber-200/30 pt-4">
          <h4 className="text-sm font-semibold text-[var(--app-foreground)] mb-3">
            🏆 Últimos Ganadores
          </h4>
          <div className="space-y-1">
            {lastWinners.slice(0, 3).map((winner, index) => (
              <div key={winner.username} className="flex justify-between items-center text-xs">
                <span className="text-[var(--app-foreground-muted)]">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} @{winner.username}
                </span>
                <span className="font-semibold text-amber-600">
                  {winner.prize} $DEGEN
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Like2WinCard>
  );
}

type ParticipationButtonProps = {
  onParticipate: () => Promise<void>;
  isParticipating: boolean;
  userFid?: number;
  postHash: string;
  disabled?: boolean;
}

export function ParticipationButton({
  onParticipate,
  isParticipating,
  disabled = false,
}: ParticipationButtonProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleParticipate = useCallback(async () => {
    if (disabled || isParticipating) return;
    
    try {
      await onParticipate();
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    } catch (error) {
      console.error('Error participating:', error);
    }
  }, [onParticipate, disabled, isParticipating]);

  return (
    <div className="relative">
      <Like2WinButton
        variant="gradient"
        onClick={handleParticipate}
        loading={isParticipating}
        disabled={disabled}
        className="w-full"
        icon={showAnimation ? <SparklesIcon className="animate-sparkle" /> : <HeartIcon />}
      >
        {isParticipating ? 'Participating...' : 'Participate Now'}
      </Like2WinButton>
      
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-2xl animate-like-to-coin">
            ❤️ → 🪙
          </div>
        </div>
      )}
    </div>
  );
}

type LeaderboardProps = {
  participants: Array<{
    fid?: number;
    username?: string;
    displayName?: string;
    tickets: number;
    profilePicture?: string;
  }>;
  currentUserFid?: number;
}

export function Leaderboard({ participants, currentUserFid }: LeaderboardProps) {
  return (
    <Like2WinCard variant="glassmorphism">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--app-foreground)]">
          🏆 Leaderboard
        </h3>
      </div>
      
      <div className="space-y-3">
        {participants.slice(0, 10).map((user, index) => (
          <div 
            key={user.fid} 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              user.fid === currentUserFid 
                ? 'bg-gradient-to-r from-amber-200/50 to-yellow-200/50 border border-amber-300' 
                : 'bg-gradient-to-r from-amber-50/30 to-yellow-50/30'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                index === 0 ? 'bg-yellow-400 text-white' : 
                index === 1 ? 'bg-gray-300 text-gray-800' : 
                index === 2 ? 'bg-orange-400 text-white' : 'bg-amber-200 text-amber-800'
              }`}>
                <span className="text-sm font-bold">
                  {index + 1}
                </span>
              </div>
              <div>
                <div className="font-semibold text-[var(--app-foreground)] text-sm">
                  {user.displayName || 'Anonymous'}
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  @{user.username || 'unknown'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-amber-600">{user.tickets}</div>
              <div className="text-xs text-[var(--app-foreground-muted)]">tickets</div>
            </div>
          </div>
        ))}
      </div>
    </Like2WinCard>
  );
}

type MainTitleProps = {
  children: ReactNode;
  className?: string;
}

export function MainTitle({ children, className = "" }: MainTitleProps) {
  return (
    <h1 className={`text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </h1>
  );
}

type FallingAnimationProps = {
  emoji: string;
  duration?: number;
  delay?: number;
}

export function FallingAnimation({ 
  emoji, 
  duration = 3, 
  delay = 0 
}: FallingAnimationProps) {
  return (
    <div 
      className="falling-item fixed pointer-events-none text-2xl z-10"
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        left: `${Math.random() * 100}%`,
      }}
    >
      {emoji}
    </div>
  );
}

type ParticipationModeProps = {
  className?: string;
}

export function ParticipationModes({ className = "" }: ParticipationModeProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* DEGEN Tippers Mode */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">🎩</div>
          <div>
            <h3 className="text-lg font-bold text-amber-800">Con DEGEN</h3>
            <p className="text-sm text-amber-600">Para usuarios que hacen tips</p>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-6 border border-amber-200">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-amber-100 rounded-xl p-4 flex-1 text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm font-semibold text-amber-800">Follow @Like2Win</div>
              </div>
            </div>
            
            <div className="text-center text-amber-600 font-bold text-lg">+</div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="bg-amber-100 rounded-xl p-4 flex-1 text-center">
                <div className="text-2xl mb-2">❤️</div>
                <div className="text-sm font-semibold text-amber-800">Like Post</div>
              </div>
            </div>
            
            <div className="text-center pt-2 border-t border-amber-200">
              <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg font-bold px-6 py-2 rounded-full shadow-lg">
                = 1 Ticket 🎫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Regular Users Mode */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">👤</div>
          <div>
            <h3 className="text-lg font-bold text-blue-800">Sin DEGEN</h3>
            <p className="text-sm text-blue-600">Para usuarios normales</p>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-6 border border-blue-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-100 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">👤</div>
                <div className="text-xs font-semibold text-blue-800">Follow</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">❤️</div>
                <div className="text-xs font-semibold text-blue-800">Like</div>
              </div>
            </div>
            
            <div className="text-center text-blue-600 font-bold text-lg">+</div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-100 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">🔄</div>
                <div className="text-xs font-semibold text-blue-800">Recast</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">💬</div>
                <div className="text-xs font-semibold text-blue-800">Comment</div>
              </div>
            </div>
            
            <div className="text-center pt-2 border-t border-blue-200">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-bold px-6 py-2 rounded-full shadow-lg">
                = 1 Ticket 🎫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}