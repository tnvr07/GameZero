extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")
const DecorationScript = preload("res://scripts/decoration.gd")
const EnemyScript = preload("res://scripts/enemy.gd")
const GroundDetailScript = preload("res://scripts/ground_detail.gd")

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
var decorations: Node2D
var enemies: Node2D
var actors: Node2D
var _lava_cells: Dictionary = {}
var _biome_noise := FastNoiseLite.new()
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
		for variant in range(256):
			var atlas_index := biome * 256 + variant
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

	decorations = Node2D.new()
	decorations.name = "Decorations"
	actors = Node2D.new()
	actors.name = "Actors"
	actors.y_sort_enabled = true
	add_child(actors)
	actors.add_child(decorations)
	enemies = Node2D.new()
	enemies.name = "Enemies"
	actors.add_child(enemies)

func _generate_world() -> void:
	_biome_noise.seed = 198407
	_biome_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_biome_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	_biome_noise.fractal_octaves = 2
	_biome_noise.frequency = 0.012
	_variation_noise.seed = 90721
	_variation_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	_variation_noise.frequency = 0.075

	var candy_cells: Array[Vector2i] = []
	var fire_cells: Array[Vector2i] = []
	var ice_cells: Array[Vector2i] = []
	var desert_cells: Array[Vector2i] = []
	for y in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
		for x in range(-WORLD_RADIUS, WORLD_RADIUS + 1):
			var biome_value := _biome_noise.get_noise_2d(x, y)
			var biome := _biome_for_value(biome_value)
			if Vector2i(x, y).length() < 5:
				biome = 0
			var cell := Vector2i(x, y)
			var variation := _variation_noise.get_noise_2d(x, y)
			if biome == 1 and variation > 0.62:
				_lava_cells[cell] = true
			else:
				match biome:
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
	for lava_cell in _lava_cells:
		var shore_mask := 0
		for side in range(CARDINAL_OFFSETS.size()):
			if not _lava_cells.has(lava_cell + CARDINAL_OFFSETS[side]):
				shore_mask |= 1 << side
		var variation := posmod(hash(lava_cell), 16)
		ground.set_cell(lava_cell, LAVA_SOURCE_ID, _lava_atlas_coords(shore_mask, variation))

func _lava_atlas_coords(shore_mask: int, variation: int) -> Vector2i:
	return Vector2i(
		(shore_mask & 3) * 4 + (variation & 3),
		(shore_mask >> 2) * 4 + (variation >> 2)
	)

func _biome_for_value(value: float) -> int:
	if value > 0.26:
		return 0
	if value > -0.24:
		return 1
	if value > -0.63:
		return 2
	return 3

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
		var kind := _biome_for_value(_biome_noise.get_noise_2d(cell.x, cell.y))
		var variation := _variation_noise.get_noise_2d(cell.x, cell.y)
		var decoration := DecorationScript.new()
		decoration.kind = _decoration_kind(kind, variation, rng)
		decoration.position = ground.map_to_local(cell) + Vector2(rng.randf_range(-4.0, 4.0), rng.randf_range(-4.0, 4.0))
		decorations.add_child(decoration)
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
		var biome := _biome_for_value(_biome_noise.get_noise_2d(cell.x, cell.y))
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
		var detail := GroundDetailScript.new()
		detail.kind = _ground_detail_kind(biome, rng)
		detail.variation = rng.randi()
		detail.position = ground.map_to_local(cell) + Vector2(rng.randf_range(-5.0, 5.0), rng.randf_range(-5.0, 5.0))
		decorations.add_child(detail)
		placed += 1

func _ground_detail_kind(biome: int, rng: RandomNumberGenerator) -> int:
	match biome:
		0:
			return 0 if rng.randf() < 0.56 else 1
		1:
			return 2 if rng.randf() < 0.64 else 3
		2:
			return 4
		_:
			return 5

func _decoration_kind(biome: int, variation: float, rng: RandomNumberGenerator) -> int:
	match biome:
		0:
			return 0 if variation > -0.1 or rng.randf() < 0.35 else 1
		1:
			return 1
		2:
			return 2 if variation > -0.2 else 1
		_:
			return 1 if variation > 0.0 or rng.randf() < 0.35 else 0

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
