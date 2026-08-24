import { NextResponse } from 'next/server';
import { getJobById, updateJob, deleteJob } from '../../../../lib/db.js';
import { getSessionUser } from '../../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableLink = `${appUrl}/jobs/${job.id}`;

    return NextResponse.json({
      job,
      shareableLink
    });
  } catch (error) {
    console.error('Get Job API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.hirer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this job' }, { status: 403 });
    }

    const updates = await request.json();
    const updated = await updateJob(id, updates);

    return NextResponse.json({ job: updated });
  } catch (error) {
    console.error('Update Job API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.hirer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this job' }, { status: 403 });
    }

    await deleteJob(id, user.id);
    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete Job API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete job' },
      { status: 500 }
    );
  }
}
