import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { existsSync, readdirSync } = require('fs');
    const { join } = require('path');

    const dataPath = join(process.cwd(), 'data');

    const result = {
      dataDirectory: {
        exists: existsSync(dataPath),
        contents: [] as string[]
      },
      files: {
        userTickets: false,
        raffleData: false
      },
      redis: {
        urlAvailable: !!process.env.REDIS_URL,
        tokenAvailable: !!process.env.REDIS_TOKEN,
        urlPreview: process.env.REDIS_URL ? `${process.env.REDIS_URL.substring(0, 30)}...` : 'Not set'
      }
    };

    if (existsSync(dataPath)) {
      try {
        result.dataDirectory.contents = readdirSync(dataPath);
      } catch (error) {
        result.dataDirectory.contents = [`Error reading: ${error instanceof Error ? error.message : String(error)}`];
      }

      const userTicketsFile = join(dataPath, 'local-user-tickets.json');
      const raffleDataFile = join(dataPath, 'local-raffle-data.json');

      result.files.userTickets = existsSync(userTicketsFile);
      result.files.raffleData = existsSync(raffleDataFile);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        workingDir: process.cwd()
      },
      ...result
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}