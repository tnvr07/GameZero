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
static var _player_texture: Texture2D
static var _decoration_textures: Array[Texture2D] = []
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
		var image := Image.create(16, 16, false, Image.FORMAT_RGBA8)
		for y in range(16):
			for x in range(16):
				var color := Color("#cf4a32") if ((x + y) % 5 < 3) else Color("#f08a43")
				if x == 0 or y == 0 or x == 15 or y == 15:
					color = Color("#542f37")
				image.set_pixel(x, y, color)
		_lava_texture = ImageTexture.create_from_image(image)
	return _lava_texture

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
