import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIGNAL — Content Opportunity Intelligence',
  description: 'An applied ML prototype for ranking high-value moments from long-form media.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
