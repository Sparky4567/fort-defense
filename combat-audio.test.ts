import {expect,test} from 'bun:test';
import {bulletPass,CombatAudio,spatialSound,type CombatSound} from './src/combat-audio';
import {TacticalGame} from './src/tactical';
const listener={x:0,y:0,z:0};
test('sound attenuates with distance and pans relative to the direction you face',()=>{
 const nearby=spatialSound(listener,0,{x:100,y:0,z:0}),far=spatialSound(listener,0,{x:5000,y:0,z:0});
 expect(nearby.gain).toBeGreaterThan(far.gain);expect(nearby.pan).toBe(1);
 expect(spatialSound(listener,0,{x:-100,y:0,z:0}).pan).toBe(-1);
 expect(spatialSound(listener,Math.PI,{x:100,y:0,z:0}).pan).toBe(-1);
 expect(spatialSound(listener,0,listener)).toEqual({gain:1,pan:0});
});
test('flyby detects near misses only along the unobstructed bullet segment',()=>{
 const origin={x:0,y:0,z:70},direction={x:1,y:0,z:0},ear={x:1000,y:0,z:0};
 expect(bulletPass(origin,direction,2000,ear)?.distance).toBe(1000);
 expect(bulletPass(origin,direction,800,ear)).toBeNull();
 expect(bulletPass(origin,direction,2000,{x:1000,y:0,z:500})).toBeNull();
 expect(bulletPass(origin,direction,2000,{x:-100,y:0,z:0})).toBeNull();
});
function setup(){const g=new TacticalGame({} as HTMLCanvasElement,false),events:CombatSound[]=[];g.effects.play=e=>{events.push(e);};g.buildings=[];g.fighters.forEach(f=>{f.x=4000;f.z=900;});g.fighters[0]!.x=2000;g.fighters[0]!.z=0;g.fighters[5]!.x=1000;g.fighters[5]!.z=70;return {g,events};}
test('bot gunshots, flybys, material impacts and destruction emit spatial sound events',()=>{
 const {g,events}=setup();g.buildings=[{x:2500,z:70,width:89,depth:89,base:450,top:390,hp:38,maxHp:38,style:1}];
 g.shoot(5,[1,0,0]);expect(events.map(e=>e.kind)).toEqual(['rifle','flyby','wood','break']);
 expect(events[0]!.position.x).toBe(1000);expect(events[1]!.delay).toBeGreaterThan(0);expect(events[2]!.delay).toBeGreaterThan(events[1]!.delay!);
});
test('cover blocks flyby audio, and mute suppresses all combat sounds',()=>{
 const {g,events}=setup();g.buildings=[{x:1500,z:70,width:89,depth:89,base:450,top:390,hp:152,maxHp:152,style:2}];
 g.shoot(5,[1,0,0]);expect(events.map(e=>e.kind)).toEqual(['rifle','concrete']);
 events.length=0;g.sound=false;g.fighters[5]!.cool=0;g.shoot(5,[1,0,0]);expect(events).toHaveLength(0);
});
test('shots against brick, players and ground produce the corresponding impact',()=>{
 for(const kind of ['brick','hit','ground'] as const){const {g,events}=setup();
 if(kind==='brick')g.buildings=[{x:1500,z:70,width:89,depth:89,base:450,top:390,hp:76,maxHp:76,style:0}];
 if(kind==='hit'){g.fighters[0]!.x=1500;g.fighters[0]!.z=70;}
 g.shoot(5,kind==='ground'?[Math.SQRT1_2,Math.SQRT1_2,0]:[1,0,0]);
 expect(events.some(e=>e.kind===kind)).toBe(true);}
});
test('rejected shots do not make sound and audio teardown is safe without a browser',async()=>{
 const {g,events}=setup();g.fighters[5]!.cool=1;g.shoot(5,[1,0,0]);expect(events).toHaveLength(0);
 const audio=new CombatAudio();audio.setMuted(true);await audio.unlock();expect(audio.context).toBeNull();audio.dispose();audio.dispose();
});
