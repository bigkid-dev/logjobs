import { NextResponse } from 'next/server';
import { getJobById, getApplicationsByJobId } from '../../../../../lib/db.js';
import { getSessionUser } from '../../../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: jobId } = params;
    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.hirer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view applications for this job' }, { status: 403 });
    }

    const applications = await getApplicationsByJobId(job.id);
    return NextResponse.json({ applications, job });
  } catch (error) {
    console.error('Get Applications API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
