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
  const [copied, setCopied] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  const copyColor = async (channel: 'CMYK' | 'RGB') => {
    try {
      await navigator.clipboard.writeText(channel === 'CMYK' ? 'C:60 M:6 Y:100 K:0' : 'R:113 G:179 B:44');
      setCopied(channel);
      setCopyStatus(`${channel} 色值已复制`);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {setCopied(null);setCopyStatus('');}, 1800);
    } catch {
      setCopyStatus('复制未成功，请手动复制色值');
    }
  };

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
          <button type="button" className="vi-color-value" data-copied={copied==='CMYK'} aria-label="复制 CMYK 色值" title={copied==='CMYK'?'已复制':'复制 CMYK 色值'} aria-describedby="vi-print-note" onClick={()=>copyColor('CMYK')}><span>C:60</span><span>M:6</span><span>Y:100</span><span>K:0</span></button>
          <button type="button" className="vi-color-value" data-copied={copied==='RGB'} aria-label="复制 RGB 色值" title={copied==='RGB'?'已复制':'复制 RGB 色值'} aria-describedby="vi-digital-note" onClick={()=>copyColor('RGB')}><span>R:113</span><span>G179</span><span>B:44</span></button>
        </div>
      </div>
      <div className="vi-color-notes">
        <p className="vi-reference-note" id="vi-print-note">印刷（需要供应商制作的）请按这个色值</p>
        <p className="vi-reference-note" id="vi-digital-note">线上（手机、电脑看的）请按这个色值</p>
      </div>
      <span className="sr-only" role="status">{copyStatus}</span>
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
