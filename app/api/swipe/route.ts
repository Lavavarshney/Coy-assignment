import { NextRequest, NextResponse } from 'next/server';
import { recordSwipe } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, action } = body;

    if (!profileId || !['like', 'pass'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: profileId and action ("like" | "pass") required' },
        { status: 400 }
      );
    }

    const { isMatch, profile } = recordSwipe(profileId, action);

    return NextResponse.json({
      success: true,
      action,
      isMatch,
      profile: isMatch ? profile : undefined // Only return profile details on mutual match
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
