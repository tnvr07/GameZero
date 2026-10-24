extends RefCounted

static func move_body(body: CharacterBody2D, motion: Vector2, pixel_step_size: float, max_slides: int) -> void:
	var remaining := motion
	for slide_index in range(max_slides):
		if remaining.is_zero_approx():
			break
		var step_count := maxi(1, ceili(remaining.length() / pixel_step_size))
		var step := remaining / step_count
		var collided := false
		for step_index in range(step_count):
			var collision := body.move_and_collide(step)
			if collision == null:
				continue
			remaining = collision.get_remainder() + step * (step_count - step_index - 1)
			remaining = remaining.slide(collision.get_normal())
			collided = true
			break
		if not collided:
			break
