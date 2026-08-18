'use client';

import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem('signal-theme');
    if (saved === 'light') {
      setLight(true);
      document.documentElement.classList.add('signal-light');
    }
  }, []);
  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('signal-light', next);
    window.localStorage.setItem('signal-theme', next ? 'light' : 'dark');
  };
  return <button className={`themeToggle ${light ? 'isLight' : ''}`} onClick={toggle} aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'} title={light ? 'Switch to dark mode' : 'Switch to light mode'}><Lightbulb size={15} /><span>{light ? 'LIGHT' : 'DARK'}</span></button>;
}
