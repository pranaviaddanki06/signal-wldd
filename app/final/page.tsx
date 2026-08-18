'use client';
import { useState } from 'react';
import Home from '../page';
import LaunchOverlay from '../LaunchOverlay';
import ThemeToggle from '../ThemeToggle';
import './polish.css';
export default function FinalExperience(){
  const [intro,setIntro]=useState(true);
  const open=(target:'analyze'|'strategy')=>{
    setIntro(false);
    window.setTimeout(()=>{
      const buttons=Array.from(document.querySelectorAll('.topbar nav button')) as HTMLButtonElement[];
      const b=buttons.find(x=>x.textContent?.trim()===target.toUpperCase());
      b?.click();
      window.scrollTo({top:0,behavior:'smooth'});
    },50);
  };
  return <><LaunchOverlay/><ThemeToggle/><div className={`introShell ${intro?'show':''}`} aria-hidden={!intro}>
    <div className="introNoise"/><div className="introContent"><div className="introMark">S</div><div className="introKicker">CONTENT OPPORTUNITY INTELLIGENCE</div><h1>SIGNAL</h1><p>Turn content ideas into explainable, model-backed decisions before they reach the feed.</p><div className="introRule"><span>INPUT</span><i/><span>SIGNAL</span><i/><span>DECISION</span></div><div className="introActions"><button onClick={()=>open('analyze')}>START ANALYSIS <span>→</span></button><button onClick={()=>open('strategy')}>BUILD A CONTENT PLAN <span>↗</span></button></div></div>
  </div><Home/></>;
}
