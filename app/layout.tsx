import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jaren Lim — A Little Engineering Journey',
  description:
    'Explore Jaren Lim’s work in backend engineering, platform reliability, and applied AI aboard a cozy miniature woodland railway.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
