import { NextRequest, NextResponse } from 'next/server';
import { rewindLastSwipe } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const result = await rewindLastSwipe();
    if (!result.success || !result.unswipedProfile) {
      return NextResponse.json({ success: false, message: 'No swipe history to rewind' }, { status: 400 });
    }

    const { hasLikedUser, ...safeProfile } = result.unswipedProfile;
    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
