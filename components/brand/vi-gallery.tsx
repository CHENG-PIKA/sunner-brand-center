'use client';

import { useEffect, useRef, useState } from 'react';
import VIApplicationGuides from './vi-application-guides';

const weights = [
  { name: 'Thin', value: 100 },
  { name: 'ExtraLight', value: 200 },
  { name: 'Light', value: 300 },
  { name: 'Normal', value: 400 },
  { name: 'Regular', value: 450 },
  { name: 'Medium', value: 500 },
  { name: 'DemiBold', value: 600 },
  { name: 'SemiBold', value: 650 },
  { name: 'Bold', value: 700 },
  { name: 'Heavy', value: 900 },
];

export default function VIGallery() {
  const gallery = useRef<HTMLDivElement>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  useEffect(() => {
    const sections = gallery.current?.querySelectorAll<HTMLElement>(':scope > section');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!sections || motion.matches || !('IntersectionObserver' in window)) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (motion.matches) return;
        animations.push(entry.target.animate([
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }));
      });
    }, { threshold: 0.12 });
    sections.forEach(section => observer.observe(section));
    const cancelMotion = () => { if (motion.matches) animations.forEach(animation => animation.cancel()); };
    motion.addEventListener('change', cancelMotion);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      motion.removeEventListener('change', cancelMotion);
    };
  }, []);

  return <div className="vi-gallery" ref={gallery}>
    <section className="vi-color-section" aria-label="圣农品牌标准色">
      <div className="vi-color-board">
        <header className="vi-section-heading vi-color-heading">
          <h2>圣农品牌标准色</h2>
          <p className="vi-pantone"><span>PANTONE</span><strong>368C</strong></p>
        </header>
        <div className="vi-color-channels">
          <div className="vi-color-value" aria-label="CMYK 色值" aria-describedby="vi-print-note"><span>C:60</span><span>M:6</span><span>Y:100</span><span>K:0</span></div>
          <div className="vi-color-value" aria-label="RGB 色值" aria-describedby="vi-digital-note"><span>R:113</span><span>G179</span><span>B:44</span></div>
        </div>
      </div>
      <div className="vi-color-notes">
        <p className="vi-reference-note" id="vi-print-note">印刷（需要供应商制作的）请按这个色值</p>
        <p className="vi-reference-note" id="vi-digital-note">线上（手机、电脑看的）请按这个色值</p>
      </div>
    </section>
    <section className="vi-font-panel" aria-labelledby="vi-font-title">
      <header className="vi-section-heading">
        <h2 id="vi-font-title">品牌标准字体</h2><span className="vi-font-family">MiSans</span>
      </header>
      <div className="vi-weight-display">
          <ol className="vi-weight-list" aria-label="MiSans 十个字重，从轻到重">
            {weights.map(weight => <li key={weight.value}>
              <button type="button" className="vi-weight-choice" aria-pressed={selectedWeight === weight.value} aria-label={`${weight.name} ${weight.value}`} onClick={() => setSelectedWeight(current => current === weight.value ? null : weight.value)}>
              <span className="vi-weight-sample" style={{fontWeight:weight.value}}>简体字</span>
              <span className="vi-weight-name">{weight.name}</span>
              <span className="vi-weight-value">{weight.value}</span>
              </button>
            </li>)}
          </ol>
      </div>
      <div className="vi-weight-annotation">
        <div className="vi-common-weights"><span aria-hidden="true" className="vi-weight-bracket"/><p className="vi-reference-note">常用字号，日常使用请使用这三个</p></div>
      </div>
    </section>
    <VIApplicationGuides/>
  </div>;
}
