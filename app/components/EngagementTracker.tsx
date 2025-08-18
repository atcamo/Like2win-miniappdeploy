"use client";

import { useState, useEffect } from 'react';
import { useEngagement, Like2WinCast } from '@/lib/hooks/useEngagement';
import { 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo 
} from './Like2WinComponents';

interface EngagementTrackerProps {
  userFid: number;
}

export function EngagementTracker({ userFid }: EngagementTrackerProps) {
  const {
    isLoading,
    error,
    isFollowing,
    casts,
    engagementStatus,
    checkFollowStatus,
    checkCastEngagement,
    processEngagement,
    loadLike2WinCasts
  } = useEngagement();

  // const [selectedCast, setSelectedCast] = useState<Like2WinCast | null>(null);
  const [processingCast, setProcessingCast] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: string }>({});

  // Check follow status on mount
  useEffect(() => {
    if (userFid) {
      checkFollowStatus(userFid);
    }
  }, [userFid, checkFollowStatus]);

  // Process engagement for a cast
  const handleProcessEngagement = async (cast: Like2WinCast) => {
    setProcessingCast(cast.hash);
    setMessages(prev => ({ ...prev, [cast.hash]: 'Procesando...' }));

    try {
      const result = await processEngagement(userFid, cast.hash);
      
      let message = result.message;
      if (result.ticketAwarded) {
        message = '🎫 ¡Ticket ganado! ' + message;
      }
      
      setMessages(prev => ({ ...prev, [cast.hash]: message }));
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[cast.hash];
          return newMessages;
        });
      }, 5000);

    } catch (error) {
      setMessages(prev => ({ 
        ...prev, 
        [cast.hash]: 'Error procesando engagement' 
      }));
    } finally {
      setProcessingCast(null);
    }
  };

  // Check engagement status for a cast
  const handleCheckEngagement = async (cast: Like2WinCast) => {
    await checkCastEngagement(userFid, cast.hash);
  };

  if (error && false) { // Temporarily disable error display
    return (
      <Like2WinCard variant="warning" className="text-center">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          ⚠️ Error de Engagement
        </h3>
        <p className="text-amber-700 text-sm mb-4">{error}</p>
        <Like2WinButton 
          variant="gradient" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Like2WinButton>
      </Like2WinCard>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Follow Status */}
      <Like2WinCard variant={isFollowing ? "success" : "warning"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Like2WinLogo size="sm" animated={false} />
            <div>
              <h3 className="font-semibold text-amber-800">
                Estado de Follow
              </h3>
              <p className="text-sm text-amber-700">
                {isFollowing === null ? 'Verificando...' :
                 isFollowing ? '✅ Siguiendo @Like2Win' : 
                 '❌ Debes seguir @Like2Win'}
              </p>
            </div>
          </div>
          {!isFollowing && (
            <Like2WinButton 
              variant="gradient"
              size="sm"
              onClick={() => window.open('https://warpcast.com/like2win', '_blank')}
            >
              Follow
            </Like2WinButton>
          )}
        </div>
      </Like2WinCard>

      {/* Casts List */}
      <Like2WinCard variant="gradient">
        <h3 className="text-xl font-semibold text-amber-800 mb-4">
          📋 Posts Oficiales de @Like2Win
        </h3>
        
        {isLoading && casts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando posts...</p>
          </div>
        ) : casts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-700 mb-4">
              No hay posts disponibles o el servicio no está configurado.
            </p>
            <Like2WinButton 
              variant="outline" 
              onClick={() => loadLike2WinCasts()}
            >
              Reintentar
            </Like2WinButton>
          </div>
        ) : (
          <div className="space-y-4">
            {casts.slice(0, 5).map((cast) => {
              const status = engagementStatus.get(cast.hash);
              const message = messages[cast.hash];
              const isProcessing = processingCast === cast.hash;
              
              return (
                <div key={cast.hash} className="border border-amber-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3 mb-3">
                    <img 
                      src={cast.author.pfp} 
                      alt={cast.author.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-amber-800">
                          {cast.author.displayName}
                        </span>
                        <span className="text-amber-600 text-sm">
                          @{cast.author.username}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {cast.text.length > 200 ? 
                         `${cast.text.substring(0, 200)}...` : 
                         cast.text}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-amber-600">
                        <span>👍 {cast.engagement.likes}</span>
                        <span>🔄 {cast.engagement.recasts}</span>
                        <span>💬 {cast.engagement.replies}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Engagement Status */}
                  {status && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={status.hasLiked ? "text-green-600" : "text-gray-400"}>
                            {status.hasLiked ? "✅" : "⭕"} Like
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={status.hasCommented ? "text-green-600" : "text-gray-400"}>
                            {status.hasCommented ? "✅" : "⭕"} Comment
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={status.hasRecasted ? "text-green-600" : "text-gray-400"}>
                            {status.hasRecasted ? "✅" : "⭕"} Recast
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={status.hasTipAllowance ? "text-green-600" : "text-gray-400"}>
                            {status.hasTipAllowance ? "✅" : "⭕"} Tip Allowance
                          </span>
                        </div>
                      </div>
                      
                      {status.requiresMoreActions.length > 0 && (
                        <p className="text-amber-700 text-sm mt-2">
                          <strong>Acciones requeridas:</strong> {status.requiresMoreActions.join(', ')}
                        </p>
                      )}
                      
                      {status.isEligibleForTicket && (
                        <p className="text-green-700 text-sm mt-2 font-semibold">
                          🎫 ¡Elegible para ticket!
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Message */}
                  {message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                      <p className="text-blue-700 text-sm">{message}</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Like2WinButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckEngagement(cast)}
                      disabled={isProcessing}
                    >
                      Verificar Engagement
                    </Like2WinButton>
                    
                    {isFollowing && (
                      <Like2WinButton
                        variant="gradient"
                        size="sm"
                        onClick={() => handleProcessEngagement(cast)}
                        disabled={isProcessing || !isFollowing}
                      >
                        {isProcessing ? 'Procesando...' : 'Procesar Ticket'}
                      </Like2WinButton>
                    )}
                    
                    <Like2WinButton
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://warpcast.com/like2win/${cast.hash}`, '_blank')}
                    >
                      Ver en Farcaster
                    </Like2WinButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Like2WinCard>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Like2WinCard variant="info">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Debug Info</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>User FID: {userFid}</p>
            <p>Following: {String(isFollowing)}</p>
            <p>Casts loaded: {casts.length}</p>
            <p>Engagement status entries: {engagementStatus.size}</p>
          </div>
        </Like2WinCard>
      )}
    </div>
  );
}