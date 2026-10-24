class_name ArtAssets
extends RefCounted

const TILESET_PATH := "res://art/tiles.png"
const PLAYER_PATH := "res://art/player.png"
const DECORATION_PATH := "res://art/decorations.png"

const BIOME_COLORS: Array[Color] = [
	Color("#7fae67"),
	Color("#d45a48"),
	Color("#8acbd3"),
	Color("#d9b969"),
]

static var _terrain_texture: Texture2D
static var _lava_texture: Texture2D
static var _lava_blast_texture: Texture2D
static var _player_texture: Texture2D
static var _decoration_textures: Array[Texture2D] = []
static var _ground_detail_textures: Dictionary = {}
static var _decoration_image: Image
static var _decoration_image_checked := false

static func terrain_atlas_texture() -> Texture2D:
	if _terrain_texture != null:
		return _terrain_texture
	var image := Image.create(512, 512, false, Image.FORMAT_RGBA8)
	var base_tiles := _terrain_base_image()
	for biome in range(4):
		for variant in range(256):
			var atlas_index := biome * 256 + variant
			var tile_x := (atlas_index % 32) * 16
			var tile_y := int(atlas_index / 32) * 16
			_copy_terrain_base_tile(image, base_tiles, biome, tile_x, tile_y)
			var neighbors := _decode_variant(variant)
			for side in range(4):
				if biome > neighbors[side]:
					_draw_edge(image, base_tiles, biome * 16, tile_x, tile_y, side)
	_terrain_texture = ImageTexture.create_from_image(image)
	return _terrain_texture

static func _terrain_base_image() -> Image:
	var source_image := _load_optional_image(TILESET_PATH)
	if source_image != null:
		if source_image.get_width() >= 64 and source_image.get_height() >= 16:
			return source_image
		push_error("%s must contain four 16x16 biome tiles across its first row." % TILESET_PATH)

	var placeholders := Image.create(64, 16, false, Image.FORMAT_RGBA8)
	for biome in range(4):
		for y in range(16):
			for x in range(16):
				placeholders.set_pixel(biome * 16 + x, y, BIOME_COLORS[biome])
	return placeholders

static func _copy_terrain_base_tile(target: Image, base_tiles: Image, biome: int, dest_x: int, dest_y: int) -> void:
	for y in range(16):
		for x in range(16):
			target.set_pixel(dest_x + x, dest_y + y, base_tiles.get_pixel(biome * 16 + x, y))

static func lava_texture() -> Texture2D:
	if _lava_texture == null:
		var image := Image.create(256, 256, false, Image.FORMAT_RGBA8)
		for shore_mask in range(16):
			for variation in range(16):
				var rng := RandomNumberGenerator.new()
				rng.seed = 6043 + shore_mask * 97 + variation
				var tile_origin := Vector2i(
					((shore_mask & 3) * 4 + (variation & 3)) * 16,
					((shore_mask >> 2) * 4 + (variation >> 2)) * 16
				)
				image.fill_rect(Rect2i(tile_origin, Vector2i(16, 16)), Color("#ef692d"))
				for speckle in range(12):
					var speckle_origin := tile_origin + Vector2i(rng.randi_range(1, 14), rng.randi_range(1, 14))
					image.set_pixelv(speckle_origin, Color("#ffb844"))
					if rng.randf() < 0.35:
						image.set_pixelv(speckle_origin + Vector2i(1, 0), Color("#ffd65a"))
				for side in range(4):
					if (shore_mask & (1 << side)) == 0:
						continue
					for offset in range(16):
						match side:
							0:
								image.set_pixel(tile_origin.x + offset, tile_origin.y, Color("#63343b"))
							1:
								image.set_pixel(tile_origin.x + 15, tile_origin.y + offset, Color("#63343b"))
							2:
								image.set_pixel(tile_origin.x + offset, tile_origin.y + 15, Color("#63343b"))
							3:
								image.set_pixel(tile_origin.x, tile_origin.y + offset, Color("#63343b"))
		_lava_texture = ImageTexture.create_from_image(image)
	return _lava_texture

static func lava_blast_texture() -> Texture2D:
	if _lava_blast_texture == null:
		var lava_image := lava_texture().get_image()
		_lava_blast_texture = ImageTexture.create_from_image(lava_image.get_region(Rect2i(0, 0, 16, 16)))
	return _lava_blast_texture

static func ground_detail_texture(kind: int, variation: int) -> Texture2D:
	var texture_key := kind * 32 + posmod(variation, 32)
	if _ground_detail_textures.has(texture_key):
		return _ground_detail_textures[texture_key]
	var image := Image.create(16, 16, false, Image.FORMAT_RGBA8)
	var rng := RandomNumberGenerator.new()
	rng.seed = 521 + texture_key * 97
	match kind:
		0:
			_draw_detail_line(image, Vector2i(7, 13), Vector2i(5, 8), Color("#42734c"))
			_draw_detail_line(image, Vector2i(8, 13), Vector2i(8, 6), Color("#67a858"))
			_draw_detail_line(image, Vector2i(9, 13), Vector2i(11, 8), Color("#91c76b"))
			_draw_detail_line(image, Vector2i(8, 13), Vector2i(8, 9), Color("#b3d773"))
		1:
			_set_detail_pixel(image, Vector2i(6, 12), Color("#776e61"))
			_set_detail_pixel(image, Vector2i(7, 11), Color("#a89b7b"))
			_set_detail_pixel(image, Vector2i(8, 12), Color("#8f8065"))
			_set_detail_pixel(image, Vector2i(9, 12), Color("#625d56"))
		2:
			var crack_glow := Color(1.0, 0.40, 0.08, 0.34)
			var crack_core := Color("#ffbf4e")
			_draw_detail_glow_line(image, Vector2i(3, 8), Vector2i(7, 7), crack_glow, crack_core)
			_draw_detail_glow_line(image, Vector2i(7, 7), Vector2i(10, 4), crack_glow, crack_core)
			_draw_detail_glow_line(image, Vector2i(7, 7), Vector2i(12, 10), crack_glow, crack_core)
		3:
			for speckle in range(4):
				var point := Vector2i(rng.randi_range(3, 12), rng.randi_range(4, 12))
				_set_detail_pixel(image, point, Color("#f28d42"))
				if rng.randf() < 0.5:
					_set_detail_pixel(image, point + Vector2i(1, 0), Color("#ffc653"))
		4:
			var ice_crack := Color("#4e8d9d")
			_draw_detail_line(image, Vector2i(3, 7), Vector2i(8, 8), ice_crack)
			_draw_detail_line(image, Vector2i(8, 8), Vector2i(11, 5), ice_crack)
			_draw_detail_line(image, Vector2i(8, 8), Vector2i(10, 12), ice_crack)
			_set_detail_pixel(image, Vector2i(4, 6), Color("#d6f5ed"))
			_set_detail_pixel(image, Vector2i(9, 7), Color("#b6e2df"))
		5:
			var rock_color := Color("#8a7455")
			_set_detail_pixel(image, Vector2i(6, 11), rock_color.darkened(0.3))
			_set_detail_pixel(image, Vector2i(7, 10), rock_color.lightened(0.2))
			_set_detail_pixel(image, Vector2i(8, 10), rock_color)
			_set_detail_pixel(image, Vector2i(9, 11), rock_color.darkened(0.15))
			if rng.randf() < 0.5:
				_set_detail_pixel(image, Vector2i(11, 12), rock_color.lightened(0.1))
	_ground_detail_textures[texture_key] = ImageTexture.create_from_image(image)
	return _ground_detail_textures[texture_key]

static func _set_detail_pixel(image: Image, point: Vector2i, color: Color) -> void:
	if point.x >= 0 and point.x < image.get_width() and point.y >= 0 and point.y < image.get_height():
		image.set_pixelv(point, color)

static func _draw_detail_line(image: Image, start: Vector2i, finish: Vector2i, color: Color) -> void:
	var distance := maxi(absi(finish.x - start.x), absi(finish.y - start.y))
	for step in range(distance + 1):
		var weight := float(step) / maxf(1.0, float(distance))
		_set_detail_pixel(image, Vector2i(roundi(lerpf(start.x, finish.x, weight)), roundi(lerpf(start.y, finish.y, weight))), color)

static func _draw_detail_glow_line(image: Image, start: Vector2i, finish: Vector2i, glow: Color, core: Color) -> void:
	var distance := maxi(absi(finish.x - start.x), absi(finish.y - start.y))
	for step in range(distance + 1):
		var weight := float(step) / maxf(1.0, float(distance))
		var point := Vector2i(roundi(lerpf(start.x, finish.x, weight)), roundi(lerpf(start.y, finish.y, weight)))
		_set_detail_pixel(image, point + Vector2i(0, -1), glow)
		_set_detail_pixel(image, point + Vector2i(0, 1), glow)
		_set_detail_pixel(image, point + Vector2i(-1, 0), glow)
		_set_detail_pixel(image, point + Vector2i(1, 0), glow)
		_set_detail_pixel(image, point, core)

static func player_texture() -> Texture2D:
	if _player_texture != null:
		return _player_texture
	var image := _load_optional_image(PLAYER_PATH)
	if image == null:
		image = Image.create(64, 64, false, Image.FORMAT_RGBA8)
		for row in range(4):
			for frame in range(4):
				var left := frame * 16
				var top := row * 16
				for x in range(5, 11):
					for y in range(4, 14):
						image.set_pixel(left + x, top + y, Color("#30404f"))
				for x in range(6, 10):
					for y in range(5, 13):
						image.set_pixel(left + x, top + y, Color("#e58a55"))
				for x in range(5, 11):
					for y in range(4, 8):
						image.set_pixel(left + x, top + y, Color("#503a62"))
				image.set_pixel(left + 7, top + 7, Color("#253040"))
				image.set_pixel(left + 8, top + 7, Color("#253040"))
				image.set_pixel(left + 7, top + 11, Color("#efd078"))
				image.set_pixel(left + 8, top + 11, Color("#efd078"))
	_player_texture = ImageTexture.create_from_image(image)
	return _player_texture

static func decoration_texture(kind: int) -> Texture2D:
	while _decoration_textures.size() <= kind:
		var index := _decoration_textures.size()
		if not _decoration_image_checked:
			_decoration_image_checked = true
			_decoration_image = _load_optional_image(DECORATION_PATH)
			if _decoration_image != null and (_decoration_image.get_width() < 72 or _decoration_image.get_height() < 28):
				push_error("Decoration art at %s must be at least 72x28 pixels (three 24x28 frames)." % DECORATION_PATH)
				_decoration_image = null
		if _decoration_image != null:
			var frame := _decoration_image.get_region(Rect2i(index * 24, 0, 24, 28))
			_decoration_textures.append(ImageTexture.create_from_image(frame))
			continue
		var image := Image.create(24, 28, false, Image.FORMAT_RGBA8)
		var color: Color = [Color("#55804d"), Color("#77716b"), Color("#70cbd5")][index % 3]
		for x in range(24):
			for y in range(28):
				var center := Vector2(12.0, 13.0)
				var point := Vector2(float(x), float(y))
				var radius := 9.0 if index != 1 else 7.0
				if point.distance_to(center) < radius and y < 23:
					image.set_pixel(x, y, color.darkened(0.30) if point.distance_to(center) > radius - 2.0 else color)
		_decoration_textures.append(ImageTexture.create_from_image(image))
	return _decoration_textures[kind]

static func _load_optional_image(path: String) -> Image:
	if not ResourceLoader.exists(path):
		return null
	var texture := load(path) as Texture2D
	if texture == null:
		push_error("Art asset at %s is not a Texture2D." % path)
		return null
	var image := texture.get_image()
	if image == null or image.is_empty():
		push_error("Art asset at %s could not be read as an image." % path)
		return null
	return image

static func _decode_variant(variant: int) -> Array[int]:
	var neighbors: Array[int] = []
	var value := variant
	for side in range(4):
		neighbors.append(value % 4)
		value = int(value / 4)
	return neighbors

static func _draw_edge(image: Image, base_tiles: Image, source_x: int, x: int, y: int, side: int) -> void:
	for offset in range(16):
		match side:
			0:
				image.set_pixel(x + offset, y, base_tiles.get_pixel(source_x + offset, 0).darkened(0.38))
			1:
				image.set_pixel(x + 15, y + offset, base_tiles.get_pixel(source_x + 15, offset).darkened(0.38))
			2:
				image.set_pixel(x + offset, y + 15, base_tiles.get_pixel(source_x + offset, 15).darkened(0.38))
			3:
				image.set_pixel(x, y + offset, base_tiles.get_pixel(source_x, offset).darkened(0.38))
