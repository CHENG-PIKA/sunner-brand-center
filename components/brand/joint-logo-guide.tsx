'use client';

import {useState} from 'react';

export default function JointLogoGuide(){
  const [active, setActive] = useState(false);

  return <section className="logo-reference-panel joint-logo-panel" aria-labelledby="joint-logo-title" data-logo-section>
    <header className="logo-reference-heading"><h2 id="joint-logo-title">LOGO联合标识使用规范</h2></header>
    <div className="logo-reference-reveal">
      <div className="joint-logo-viewport">
      <button type="button" className="joint-logo-diagram" aria-label="突出显示联合标识安全距离" aria-pressed={active} aria-describedby="joint-logo-note" onClick={()=>setActive(value=>!value)}>
        <svg viewBox="0 0 1800 480" role="img" aria-labelledby="joint-diagram-title joint-diagram-description">
          <title id="joint-diagram-title">圣农与朴朴超市联合标识</title>
          <desc id="joint-diagram-description">两标识高度均为X，间隔线左右安全距离各为0.6X，间隔线高度0.8X，宽度0.02X。</desc>
          <defs>
            <pattern id="joint-logo-hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="22" height="22" fill="#f6f7f5"/>
              <path d="M0 0V22" stroke="#e3e6df" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect x="85" y="75" width="1640" height="380" fill="url(#joint-logo-hatch)" stroke="#e3e6df" strokeWidth="2"/>
          <g className="joint-safe-highlight">
            <rect x="535" y="75" width="144" height="380"/>
            <rect x="683.8" y="75" width="144" height="380"/>
          </g>
          <rect x="135" y="145" width="400" height="240" fill="#fcfdf9"/>
          <svg x="135" y="145" width="400" height="240" viewBox="313 188 1421 852" preserveAspectRatio="xMidYMid meet">
            <image href="./images/logos/sunner-shield.png" width="2048" height="1228"/>
          </svg>
          <rect x="679" y="169" width="4.8" height="192" fill="#71b32c"/>
          {/* Keep the exact partner artwork supplied by the user, framed without redrawing the logo. */}
          <svg x="827.8" y="145" width="844.8" height="240" viewBox="944 353 908 258" preserveAspectRatio="xMidYMid meet" overflow="hidden">
            <image href="./images/logos/joint-logo-reference.png" width="2048" height="836"/>
          </svg>
          <g className="joint-distance-label" textAnchor="middle">
            {[555,755].map(x=><text key={x} x={x} y="204">{['安','全','距','离'].map((letter,index)=><tspan x={x} dy={index?44:0} key={letter}>{letter}</tspan>)}</text>)}
          </g>
          <g className="joint-measure-lines" fill="none" strokeWidth="1.6" strokeDasharray="3 5">
            <path d="M135 145H48V385H135"/>
            <path d="M535 145V44H679V145M683.8 145V44H827.8V145"/>
            <path d="M652 169H640V361H652"/>
            <path d="M681.4 371V414"/>
          </g>
          <g className="joint-measure-label" textAnchor="middle">
            <text x="25" y="274">X</text>
            <text x="607" y="30">0.6X</text>
            <text x="756" y="30">0.6X</text>
            <text x="630" y="274" textAnchor="end" className="joint-divider-label">0.8X</text>
            <text x="681.4" y="439" className="joint-divider-label">间隔线 0.02X</text>
          </g>
        </svg>
      </button>
      </div>
      <p id="joint-logo-note" className="logo-reference-note joint-logo-note">圣农LOGO高度X，联合LOGO与圣农高度持平</p>
    </div>
  </section>;
}
