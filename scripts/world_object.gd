extends Node2D

const ArtAssets = preload("res://scripts/art_assets.gd")

@export_range(0, 8) var kind := ArtAssets.ObjectKind.ROCK
@export var variation := 0
@export var solid := true

@onready var _shadow: Sprite2D = $Shadow
@onready var _sprite: Sprite2D = $Sprite
@onready var _body: StaticBody2D = $Body
@onready var _shape: CollisionShape2D = $Body/Shape

func _ready() -> void:
	y_sort_enabled = true
	_sprite.texture = ArtAssets.object_texture(kind, variation)
	_sprite.position.y = -_sprite.texture.get_height() * 0.5 + 1.0
	_shadow.texture = ArtAssets.shadow_texture()
	_shadow.position = Vector2(0.0, 1.0)
	_shadow.scale = Vector2(1.0 if kind == ArtAssets.ObjectKind.TREE else 0.75, 1.0)
	_body.collision_layer = 2 if solid else 0
	_shape.disabled = not solid
	_shape.position.y = -3.0
	var circle := (_shape.shape as CircleShape2D).duplicate() as CircleShape2D
	circle.radius = 5.5 if kind == ArtAssets.ObjectKind.TREE else 4.0
	_shape.shape = circle
