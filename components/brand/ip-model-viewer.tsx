'use client';

import {useEffect, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';
import {LoaderCircle, RotateCcw} from 'lucide-react';

type Pose = {yaw:number;pitch:number;revision:number};
type Engine = {setAngles:(yaw:number,pitch:number,instant?:boolean)=>void; angles:{yaw:number;pitch:number}};
const radians=Math.PI/180;
const nearest=(value:number,reference:number)=>reference+((value-reference+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;

/** Actual STL-derived geometry, rendered locally in the visitor's browser */
export default function IPModelViewer({pose,onRotate,onReset}:{pose:Pose;onRotate:()=>void;onReset:()=>void}){
 const mount=useRef<HTMLDivElement>(null);
 const engine=useRef<Engine|null>(null);
 const lastPoint=useRef<{x:number;y:number}|null>(null);
 const hoverAnchor=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null);
 const reduced=useRef(false);
 const currentPose=useRef(pose);currentPose.current=pose;
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const [attempt,setAttempt]=useState(0);

 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let disposed=false,cleanup=()=>{};
  const controller=new AbortController();
  setStatus('loading');
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced.current=media.matches;
  const motion=()=>{reduced.current=media.matches;};media.addEventListener('change',motion);
  (async()=>{
   const THREE=await import('three');
   const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
   if(disposed)return;
   let renderer:import('three').WebGLRenderer|import('./software-model-renderer').SoftwareModelRenderer;
   let software=false;
   try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setClearColor(0xffffff,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.94;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   }catch{
    const {SoftwareModelRenderer}=await import('./software-model-renderer');
    if(disposed)return;
    renderer=new SoftwareModelRenderer();software=true;
   }
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
   host.dataset.renderer=software?'software':'webgl';
   renderer.domElement.setAttribute('aria-label','圣小农可旋转三维模型');
   renderer.domElement.setAttribute('role','img');
   host.appendChild(renderer.domElement);
   const scene=new THREE.Scene();
   const camera=new THREE.OrthographicCamera(-1.3,1.3,1.3,-1.3,.1,30);
   camera.position.set(0,0,6);camera.lookAt(0,0,0);
   const group=new THREE.Group();scene.add(group);
   scene.add(new THREE.HemisphereLight(0xfffaf3,0xa9a297,.62));
   const key=new THREE.DirectionalLight(0xfff8ef,3);key.position.set(-3,4,5);key.castShadow=true;
   key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-1.8;key.shadow.camera.right=1.8;key.shadow.camera.top=1.8;key.shadow.camera.bottom=-1.8;
   key.shadow.camera.near=.1;key.shadow.camera.far=14;key.shadow.bias=-.00015;key.shadow.normalBias=.006;key.shadow.radius=4;scene.add(key);
   const fill=new THREE.DirectionalLight(0xf1f5ff,.85);fill.position.set(4,1,3);scene.add(fill);
   const rim=new THREE.DirectionalLight(0xffffff,.85);rim.position.set(1,3,-4);scene.add(rim);
   let studioEnvironment:import('three').WebGLRenderTarget|undefined;
   let radius=1.12,visible=true,loaded=false;
   const target={yaw:currentPose.current.yaw*radians,pitch:currentPose.current.pitch*radians};
   const actual={...target};
   let lastDraw=0;
   const draw=()=>{
    if(disposed||!loaded||!visible||document.hidden){renderer.setAnimationLoop(null);return;}
    const now=performance.now(),dt=lastDraw?Math.min(now-lastDraw,50):16;lastDraw=now;
    const ease=1-Math.exp(-dt/145);
    actual.yaw+=(target.yaw-actual.yaw)*ease;actual.pitch+=(target.pitch-actual.pitch)*ease;
    const settled=Math.abs(target.yaw-actual.yaw)+Math.abs(target.pitch-actual.pitch)<.0003;
    if(settled){actual.yaw=target.yaw;actual.pitch=target.pitch;}
    group.rotation.set(actual.pitch,actual.yaw,0,'YXZ');
    host.dataset.yaw=(actual.yaw/radians).toFixed(1);host.dataset.pitch=(actual.pitch/radians).toFixed(1);
    if('setDetailed' in renderer)renderer.setDetailed(settled);
    host.style.setProperty('--contact-shadow-opacity',String(.32*Math.pow(Math.max(0,Math.cos(actual.pitch)),8)));
    renderer.render(scene,camera);
    if(settled)renderer.setAnimationLoop(null);
   };
   const wake=()=>{if(!disposed&&visible&&!document.hidden)renderer.setAnimationLoop(draw);};
   const setAngles=(yaw:number,pitch:number,instant=false)=>{
    target.yaw=yaw;target.pitch=pitch;
    if(instant||reduced.current){actual.yaw=yaw;actual.pitch=pitch;}
    wake();
   };
   engine.current={setAngles,angles:target};
   const resize=()=>{
    const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
    const aspect=width/height,half=radius*1.07/Math.min(aspect,1);
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);wake();
   };
   const observer=new ResizeObserver(resize);observer.observe(host);
   const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else renderer.setAnimationLoop(null);});intersection.observe(host);
   const visibility=()=>{if(document.hidden)renderer.setAnimationLoop(null);else wake();};document.addEventListener('visibilitychange',visibility);
   const contextLost=(event:Event)=>{event.preventDefault();renderer.setAnimationLoop(null);if(!disposed)setStatus('error');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
   const disposeModel=(root:import('three').Object3D)=>root.traverse(object=>{
    if(object instanceof THREE.Mesh||object instanceof THREE.LineSegments){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}
   });
   cleanup=()=>{
    engine.current=null;renderer.setAnimationLoop(null);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);
    renderer.domElement.removeEventListener('webglcontextlost',contextLost);disposeModel(group);studioEnvironment?.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();
   };
   const response=await fetch(software?'./models/sunner-standard-lite.glb':'./models/sunner-standard.glb',{signal:controller.signal});
   if(!response.ok)throw new Error('Model request failed');
   const buffer=await response.arrayBuffer();if(disposed)return;
   const gltf=await new GLTFLoader().parseAsync(buffer,'');
   if(disposed){disposeModel(gltf.scene);return;}
   if(!software){
    const {applyStudioMaterials}=await import('./ip-model-materials');
    const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
    if(disposed){disposeModel(gltf.scene);return;}
    applyStudioMaterials(gltf.scene);
    const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer as import('three').WebGLRenderer);
    studioEnvironment=pmrem.fromScene(room,.06);scene.environment=studioEnvironment.texture;scene.environmentIntensity=.32;pmrem.dispose();room.dispose();
   }
   group.add(gltf.scene);
   const bounds=new THREE.Box3().setFromObject(gltf.scene),sphere=bounds.getBoundingSphere(new THREE.Sphere());
   // Actual vertex radius keeps all rotations in frame without excessive whitespace
   radius=0;gltf.scene.traverse(object=>{if(object instanceof THREE.Mesh){const vertices=object.geometry.getAttribute('position');for(let i=0;i<vertices.count;i++){radius=Math.max(radius,Math.hypot(vertices.getX(i),vertices.getY(i),vertices.getZ(i)));}}});
   if(!Number.isFinite(radius)||radius===0)radius=sphere.radius;
   loaded=true;setAngles(currentPose.current.yaw*radians,currentPose.current.pitch*radians,true);resize();
   group.rotation.set(actual.pitch,actual.yaw,0,'YXZ');if('setDetailed' in renderer)renderer.setDetailed(true);renderer.render(scene,camera);
   setStatus('ready');
  })().catch(error=>{if(!disposed&&error.name!=='AbortError'){cleanup();setStatus('error');}});
  return ()=>{disposed=true;controller.abort();media.removeEventListener('change',motion);cleanup();};
 },[attempt]);

 useEffect(()=>{
  lastPoint.current=null;hoverAnchor.current=null;
  const controls=engine.current;if(!controls)return;
  controls.setAngles(nearest(pose.yaw*radians,controls.angles.yaw),nearest(pose.pitch*radians,controls.angles.pitch));
 },[pose]);

 const move=(event:PointerEvent<HTMLDivElement>)=>{
  const controls=engine.current;if(!controls||status!=='ready')return;
  if((event.pointerType!=='mouse'||reduced.current)&&!event.buttons)return;
  const previous=lastPoint.current;lastPoint.current={x:event.clientX,y:event.clientY};if(!previous)return;
  const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
  if(Math.abs(dx)+Math.abs(dy)<.1)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(event.buttons){
   hoverAnchor.current=null;
   controls.setAngles(controls.angles.yaw+dx/bounds.width*Math.PI*.65,controls.angles.pitch-dy/bounds.height*Math.PI*.45);
  }else{
   const anchor=hoverAnchor.current||(hoverAnchor.current={x:previous.x,y:previous.y,...controls.angles});
   const x=Math.max(-1,Math.min(1,(event.clientX-anchor.x)/bounds.width)),y=Math.max(-1,Math.min(1,(event.clientY-anchor.y)/bounds.height));
   controls.setAngles(anchor.yaw+x*28*radians,anchor.pitch-y*16*radians);
  }
  onRotate();
 };
 const key=(event:KeyboardEvent<HTMLDivElement>)=>{
  const controls=engine.current;if(!controls)return;
  const delta=10*radians;
  if(event.key.startsWith('Arrow')){
   event.preventDefault();hoverAnchor.current=null;lastPoint.current=null;onRotate();
   controls.setAngles(controls.angles.yaw+(event.key==='ArrowRight'?delta:event.key==='ArrowLeft'?-delta:0),controls.angles.pitch+(event.key==='ArrowUp'?delta:event.key==='ArrowDown'?-delta:0));
  }else if(event.key==='Home'||event.key==='Escape'){event.preventDefault();onReset();}
 };
 return <div className="ip-hero-viewer ip-live-model">
  <div className="ip-orbit-surface" tabIndex={0} role="group" aria-label="圣小农三维旋转展示" aria-describedby="ip-viewer-help" data-model-status={status} onKeyDown={key}
   onPointerEnter={event=>{lastPoint.current={x:event.clientX,y:event.clientY};hoverAnchor.current=engine.current?{x:event.clientX,y:event.clientY,...engine.current.angles}:null;}}
   onPointerMove={move} onPointerLeave={()=>{lastPoint.current=null;hoverAnchor.current=null;}}
   onPointerDown={event=>{event.currentTarget.focus({preventScroll:true});lastPoint.current={x:event.clientX,y:event.clientY};hoverAnchor.current=null;event.currentTarget.setPointerCapture(event.pointerId);}}
   onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);lastPoint.current=null;hoverAnchor.current=null;}}
   onPointerCancel={()=>{lastPoint.current=null;hoverAnchor.current=null;}}>
   <div className="ip-model-canvas" ref={mount} aria-hidden={status!=='ready'}/>
   {status!=='ready'&&<img className="ip-hero-character ip-model-poster" src="./images/ip/front-hd.png" alt="圣小农正面形象" width={1893} height={2048} draggable={false}/>}
  </div>
  <span className="ip-model-badge" aria-live="polite">{status==='loading'?<LoaderCircle className="ip-model-loading" size={14} aria-label="正在加载三维模型"/>:status==='ready'?'360°':null}</span>
  {status==='error'&&<button className="ip-model-retry" type="button" onClick={()=>setAttempt(value=>value+1)}>重新加载模型</button>}
  <button type="button" className="ip-reset" aria-label="回到正视" title="回到正视" onClick={onReset}><RotateCcw size={19} strokeWidth={1.6}/></button>
  <p className="sr-only" id="ip-viewer-help">移动鼠标或拖动可上下左右旋转三维模型，方向键旋转，Home 回到正视</p>
 </div>;
}
