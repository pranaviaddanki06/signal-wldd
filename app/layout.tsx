import type { Metadata } from 'next';
import './globals.css';
import './visual.css';
import './interactive.css';
import './immersive.css';
import './real-images.css';
import './launch.css';
import './final-touchups.css';

export const metadata: Metadata = {
  title: 'SIGNAL — Content Opportunity Intelligence',
  description: 'An applied ML prototype for ranking high-value content opportunities.',
  icons: { icon: '/signal-logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
