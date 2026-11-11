'use client';
import {useEffect,useState} from 'react';
import {ChevronRight,Menu,X} from 'lucide-react';
import BrandHome from '@/components/brand/home';
import LogoGallery from '@/components/brand/logo-gallery';
import VIGallery from '@/components/brand/vi-gallery';
import IPGallery from '@/components/brand/ip-gallery';
import {navigation} from '@/lib/showcase';

function BrandFlagLogo({className}:{className:string}){
 return <svg className={className} viewBox="313 188 1421 852" role="img" aria-label="圣农绿色旗帜标" preserveAspectRatio="xMidYMid meet"><image href="./images/logos/sunner-shield.png" width="2048" height="1228"/></svg>;
}

export default function BrandApplication(){
 const [page,setPage]=useState('home'),[menu,setMenu]=useState(false);
 useEffect(()=>{const read=()=>{const id=location.hash.slice(1);if(navigation.some(n=>n.id===id)){setPage(id);setMenu(false);}else{setPage('home');setMenu(false);if(id==='rules')window.history.replaceState(null,'','#home');}};read();window.addEventListener('hashchange',read);return()=>window.removeEventListener('hashchange',read)},[]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);document.getElementById('navigation-toggle')?.focus()}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu]);
 const go=(id:string)=>{setPage(id);setMenu(false);location.hash=id;window.scrollTo({top:0,behavior:'instant'});};
 const current=navigation.find(n=>n.id===page)!;
 return <div className={'flow-app showcase-app '+(page==='home'?'is-home':'is-inner')+' page-'+page}><a className="skip-link" href="#main-content">跳转至主要内容</a><header className="flow-header"><button className="flow-wordmark" onClick={()=>go('home')} aria-label="返回品牌应用中心首页"><BrandFlagLogo className="header-shield-logo"/><small>品牌应用中心</small></button>{page!=='home'&&<><nav className={'flow-nav '+(menu?'menu-open':'')} id="site-navigation" aria-label="主要导航">{navigation.map(n=><button key={n.id} className={page===n.id?'current':''} aria-current={page===n.id?'page':undefined} onClick={()=>go(n.id)}>{n.name}</button>)}</nav><span className="header-description">品牌展示与应用指南</span><button id="navigation-toggle" className="flow-menu" aria-label={menu?'收起导航':'展开导航'} aria-expanded={menu} aria-controls="site-navigation" onClick={()=>setMenu(!menu)}>{menu?<X size={23}/>:<Menu size={23}/>}</button></>}</header>{page!=='home'&&menu&&<button className="flow-scrim" onClick={()=>setMenu(false)} aria-label="关闭导航菜单"/>}<main className="main" id="main-content">{page==='home'?<BrandHome go={go}/>:<><div className="page-top"><div className="breadcrumb"><button onClick={()=>go('home')}>品牌应用中心</button><ChevronRight size={14}/><span>{current.name}</span></div><span className="showcase-label">品牌展示</span></div>{page==='vi'&&<div className="vi-page-heading"><h1>VI 应用</h1></div>}{page==='logo'&&<LogoGallery/>}{page==='vi'&&<VIGallery/>}{page==='ip'&&<IPGallery/>}</>}{page!=='home'&&<footer className="footer"><button className="footer-brand" onClick={()=>go('home')} aria-label="返回首页"><BrandFlagLogo className="footer-shield-logo"/></button><span>圣农集团 · 品牌应用中心</span></footer>}</main></div>
}
