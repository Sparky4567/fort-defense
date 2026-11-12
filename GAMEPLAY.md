# Fort / Defense

Run `bun install` and `bun run dev`, then open the local URL and choose a battleground and click Begin Match. A desktop browser with WebGL and pointer lock is required. Begin Match requests fullscreen; when the browser blocks fullscreen, play continues in the page. Escape pauses and releases the mouse.

The app now opens a first-person 5v5 team deathmatch: one human and four allied bots against five enemy bots. Networking is not implemented. The old arena simulation remains available as source for its existing tests.

- WASD: move; mouse: aim; hold left click: automatic rifle fire.
- R: reload (2.1 seconds, with countdown and progress bar; empty magazines automatically reload); Space: jump; Shift: walk; Escape: pause.
- Rifle: 30 rounds, 120 reserve, 20 damage per player rifle hit (five hits to eliminate a full-health enemy); bots deal 12 damage per hit, 38 block damage. Friendly units block shots but take no damage.
- Wood blocks break in one hit, brick in two, concrete in four. Intact blocks block both bullets and movement; removed blocks open paths. Blocks above a breach remain suspended: structural collapse is not simulated.
- Matches last 10 minutes (600 seconds). Every enemy elimination earns the attacking team one point. Most points at timeout wins; equal scores draw. Squad wipes do not end the match.
- Players and bots respawn after 3 seconds with full health and ammunition. A 2-second shield protects respawns and ends when firing. Destruction and scores persist through respawns. Pause to restart early.
- Choose from 14 battlegrounds before deploying or from the pause menu; see README.md for the complete list. Each uses a distinct destructible layout and environment palette. Changing maps starts a fresh match. All maps have a 6,000 × 3,060-unit playable area, about 2.8 times the previous size.
- Your health bar shows 0–100 HP; other units also have health bars above them. Bots reload their magazines too.
- Every new match resets scores, rebuilds the fortress, and restores ammunition and health.

Verification: `bun run typecheck`, `bun test`, `bun run build`.

The sandbox initially supplied source and build directories owned by another user. Original copies are preserved in `.fort-original-src` and `.fort-original-dist`; the writable `src` and `dist` directories contain the current game.
