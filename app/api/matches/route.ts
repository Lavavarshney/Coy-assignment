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
