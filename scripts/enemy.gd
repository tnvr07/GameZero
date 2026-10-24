extends CharacterBody2D

const ArtAssets = preload("res://scripts/art_assets.gd")

var health := 4
var _attack_cooldown := 0.0

func _ready() -> void:
	add_to_group("enemies")
	collision_layer = 2
	collision_mask = 1
	var collision := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 6.0
	collision.shape = shape
	collision.position.y = -2.0
	add_child(collision)
	var sprite := Sprite2D.new()
	sprite.texture = ArtAssets.decoration_texture(1)
	sprite.modulate = Color("#86517c")
	sprite.offset = Vector2(0, -5)
	sprite.scale = Vector2(0.75, 0.75)
	add_child(sprite)

func _physics_process(delta: float) -> void:
	_attack_cooldown = maxf(0.0, _attack_cooldown - delta)
	var player := get_tree().get_first_node_in_group("player") as CharacterBody2D
	if player == null:
		return
	var offset := player.global_position - global_position
	if offset.length() < 130.0:
		velocity = offset.normalized() * 34.0
		move_and_slide()
		if offset.length() < 14.0 and _attack_cooldown <= 0.0:
			player.call("take_damage", 1)
			_attack_cooldown = 1.1
	else:
		velocity = Vector2.ZERO

func take_damage(amount: int) -> void:
	health -= amount
	if health <= 0:
		var player := get_tree().get_first_node_in_group("player")
		if player != null:
			player.call("gain_xp", 10)
		queue_free()

func _draw() -> void:
	draw_set_transform(Vector2(0, 2), 0.0, Vector2(1.0, 0.4))
	draw_circle(Vector2.ZERO, 6.0, Color(0.12, 0.15, 0.18, 0.30))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
