"use client";

import { useState, useEffect } from 'react';
import { useEngagement, Like2WinCast } from '@/lib/hooks/useEngagement';
import { useRaffleStatus } from '@/lib/hooks/useRaffleStatus';
import { 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo 
} from './Like2WinComponents';
import { RaffleCountdown } from './RaffleCountdown';

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
  
  // Get user's current tickets count
  const { data: raffleData } = useRaffleStatus(userFid);
  
  // Log raffleData changes
  useEffect(() => {
    console.log('🎯 EngagementTracker: raffleData updated:', {
      hasData: !!raffleData,
      userTickets: raffleData?.user?.currentTickets,
      userFid: raffleData?.user?.fid,
      raffleTotalTickets: raffleData?.raffle?.totalTickets,
      fullRaffleData: raffleData ? JSON.stringify(raffleData, null, 2) : 'null'
    });
  }, [raffleData]);

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

  // Auto-check engagement and automatically process tickets for eligible casts
  useEffect(() => {
    console.log('🎯 AUTO-CHECK EFFECT TRIGGERED:', {
      castsLength: casts.length, 
      userFid, 
      engagementStatusSize: engagementStatus.size
    });
    
    if (casts.length > 0 && userFid) {
      console.log('✅ AUTO-CHECK CONDITIONS MET - Starting engagement checks...');
      
      // Check engagement for each cast automatically
      casts.forEach(async (cast, index) => {
        console.log(`📋 Cast ${index + 1}/${casts.length}: ${cast.hash}`);
        
        // Only check if we haven't checked this cast yet
        if (!engagementStatus.has(cast.hash)) {
          console.log(`🔄 Checking engagement for cast ${cast.hash}`);
          
          try {
            const status = await checkCastEngagement(userFid, cast.hash);
            
            // Automatically process engagement if eligible
            if (status.isEligibleForTicket) {
              console.log(`🎫 Auto-processing ticket for cast ${cast.hash}`);
              await processEngagement(userFid, cast.hash);
              
              // Show success message briefly
              setMessages(prev => ({ ...prev, [cast.hash]: '🎫 ¡Ticket automático ganado!' }));
              setTimeout(() => {
                setMessages(prev => {
                  const newMessages = { ...prev };
                  delete newMessages[cast.hash];
                  return newMessages;
                });
              }, 3000);
            }
          } catch (error) {
            console.error(`Error processing cast ${cast.hash}:`, error);
          }
        } else {
          console.log(`✅ Already checked cast ${cast.hash}`);
        }
      });
    } else {
      console.log('❌ AUTO-CHECK CONDITIONS NOT MET:', {
        noCasts: casts.length === 0,
        noUserFid: !userFid
      });
    }
  }, [casts, userFid, checkCastEngagement, engagementStatus, processEngagement]);

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
                <div 
                  key={cast.hash} 
                  className="border border-amber-200 rounded-lg p-4 bg-white hover:bg-amber-50 transition-colors cursor-pointer"
                  onClick={() => window.open(`https://warpcast.com/like2win/${cast.hash}`, '_blank')}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <img 
                        src={cast.author.pfp} 
                        alt={cast.author.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      {/* Show current tickets count - always show if data exists */}
                      {(() => {
                        const shouldShow = raffleData?.user && typeof raffleData.user.currentTickets !== 'undefined';
                        const ticketsValue = raffleData?.user?.currentTickets;
                        console.log('🎫 EngagementTracker: Ticket display check:', {
                          shouldShow,
                          ticketsValue,
                          hasUser: !!raffleData?.user,
                          ticketsType: typeof ticketsValue
                        });
                        
                        return shouldShow && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                            {(ticketsValue ?? 0) > 99 ? '99+' : (ticketsValue ?? 0).toString()}
                          </div>
                        );
                      })()}
                    </div>
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
                  
                  {/* Automatic Processing Status Indicator */}
                  {status && (status.isEligibleForTicket || status.requiresMoreActions.length > 0) && (
                    <div className="text-center mb-3">
                      {status.isEligibleForTicket ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ✨ Procesando automáticamente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          📝 Necesitas: {status.requiresMoreActions.join(', ')}
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
                  
                  {/* Automatic ticket processing - no manual buttons needed */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      💡 Haz click para ver el post original
                    </div>
                    
                    {/* Refresh button only - prevent click propagation */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Like2WinButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCheckEngagement(cast)}
                        disabled={isProcessing}
                      >
                        🔄
                      </Like2WinButton>
                    </div>
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

      {/* Raffle Countdown */}
      {raffleData?.raffle && (
        <Like2WinCard variant="warning">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              ⏰ Tiempo Restante del Sorteo
            </h3>
            <RaffleCountdown endDate={raffleData.raffle.endDate} />
            <p className="text-sm text-amber-700 mt-2">
              Período: {raffleData.raffle.weekPeriod}
            </p>
          </div>
        </Like2WinCard>
      )}

      {/* Tickets Counter Card - Visible Display */}
      {(() => {
        const shouldShow = !!raffleData?.user;
        const ticketsCount = raffleData?.user?.currentTickets;
        console.log('🎫 EngagementTracker: Main counter display:', {
          shouldShow,
          ticketsCount,
          raffleDataExists: !!raffleData,
          userExists: !!raffleData?.user
        });
        
        return shouldShow && (
          <Like2WinCard variant="success">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎫 Tus Tickets Actuales
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {ticketsCount ?? 0}
              </div>
              <p className="text-sm text-green-700">
                Tickets para el sorteo actual
              </p>
            </div>
          </Like2WinCard>
        );
      })()}

      {/* How to Participate */}
      <Like2WinCard variant="warning">
        <h4 className="font-semibold text-amber-800 mb-2">🎯 Cómo Participar</h4>
        <div className="text-amber-700 space-y-2">
          <p>• <strong>Sigue</strong> @Like2Win en Farcaster</p>
          <p>• <strong>Dale like</strong> a los posts oficiales durante el periodo de rifa</p>
          <p>• <strong>Gana tickets</strong> automáticamente por cada like</p>
          <p>• <strong>Participa</strong> en el sorteo diario de $DEGEN</p>
        </div>
      </Like2WinCard>
    </div>
  );
}