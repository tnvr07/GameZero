extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")

var kind := 0
var _sprite: Sprite2D

func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.texture = ArtAssets.decoration_texture(kind)
	_sprite.centered = true
	_sprite.offset = Vector2(0, -8)
	add_child(_sprite)

func _draw() -> void:
	draw_set_transform(Vector2(0, 2), 0.0, Vector2(1.0, 0.4))
	draw_circle(Vector2.ZERO, 7.0 if kind == 0 else 5.0, Color(0.12, 0.15, 0.18, 0.30))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
