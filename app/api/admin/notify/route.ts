import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple notification system for Like2Win events
 * Can be extended to send emails, Discord messages, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    console.log('🔔 Notification:', type, data);

    switch (type) {
      case 'raffle_winner':
        return await notifyRaffleWinner(data);
      case 'low_balance':
        return await notifyLowBalance(data);
      case 'scan_completed':
        return await notifyScanCompleted(data);
      case 'system_error':
        return await notifySystemError(data);
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Notification error:', error);
    return NextResponse.json(
      { error: 'Notification failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function notifyRaffleWinner(data: any) {
  // Log winner notification
  console.log('🏆 WINNER NOTIFICATION:');
  console.log(`   Winner: FID ${data.winnerFid}`);
  console.log(`   Tickets: ${data.tickets}`);
  console.log(`   Prize: ${data.prizeAmount} DEGEN`);
  console.log(`   TX: ${data.transactionHash}`);
  
  // Here you could send to Discord, email, etc.
  // Example Discord webhook:
  /*
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    await fetch(discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🎉 **Like2Win Winner!**\n👤 FID: ${data.winnerFid}\n🎫 Tickets: ${data.tickets}\n💰 Prize: ${data.prizeAmount} DEGEN\n🔗 TX: ${data.transactionHash}`
      })
    });
  }
  */

  return NextResponse.json({
    success: true,
    message: 'Winner notification sent',
    type: 'raffle_winner'
  });
}

async function notifyLowBalance(data: any) {
  console.log('⚠️ LOW BALANCE WARNING:');
  console.log(`   Current balance: ${data.balance} DEGEN`);
  console.log(`   Minimum required: ${data.minimumRequired} DEGEN`);
  console.log(`   Wallet: ${data.walletAddress}`);

  return NextResponse.json({
    success: true,
    message: 'Low balance notification sent',
    type: 'low_balance'
  });
}

async function notifyScanCompleted(data: any) {
  console.log('✅ SCAN COMPLETED:');
  console.log(`   Posts scanned: ${data.postsScanned}`);
  console.log(`   New likes: ${data.newLikes}`);
  console.log(`   New tickets: ${data.newTickets}`);
  console.log(`   Total participants: ${data.totalParticipants}`);

  return NextResponse.json({
    success: true,
    message: 'Scan completion notification sent',
    type: 'scan_completed'
  });
}

async function notifySystemError(data: any) {
  console.log('🚨 SYSTEM ERROR:');
  console.log(`   Error: ${data.error}`);
  console.log(`   Component: ${data.component}`);
  console.log(`   Time: ${data.timestamp}`);

  return NextResponse.json({
    success: true,
    message: 'System error notification sent',
    type: 'system_error'
  });
}

/**
 * GET endpoint to test notifications
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'test';

  const testData = {
    raffle_winner: {
      winnerFid: '123456',
      tickets: 5,
      prizeAmount: 1000,
      transactionHash: '0x123...abc'
    },
    low_balance: {
      balance: '500.5',
      minimumRequired: '1000',
      walletAddress: '0x959...993'
    },
    scan_completed: {
      postsScanned: 4,
      newLikes: 12,
      newTickets: 8,
      totalParticipants: 25
    },
    system_error: {
      error: 'Test error message',
      component: 'notification_test',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data: testData[type as keyof typeof testData] || { message: 'Test notification' }
      })
    });

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      type,
      result
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test notification failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}