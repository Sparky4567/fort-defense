import { ARENA_WIDTH, ARENA_HALF_DEPTH, ARENA_CEILING } from './arena';
export const CPU_MIN_DISTANCE = 650;
export const CPU_MAX_DISTANCE = 950;
type Position={x:number;y:number;z:number};
/** A firing-distance band prevents jitter and gives the player room to maneuver. */
export function opponentVelocity(cpu:Position,player:Position){
 const dx=cpu.x-player.x,dy=cpu.y-player.y,dz=cpu.z-player.z;
 const distance=Math.hypot(dx,dy,dz);
 const direction=distance>1?{x:dx/distance,y:dy/distance,z:dz/distance}:{x:1,y:0,z:0};
 let speed=0;
 if(distance<CPU_MIN_DISTANCE)speed=Math.min(380,(800-distance)*1.2);
 else if(distance>CPU_MAX_DISTANCE)speed=-Math.min(320,(distance-800)*.8);
 let x=direction.x*speed,z=direction.z*speed;
 let y=direction.y*speed+Math.max(-100,Math.min(100,(player.y-35-cpu.y)*1.5));
 // Slide along arena edges rather than retreating endlessly into the boundary.
 if((cpu.x<100&&x<0)||(cpu.x>ARENA_WIDTH-100&&x>0)){x=0;z=(cpu.z>=player.z?1:-1)*300;}
 if((cpu.z< -ARENA_HALF_DEPTH+100&&z<0)||(cpu.z>ARENA_HALF_DEPTH-100&&z>0)){z=0;x=(cpu.x<ARENA_WIDTH/2?1:-1)*300;}
 if(cpu.y<ARENA_CEILING+80&&y<0)y=0;
 return {x,y,z,distance};
}
