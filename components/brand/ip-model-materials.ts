import {BufferAttribute,BufferGeometry,Color,LineSegments,Mesh,MeshPhysicalMaterial,ShaderMaterial,Vector3} from 'three';
import type {Object3D} from 'three';

export type SurfaceFinish={color:string;roughness:number;sheen:number;grain:number;fiber:boolean;gloss:number};
export const finishes:Record<string,SurfaceFinish>={
 feathers:{color:'#fff9ee',roughness:.94,sheen:.22,grain:0,fiber:true,gloss:.025},
 tail:{color:'#fff9ee',roughness:.94,sheen:.22,grain:0,fiber:true,gloss:.025},
 overalls:{color:'#0b991e',roughness:.88,sheen:.1,grain:.012,fiber:false,gloss:.035},
 hat:{color:'#ffbb05',roughness:.7,sheen:0,grain:.008,fiber:false,gloss:.1},
 comb:{color:'#ee2013',roughness:.51,sheen:0,grain:0,fiber:false,gloss:.16},
 wattle:{color:'#f0261b',roughness:.54,sheen:0,grain:0,fiber:false,gloss:.15},
 cheeks:{color:'#f52c24',roughness:.88,sheen:.08,grain:0,fiber:false,gloss:.02},
 feet:{color:'#ffac04',roughness:.46,sheen:0,grain:0,fiber:false,gloss:.18},
 beak:{color:'#ffb400',roughness:.38,sheen:0,grain:0,fiber:false,gloss:.22},
 tongue:{color:'#e52219',roughness:.48,sheen:0,grain:0,fiber:false,gloss:.15},
 eyes:{color:'#25120a',roughness:.17,sheen:0,grain:0,fiber:false,gloss:1},
 buttons:{color:'#ffbf16',roughness:.36,sheen:0,grain:0,fiber:false,gloss:.3},
 lettering:{color:'#fffdf5',roughness:.88,sheen:.12,grain:.006,fiber:false,gloss:.025},
};
export const finishFor=(mesh:Mesh)=>finishes[(Array.isArray(mesh.material)?mesh.material[0]:mesh.material).name]||finishes.feathers;

export type FiberData={position:Float32Array;normal:Float32Array;occlusion:Float32Array;length:Float32Array;bend:Float32Array};
/** Deterministic surface sampling adds short fibers, never modifies the original mesh */
export function makeFibers(mesh:Mesh,count:number):FiberData{
 const g=mesh.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),ao=g.getAttribute('_occlusion'),ix=g.index;
 const triangles=(ix?ix.count:p.count)/3,cumulative=new Float32Array(triangles);
 const a=new Vector3(),b=new Vector3(),c=new Vector3(),cross=new Vector3();let area=0;
 const index=(f:number,k:number)=>ix?ix.getX(f*3+k):f*3+k;
 for(let f=0;f<triangles;f++){a.fromBufferAttribute(p,index(f,0));b.fromBufferAttribute(p,index(f,1));c.fromBufferAttribute(p,index(f,2));area+=cross.crossVectors(b.sub(a),c.sub(a)).length()/2;cumulative[f]=area;}
 let seed=12345+p.count;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const position=new Float32Array(count*3),normal=new Float32Array(count*3),occlusion=new Float32Array(count),length=new Float32Array(count),bend=new Float32Array(count);
 for(let i=0;i<count;i++){
  const target=random()*area;let lo=0,hi=triangles-1;while(lo<hi){const mid=(lo+hi)>>1;if(cumulative[mid]<target)lo=mid+1;else hi=mid;}
  const ids=[index(lo,0),index(lo,1),index(lo,2)],u=Math.sqrt(random()),v=random(),w=[1-u,u*(1-v),u*v];
  a.set(0,0,0);b.set(0,0,0);let ambient=0;
  for(let k=0;k<3;k++){c.fromBufferAttribute(p,ids[k]);a.addScaledVector(c,w[k]);c.fromBufferAttribute(n,ids[k]);b.addScaledVector(c,w[k]);ambient+=(ao?ao.getX(ids[k]):1)*w[k];}
  b.normalize();a.toArray(position,i*3);b.toArray(normal,i*3);occlusion[i]=ambient;length[i]=.0025+Math.pow(random(),1.8)*.008;bend[i]=random()*Math.PI*2;
 }
 return {position,normal,occlusion,length,bend};
}

export function applyStudioMaterials(root:Object3D){
 const fibers:LineSegments[]=[];
 root.traverse(object=>{
  if(!(object instanceof Mesh))return;
  const old=Array.isArray(object.material)?object.material[0]:object.material;
  const finish=finishFor(object),name=old.name;
  const material=new MeshPhysicalMaterial({name,color:finish.color,roughness:finish.roughness,metalness:0,sheen:finish.sheen,sheenColor:new Color(finish.fiber?'#fff8eb':finish.color),sheenRoughness:.95,clearcoat:name==='eyes'?.75:name==='beak'?.08:0,clearcoatRoughness:.2,envMapIntensity:name==='eyes'?.75:.28});
  object.castShadow=true;object.receiveShadow=true;
  // Contact occlusion comes from the complete supplied model, including hidden overlaps
  material.onBeforeCompile=shader=>{
   shader.vertexShader='attribute float _occlusion; varying float vContactAO; varying vec3 vSurfacePosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvContactAO=_occlusion;vSurfacePosition=position;');
   shader.fragmentShader=`varying float vContactAO;varying vec3 vSurfacePosition;
// Fade detail that is smaller than a screen pixel instead of aliasing into speckles
float filteredThread(float phase){return sin(phase)*(1.0-smoothstep(.5,2.0,fwidth(phase)));}
`+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float textile=filteredThread(vSurfacePosition.x*900.0)*filteredThread(vSurfacePosition.y*900.0);
diffuseColor.rgb*=1.0-${finish.grain.toFixed(3)}*textile;`);
   // AO belongs to indirect light, not painted into the character's base color
   shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>',`#include <aomap_fragment>
float contact=mix(.48,1.0,smoothstep(.15,1.0,vContactAO));
reflectedLight.indirectDiffuse*=contact;
reflectedLight.indirectSpecular*=contact;`);
  };
  material.customProgramCacheKey=()=>`sunner-soft-studio-v2-${name}`;
  object.material=material;old.dispose();
  if(!object.geometry.getAttribute('_occlusion'))object.geometry.setAttribute('_occlusion',new BufferAttribute(new Float32Array(object.geometry.getAttribute('position').count).fill(1),1));
  if(!finish.fiber)return;
  const data=makeFibers(object,name==='tail'?4000:28000),count=data.length.length;
  const vertices=new Float32Array(count*6),normals=new Float32Array(count*6),ambient=new Float32Array(count*2),tips=new Float32Array(count*2),normal=new Vector3(),tangent=new Vector3(),base=new Vector3(),tip=new Vector3();
  for(let i=0;i<count;i++){
   normal.fromArray(data.normal,i*3);base.fromArray(data.position,i*3);tangent.set(Math.cos(data.bend[i]),-.7,Math.sin(data.bend[i]));tangent.addScaledVector(normal,-tangent.dot(normal)).normalize();
   tip.copy(base).addScaledVector(normal,data.length[i]*.8).addScaledVector(tangent,data.length[i]*.65);base.addScaledVector(normal,.0004);
   base.toArray(vertices,i*6);tip.toArray(vertices,i*6+3);
   normal.toArray(normals,i*6);normal.toArray(normals,i*6+3);
   ambient[i*2]=ambient[i*2+1]=data.occlusion[i];tips[i*2+1]=1;
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(vertices,3));geometry.setAttribute('normal',new BufferAttribute(normals,3));geometry.setAttribute('contact',new BufferAttribute(ambient,1));geometry.setAttribute('tip',new BufferAttribute(tips,1));
  // Subtle, tapered silhouette fibers, lit in the current view rather than dark baked strokes
  const hairMaterial=new ShaderMaterial({transparent:true,depthWrite:false,
   vertexShader:`attribute float contact;attribute float tip;varying float vAlpha;varying vec3 vFurColor;
void main(){vec3 n=normalize(normalMatrix*normal);float edge=pow(1.0-abs(n.z),3.0);vAlpha=(.025+.24*edge)*(1.0-tip*.8);
float light=(.46+.55*max(0.0,dot(n,normalize(vec3(-3.,4.,5.)))))*mix(.62,1.,contact);
vFurColor=vec3(1.,.965,.90)*light;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`varying float vAlpha;varying vec3 vFurColor;void main(){gl_FragColor=vec4(vFurColor,vAlpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  const hair=new LineSegments(geometry,hairMaterial);hair.name='short-plush-fibers';fibers.push(hair);
 });
 for(const hair of fibers)root.add(hair);
}
