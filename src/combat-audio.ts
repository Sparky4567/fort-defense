export type SoundKind='rifle'|'flyby'|'wood'|'brick'|'concrete'|'break'|'hit'|'ground';
export type Point={x:number;y:number;z:number};
export type CombatSound={kind:SoundKind;position:Point;delay?:number};

export function spatialSound(listener:Point,yaw:number,source:Point){
 const dx=source.x-listener.x,dy=source.y-listener.y,dz=source.z-listener.z;
 const distance=Math.hypot(dx,dy,dz);
 return {gain:1/(1+(distance/1200)**2),pan:Math.max(-1,Math.min(1,(dx*Math.cos(yaw)+dz*Math.sin(yaw))/Math.max(80,Math.hypot(dx,dz))))};
}
// Only the traveled segment counts: shots stopped by cover cannot fly past you.
export function bulletPass(origin:Point,direction:Point,distance:number,listener:Point){
 const t=(listener.x-origin.x)*direction.x+(listener.y-origin.y)*direction.y+(listener.z-origin.z)*direction.z;
 if(t<45||t>distance-20)return null;
 const position={x:origin.x+direction.x*t,y:origin.y+direction.y*t,z:origin.z+direction.z*t};
 return Math.hypot(position.x-listener.x,position.y-listener.y,position.z-listener.z)<180?{position,distance:t}:null;
}

/** Synthesized combat audio; no external sound files or downloads. */
export class CombatAudio{
 context:AudioContext|null=null;master:GainNode|null=null;noise:AudioBuffer|null=null;
 voices=new Set<AudioBufferSourceNode>();muted=false;disposed=false;
 async unlock(){
  if(this.disposed||this.muted)return;
  try{if(!this.context){const ctx=new AudioContext();this.context=ctx;this.master=ctx.createGain();this.master.gain.value=.6;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=8;this.master.connect(limiter);limiter.connect(ctx.destination);
   this.noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.4),ctx.sampleRate);const data=this.noise.getChannelData(0);for(let n=0;n<data.length;n++)data[n]=Math.random()*2-1;
  }if(this.context.state==='suspended')await this.context.resume();}catch{/* Unsupported or blocked audio must not prevent play. */}
 }
 setMuted(muted:boolean){this.muted=muted;if(this.master)this.master.gain.value=muted?0:.6;if(muted)this.stop();}
 stop(){for(const voice of [...this.voices]){try{voice.stop();}catch{}}}
 play(event:CombatSound,listener:Point,yaw:number){
  const ctx=this.context;if(this.disposed||this.muted||!ctx||ctx.state!=='running'||!this.noise||!this.master||this.voices.size>=64)return;
  const spatial=spatialSound(listener,yaw,event.position);if(spatial.gain<.012)return;
  const profile:Record<SoundKind,[number,number,number]>={rifle:[.18,1800,.65],flyby:[.12,3800,.32],wood:[.12,650,.4],brick:[.15,1900,.42],concrete:[.19,3200,.44],break:[.32,950,.6],hit:[.09,550,.24],ground:[.13,850,.3]};
  const [duration,frequency,volume]=profile[event.kind],when=ctx.currentTime+Math.max(0,event.delay??0);
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),envelope=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=this.noise;
  filter.type=event.kind==='flyby'?'bandpass':'lowpass';filter.Q.value=event.kind==='flyby'?3:.7;filter.frequency.setValueAtTime(frequency,when);filter.frequency.exponentialRampToValueAtTime(event.kind==='flyby'?900:Math.max(100,frequency*.25),when+duration);
  envelope.gain.setValueAtTime(.0001,when);envelope.gain.exponentialRampToValueAtTime(Math.max(.0002,spatial.gain*volume),when+.006);envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);pan.pan.value=spatial.pan;
  source.connect(filter);filter.connect(envelope);envelope.connect(pan);pan.connect(this.master);this.voices.add(source);
  source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();pan.disconnect();this.voices.delete(source);};source.start(when);source.stop(when+duration);
 }
 dispose(){this.disposed=true;this.stop();this.master?.disconnect();void this.context?.close().catch(()=>{});this.context=null;this.noise=null;}
}
