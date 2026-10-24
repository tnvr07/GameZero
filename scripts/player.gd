extends CharacterBody2D

const ArtAssets = preload("res://scripts/art_assets.gd")
const PixelMovement = preload("res://scripts/pixel_movement.gd")
const ProjectileScript = preload("res://scripts/projectile.gd")

const MOVE_SPEED := 88.0
const DASH_SPEED := 250.0
const PIXEL_STEP_SIZE := 12.0
const MAX_COLLISION_SLIDES := 4
const MAX_HEALTH := 5
const MAX_KI := 100.0

var health: float = MAX_HEALTH
var ki := MAX_KI
var level := 1
var xp := 0
var selected_slot := 0
var combo := 0
var _last_attack_time := -10.0
var _hurt_cooldown := 0.0
var _dash_time := 0.0
var _dash_cooldown := 0.0
var _facing := Vector2.DOWN
var _sprite: AnimatedSprite2D
var _world: Node
var _show_movement_debug := false

func _ready() -> void:
	add_to_group("player")
	collision_layer = 1
	collision_mask = 2
	collision_priority = 1.0
	var collision := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(9.6, 7.2)
	collision.shape = shape
	collision.position = Vector2(0.0, -3.6)
	add_child(collision)
	_sprite = AnimatedSprite2D.new()
	_sprite.sprite_frames = ArtAssets.player_sprite_frames()
	_sprite.position.y = -12.0
	add_child(_sprite)
	_sprite.play("idle_down")
	var scene_root := get_tree().current_scene
	if scene_root != null:
		_world = scene_root.get_node_or_null("World")

func _physics_process(delta: float) -> void:
	_hurt_cooldown = maxf(0.0, _hurt_cooldown - delta)
	_dash_cooldown = maxf(0.0, _dash_cooldown - delta)
	_dash_time = maxf(0.0, _dash_time - delta)
	ki = minf(MAX_KI, ki + 16.0 * delta)

	var input := Vector2(
		float(Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT)) - float(Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT)),
		float(Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN)) - float(Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP))
	)
	if input.length_squared() > 1.0:
		input = input.normalized()
	if input != Vector2.ZERO:
		_facing = input
	if _dash_time > 0.0:
		velocity = _facing.normalized() * DASH_SPEED
	else:
		velocity = input * MOVE_SPEED
	PixelMovement.move_body(self, velocity * delta, PIXEL_STEP_SIZE, MAX_COLLISION_SLIDES)
	_update_sprite()
	if _world != null and _world.call("is_lava_at", global_position) and _hurt_cooldown <= 0.0:
		take_damage(1)

func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	var key_event := event as InputEventKey
	if key_event.keycode >= KEY_1 and key_event.keycode <= KEY_9:
		selected_slot = key_event.keycode - KEY_1
		get_viewport().set_input_as_handled()
	elif key_event.keycode == KEY_SPACE:
		_melee_attack()
		get_viewport().set_input_as_handled()
	elif key_event.keycode == KEY_J:
		_fire_blast()
		get_viewport().set_input_as_handled()
	elif key_event.keycode == KEY_SHIFT:
		_dash()
		get_viewport().set_input_as_handled()
	elif key_event.keycode == KEY_F3:
		_show_movement_debug = not _show_movement_debug
		queue_redraw()
		get_viewport().set_input_as_handled()

func _draw() -> void:
	if not _show_movement_debug:
		return
	var half_view := get_viewport_rect().size * 0.5
	for x in range(-int(half_view.x), int(half_view.x) + 1, int(PIXEL_STEP_SIZE)):
		draw_line(Vector2(x, -half_view.y), Vector2(x, half_view.y), Color(0.40, 0.80, 1.0, 0.22), 1.0)
	for y in range(-int(half_view.y), int(half_view.y) + 1, int(PIXEL_STEP_SIZE)):
		draw_line(Vector2(-half_view.x, y), Vector2(half_view.x, y), Color(0.40, 0.80, 1.0, 0.22), 1.0)
	draw_rect(Rect2(-4.8, -7.2, 9.6, 7.2), Color(1.0, 0.30, 0.25, 0.85), false, 1.0)

func _update_sprite() -> void:
	var direction := "down"
	if absf(_facing.x) > absf(_facing.y):
		direction = "left" if _facing.x < 0.0 else "right"
	elif _facing.y < 0.0:
		direction = "up"
	var animation := ("walk_" if velocity.length_squared() > 1.0 else "idle_") + direction
	if _sprite.animation != animation:
		_sprite.play(animation)

func _melee_attack() -> void:
	var now := Time.get_ticks_msec() / 1000.0
	combo = (combo % 3) + 1 if now - _last_attack_time < 0.8 else 1
	_last_attack_time = now
	for enemy in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(enemy):
			continue
		var offset: Vector2 = enemy.global_position - global_position
		if offset.length() <= 26.0 and offset.normalized().dot(_facing.normalized()) > -0.25:
			enemy.take_damage(1 + int(level >= 3) + int(combo == 3))

func _fire_blast() -> void:
	if ki < 20.0:
		return
	ki -= 20.0
	var projectile := ProjectileScript.new()
	projectile.direction = _facing.normalized()
	projectile.damage = 1 + int(level >= 2)
	projectile.global_position = global_position + _facing.normalized() * 12.0
	get_tree().current_scene.add_child(projectile)

func _dash() -> void:
	if _dash_cooldown > 0.0:
		return
	_dash_time = 0.16
	_dash_cooldown = 1.0 if level < 3 else 0.65

func take_damage(amount: float) -> void:
	if _hurt_cooldown > 0.0:
		return
	health = maxf(0.0, health - amount)
	_hurt_cooldown = 0.75
	if health <= 0.0:
		health = MAX_HEALTH
		global_position = Vector2.ZERO
		ki = MAX_KI

func gain_xp(amount: int) -> void:
	xp += amount
	while xp >= level * 30:
		xp -= level * 30
		level += 1
		health = MAX_HEALTH
		ki = MAX_KI
