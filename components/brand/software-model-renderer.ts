import {Matrix3,Matrix4,Vector3,Color,Mesh,OrthographicCamera,Scene} from 'three';
import type {BufferGeometry} from 'three';
import {finishFor,makeFibers} from './ip-model-materials';
import type {SurfaceFinish,FiberData} from './ip-model-materials';

type Surface={mesh:Mesh;geometry:BufferGeometry;position:Float32Array;normal:Float32Array;screen:Float32Array;shade:Float32Array;indices:ArrayLike<number>;color:Color;ao:Float32Array;finish:SurfaceFinish;kind:string;fibers:FiberData|null};
const linearToSrgb=(x:number)=>Math.round(255*(x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055));
const clamp=(x:number)=>Math.max(0,Math.min(1,x));

/** Genuine mesh rendering without WebGL: contact occlusion, differentiated surfaces,
 * depth-tested plush fibers, eye highlights and supersampling when movement settles.
 */
export class SoftwareModelRenderer{
 readonly domElement=document.createElement('canvas');
 private context=this.domElement.getContext('2d',{alpha:true})!;
 private surfaces:Surface[]=[];
 private depth=new Float32Array(0);
 private image:ImageData|null=null;
 private animation:((time:number)=>void)|null=null;
 private frame=0;
 private pixelRatio=1.25;
 private width=0;private height=0;private detailed=false;
 private lastFrame=0;
 private modelMatrix=new Matrix4();private normalMatrix=new Matrix3();
 private vertex=new Vector3();private normal=new Vector3();private tip=new Vector3();private tangent=new Vector3();
 private key=new Vector3(-3,4,5).normalize();
 private fill=new Vector3(4,1,3).normalize();
 private half=new Vector3(-.28,.38,.88).normalize();
 setPixelRatio(_value:number){this.pixelRatio=1.25;}
 setDetailed(value:boolean){if(this.detailed===value)return;this.detailed=value;this.allocate();}
 setSize(width:number,height:number,_updateStyle=false){this.width=width;this.height=height;this.allocate();}
 private allocate(){
  const ratio=this.detailed?2.1:this.pixelRatio;
  this.domElement.width=Math.max(1,Math.round(this.width*ratio));this.domElement.height=Math.max(1,Math.round(this.height*ratio));
  this.image=this.context.createImageData(this.domElement.width,this.domElement.height);this.depth=new Float32Array(this.domElement.width*this.domElement.height);
 }
 setAnimationLoop(callback:((time:number)=>void)|null){
  this.animation=callback;
  if(!callback){cancelAnimationFrame(this.frame);this.frame=0;return;}
  if(this.frame)return;
  const tick=(time:number)=>{this.frame=0;if(!this.animation)return;if(time-this.lastFrame>=30){this.lastFrame=time;this.animation(time);}if(this.animation!==null)this.frame=requestAnimationFrame(tick);};
  this.frame=requestAnimationFrame(tick);
 }
 private prepare(scene:Scene){
  scene.traverse(object=>{
   if(!(object instanceof Mesh))return;
   const geometry=object.geometry,position=geometry.getAttribute('position');if(!geometry.getAttribute('normal'))geometry.computeVertexNormals();
   const normal=geometry.getAttribute('normal'),ambient=geometry.getAttribute('_occlusion'),finish=finishFor(object);
   const material=Array.isArray(object.material)?object.material[0]:object.material;
   this.surfaces.push({mesh:object,geometry,position:Float32Array.from(position.array),normal:Float32Array.from(normal.array),screen:new Float32Array(position.count*3),shade:new Float32Array(position.count*3),indices:geometry.index?.array||Uint32Array.from({length:position.count},(_,i)=>i),color:new Color(finish.color),ao:ambient?Float32Array.from(ambient.array):new Float32Array(position.count).fill(1),finish,kind:material.name,fibers:finish.fiber?makeFibers(object,material.name==='tail'?4000:28000):null});
  });
 }
 render(scene:Scene,camera:OrthographicCamera){
  if(!this.image)return;
  scene.updateMatrixWorld();camera.updateMatrixWorld();if(!this.surfaces.length)this.prepare(scene);
  const width=this.domElement.width,height=this.domElement.height,data=this.image.data;
  data.fill(0);this.depth.fill(-Infinity);
  const scaleX=width/(camera.right-camera.left),scaleY=height/(camera.top-camera.bottom);
  for(const surface of this.surfaces){
   const {position,normal,screen,shade,color,indices,ao,finish,kind}=surface;
   this.modelMatrix.copy(surface.mesh.matrixWorld);this.normalMatrix.getNormalMatrix(this.modelMatrix);
   for(let i=0;i<position.length;i+=3){
    this.vertex.set(position[i],position[i+1],position[i+2]).applyMatrix4(this.modelMatrix);
    screen[i]=(this.vertex.x-camera.left)*scaleX;screen[i+1]=(camera.top-this.vertex.y)*scaleY;screen[i+2]=this.vertex.z;
    this.normal.set(normal[i],normal[i+1],normal[i+2]).applyMatrix3(this.normalMatrix).normalize();
    const ambient=finish.fiber?.42+.58*Math.pow(ao[i/3],1.15):.22+.78*Math.pow(ao[i/3],1.25);
    const diffuse=(.34+.62*Math.max(0,this.normal.dot(this.key))+.14*Math.max(0,this.normal.dot(this.fill)))*ambient;
    const h=Math.max(0,this.normal.dot(this.half));
    const spec=(Math.pow(h,kind==='eyes'?75:22)*.7+Math.pow(h,kind==='eyes'?18:7)*.1)*finish.gloss*ambient;
    const sheen=finish.sheen*Math.pow(1-Math.abs(this.normal.z),3)*.07*ambient;
    shade[i]=linearToSrgb(clamp(color.r*(diffuse+sheen)+spec));shade[i+1]=linearToSrgb(clamp(color.g*(diffuse+sheen)+spec*.98));shade[i+2]=linearToSrgb(clamp(color.b*(diffuse+sheen)+spec*.93));
   }
   for(let f=0;f<indices.length;f+=3){
    const a=indices[f]*3,b=indices[f+1]*3,c=indices[f+2]*3;
    const ax=screen[a],ay=screen[a+1],bx=screen[b],by=screen[b+1],cx=screen[c],cy=screen[c+1];
    const area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(Math.abs(area)<.002)continue;
    const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(width-1,Math.ceil(Math.max(ax,bx,cx)));
    const minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(height-1,Math.ceil(Math.max(ay,by,cy)));
    const inv=1/area,waX=(by-cy)*inv,waY=(cx-bx)*inv,wbX=(cy-ay)*inv,wbY=(ax-cx)*inv;
    let rowA=((bx-(minX+.5))*(cy-(minY+.5))-(by-(minY+.5))*(cx-(minX+.5)))*inv;
    let rowB=((cx-(minX+.5))*(ay-(minY+.5))-(cy-(minY+.5))*(ax-(minX+.5)))*inv;
    for(let y=minY;y<=maxY;y++,rowA+=waY,rowB+=wbY){
     let wa=rowA,wb=rowB;
     for(let x=minX;x<=maxX;x++,wa+=waX,wb+=wbX){
      const wc=1-wa-wb;if(wa<-.0001||wb<-.0001||wc<-.0001)continue;
      const z=wa*screen[a+2]+wb*screen[b+2]+wc*screen[c+2],pixel=y*width+x;if(z<=this.depth[pixel])continue;
      this.depth[pixel]=z;const offset=pixel*4;
      const px=wa*position[a]+wb*position[b]+wc*position[c],py=wa*position[a+1]+wb*position[b+1]+wc*position[c+1],pz=wa*position[a+2]+wb*position[b+2]+wc*position[c+2];
      // Unresolved textile detail must disappear, not become random pixel noise
      const detail=clamp((scaleX-550)/900);
      let texture=1-finish.grain*detail*Math.sin(px*900)*Math.sin(py*900);
      if(kind==='hat')texture=1-finish.grain*detail*Math.sin(Math.hypot(px,pz)*900+py*90);
      data[offset]=(wa*shade[a]+wb*shade[b]+wc*shade[c])*texture;data[offset+1]=(wa*shade[a+1]+wb*shade[b+1]+wc*shade[c+1])*texture;data[offset+2]=(wa*shade[a+2]+wb*shade[b+2]+wc*shade[c+2])*texture;data[offset+3]=255;
     }
    }
   }
  }
  // Thin, curved fiber segments are tested against the entire model depth buffer
  for(const surface of this.surfaces){
   const f=surface.fibers;if(!f)continue;
   this.modelMatrix.copy(surface.mesh.matrixWorld);this.normalMatrix.getNormalMatrix(this.modelMatrix);
   const stride=this.detailed?1:2;
   for(let i=0;i<f.length.length;i+=stride){
    this.vertex.fromArray(f.position,i*3);this.normal.fromArray(f.normal,i*3);
    this.tangent.set(Math.cos(f.bend[i]),-.7,Math.sin(f.bend[i]));this.tangent.addScaledVector(this.normal,-this.tangent.dot(this.normal)).normalize();
    this.tip.copy(this.vertex).addScaledVector(this.normal,f.length[i]*.8).addScaledVector(this.tangent,f.length[i]*.65);
    this.vertex.addScaledVector(this.normal,.001).applyMatrix4(this.modelMatrix);this.tip.applyMatrix4(this.modelMatrix);this.normal.applyMatrix3(this.normalMatrix).normalize();
    if(this.normal.z<-.2)continue;
    const sx=(this.vertex.x-camera.left)*scaleX,sy=(camera.top-this.vertex.y)*scaleY,ex=(this.tip.x-camera.left)*scaleX,ey=(camera.top-this.tip.y)*scaleY;
    const steps=Math.max(1,Math.ceil(Math.hypot(ex-sx,ey-sy)*1.2));
    const light=(.42+.53*Math.max(0,this.normal.dot(this.key))+.13*Math.max(0,this.normal.dot(this.fill)))*(.42+.58*Math.pow(f.occlusion[i],1.15));
    const red=linearToSrgb(clamp(light)),green=linearToSrgb(clamp(light*.97)),blue=linearToSrgb(clamp(light*.90));
    for(let s=0;s<=steps;s++){
     const t=s/steps,x=Math.round(sx+(ex-sx)*t),y=Math.round(sy+(ey-sy)*t);if(x<0||x>=width||y<0||y>=height)continue;
     const pixel=y*width+x,z=this.vertex.z+(this.tip.z-this.vertex.z)*t;if(z<this.depth[pixel]-.001)continue;
     const off=pixel*4,alpha=(.025+.24*Math.pow(1-Math.abs(this.normal.z),3))*(1-t*.8),oldAlpha=data[off+3]/255,newAlpha=alpha+oldAlpha*(1-alpha);
     data[off]=(red*alpha+data[off]*oldAlpha*(1-alpha))/newAlpha;data[off+1]=(green*alpha+data[off+1]*oldAlpha*(1-alpha))/newAlpha;data[off+2]=(blue*alpha+data[off+2]*oldAlpha*(1-alpha))/newAlpha;data[off+3]=255*newAlpha;
    }
   }
  }
  this.context.putImageData(this.image,0,0);
 }
 dispose(){this.setAnimationLoop(null);this.surfaces=[];this.image=null;this.depth=new Float32Array(0);}
}
