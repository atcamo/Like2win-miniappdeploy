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
    error: _error, // Renamed to avoid unused var error
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
  const [showAllCasts, setShowAllCasts] = useState(false);

  // Check follow status on mount
  useEffect(() => {
    if (userFid) {
      checkFollowStatus(userFid);
    }
  }, [userFid, checkFollowStatus]);

  // Load casts only when user is confirmed to be following
  useEffect(() => {
    if (isFollowing === true) {
      loadLike2WinCasts(2); // Limit to 2 posts initially
    }
  }, [isFollowing, loadLike2WinCasts]);

  // Auto-check engagement for all loaded casts
  useEffect(() => {
    if (casts.length > 0 && userFid) {
      // Check engagement for each cast automatically
      casts.forEach(cast => {
        // Only check if we haven't checked this cast yet
        if (!engagementStatus.has(cast.hash)) {
          checkCastEngagement(userFid, cast.hash);
        }
      });
    }
  }, [casts, userFid, checkCastEngagement, engagementStatus]);

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

  // Load more casts when user clicks "Ver más"
  const handleLoadMore = () => {
    if (showAllCasts) {
      // Redirect to Farcaster profile
      window.open('https://warpcast.com/like2win', '_blank');
    } else {
      // Load more casts
      setShowAllCasts(true);
      loadLike2WinCasts(10); // Load up to 10 casts
    }
  };

  if (false) { // Error display disabled for production
    return (
      <Like2WinCard variant="warning" className="text-center">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          ⚠️ Error de Engagement
        </h3>
        <p className="text-amber-700 text-sm mb-4">{_error}</p>
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
      
      {/* Follow Status - Hidden since it's now shown in main section */}
      {false && (
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
      )}

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
              onClick={() => loadLike2WinCasts(2)}
            >
              Reintentar
            </Like2WinButton>
          </div>
        ) : (
          <div className="space-y-4">
            {casts.slice(0, showAllCasts ? casts.length : 2).map((cast) => {
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
                        <div className="flex items-center gap-1">
                          <span>👍 {cast.engagement.likes}</span>
                          {status?.hasLiked && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🔄 {cast.engagement.recasts}</span>
                          {status?.hasRecasted && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💬 {cast.engagement.replies}</span>
                          {status?.hasCommented && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Status Indicator */}
                  {status && (status.isEligibleForTicket || status.requiresMoreActions.length > 0) && (
                    <div className="text-center mb-3">
                      {status.isEligibleForTicket ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          🎫 Elegible para ticket
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          ⚠️ Faltan: {status.requiresMoreActions.join(', ')}
                        </span>
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
                    {status?.isEligibleForTicket && (
                      <Like2WinButton
                        variant="gradient"
                        size="sm"
                        onClick={() => handleProcessEngagement(cast)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Procesando...' : '🎫 Reclamar Ticket'}
                      </Like2WinButton>
                    )}
                    
                    <Like2WinButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckEngagement(cast)}
                      disabled={isProcessing}
                    >
                      🔄 Refrescar
                    </Like2WinButton>
                    
                    <Like2WinButton
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://warpcast.com/like2win/${cast.hash}`, '_blank')}
                    >
                      👀 Ver Post
                    </Like2WinButton>
                  </div>
                </div>
              );
            })}
            
            {/* Ver más button */}
            {casts.length > 0 && (
              <div className="text-center pt-4 border-t border-amber-200">
                <Like2WinButton
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                >
                  {showAllCasts && casts.length > 2 ? 
                    '🔗 Ver perfil completo' : 
                    `Ver más posts (${casts.length > 2 ? casts.length - 2 : 'más'} disponibles)`
                  }
                </Like2WinButton>
                <p className="text-xs text-amber-600 mt-1">
                  {showAllCasts ? 
                    'Ir a @Like2Win en Farcaster' : 
                    ''
                  }
                </p>
              </div>
            )}
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