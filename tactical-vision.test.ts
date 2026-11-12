import {test,expect} from 'bun:test';
import {TacticalGame} from './src/tactical';
function scene(){const g=new TacticalGame({} as HTMLCanvasElement,false);g.sound=false;g.elapsed=5;g.fighters.forEach(f=>f.hp=0);Object.assign(g.fighters[0]!,{hp:100,x:3000,y:426,z:0});Object.assign(g.fighters[5]!,{hp:100,x:2000,y:426,z:0});g.buildings=[{x:2500,z:0,width:89,depth:2000,base:450,top:200,hp:152,maxHp:152,style:2}];return g;}
test('intact cover prevents acquisition, shots and block damage for either team',()=>{
 const g=scene();expect(g.visibleEnemy(5)).toBeUndefined();expect(g.visibleEnemy(0)).toBeUndefined();
 for(let n=0;n<10;n++){g.botMovement(5);g.fighters[5]!.cool=0;}
 expect(g.botAmmo[5]).toBe(30);expect(g.buildings[0]!.hp).toBe(152);expect(g.fighters[0]!.hp).toBe(100);expect(g.botMemory[5]).toBeNull();
});
test('patrol does not follow an enemy it has never seen through cover',()=>{
 const g=scene(),before=g.botMovement(5),yaw=g.fighters[5]!.yaw;g.fighters[0]!.z=650;
 expect(g.botMovement(5)).toEqual(before);expect(g.fighters[5]!.yaw).toBe(yaw);expect(g.botMemory[5]).toBeNull();
});
test('a destroyed block opens visibility and allows targeting again',()=>{
 const g=scene();g.buildings[0]!.hp=0;expect(g.visibleEnemy(5)?.j).toBe(0);g.botMovement(5);
 expect(g.botAmmo[5]).toBe(29);expect(g.fighters[0]!.hp).toBe(88);
});
test('bots choose a farther visible opponent instead of a nearer hidden player',()=>{
 const g=scene();Object.assign(g.fighters[1]!,{hp:100,x:1800,y:426,z:1300});
 expect(g.visibleEnemy(5)?.j).toBe(1);g.botMovement(5);expect(g.fighters[0]!.hp).toBe(100);expect(g.fighters[1]!.hp).toBe(88);
});
test('losing sight stops firing and retains only a short-lived last-seen position',()=>{
 const g=scene();g.buildings[0]!.hp=0;g.botMovement(5);expect(g.botMemory[5]).toEqual({x:3000,z:0,expires:9});
 g.buildings[0]!.hp=152;g.fighters[0]!.z=650;g.fighters[5]!.cool=0;const ammo=g.botAmmo[5];
 g.botMovement(5);expect(g.botAmmo[5]).toBe(ammo);expect(g.botMemory[5]!.z).toBe(0);
 g.elapsed=10;g.botMovement(5);expect(g.botMemory[5]).toBeNull();
 g.respawn(5);expect(g.botMemory[5]).toBeNull();
});
test('blocks behind the target do not hide it, and changing height updates sight',()=>{
 const g=scene();g.buildings[0]!.x=3500;expect(g.visibleEnemy(5)?.j).toBe(0);
 g.buildings[0]!.x=2500;g.buildings[0]!.top=420;expect(g.visibleEnemy(5)?.j).toBe(0);
 g.buildings[0]!.top=200;expect(g.visibleEnemy(5)).toBeUndefined();
});
