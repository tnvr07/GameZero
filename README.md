# Kiwood

A Godot 4 top-down action-RPG starter project. The world, terrain atlas, character art, and props are generated at runtime when their optional art files are absent.

## Folder structure

```text
art/
  tiles.png           Optional 16x16 biome tiles
  player.png          Optional 16x24 player sprite sheet
  objects/            Optional per-object PNG textures
scenes/
  main.tscn           Main scene
  world_object.tscn   Y-sorted Sprite2D object, shadow, and collision
scripts/
  art_assets.gd       Single art import/swap point and procedural placeholders
  enemy.gd            Chasing enemy, combat, and XP rewards
  hud.gd              Hearts, KI/XP/level, and nine-slot hotbar
  main.gd             Scene assembly and camera
  player.gd           Movement, melee combo, blast, dash, and progression
  projectile.gd       KI blast
  world.gd            Noise-based biome generation and terrain autotiling
  world_object.gd     Sprite, shadow, and prop collision setup
project.godot
```

## Controls

- Move: WASD or arrow keys (diagonal movement is normalized).
- Melee combo: Space.
- KI blast: J (costs 20 KI; KI regenerates).
- Dash: Shift.
- Select hotbar slot: 1–9.
- Movement collision debug grid/hitbox: F3.

Defeat the purple creatures for XP. Level 2 strengthens KI blasts; level 3 strengthens melee and shortens dash recovery. Lava damages the player. A knockout respawns the player at the starting clearing.

## Add your art

All optional art lookup and placeholder generation is centralized in `scripts/art_assets.gd`.

1. Open this project in Godot and ensure the `art` folder beside `project.godot` exists.
2. Copy your tileset PNG into that folder and name it exactly `tiles.png`. It must contain four 16×16 biome tiles across its first row in this order: candy, fire, ice, desert. Additional rows or columns are allowed.
3. In Godot's **FileSystem** dock, wait for `art/tiles.png` to appear. If it does not appear, right-click the `art` folder and choose **Reimport**, or use **Project > Reload Current Project**.
4. Select `tiles.png` and, in the **Import** dock, ensure **Mipmaps > Generate** is off; click **Reimport** if you change it. Nearest filtering is already set for the project in Project Settings.
5. Run the project with **F6** or **F5**. The runtime-generated **Ground** `TileMapLayer` uses a four-biome, side-matching Terrain Set and automatically connects terrain borders.
6. Optionally put a player sheet at `art/player.png`. Use 16×24 frames arranged in four columns and four directional rows (top to bottom: down, left, right, up). Column 1 is the idle pose; the walk animation uses all four columns.
7. Optionally add individual PNGs to `art/objects/` to replace the per-object placeholders. Use these exact filenames: `tree.png`, `rock.png`, `crystal.png`, `grass_tuft.png`, `pebble.png`, `fire_crack.png`, `fire_speckles.png`, `ice_crack.png`, and `small_rock.png`. Keep transparent padding and place each object's feet at the bottom of its image. Larger scenery props have blocking collision; ground details have a collision shape that is disabled.

The terrain texture hook is `ArtAssets._terrain_base_image()` in `scripts/art_assets.gd`: it reads those four tiles from `res://art/tiles.png`, or creates flat-color placeholders when the PNG is missing. The atlas generator adds a single darker pixel on each biome boundary; matching interior edges receive no outline. `ArtAssets.object_texture()` loads each object from `res://art/objects/` or supplies a colored pixel-art placeholder. `ArtAssets.player_texture()` is the single player-sheet swap point; its SpriteFrames setup creates four idle and four walk directional animations. You do not need to paint atlas tiles or configure terrain peering bits manually in the editor.

Missing art uses built-in pixel placeholders, so the project runs without importing any image files.

## Open and run

1. Install Godot 4.3 or newer.
2. In the Project Manager, choose **Import**, browse to this folder, and select `project.godot`.
3. Open the imported project and allow the initial filesystem scan/import to finish.
4. Press **F6** to run the current main scene or **F5** to run the project. If asked to choose a main scene, select `scenes/main.tscn`.
5. Use the controls above. The default window is 1440×810, a 3× integer scale of the 480×270 viewport. The HUD draws at viewport resolution and is automatically enlarged with the integer-scaled viewport.

The `World` builds a `TileMapLayer` and a runtime `TileSet` with a four-terrain, side-matching Terrain Set. Candy terrain uses lime green (#b9dd4f/#a3cc3f), fire uses maroon (#6b2d3a/#52222f), ice uses pale lavender-white (#e8eaf8), and desert uses sand (#e0ae60/#c8934a). Low-frequency FastNoiseLite creates broad biome regions, and two cellular-automata majority passes smooth both biome borders and independently noise-generated lava pools, removing single-cell spikes and filling one-cell holes. Terrain atlas edge variants curve the one-pixel outlines at corner transitions. A second low-frequency FastNoiseLite layer assigns three flat terrain-shade variants in broad patches; a one-pixel outline is drawn only where adjacent patches in the same biome meet, leaving tile interiors seamless. A separate detail layer drives in-biome variation. Scattered ground details vary by biome: candy grass and pebbles, fire cracks and speckles, ice fissures, and desert rocks. Candy lava is red-orange (#e04a2a); fire lava is orange (#ff6a10) with yellow (#ffc233) speckles. Both have dark shore edges and damage the player.

The supplied `VS221_MapPixelMovement.js` is an RPG Maker MV/MZ plugin and cannot be loaded by Godot. Its core movement idea is implemented natively instead: the player and enemies use 12-pixel maximum collision substeps, compact rectangular body hitboxes, and sliding motion along collision surfaces. Dashes use the same collision-aware movement. Press **F3** to toggle the player hitbox and a 12-pixel debug grid.

The HUD uses 9×8 generated pixel-art heart textures (full, half, empty) and a built-in 3×5 bitmap glyph set rendered as integer-sized rectangles, so it needs no font download/import and has no font antialiasing.
