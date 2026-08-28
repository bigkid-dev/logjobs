import './globals.css';
import { generateWebsiteSchema, generateOrganizationSchema, SITE_URL, DEFAULT_SEO } from '../lib/seo.js';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LogJobs — Direct Career Opportunities Across Nigeria & Global Remote Jobs',
    template: '%s | LogJobs'
  },
  description: DEFAULT_SEO.description,
  keywords: DEFAULT_SEO.keywords,
  authors: [{ name: 'LogJobs Career Platform', url: SITE_URL }],
  creator: 'LogJobs',
  publisher: 'LogJobs',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'LogJobs — Direct Career Opportunities Across Nigeria & Global Remote Jobs',
    description: 'Discover direct career opportunities across Lagos, Abuja, Port Harcourt, Ibadan, nationwide in Nigeria, and verified Global Remote teams. Apply with zero recruiter spam.',
    url: SITE_URL,
    siteName: 'LogJobs',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'LogJobs — Direct Career Opportunities'
      }
    ],
    locale: 'en_NG',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogJobs — Direct Career Opportunities Across Nigeria & Global Remote Jobs',
    description: 'Discover direct career opportunities across Lagos, Abuja, Port Harcourt, Ibadan, nationwide in Nigeria, and verified Global Remote teams. Apply with zero recruiter spam.',
    images: ['/logo.png'],
    creator: '@LogJobsBlog'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google8819b8d89819f0f5.html'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export default function RootLayout({ children }) {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Google Schema.org WebSite Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Google Schema.org Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
