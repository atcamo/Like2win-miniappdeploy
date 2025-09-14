import { NextRequest, NextResponse } from 'next/server';

// Store webhook logs in memory (for debugging only)
const webhookLogs: Array<{
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  processed: boolean;
  result?: any;
}> = [];

// Keep only last 50 logs
function addLog(log: any) {
  webhookLogs.unshift(log);
  if (webhookLogs.length > 50) {
    webhookLogs.splice(50);
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalLogs: webhookLogs.length,
    logs: webhookLogs,
    summary: {
      lastHour: webhookLogs.filter(log =>
        Date.now() - new Date(log.timestamp).getTime() < 3600000
      ).length,
      lastMinute: webhookLogs.filter(log =>
        Date.now() - new Date(log.timestamp).getTime() < 60000
      ).length
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await request.json();

    addLog({
      timestamp: new Date().toISOString(),
      method: 'POST',
      headers,
      body,
      processed: false
    });

    return NextResponse.json({
      message: 'Debug log captured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to capture debug log',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Note: addLog and webhookLogs are available but not exported as Route fields
// They can be imported by other modules if needed