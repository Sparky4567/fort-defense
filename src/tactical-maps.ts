import type {Building} from './game';

// Shared bounds for rendering, movement, perimeter construction, and map tests.
export const TACTICAL_BOUNDS={minX:600,maxX:6600,minZ:-1530,maxZ:1530};
export const tacticalMaps=[
 {name:'Citadel',arena:0,description:'Twin brick strongholds and a divided central courtyard.'},
 {name:'Sunscar Outpost',arena:6,description:'Staggered desert compounds divide three assault lanes.'},
 {name:'Ironrail Depot',arena:9,description:'Long freight sheds with loading bays and side passages.'},
 {name:'Frostbite Keep',arena:4,description:'A frozen central keep with four entrances and outer bunkers.'},
 {name:'Crimson Crossroads',arena:1,description:'Four red-dust compounds surround an exposed crossroads.'},
 {name:'Midnight Relay',arena:2,description:'Relay towers and offset screens break long moonlit sightlines.'},
 {name:'Neon Precinct',arena:3,description:'Dense city blocks form intersecting streets and alleys.'},
 {name:'Ashfall Foundry',arena:5,description:'Industrial furnace enclosures flank a central freight lane.'},
 {name:'Emerald Sanctuary',arena:7,description:'Broken garden walls and nested ruin courtyards.'},
 {name:'Stormglass Array',arena:8,description:'A radial relay array with gaps between concentric defenses.'},
 {name:'Violet Laboratories',arena:10,description:'Research wings, connecting corridors, and service yards.'},
 {name:'Obsidian Bastion',arena:11,description:'Two layered fortress gates guard an inner bastion.'},
 {name:'Copperstep Quarry',arena:12,description:'Stepped-height retaining walls and staggered supply stacks.'},
 {name:'Timber Exchange',arena:0,description:'Destructible timber stockpiles create alternating freight lanes.'},
];

export function buildTacticalMap(index:number):Building[]{
 const blocks:Building[]=[];
 const wall=(x:number,z:number,n:number,axis:'x'|'z',style=0,height=3)=>{
  for(let row=0;row<height;row++)for(let col=0;col<n;col++){
   const hp=[76,38,152][style]!;
   blocks.push({x:x+(axis==='x'?col*90:0),z:z+(axis==='z'?col*90:0),width:89,depth:89,base:450-row*60,top:390-row*60,hp,maxHp:hp,style});
  }
 };
 // Three-sided rooms preserve open entrances rather than sealed bot traps.
 const room=(x:number,z:number,w=6,d=6,style=0,height=4)=>{wall(x,z,w,'x',style,height);wall(x,z+90*(d-1),w,'x',style,height);wall(x,z+90,d-2,'z',style,height);};
 const crates=(x:number,z:number,n=3)=>wall(x,z,n,'x',1,2);
 wall(540,-1590,69,'x',2,3);wall(540,1590,69,'x',2,3);wall(540,-1500,35,'z',2,3);wall(6660,-1500,35,'z',2,3);
 switch(index){
 case 0:
  for(const x of [2100,4440])for(const z of [-1170,450])room(x,z,7,7);
  wall(3450,-1260,10,'z',2);wall(3750,450,10,'z',2);
  for(const x of [1650,3000,4080,5520])for(const z of [-180,180])crates(x,z);break;
 case 1:
  for(const x of [1800,3150,4770])for(const z of [-1170,450])room(x,z,6,7,0,3);
  for(const x of [2100,3600,5070])crates(x,-90,5);break;
 case 2:
  for(const z of [-1260,-540,180,900]){wall(1950,z,36,'x',2,4);wall(1950,z,5,'z',0,4);wall(5100,z,5,'z',0,4);}
  for(const x of [1470,5580])for(const z of [-810,-90,630])crates(x,z,4);break;
 case 3:
  for(const z of [-900,900]){wall(2910,z,6,'x',2,5);wall(3900,z,6,'x',2,5);}
  for(const x of [2910,4350]){wall(x,-900,8,'z',0,5);wall(x,270,8,'z',0,5);}
  for(const x of [1710,5040])for(const z of [-1170,720])room(x,z,5,5,2,3);break;
 case 4:
  for(const x of [1980,4320])for(const z of [-1170,450])room(x,z,9,8,0,3);
  for(const z of [-1350,-540,450,1260])crates(3450,z,4);break;
 case 5:
  for(const x of [1800,2700,4050,5130]){room(x,-990+(x%4)*90,4,4,2,7);wall(x+270,180,8,'z',0,3);crates(x,1170,3);}break;
 case 6:
  for(const x of [1650,2820,3990,5160])for(const z of [-1260,-270,720])room(x,z,5,6,0,4+(x%3));break;
 case 7:
  for(const x of [1800,3150,4680])for(const z of [-1260,450]){room(x,z,8,8,2,5);crates(x+90,z+270,4);}
  wall(3450,-180,5,'x',0,2);break;
 case 8:
  for(const x of [1800,3150,4590])for(const z of [-1260,540]){room(x,z,7,7,0,2);wall(x+180,z+180,3,'z',2,4);}
  for(const x of [2340,3780,5220])wall(x,-360,6,'z',0,2);break;
 case 9:
  for(let ring=0;ring<2;ring++)for(let n=0;n<10;n++){
   const angle=n*Math.PI/5,r=ring?2100:1050;
   const x=Math.round((3600+Math.cos(angle)*r)/90)*90,z=Math.round(Math.sin(angle)*r*.6/90)*90;
   wall(x,z,3,n%2?'x':'z',ring?0:2,ring?3:5);
  }crates(3510,-90,3);break;
 case 10:
  for(const x of [1800,3780])for(const z of [-1260,540]){room(x,z,15,7,2,4);wall(x+540,z+90,4,'z',0,3);}
  for(const x of [2160,4140])wall(x,-180,8,'x',1,2);break;
 case 11:
  for(const x of [2250,4680]){wall(x,-1440,12,'z',2,5);wall(x,450,12,'z',2,5);room(x-180,-1260,5,5,0,7);}
  for(const z of [-630,630])wall(3240,z,9,'x',2,4);crates(3510,-90,3);break;
 case 12:
  for(let row=0;row<5;row++){const z=-1260+row*630;for(let col=0;col<3;col++){const x=1800+col*1350+(row%2)*270;wall(x,z,8,'x',0,2+row%3);wall(x,z,3,'z',2,2);crates(x+270,z+180,3);}}break;
 case 13:
  for(let col=0;col<7;col++){const x=1710+col*540;for(const z of [-1260,-450,360,1170])wall(x,z,5,'x',1,2+col%3);wall(x,col%2?-900:540,5,'z',1,3);}
  for(const x of [2160,4500])room(x,-180,5,5,2,3);break;
 default:return buildTacticalMap(0);
 }
 return blocks;
}
