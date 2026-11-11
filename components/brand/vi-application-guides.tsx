'use client';

import { useState } from 'react';

type Mark = 'primary' | 'secondary';

function ClearSpaceDiagram({ mark }: { mark: Mark }) {
  const shield = mark === 'primary';
  const width = 318;
  const height = width * (shield ? 852 / 1421 : 640 / 1440);
  // Measure the original white lettering, not the flag's overall height
  const letterHeight = shield ? width * 537 / 1421 : height;
  const unit = letterHeight / 2;
  const left = (640 - width) / 2;
  const top = 60 + unit;
  const right = left + width;
  const bottom = top + height;
  const outerLeft = left - unit;
  const outerRight = right + unit;
  const outerTop = 60;
  const outerBottom = bottom + unit;
  const letterTop = shield ? top + width * 85 / 1421 : top;
  const letterLeft = shield ? left + width * 104 / 1421 : left;
  const patternId = `vi-safe-hatch-${mark}`;

  return <svg className="vi-safe-diagram" viewBox="0 0 640 420" role="img" aria-label={shield ? '带旗标底的圣农标识安全距离' : '纯文字圣农标识安全距离'}>
    <defs>
      <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="14" fill="#f5f5f3"/>
        <path d="M0 0V14" stroke="#e1e3de" strokeWidth="1.5"/>
      </pattern>
    </defs>
    <rect x={outerLeft} y={outerTop} width={width + unit * 2} height={height + unit * 2} fill={`url(#${patternId})`} stroke="#d9ddd4"/>
    <rect className="vi-safe-highlight" x={outerLeft} y={outerTop} width={width + unit * 2} height={height + unit * 2}/>
    <rect className="vi-safe-outline" x={outerLeft} y={outerTop} width={width + unit * 2} height={height + unit * 2}/>
    <rect x={left} y={top} width={width} height={height} fill="#fcfdf9" stroke="#d9ddd4"/>
    <svg x={left} y={top} width={width} height={height} viewBox={shield ? '313 188 1421 852' : '304 294 1440 640'} preserveAspectRatio="xMidYMid meet">
      <image href={shield ? './images/logos/sunner-shield.png' : './images/logos/sunner-wordmark.png'} width="2048" height="1228"/>
    </svg>
    <g className="vi-safe-distance" textAnchor="middle">
      <text x="329" y={outerTop + unit / 2 + 5}>安全距离</text>
      <text x="329" y={bottom + unit / 2 + 5}>安全距离</text>
    </g>
    <g fill="none" stroke="#bfc5ba" strokeWidth=".8" strokeDasharray="2 3">
      {[outerTop - 13, outerBottom + 13].map((y, index) => <path key={index} d={`M${outerLeft} ${index ? outerBottom : outerTop}V${y}H${left}V${index ? outerBottom : outerTop}M${right} ${index ? outerBottom : outerTop}V${y}H${outerRight}V${index ? outerBottom : outerTop}`}/>)}
      {[outerLeft - 13, outerRight + 13].map((x, index) => <path key={index} d={`M${index ? outerRight : outerLeft} ${outerTop}H${x}V${top}H${index ? outerRight : outerLeft}M${index ? outerRight : outerLeft} ${bottom}H${x}V${outerBottom}H${index ? outerRight : outerLeft}`}/>)}
    </g>
    <g className="vi-safe-unit" textAnchor="middle">
      {[outerLeft + unit / 2, right + unit / 2].map(x => <g key={x}><text x={x} y={outerTop - 20}>X</text><text x={x} y={outerBottom + 31}>X</text></g>)}
      {[outerLeft - 23, outerRight + 23].map(x => <g key={x}><text x={x} y={outerTop + unit / 2 + 5}>X</text><text x={x} y={bottom + unit / 2 + 5}>X</text></g>)}
    </g>
    <g className="vi-safe-measure" fill="none" strokeDasharray="2 4" strokeWidth="1">
      <path d={`M${letterLeft} ${letterTop}H${outerLeft - 23}V${letterTop + letterHeight}H${letterLeft}`}/>
      <path d={`M${outerLeft - 53} ${letterTop}H${outerLeft - 61}V${letterTop + unit}H${outerLeft - 53}`}/>
    </g>
    <g className="vi-safe-measure-label" textAnchor="end">
      <text x={outerLeft - 29} y={letterTop + letterHeight / 2 + 4}>2x</text>
      <text x={outerLeft - 67} y={letterTop + unit / 2 + 5}>X</text>
    </g>
  </svg>;
}

export default function VIApplicationGuides() {
  const [activeMark, setActiveMark] = useState<Mark | null>(null);
  return <section className="vi-logo-panel" aria-labelledby="vi-logo-title">
    <header className="vi-section-heading"><h2 id="vi-logo-title">LOGO使用规范</h2></header>
    <div className="vi-safe-diagrams">{(['primary', 'secondary'] as const).map(mark => <button type="button" className="vi-safe-interactive" key={mark} aria-pressed={activeMark === mark} aria-label={`突出显示${mark === 'primary' ? '主标' : '辅标'}安全距离`} onClick={() => setActiveMark(current => current === mark ? null : mark)}><ClearSpaceDiagram mark={mark}/></button>)}</div>
    <p className="vi-reference-note vi-safe-note">常用两LOGO安全距离X，为文字的一半</p>
  </section>;
}
