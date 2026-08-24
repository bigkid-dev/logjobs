import { NextResponse } from 'next/server';
import { updateApplicationStatus } from '../../../../lib/db.js';
import { getSessionUser } from '../../../../lib/auth.js';

export async function PATCH(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateApplicationStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Update Application API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}
