class_name ArtAssets
extends RefCounted

const TILESET_PATH := "res://art/tiles.png"
const PLAYER_PATH := "res://art/player.png"
const OBJECTS_PATH := "res://art/objects/"

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
static var _object_textures: Dictionary = {}
static var _object_source_textures: Dictionary = {}
static var _shadow_texture: Texture2D
static var _heart_textures: Array[Texture2D] = []

enum ObjectKind {
	TREE,
	ROCK,
	CRYSTAL,
	GRASS_TUFT,
	PEBBLE,
	FIRE_CRACK,
	FIRE_SPECKLES,
	ICE_CRACK,
	SMALL_ROCK,
}

const OBJECT_TEXTURE_PATHS: Array[String] = [
	"tree.png",
	"rock.png",
	"crystal.png",
	"grass_tuft.png",
	"pebble.png",
	"fire_crack.png",
	"fire_speckles.png",
	"ice_crack.png",
	"small_rock.png",
]

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

static func object_texture(kind: int, variation: int = 0) -> Texture2D:
	var safe_kind := clampi(kind, 0, OBJECT_TEXTURE_PATHS.size() - 1)
	var texture_key := safe_kind * 32 + posmod(variation, 32)
	if _object_textures.has(texture_key):
		return _object_textures[texture_key]
	var path := OBJECTS_PATH + OBJECT_TEXTURE_PATHS[safe_kind]
	var texture: Texture2D
	if _object_source_textures.has(safe_kind):
		texture = _object_source_textures[safe_kind]
	else:
		var image := _load_optional_image(path)
		if image == null:
			image = _create_object_placeholder(safe_kind, variation)
			texture = ImageTexture.create_from_image(image)
		else:
			texture = ImageTexture.create_from_image(image)
			_object_source_textures[safe_kind] = texture
	_object_textures[texture_key] = texture
	return texture

static func shadow_texture() -> Texture2D:
	if _shadow_texture != null:
		return _shadow_texture
	var image := Image.create(24, 10, false, Image.FORMAT_RGBA8)
	for y in range(image.get_height()):
		for x in range(image.get_width()):
			var point := Vector2((float(x) - 11.5) / 11.5, (float(y) - 4.5) / 4.5)
			var edge := 1.0 - point.length_squared()
			if edge > 0.0:
				image.set_pixel(x, y, Color(0.08, 0.10, 0.12, 0.28 * edge * edge))
	_shadow_texture = ImageTexture.create_from_image(image)
	return _shadow_texture

static func heart_texture(state: int) -> Texture2D:
	while _heart_textures.size() < 3:
		_heart_textures.append(_create_heart_texture(_heart_textures.size()))
	return _heart_textures[clampi(state, 0, 2)]

static func _create_heart_texture(state: int) -> Texture2D:
	var rows: Array[String] = [
		"..##.##..",
		".#######.",
		"#########",
		"#########",
		".#######.",
		"..#####..",
		"...###...",
		"....#....",
	]
	var image := Image.create(9, 8, false, Image.FORMAT_RGBA8)
	var fill_color := Color("#ef5360")
	var outline_color := Color("#8e3549")
	if state == 0:
		fill_color = Color("#704351")
		outline_color = Color("#493342")
	for y in range(8):
		for x in range(9):
			if rows[y].substr(x, 1) != "#":
				continue
			var is_outline := (
				x == 0 or x == 8 or y == 0 or y == 7
				or rows[y].substr(maxi(0, x - 1), 1) != "#"
				or rows[y].substr(mini(8, x + 1), 1) != "#"
				or rows[maxi(0, y - 1)].substr(x, 1) != "#"
				or rows[mini(7, y + 1)].substr(x, 1) != "#"
			)
			if is_outline:
				image.set_pixel(x, y, outline_color)
			elif state == 1 and x >= 4:
				image.set_pixel(x, y, Color("#493342"))
			else:
				image.set_pixel(x, y, fill_color.lightened(0.16) if y == 1 and (x == 2 or x == 6) else fill_color)
	return ImageTexture.create_from_image(image)

static func _create_object_placeholder(kind: int, variation: int) -> Image:
	var size := Vector2i(24, 32) if kind == ObjectKind.TREE else Vector2i(16, 24) if kind == ObjectKind.CRYSTAL else Vector2i(16, 16)
	var image := Image.create(size.x, size.y, false, Image.FORMAT_RGBA8)
	var rng := RandomNumberGenerator.new()
	rng.seed = 1657 + kind * 113 + posmod(variation, 32)
	match kind:
		ObjectKind.TREE:
			_fill_rect(image, Rect2i(10, 17, 4, 13), Color("#805438"))
			_fill_rect(image, Rect2i(10, 16, 4, 2), Color("#c08b52"))
			_draw_pixel_ellipse(image, Vector2i(12, 12), Vector2i(10, 9), Color("#38654b"))
			_draw_pixel_ellipse(image, Vector2i(10, 10), Vector2i(6, 5), Color("#669c5b"))
			_set_detail_pixel(image, Vector2i(5, 12), Color("#90bd67"))
			_set_detail_pixel(image, Vector2i(16, 13), Color("#83b762"))
		ObjectKind.ROCK, ObjectKind.SMALL_ROCK, ObjectKind.PEBBLE:
			var center_y := 10 if kind == ObjectKind.ROCK else 11
			var rock_polygon := PackedVector2Array([
				Vector2(1, center_y + 1), Vector2(3, center_y - 4), Vector2(6, center_y - 6),
				Vector2(9, center_y - 4), Vector2(12, center_y - 3), Vector2(15, center_y + 1),
				Vector2(12, center_y + 4), Vector2(7, center_y + 5), Vector2(3, center_y + 4),
			])
			if kind != ObjectKind.ROCK:
				rock_polygon = PackedVector2Array([
					Vector2(4, center_y + 1), Vector2(6, center_y - 2), Vector2(9, center_y - 3),
					Vector2(12, center_y - 1), Vector2(13, center_y + 2), Vector2(9, center_y + 3),
					Vector2(5, center_y + 3),
				])
			_draw_pixel_polygon(image, rock_polygon, Color("#554f51") if kind == ObjectKind.ROCK else Color("#766653"))
			var rock_inner := PackedVector2Array([
				Vector2(4, center_y), Vector2(6, center_y - 3), Vector2(9, center_y - 4),
				Vector2(12, center_y - 1), Vector2(12, center_y + 1), Vector2(8, center_y + 3),
				Vector2(5, center_y + 2),
			])
			_draw_pixel_polygon(image, rock_inner, Color("#a99b82") if kind == ObjectKind.ROCK else Color("#b39b70"))
			_set_detail_pixel(image, Vector2i(6, center_y - 2), Color("#ded0ac"))
			if rng.randf() < 0.6:
				_set_detail_pixel(image, Vector2i(10, center_y + 1), Color("#554f51"))
		ObjectKind.CRYSTAL:
			_fill_rect(image, Rect2i(7, 4, 2, 14), Color("#43828a"))
			_fill_rect(image, Rect2i(5, 8, 2, 8), Color("#43828a"))
			_fill_rect(image, Rect2i(9, 9, 2, 7), Color("#43828a"))
			_fill_rect(image, Rect2i(7, 5, 1, 12), Color("#9df1e6"))
			_fill_rect(image, Rect2i(5, 9, 1, 6), Color("#79d6d8"))
			_set_detail_pixel(image, Vector2i(8, 4), Color("#e0fff2"))
		ObjectKind.GRASS_TUFT:
			_draw_detail_line(image, Vector2i(7, 15), Vector2i(5, 8), Color("#42734c"))
			_draw_detail_line(image, Vector2i(8, 15), Vector2i(8, 5), Color("#67a858"))
			_draw_detail_line(image, Vector2i(9, 15), Vector2i(11, 8), Color("#91c76b"))
			_draw_detail_line(image, Vector2i(8, 15), Vector2i(8, 9), Color("#b3d773"))
		ObjectKind.FIRE_CRACK:
			var crack_glow := Color(1.0, 0.40, 0.08, 0.34)
			var crack_core := Color("#ffbf4e")
			_draw_detail_glow_line(image, Vector2i(2, 9), Vector2i(7, 8), crack_glow, crack_core)
			_draw_detail_glow_line(image, Vector2i(7, 8), Vector2i(10, 4), crack_glow, crack_core)
			_draw_detail_glow_line(image, Vector2i(7, 8), Vector2i(13, 11), crack_glow, crack_core)
		ObjectKind.FIRE_SPECKLES:
			for speckle in range(5):
				var point := Vector2i(rng.randi_range(2, 13), rng.randi_range(3, 13))
				_set_detail_pixel(image, point, Color("#f28d42"))
				if rng.randf() < 0.5:
					_set_detail_pixel(image, point + Vector2i(1, 0), Color("#ffc653"))
		ObjectKind.ICE_CRACK:
			var ice_crack := Color("#4e8d9d")
			_draw_detail_line(image, Vector2i(2, 8), Vector2i(8, 8), ice_crack)
			_draw_detail_line(image, Vector2i(8, 8), Vector2i(11, 4), ice_crack)
			_draw_detail_line(image, Vector2i(8, 8), Vector2i(12, 13), ice_crack)
			_set_detail_pixel(image, Vector2i(4, 7), Color("#d6f5ed"))
			_set_detail_pixel(image, Vector2i(9, 7), Color("#b6e2df"))
	return image

static func _fill_rect(image: Image, rect: Rect2i, color: Color) -> void:
	image.fill_rect(rect, color)

static func _draw_pixel_ellipse(image: Image, center: Vector2i, extent: Vector2i, color: Color) -> void:
	for y in range(maxi(0, center.y - extent.y), mini(image.get_height(), center.y + extent.y + 1)):
		for x in range(maxi(0, center.x - extent.x), mini(image.get_width(), center.x + extent.x + 1)):
			var point := Vector2((float(x) - center.x) / extent.x, (float(y) - center.y) / extent.y)
			if point.length_squared() <= 1.0:
				image.set_pixel(x, y, color)

static func _draw_pixel_polygon(image: Image, points: PackedVector2Array, color: Color) -> void:
	for y in range(image.get_height()):
		for x in range(image.get_width()):
			if Geometry2D.is_point_in_polygon(Vector2(x, y), points):
				image.set_pixel(x, y, color)

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
	if image != null and (image.get_width() < 64 or image.get_height() < 96):
		push_error("%s must be at least 64x96 pixels, with four 16x24 frames across and four direction rows." % PLAYER_PATH)
		image = null
	if image == null:
		image = Image.create(64, 96, false, Image.FORMAT_RGBA8)
		for row in range(4):
			for frame in range(4):
				var left := frame * 16
				var top := row * 24
				for x in range(5, 11):
					for y in range(6, 14):
						image.set_pixel(left + x, top + y, Color("#30404f"))
				for x in range(6, 10):
					for y in range(7, 14):
						image.set_pixel(left + x, top + y, Color("#e58a55"))
				for x in range(5, 11):
					for y in range(13, 20):
						image.set_pixel(left + x, top + y, Color("#503a62"))
				for x in range(5, 11):
					for y in range(6, 11):
						image.set_pixel(left + x, top + y, Color("#503a62"))
				var stride: int = [-1, 0, 1, 0][frame]
				for y in range(19, 23):
					_set_detail_pixel(image, Vector2i(left + 6, top + y), Color("#30404f"))
					_set_detail_pixel(image, Vector2i(left + 7, top + y + mini(0, stride)), Color("#30404f"))
					_set_detail_pixel(image, Vector2i(left + 9, top + y), Color("#30404f"))
					_set_detail_pixel(image, Vector2i(left + 10, top + y + maxi(0, stride)), Color("#30404f"))
				match row:
					0:
						image.set_pixel(left + 7, top + 9, Color("#253040"))
						image.set_pixel(left + 8, top + 9, Color("#253040"))
						image.set_pixel(left + 7, top + 12, Color("#efd078"))
						image.set_pixel(left + 8, top + 12, Color("#efd078"))
					1:
						image.set_pixel(left + 6, top + 9, Color("#253040"))
						image.set_pixel(left + 7, top + 12, Color("#efd078"))
					2:
						image.set_pixel(left + 9, top + 9, Color("#253040"))
						image.set_pixel(left + 8, top + 12, Color("#efd078"))
	_player_texture = ImageTexture.create_from_image(image)
	return _player_texture

static func player_sprite_frames() -> SpriteFrames:
	var texture := player_texture()
	var sprite_frames := SpriteFrames.new()
	sprite_frames.remove_animation("default")
	var directions: Array[String] = ["down", "left", "right", "up"]
	for row in range(directions.size()):
		var direction: String = directions[row]
		var idle_animation := "idle_" + direction
		sprite_frames.add_animation(idle_animation)
		sprite_frames.set_animation_speed(idle_animation, 1.0)
		sprite_frames.set_animation_loop(idle_animation, true)
		sprite_frames.add_frame(idle_animation, _player_frame(texture, 0, row))

		var walk_animation := "walk_" + direction
		sprite_frames.add_animation(walk_animation)
		sprite_frames.set_animation_speed(walk_animation, 8.0)
		sprite_frames.set_animation_loop(walk_animation, true)
		for column in range(4):
			sprite_frames.add_frame(walk_animation, _player_frame(texture, column, row))
	return sprite_frames

static func _player_frame(texture: Texture2D, column: int, row: int) -> AtlasTexture:
	var frame := AtlasTexture.new()
	frame.atlas = texture
	frame.region = Rect2(column * 16, row * 24, 16, 24)
	return frame

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
