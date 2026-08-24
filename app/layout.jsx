import './globals.css';

export const metadata = {
  title: 'LogJobs — Career Opportunities in Lagos, Ogun, Ibadan, Abuja & Global Remote',
  description: 'LogJobs is Nigeria’s premier career platform. Discover direct job opportunities across Lagos, Ogun State, Ibadan, Abuja, and verified Global Remote roles.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
