extends CanvasLayer

var player
var _canvas: Control
var _counts: Array[int] = [3, 0, 0, 0, 0, 0, 0, 0, 0]

func _ready() -> void:
	_canvas = Control.new()
	_canvas.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_canvas.draw.connect(_draw_hud)
	add_child(_canvas)

func _process(_delta: float) -> void:
	if _canvas != null:
		_canvas.queue_redraw()

func _draw_hud() -> void:
	if player == null:
		return
	var font := ThemeDB.fallback_font
	_canvas.draw_string(font, Vector2(10, 18), "LV %d   XP %d/%d" % [player.level, player.xp, player.level * 30], HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color("#fff1c9"))
	_canvas.draw_rect(Rect2(10, 24, 68, 5), Color("#282a39"))
	_canvas.draw_rect(Rect2(10, 24, 68.0 * player.ki / player.MAX_KI, 5), Color("#58c8df"))
	_canvas.draw_string(font, Vector2(83, 30), "KI", HORIZONTAL_ALIGNMENT_LEFT, -1, 7, Color("#d4f7ff"))

	var total_width := 9 * 26
	var start_x := (480 - total_width) / 2
	var hearts_x: float = start_x + total_width / 2.0 - player.MAX_HEALTH * 6
	for heart in range(player.MAX_HEALTH):
		var color := Color("#ed5360") if heart < player.health else Color("#563d49")
		_canvas.draw_string(font, Vector2(hearts_x + heart * 12, 215), "♥", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, color)
	for slot in range(9):
		var rect := Rect2(start_x + slot * 26, 232, 24, 27)
		_canvas.draw_rect(rect, Color("#252631"))
		_canvas.draw_rect(rect, Color("#d7b758") if slot == player.selected_slot else Color("#696472"), false, 2.0)
		_canvas.draw_string(font, rect.position + Vector2(3, 9), str(slot + 1), HORIZONTAL_ALIGNMENT_LEFT, -1, 7, Color("#e5dbca"))
		if _counts[slot] > 0:
			_canvas.draw_string(font, rect.position + Vector2(15, 24), str(_counts[slot]), HORIZONTAL_ALIGNMENT_RIGHT, 8, 8, Color("#fff4d8"))
