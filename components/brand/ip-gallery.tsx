'use client';

import {useId, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Check} from 'lucide-react';
import IPModelViewer from './ip-model-viewer';
import type {KeyboardEvent} from 'react';

// Views and standard actions use the user's full-resolution transparent PNGs
// The illustration retains its approved reference viewport
const reference = './images/ip/sunner-ip-reference.jpg';
const views = [
  {name:'正视',file:'front-hd',width:1893,height:2048,yaw:0,pitch:0},
  {name:'斜视',file:'three-quarter-hd',width:1624,height:2048,yaw:45,pitch:0},
  {name:'侧视',file:'side-hd',width:1290,height:2048,yaw:90,pitch:0},
  {name:'背视',file:'back-hd',width:1846,height:2048,yaw:180,pitch:0},
  {name:'顶视',file:'top-hd',width:2000,height:1520,yaw:0,pitch:90},
  {name:'底视',file:'bottom-hd',width:2000,height:1570,yaw:0,pitch:-90},
];
const actions = [
  {name:'张开双翼',file:'front-hd',width:1893,height:2048},
  {name:'双手点赞',file:'actions/double-thumbs-up-hd',width:1733,height:2048},
  {name:'单手点赞',file:'actions/single-thumbs-up-hd',width:1514,height:2048},
  {name:'呼啦圈',file:'actions/hula-hoop-hd',width:1760,height:2048},
  {name:'侧面拥抱',file:'actions/side-hug-hd',width:1525,height:2048},
  {name:'指自己',file:'actions/point-to-self-hd',width:1559,height:2048},
];

function HDAction({action}:{action:typeof actions[number]}){
  return <img className="ip-original ip-hd-image" src={'./images/ip/'+action.file+'.png'} alt={'圣小农'+action.name} width={action.width} height={action.height} decoding="async" draggable={false}/>;
}

function OriginalIP({crop,label,className='',circular=false}:{crop:string;label:string;className?:string;circular?:boolean}){
  const clip=useId();
  const [x,y,width,height]=crop.split(' ').map(Number);
  return <svg className={'ip-original '+className} viewBox={crop} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
    <defs><clipPath id={clip}>{circular?<circle cx={x+width/2} cy={y+height/2} r={Math.min(width,height)/2-1}/>:<rect x={x} y={y} width={width} height={height}/>}</clipPath></defs>
    <image href={reference} width="1251" height="2048" clipPath={`url(#${clip})`}/>
  </svg>;
}

function HDView({index=0,className=''}:{index?:number;className?:string}){
  const item=views[index];
  return <img className={'ip-original ip-hd-image '+className} src={'./images/ip/'+item.file+'.png'} alt={'圣小农'+item.name} width={item.width} height={item.height} decoding="async" draggable={false}/>;
}

const wrap = (n:number,length:number)=>((n%length)+length)%length;

function CharacterViewer(){
 const [selected,setSelected]=useState<number|null>(0);
 const [pose,setPose]=useState({yaw:0,pitch:0,revision:0});
 const selectView=(index:number)=>{
  setSelected(index);setPose(previous=>({yaw:views[index].yaw,pitch:views[index].pitch,revision:previous.revision+1}));
 };
 return <section className="ip-reference-panel ip-identity" aria-labelledby="ip-identity-title">
  <div className="ip-identity-library">
   <header className="ip-section-heading"><h1 id="ip-identity-title">圣农标准IP-圣小农</h1></header>
   <div className="ip-views" role="group" aria-label="圣小农六视图">
    {views.map((item,index)=><button type="button" key={item.name} className={'ip-view-choice '+(index>3?'is-vertical':'')} aria-label={'查看'+item.name} aria-pressed={selected===index} onClick={()=>selectView(index)}><HDView index={index}/><span>{item.name}</span><i className="ip-view-indicator" aria-hidden="true"/></button>)}
   </div>
  </div>
  <IPModelViewer pose={pose} onRotate={()=>setSelected(null)} onReset={()=>selectView(0)}/>
 </section>;
}

const actionOffset=(index:number,current:number)=>{
  let offset=wrap(index-current,actions.length);
  if(offset>actions.length/2)offset-=actions.length;
  return offset;
};

function ActionCarousel(){
  const [current,setCurrent]=useState(0);
  const currentRef=useRef(0);
  const lastPoint=useRef<{x:number;y:number}|null>(null);
  const lastSelection=useRef<{x:number;time:number}|null>(null);
  const touch=useRef<{x:number;y:number}|null>(null);
  const swiped=useRef(false);
  const cards=useRef<Array<HTMLButtonElement|null>>([]);
  const select=(index:number,focus=false)=>{
    currentRef.current=wrap(index,actions.length);setCurrent(currentRef.current);
    if(focus)cards.current[currentRef.current]?.focus();
  };
  const step=(direction:number,focus=false)=>select(currentRef.current+direction,focus);
  const keyboard=(event:KeyboardEvent)=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowRight'?1:-1,true);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();select(event.key==='Home'?0:actions.length-1,true);}
  };

  return <section className="ip-reference-panel ip-actions" aria-labelledby="ip-actions-title" aria-roledescription="轮播">
    <header className="ip-section-heading"><h2 id="ip-actions-title">圣小农标准动作</h2></header>
    <div className="ip-action-navigator">
      <button type="button" className="ip-action-arrow previous" aria-label="上一个动作" onClick={()=>step(-1)}><ArrowLeft size={20} strokeWidth={1.6}/></button>
      <div className="ip-action-viewport"
        onPointerEnter={()=>{lastPoint.current=null;lastSelection.current=null;}}
        onPointerLeave={()=>{lastPoint.current=null;}}
        onPointerMove={event=>{
          if(event.pointerType!=='mouse')return;
          const previous=lastPoint.current;
          if(previous&&Math.hypot(event.clientX-previous.x,event.clientY-previous.y)<5)return;
          lastPoint.current={x:event.clientX,y:event.clientY};
          const target=(event.target as Element).closest<HTMLButtonElement>('[data-action-index]');
          if(!target)return;
          const index=Number(target.dataset.actionIndex),last=lastSelection.current,now=performance.now();
          if(index!==currentRef.current&&(!last||(now-last.time>480&&Math.abs(event.clientX-last.x)>25))){lastSelection.current={x:event.clientX,time:now};select(index);}
        }}
        onPointerDown={event=>{if(event.pointerType==='touch'){touch.current={x:event.clientX,y:event.clientY};swiped.current=false;event.currentTarget.setPointerCapture(event.pointerId);}}}
        onPointerUp={event=>{
          const start=touch.current;touch.current=null;
          if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
          if(!start)return;
          const dx=event.clientX-start.x,dy=event.clientY-start.y;
          if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){swiped.current=true;step(dx<0?1:-1);}
        }} onPointerCancel={()=>{touch.current=null;}}>
        <div className="ip-action-stage">
          {actions.map((action,index)=>{
            const offset=actionOffset(index,current),hidden=Math.abs(offset)>2;
            return <button key={action.name} ref={element=>{cards.current[index]=element;}} type="button" data-action-index={index} data-slot={offset} className={'ip-action-card '+(index===current?'is-active':'')} aria-label={action.name} aria-current={current===index?'true':undefined} aria-hidden={hidden} tabIndex={current===index?0:-1} onKeyDown={keyboard} onClick={()=>{if(swiped.current){swiped.current=false;return;}select(index);}}>
              <HDAction action={action}/>
            </button>;
          })}
        </div>
      </div>
      <button type="button" className="ip-action-arrow next" aria-label="下一个动作" onClick={()=>step(1)}><ArrowRight size={20} strokeWidth={1.6}/></button>
    </div>
    <div className="ip-action-thumbnails" role="group" aria-label="全部标准动作">
      {actions.map((action,index)=><button key={action.name} type="button" className="ip-action-thumbnail" aria-label={'查看'+action.name} aria-pressed={current===index} onClick={()=>select(index)}><HDAction action={action}/></button>)}
    </div>
    <span className="sr-only" aria-live="polite">{current+1} / {actions.length}，{actions[current].name}</span>
  </section>;
}

export default function IPGallery(){
  return <div className="ip-gallery">
    <CharacterViewer/>
    <section className="ip-reference-panel ip-styles" aria-labelledby="ip-styles-title">
      <header className="ip-section-heading"><h2 id="ip-styles-title">圣小农风格使用</h2></header>
      <div className="ip-style-pair">
        <figure><div className="ip-style-hd"><span className="ip-style-halo" aria-hidden="true"/><HDView className="ip-style-character"/><span className="ip-style-preferred"><Check aria-hidden="true" strokeWidth={2.5}/><span>优先使用</span></span></div><figcaption>立体风格</figcaption></figure>
        <figure><div className="ip-style-hd"><OriginalIP crop="680 740 337 337" label="圣小农插画风格" className="ip-style-illustration" circular/></div><figcaption>插画风格</figcaption></figure>
      </div>
    </section>
    <ActionCarousel/>
  </div>;
}
