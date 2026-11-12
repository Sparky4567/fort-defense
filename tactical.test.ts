import {test,expect} from 'bun:test';
import {TacticalGame,rayBox,tacticalMaps,TACTICAL_BOUNDS,MATCH_SECONDS,RESPAWN_SECONDS} from './src/tactical';
const make=()=>new TacticalGame({} as HTMLCanvasElement,false);
test('ten grounded combatants and intact material blocks reset',()=>{const g=make();expect(g.fighters.length).toBe(10);expect(g.fighters.every(f=>f.hp===100&&f.y===426)).toBe(true);expect(new Set(g.buildings.map(b=>b.maxHp)).size).toBe(3);g.ammo=0;g.buildings[0]!.hp=0;g.reset();expect(g.ammo).toBe(30);expect(g.buildings[0]!.hp).toBeGreaterThan(0);});
test('ray slabs reject parallel misses and select forward intersection',()=>{expect(rayBox([0,0,0],[1,0,0],[10,-1,-1],[20,1,1])).toBe(10);expect(rayBox([0,5,0],[1,0,0],[10,-1,-1],[20,1,1])).toBe(Infinity);});
test('cover absorbs fire until breached then bullets damage enemy',()=>{const g=make();g.sound=false;g.fighters.forEach((f,i)=>{f.x=i?4500:2350;f.z=900;});const enemy=g.fighters[5]!;enemy.x=2700;enemy.z=0;g.fighters[0]!.z=0;g.buildings=[{x:2500,z:0,width:59,depth:59,base:450,top:390,hp:38,maxHp:38,style:1}];g.blast(0);expect(enemy.hp).toBe(100);expect(g.buildings[0]!.hp).toBe(0);expect(g.buildingAt(2500,420,0)).toBeUndefined();g.fighters[0]!.cool=0;g.blast(0);expect(enemy.hp).toBe(80);expect(g.ammo).toBe(28);});
test('reload consumes reserve and a squad wipe does not end deathmatch',()=>{const g=make();g.sound=false;g.running=true;g.ammo=0;g.keys.add('r');g.update(.03);g.keys.clear();for(let i=0;i<72;i++)g.update(.03);expect(g.ammo).toBe(30);expect(g.reserve).toBe(90);for(let i=5;i<10;i++)g.eliminate(i,0);g.update(.03);expect(g.winner).toBeNull();expect(g.teamScores).toEqual([5,0]);});

test('rifle requires five hits and never eliminates a full-health target in one shot',()=>{const g=make();g.sound=false;g.buildings=[];g.fighters.forEach((f,i)=>{f.x=i?4500:2350;f.z=900;});g.fighters[0]!.z=0;const enemy=g.fighters[5]!;enemy.x=2700;enemy.z=0;for(let n=1;n<=5;n++){g.fighters[0]!.cool=0;g.blast(0);expect(enemy.hp).toBe(100-n*20);}expect(g.kills).toBe(1);});
test('reloading blocks shots and transfers only available reserve',()=>{const g=make();g.sound=false;g.running=true;g.ammo=20;g.reserve=5;g.keys.add('r');g.update(.03);g.keys.clear();g.blast(0);expect(g.ammo).toBe(20);for(let n=0;n<72;n++)g.update(.03);expect(g.ammo).toBe(25);expect(g.reserve).toBe(0);});
test('empty magazines automatically reload, and pause freezes the reload timer',()=>{const g=make();g.sound=false;g.running=true;g.ammo=0;g.update(.03);expect(g.reload).toBeGreaterThan(2);const remaining=g.reload;g.paused=true;g.update(.03);expect(g.reload).toBe(remaining);});
test('all battlegrounds have distinct block layouts, safe spawns and rebuild on reset',()=>{const g=make();const layouts=new Set<string>();for(let i=0;i<tacticalMaps.length;i++){g.selectMap(i);layouts.add(JSON.stringify(g.buildings));expect(g.arena).toBe(tacticalMaps[i]!.arena);for(const f of g.fighters)expect(g.buildingAt(f.x,f.y,f.z,20)).toBeUndefined();const count=g.buildings.length;g.buildings[0]!.hp=0;g.reset();expect(g.buildings.length).toBe(count);expect(g.buildings[0]!.hp).toBeGreaterThan(0);expect(g.battleground).toBe(i);}expect(layouts.size).toBe(14);});

test('expanded battlefields are at least twice the old area and support long-range shots',()=>{
 const width=TACTICAL_BOUNDS.maxX-TACTICAL_BOUNDS.minX,depth=TACTICAL_BOUNDS.maxZ-TACTICAL_BOUNDS.minZ;
 expect(width*depth).toBeGreaterThan(2*3100*2120);
 const g=make();g.buildings=[];g.fighters.forEach((f,i)=>{f.x=i===5?6500:800;f.z=i===0||i===5?0:900;});
 expect(g.trace([800,400,0],[1,0,0],0).target).toBe(5);
});

test('player can travel through newly opened map area and remains inside expanded bounds',()=>{
 const g=make();g.sound=false;g.running=true;g.buildings=[];g.fighters.slice(1).forEach(f=>{f.x=6500;f.z=1200;});
 const f=g.fighters[0]!;f.x=1800;f.z=0;g.keys.add('s');
 for(let n=0;n<240;n++)g.update(.035);
 expect(f.x).toBeLessThan(2040);expect(f.x).toBe(TACTICAL_BOUNDS.minX);
 g.keys.clear();f.z=1400;g.keys.add('d');for(let n=0;n<40;n++)g.update(.035);
 expect(f.z).toBeGreaterThan(1060);expect(f.z).toBe(TACTICAL_BOUNDS.maxZ);
});

test('every map has cover in both flanks and all blocks stay over the ground mesh',()=>{
 const g=make();
 for(let i=0;i<tacticalMaps.length;i++){
  g.selectMap(i);
  for(const b of g.buildings){expect(b.x-b.width/2).toBeGreaterThanOrEqual(0);expect(b.x+b.width/2).toBeLessThanOrEqual(7200);expect(Math.abs(b.z)+b.depth/2).toBeLessThanOrEqual(1800);expect(b.hp).toBe(b.maxHp);}
  const interior=g.buildings.filter(b=>b.x>1200&&b.x<6000&&Math.abs(b.z)<1450);
  expect(interior.some(b=>b.z>700)).toBe(true);expect(interior.some(b=>b.z<-700)).toBe(true);
 }
});

test('each elimination scores once and player, teammate and enemy all respawn',()=>{
 const g=make();g.sound=false;g.running=true;g.buildings[0]!.hp=0;g.ammo=2;g.reserve=0;g.reload=1;
 g.eliminate(0,5);g.eliminate(1,5);g.eliminate(5,0);g.eliminate(5,0);
 expect(g.teamScores).toEqual([1,2]);expect(g.kills).toBe(1);expect(g.reload).toBe(0);
 for(const i of [0,1,5]){expect(g.fighters[i]!.hp).toBe(0);expect(g.respawnTimers[i]).toBe(RESPAWN_SECONDS);}
 for(let n=0;n<99;n++)g.update(.03);
 expect(g.fighters[0]!.hp).toBe(0);
 for(let n=0;n<3&&g.fighters[0]!.hp===0;n++)g.update(.03);
 for(const i of [0,1,5]){expect(g.fighters[i]!.hp).toBe(100);expect(g.botAmmo[i]).toBe(30);expect(g.spawnProtection[i]).toBeGreaterThan(0);expect(g.buildingAt(g.fighters[i]!.x,426,g.fighters[i]!.z,20)).toBeUndefined();}
 expect(g.ammo).toBe(30);expect(g.reserve).toBe(120);expect(g.teamScores).toEqual([1,2]);expect(g.buildings[0]!.hp).toBe(0);expect(g.winner).toBeNull();
});

test('friendly eliminations award no points and pause freezes respawns and match time',()=>{
 const g=make();g.running=true;g.eliminate(1,0);expect(g.fighters[1]!.hp).toBe(100);expect(g.teamScores).toEqual([0,0]);
 g.eliminate(0,5);g.paused=true;const timer=g.time;g.update(.03);expect(g.time).toBe(timer);expect(g.respawnTimers[0]).toBe(RESPAWN_SECONDS);
});

test('ten-minute match ends by points, including draws, then freezes gameplay',()=>{
 for(const [scores,winner] of [[[4,3],0],[[2,8],1],[[6,6],2]] as const){
 const g=make();g.sound=false;g.running=true;expect(g.time).toBe(MATCH_SECONDS);expect(g.time).toBe(600);
 g.teamScores=[...scores];g.time=.02;g.update(.03);expect(g.time).toBe(0);expect(g.winner).toBe(winner);
 const hp=g.fighters[5]!.hp;g.eliminate(5,0);g.blast(0);g.update(.03);expect(g.teamScores).toEqual([...scores]);expect(g.fighters[5]!.hp).toBe(hp);
 g.reset();expect(g.time).toBe(600);expect(g.teamScores).toEqual([0,0]);expect(g.respawnTimers.every(t=>t===0)).toBe(true);expect(g.winner).toBeNull();
 }
});

test('spawn shield blocks damage briefly and firing removes own protection',()=>{
 const g=make();g.sound=false;g.buildings=[];g.fighters.forEach(f=>{f.x=4500;f.z=900;});
 g.fighters[0]!.x=2350;g.fighters[0]!.z=0;g.fighters[5]!.x=2700;g.fighters[5]!.z=0;
 g.spawnProtection[5]=2;g.spawnProtection[0]=2;g.blast(0);expect(g.fighters[5]!.hp).toBe(100);expect(g.spawnProtection[0]).toBe(0);
 g.spawnProtection[5]=0;g.fighters[0]!.cool=0;g.blast(0);expect(g.fighters[5]!.hp).toBe(80);
});
