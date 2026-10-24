extends CanvasLayer

const ArtAssets = preload("res://scripts/art_assets.gd")

const PIXEL_GLYPHS := {
	"A": ["010", "101", "111", "101", "101"],
	"E": ["111", "100", "110", "100", "111"],
	"I": ["111", "010", "010", "010", "111"],
	"K": ["101", "101", "110", "101", "101"],
	"L": ["100", "100", "100", "100", "111"],
	"P": ["110", "101", "110", "100", "100"],
	"V": ["101", "101", "101", "101", "010"],
	"X": ["101", "101", "010", "101", "101"],
	"0": ["111", "101", "101", "101", "111"],
	"1": ["010", "110", "010", "010", "111"],
	"2": ["110", "001", "010", "100", "111"],
	"3": ["110", "001", "010", "001", "110"],
	"4": ["101", "101", "111", "001", "001"],
	"5": ["111", "100", "110", "001", "110"],
	"6": ["011", "100", "110", "101", "010"],
	"7": ["111", "001", "010", "010", "010"],
	"8": ["010", "101", "010", "101", "010"],
	"9": ["010", "101", "011", "001", "110"],
	"/": ["001", "001", "010", "100", "100"],
	" ": ["000", "000", "000", "000", "000"],
}

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
	_draw_pixel_text("LV %d  XP %d/%d" % [player.level, player.xp, player.level * 30], Vector2i(10, 18), 1, Color("#fff1c9"))
	_canvas.draw_rect(Rect2(10, 24, 46, 4), Color("#282a39"))
	_canvas.draw_rect(Rect2(10, 24, 46.0 * player.ki / player.MAX_KI, 4), Color("#58c8df"))
	_draw_pixel_text("KI", Vector2i(59, 30), 1, Color("#d4f7ff"))

	var total_width := 9 * 26
	var start_x := (480 - total_width) / 2
	var heart_spacing := 12
	var max_health: int = player.MAX_HEALTH
	var hearts_width: int = (max_health - 1) * heart_spacing + 9
	var hearts_x: int = (480 - hearts_width) / 2
	for heart in range(max_health):
		var remaining_health: float = player.health - heart
		var state := 2 if remaining_health >= 1.0 else 1 if remaining_health >= 0.5 else 0
		var heart_sprite := ArtAssets.heart_texture(state)
		var heart_position := Vector2(hearts_x + heart * heart_spacing, 219)
		_canvas.draw_texture(heart_sprite, heart_position)
	for slot in range(9):
		var slot_x := start_x + slot * 26
		var rect := Rect2(slot_x, 232, 24, 27)
		_canvas.draw_rect(rect, Color("#252631"))
		_canvas.draw_rect(rect, Color("#d7b758") if slot == player.selected_slot else Color("#696472"), false, 2.0)
		_draw_pixel_text(str(slot + 1), Vector2i(slot_x + 3, 235), 1, Color("#e5dbca"))
		if _counts[slot] > 0:
			_draw_pixel_text(str(_counts[slot]), Vector2i(slot_x + 18, 251), 1, Color("#fff4d8"))

func _draw_pixel_text(text: String, position: Vector2i, pixel_size: int, color: Color) -> void:
	var cursor_x := position.x
	for index in range(text.length()):
		var character := text.substr(index, 1).to_upper()
		var glyph: Array = PIXEL_GLYPHS.get(character, PIXEL_GLYPHS[" "])
		for row in range(glyph.size()):
			var pixels: String = glyph[row]
			for column in range(pixels.length()):
				if pixels.substr(column, 1) == "1":
					_canvas.draw_rect(
						Rect2i(cursor_x + column * pixel_size, position.y + row * pixel_size, pixel_size, pixel_size),
						color
					)
		cursor_x += 4 * pixel_size
