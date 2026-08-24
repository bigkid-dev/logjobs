import { NextResponse } from 'next/server';
import { getJobById, getUserById, createApplication } from '../../../../../lib/db.js';
import { getSessionUser } from '../../../../../lib/auth.js';
import { sendApplicationConfirmationEmail, sendNewApplicantAlertToHirer } from '../../../../../lib/email.js';

export async function POST(request, { params }) {
  try {
    const { id: jobId } = params;
    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    const body = await request.json();
    const {
      name,
      email,
      phone = '',
      linkedin = '',
      github = '',
      portfolio = '',
      resumeData = '',
      resumeFilename = '',
      resumeSize = 0,
      coverNote = '',
      customAnswers = []
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required to apply' },
        { status: 400 }
      );
    }

    // 5MB Limit Validation (5 * 1024 * 1024 = 5242880 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (resumeSize > MAX_SIZE) {
      return NextResponse.json(
        { error: 'CV file size exceeds the 5MB limit. Please upload a smaller file.' },
        { status: 400 }
      );
    }

    const application = await createApplication({
      jobId: job.id,
      applicantId: sessionUser ? sessionUser.id : null,
      name,
      email,
      phone,
      linkedin,
      github,
      portfolio,
      resumeData,
      resumeFilename,
      resumeSize,
      coverNote,
      customAnswers
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Send confirmation to applicant
    sendApplicationConfirmationEmail({
      to: email,
      candidateName: name,
      jobTitle: job.title,
      company: job.company
    }).catch(err => console.error('Confirmation email error:', err));

    // 2. Alert hirer with full candidate info, resume attachment & reply_to set to candidate
    if (job.hirer_id) {
      getUserById(job.hirer_id).then(hirer => {
        if (hirer && hirer.email) {
          sendNewApplicantAlertToHirer({
            to: hirer.email,
            hirerName: hirer.name,
            candidateName: name,
            jobTitle: job.title,
            candidateEmail: email,
            phone,
            linkedin,
            portfolio,
            coverNote,
            resumeData,
            resumeFilename,
            customAnswers,
            viewUrl: `${appUrl}/#my-jobs`
          }).catch(err => console.error('Hirer alert email error:', err));
        }
      });
    } else if (job.contact_email) {
      sendNewApplicantAlertToHirer({
        to: job.contact_email,
        hirerName: job.company,
        candidateName: name,
        jobTitle: job.title,
        candidateEmail: email,
        phone,
        linkedin,
        portfolio,
        coverNote,
        resumeData,
        resumeFilename,
        customAnswers,
        viewUrl: `${appUrl}/jobs/${job.id}`
      }).catch(err => console.error('Contact email dispatch error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId: application.id
    }, { status: 201 });
  } catch (error) {
    console.error('Job Apply API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
