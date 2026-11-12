export type Character = {id:string;name:string;title:string;body:number[];hair:number[];accent:string;build:number;spikes:number};
export const characters:Character[]=[
 {id:'sprout',name:'Sprout',title:'The original troublemaker',body:[.30,.53,.38],hair:[.72,.94,.36],accent:'#b8ee65',build:1,spikes:5},
 {id:'rook',name:'Rook',title:'Built like a wrecking ball',body:[.68,.30,.22],hair:[1,.57,.27],accent:'#ffab69',build:1.2,spikes:3},
 {id:'nova',name:'Nova',title:'A spark of pure chaos',body:[.32,.28,.65],hair:[.79,.59,1],accent:'#c99aff',build:.85,spikes:7},
 {id:'glacier',name:'Glacier',title:'Cold hands. Hot temper.',body:[.20,.48,.65],hair:[.57,.89,1],accent:'#8de5ff',build:1.15,spikes:4},
 {id:'ember',name:'Ember',title:'Small fuse. Big personality.',body:[.68,.22,.37],hair:[1,.36,.48],accent:'#ff748f',build:.9,spikes:6},
 {id:'volt',name:'Volt',title:'Never learned to sit still',body:[.61,.54,.19],hair:[1,.92,.35],accent:'#ffeb65',build:1,spikes:8},
];
export const characterById=(id:string)=>characters.find(c=>c.id===id)??characters[0]!;
export type Profile={player:string;opponent:string;names:Record<string,string>};
export const PROFILE_KEY='lbz.profile.v1';
const defaults=():Profile=>({player:'sprout',opponent:'rook',names:{}});
export function cleanName(value:string){return value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,24);}
export function readProfile(storage:Pick<Storage,'getItem'>):Profile{try{const raw:unknown=JSON.parse(storage.getItem(PROFILE_KEY)??'null');if(!raw||typeof raw!=='object')return defaults();const p=raw as Record<string,unknown>,names:Record<string,string>={};if(p.names&&typeof p.names==='object')for(const c of characters){const name=(p.names as Record<string,unknown>)[c.id];if(typeof name==='string'&&cleanName(name))names[c.id]=cleanName(name);}return {player:typeof p.player==='string'?characterById(p.player).id:'sprout',opponent:typeof p.opponent==='string'&&characters.some(c=>c.id===p.opponent)?p.opponent:'rook',names};}catch{return defaults();}}
export function saveProfile(storage:Pick<Storage,'setItem'>,profile:Profile){try{storage.setItem(PROFILE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
export const displayName=(profile:Profile,id:string)=>profile.names[id]||characterById(id).name;
