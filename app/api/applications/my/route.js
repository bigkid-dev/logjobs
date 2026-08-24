import { NextResponse } from 'next/server';
import { getApplicationsByApplicantId } from '../../../../lib/db.js';
import { getSessionUser } from '../../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const applications = await getApplicationsByApplicantId(user.id, user.email);
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('My Applications API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch your applications' },
      { status: 500 }
    );
  }
}
