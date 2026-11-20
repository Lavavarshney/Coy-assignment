import { NextRequest, NextResponse } from 'next/server';
import { sendMatchMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { matchId, text } = await req.json();
    if (!matchId || !text) {
      return NextResponse.json({ success: false, error: 'matchId and text are required' }, { status: 400 });
    }

    const message = sendMatchMessage(matchId, text);
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
