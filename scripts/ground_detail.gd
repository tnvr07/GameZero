extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")

var kind := 0
var variation := 0

func _ready() -> void:
	var sprite := Sprite2D.new()
	sprite.texture = ArtAssets.ground_detail_texture(kind, variation)
	sprite.position.y = -1.0
	add_child(sprite)

func _draw() -> void:
	var shadow_radius := 3.0 if kind == 0 or kind == 2 or kind == 4 else 2.0
	draw_set_transform(Vector2(0, 1), 0.0, Vector2(1.0, 0.4))
	draw_circle(Vector2.ZERO, shadow_radius, Color(0.12, 0.15, 0.18, 0.24))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
