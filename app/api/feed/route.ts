import { NextResponse } from 'next/server';
import { getFeedProfiles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const feed = getFeedProfiles();
    return NextResponse.json({ success: true, count: feed.length, profiles: feed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
