import { NextResponse } from 'next/server';
import { getMatches, resetDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const matches = getMatches();
    return NextResponse.json({ success: true, count: matches.length, matches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Secret / Evaluator Reset Endpoint:
 * Calling POST /api/matches?secret=coy_eval_reset will cleanly reset the backend database.
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== 'coy_eval_reset') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Clean database restored for evaluation'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
