'use client';

import { useState, useEffect } from 'react';
import { Like2WinCard, Like2WinButton, Like2WinBadge } from '@/app/components/Like2WinComponents';

interface RaffleData {
  id: string;
  weekPeriod: string;
  status: string;
  totalParticipants: number;
  totalTickets: number;
  totalPool: number;
  startDate: string;
  endDate: string;
}

interface ScanResult {
  postsScanned: number;
  newLikes: number;
  newTickets: number;
  totalParticipants: number;
  totalTickets: number;
}

interface WalletInfo {
  address: string;
  balance: {
    formatted: string;
    sufficient: boolean;
  };
  readyForDistribution: boolean;
}

export default function AdminNewDashboard() {
  const [currentRaffle, setCurrentRaffle] = useState<RaffleData | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load current raffle
      const raffleResponse = await fetch('/api/admin/create-raffle');
      if (raffleResponse.ok) {
        const raffleData = await raffleResponse.json();
        setCurrentRaffle(raffleData.activeRaffle);
      }

      // Load wallet info
      const walletResponse = await fetch('/api/admin/check-wallet');
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletInfo({
          address: walletData.wallet?.address,
          balance: walletData.wallet?.balance,
          readyForDistribution: walletData.readyForDistribution
        });
      }
      
      addLog('Dashboard data loaded');
    } catch (error) {
      addLog('Error loading dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRaffle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/create-raffle', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setCurrentRaffle(data.raffle);
        addLog(`✅ New raffle created: ${data.raffle.weekPeriod}`);
      } else {
        addLog(`❌ Failed to create raffle: ${data.error}`);
      }
    } catch (error) {
      addLog('❌ Error creating raffle');
    } finally {
      setLoading(false);
    }
  };

  const scanEngagement = async () => {
    setLoading(true);
    try {
      addLog('🔍 Starting engagement scan...');
      const response = await fetch('/api/admin/scan-engagement', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setLastScan(data.results);
        addLog(`✅ Scan completed: ${data.results.newLikes} new likes, ${data.results.newTickets} new tickets`);
        // Refresh raffle data
        loadDashboardData();
      } else {
        addLog(`❌ Scan failed: ${data.error}`);
      }
    } catch (error) {
      addLog('❌ Error scanning engagement');
    } finally {
      setLoading(false);
    }
  };

  const closeRaffle = async () => {
    if (!confirm('Are you sure you want to close the raffle and distribute the prize?')) {
      return;
    }

    setLoading(true);
    try {
      addLog('🎯 Closing raffle and selecting winner...');
      const response = await fetch('/api/admin/close-raffle', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        addLog(`🏆 Winner: FID ${data.winner.fid} (${data.winner.tickets} tickets)`);
        if (data.distribution.success) {
          addLog(`💰 ${data.winner.prizeAmount} DEGEN sent successfully!`);
          addLog(`🔗 TX: ${data.distribution.transactionHash.substring(0, 10)}...`);
        }
        // Refresh data
        loadDashboardData();
      } else {
        addLog(`❌ Failed to close raffle: ${data.error}`);
      }
    } catch (error) {
      addLog('❌ Error closing raffle');
    } finally {
      setLoading(false);
    }
  };

  const testCron = async () => {
    setLoading(true);
    try {
      addLog('🕐 Testing cron job...');
      const response = await fetch('/api/cron/scan-engagement', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ Cron test completed`);
        if (data.results) {
          addLog(`📊 Results: ${data.results.newLikes} new likes`);
        }
      } else {
        addLog(`❌ Cron test failed: ${data.error}`);
      }
    } catch (error) {
      addLog('❌ Error testing cron');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Like2Win Admin Dashboard</h1>
          <p className="text-amber-600">Manage raffles, scan engagement, and monitor distributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Raffle Status */}
          <Like2WinCard className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Current Raffle</h2>
            {currentRaffle ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{currentRaffle.weekPeriod}</span>
                  <Like2WinBadge variant={currentRaffle.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {currentRaffle.status}
                  </Like2WinBadge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-600">Participants</p>
                    <p className="text-2xl font-bold">{currentRaffle.totalParticipants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Total Tickets</p>
                    <p className="text-2xl font-bold">{currentRaffle.totalTickets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Prize Pool</p>
                    <p className="text-2xl font-bold">{currentRaffle.totalPool} DEGEN</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Period</p>
                    <p className="text-sm">{new Date(currentRaffle.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-amber-600">No active raffle</p>
            )}
          </Like2WinCard>

          {/* Wallet Status */}
          <Like2WinCard>
            <h2 className="text-xl font-bold text-amber-800 mb-4">Wallet Status</h2>
            {walletInfo ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-amber-600">Address</p>
                  <p className="text-xs font-mono">{walletInfo.address?.substring(0, 10)}...{walletInfo.address?.substring(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-600">Balance</p>
                  <p className="text-lg font-bold">{walletInfo.balance?.formatted}</p>
                </div>
                <Like2WinBadge variant={walletInfo.readyForDistribution ? 'success' : 'error'}>
                  {walletInfo.readyForDistribution ? 'Ready' : 'Not Ready'}
                </Like2WinBadge>
              </div>
            ) : (
              <p className="text-amber-600">Loading...</p>
            )}
          </Like2WinCard>

          {/* Actions */}
          <Like2WinCard>
            <h2 className="text-xl font-bold text-amber-800 mb-4">Actions</h2>
            <div className="space-y-3">
              <Like2WinButton 
                onClick={createRaffle}
                disabled={loading || !!currentRaffle}
                className="w-full"
              >
                Create New Raffle
              </Like2WinButton>
              
              <Like2WinButton 
                onClick={scanEngagement}
                disabled={loading || !currentRaffle}
                variant="secondary"
                className="w-full"
              >
                Scan Engagement
              </Like2WinButton>
              
              <Like2WinButton 
                onClick={closeRaffle}
                disabled={loading || !currentRaffle}
                variant="error"
                className="w-full"
              >
                Close Raffle & Distribute
              </Like2WinButton>

              <Like2WinButton 
                onClick={testCron}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Test Cron Job
              </Like2WinButton>
            </div>
          </Like2WinCard>

          {/* Last Scan Results */}
          <Like2WinCard>
            <h2 className="text-xl font-bold text-amber-800 mb-4">Last Scan</h2>
            {lastScan ? (
              <div className="space-y-2">
                <p><span className="font-semibold">Posts:</span> {lastScan.postsScanned}</p>
                <p><span className="font-semibold">New Likes:</span> {lastScan.newLikes}</p>
                <p><span className="font-semibold">New Tickets:</span> {lastScan.newTickets}</p>
                <p><span className="font-semibold">Total Participants:</span> {lastScan.totalParticipants}</p>
                <p><span className="font-semibold">Total Tickets:</span> {lastScan.totalTickets}</p>
              </div>
            ) : (
              <p className="text-amber-600">No recent scan</p>
            )}
          </Like2WinCard>

          {/* Activity Log */}
          <Like2WinCard className="lg:col-span-1">
            <h2 className="text-xl font-bold text-amber-800 mb-4">Activity Log</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {logs.length > 0 ? logs.map((log, index) => (
                <p key={index} className="text-xs text-amber-700 font-mono">{log}</p>
              )) : (
                <p className="text-amber-600">No recent activity</p>
              )}
            </div>
          </Like2WinCard>
        </div>

        {/* Status Bar */}
        <div className="mt-6 p-4 bg-amber-100 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-700">
              System Status: <span className="font-semibold">
                {walletInfo?.readyForDistribution ? '🟢 Operational' : '🟡 Limited'}
              </span>
            </p>
            <p className="text-sm text-amber-700">
              Auto-scan: <span className="font-semibold">Every 6 hours</span>
            </p>
            <Like2WinButton 
              onClick={loadDashboardData}
              disabled={loading}
              size="small"
              variant="secondary"
            >
              Refresh
            </Like2WinButton>
          </div>
        </div>
      </div>
    </div>
  );
}