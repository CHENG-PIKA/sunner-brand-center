'use client';
import {useRef, useState} from 'react';
import type {CSSProperties, MouseEvent} from 'react';

const collections = [
 {id:'logo', title:'LOGO展示', summary:'标准标识与不同背景下的应用', image:'logo-card.png', href:'#logo'},
 {id:'vi', title:'VI应用', summary:'品牌标准色、字体与安全距离', image:'vi-card.png', href:'#vi'},
 {id:'ip', title:'IP形象', summary:'圣小农多角度展示、风格与标准动作', image:'ip-card.png', href:'#ip'},
 {id:'pr', title:'品牌公关部', summary:'品牌力量中心2.0', image:'pr-card.png', href:'https://shengnong.feishu.cn/wiki/Dw4mw0XA5iJu64kF8rxc0ddEnBe?from=from_copylink'},
];

// Separate layers let the real cards sit inside the glass.
function FolderBack(){
 return <svg viewBox="0 0 440 326" aria-hidden="true">
  <defs>
   <linearGradient id="folder-back-fill" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#d9f0ff"/><stop offset=".48" stopColor="#78d8f6"/><stop offset="1" stopColor="#20bfeb"/></linearGradient>
   <linearGradient id="folder-back-edge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff"/><stop offset=".45" stopColor="#8bcef0"/><stop offset="1" stopColor="#0b9fe6"/></linearGradient>
  </defs>
  <path d="M29 43 C55 43 53 4 83 4 H161 C187 4 186 40 215 40 H405 Q435 40 435 72 V291 Q435 321 405 321 H34 Q5 321 5 291 V76 Q5 43 29 43Z" fill="url(#folder-back-fill)" stroke="url(#folder-back-edge)" strokeWidth="2"/>
  <path d="M30 49 C59 49 57 10 84 10 H159 C183 10 183 46 215 46 H403 Q429 46 429 74 V289 Q429 315 403 315 H36 Q11 315 11 289 V77 Q11 49 30 49Z" fill="none" stroke="#ffffff" strokeOpacity=".42" strokeWidth="1"/>
 </svg>;
}

function FolderFront(){
 return <>
  <span className="folder-glass"/>
  <svg viewBox="0 0 452 278" aria-hidden="true">
   <defs>
    <linearGradient id="folder-front-fill" x1=".12" y1="0" x2=".8" y2="1"><stop stopColor="#e4f8ff" stopOpacity=".44"/><stop offset=".43" stopColor="#67d7f2" stopOpacity=".3"/><stop offset="1" stopColor="#108bf0" stopOpacity=".56"/></linearGradient>
    <linearGradient id="folder-front-edge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b6ecff"/><stop offset=".35" stopColor="#1eabd9"/><stop offset=".63" stopColor="#38d4fa"/><stop offset="1" stopColor="#0b7fdb"/></linearGradient>
    <linearGradient id="folder-front-light" x1="0" y1="0" x2=".5" y2="1"><stop stopColor="#ffffff" stopOpacity=".92"/><stop offset=".5" stopColor="#b8eeff" stopOpacity=".22"/><stop offset="1" stopColor="#c6f4ff" stopOpacity=".63"/></linearGradient>
   </defs>
   <path d="M34 57 H202 C238 57 242 5 278 5 H416 Q446 5 446 36 L439 243 Q438 271 407 271 H40 Q12 271 11 243 L6 88 Q5 57 34 57Z" fill="url(#folder-front-fill)" stroke="url(#folder-front-edge)" strokeWidth="2.5"/>
   <path d="M35 62 H202 C241 62 246 10 279 10 H414 Q440 10 440 37 L433 242 Q432 265 406 265 H41 Q18 265 17 242 L12 89 Q11 62 35 62Z" fill="none" stroke="url(#folder-front-light)" strokeWidth="2"/>
  </svg>
 </>;
}

export default function BrandHome({go}:{go:(id:string)=>void}){
 const [open,setOpen]=useState(false);
 const [hovered,setHovered]=useState(false);
 const [active,setActive]=useState<number|null>(null);
 const folderButton=useRef<HTMLButtonElement>(null);
 const pointerType=useRef('');
 const expanded=open||hovered;
 const activate=(event:MouseEvent<HTMLAnchorElement>,index:number)=>{
  // A first touch previews a card, a second touch follows its link.
  if(pointerType.current==='touch'&&(!expanded||active!==index)){
   event.preventDefault();setOpen(true);setActive(index);return;
  }
  if(collections[index].id!=='pr'){event.preventDefault();go(collections[index].id);}
 };
 return <section className="brand-folder-hero" aria-label="品牌应用文件夹">
  <h1 className="home-sr-only">圣农品牌应用中心</h1>
  <div className="welcome-backdrop" aria-hidden="true"><img src="./images/home/welcome-air.png" alt="" draggable={false}/></div>
  <div className={'folder-stage'+(expanded?' is-expanded':'')}
   onPointerLeave={event=>{if(event.pointerType==='mouse'){setHovered(false);setActive(null);}}}
   onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null)){setOpen(false);setActive(null);}}}
   onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);setHovered(false);setActive(null);folderButton.current?.focus();}}}>
   <div className="folder-assembly">
    <div className="folder-back"><FolderBack/></div>
    <button ref={folderButton} className="folder-front" aria-label={expanded?'收起品牌应用文件夹':'展开品牌应用文件夹'} aria-expanded={expanded} aria-controls="folder-collections"
     onPointerDown={event=>{pointerType.current=event.pointerType;}}
     onPointerEnter={event=>{if(event.pointerType==='mouse')setHovered(true);}}
     onClick={()=>{if(pointerType.current==='mouse'){setHovered(true);}else{setOpen(value=>!value);setActive(null);}}}
     onKeyDown={()=>{pointerType.current='keyboard';}}>
     <FolderFront/>
    </button>
    <div className="folder-card-stack" id="folder-collections">
     {collections.map((item,index)=><a key={item.id} href={item.href}
      target={item.id==='pr'?'_blank':undefined} rel={item.id==='pr'?'noopener noreferrer':undefined}
      className={'folder-card card-'+item.id+(active===index?' is-active':'')}
      style={{'--card-delay':`${index*34}ms`} as CSSProperties}
      aria-label={item.title+'：'+item.summary+(item.id==='pr'?'（在新标签页打开）':'')}
      onPointerEnter={event=>{if(event.pointerType==='mouse'){setHovered(true);setActive(index);}}}
      onPointerLeave={event=>{if(event.pointerType==='mouse')setActive(value=>value===index?null:value);}}
      onPointerDown={event=>{pointerType.current=event.pointerType;event.currentTarget.setPointerCapture(event.pointerId);}}
      onFocus={event=>{if(event.currentTarget.matches(':focus-visible')){setOpen(true);setActive(index);}}}
      onKeyDown={()=>{pointerType.current='keyboard';}}
      onClick={event=>activate(event,index)}>
      <span className="folder-card-face"><img src={'./images/home/'+item.image} alt="" width={1922} height={2048} draggable={false} fetchPriority={index===0?'high':undefined}/></span>
     </a>)}
    </div>
   </div>
   <div className="folder-shadow" aria-hidden="true"/>
  </div>
 </section>;
}
