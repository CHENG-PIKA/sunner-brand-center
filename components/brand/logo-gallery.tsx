'use client';

import {useEffect, useRef, useState} from 'react';
import type {LogoScene} from '@/lib/showcase';

export function LogoArtwork({scene, guides=false}:{scene:LogoScene;guides?:boolean}){
  return <div className={'logo-artwork scene-'+scene.backdrop+(guides?' with-guides':'')}>
    {scene.backdrop==='image'&&<img className="scene-photo" src="./images/brand-space-v2.png" alt=""/>}
    <span className="scene-shade"/>
    <div className="mark-boundary"><img className="sunner-mark" src="./images/sunner-white.png" alt="圣农白色标识" draggable={false}/>{guides&&<><span className="guide-label">独立留白区域</span><i className="guide-corner top-left"/><i className="guide-corner top-right"/><i className="guide-corner bottom-left"/><i className="guide-corner bottom-right"/></>}</div>
  </div>
}

type Artwork = {file: string; label: string; width: number; height: number; viewBox: string};

const standardLogos: Artwork[] = [
  {file:'sunner-shield',label:'带旗标底的圣农标识',width:2048,height:1228,viewBox:'313 188 1421 852'},
  {file:'sunner-wordmark',label:'纯文字的圣农标识',width:2048,height:1228,viewBox:'304 294 1440 640'},
];
const colorLogos = [
  {file:'sunner-green',label:'绿底白字',width:2048,height:900,viewBox:'86 63 1876 652',color:'green',background:'绿色',mark:'白色'},
  {file:'sunner-red',label:'红底金字',width:2048,height:900,viewBox:'87 63 1876 652',color:'red',background:'红色',mark:'金色'},
  {file:'sunner-gold',label:'金底白字',width:2048,height:900,viewBox:'86 63 1876 652',color:'gold',background:'金色',mark:'白色'},
];
const companyLogos: Artwork[] = [
  {file:'sunner-group',label:'圣农集团',width:2047,height:722,viewBox:'165 173 1724 377'},
  {file:'sunner-development',label:'圣农发展',width:2047,height:722,viewBox:'158 173 1732 377'},
  {file:'sunner-food',label:'圣农食品',width:2047,height:722,viewBox:'160 173 1728 377'},
];

function OriginalLogo({logo,fill=false}:{logo:Artwork;fill?:boolean}){
  return <svg className="logo-reference-image" viewBox={logo.viewBox} role="img" aria-label={logo.label} preserveAspectRatio={fill?'xMidYMid slice':'xMidYMid meet'}>
    <image href={'./images/logos/'+logo.file+'.png'} width={logo.width} height={logo.height}/>
  </svg>;
}

export default function LogoGallery(){
  const gallery = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string|null>(null);

  useEffect(()=>{
    const root = gallery.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!root || motion.matches || !('IntersectionObserver' in window)) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if(motion.matches) return;
        entry.target.querySelectorAll('.logo-reference-reveal').forEach((item,index)=>{
          animations.push(item.animate([
            {opacity:0,transform:'translateY(14px)'},
            {opacity:1,transform:'translateY(0)'},
          ],{duration:620,delay:index*80,easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'}));
        });
      });
    },{threshold:.18});
    root.querySelectorAll('[data-logo-section]').forEach(section=>observer.observe(section));
    const cancelMotion=()=>{if(motion.matches) animations.forEach(animation=>animation.cancel());};
    motion.addEventListener('change',cancelMotion);
    return ()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());motion.removeEventListener('change',cancelMotion);};
  },[]);

  const select=(file:string)=>setSelected(current=>current===file?null:file);

  return <div className="logo-reference-gallery" ref={gallery}>
    <section className="logo-standard-section" aria-labelledby="standard-logo-title" data-logo-section>
      <div className="logo-reference-panel">
        <header className="logo-reference-heading"><h1 id="standard-logo-title">圣农标准LOGO</h1></header>
        <div className="logo-standard-grid">
          {standardLogos.map(logo=><div key={logo.file} className="logo-reference-reveal">
            <button type="button" className="logo-reference-preview logo-standard-preview" aria-label={logo.label} aria-pressed={selected===logo.file} aria-describedby={logo.file==='sunner-shield'?'logo-priority-note':undefined} onClick={()=>select(logo.file)}><OriginalLogo logo={logo}/></button>
          </div>)}
        </div>
      </div>
      <div className="logo-priority-row"><p id="logo-priority-note" className="logo-reference-note logo-priority-note">优先使用旗帜标</p></div>
    </section>
    <section className="logo-reference-panel" aria-labelledby="color-logo-title" data-logo-section>
      <header className="logo-reference-heading"><h2 id="color-logo-title">其他情况下LOGO用法</h2></header>
      <div className="logo-color-grid">
        {colorLogos.map(logo=><figure key={logo.file} className="logo-color-figure logo-reference-reveal">
          <button type="button" className={'logo-reference-preview logo-color-preview logo-background-'+logo.color} aria-label={logo.label} aria-pressed={selected===logo.file} aria-describedby={'note-'+logo.file} onClick={()=>select(logo.file)}><OriginalLogo logo={logo} fill/></button>
          <figcaption id={'note-'+logo.file} className="logo-reference-note">背景色为{logo.background}的情况下<br/>应用圣农纯文字{logo.mark}标识</figcaption>
        </figure>)}
      </div>
    </section>
    <section className="logo-reference-panel" aria-labelledby="company-logo-title" data-logo-section>
      <header className="logo-reference-heading"><h2 id="company-logo-title">其他LOGO</h2></header>
      <div className="logo-company-grid">
        {companyLogos.map(logo=><div key={logo.file} className="logo-reference-reveal">
          <button type="button" className="logo-reference-preview logo-company-preview" aria-label={logo.label} aria-pressed={selected===logo.file} onClick={()=>select(logo.file)}><OriginalLogo logo={logo}/></button>
        </div>)}
      </div>
    </section>
  </div>;
}
