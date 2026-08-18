'use client';

import { useEffect, useState } from 'react';

export default function LaunchOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="launchOverlay" aria-label="SIGNAL — Content Opportunity Intelligence">
      <div className="launchGrid" aria-hidden="true" />
      <div className="launchGlow" aria-hidden="true" />
      <div className="launchLogoMark" aria-hidden="true">
        <img src="/signal-logo.svg" alt="" />
      </div>
      <div className="launchWord" aria-label="SIGNAL">
        {'SIGNAL'.split('').map((letter, i) => (
          <span key={`${letter}-${i}`} style={{ animationDelay: `${i * 125}ms` }}>
            {letter}
          </span>
        ))}
      </div>
      <div className="launchSub">CONTENT OPPORTUNITY INTELLIGENCE</div>
      <div className="launchLine" aria-hidden="true">
        <i />
        <span>READING THE SIGNAL</span>
        <b>●</b>
      </div>
    </div>
  );
}
