extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")

var _biome_cells: Dictionary = {}
var _patch_shades: Dictionary = {}
var _lava_cells: Dictionary = {}

func configure(biome_cells: Dictionary, patch_shades: Dictionary, lava_cells: Dictionary) -> void:
	_biome_cells = biome_cells
	_patch_shades = patch_shades
	_lava_cells = lava_cells
	queue_redraw()

func _draw() -> void:
	for cell in _biome_cells:
		if _lava_cells.has(cell):
			continue
		var biome: int = _biome_cells[cell]
		var shade: int = _patch_shades[cell]
		var origin := Vector2(cell.x * 16, cell.y * 16)
		var right: Vector2i = cell + Vector2i.RIGHT
		if _is_patch_boundary(cell, right, biome, shade):
			_draw_patch_edge(origin + Vector2(16, 0), origin + Vector2(16, 16), biome, shade, int(_patch_shades[right]))
		var down: Vector2i = cell + Vector2i.DOWN
		if _is_patch_boundary(cell, down, biome, shade):
			_draw_patch_edge(origin + Vector2(0, 16), origin + Vector2(16, 16), biome, shade, int(_patch_shades[down]))

func _is_patch_boundary(cell: Vector2i, neighbor: Vector2i, biome: int, shade: int) -> bool:
	return (
		_biome_cells.has(neighbor)
		and not _lava_cells.has(neighbor)
		and _biome_cells[neighbor] == biome
		and _patch_shades[neighbor] != shade
	)

func _draw_patch_edge(start: Vector2, finish: Vector2, biome: int, shade: int, neighbor_shade: int) -> void:
	var raised_shade := maxi(shade, neighbor_shade)
	var outline := ArtAssets.terrain_shade_color(biome, raised_shade).darkened(0.32)
	draw_line(start, finish, outline, 1.0, false)
