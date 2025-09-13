import { NextRequest, NextResponse } from 'next/server';

/**
 * Check webhook status in Neynar and list existing webhooks
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking webhook status in Neynar...');

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured'
      }, { status: 400 });
    }

    // 1. List existing webhooks
    console.log('📋 Fetching existing webhooks...');
    const listResponse = await fetch('https://api.neynar.com/v2/farcaster/webhook', {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    let webhooksList = null;
    let listError = null;
    
    if (listResponse.ok) {
      webhooksList = await listResponse.json();
      console.log('✅ Successfully fetched webhooks list');
    } else {
      listError = {
        status: listResponse.status,
        text: await listResponse.text()
      };
      console.log(`❌ Failed to fetch webhooks: ${listResponse.status}`);
    }

    // 2. Find Like2Win webhook
    let like2winWebhook = null;
    if (webhooksList?.webhooks) {
      like2winWebhook = webhooksList.webhooks.find((w: any) => 
        w.url?.includes('like2win-app.vercel.app') || 
        w.name?.toLowerCase().includes('like2win')
      );
    }

    // 3. Test our webhook endpoint
    console.log('🧪 Testing our webhook endpoint...');
    const webhookTestResponse = await fetch('https://like2win-app.vercel.app/api/webhooks/neynar', {
      method: 'GET'
    });

    let webhookTest = null;
    if (webhookTestResponse.ok) {
      webhookTest = await webhookTestResponse.json();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        neynarWebhooks: {
          success: !!webhooksList,
          error: listError,
          total: webhooksList?.webhooks?.length || 0,
          webhooks: webhooksList?.webhooks?.map((w: any) => ({
            id: w.webhook_id,
            name: w.name,
            url: w.url,
            active: w.is_active,
            created_at: w.created_at
          })) || []
        },
        like2winWebhook: like2winWebhook ? {
          found: true,
          id: like2winWebhook.webhook_id,
          name: like2winWebhook.name,
          url: like2winWebhook.url,
          active: like2winWebhook.is_active,
          subscription: like2winWebhook.subscription
        } : {
          found: false,
          message: 'No webhook found for Like2Win'
        },
        ourEndpoint: {
          accessible: webhookTestResponse.ok,
          status: webhookTestResponse.status,
          response: webhookTest
        }
      },
      analysis: {
        webhookConfigured: !!like2winWebhook,
        webhookActive: like2winWebhook?.is_active || false,
        endpointWorking: webhookTestResponse.ok,
        possibleIssues: []
      }
    });

  } catch (error) {
    console.error('❌ Error checking webhooks:', error);
    return NextResponse.json({
      error: 'Failed to check webhook status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}