"use client";

import { useState } from 'react';
import { 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo 
} from './Like2WinComponents';

interface DemoState {
  userFid: number;
  isFollowing: boolean;
  testCasts: Array<{
    hash: string;
    text: string;
    timestamp: string;
    engagement: {
      likes: number;
      recasts: number;
      replies: number;
    };
  }>;
}

export function EngagementDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    userFid: 12345,
    isFollowing: false,
    testCasts: [
      {
        hash: "0xdemo1",
        text: "🎫 ¡Nuevo sorteo bi-semanal de Like2Win! Follow + Like para participar. Con 🎩 DEGEN: solo like. Sin 🎩: like + recast + comment. ¡Good luck! 🚀",
        timestamp: new Date().toISOString(),
        engagement: { likes: 42, recasts: 18, replies: 7 }
      },
      {
        hash: "0xdemo2", 
        text: "⚡ ¡Último día para participar en el sorteo! Pool actual: 1,250 $DEGEN. Total participants: 89. 🏆",
        timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(),
        engagement: { likes: 28, recasts: 12, replies: 4 }
      },
      {
        hash: "0xdemo3",
        text: "🎉 ¡Felicitaciones a los ganadores del sorteo pasado! 🥇 @winner1: 750 $DEGEN 🥈 @winner2: 375 $DEGEN 🥉 @winner3: 125 $DEGEN",
        timestamp: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
        engagement: { likes: 156, recasts: 89, replies: 23 }
      }
    ]
  });

  const [processing, setProcessing] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: string }>({});

  const handleFollowToggle = () => {
    setDemoState(prev => ({ ...prev, isFollowing: !prev.isFollowing }));
    const newStatus = !demoState.isFollowing;
    if (newStatus) {
      setMessages(prev => ({ ...prev, follow: "✅ ¡Ahora sigues @Like2Win! Ya puedes participar en sorteos." }));
    } else {
      setMessages(prev => ({ ...prev, follow: "❌ Ya no sigues @Like2Win. Debes seguir para participar." }));
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages.follow;
        return newMessages;
      });
    }, 3000);
  };

  const handleEngagementTest = async (castHash: string) => {
    setProcessing(castHash);
    setMessages(prev => ({ ...prev, [castHash]: "🔄 Verificando engagement..." }));

    // Simulate API call
    setTimeout(() => {
      if (!demoState.isFollowing) {
        setMessages(prev => ({ ...prev, [castHash]: "❌ Debes seguir @Like2Win para participar" }));
      } else {
        // Simulate different engagement scenarios
        const scenarios = [
          "🎫 ¡Ticket ganado! Engagement completo detectado.",
          "⚠️ Falta: comment, recast (usuario sin tip allowance)",
          "⚠️ Falta: like (acción mínima requerida)",
          "✅ Engagement detectado, procesando ticket..."
        ];
        
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        setMessages(prev => ({ ...prev, [castHash]: randomScenario }));
      }
      
      setProcessing(null);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[castHash];
          return newMessages;
        });
      }, 5000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Demo Status */}
      <Like2WinCard variant="info">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🧪 Engagement System Demo
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Sistema funcionando con datos de demostración. 
            {demoState.isFollowing ? " ¡Ya puedes probar el engagement!" : " Primero sigue @Like2Win."}
          </p>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User FID:</strong> {demoState.userFid}
              </div>
              <div>
                <strong>Like2Win FID:</strong> 99999 (demo)
              </div>
              <div>
                <strong>API Status:</strong> ✅ Funcionando
              </div>
              <div>
                <strong>Database:</strong> ✅ Conectada
              </div>
            </div>
          </div>
        </div>
      </Like2WinCard>
      
      {/* Follow Status */}
      <Like2WinCard variant={demoState.isFollowing ? "success" : "warning"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Like2WinLogo size="sm" animated={false} />
            <div>
              <h3 className="font-semibold text-amber-800">
                Estado de Follow
              </h3>
              <p className="text-sm text-amber-700">
                {demoState.isFollowing ? '✅ Siguiendo @Like2Win' : '❌ Debes seguir @Like2Win'}
              </p>
            </div>
          </div>
          <Like2WinButton 
            variant={demoState.isFollowing ? "outline" : "gradient"}
            size="sm"
            onClick={handleFollowToggle}
          >
            {demoState.isFollowing ? 'Unfollow (Demo)' : 'Follow @Like2Win'}
          </Like2WinButton>
        </div>
        
        {messages.follow && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-blue-700 text-sm">{messages.follow}</p>
          </div>
        )}
      </Like2WinCard>

      {/* Demo Casts */}
      <Like2WinCard variant="gradient">
        <h3 className="text-xl font-semibold text-amber-800 mb-4">
          📋 Posts Oficiales de @Like2Win (Demo)
        </h3>
        
        <div className="space-y-4">
          {demoState.testCasts.map((cast) => {
            const message = messages[cast.hash];
            const isProcessing = processing === cast.hash;
            
            return (
              <div key={cast.hash} className="border border-amber-200 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L2W</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-amber-800">
                        Like2Win
                      </span>
                      <span className="text-amber-600 text-sm">
                        @like2win
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(cast.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      {cast.text}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-amber-600">
                      <span>👍 {cast.engagement.likes}</span>
                      <span>🔄 {cast.engagement.recasts}</span>
                      <span>💬 {cast.engagement.replies}</span>
                    </div>
                  </div>
                </div>
                
                {/* Message */}
                {message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                    <p className="text-blue-700 text-sm">{message}</p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Like2WinButton
                    variant="gradient"
                    size="sm"
                    onClick={() => handleEngagementTest(cast.hash)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Procesando...' : 'Test Engagement'}
                  </Like2WinButton>
                  
                  <Like2WinButton
                    variant="outline"
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
      </Like2WinCard>

      {/* System Status */}
      <Like2WinCard variant="info">
        <h4 className="font-semibold text-blue-800 mb-2">🔧 System Status</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <span className="font-medium">✅ Engagement Service:</span> Initialized
          </div>
          <div>
            <span className="font-medium">✅ API Endpoints:</span> Responsive
          </div>
          <div>
            <span className="font-medium">✅ Database:</span> Connected
          </div>
          <div>
            <span className="font-medium">⚠️ Neynar API:</span> Needs valid key
          </div>
          <div>
            <span className="font-medium">🎯 Ticket System:</span> Ready
          </div>
          <div>
            <span className="font-medium">🏆 Raffle Logic:</span> Implemented
          </div>
        </div>
      </Like2WinCard>

    </div>
  );
}