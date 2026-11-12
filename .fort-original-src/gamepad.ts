export type ControllerInput={strafe:number;forward:number;lookX:number;lookY:number;rise:boolean;descend:boolean;quick:boolean;strong:boolean;melee:boolean;charge:boolean;slow:boolean};
export const neutralController=():ControllerInput=>({strafe:0,forward:0,lookX:0,lookY:0,rise:false,descend:false,quick:false,strong:false,melee:false,charge:false,slow:false});
export function stick(x=0,y=0):[number,number]{if(!Number.isFinite(x)||!Number.isFinite(y))return [0,0];const length=Math.hypot(x,y);if(length<=.18)return [0,0];const scale=Math.min(1,(length-.18)/.82)/length;return [x*scale,y*scale];}
export function pressed(pad:Gamepad,index:number){const b=pad.buttons[index];return !!b&&(b.pressed||b.value>.5);}
export function readController(pad:Gamepad):ControllerInput{if(!pad.connected||pad.mapping!=='standard')return neutralController();const [x,y]=stick(pad.axes[0],pad.axes[1]),[lookX,lookY]=stick(pad.axes[2],pad.axes[3]);return {strafe:x,forward:-y,lookX,lookY,rise:pressed(pad,0),descend:pressed(pad,1),quick:pressed(pad,7),strong:pressed(pad,6),melee:pressed(pad,5),charge:pressed(pad,4),slow:pressed(pad,2)};}
export type PadFrame={pad:Gamepad|null;input:ControllerInput;pause:boolean;confirm:boolean;menuX:number;menuY:number;disconnected:boolean;message:string};
/** Poll fresh Gamepad objects every frame. Keep one controller assigned to Player 1. */
export class GamepadReader{
 index:number|null=null;previous=new Set<number>();lastMenu=0;lastDirection='';
 poll(pads:readonly (Gamepad|null)[],now:number):PadFrame{
  const assigned=this.index===null?null:pads.find(p=>p?.connected&&p.index===this.index&&p.mapping==='standard')??null;
  const disconnected=this.index!==null&&!assigned;
  const pad=assigned??pads.find(p=>p?.connected&&p.mapping==='standard')??null;
  if(this.index!==pad?.index){this.previous.clear();this.lastDirection='';this.lastMenu=0;}
  this.index=pad?.index??null;
  const edge=(button:number)=>!!pad&&pressed(pad,button)&&!this.previous.has(button);
  const input=pad?readController(pad):neutralController();
  const dx=pad?Number(pressed(pad,15))-Number(pressed(pad,14)):0,dy=pad?Number(pressed(pad,13))-Number(pressed(pad,12)):0;
  let menuX=dx|| (Math.abs(input.strafe)>.65?Math.sign(input.strafe):0),menuY=dy||(Math.abs(input.forward)>.65?-Math.sign(input.forward):0);
  const direction=`${menuX},${menuY}`;
  if(direction===this.lastDirection&&now-this.lastMenu<250){menuX=0;menuY=0;}else if(menuX||menuY)this.lastMenu=now;
  this.lastDirection=direction;
  const result={pad,input,pause:edge(9),confirm:edge(0),menuX,menuY,disconnected,message:pad?`Controller ready: ${pad.id}`:pads.some(p=>p?.connected)?'Controller detected, but no standard mapping. Use a standard Xbox / PlayStation compatible mode.':'Connect a controller and press a button to detect it.'};
  this.previous=new Set(pad?pad.buttons.flatMap((_,i)=>pressed(pad,i)?[i]:[]):[]);return result;
 }
}
/** Navigate visible setup controls. Text entry remains available through the keyboard. */
export function navigateControllerMenu(root:HTMLElement,frame:Pick<PadFrame,'menuX'|'menuY'|'confirm'>){
 const controls=Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled)')).filter(el=>el.getClientRects().length>0);
 if(!controls.length)return false;
 const active=root.ownerDocument.activeElement as HTMLElement|null;let index=controls.indexOf(active!);
 if(frame.menuY){index=index<0?(frame.menuY>0?0:controls.length-1):(index+(frame.menuY>0?1:-1)+controls.length)%controls.length;controls[index]!.focus();controls[index]!.scrollIntoView({block:'nearest'});}
 const focused=root.ownerDocument.activeElement;
 if(focused instanceof HTMLSelectElement&&frame.menuX){focused.selectedIndex=(focused.selectedIndex+frame.menuX+focused.options.length)%focused.options.length;focused.dispatchEvent(new Event('change',{bubbles:true}));}
 if(frame.confirm){const target=controls.includes(focused as HTMLElement)?focused as HTMLElement:controls[0]!;if(target instanceof HTMLButtonElement){if(target.dataset.requiresGesture==='true'){target.focus();return true;}target.click();}else target.focus();}
 return false;
}
