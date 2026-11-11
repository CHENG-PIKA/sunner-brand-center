'use client';

import {useState} from 'react';

// Match the reference's continuous safety field: equal outer margins, with
// both logo cutouts at the same height and 0.6X on each side of the divider.
const logoHeight = 258;
const logoWidth = logoHeight * 1421 / 852;
const logoLeft = 210;
const logoTop = 153;
const logoRight = logoLeft + logoWidth;
const logoBottom = logoTop + logoHeight;
const padding = 80;
const gap = logoHeight * 0.6;
const dividerWidth = logoHeight * 0.02;
const dividerHeight = logoHeight * 0.8;
const dividerLeft = logoRight + gap;
const dividerCenter = dividerLeft + dividerWidth / 2;
const dividerTop = logoTop + (logoHeight - dividerHeight) / 2;
const partnerLeft = dividerLeft + dividerWidth + gap;
const partnerWidth = 908;
const outerLeft = logoLeft - padding;
const outerTop = logoTop - padding;
const outerWidth = partnerLeft + partnerWidth + padding - outerLeft;
const outerHeight = logoHeight + padding * 2;
const rectanglePath = (x: number, y: number, width: number, height: number) =>
  `M${x} ${y}h${width}v${height}h${-width}Z`;
// One compound path makes every hatched area share exactly one animation.
const safetyField = [
  rectanglePath(outerLeft, outerTop, outerWidth, outerHeight),
  rectanglePath(logoLeft, logoTop, logoWidth, logoHeight),
  rectanglePath(partnerLeft, logoTop, partnerWidth, logoHeight),
].join(' ');

export default function JointLogoGuide(){
  const [active, setActive] = useState(false);

  return <section className="vi-logo-panel joint-logo-panel" aria-labelledby="joint-logo-title">
    <header className="vi-section-heading"><h2 id="joint-logo-title">LOGO联合标识使用规范</h2></header>
    <div>
      <div className="joint-logo-viewport">
      <button type="button" className="vi-safe-interactive joint-logo-diagram" aria-label="突出显示联合标识安全距离" aria-pressed={active} aria-describedby="joint-logo-note" onClick={()=>setActive(value=>!value)}>
        <svg viewBox="0 0 2048 520" role="img" aria-labelledby="joint-diagram-title joint-diagram-description">
          <title id="joint-diagram-title">圣农与朴朴超市联合标识</title>
          <desc id="joint-diagram-description">两标识高度均为X，间隔线左右安全距离各为0.6X，间隔线高度0.8X，宽度0.02X。</desc>
          <defs>
            <pattern id="joint-logo-hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="22" height="22" fill="#f6f7f5"/>
              <path d="M0 0V22" stroke="#e3e6df" strokeWidth="2"/>
            </pattern>
          </defs>
          <path d={safetyField} fillRule="evenodd" fill="url(#joint-logo-hatch)" stroke="#e3e6df" strokeWidth="2"/>
          <path className="vi-safe-highlight" d={safetyField} fillRule="evenodd"/>
          <path className="vi-safe-outline" d={safetyField}/>
          <rect x={logoLeft} y={logoTop} width={logoWidth} height={logoHeight} fill="#fcfdf9"/>
          <svg x={logoLeft} y={logoTop} width={logoWidth} height={logoHeight} viewBox="313 188 1421 852" preserveAspectRatio="xMidYMid meet">
            <image href="./images/logos/sunner-shield.png" width="2048" height="1228"/>
          </svg>
          <rect x={dividerLeft} y={dividerTop} width={dividerWidth} height={dividerHeight} fill="#71b32c"/>
          {/* Keep the exact partner artwork supplied by the user, framed without redrawing the logo. */}
          <svg x={partnerLeft} y={logoTop} width={partnerWidth} height={logoHeight} viewBox="944 353 908 258" preserveAspectRatio="xMidYMid meet" overflow="hidden">
            <image href="./images/logos/joint-logo-reference.png" width="2048" height="836"/>
          </svg>
          <g className="vi-safe-distance joint-distance-label" textAnchor="middle">
            {[logoRight + 24, dividerLeft + dividerWidth + gap / 2].map(x=><text key={x} x={x} y="214">{['安','全','距','离'].map((letter,index)=><tspan x={x} dy={index?47:0} key={letter}>{letter}</tspan>)}</text>)}
          </g>
          <g className="vi-safe-measure joint-measure-lines" fill="none" strokeWidth="1" strokeDasharray="3 5">
            <path d={`M${logoLeft} ${logoTop}H90V${logoBottom}H${logoLeft}`}/>
            <path d={`M${logoRight} ${logoTop}V42H${dividerLeft}V${logoTop}M${dividerLeft + dividerWidth} ${logoTop}V42H${partnerLeft}V${logoTop}`}/>
            <path d={`M${dividerLeft - 34} ${dividerTop}H${dividerLeft - 48}V${dividerTop + dividerHeight}H${dividerLeft - 34}`}/>
            <path d={`M${dividerCenter} ${dividerTop + dividerHeight + 10}V446`}/>
          </g>
          <g className="joint-measure-label" textAnchor="middle">
            <text x="62" y="294">X</text>
            <text x={logoRight + gap / 2} y="30">0.6X</text>
            <text x={dividerLeft + dividerWidth + gap / 2} y="30">0.6X</text>
            <text x={dividerLeft - 62} y="286" textAnchor="end" className="joint-divider-label">0.8X</text>
            <text x={dividerCenter} y="472" className="joint-divider-label">间隔线 0.02X</text>
          </g>
        </svg>
      </button>
      </div>
      <p id="joint-logo-note" className="vi-reference-note joint-logo-note">圣农LOGO高度X，联合LOGO与圣农高度持平</p>
    </div>
  </section>;
}
