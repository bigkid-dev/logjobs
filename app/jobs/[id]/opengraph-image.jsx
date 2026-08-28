import { ImageResponse } from 'next/og';
import { getJobById } from '../../../lib/db.js';
import { getMatchingCorporateImage } from '../../../lib/corporateImages.js';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
  let job = null;
  try {
    job = await getJobById(params.id);
  } catch (err) {
    console.error('OG Image fetch error:', err);
  }

  const title = job ? job.title : 'Career Opportunity';
  const company = job ? (job.is_anonymous ? 'Confidential Employer' : (job.company || 'Direct Employer')) : 'LogJobs';
  const location = job ? (job.location || 'Remote') : 'Nigeria & Worldwide';
  const workplace = job ? (job.workplace_type || 'Remote') : 'Remote';
  const jobType = job ? (job.job_type || 'Full Time') : 'Full Time';
  const category = job?.stacks?.[0] || 'Career Opening';
  const salary = job?.salary || '';
  const description = job?.description
    ? job.description.replace(/\s+/g, ' ').slice(0, 130) + '...'
    : 'Discover direct career opportunities on LogJobs across Nigeria and Global Remote roles.';

  const bgImage = getMatchingCorporateImage(job);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: '#0F172A',
        }}
      >
        {/* Background Corporate Image */}
        <img
          src={bgImage}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Dark subtle overlay for contrast */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
        />

        {/* White Background Card Overlay */}
        <div
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '1080px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderRadius: '24px',
            padding: '36px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#045447',
                  color: '#FFFFFF',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                LOGJOBS
              </div>
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#045447',
                  border: '1px solid #A7F3D0',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                DIRECT HIRING
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F1F5F9',
                color: '#334155',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          </div>

          {/* Job Title */}
          <div
            style={{
              fontSize: title.length > 35 ? '32px' : '38px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>

          {/* Company & Meta Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '17px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '14px',
            }}
          >
            <span style={{ color: '#045447', fontWeight: 800 }}>{company}</span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span>📍 {location}</span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span>🏢 {workplace}</span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span>⏱️ {jobType}</span>
          </div>

          {/* Role Description Snippet */}
          <div
            style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.45,
              marginBottom: '20px',
            }}
          >
            {description}
          </div>

          {/* Footer Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
              width: '100%',
            }}
          >
            <div>
              {salary ? (
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#045447',
                    border: '1px solid #A7F3D0',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  💰 {salary}
                </div>
              ) : (
                <div
                  style={{
                    color: '#059669',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  ✓ Direct Candidate Applications Open
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: '#045447',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Apply on logjobs.blog →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
