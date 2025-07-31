import { NextRequest, NextResponse } from 'next/server';
import { raffleService } from '@/lib/services/raffle-service';

// POST /api/raffle/admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_raffle':
        const raffleId = await raffleService.createRaffle();
        return NextResponse.json({
          success: true,
          data: { raffleId },
          message: 'Raffle created successfully'
        });

      case 'execute_raffle':
        const { raffle_id } = body;
        if (!raffle_id) {
          return NextResponse.json(
            { error: 'raffle_id is required for execute_raffle action' },
            { status: 400 }
          );
        }
        
        const results = await raffleService.executeRaffle(raffle_id);
        return NextResponse.json({
          success: true,
          data: results,
          message: 'Raffle executed successfully'
        });

      case 'ensure_active':
        const activeRaffleId = await raffleService.ensureActiveRaffle();
        return NextResponse.json({
          success: true,
          data: { raffleId: activeRaffleId },
          message: 'Active raffle ensured'
        });

      case 'update_pool':
        const { raffle_id: poolRaffleId } = body;
        if (!poolRaffleId) {
          return NextResponse.json(
            { error: 'raffle_id is required for update_pool action' },
            { status: 400 }
          );
        }
        
        await raffleService.updateRafflePool(poolRaffleId);
        return NextResponse.json({
          success: true,
          message: 'Pool updated successfully'
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in raffle admin:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/raffle/admin - Get admin stats
export async function GET() {
  try {
    // This would typically require admin authentication
    // For MVP, we'll return basic stats
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'operational',
        message: 'Raffle system is running'
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}