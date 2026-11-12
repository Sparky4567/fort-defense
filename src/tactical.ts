import {Game} from './game';
import {CombatAudio,bulletPass,type CombatSound} from './combat-audio';
import {buildTacticalMap,tacticalMaps,TACTICAL_BOUNDS} from './tactical-maps';
export {tacticalMaps,TACTICAL_BOUNDS} from './tactical-maps';
export function rayBox(o:number[],d:number[],lo:number[],hi:number[]){let near=0,far=9000;for(let a=0;a<3;a++){if(Math.abs(d[a]!)<1e-8){if(o[a]!<lo[a]!||o[a]!>hi[a]!)return Infinity;continue;}let t=(lo[a]!-o[a]!)/d[a]!,u=(hi[a]!-o[a]!)/d[a]!;if(t>u)[t,u]=[u,t];near=Math.max(near,t);far=Math.min(far,u);if(near>far)return Infinity;}return near;}
export const MATCH_SECONDS=600;
export const RESPAWN_SECONDS=3;
export const SPAWN_PROTECTION_SECONDS=2;
export class TacticalGame extends Game{
 effects=new CombatAudio();
 botMemory:({x:number;z:number;expires:number}|null)[]=[];botPatrol:number[]=[];
 teamScores:[number,number]=[0,0];respawnTimers:number[]=[];spawnProtection:number[]=[];
 override tactical=true;battleground=0;botAmmo:number[]=[];botReload:number[]=[];ammo=30;reserve=120;reload=0;destroyed=0;kills=0;feed:string[]=[];
 constructor(c:HTMLCanvasElement,render=true){super(c,render);this.reset();}
 override dispose(){this.effects.dispose();super.dispose();}
 soundEvent(event:CombatSound){if(this.sound){const listener=this.fighters[0]!;this.effects.play(event,{x:listener.x,y:listener.y-26,z:listener.z},this.aimYaw);}}
 selectMap(index:number){this.battleground=tacticalMaps[index]?index:0;this.arena=tacticalMaps[this.battleground]!.arena;this.reset();}
 override reset(){super.reset();this.ground.fill(450);this.terrainVersion++;this.buildings=[];this.characterIds=Array.from({length:10},(_,i)=>i<5?'sprout':'rook');this.fighters=Array.from({length:10},(_,i)=>({x:i<5?990:6210,y:426,z:(i%5-2)*180,vx:0,vy:0,vz:0,hp:100,ki:100,face:i<5?1:-1,cool:0,hit:0}));
 this.buildings=buildTacticalMap(this.battleground ?? 0);
 this.time=MATCH_SECONDS;this.teamScores=[0,0];this.respawnTimers=Array(10).fill(0);this.spawnProtection=Array(10).fill(0);
 this.botMemory=Array(10).fill(null);this.botPatrol=Array(10).fill(0);
 this.botAmmo=Array(10).fill(30);this.botReload=Array(10).fill(0);
 this.ammo=30;this.reserve=120;this.reload=0;this.destroyed=0;this.kills=0;this.feed=[];this.aimYaw=Math.PI/2;this.aimPitch=0;}
 eliminate(target:number,attacker:number){
 const victim=this.fighters[target];
 if(!victim||victim.hp<=0||this.winner!==null||this.time<=0||Math.floor(target/5)===Math.floor(attacker/5))return;
 this.botMemory[target]=null;victim.hp=0;victim.vx=victim.vy=victim.vz=0;
 this.respawnTimers[target]=RESPAWN_SECONDS;
 this.teamScores[attacker<5?0:1]++;
 if(attacker===0)this.kills++;
 if(target===0){this.reload=0;this.keys.clear();}
 this.feed.unshift(`${attacker===0?'YOU':`UNIT ${attacker+1}`} ▸ ${target===0?'YOU':`UNIT ${target+1}`}  +1`);
 this.feed=this.feed.slice(0,4);
 }
 respawn(i:number){
 const f=this.fighters[i]!;
 Object.assign(f,{x:i<5?990:6210,y:426,z:(i%5-2)*180,vx:0,vy:0,vz:0,hp:100,ki:100,cool:0,hit:0,yaw:i<5?Math.PI/2:-Math.PI/2});
 this.botMemory[i]=null;this.botPatrol[i]=0;this.respawnTimers[i]=0;this.spawnProtection[i]=SPAWN_PROTECTION_SECONDS;
 this.botAmmo[i]=30;this.botReload[i]=0;
 if(i===0){this.ammo=30;this.reserve=120;this.reload=0;this.aimYaw=Math.PI/2;this.aimPitch=0;this.keys.clear();}
 }
 trace(o:number[],d:number[],owner:number){let distance=9000,block:typeof this.buildings[number]|undefined,target=-1;for(const b of this.buildings){if(b.hp<=0)continue;const t=rayBox(o,d,[b.x-b.width/2,b.top,b.z-b.depth/2],[b.x+b.width/2,b.base,b.z+b.depth/2]);if(t<distance){distance=t;block=b;target=-1;}}this.fighters.forEach((f,i)=>{if(i===owner||f.hp<=0)return;const t=rayBox(o,d,[f.x-18,f.y-38,f.z-18],[f.x+18,f.y+24,f.z+18]);if(t<distance){distance=t;block=undefined;target=i;}});if(d[1]!>0){const ground=(450-o[1]!)/d[1]!;if(ground>=0&&ground<distance){distance=ground;block=undefined;target=-1;}}return{distance,block,target};}
 // Acquire only enemies whose hitbox is the first object along the sight ray.
 visibleEnemy(i:number){
 const f=this.fighters[i]!;
 const candidates=this.fighters.map((p,j)=>({p,j,d:Math.hypot(p.x-f.x,p.y-f.y,p.z-f.z)}))
  .filter(e=>e.p.hp>0&&Math.floor(e.j/5)!==Math.floor(i/5)).sort((a,b)=>a.d-b.d);
 return candidates.find(e=>{const dx=e.p.x-f.x,dy=e.p.y-f.y,dz=e.p.z-f.z,l=Math.hypot(dx,dy,dz)||1;
  return this.trace([f.x,f.y-26,f.z],[dx/l,dy/l,dz/l],i).target===e.j;
 });
 }
 botMovement(i:number){
 const f=this.fighters[i]!,enemy=this.visibleEnemy(i);
 let goal:{x:number;z:number};
 if(enemy){
  this.botMemory[i]={x:enemy.p.x,z:enemy.p.z,expires:this.elapsed+4};goal=enemy.p;
  const dx=enemy.p.x-f.x,dy=enemy.p.y-f.y,dz=enemy.p.z-f.z,l=Math.hypot(dx,dy,dz)||1;
  f.yaw=Math.atan2(dx,dz);
  if(this.elapsed>3)this.shoot(i,[dx/l,dy/l,dz/l]);
  if(enemy.d<500)return {x:0,z:Math.sin(this.elapsed+i)*.6};
 }else{
  const memory=this.botMemory[i];
  if(memory&&memory.expires>this.elapsed&&Math.hypot(memory.x-f.x,memory.z-f.z)>80)goal=memory;
  else{
   this.botMemory[i]=null;
   // Search fixed lanes instead of reading hidden enemy coordinates.
   const route=[{x:2700,z:(i%3-1)*900},{x:4500,z:(i%3-1)*900},{x:4500,z:((i+1)%3-1)*900},{x:2700,z:((i+1)%3-1)*900}];
   let step=this.botPatrol[i]??0;goal=route[step%route.length]!;
   if(Math.hypot(goal.x-f.x,goal.z-f.z)<100){step++;this.botPatrol[i]=step;goal=route[step%route.length]!;}
  }
 }
 const dx=goal.x-f.x,dz=goal.z-f.z,l=Math.hypot(dx,dz)||1;
 let x=dx/l,z=dz/l;
 if(this.buildingAt(f.x+x*60,f.y,f.z+z*60,20)){x=Math.sin(this.elapsed+i);z=Math.cos(this.elapsed+i);}
 if(!enemy)f.yaw=Math.atan2(x,z);
 return {x,z};
 }
 shoot(i:number,d:number[]){const f=this.fighters[i]!;if(this.winner!==null||this.time<=0||f.hp<=0||f.cool>0||(i===0&&(this.ammo<=0||this.reload>0)))return;if(i!==0&&(this.botReload[i]!>0||this.botAmmo[i]!<=0))return;this.spawnProtection[i]=0;if(i===0)this.ammo--;else{this.botAmmo[i]!--;if(this.botAmmo[i]===0)this.botReload[i]=2.1;}f.cool=i===0?.12:.65;const o=[f.x,f.y-26,f.z],hit=this.trace(o,d,i),p=o.map((v,a)=>v+d[a]!*hit.distance);
 this.soundEvent({kind:'rifle',position:{x:o[0]!,y:o[1]!,z:o[2]!}});
 const impact={x:p[0]!,y:p[1]!,z:p[2]!},travel=hit.distance/12000;
 if(i!==0){const listener=this.fighters[0]!,pass=bulletPass({x:o[0]!,y:o[1]!,z:o[2]!},{x:d[0]!,y:d[1]!,z:d[2]!},hit.distance,{x:listener.x,y:listener.y-26,z:listener.z});if(pass)this.soundEvent({kind:'flyby',position:pass.position,delay:pass.distance/12000});}
 if(hit.block)this.soundEvent({kind:hit.block.style===1?'wood':hit.block.style===0?'brick':'concrete',position:impact,delay:travel});
 else if(hit.target>=0)this.soundEvent({kind:'hit',position:impact,delay:travel});
 else if(d[1]!>0&&Math.abs(p[1]!-450)<.01)this.soundEvent({kind:'ground',position:impact,delay:travel});
 if(hit.block){hit.block.hp=Math.max(0,hit.block.hp-38);this.burst(p[0]!,p[1]!,'#ffcc77',hit.block.hp===0?16:4,p[2]);if(hit.block.hp===0){this.destroyed++;this.soundEvent({kind:'break',position:impact,delay:travel+.04});}}if(hit.target>=0&&Math.floor(hit.target/5)!==Math.floor(i/5)){const t=this.fighters[hit.target]!;if(!this.spawnProtection[hit.target]){const damage=i===0?20:12;if(t.hp<=damage)this.eliminate(hit.target,i);else{t.hp-=damage;t.hit=.2;}}}

 for(let n=0;n<12;n++){const t=hit.distance*n/12;this.particles.push({x:o[0]!+d[0]!*t,y:o[1]!+d[1]!*t,z:o[2]!+d[2]!*t,vx:0,vy:0,vz:0,life:.06,color:'#ffcc77'});}if(i===0)this.shake=1;}
 override blast(i:number){if(i===0){const d=this.aimDirection();this.shoot(0,[d.x,d.y,d.z]);}}
 override update(dt:number){if(!this.running||this.paused||this.winner!==null)return;dt=Math.min(dt,.035);this.elapsed+=dt;this.time=Math.max(0,this.time-dt);if(this.time===0){this.winner=this.teamScores[0]===this.teamScores[1]?2:this.teamScores[0]>this.teamScores[1]?0:1;this.keys.clear();return;}if(this.fighters[0]!.hp>0&&(this.keys.has('r')||this.ammo===0)&&!this.reload&&this.ammo<30&&this.reserve>0)this.reload=2.1;if(this.reload>0){this.reload=Math.max(0,this.reload-dt);if(!this.reload){const n=Math.min(30-this.ammo,this.reserve);this.ammo+=n;this.reserve-=n;}}
 this.fighters.forEach((f,i)=>{this.spawnProtection[i]=Math.max(0,(this.spawnProtection[i]??0)-dt);if(f.hp<=0){this.respawnTimers[i]=Math.max(0,(this.respawnTimers[i]??RESPAWN_SECONDS)-dt);if(this.respawnTimers[i]===0)this.respawn(i);return;}if(this.botReload[i]!>0){this.botReload[i]=Math.max(0,this.botReload[i]!-dt);if(this.botReload[i]===0)this.botAmmo[i]=30;}f.cool=Math.max(0,f.cool-dt);f.hit=Math.max(0,f.hit-dt);if(f.hp<=0)return;const old={x:f.x,y:f.y,z:f.z};let mx=0,mz=0;if(i===0){const fw=Number(this.keys.has('w'))-Number(this.keys.has('s')),st=Number(this.keys.has('d'))-Number(this.keys.has('a'));mx=Math.sin(this.aimYaw)*fw+Math.cos(this.aimYaw)*st;mz=-Math.cos(this.aimYaw)*fw+Math.sin(this.aimYaw)*st;if(this.keys.has('mouse0'))this.blast(0);if(this.keys.has(' ')&&f.y>=426)f.vy=-280;}else{const movement=this.botMovement(i);mx=movement.x;mz=movement.z;}const l=Math.max(1,Math.hypot(mx,mz)),speed=i===0?(this.keys.has('shift')?120:230):135;f.x=Math.max(TACTICAL_BOUNDS.minX,Math.min(TACTICAL_BOUNDS.maxX,f.x+mx/l*speed*dt));f.z=Math.max(TACTICAL_BOUNDS.minZ,Math.min(TACTICAL_BOUNDS.maxZ,f.z+mz/l*speed*dt));f.vy+=700*dt;f.y=Math.min(426,f.y+f.vy*dt);if(f.y===426)f.vy=0;this.resolveBuildings(f,old);});
 this.particles=this.particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;return p.life>0;});this.shake*=.8;
 }
}
