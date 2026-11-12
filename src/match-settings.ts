import type { Game } from './game';
export type MatchSettings={arena:number;mode:string;player:string;opponent:string};
export function needsRoundRestart(game:Game,settings:MatchSettings){return game.arena!==settings.arena||game.ai!==(settings.mode==='cpu')||game.characterIds[0]!==settings.player||game.characterIds[1]!==settings.opponent;}
export function applyMatchSettings(game:Game,settings:MatchSettings){
 game.arena=settings.arena;
 game.characterIds=[settings.player,settings.opponent];
 game.ai=settings.mode==='cpu';
 game.reset();
 game.running=true;
 game.paused=true;
}
