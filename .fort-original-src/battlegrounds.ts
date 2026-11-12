export type Battleground={name:string;description:string;color:number[];fog:number[];buildings:number;layout:'outposts'|'city'|'ring'|'canyon'|'scattered'|'depot'|'spiral'|'clusters'|'fortress'|'terraces';terrain:(x:number,z:number)=>number};
const hills=(x:number,z:number)=>430+Math.sin(x*.009)*25+Math.sin(x*.0235)*12+Math.sin(z*.014)*12;
export const battlegrounds:Battleground[]=[
 {name:'Verdant Valley',description:'Rolling green hills and scattered concrete outposts. Room to find your rhythm.',color:[.49,.64,.36],fog:[.12,.23,.24],buildings:32,layout:'outposts',terrain:hills},
 {name:'Crimson Wastes',description:'Red dunes and weathered outposts. Use the ridgelines to break incoming fire.',color:[.66,.35,.25],fog:[.22,.13,.15],buildings:20,layout:'scattered',terrain:(x,z)=>420+Math.sin(x*.005+Math.sin(z*.002))*55+Math.cos(z*.007)*22},
 {name:'Midnight Peaks',description:'Moonlit mountain ridges with isolated towers. Take the high ground.',color:[.35,.39,.62],fog:[.08,.10,.19],buildings:16,layout:'scattered',terrain:(x,z)=>480-Math.abs(Math.sin(x*.003)*Math.cos(z*.004))*175},
 {name:'Neon District',description:'A dense grid of high-rise blocks. Fight down streets or above the skyline.',color:[.25,.31,.36],fog:[.06,.09,.17],buildings:60,layout:'city',terrain:(x,z)=>448+Math.sin(x*.002)*4+Math.cos(z*.003)*4},
 {name:'Frostbite Basin',description:'A frozen bowl surrounded by ice ridges. Open center, exposed approaches.',color:[.70,.83,.88],fog:[.36,.49,.59],buildings:12,layout:'ring',terrain:(x,z)=>470-110*Math.min(1,Math.pow((x-3600)/3400,2)+Math.pow(z/1700,2))+Math.sin(x*.007)*9},
 {name:'Ashfall Caldera',description:'A volcanic crater ringed with bunkers. Fly over the rim or take cover inside.',color:[.37,.29,.26],fog:[.20,.12,.09],buildings:18,layout:'ring',terrain:(x,z)=>{const r=Math.hypot((x-3600)/2300,z/1250);return 455-155*Math.exp(-Math.pow((r-1)*4,2))+Math.sin(x*.008+z*.005)*12;}},
 {name:'Sunscar Canyon',description:'Tall canyon walls flank a winding corridor. Follow the canyon or fly above it.',color:[.73,.55,.32],fog:[.42,.30,.20],buildings:24,layout:'canyon',terrain:(x,z)=>465-180*Math.min(1,Math.pow(Math.abs(z-Math.sin(x*.0015)*230)/750,2))+Math.sin(x*.006)*13},
 {name:'Emerald Ruins',description:'Overgrown terraces and broad ruined strongholds. Plenty of cover to demolish.',color:[.25,.51,.37],fog:[.09,.23,.19],buildings:28,layout:'scattered',terrain:(x,z)=>430-Math.floor((Math.sin(x*.002)+Math.cos(z*.003)+2)*2)*16+Math.sin(z*.01)*7},
 {name:'Stormglass Flats',description:'Pale windswept flats and staggered relay stations. Long sightlines favor ranged duels.',color:[.53,.70,.69],fog:[.24,.37,.42],buildings:22,layout:'spiral',terrain:(x,z)=>445+Math.sin(x*.003+z*.002)*12+Math.sin(z*.009)*8},
 {name:'Ironrail Depot',description:'Parallel warehouse rows split by broad freight lanes. Duck behind hangars or fight over their roofs.',color:[.45,.43,.36],fog:[.27,.25,.21],buildings:36,layout:'depot',terrain:(x,z)=>450+Math.sin(x*.0015)*6+Math.cos(z*.002)*5},
 {name:'Violet Sinkholes',description:'A field of sunken bowls with clustered research stations. Break line of sight below the ridges.',color:[.49,.35,.62],fog:[.22,.14,.32],buildings:25,layout:'clusters',terrain:(x,z)=>340+100*Math.pow(Math.sin(x*.0028)*Math.cos(z*.004),2)+Math.sin(z*.008)*10},
 {name:'Obsidian Citadel',description:'A dark fortress perimeter around a raised central plateau. Breach the walls or fly over the battlements.',color:[.26,.28,.32],fog:[.13,.15,.22],buildings:40,layout:'fortress',terrain:(x,z)=>450-120*Math.exp(-Math.pow((x-3600)/1500,4)-Math.pow(z/850,4))+Math.sin(x*.004)*8},
 {name:'Copperstep Mesa',description:'Layered sandstone benches with rooftop outposts on alternating terraces. Climb and strafe between elevations.',color:[.74,.43,.29],fog:[.43,.27,.22],buildings:30,layout:'terraces',terrain:(x,z)=>460-Math.floor((Math.sin(x*.0018)+Math.cos(z*.0025)+2)*2)*22+Math.sin(x*.008)*5},
];
export const getBattleground=(index:number)=>battlegrounds[index]??battlegrounds[0]!;
export function buildingLayout(index:number,i:number){const map=getBattleground(index);let x:number,z:number,width=150+i%3*35,depth=140+i%4*25,height=150+i%5*65;
 switch(map.layout){
 case 'spiral':{const angle=i/map.buildings*Math.PI*4,r=600+i*95;x=3600+Math.cos(angle)*r;z=Math.sin(angle)*r*.48;if(Math.abs(z)<220)z+=z<0?-300:300;width=130;depth=130;height=170+i%3*65;break;}
 case 'depot':x=550+i%9*760;z=(Math.floor(i/9)-1.5)*780;width=420;depth=250;height=140+i%3*40;break;
 case 'clusters':{const cluster=Math.floor(i/5),angle=cluster/5*Math.PI*2,cx=3600+Math.cos(angle)*2300,cz=Math.sin(angle)*1050;x=cx+(i%5-2)*150;z=cz+(i%2?180:-180);if(Math.abs(z)<250)z+=z<0?-300:300;width=110;depth=130;height=150+i%4*45;break;}
 case 'fortress':{const side=Math.floor(i/10),t=(i%10)/9;if(side<2){x=1900+t*3400;z=side===0?-950:950;}else{x=side===2?1900:5300;z=-720+t*1440;}width=200;depth=160;height=i%3===0?430:220;break;}
 case 'terraces':x=600+i%10*660;z=(Math.floor(i/10)-1)*1150;if(z===0)z=i%2?370:-370;width=210;depth=180;height=130+i%4*55;break;
 case 'city':x=700+i%10*640;z=(Math.floor(i/10)-2.5)*550; width=240+i%3*30;depth=220;height=260+i%5*90;break;
 case 'ring':{const angle=i/map.buildings*Math.PI*2;x=3600+Math.cos(angle)*2400;z=Math.sin(angle)*1250;height=110+i%4*45;break;}
 case 'canyon':x=500+Math.floor(i/2)*550;z=Math.sin(x*.0015)*230+(i%2?1:-1)*490;width=180;depth=160;height=160+i%4*40;break;
 case 'scattered':x=500+(i*947)%6200;z=(i*613)%2800-1400;if(Math.abs(z)<240)z+=z<0?-320:320;if(index===7){width=270;depth=230;height=120+i%4*55;}break;
 default:x=650+i%8*840;z=(Math.floor(i/8)-1.5)*850+(i%8%2)*110;
 }
 return {x,z,width,depth,height};
}
