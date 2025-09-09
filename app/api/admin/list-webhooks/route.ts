import { NextRequest, NextResponse } from 'next/server';

/**
 * List all Neynar webhooks with their IDs to identify which ones to keep/delete
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Listing all Neynar webhooks with IDs...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    // List all webhooks from Neynar
    const response = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Failed to fetch webhooks from Neynar',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Analyze and categorize webhooks
    const webhooks = data.webhooks?.map((webhook: any) => {
      const isCorrect = webhook.url === 'https://like2win-miniappdeploy.vercel.app/api/webhooks/neynar' &&
                       webhook.subscription?.['cast.reaction.created'];
      
      const isLike2WinRelated = webhook.url?.includes('like2win') || 
                               webhook.url?.includes('like2win-miniappdeploy') ||
                               webhook.url?.includes('like2win-app');

      return {
        id: webhook.webhook_id,
        name: webhook.name || 'Unnamed',
        url: webhook.url,
        active: webhook.is_active,
        events: Object.keys(webhook.subscription || {}),
        created_at: webhook.created_at,
        analysis: {
          isCorrectWebhook: isCorrect,
          isLike2WinRelated: isLike2WinRelated,
          recommendation: isCorrect ? '✅ KEEP - This is the correct webhook' :
                         isLike2WinRelated ? '❌ DELETE - Like2Win related but wrong endpoint' :
                         '❓ REVIEW - Not Like2Win related'
        }
      };
    }) || [];

    // Find the correct webhook
    const correctWebhook = webhooks.find((w: any) => w.analysis.isCorrectWebhook);
    const like2winWebhooks = webhooks.filter((w: any) => w.analysis.isLike2WinRelated);
    const otherWebhooks = webhooks.filter((w: any) => !w.analysis.isLike2WinRelated);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: webhooks.length,
        correctWebhook: !!correctWebhook,
        like2winRelated: like2winWebhooks.length,
        others: otherWebhooks.length
      },
      correctWebhook: correctWebhook || null,
      recommendations: {
        keep: correctWebhook ? [correctWebhook.id] : [],
        delete: webhooks
          .filter((w: any) => !w.analysis.isCorrectWebhook)
          .map((w: any) => w.id)
      },
      allWebhooks: webhooks.sort((a: any, b: any) => {
        // Sort: correct webhook first, then Like2Win related, then others
        if (a.analysis.isCorrectWebhook) return -1;
        if (b.analysis.isCorrectWebhook) return 1;
        if (a.analysis.isLike2WinRelated && !b.analysis.isLike2WinRelated) return -1;
        if (b.analysis.isLike2WinRelated && !a.analysis.isLike2WinRelated) return 1;
        return 0;
      })
    });

  } catch (error) {
    console.error('❌ Error listing webhooks:', error);
    return NextResponse.json({
      error: 'Failed to list webhooks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}