extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")
const EnemyScript = preload("res://scripts/enemy.gd")
const WorldObjectScene: PackedScene = preload("res://scenes/world_object.tscn")

const WORLD_RADIUS := 64
const DECORATION_COUNT := 300
const GROUND_DETAIL_COUNT := 480
const TERRAIN_SOURCE_ID := 0
const LAVA_SOURCE_ID := 1
const CARDINAL_OFFSETS: Array[Vector2i] = [
	Vector2i.UP,
	Vector2i.RIGHT,
	Vector2i.DOWN,
	Vector2i.LEFT,
]

var player: CharacterBody2D
var ground: TileMapLayer
var patch_outlines: Node2D
var enemies: Node2D
var actors: Node2D
var _lava_cells: Dictionary = {}
var _biome_cells: Dictionary = {}
var _biome_noise := FastNoiseLite.new()
var _lava_noise := FastNoiseLite.new()
var _patch_noise := FastNoiseLite.new()
var _variation_noise := FastNoiseLite.new()

func _ready() -> void:
	_create_tilemap()
	_generate_world()
	_scatter_decorations()

func _create_tilemap() -> void:
	ground = TileMapLayer.new()
	ground.name = "Ground"
	ground.y_sort_enabled = false
	var tile_set := TileSet.new()
	tile_set.tile_size = Vector2i(16, 16)
	tile_set.add_terrain_set()
	var terrain_set := tile_set.get_terrain_sets_count() - 1
	tile_set.set_terrain_set_mode(terrain_set, TileSet.TERRAIN_MODE_MATCH_SIDES)
	for biome in range(4):
		tile_set.add_terrain(terrain_set)
		var terrain := tile_set.get_terrains_count(terrain_set) - 1
		tile_set.set_terrain_name(terrain_set, terrain, ["Candy", "Fire", "Ice", "Desert"][biome])
	var terrain_source := TileSetAtlasSource.new()
	terrain_source.texture = ArtAssets.terrain_atlas_texture()
	terrain_source.texture_region_size = Vector2i(16, 16)
	tile_set.add_source(terrain_source, TERRAIN_SOURCE_ID)
	for biome in range(4):
		for shade in range(ArtAssets.TERRAIN_SHADE_COUNT):
			for variant in range(256):
				var atlas_index: int = ArtAssets.terrain_atlas_index(biome, shade, variant)
				var atlas_coords := Vector2i(atlas_index % 32, int(atlas_index / 32))
				terrain_source.create_tile(atlas_coords)
				var tile_data: TileData = terrain_source.get_tile_data(atlas_coords, 0)
				tile_data.terrain_set = terrain_set
				tile_data.terrain = biome
				for side in range(4):
					var neighbor := (variant >> (side * 2)) & 3
					var peering_bit: int = [
						TileSet.CELL_NEIGHBOR_TOP_SIDE,
						TileSet.CELL_NEIGHBOR_RIGHT_SIDE,
						TileSet.CELL_NEIGHBOR_BOTTOM_SIDE,
						TileSet.CELL_NEIGHBOR_LEFT_SIDE,
					][side]
					tile_data.set_terrain_peering_bit(peering_bit, neighbor)
	var lava_source := TileSetAtlasSource.new()
	lava_source.texture = ArtAssets.lava_texture()
	lava_source.texture_region_size = Vector2i(16, 16)
	for shore_mask in range(16):
		for variation in range(16):
			lava_source.create_tile(_lava_atlas_coords(shore_mask, variation))
	tile_set.add_source(lava_source, LAVA_SOURCE_ID)
	ground.tile_set = tile_set
	add_child(ground)
	patch_outlines = Node2D.new()
	patch_outlines.name = "GroundPatchOutlines"
	patch_outlines.set_script(preload("res://scripts/ground_patch_outlines.gd"))
	add_child(patch_outlines)

	actors = Node2D.new()
	actors.name = "Actors"
	actors.y_sort_enabled = true
	add_child(actors)
	enemies = Node2D.new()
	enemies.name = "Enemies"
	enemies.y_sort_enabled = true
	actors.add_child(enemies)

func _generate_world() -> void:
	_biome_noise.seed = 198407
	_biome_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_biome_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	_biome_noise.fractal_octaves = 2
	_biome_noise.frequency = 0.008
	_lava_noise.seed = 28401
	_lava_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_lava_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	_lava_noise.fractal_octaves = 2
	_lava_noise.frequency = 0.018
	_patch_noise.seed = 36602
	_patch_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_patch_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	_patch_noise.fractal_octaves = 2
	_patch_noise.frequency = 0.014
	_variation_noise.seed = 90721
	_variation_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_variation_noise.frequency = 0.075

	var candy_cells: Array[Vector2i] = []
	var fire_cells: Array[Vector2i] = []
	var ice_cells: Array[Vector2i] = []
	var desert_cells: Array[Vector2i] = []
	for y in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
		for x in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
			var cell := Vector2i(x, y)
			_biome_cells[cell] = _biome_for_value(_biome_noise.get_noise_2d(x, y))
	_biome_cells = _smooth_biomes(_biome_cells, 2)
	for y in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
		for x in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
			var cell := Vector2i(x, y)
			if cell.length() < 5:
				_biome_cells[cell] = 0
	for cell in _biome_cells:
		match _biome_cells[cell]:
			0:
				candy_cells.append(cell)
			1:
				fire_cells.append(cell)
			2:
				ice_cells.append(cell)
			_:
				desert_cells.append(cell)
	ground.set_cells_terrain_connect(candy_cells, 0, 0, true)
	ground.set_cells_terrain_connect(fire_cells, 0, 1, true)
	ground.set_cells_terrain_connect(ice_cells, 0, 2, true)
	ground.set_cells_terrain_connect(desert_cells, 0, 3, true)
	var patch_shades: Dictionary = {}
	for cell in _biome_cells:
		patch_shades[cell] = _patch_shade_at(cell)
	_apply_patch_shades(patch_shades)
	patch_outlines.call("configure", _biome_cells, patch_shades, _lava_cells)

	var lava_candidates: Dictionary = {}
	for cell in _biome_cells:
		lava_candidates[cell] = _biome_cells[cell] == 1 and _lava_noise.get_noise_2d(cell.x, cell.y) > 0.18
	_lava_cells = _smooth_lava(lava_candidates, _biome_cells, 2)
	for lava_cell in _lava_cells:
		var shore_mask := 0
		for side in range(CARDINAL_OFFSETS.size()):
			if not _lava_cells.has(lava_cell + CARDINAL_OFFSETS[side]):
				shore_mask |= 1 << side
		var variation := posmod(hash(lava_cell), 16)
		ground.set_cell(lava_cell, LAVA_SOURCE_ID, _lava_atlas_coords(shore_mask, variation))
	patch_outlines.call("configure", _biome_cells, patch_shades, _lava_cells)

func _patch_shade_at(cell: Vector2i) -> int:
	var value := _patch_noise.get_noise_2d(cell.x, cell.y)
	if value < -0.24:
		return 0
	if value > 0.24:
		return 2
	return 1

func _apply_patch_shades(patch_shades: Dictionary) -> void:
	for cell in _biome_cells:
		var atlas_coords := ground.get_cell_atlas_coords(cell)
		if atlas_coords == Vector2i(-1, -1):
			continue
		var old_index := atlas_coords.y * 32 + atlas_coords.x
		var variant := posmod(old_index, 256)
		var biome: int = _biome_cells[cell]
		var shade: int = patch_shades[cell]
		var atlas_index: int = ArtAssets.terrain_atlas_index(biome, shade, variant)
		ground.set_cell(cell, TERRAIN_SOURCE_ID, Vector2i(atlas_index % 32, int(atlas_index / 32)))

func _lava_atlas_coords(shore_mask: int, variation: int) -> Vector2i:
	return Vector2i(
		(shore_mask & 3) * 4 + (variation & 3),
		(shore_mask >> 2) * 4 + (variation >> 2)
	)

func _biome_for_value(value: float) -> int:
	if value > 0.18:
		return 0
	if value > -0.04:
		return 1
	if value > -0.24:
		return 2
	return 3

func _smooth_biomes(source: Dictionary, passes: int) -> Dictionary:
	var result := source.duplicate()
	for pass_index in range(passes):
		var updated: Dictionary = {}
		for cell in source:
			var neighbor_counts: Dictionary = {}
			for offset_y in range(-1, 2):
				for offset_x in range(-1, 2):
					if offset_x == 0 and offset_y == 0:
						continue
					var neighbor: Vector2i = cell + Vector2i(offset_x, offset_y)
					if not source.has(neighbor):
						continue
					var biome: int = source[neighbor]
					neighbor_counts[biome] = int(neighbor_counts.get(biome, 0)) + 1
			var current_biome: int = source[cell]
			var dominant_biome := current_biome
			var dominant_count := 0
			for candidate in neighbor_counts:
				var count: int = neighbor_counts[candidate]
				if count > dominant_count or (count == dominant_count and candidate == current_biome):
					dominant_biome = candidate
					dominant_count = count
			updated[cell] = dominant_biome if dominant_count >= 5 else current_biome
		result = updated
		source = updated
	return result

func _smooth_lava(candidates: Dictionary, biomes: Dictionary, passes: int) -> Dictionary:
	var result := candidates.duplicate()
	for pass_index in range(passes):
		var updated: Dictionary = {}
		for cell in candidates:
			if biomes[cell] != 1:
				updated[cell] = false
				continue
			var lava_neighbors := 0
			for offset_y in range(-1, 2):
				for offset_x in range(-1, 2):
					if offset_x == 0 and offset_y == 0:
						continue
					var neighbor: Vector2i = cell + Vector2i(offset_x, offset_y)
					if candidates.get(neighbor, false) and biomes.get(neighbor, -1) == 1:
						lava_neighbors += 1
			updated[cell] = lava_neighbors >= 5
		result = updated
		candidates = updated
	var lava: Dictionary = {}
	for cell in result:
		if result[cell]:
			lava[cell] = true
	return lava

func _scatter_decorations() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 1337
	var attempts := 0
	var placed := 0
	while placed < DECORATION_COUNT and attempts < DECORATION_COUNT * 12:
		attempts += 1
		var cell := Vector2i(rng.randi_range(-WORLD_RADIUS, WORLD_RADIUS), rng.randi_range(-WORLD_RADIUS, WORLD_RADIUS))
		if cell.length() < 6 or _lava_cells.has(cell):
			continue
		var kind: int = _biome_cells.get(cell, _biome_for_value(_biome_noise.get_noise_2d(cell.x, cell.y)))
		var variation := _variation_noise.get_noise_2d(cell.x, cell.y)
		var position := ground.map_to_local(cell) + Vector2(rng.randf_range(-4.0, 4.0), rng.randf_range(-4.0, 4.0))
		_spawn_world_object(_decoration_kind(kind, variation, rng), rng.randi(), position, true)
		placed += 1

	_scatter_ground_details(rng)

func _scatter_ground_details(rng: RandomNumberGenerator) -> void:
	var attempts := 0
	var placed := 0
	while placed < GROUND_DETAIL_COUNT and attempts < GROUND_DETAIL_COUNT * 12:
		attempts += 1
		var cell := Vector2i(rng.randi_range(-WORLD_RADIUS, WORLD_RADIUS), rng.randi_range(-WORLD_RADIUS, WORLD_RADIUS))
		if cell.length() < 5 or _lava_cells.has(cell):
			continue
		var biome: int = _biome_cells.get(cell, _biome_for_value(_biome_noise.get_noise_2d(cell.x, cell.y)))
		var detail_chance := 0.0
		match biome:
			0:
				detail_chance = 0.84
			1:
				detail_chance = 0.82
			2:
				detail_chance = 0.55
			_:
				detail_chance = 0.76
		if rng.randf() > detail_chance:
			continue
		var position := ground.map_to_local(cell) + Vector2(rng.randf_range(-5.0, 5.0), rng.randf_range(-5.0, 5.0))
		_spawn_world_object(_ground_detail_kind(biome, rng), rng.randi(), position, false)
		placed += 1

func _ground_detail_kind(biome: int, rng: RandomNumberGenerator) -> int:
	match biome:
		0:
			return ArtAssets.ObjectKind.GRASS_TUFT if rng.randf() < 0.56 else ArtAssets.ObjectKind.PEBBLE
		1:
			return ArtAssets.ObjectKind.FIRE_CRACK if rng.randf() < 0.64 else ArtAssets.ObjectKind.FIRE_SPECKLES
		2:
			return ArtAssets.ObjectKind.ICE_CRACK
		_:
			return ArtAssets.ObjectKind.SMALL_ROCK

func _decoration_kind(biome: int, variation: float, rng: RandomNumberGenerator) -> int:
	match biome:
		0:
			return ArtAssets.ObjectKind.TREE if variation > -0.1 or rng.randf() < 0.35 else ArtAssets.ObjectKind.ROCK
		1:
			return ArtAssets.ObjectKind.ROCK
		2:
			return ArtAssets.ObjectKind.CRYSTAL if variation > -0.2 else ArtAssets.ObjectKind.ROCK
		_:
			return ArtAssets.ObjectKind.ROCK if variation > 0.0 or rng.randf() < 0.35 else ArtAssets.ObjectKind.TREE

func _spawn_world_object(kind: int, variation: int, object_position: Vector2, is_solid: bool) -> void:
	var object: Node2D = WorldObjectScene.instantiate()
	object.set("kind", kind)
	object.set("variation", variation)
	object.set("solid", is_solid)
	object.position = object_position
	actors.add_child(object)

func is_lava_at(world_position: Vector2) -> bool:
	var cell := ground.local_to_map(ground.to_local(world_position))
	return _lava_cells.has(cell)

func add_actor(actor: Node2D) -> void:
	actors.add_child(actor)

func populate_enemies() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 777
	for index in range(14):
		var enemy := EnemyScript.new()
		enemy.position = Vector2(rng.randf_range(-720.0, 720.0), rng.randf_range(-720.0, 720.0))
		if enemy.position.length() < 180.0:
			enemy.position = enemy.position.normalized() * 220.0
		enemies.add_child(enemy)
