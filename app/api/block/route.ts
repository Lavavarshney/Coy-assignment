import { NextRequest, NextResponse } from 'next/server';
import { silentlyBlockUser, ensureDbFile } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = ensureDbFile();
    return NextResponse.json({
      success: true,
      blockedUserIds: db.blockedUserIds || []
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json();
    if (!profileId) {
      return NextResponse.json({ success: false, error: 'profileId required' }, { status: 400 });
    }

    silentlyBlockUser(profileId);
    return NextResponse.json({
      success: true,
      message: 'User silently added to Ghost Shield registry'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
