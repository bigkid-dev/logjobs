import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && !apiKey.includes('placeholder') && !apiKey.includes('example')) {
    return new Resend(apiKey);
  }
  return null;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'LogJob.ng <onboarding@resend.dev>';

export async function sendWelcomeEmail({ to, name, role }) {
  const resend = getResendClient();
  const isHirer = role === 'hirer';

  const subject = `Welcome to LogJob.ng — ${isHirer ? 'Start Hiring Top Talent' : 'Find Remote & Nigerian Careers'}`;
  const html = `
    <div style="font-family: monospace, sans-serif; background: #050711; color: #EFEDE2; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #21262D; border-radius: 12px;">
      <div style="font-size: 20px; font-weight: bold; color: #10B981; margin-bottom: 20px;">
        LogJob<span style="color: #34D399;">.ng</span>
      </div>
      <h2 style="color: #EFEDE2; margin-bottom: 12px;">Hello ${name},</h2>
      <p style="color: #B7B5AA; font-size: 14px; line-height: 1.6;">
        Welcome to LogJob.ng. Your account as a <strong>${isHirer ? 'Hirer / Employer' : 'Professional / Job Seeker'}</strong> has been registered successfully.
      </p>
      ${isHirer ? `
        <div style="background: #0D1117; border: 1px solid #21262D; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #10B981; font-weight: bold; margin: 0 0 8px 0;">🚀 Ready to post your first role?</p>
          <p style="color: #B7B5AA; font-size: 13px; margin: 0;">Create a job listing, generate a sharable public link, and receive candidate resumes directly.</p>
        </div>
      ` : `
        <div style="background: #0D1117; border: 1px solid #21262D; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #34D399; font-weight: bold; margin: 0 0 8px 0;">🎯 Explore active opportunities</p>
          <p style="color: #B7B5AA; font-size: 13px; margin: 0;">Filter between Nigerian jobs and global remote roles matched to your exact career field.</p>
        </div>
      `}
      <p style="color: #7D7C72; font-size: 12px; margin-top: 30px; border-top: 1px solid #21262D; padding-top: 16px;">
        LogJob.ng — Remote & Regional Careers Aggregator & Hiring Studio
      </p>
    </div>
  `;

  if (!resend) {
    console.log(`[Resend Mock Email] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendApplicationConfirmationEmail({ to, candidateName, jobTitle, company }) {
  const resend = getResendClient();
  const subject = `Application Received: ${jobTitle} at ${company}`;
  const html = `
    <div style="font-family: monospace, sans-serif; background: #050711; color: #EFEDE2; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #21262D; border-radius: 12px;">
      <div style="font-size: 20px; font-weight: bold; color: #10B981; margin-bottom: 20px;">
        LogJob<span style="color: #34D399;">.ng</span>
      </div>
      <h2 style="color: #EFEDE2; margin-bottom: 12px;">Application Confirmed!</h2>
      <p style="color: #B7B5AA; font-size: 14px; line-height: 1.6;">
        Hi ${candidateName}, your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been successfully delivered to the hiring team.
      </p>
      <div style="background: #0D1117; border: 1px solid #21262D; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #34D399; font-size: 13px; margin: 0;">✓ Resume attached and screening questions submitted.</p>
        <p style="color: #B7B5AA; font-size: 12px; margin: 6px 0 0 0;">You can track this application in your LogJob dashboard under "My Jobs".</p>
      </div>
      <p style="color: #7D7C72; font-size: 12px; margin-top: 30px; border-top: 1px solid #21262D; padding-top: 16px;">
        Best of luck,<br/>The LogJob.ng Team
      </p>
    </div>
  `;

  if (!resend) {
    console.log(`[Resend Mock Email] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send application confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendNewApplicantAlertToHirer({
  to,
  hirerName,
  candidateName,
  jobTitle,
  candidateEmail,
  phone = '',
  linkedin = '',
  portfolio = '',
  coverNote = '',
  resumeData = '',
  resumeFilename = 'candidate-resume.pdf',
  customAnswers = [],
  viewUrl
}) {
  const resend = getResendClient();
  const subject = `[Application] ${jobTitle} — ${candidateName}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #06130F; color: #E6F4EA; padding: 40px 20px; max-width: 620px; margin: 0 auto; border: 1px solid #1D4036; border-radius: 16px;">
      <div style="font-size: 20px; font-weight: bold; color: #10B981; margin-bottom: 20px; letter-spacing: -0.5px;">
        LogJob<span style="color: #34D399;">.ng</span>
      </div>

      <div style="background: #0E241E; border: 1px solid #1D4036; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #34D399; display: block; margin-bottom: 6px;">New Direct Application</span>
        <h2 style="color: #FFFFFF; margin: 0 0 4px 0; font-size: 22px; font-weight: 700;">${candidateName}</h2>
        <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Applied for: <strong style="color: #E5E7EB;">${jobTitle}</strong></p>
      </div>

      <div style="background: #091A15; border: 1px solid #1D4036; padding: 20px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #10B981; margin: 0 0 12px 0;">Candidate Contact Details:</h3>
        <p style="margin: 4px 0; color: #D1D5DB;"><strong>Email:</strong> <a href="mailto:${candidateEmail}" style="color: #34D399; text-decoration: none;">${candidateEmail}</a></p>
        ${phone ? `<p style="margin: 4px 0; color: #D1D5DB;"><strong>Phone / WhatsApp:</strong> ${phone}</p>` : ''}
        ${linkedin ? `<p style="margin: 4px 0; color: #D1D5DB;"><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank" style="color: #34D399; text-decoration: none;">${linkedin}</a></p>` : ''}
        ${portfolio ? `<p style="margin: 4px 0; color: #D1D5DB;"><strong>Portfolio / Web:</strong> <a href="${portfolio}" target="_blank" style="color: #34D399; text-decoration: none;">${portfolio}</a></p>` : ''}
        ${coverNote ? `
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #1D4036;">
            <strong style="color: #E5E7EB; display: block; margin-bottom: 4px;">Candidate Note:</strong>
            <p style="color: #9CA3AF; margin: 0; font-style: italic;">"${coverNote}"</p>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${viewUrl}" style="display: inline-block; background: #045447; color: #FFFFFF; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 8px; font-size: 14px; border: 1px solid #059669;">
          Review Full Profile & CV on LogJob.ng →
        </a>
      </div>

      <p style="color: #6B7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #1D4036; padding-top: 16px; text-align: center;">
        💡 <strong>Tip:</strong> Simply reply to this email to contact <strong>${candidateName}</strong> directly.
      </p>
    </div>
  `;

  // Parse Base64 attachment if available
  const attachments = [];
  if (resumeData && resumeData.includes('base64,')) {
    try {
      const base64Content = resumeData.split('base64,')[1];
      if (base64Content) {
        attachments.push({
          filename: resumeFilename || 'candidate-resume.pdf',
          content: Buffer.from(base64Content, 'base64')
        });
      }
    } catch (e) {
      console.warn('Failed to parse resume attachment buffer:', e.message);
    }
  }

  if (!resend) {
    console.log(`[Resend Mock Email Dispatch] To: ${to} | Reply-To: ${candidateEmail} | Subject: ${subject} | Attachments: ${attachments.length}`);
    return { success: true, mocked: true };
  }

  try {
    const payload = {
      from: FROM_EMAIL,
      to,
      reply_to: candidateEmail,
      subject,
      html
    };

    if (attachments.length) {
      payload.attachments = attachments;
    }

    const data = await resend.emails.send(payload);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send hirer notification email:', error.message);
    return { success: false, error: error.message };
  }
}
