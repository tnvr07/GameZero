extends Node2D

const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const HudScript = preload("res://scripts/hud.gd")

func _ready() -> void:
	var world = WorldScript.new()
	world.name = "World"
	add_child(world)

	var player = PlayerScript.new()
	player.name = "Player"
	player.position = Vector2.ZERO
	world.add_actor(player)
	world.player = player

	var camera := Camera2D.new()
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 8.0
	player.add_child(camera)
	camera.make_current()

	var hud := HudScript.new()
	hud.player = player
	add_child(hud)

	world.populate_enemies()
