# Fort / Defense

A first-person 5v5 tactical shooter built with React, TypeScript, Bun, and native WebGL. Fight alongside four allied bots against five enemy bots in fortresses built from destructible blocks. Shoot through cover to open sightlines and create new routes.

Matches run locally in your browser. The current game supports one human player and nine bots.

## Play locally

Install [Bun](https://bun.sh/), then run:

```sh
bun install
bun run dev
```

Open the URL printed in the terminal, usually `http://localhost:3000`. Choose a battleground and click **Begin Match**.

Use a desktop browser with WebGL and pointer lock support. Begin Match requests fullscreen and captures the mouse. If fullscreen is blocked, the game can still run in the page; mouse capture is required. Press **Escape** to pause and release the mouse, then click **Resume Operation** to continue.

## Combat and match rules

- **5v5 team deathmatch:** you and four allied bots fight five enemy bots. Each enemy elimination earns the attacking team one point, including eliminations by bots.
- **100 health:** your HUD shows a health bar and HP count; other units have overhead health bars. Your rifle deals 20 damage per hit, requiring five hits against a full-health enemy. Bots deal 12 damage per hit.
- **Reloading:** the rifle holds 30 rounds with 120 reserve rounds. Reloading takes 2.1 seconds and shows a countdown and progress bar. Empty magazines automatically reload while reserve ammunition remains. Firing is blocked during reloads. Bots also reload their magazines.
- **Ten-minute matches:** the team with the most points after 600 seconds wins. Equal scores produce a draw. Eliminating an entire squad does not end the match.
- **Automatic respawns:** everyone returns three seconds after elimination with 100 health and fresh ammunition. Your HUD shows the respawn countdown. Respawn protection lasts two seconds and ends immediately if you fire.
- **Cover blocks bot vision:** bots acquire and fire only at visible opponents. After losing sight, they can investigate the last visible position for four seconds, then resume fixed patrol routes. Destroyed blocks open sightlines. This applies to both bot teams.
- **Friendly units block bullets** but take no damage.

Each new match resets team scores and restores health, ammunition, and every destroyed block. Respawning preserves team scores and battlefield destruction. Changing the battleground from the pause menu immediately starts a fresh match. Press Escape and choose **New match** to restart early.

## Controls

| Action | Control |
| --- | --- |
| Move | W / A / S / D |
| Aim | Mouse movement |
| Fire automatic rifle | Hold left mouse button |
| Reload | R |
| Jump | Space |
| Walk slowly | Hold Shift |
| Pause and release mouse | Escape |
| Enable or disable sound | Sound On / Sound Off button in the page header |

## Combat audio

Gunfire from your rifle and both bot teams uses stereo positioning and distance attenuation. Nearby bullets produce a brief flyby sound along their unobstructed path. Wood, brick, concrete, ground, unit hits, and block destruction have distinct synthesized effects; impact and flyby sounds include a short bullet travel delay.

Audio activates when you click **Begin Match** or **Resume Operation**. Use **Sound On / Sound Off** in the page header to mute or enable all combat effects. Stereo headphones make shot direction easier to hear. Sounds are generated with the Web Audio API; no external audio files are required.

## Destructible cover

Walls, fortifications, and crates consist of individual blocks. Intact blocks stop bullets and player movement. Destroying a block removes its collision, allowing shots and movement through a sufficiently large breach.

| Material | Block health | Rifle hits to destroy |
| --- | ---: | ---: |
| Wood | 38 | 1 |
| Brick | 76 | 2 |
| Concrete | 152 | 4 |

Rifle hits deal 38 damage to blocks. Damaged blocks darken, and destroyed blocks produce debris particles. Blocks above a breach remain suspended; structural collapse is not simulated.

## Battlegrounds

Choose a map before beginning a match or while paused. Each has its own block layout and environment palette.

| Battleground | Layout |
| --- | --- |
| **Citadel** | Brick strongholds, concrete courtyard barriers, and wooden supply crates. |
| **Sunscar Outpost** | Warm sandstone-colored compounds and staggered barricades dividing three assault lanes. |
| **Ironrail Depot** | Long warehouse walls and freight cover with narrow flanking routes. |
| **Frostbite Keep** | A central keep with four entrances and scattered bunkers in a frozen palette. |
| **Crimson Crossroads** | Four desert compounds surrounding an exposed intersection. |
| **Midnight Relay** | Tall relay towers with offset screens and moonlit firing lanes. |
| **Neon Precinct** | Dense city blocks forming intersecting streets and alleys. |
| **Ashfall Foundry** | Furnace enclosures and supply yards around a freight lane. |
| **Emerald Sanctuary** | Low garden walls and nested ruined courtyards. |
| **Stormglass Array** | Two rings of relay defenses with gaps for flanking. |
| **Violet Laboratories** | Research wings with partitions and service yards. |
| **Obsidian Bastion** | Layered fortress gates and a protected inner bastion. |
| **Copperstep Quarry** | Retaining walls of varying heights and supply stacks. |
| **Timber Exchange** | Alternating timber stockpiles and freight lanes. |

All 14 tactical maps use flat ground and destructible block structures. The playable area is **6,000 × 3,060 simulation units**, about **2.8 times** the previous area (3,100 × 2,120). Opposing squads spawn near opposite ends, with cover and flanking routes across the expanded battlefield. Their environment palettes come from the existing renderer's map definitions.

## Development

```sh
bun run typecheck   # TypeScript checks
bun test            # Tactical gameplay and existing arena regression tests
bun run build       # Static production bundle in dist/
bun start           # Bun server from source, with development features disabled
```

Serve `dist/` with a static web host to deploy the production build. `bun start` serves the source application through Bun rather than the generated `dist/` files.

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Current React interface, HUD, map selection, input, fullscreen, and mouse capture. |
| `src/tactical.ts` | 5v5 deathmatch simulation, team scoring, respawns, bots, reloading, and hitscan collisions. |
| `src/tactical-maps.ts` | Fourteen destructible map layouts and shared playable bounds. |
| `src/combat-audio.ts` | Synthesized positional gunfire, bullet flybys, impacts, mixing, and audio cleanup. |
| `src/tactical.css` | Tactical interface, fullscreen layout, health bars, and reload feedback. |
| `src/renderer3d.ts` | WebGL rendering, block damage visuals, unit models, and overhead health bars. |
| `src/game.ts` | Shared simulation foundation and earlier flying arena mode. |
| `src/battlegrounds.ts` | Existing environment palettes and legacy arena definitions. |
| `tactical.test.ts` | Tactical combat, reloading, ray intersections, map resets, and spawn checks. |
| `tests/` | Existing arena, controller, profile, settings, and fullscreen regression tests. |

The earlier flying arena implementation remains in the repository for shared functionality and regression coverage. Its character selection, local duel, flight controls, and controller support are not exposed by the current tactical interface.

## Current scope and troubleshooting

Online multiplayer, bomb objectives, weapon purchasing, and structural collapse are not implemented. Bots use simple movement and targeting rather than navigation meshes. The current interface is designed for desktop keyboard and mouse play.

- **Mouse capture fails:** open the game in its own browser tab and click Begin Match or Resume Operation again. Embedded previews may restrict pointer lock.
- **Fullscreen fails:** the game falls back to playing in the page. Browser permissions determine fullscreen availability.
- **No combat audio:** check that the header shows Sound On, your browser tab and device are unmuted, and click Resume Operation or toggle sound off and on to allow browser audio.
- **Graphics fail to initialize:** use a WebGL-capable browser with hardware acceleration enabled.
- **The rifle will not fire:** check whether you are reloading, have exhausted your magazine and reserve, or are waiting to respawn.

Automated tests cover simulation behavior. Fullscreen, pointer lock, rendering, and gameplay feel still require testing in a real browser.

## License and attribution

Fort / Defense is distributed under the [MIT License](LICENSE), copyright © 2026 Sparky4567. Third-party dependencies and fonts retain their respective licenses.

The current game takes inspiration from classic tactical shooters such as Counter-Strike 1.6. The earlier arena implementation was inspired by Lemmingball Z. This is an independent project, with no affiliation or endorsement by those games or their creators. This repository does not bundle their assets.
