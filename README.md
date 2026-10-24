# Kiwood

A Godot 4 top-down action-RPG starter project. The world, terrain atlas, character art, and props are generated at runtime when their optional art files are absent.

## Folder structure

```text
art/                  Optional user art (tiles.png, player.png, decorations.png)
scenes/main.tscn      Main scene
scripts/
  art_assets.gd       Single art import/swap point and procedural placeholders
  decoration.gd       Y-sorted prop and its soft shadow
  enemy.gd            Chasing enemy, combat, and XP rewards
  hud.gd              Hearts, KI/XP/level, and nine-slot hotbar
  main.gd             Scene assembly and camera
  player.gd           Movement, melee combo, blast, dash, and progression
  projectile.gd       KI blast
  world.gd            Noise-based biome generation and terrain autotiling
project.godot
```

## Controls

- Move: WASD or arrow keys (diagonal movement is normalized).
- Melee combo: Space.
- KI blast: J (costs 20 KI; KI regenerates).
- Dash: Shift.
- Select hotbar slot: 1–9.

Defeat the purple creatures for XP. Level 2 strengthens KI blasts; level 3 strengthens melee and shortens dash recovery. Lava damages the player. A knockout respawns the player at the starting clearing.

## Add your art

The only asset lookup and placeholder-generation code is in `scripts/art_assets.gd`.

1. Open this project in Godot and ensure the `art` folder beside `project.godot` exists.
2. Copy your tileset PNG into that folder and name it exactly `tiles.png`. It must contain four 16×16 biome tiles across its first row in this order: candy, fire, ice, desert. Additional rows or columns are allowed.
3. In Godot's **FileSystem** dock, wait for `art/tiles.png` to appear. If it does not appear, right-click the `art` folder and choose **Reimport**, or use **Project > Reload Current Project**.
4. Select `tiles.png` and, in the **Import** dock, ensure **Mipmaps > Generate** is off; click **Reimport** if you change it. Nearest filtering is already set for the project in Project Settings.
5. Run the project with **F6** or **F5**. The runtime-generated **Ground** `TileMapLayer` uses a four-biome, side-matching Terrain Set and automatically connects terrain borders.
6. Optionally put a 64×64, 4-column by 4-row player sheet at `art/player.png`. Each frame is 16×16; rows are down, left, right, up.
7. Optionally put a 24×28 decoration sheet at `art/decorations.png` if you want to replace the generated prop textures. For a custom layout, update only the corresponding asset helper in `scripts/art_assets.gd`.

The terrain texture hook is `ArtAssets._terrain_base_image()` in `scripts/art_assets.gd`: it reads those four tiles from `res://art/tiles.png`, or creates flat-color placeholders when the PNG is missing. The atlas generator adds a single darker pixel on each biome boundary; matching interior edges receive no outline. You do not need to paint atlas tiles or configure terrain peering bits manually in the editor.

Missing art uses built-in pixel placeholders, so the project runs without importing any image files.

## Open and run

1. Install Godot 4.3 or newer.
2. In the Project Manager, choose **Import**, browse to this folder, and select `project.godot`.
3. Open the imported project and allow the initial filesystem scan/import to finish.
4. Press **F6** to run the current main scene or **F5** to run the project. If asked to choose a main scene, select `scenes/main.tscn`.
5. Use the controls above. The default window is 1440×810, a 3× integer scale of the 480×270 viewport. The HUD draws at viewport resolution and is automatically enlarged with the integer-scaled viewport.

The `World` builds a `TileMapLayer` and a runtime `TileSet` with a four-terrain, side-matching Terrain Set. FastNoiseLite creates broad biome regions and a separate detail layer marks lava pockets and drives in-biome variation. Scattered ground details vary by biome: candy grass and pebbles, fire cracks and speckles, ice fissures, and desert rocks. Lava tiles use orange, seeded yellow speckles and a dark outline only along the shore; standing on lava damages the player.
