'use client';

import { useState } from 'react';

export default function HistoricalLikesAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const loadHistoricalLikes = async (isDryRun: boolean = true) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/load-historical-likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: '2025-08-18T00:00:00.000Z',
          endDate: new Date().toISOString(),
          dryRun: isDryRun
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to load historical likes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const runDemo = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/demo-historical-likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: '2025-08-18T00:00:00.000Z',
          endDate: new Date().toISOString(),
          dryRun: false
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-800 mb-2">
              🎯 Historical Likes Loader
            </h1>
            <p className="text-amber-600">
              Load historical likes from existing Like2Win publications to populate the current raffle with tickets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
              <h2 className="text-xl font-semibold text-amber-800 mb-4">
                🎬 Demo Mode
              </h2>
              <p className="text-amber-700 mb-4">
                Test the functionality with real Like2Win casts but simulated like processing.
              </p>
              <button
                onClick={runDemo}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Running Demo...' : '🚀 Run Demo'}
              </button>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                🏭 Production Mode
              </h2>
              <p className="text-orange-700 mb-4">
                Load real historical likes and award actual tickets (requires database connection).
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => loadHistoricalLikes(true)}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Testing...' : '🧪 Dry Run Test'}
                </button>
                <button
                  onClick={() => loadHistoricalLikes(false)}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : '⚡ Load Real Likes'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold mb-4">
                {result.demo ? '🎬 Demo Results' : '✅ Results'}
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl font-bold text-amber-600">
                    {result.summary?.castsProcessed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Casts Processed</div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.summary?.totalLikes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Historical Likes</div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl font-bold text-green-600">
                    {result.summary?.ticketsAwarded || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tickets Awarded</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Summary:</h4>
                <p className="text-gray-700">{result.message}</p>
                {result.note && (
                  <p className="text-blue-600 mt-2 italic">{result.note}</p>
                )}
              </div>

              {result.casts && result.casts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Processed Casts:</h4>
                  <div className="space-y-2">
                    {result.casts.map((cast: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="font-mono text-xs text-gray-500 mb-1">
                          {cast.hash}
                        </div>
                        <div className="text-gray-800 mb-1">{cast.text}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(cast.timestamp).toLocaleDateString()} - 
                          {cast.mockLikes ? ` ${cast.mockLikes} likes (simulated)` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Processing Details ({result.results.length} items):
                  </h4>
                  <div className="max-h-64 overflow-y-auto">
                    {result.results.slice(0, 10).map((item: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border text-xs mb-2">
                        <div>User FID: {item.userFid}</div>
                        <div>Cast: {item.castHash}</div>
                        <div>Tickets: {item.ticketsAwarded}</div>
                        <div className={item.success ? 'text-green-600' : 'text-red-600'}>
                          {item.message}
                        </div>
                      </div>
                    ))}
                    {result.results.length > 10 && (
                      <div className="text-gray-500 text-center py-2">
                        ... and {result.results.length - 10} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}