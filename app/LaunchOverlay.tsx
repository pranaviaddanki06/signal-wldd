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
    <div className="launchOverlay" aria-label="SIGNAL loading">
      <div className="launchGrid" />
      <div className="launchGlow" />
      <div className="launchLogoMark">S</div>
      <div className="launchWord" aria-label="SIGNAL">
        {'SIGNAL'.split('').map((letter, i) => <span key={letter} style={{ animationDelay: `${i * 120}ms` }}>{letter}</span>)}
      </div>
      <div className="launchSub">CONTENT OPPORTUNITY INTELLIGENCE</div>
      <div className="launchLine"><i /><span>INITIALIZING SIGNAL</span><b>●</b></div>
    </div>
  );
}
