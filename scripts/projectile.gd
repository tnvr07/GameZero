extends Area2D

const ArtAssets = preload("res://scripts/art_assets.gd")

var direction := Vector2.RIGHT
var damage := 1
var _lifetime := 1.2

func _ready() -> void:
	collision_layer = 0
	collision_mask = 2
	var shape_node := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 5.0
	shape_node.shape = shape
	add_child(shape_node)
	var sprite := Sprite2D.new()
	sprite.texture = ArtAssets.lava_texture()
	sprite.scale = Vector2(0.55, 0.55)
	add_child(sprite)
	body_entered.connect(_on_body_entered)

func _physics_process(delta: float) -> void:
	global_position += direction * 190.0 * delta
	_lifetime -= delta
	if _lifetime <= 0.0:
		queue_free()

func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("enemies"):
		body.take_damage(damage)
		queue_free()
