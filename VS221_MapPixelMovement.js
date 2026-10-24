/*:
 * @target MV MZ
 * @plugindesc Grid pixel movement, custom hitboxes, and smart pathfinding.
 * @author Vishi221
 * @url https://vishi221.itch.io/
 * @help
 * Works with RPG Maker MV and MZ.
 * ---------------------------------------------------------------------------
 * Version: 1.0.5
 * ---------------------------------------------------------------------------
 * Features:
 * - Small-grid ( 12px ) pixel movement for player, events, followers, boats, and ships. 
 * - Custom body and directional interaction hitboxes for actors and events.
 * - Smart event movement for Move Toward Player.
 * - Dash movement with custom speed, angle, and separate event/map through options.
 * - Debug display for map grid, body hitboxes, and interaction hitboxes.
 *
 * Compatibility with:
 * - YEP_RegionRestrictions
 * - VisuMZ_EventsMoveCore ( 70% )
 * - Galv_CharacterAnimations ( MZ)
 * 
 * HITBOX TAGS:
 * Add these to Actor Notes or Event Comment commands.
 * Rect offset uses the top-left point of the hitbox.
 * Circle offset uses the center point of the circle.
 *
 * General Body:
 *   <Body:0.6,0.45, Offset:0.2,0.5>
 *   <Body:circle,0.3, Offset:0.5,0.75>
 *
 * Directional Interaction:
 *   <InteractUp:0.6,0.45, InteractUpOffset:0.2,0.05>
 *   <InteractDown:circle,0.35, InteractDownOffset:0.5,1.1>
 *   <InteractLeft:0.45,0.45, InteractLeftOffset:-0.25,0.5>
 *   <InteractRight:0.45,0.45, InteractRightOffset:0.8,0.5>
 *
 * Circle Interaction Examples:
 *   <InteractUp:circle,0.35, InteractUpOffset:0.5,-0.1>
 *   <InteractDown:circle,0.35, InteractDownOffset:0.5,1.1>
 *   <InteractLeft:circle,0.35, InteractLeftOffset:-0.1,0.75>
 *   <InteractRight:circle,0.35, InteractRightOffset:1.1,0.75>
 *
 * Vehicle Parameter Examples:
 *   Boat / Ship Body Hitbox: Shape circle, Radius 0.45, Offset X 0.5, Offset Y 0.5
 *   Boat / Ship Interaction Hitbox: Shape circle, Radius 0.8, Offset X 0.5, Offset Y 0.5
 *
 * MZ Plugin Command:
 * - Set Grid Visible
 * - Set Body Hitbox Visible
 * - Set Interaction Hitbox Visible
 * - Set Touch Cooldown Persistent
 * - Set Tile Step Mode
 *
 * MV Plugin Command:
 * VS221_MapPixelMovement ShowGrid true
 * VS221_MapPixelMovement ShowGrid false
 * VS221_MapPixelMovement ShowBodyHitbox true
 * VS221_MapPixelMovement ShowBodyHitbox false
 * VS221_MapPixelMovement ShowInteractionHitbox true
 * VS221_MapPixelMovement ShowInteractionHitbox false
 * VS221_MapPixelMovement KeepTouchCooldown true
 * VS221_MapPixelMovement KeepTouchCooldown false
 * VS221_MapPixelMovement TileStep true -2 true 0
 * VS221_MapPixelMovement TileStep false -2 false 12
 * VS221_MapPixelMovement TileStep true -1 true 0
 * VS221_MapPixelMovement TileStep true 0 true 0
 * VS221_MapPixelMovement TileStep true 2,3,5,7 true 0
 * The third value enables movement to the nearest 48x48 grid position.
 * The fourth value changes Slide Edge Pixels. Use -1 to keep the current value.
 *
 * Script calls:
 * Movement owner ID rules:
 * Blank = current event, or the character running the Move Route script.
 * -1 = player.
 * 0 = current event.
 * 1 or higher = map event ID.
 *
 * Player destination:
 * MapPixelMovement.setDestination(10, 8)     // Set player mouse/touch destination to map X 10, Y 8.
 *
 * Tile step mode target rules:
 * -2 = all characters. -1 = player. 0 = current event.
 * 1 or higher = map event ID. Multiple event IDs can be separated by commas.
 * MapPixelMovement.setTileStep(true, -2, true, 0)          // Tile mode, smooth center, disable edge sliding.
 * MapPixelMovement.setTileStep(false, -2, false, 12)       // Pixel mode and restore 12px edge sliding.
 * MapPixelMovement.setTileStep(true, -1, true, 0)          // Player only.
 * MapPixelMovement.setTileStep(true, 0, true, 0)           // Current event only.
 * MapPixelMovement.setTileStep(true, "2,3,5,7", true, 0)   // Listed events.
 * The third value controls smooth centering.
 * The fourth value changes Slide Edge Pixels. Use -1 to keep the current value.
 *
 * Move current event or Move Route owner:
 * MapPixelMovement.moveTo(0)                 // Current owner moves to the player.
 * MapPixelMovement.moveTo(3)                 // Current owner moves to event ID 3.
 * MapPixelMovement.moveTo(10, 8)             // Current owner moves to map X 10, Y 8.
 * MapPixelMovement.stop()                    // Stop current owner's moveTo and skip the rest of the current route.
 * MapPixelMovement.stop(120)                 // Pause current owner for 120 frames, then continue the route automatically.
 * MapPixelMovement.teleportTo(10, 8)         // Teleport current owner to map X 10, Y 8.
 * MapPixelMovement.jumpTo(10, 8)             // Jump current owner to map X 10, Y 8 using the default jump arc.
 * MapPixelMovement.moveAngle(3, 45)          // Move current owner forward 3 steps at 45 degrees.
 * MapPixelMovement.backAngle(3, 45)          // Move current owner backward 3 steps at 45 degrees, keeping the old facing direction.
 *
 * Move player or another event by ID:
 * MapPixelMovement.moveTo(-1, 10, 8)         // Move the player to map X 10, Y 8.
 * MapPixelMovement.moveTo(5, 10, 8)          // Move event ID 5 to map X 10, Y 8.
 * MapPixelMovement.stop(120, 5)              // Pause event ID 5 moveTo movement for 120 frames.
 * MapPixelMovement.stop(0, -1)               // Stop the player moveTo movement.
 * MapPixelMovement.teleportTo(10, 8, -1)     // Teleport the player to map X 10, Y 8.
 * MapPixelMovement.teleportTo(10, 8, 5)      // Teleport event ID 5 to map X 10, Y 8.
 * MapPixelMovement.jumpTo(10, 8, -1)         // Jump the player to map X 10, Y 8 using the default jump arc.
 * MapPixelMovement.jumpTo(10, 8, 5)          // Jump event ID 5 to map X 10, Y 8 using the default jump arc.
 * MapPixelMovement.moveAngle(3, 45, -1)      // Move the player forward 3 steps at 45 degrees.
 * MapPixelMovement.moveAngle(3, 45, 5)       // Move event ID 5 forward 3 steps at 45 degrees.
 * MapPixelMovement.backAngle(3, 45, -1)      // Move the player backward 3 steps at 45 degrees.
 * MapPixelMovement.backAngle(3, 45, 5)       // Move event ID 5 backward 3 steps at 45 degrees.
 *
 * Dash current event or Move Route owner:
 * MapPixelMovement.dashForward(6, 4)         // Dash forward 6 steps with speed multiplier 4.
 * MapPixelMovement.dashBack(4, 4)            // Dash backward 4 steps with speed multiplier 4.
 * MapPixelMovement.dashAngle(6, 45, 4)       // Dash 6 steps at 45 degrees with speed multiplier 4.
 * MapPixelMovement.dashForward(6, 4, true, false)  // Dash through events, but still collide with the map.
 * MapPixelMovement.dashForward(6, 4, false, true)  // Dash through map collision, but still collide with events.
 * MapPixelMovement.dashForward(6, 4, true, true)   // Dash through both events and map collision.
 *
 * Dash player or another event by ID:
 * MapPixelMovement.dashForward(6, 4, false, false, -1)  // Dash the player forward.
 * MapPixelMovement.dashForward(6, 4, false, false, 5)   // Dash event ID 5 forward.
 * MapPixelMovement.dashBack(4, 4, false, false, -1)     // Dash the player backward.
 * MapPixelMovement.dashBack(4, 4, false, false, 5)      // Dash event ID 5 backward.
 * MapPixelMovement.dashAngle(6, 45, 4, false, false, -1)  // Dash the player at 45 degrees.
 * MapPixelMovement.dashAngle(6, 45, 4, false, false, 5)   // Dash event ID 5 at 45 degrees.
 *
 * PERFORMANCE NOTE:
 * Smart Finding uses optimized pathfinding, but very large maze maps or many chasing events can still be CPU-heavy.
 * For smoother performance, especially on low-end CPUs, use an updated NW.js/runtime when possible.
 * Pixel-perfect collision is map/tile based only. Auto Sprite Feet Offset scans a rendered character frame only when its sprite setup changes, then caches the result.
 * Sprite pixels are not used as collision geometry.
 * 
 * SUPPORT:
 *   Author: Vishi221  |  URL: https://vishi221.itch.io/
 *   Bug reports / feedback: via the itch.io page above
 *   Discord: https://discord.gg/C5EaJwgHwd
 *
 * @command SetGridVisible
 * @text Set Grid Visible
 *
 * @arg visible
 * @text Visible
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @command SetBodyHitboxVisible
 * @text Set Body Hitbox Visible
 *
 * @arg visible
 * @text Visible
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @command SetInteractionHitboxVisible
 * @text Set Interaction Hitbox Visible
 *
 * @arg visible
 * @text Visible
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @command SetTouchCooldownPersistent
 * @text Set Touch Cooldown Persistent
 *
 * @arg enabled
 * @text Enabled
 * @type boolean
 * @on Keep
 * @off Reset
 * @default false
 *
 * @command SetTileStepMode
 * @text Set Tile Step Mode
 *
 * @arg enabled
 * @text Enabled
 * @type boolean
 * @on Tile 48x48
 * @off Pixel 12px
 * @default false
 *
 * @arg targets
 * @text Targets
 * @type string
 * @default -2
 * @desc -2 = All, -1 = Player, 0 = Current Event, or event IDs separated by commas: 2,3,5,7
 *
 * @arg center
 * @text Center to 48x48 Grid
 * @type boolean
 * @on Move
 * @off Keep Position
 * @default true
 * @desc Moves selected targets to the nearest tile grid position.
 *
 * @arg slidePixels
 * @text Slide Edge Pixels
 * @type number
 * @min -1
 * @max 24
 * @default 0
 * @desc 0 disables edge sliding for grid movement. -1 keeps the current value.
 * 
 * @param Allow Diagonal Movement
 * @text Allow Diagonal Movement
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 *
 * @param Diagonal Speed
 * @text Diagonal Speed (%)
 * @type number
 * @decimals 2
 * @min 1
 * @max 100
 * @default 70.71
 * @desc 70.71 matches straight movement speed like DotMove. 100 keeps the old faster diagonal speed.
 *
 * @param Smart Finding
 * @text Smart Finding (Experimental)
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 * @desc Experimental pathfinding for events. Can be CPU-heavy with many chasing events or maze map, disable it if FPS drops.
 *
 * @param Auto Sprite Feet Offset
 * @text Auto Sprite Feet Offset
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 * @desc Detect visible feet inside the character frame and shift body and interaction hitboxes to that visual foot position.
 *
 * @param Body Hitbox
 * @text Body Hitbox
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.6","Height":"0.45","Radius":"0.3","Offset X":"0.2","Offset Y":"0.5"}
 * @desc Default body collision hitbox.
 *
 * @param Interaction Up
 * @text Interaction Up
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.6","Height":"0.45","Radius":"0.3","Offset X":"0.2","Offset Y":"0.05"}
 * @desc Default up interaction hitbox.
 *
 * @param Interaction Down
 * @text Interaction Down
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.6","Height":"0.45","Radius":"0.3","Offset X":"0.2","Offset Y":"0.9"}
 * @desc Default down interaction hitbox.
 *
 * @param Interaction Left
 * @text Interaction Left
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.45","Height":"0.45","Radius":"0.3","Offset X":"-0.25","Offset Y":"0.5"}
 * @desc Default left interaction hitbox.
 *
 * @param Interaction Right
 * @text Interaction Right
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.45","Height":"0.45","Radius":"0.3","Offset X":"0.8","Offset Y":"0.5"}
 * @desc Default right interaction hitbox.
 *
 * @param Vehicle Body Hitbox
 * @text Boat / Ship Body Hitbox
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"0.8","Height":"0.8","Radius":"0.4","Offset X":"0.1","Offset Y":"0.1"}
 * @desc Shared body collision hitbox for Boat and Ship.
 *
 * @param Vehicle Interaction Hitbox
 * @text Boat / Ship Interaction Hitbox
 * @type struct<Hitbox>
 * @default {"Shape":"rect","Width":"1.4","Height":"1.4","Radius":"0.75","Offset X":"-0.2","Offset Y":"-0.2"}
 * @desc Shared OK interaction hitbox for Boat and Ship.
 * 
 * @param Slide Edge Pixels
 * @text Slide Edge Pixels
 * @type number
 * @min 0
 * @max 24
 * @default 12
 * @desc Max pixel distance used to slide along hitbox edges. 0 disables edge sliding.
 *
 * @param Follower Distance
 * @text Follower Distance
 * @type number
 * @decimals 2
 * @min 0.30
 * @max 3.00
 * @default 0.90
 * @desc Distance between each follower. Lower = closer, higher = farther.
 *
 * @param Touch Trigger Cooldown
 * @text Touch Trigger Cooldown
 * @type number
 * @min 0
 * @max 120
 * @default 20
 * @desc Cooldown frames before Player Touch or Event Touch can trigger again. 0 disables cooldown.
 *
 * @param Keep Touch Cooldown After Leave
 * @text Keep Touch Cooldown After Leave
 * @type boolean
 * @on Keep
 * @off Reset
 * @default false
 * @desc If false, touch cooldown resets when the player leaves that event body hitbox.
 *
 * @param Region Detection Mode
 * @text Region / Terrain Detection Mode
 * @type select
 * @option Default 48x48
 * @value default
 * @option Pixel Body Hitbox
 * @value pixel
 * @default pixel
 * @desc Default uses RPG Maker tile-style checks. Pixel Body Hitbox checks Region ID and Terrain Tag touched by the character body hitbox.
 *
 * @param Pixel Region Touch Frames
 * @text Pixel Region / Terrain Touch Frames
 * @type number
 * @min 0
 * @max 9999
 * @default 4
 * @desc Pixel Body Hitbox mode only. Required frames touching the same Region ID or Terrain Tag before it returns. 0 = instant.
 *
 * @param Show Map Grid
 * @text Show Map Grid
 * @type boolean
 * @on Show
 * @off Hide
 * @default false
 * @desc Show Map Grid for testing.
 *
 * @param Grid Color
 * @text Grid Color
 * @type string
 * @default #66ccff
 *
 * @param Show Body Hitboxes
 * @text Show Body Hitboxes
 * @type boolean
 * @on Show
 * @off Hide
 * @default false
 * @desc Shows body collision hitboxes for testing.
 *
 * @param Show Interaction Hitboxes
 * @text Show Interaction Hitboxes
 * @type boolean
 * @on Show
 * @off Hide
 * @default false
 * @desc Shows directional interaction hitboxes for testing.

 */
/*~struct~Hitbox:
 * @param Shape
 * @text Shape
 * @type select
 * @option Rectangle
 * @value rect
 * @option Circle
 * @value circle
 * @default rect
 *
 * @param Width
 * @text Width
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 4
 * @default 0.6
 *
 * @param Height
 * @text Height
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 4
 * @default 0.45
 *
 * @param Radius
 * @text Radius
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 4
 * @default 0.3
 *
 * @param Offset X
 * @text Offset X
 * @type number
 * @decimals 2
 * @min -4
 * @max 4
 * @default 0
 *
 * @param Offset Y
 * @text Offset Y
 * @type number
 * @decimals 2
 * @min -4
 * @max 4
 * @default 0
 */

var Imported = Imported || {};
Imported.VS221_MapPixelMovement = true;
window.MapPixelMovement = window.MapPixelMovement || {};
window.vs221 = window.vs221 || {};
window.vs221.MapPixelMovement = window.MapPixelMovement;
(function() {
    "use strict";
    var vsPluginName = "VS221_MapPixelMovement";
    var vsParams = PluginManager.parameters(vsPluginName);
    var VS = window.MapPixelMovement;
    function bool(name, value) {
        var v = vsParams[name];
        return v === undefined || v === "" ? value : String(v).toLowerCase() === "true";
    }
    function num(name, value, min, max) {
        var n = Number(vsParams[name]);
        if (!isFinite(n)) n = value;
        if (min !== undefined) n = Math.max(min, n);
        if (max !== undefined) n = Math.min(max, n);
        return n;
    }
    function argBool(value, fallback) {
        if (value === undefined || value === null || value === "") return fallback;
        var t = String(value).toLowerCase();
        if (t === "true" || t === "on" || t === "show" || t === "1") return true;
        if (t === "false" || t === "off" || t === "hide" || t === "0") return false;
        return fallback;
    }
    function boxData(data, fallback) {
        data = data || {};
        var shape = String(data.Shape || data.shape || fallback.shape || "rect").toLowerCase() === "circle" ? "circle" : "rect";
        var w = Math.max(0.01, Number(data.Width || data.width || fallback.width || 0.6));
        var h = Math.max(0.01, Number(data.Height || data.height || fallback.height || 0.45));
        var r = Math.max(0.01, Number(data.Radius || data.radius || fallback.radius || Math.min(w, h) / 2));
        var ox = Number(data["Offset X"] || data.OffsetX || data.offsetX || fallback.offsetX || 0);
        var oy = Number(data["Offset Y"] || data.OffsetY || data.offsetY || fallback.offsetY || 0);
        return { shape: shape, width: w, height: h, radius: r, offsetX: isFinite(ox) ? ox : 0, offsetY: isFinite(oy) ? oy : 0 };
    }
    function boxParam(name, fallback) {
        var raw = vsParams[name];
        if (!raw) return boxData({}, fallback);
        if (String(raw).trim().charAt(0) !== "{") return boxData({}, fallback);
        try {
            return boxData(JSON.parse(raw), fallback);
        } catch (e) {
            return boxData({}, fallback);
        }
    }
    var vsGridPixel = 12;
    var vsDiagonal = bool("Allow Diagonal Movement", true);
    var vsDiagonalSpeed = num("Diagonal Speed", 70.71, 1, 100) / 100;
    var vsSmartFinding = bool("Smart Finding", true);
    var vsAutoSpriteFeetOffset = bool("Auto Sprite Feet Offset", true);
    var vsSmartThinkTime = 18;
    var vsSmartSearchLimit = 2048;
    var vsSmartWideSearchLimit = 2048;
    var vsFollowSmartAfterBlockedDefault = 3;
    var vsFollowSmartSearchLimitDefault = 512;
    var vsSmartRouteLife = Math.max(36, vsSmartThinkTime * 6);
    var vsSmartFarKeepCells = 14;
    var vsSmartFarKeepDistance = 5;
    var vsSmartFarRefresh = 96;
    var vsSmartFailLife = 60;
    var vsSlideEdgePixels = Math.floor(num("Slide Edge Pixels", 12, 0, 24));
    var vsBodyHitboxDefault = boxParam("Body Hitbox", { shape: "rect", width: 0.6, height: 0.45, radius: 0.3, offsetX: 0.2, offsetY: 0.5 });
    var vsInteractionDefaults = {
        8: boxParam("Interaction Up", { shape: "rect", width: 0.6, height: 0.45, radius: 0.3, offsetX: 0.2, offsetY: 0.05 }),
        2: boxParam("Interaction Down", { shape: "rect", width: 0.6, height: 0.45, radius: 0.3, offsetX: 0.2, offsetY: 0.9 }),
        4: boxParam("Interaction Left", { shape: "rect", width: 0.45, height: 0.45, radius: 0.3, offsetX: -0.25, offsetY: 0.5 }),
        6: boxParam("Interaction Right", { shape: "rect", width: 0.45, height: 0.45, radius: 0.3, offsetX: 0.8, offsetY: 0.5 })
    };
    var vsVehicleBodyDefault = boxParam("Vehicle Body Hitbox", { shape: "rect", width: 0.8, height: 0.8, radius: 0.4, offsetX: 0.1, offsetY: 0.1 });
    var vsVehicleInteractionDefault = boxParam("Vehicle Interaction Hitbox", { shape: "rect", width: 1.4, height: 1.4, radius: 0.75, offsetX: -0.2, offsetY: -0.2 });
    var vsFollowerDistance = num("Follower Distance", 0.9, 0.3, 3);
    var vsTouchTriggerCooldown = Math.floor(num("Touch Trigger Cooldown", 20, 0, 120));
    var vsTouchCooldownPersistent = bool("Keep Touch Cooldown After Leave", false);
    var vsRegionDetectionMode = String(vsParams["Region Detection Mode"] || "pixel").toLowerCase();
    if (vsRegionDetectionMode !== "default") vsRegionDetectionMode = "pixel";
    var vsPixelRegionTouchFrames = Number(vsParams["Pixel Region Touch Frames"]);
    if (!isFinite(vsPixelRegionTouchFrames)) vsPixelRegionTouchFrames = 4;
    vsPixelRegionTouchFrames = Math.max(0, Math.floor(vsPixelRegionTouchFrames));
    var vsShowGrid = bool("Show Map Grid", false);
    var vsShowBodyHitboxes = bool("Show Body Hitboxes", false);
    var vsShowInteractionHitboxes = bool("Show Interaction Hitboxes", false);
    var vsGridColor = parseInt(String(vsParams["Grid Color"] || "#66ccff").replace("#", ""), 16);
    var vsEps = 0.000001;
    var vsForceCollisionPixelStep = 1;
    if (!isFinite(vsGridColor)) vsGridColor = 0x66ccff;
    function divX() {
        var tw = $gameMap && $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
        return Math.max(1, tw / vsGridPixel);
    }
    function divY() {
        var th = $gameMap && $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
        return Math.max(1, th / vsGridPixel);
    }
    function unitX() { return 1 / divX(); }
    function unitY() { return 1 / divY(); }
    function unit() { return Math.min(unitX(), unitY()); }
    function tileStepData() {
        if (!$gameSystem) return null;
        var data = $gameSystem._vsMapPixelTileStepModes;
        if (!data || typeof data !== "object") {
            data = { all: false, player: null, maps: {} };
            $gameSystem._vsMapPixelTileStepModes = data;
        }
        if (data.all === undefined) data.all = false;
        if (!data.maps || typeof data.maps !== "object") data.maps = {};
        return data;
    }
    function tileStepModeFor(ch) {
        if (ch && ch._vsMapPixelTileStepCenterHold) return false;
        var data = tileStepData();
        var fallback = data ? !!data.all : false;
        if (!ch) return fallback;
        if (typeof Game_Player !== "undefined" && ch instanceof Game_Player) {
            return data && data.player !== null && data.player !== undefined ? !!data.player : fallback;
        }
        if (typeof Game_Event !== "undefined" && ch instanceof Game_Event) {
            var mapId = Number(ch._mapId || ($gameMap && $gameMap.mapId ? $gameMap.mapId() : 0));
            var eventId = ch.eventId ? Number(ch.eventId()) : Number(ch._eventId || 0);
            var map = data && data.maps ? data.maps[String(mapId)] : null;
            if (map && Object.prototype.hasOwnProperty.call(map, String(eventId))) return !!map[String(eventId)];
        }
        return fallback;
    }
    function routeUnitX(ch) { return tileStepModeFor(ch) ? 1 : unitX(); }
    function routeUnitY(ch) { return tileStepModeFor(ch) ? 1 : unitY(); }
    function routeUnit(ch) { return tileStepModeFor(ch) ? 1 : unit(); }
    function snapX(v) { var d = divX(); return Math.round(Number(v || 0) * d) / d; }
    function snapY(v) { var d = divY(); return Math.round(Number(v || 0) * d) / d; }
    function snap(v) { return snapX(v); }
    function fx(v) { return Math.floor(Number(v || 0) + vsEps); }
    function rx(x) {
        if (!$gameMap || !$gameMap.isLoopHorizontal || !$gameMap.isLoopHorizontal()) return x;
        var w = $gameMap.width();
        return ((x % w) + w) % w;
    }
    function ry(y) {
        if (!$gameMap || !$gameMap.isLoopVertical || !$gameMap.isLoopVertical()) return y;
        var h = $gameMap.height();
        return ((y % h) + h) % h;
    }
    function dataTile(ch) {
        if (!$gameMap || !ch) return null;
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        var p = mpc && mpc.databaseTileAt ? mpc.databaseTileAt(Number(ch._x || 0), Number(ch._y || 0)) : null;
        if (p) return p.empty ? null : p;
        var mx = rx(Math.round(Number(ch._x || 0))), my = ry(Math.round(Number(ch._y || 0)));
        return $gameMap.isValid(mx, my) ? { x: mx, y: my } : null;
    }
    function dx(a, b) { return $gameMap ? $gameMap.deltaX(a, b) : a - b; }
    function dy(a, b) { return $gameMap ? $gameMap.deltaY(a, b) : a - b; }
    function dirX(d) { return d === 4 || d === 1 || d === 7 ? -1 : d === 6 || d === 3 || d === 9 ? 1 : 0; }
    function dirY(d) { return d === 8 || d === 7 || d === 9 ? -1 : d === 2 || d === 1 || d === 3 ? 1 : 0; }
    function horz(d) { var x = dirX(d); return x < 0 ? 4 : x > 0 ? 6 : 0; }
    function vert(d) { var y = dirY(d); return y < 0 ? 8 : y > 0 ? 2 : 0; }
    function dir(h, v) {
        if (h === 4 && v === 2) return 1;
        if (h === 6 && v === 2) return 3;
        if (h === 4 && v === 8) return 7;
        if (h === 6 && v === 8) return 9;
        return h || v || 0;
    }
    function rev(d) {
        return d === 2 ? 8 : d === 8 ? 2 : d === 4 ? 6 : d === 6 ? 4 : 0;
    }
    function inputDir8() {
        var x = (Input.isPressed("right") ? 1 : 0) - (Input.isPressed("left") ? 1 : 0);
        var y = (Input.isPressed("down") ? 1 : 0) - (Input.isPressed("up") ? 1 : 0);
        if (x < 0) return y < 0 ? 7 : y > 0 ? 1 : 4;
        if (x > 0) return y < 0 ? 9 : y > 0 ? 3 : 6;
        return y < 0 ? 8 : y > 0 ? 2 : 0;
    }
    function active(ch) {
        if (!ch) return false;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) return (ch._type === "boat" || ch._type === "ship") && (!$gameMap || ch._mapId === $gameMap.mapId());
        if (typeof Game_Player !== "undefined" && ch instanceof Game_Player && ch.isInVehicle && ch.isInVehicle()) return false;
        return true;
    }
    function through(ch) {
        return ch && ((ch.isThrough && ch.isThrough()) || (ch.isDebugThrough && ch.isDebugThrough()));
    }
    function normal(ch) {
        return !ch || !ch.isNormalPriority || ch.isNormalPriority();
    }
    function partyCharacter(ch) {
        return (typeof Game_Player !== "undefined" && ch instanceof Game_Player) || (typeof Game_Follower !== "undefined" && ch instanceof Game_Follower);
    }
    function dirName(d) {
        if (d === 8) return "Up";
        if (d === 4) return "Left";
        if (d === 6) return "Right";
        return "Down";
    }
    function tagList(data, names) {
        for (var i = 0; i < names.length; i++) {
            if (data[names[i]]) return data[names[i]];
        }
        return null;
    }
    function tagNumber(list, index, value) {
        return list && typeof list[index] === "number" ? list[index] : value;
    }
    function parseBoxTags(text) {
        var result = {};
        var tagReg = /<([^<>]+)>/g;
        var tagMatch = null;
        while ((tagMatch = tagReg.exec(String(text || "")))) {
            var body = tagMatch[1];
            var pairReg = /([A-Za-z][A-Za-z0-9_]*):\s*([^:<>]*?)(?=\s*,?\s*[A-Za-z][A-Za-z0-9_]*:\s*|$)/g;
            var pair = null;
            while ((pair = pairReg.exec(body))) {
                var key = pair[1];
                var values = String(pair[2] || "").split(",").map(function(value) {
                    var text = value.trim();
                    var n = Number(text);
                    return isFinite(n) ? n : text;
                }).filter(function(value) {
                    return value !== "";
                });
                if (values.length > 0) {
                    result[key] = values;
                    if (key.indexOf("VS") !== 0) result["VS" + key] = values;
                }
            }
        }
        return result;
    }
    function tagBox(ch, boxNames, offsetNames, base) {
        var data = ch && ch.vsMapPixelBoxTags ? ch.vsMapPixelBoxTags() : {};
        var list = tagList(data, boxNames);
        var offsets = tagList(data, offsetNames);
        var hasTag = !!list;
        var shape = hasTag ? "rect" : (base.shape || "rect");
        var start = 0;
        if (list && typeof list[0] === "string") {
            shape = String(list[0]).toLowerCase() === "circle" ? "circle" : "rect";
            start = 1;
        }
        if (shape === "circle") {
            return {
                shape: "circle",
                radius: Math.max(0.01, tagNumber(list, start, base.radius || Math.min(base.width, base.height) / 2)),
                offsetX: tagNumber(list, start + 1, tagNumber(offsets, 0, base.offsetX)),
                offsetY: tagNumber(list, start + 2, tagNumber(offsets, 1, base.offsetY))
            };
        }
        return {
            shape: "rect",
            width: Math.max(0.01, tagNumber(list, start, base.width)),
            height: Math.max(0.01, tagNumber(list, start + 1, base.height)),
            offsetX: tagNumber(list, start + 2, tagNumber(offsets, 0, base.offsetX)),
            offsetY: tagNumber(list, start + 3, tagNumber(offsets, 1, base.offsetY))
        };
    }

    Game_CharacterBase.prototype.vsMapPixelBoxTags = function() {
        return {};
    };

    function mpcDatabaseValue(ch, name) {
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        if (!mpc || !mpc[name] || !ch) return null;
        var v = mpc[name](Number(ch._x || 0), Number(ch._y || 0));
        return v === undefined ? null : v;
    }

    Game_CharacterBase.prototype.isOnLadder = function() {
        var v = mpcDatabaseValue(this, "databaseIsLadderAt");
        if (v !== null) return !!v;
        var p = dataTile(this);
        return !!(p && $gameMap && $gameMap.isLadder && $gameMap.isLadder(p.x, p.y));
    };

    Game_CharacterBase.prototype.isOnBush = function() {
        var v = mpcDatabaseValue(this, "databaseIsBushAt");
        if (v !== null) return !!v;
        var p = dataTile(this);
        return !!(p && $gameMap && $gameMap.isBush && $gameMap.isBush(p.x, p.y));
    };

    Game_CharacterBase.prototype.terrainTag = function() {
        return vsMapPixelBodyTerrainTag(this);
    };

    function vsMapPixelRegionIdAt(x, y) {
        if (!$gameMap || !$gameMap.regionId) return 0;
        x = fx(rx(x));
        y = fx(ry(y));
        return $gameMap.isValid(x, y) ? Number($gameMap.regionId(x, y) || 0) : 0;
    }

    function vsMapPixelTerrainTagAt(x, y) {
        if (!$gameMap || !$gameMap.terrainTag) return 0;
        x = fx(rx(x));
        y = fx(ry(y));
        return $gameMap.isValid(x, y) ? Number($gameMap.terrainTag(x, y) || 0) : 0;
    }

    function vsMapPixelEngineRegionId(ch) {
        if (!ch || !$gameMap || !$gameMap.regionId) return 0;
        var x = rx(Number(ch._x || 0));
        var y = ry(Number(ch._y || 0));
        return $gameMap.isValid(x, y) ? Number($gameMap.regionId(x, y) || 0) : 0;
    }

    function vsMapPixelEngineTerrainTag(ch) {
        if (!ch || !$gameMap || !$gameMap.terrainTag) return 0;
        var x = rx(Number(ch._x || 0));
        var y = ry(Number(ch._y || 0));
        return $gameMap.isValid(x, y) ? Number($gameMap.terrainTag(x, y) || 0) : 0;
    }

    function vsMapPixelRegionTileHit(box, x, y) {
        if (!box) return false;
        var l = x;
        var r = x + 1;
        var t = y;
        var b = y + 1;
        if (box.r <= l + vsEps || box.l >= r - vsEps || box.b <= t + vsEps || box.t >= b - vsEps) return false;
        if (box.shape !== "circle") return true;
        var px = Math.max(l, Math.min(box.cx, r));
        var py = Math.max(t, Math.min(box.cy, b));
        var dx2 = dx(box.cx, px);
        var dy2 = dy(box.cy, py);
        return dx2 * dx2 + dy2 * dy2 <= box.radius * box.radius + vsEps;
    }

    function vsMapPixelRawBodyMapTag(ch, getter) {
        if (!ch || !$gameMap) return 0;
        var box = bodyBox(ch, Number(ch._x || 0), Number(ch._y || 0));
        if (!box) return 0;
        var l = Math.floor(box.l + vsEps);
        var r = Math.floor(box.r - vsEps);
        var t = Math.floor(box.t + vsEps);
        var b = Math.floor(box.b - vsEps);
        for (var y = t; y <= b; y++) {
            for (var x = l; x <= r; x++) {
                var id = getter(x, y);
                if (id > 0 && vsMapPixelRegionTileHit(box, x, y)) return id;
            }
        }
        return 0;
    }

    function vsMapPixelRawBodyRegionId(ch) {
        return vsMapPixelRawBodyMapTag(ch, vsMapPixelRegionIdAt);
    }

    function vsMapPixelRawBodyTerrainTag(ch) {
        return vsMapPixelRawBodyMapTag(ch, vsMapPixelTerrainTagAt);
    }

    function vsMapPixelMapTagDelay(ch, key, id) {
        if (!ch || vsPixelRegionTouchFrames <= 0) return id;
        var frame = typeof Graphics !== "undefined" && Graphics.frameCount ? Graphics.frameCount : 0;
        if (!ch._vsMapPixelMapTagTouch) ch._vsMapPixelMapTagTouch = {};
        var data = ch._vsMapPixelMapTagTouch[key];
        if (id <= 0) {
            ch._vsMapPixelMapTagTouch[key] = { id: 0, start: frame };
            return 0;
        }
        if (!data || data.id !== id) {
            ch._vsMapPixelMapTagTouch[key] = { id: id, start: frame };
            return 0;
        }
        return frame - data.start >= vsPixelRegionTouchFrames ? id : 0;
    }

    function vsMapPixelBodyRegionId(ch) {
        if (vsRegionDetectionMode === "default") return vsMapPixelEngineRegionId(ch);
        return vsMapPixelMapTagDelay(ch, "region", vsMapPixelRawBodyRegionId(ch));
    }

    function vsMapPixelBodyTerrainTag(ch) {
        if (vsRegionDetectionMode === "default") return vsMapPixelEngineTerrainTag(ch);
        return vsMapPixelMapTagDelay(ch, "terrain", vsMapPixelRawBodyTerrainTag(ch));
    }

    Game_CharacterBase.prototype.regionId = function() {
        return vsMapPixelBodyRegionId(this);
    };

    Game_Player.prototype.isOnDamageFloor = function() {
        var v = mpcDatabaseValue(this, "databaseIsDamageFloorAt");
        if (v !== null) return !!v;
        var p = dataTile(this);
        return !!(p && $gameMap && $gameMap.isDamageFloor && $gameMap.isDamageFloor(p.x, p.y));
    };

    function actorBoxTags(actor) {
        if (!actor || !actor.actor) return {};
        var data = actor.actor();
        var note = data ? String(data.note || "") : "";
        if (actor._vsMapPixelBoxNote !== note) {
            actor._vsMapPixelBoxNote = note;
            actor._vsMapPixelBoxTags = parseBoxTags(note);
        }
        return actor._vsMapPixelBoxTags || {};
    }

    Game_Player.prototype.vsMapPixelBoxTags = function() {
        var actor = $gameParty && $gameParty.leader ? $gameParty.leader() : null;
        return actorBoxTags(actor);
    };

    Game_Follower.prototype.vsMapPixelBoxTags = function() {
        return actorBoxTags(this.actor ? this.actor() : null);
    };

    var _VS221_MapPixel_eventSetupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function() {
        _VS221_MapPixel_eventSetupPageSettings.call(this);
        this._vsMapPixelPageBoxTags = null;
        this._vsMapPixelBodyData = null;
        this._vsMapPixelInteractionData = null;
    };

    Game_Event.prototype.vsMapPixelBoxTags = function() {
        if (this._vsMapPixelPageBoxTags) return this._vsMapPixelPageBoxTags;
        var list = this.list() || [];
        var text = "";
        for (var i = 0; i < list.length; i++) {
            var command = list[i];
            if (command && (command.code === 108 || command.code === 408) && command.parameters) {
                text += "\n" + String(command.parameters[0] || "");
            }
        }
        this._vsMapPixelPageBoxTags = parseBoxTags(text);
        return this._vsMapPixelPageBoxTags;
    };

    Game_CharacterBase.prototype.vsMapPixelBodyData = function() {
        return tagBox(this, ["Body", "VSBody"], ["BodyOffset", "Offset", "VSBodyOffset", "VSOffset"], vsBodyHitboxDefault);
    };

    Game_Event.prototype.vsMapPixelBodyData = function() {
        if (!this._vsMapPixelBodyData) {
            this._vsMapPixelBodyData = Game_CharacterBase.prototype.vsMapPixelBodyData.call(this);
        }
        return this._vsMapPixelBodyData;
    };

    Game_CharacterBase.prototype.vsMapPixelInteractionData = function(d) {
        var name = dirName(d);
        var base = vsInteractionDefaults[d] || vsInteractionDefaults[2];
        return tagBox(this, ["Interact" + name, "VSInteract" + name], ["Interact" + name + "Offset", "VSInteract" + name + "Offset", "InteractOffset", "VSInteractOffset"], base);
    };

    Game_Event.prototype.vsMapPixelInteractionData = function(d) {
        if (!this._vsMapPixelInteractionData) this._vsMapPixelInteractionData = {};
        var key = String(d || 2);
        if (!this._vsMapPixelInteractionData[key]) {
            this._vsMapPixelInteractionData[key] = Game_CharacterBase.prototype.vsMapPixelInteractionData.call(this, d);
        }
        return this._vsMapPixelInteractionData[key];
    };

    var vsMapPixelZeroFeetOffset = { x: 0, y: 0 };
    Game_CharacterBase.prototype.vsMapPixelFeetOffset = function() {
        if (!vsAutoSpriteFeetOffset) return vsMapPixelZeroFeetOffset;
        var offset = this._vsMapPixelFeetOffset;
        if (!offset || !isFinite(Number(offset.x)) || !isFinite(Number(offset.y))) return vsMapPixelZeroFeetOffset;
        return offset;
    };

    Game_CharacterBase.prototype.vsMapPixelBoxFromData = function(x, y, data) {
        var feet = this.vsMapPixelFeetOffset ? this.vsMapPixelFeetOffset() : vsMapPixelZeroFeetOffset;
        var fx = Number(feet.x) || 0;
        var fy = Number(feet.y) || 0;
        if (data.shape === "circle") {
            var cx = x + data.offsetX + fx;
            var cy = y + data.offsetY + fy;
            var r = data.radius;
            return { shape: "circle", cx: cx, cy: cy, radius: r, l: cx - r, r: cx + r, t: cy - r, b: cy + r };
        }
        return { shape: "rect", l: x + data.offsetX + fx, r: x + data.offsetX + data.width + fx, t: y + data.offsetY + fy, b: y + data.offsetY + data.height + fy };
    };

    Game_CharacterBase.prototype.vsMapPixelBodyBox = function(x, y) {
        return this.vsMapPixelBoxFromData(x, y, this.vsMapPixelBodyData());
    };

    Game_CharacterBase.prototype.vsMapPixelInteractionBox = function(x, y, d) {
        return this.vsMapPixelBoxFromData(x, y, this.vsMapPixelInteractionData(d || this.direction()));
    };

    Game_Vehicle.prototype.vsMapPixelVehicleActive = function() {
        return (this._type === "boat" || this._type === "ship") && (!$gameMap || this._mapId === $gameMap.mapId());
    };

    Game_Vehicle.prototype.vsMapPixelBodyData = function() {
        return vsVehicleBodyDefault;
    };

    Game_Vehicle.prototype.vsMapPixelInteractionData = function() {
        return vsVehicleInteractionDefault;
    };

    function vehicleList() {
        if (!$gameMap) return [];
        var list = [];
        var ship = $gameMap.ship ? $gameMap.ship() : null;
        var boat = $gameMap.boat ? $gameMap.boat() : null;
        if (ship && ship.vsMapPixelVehicleActive && ship.vsMapPixelVehicleActive()) list.push(ship);
        if (boat && boat.vsMapPixelVehicleActive && boat.vsMapPixelVehicleActive()) list.push(boat);
        return list;
    }
    function pointInBox(b, x, y) {
        if (!b || x < b.l || x > b.r || y < b.t || y > b.b) return false;
        if (b.shape !== "circle") return true;
        var px = dx(x, b.cx);
        var py = dy(y, b.cy);
        return px * px + py * py <= b.radius * b.radius;
    }
    function bodyBox(ch, x, y) {
        return ch && ch.vsMapPixelBodyBox ? ch.vsMapPixelBodyBox(x, y) : null;
    }
    function hit(a, b) {
        if (!a || !b || a.l >= b.r - vsEps || a.r <= b.l + vsEps || a.t >= b.b - vsEps || a.b <= b.t + vsEps) return false;
        if (a.shape !== "circle" && b.shape !== "circle") return true;
        if (a.shape === "circle" && b.shape === "circle") {
            var x1 = dx(b.cx, a.cx);
            var y1 = dy(b.cy, a.cy);
            var r = a.radius + b.radius;
            return x1 * x1 + y1 * y1 < r * r;
        }
        var circle = a.shape === "circle" ? a : b;
        var rect = a.shape === "circle" ? b : a;
        var px = Math.max(rect.l, Math.min(circle.cx, rect.r));
        var py = Math.max(rect.t, Math.min(circle.cy, rect.b));
        var x2 = dx(circle.cx, px);
        var y2 = dy(circle.cy, py);
        return x2 * x2 + y2 * y2 < circle.radius * circle.radius;
    }
    function touchHit(a, b) {
        if (!a || !b) return false;
        var tol = Math.max(vsEps, 0.001);
        if (a.shape !== "circle" && b.shape !== "circle") {
            return a.l <= b.r + tol && a.r >= b.l - tol && a.t <= b.b + tol && a.b >= b.t - tol;
        }
        if (a.shape === "circle" && b.shape === "circle") {
            var x1 = dx(b.cx, a.cx);
            var y1 = dy(b.cy, a.cy);
            var r = a.radius + b.radius + tol;
            return x1 * x1 + y1 * y1 <= r * r;
        }
        var circle = a.shape === "circle" ? a : b;
        var rect = a.shape === "circle" ? b : a;
        var px = Math.max(rect.l, Math.min(circle.cx, rect.r));
        var py = Math.max(rect.t, Math.min(circle.cy, rect.b));
        var x2 = dx(circle.cx, px);
        var y2 = dy(circle.cy, py);
        var r2 = circle.radius + tol;
        return x2 * x2 + y2 * y2 <= r2 * r2;
    }
    function inMap(b) {
        if (!$gameMap) return false;
        if ((!$gameMap.isLoopHorizontal || !$gameMap.isLoopHorizontal()) && (b.l < 0 || b.r > $gameMap.width())) return false;
        if ((!$gameMap.isLoopVertical || !$gameMap.isLoopVertical()) && (b.t < 0 || b.b > $gameMap.height())) return false;
        return true;
    }
    var vsMapRegionPassCache = null;
    function regionPassRules() {
        if (!$dataMap) return null;
        var mapId = $gameMap && $gameMap.mapId ? $gameMap.mapId() : 0;
        var note = String($dataMap.note || "");
        if (vsMapRegionPassCache && vsMapRegionPassCache.mapId === mapId && vsMapRegionPassCache.note === note) return vsMapRegionPassCache.data;
        var data = { allow: {}, forbid: {}, dock: {} };
        function addRegion(mode, type, id) {
            id = Number(id || 0);
            if (!isFinite(id) || id <= 0) return;
            mode = String(mode || "").toLowerCase();
            type = String(type || "").toLowerCase();
            if (!data[mode]) data[mode] = {};
            if (!data[mode][type]) data[mode][type] = {};
            data[mode][type][id] = true;
        }
        function addList(mode, type, list) {
            if (!list) return;
            for (var i = 0; i < list.length; i++) addRegion(mode, type, list[i]);
        }
        function parseRegionValues(values, callback) {
            String(values || "").split(",").forEach(function(part) {
                var text = String(part || "").trim();
                var range = text.match(/^(\d+)\s+to\s+(\d+)$/i);
                if (range) {
                    var a = Number(range[1]);
                    var b = Number(range[2]);
                    var s = a <= b ? 1 : -1;
                    for (var n = a; s > 0 ? n <= b : n >= b; n += s) callback(n);
                } else {
                    var ids = text.match(/\d+/g) || [];
                    for (var i = 0; i < ids.length; i++) callback(Number(ids[i]));
                }
            });
        }
        note.replace(/<\s*(All|Walk|Player|Event|Vehicle|Boat|Ship|Airship)\s+(Allow|Forbid|Dock)\s+Regions?\s*:\s*([^>]+)>/gi, function(match, type, mode, values) {
            type = String(type || "").toLowerCase();
            mode = String(mode || "").toLowerCase();
            parseRegionValues(values, function(id) {
                addRegion(mode, type, id);
            });
            return match;
        });
        note.replace(/<\s*(Player|Event|All)\s+(Restrict|Allow)\s+Regions?\s*:\s*([^>]+)>/gi, function(match, type, mode, values) {
            type = String(type || "").toLowerCase();
            mode = String(mode || "").toLowerCase() === "restrict" ? "forbid" : "allow";
            parseRegionValues(values, function(id) {
                if (type === "all") {
                    addRegion(mode, "player", id);
                    addRegion(mode, "event", id);
                } else {
                    addRegion(mode, type, id);
                }
            });
            return match;
        });
        if (Imported && Imported.YEP_RegionRestrictions && $gameMap) {
            try {
                addList("forbid", "player", $gameMap.restrictPlayerRegions ? $gameMap.restrictPlayerRegions() : null);
                addList("forbid", "event", $gameMap.restrictEventRegions ? $gameMap.restrictEventRegions() : null);
                addList("allow", "player", $gameMap.allowPlayerRegions ? $gameMap.allowPlayerRegions() : null);
                addList("allow", "event", $gameMap.allowEventRegions ? $gameMap.allowEventRegions() : null);
            } catch (e) {
            }
        }
        vsMapRegionPassCache = { mapId: mapId, note: note, data: data };
        return data;
    }
    function regionPassTypes(ch) {
        var list = ["all"];
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) {
            list.push("vehicle");
            if (ch._type) list.push(String(ch._type).toLowerCase());
        } else {
            list.push("walk");
            if (typeof Game_Player !== "undefined" && ch instanceof Game_Player) list.push("player");
            else if (typeof Game_Follower !== "undefined" && ch instanceof Game_Follower) list.push("player");
            else if (typeof Game_Event !== "undefined" && ch instanceof Game_Event) list.push("event");
        }
        return list;
    }
    function regionPassMatch(data, mode, types, region) {
        var group = data && data[mode];
        if (!group) return false;
        for (var i = 0; i < types.length; i++) {
            var list = group[types[i]];
            if (list && list[region]) return true;
        }
        return false;
    }
    function regionPassOverride(ch, x, y) {
        if (!$gameMap || !$gameMap.regionId) return null;
        var px = fx(rx(x));
        var py = fx(ry(y));
        if (!$gameMap.isValid(px, py)) return false;
        var region = $gameMap.regionId(px, py);
        if (!region) return null;
        var data = regionPassRules();
        var types = regionPassTypes(ch);
        if (regionPassMatch(data, "forbid", types, region)) return false;
        if (regionPassMatch(data, "allow", types, region)) return true;
        return null;
    }
    function vehiclePassable(ch, x, y, d) {
        var px = fx(rx(x));
        var py = fx(ry(y));
        if (!$gameMap.isValid(px, py)) return false;
        var override = regionPassOverride(ch, px, py);
        if (override !== null) return override;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) {
            if (ch._type === "boat") return $gameMap.isBoatPassable(px, py);
            if (ch._type === "ship") return $gameMap.isShipPassable(px, py);
        }
        return $gameMap.isPassable(px, py, d);
    }
    function passTile(ch, x1, y1, x2, y2, d) {
        var ax = fx(rx(x1));
        var ay = fx(ry(y1));
        var bx = fx(rx(x2));
        var by = fx(ry(y2));
        if (!$gameMap.isValid(ax, ay) || !$gameMap.isValid(bx, by)) return false;
        if (regionBlockedTile(ch, bx, by)) return false;
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        if (mpc && mpc.tileHandled && (mpc.tileHandled(ax, ay) || mpc.tileHandled(bx, by))) return true;
        return vehiclePassable(ch, ax, ay, d) && vehiclePassable(ch, bx, by, rev(d));
    }
    var vsSampleData = [0, 0, 0];
    function samples(a, b) {
        vsSampleData[0] = a + vsEps;
        vsSampleData[1] = (a + b) / 2;
        vsSampleData[2] = b - vsEps;
        return vsSampleData;
    }
    function passVehiclePoint(ch, tx, ty) {
        var x = fx(rx(tx));
        var y = fx(ry(ty));
        if (!$gameMap.isValid(x, y)) return false;
        if ($gamePlayer && $gamePlayer.isDebugThrough && $gamePlayer.isDebugThrough()) return true;
        var override = regionPassOverride(ch, x, y);
        if (override !== null) return override;
        if (ch._type === "boat") return $gameMap.isBoatPassable(x, y);
        if (ch._type === "ship") return $gameMap.isShipPassable(x, y);
        return false;
    }
    function passVehicleBody(ch, tx, ty) {
        var b = bodyBox(ch, tx, ty);
        if (!inMap(b)) return false;
        if (b.shape === "circle") {
            if (!passVehiclePoint(ch, b.cx, b.cy)) return false;
            if (!passVehiclePoint(ch, b.cx - b.radius + vsEps, b.cy)) return false;
            if (!passVehiclePoint(ch, b.cx + b.radius - vsEps, b.cy)) return false;
            if (!passVehiclePoint(ch, b.cx, b.cy - b.radius + vsEps)) return false;
            if (!passVehiclePoint(ch, b.cx, b.cy + b.radius - vsEps)) return false;
            return true;
        }
        var xs = samples(b.l, b.r);
        var ys = [b.t + vsEps, (b.t + b.b) / 2, b.b - vsEps];
        for (var y = 0; y < ys.length; y++) {
            for (var x = 0; x < xs.length; x++) {
                if (!passVehiclePoint(ch, xs[x], ys[y])) return false;
            }
        }
        return true;
    }
    function passMap(ch, x, y, tx, ty, d) {
        if (through(ch)) return true;
        if (boatShip(ch)) return passVehicleBody(ch, tx, ty);
        var a = bodyBox(ch, x, y);
        var b = bodyBox(ch, tx, ty);
        if (!inMap(b)) return false;
        if (regionWalkBlocked(ch, tx, ty, d)) return false;
        var h = horz(d), v = vert(d);
        if (h) {
            var oe = h === 6 ? a.r - vsEps : a.l + vsEps;
            var ne = h === 6 ? b.r - vsEps : b.l + vsEps;
            if (fx(rx(oe)) !== fx(rx(ne))) {
                var ys = samples(b.t, b.b);
                for (var i = 0; i < ys.length; i++) if (!passTile(ch, oe, ys[i], ne, ys[i], h)) return false;
            }
        }
        if (v) {
            var oe2 = v === 2 ? a.b - vsEps : a.t + vsEps;
            var ne2 = v === 2 ? b.b - vsEps : b.t + vsEps;
            if (fx(ry(oe2)) !== fx(ry(ne2))) {
                var xs = samples(b.l, b.r);
                for (var j = 0; j < xs.length; j++) if (!passTile(ch, xs[j], oe2, xs[j], ne2, v)) return false;
            }
        }
        return true;
    }
    function charList(self) {
        var list = [];
        if (!$gameMap) return list;
        var events = $gameMap.events ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) {
            if (events[i] && events[i] !== self && !events[i]._erased) list.push(events[i]);
        }
        if ($gamePlayer && $gamePlayer !== self) list.push($gamePlayer);
        if ($gamePlayer && $gamePlayer.followers) {
            var f = $gamePlayer.followers();
            var data = f && f.visibleFollowers ? f.visibleFollowers() : [];
            for (var j = 0; j < data.length; j++) if (data[j] && data[j] !== self) list.push(data[j]);
        }
        return list;
    }
    function charBlocks(ch, chNormal, chParty, target) {
        if (!target || target === ch || target._erased || through(target) || chNormal !== normal(target)) return false;
        if (chParty && partyCharacter(target)) return false;
        return true;
    }
    function charFrameData() {
        var frame = typeof Graphics !== "undefined" && Graphics.frameCount ? Graphics.frameCount : 0;
        var mapId = $gameMap && $gameMap.mapId ? $gameMap.mapId() : 0;
        var cache = VS._charCollisionFrameData;
        if (cache && cache.frame === frame && cache.mapId === mapId) return cache.data;
        var data = [];
        function add(target) {
            if (target && !target._erased) data.push({ target: target, x: null, y: null, box: null, through: false, normal: false, party: false });
        }
        var events = $gameMap && $gameMap.events ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) add(events[i]);
        add($gamePlayer);
        if ($gamePlayer && $gamePlayer.followers) {
            var f = $gamePlayer.followers();
            var followers = f && f.visibleFollowers ? f.visibleFollowers() : [];
            for (var j = 0; j < followers.length; j++) add(followers[j]);
        }
        VS._charCollisionFrameData = { frame: frame, mapId: mapId, data: data };
        return data;
    }

    function charRecordBox(rec) {
        var target = rec && rec.target;
        if (!target) return null;
        rec.through = through(target);
        rec.normal = normal(target);
        rec.party = partyCharacter(target);
        if (rec.x !== target._x || rec.y !== target._y || !rec.box) {
            rec.x = target._x;
            rec.y = target._y;
            rec.box = bodyBox(target, target._x, target._y);
        }
        return rec.box;
    }

    function charRecordBlocks(ch, chNormal, chParty, rec) {
        var target = rec && rec.target;
        if (!target || target === ch || target._erased) return false;
        charRecordBox(rec);
        if (rec.through || chNormal !== rec.normal) return false;
        if (chParty && rec.party) return false;
        return true;
    }

    function passChars(ch, x, y) {
        if (through(ch)) return true;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) return true;
        var b = bodyBox(ch, x, y);
        var chNormal = normal(ch);
        var chParty = partyCharacter(ch);
        var data = charFrameData();
        for (var i = 0; i < data.length; i++) {
            if (!charRecordBlocks(ch, chNormal, chParty, data[i])) continue;
            if (hit(b, data[i].box)) return false;
        }
        return true;
    }

    function forcePassChars(ch, x, y, ignoreCharacter) {
        if (!ignoreCharacter) return passChars(ch, x, y);
        if (through(ch)) return true;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) return true;
        var b = bodyBox(ch, x, y);
        var chNormal = normal(ch);
        var chParty = partyCharacter(ch);
        var data = charFrameData();
        for (var i = 0; i < data.length; i++) {
            if (data[i].target === ignoreCharacter) continue;
            if (!charRecordBlocks(ch, chNormal, chParty, data[i])) continue;
            if (hit(b, data[i].box)) return false;
        }
        return true;
    }

    function boxRangeOverlap(a1, a2, b1, b2) {
        return a1 < b2 - vsEps && a2 > b1 + vsEps;
    }

    function contactPoint(ch, tx, ty, d) {
        if (through(ch) || (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle)) return null;
        var oldBox = bodyBox(ch, ch._x, ch._y);
        var nextBox = bodyBox(ch, tx, ty);
        var chNormal = normal(ch);
        var chParty = partyCharacter(ch);
        var best = null;
        function checkRecord(rec) {
            if (!charRecordBlocks(ch, chNormal, chParty, rec)) return;
            var targetBox = rec.box;
            if (!hit(nextBox, targetBox)) return;
            if (d === 6 && boxRangeOverlap(oldBox.t, oldBox.b, targetBox.t, targetBox.b) && oldBox.r <= targetBox.l + vsEps) {
                var rightX = targetBox.l - (oldBox.r - ch._x);
                if (rightX > ch._x + vsEps && rightX < tx - vsEps) best = best === null ? rightX : Math.min(best, rightX);
            } else if (d === 4 && boxRangeOverlap(oldBox.t, oldBox.b, targetBox.t, targetBox.b) && oldBox.l >= targetBox.r - vsEps) {
                var leftX = targetBox.r - (oldBox.l - ch._x);
                if (leftX < ch._x - vsEps && leftX > tx + vsEps) best = best === null ? leftX : Math.max(best, leftX);
            } else if (d === 2 && boxRangeOverlap(oldBox.l, oldBox.r, targetBox.l, targetBox.r) && oldBox.b <= targetBox.t + vsEps) {
                var downY = targetBox.t - (oldBox.b - ch._y);
                if (downY > ch._y + vsEps && downY < ty - vsEps) best = best === null ? downY : Math.min(best, downY);
            } else if (d === 8 && boxRangeOverlap(oldBox.l, oldBox.r, targetBox.l, targetBox.r) && oldBox.t >= targetBox.b - vsEps) {
                var upY = targetBox.b - (oldBox.t - ch._y);
                if (upY < ch._y - vsEps && upY > ty + vsEps) best = best === null ? upY : Math.max(best, upY);
            }
        }
        var data = charFrameData();
        for (var i = 0; i < data.length; i++) checkRecord(data[i]);
        if (best === null) return null;
        if (d === 4 || d === 6) return { x: rx(apiRound(best)), y: ch._y };
        return { x: ch._x, y: ry(apiRound(best)) };
    }
    function tryContactStep(ch, tx, ty, d) {
        if (d !== 2 && d !== 4 && d !== 6 && d !== 8) return false;
        if (!passMap(ch, ch._x, ch._y, tx, ty, d) || passChars(ch, tx, ty)) return false;
        var p = contactPoint(ch, tx, ty, d);
        if (!p) return false;
        if (Math.abs(dx(p.x, ch._x)) <= vsEps && Math.abs(dy(p.y, ch._y)) <= vsEps) return false;
        if (!passMap(ch, ch._x, ch._y, p.x, p.y, d) || !passChars(ch, p.x, p.y)) return false;
        succeedExact(ch, p.x, p.y, d);
        eventTouchPlayer(ch, ch._x, ch._y);
        return true;
    }
    function touchCooldownReady(event) {
        if (!event || vsTouchTriggerCooldown <= 0) return true;
        return (event._vsMapPixelTouchCooldown || 0) <= Graphics.frameCount;
    }
    function startTouchEvent(event) {
        if (!event) return false;
        if (!touchCooldownReady(event)) return true;
        event.start();
        if (vsTouchTriggerCooldown > 0) event._vsMapPixelTouchCooldown = Graphics.frameCount + vsTouchTriggerCooldown;
        return true;
    }
    function eventTouchPlayer(ch, x, y) {
        if (!(typeof Game_Event !== "undefined" && ch instanceof Game_Event)) return false;
        if (!$gamePlayer || !$gameMap || $gameMap.isEventRunning()) return false;
        if (ch._erased || ch._trigger !== 2) return false;
        if (ch.isJumping && ch.isJumping()) return false;
        if (ch.isNormalPriority && !ch.isNormalPriority()) return false;
        var eventBox = bodyBox(ch, ch._x, ch._y);
        var playerBox = bodyBox($gamePlayer, $gamePlayer._x, $gamePlayer._y);
        if (!touchHit(eventBox, playerBox)) return false;
        return startTouchEvent(ch);
    }
    function resetTouchCooldownsAwayFromPlayer() {
        if (vsTouchCooldownPersistent || vsTouchTriggerCooldown <= 0 || !$gameMap || !$gamePlayer) return;
        var playerBox = bodyBox($gamePlayer, $gamePlayer._x, $gamePlayer._y);
        var events = $gameMap.events ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (!event || !event._vsMapPixelTouchCooldown) continue;
            if (event.isTriggerIn && !event.isTriggerIn([1, 2])) continue;
            if (!touchHit(playerBox, bodyBox(event, event._x, event._y))) event._vsMapPixelTouchCooldown = 0;
        }
    }
    function eventTouchPlayerToward(ch) {
        if (!(typeof Game_Event !== "undefined" && ch instanceof Game_Event)) return false;
        if (!$gamePlayer || !$gameMap || $gameMap.isEventRunning()) return false;
        if (eventTouchPlayer(ch, ch._x, ch._y)) return true;
        var d = ch.vsMapPixelDirectionTo ? ch.vsMapPixelDirectionTo($gamePlayer._x, $gamePlayer._y, false) : 0;
        if (d <= 0) return false;
        var p = ch.vsMapPixelNextPoint ? ch.vsMapPixelNextPoint(d) : null;
        return p ? eventTouchPlayer(ch, p.x, p.y) : false;
    }
    function faceDir(ch, d) {
        if (d === 2 || d === 4 || d === 6 || d === 8) return d;
        var h = horz(d), v = vert(d), c = ch.direction ? ch.direction() : 2;
        if (c === rev(h)) return h;
        if (c === rev(v)) return v;
        if (c === h || c === v) return c;
        return h || v || c;
    }

    function syncGalvDiagonal(ch, d) {
        if (!ch) return;
        var hasGalv = window.Galv && (Galv.DM || Galv.CA);
        if (!hasGalv && ch._diagDir === undefined) return;
        if (d === 1 || d === 3 || d === 7 || d === 9) ch._diagDir = d;
        else ch._diagDir = false;
    }
    function realLoopX(oldX, newX, d) {
        if ($gameMap && $gameMap.isLoopHorizontal && $gameMap.isLoopHorizontal() && Math.abs(newX - oldX) > $gameMap.width() / 2) return newX - dirX(d) * unitX();
        return oldX;
    }
    function realLoopY(oldY, newY, d) {
        if ($gameMap && $gameMap.isLoopVertical && $gameMap.isLoopVertical() && Math.abs(newY - oldY) > $gameMap.height() / 2) return newY - dirY(d) * unitY();
        return oldY;
    }
    function traceFar(a, b) {
        var x = dx(a.x, b.x), y = dy(a.y, b.y);
        return Math.sqrt(x * x + y * y);
    }

    Game_CharacterBase.prototype.vsMapPixelPushTrace = function(force) {
        if (!this._vsMapPixelTrace) this._vsMapPixelTrace = [];
        var p = { x: this._x, y: this._y };
        var last = this._vsMapPixelTrace[this._vsMapPixelTrace.length - 1];
        if (!force && last && traceFar(p, last) < Math.max(0.02, unit() * 0.35)) return;
        this._vsMapPixelTrace.push(p);
        while (this._vsMapPixelTrace.length > 90) this._vsMapPixelTrace.shift();
    };

    Game_CharacterBase.prototype.vsMapPixelTracePoint = function(distance) {
        var list = this._vsMapPixelTrace || [];
        if (list.length <= 0) return { x: this._x, y: this._y };
        var far = 0, last = { x: this._x, y: this._y };
        for (var i = list.length - 1; i >= 0; i--) {
            far += traceFar(last, list[i]);
            if (far >= distance) return list[i];
            last = list[i];
        }
        return list[0];
    };

    function finishStep(ch, oldX, oldY, newX, newY, d) {
        ch._x = newX;
        ch._y = newY;
        ch._realX = realLoopX(oldX, newX, d);
        ch._realY = realLoopY(oldY, newY, d);
        ch.setMovementSuccess(true);
        if (d > 0) {
            ch.setDirection(faceDir(ch, d));
            syncGalvDiagonal(ch, d);
        }
        ch.increaseSteps();
        if (typeof Game_Player !== "undefined" && ch instanceof Game_Player && ch.vsMapPixelStartBelowEventByBody) ch.vsMapPixelStartBelowEventByBody([1, 2], ch._x, ch._y);
    }

    function succeed(ch, x, y, d) {
        var oldX = ch._x, oldY = ch._y;
        var newX = dirX(d) ? rx(snapX(x)) : rx(apiRound(x));
        var newY = dirY(d) ? ry(snapY(y)) : ry(apiRound(y));
        finishStep(ch, oldX, oldY, newX, newY, d);
    }

    function succeedExact(ch, x, y, d) {
        var oldX = ch._x, oldY = ch._y;
        finishStep(ch, oldX, oldY, rx(apiRound(x)), ry(apiRound(y)), d);
    }

    Game_CharacterBase.prototype.vsMapPixelCanMoveTo = function(tx, ty, d) {
        if (!active(this)) return false;
        tx = dirX(d) ? rx(snapX(tx)) : rx(apiRound(tx));
        ty = dirY(d) ? ry(snapY(ty)) : ry(apiRound(ty));
        return passMap(this, this._x, this._y, tx, ty, d) && passChars(this, tx, ty);
    };

    Game_CharacterBase.prototype.vsMapPixelCanStepFrom = function(x, y, tx, ty, d) {
        if (!active(this)) return false;
        x = rx(snapX(x));
        y = ry(snapY(y));
        tx = rx(snapX(tx));
        ty = ry(snapY(ty));
        if (d % 2 !== 0) {
            var h = horz(d), v = vert(d);
            var hx = rx(snapX(x + dirX(h) * unitX()));
            var vy = ry(snapY(y + dirY(v) * unitY()));
            if (!passMap(this, x, y, hx, y, h) || !passChars(this, hx, y)) return false;
            if (!passMap(this, x, y, x, vy, v) || !passChars(this, x, vy)) return false;
        }
        return passMap(this, x, y, tx, ty, d) && passChars(this, tx, ty);
    };

    Game_CharacterBase.prototype.vsMapPixelNextPoint = function(d) {
        return {
            x: dirX(d) ? rx(snapX(this._x + dirX(d) * routeUnitX(this))) : rx(apiRound(this._x)),
            y: dirY(d) ? ry(snapY(this._y + dirY(d) * routeUnitY(this))) : ry(apiRound(this._y))
        };
    };

    function slideBodyBlocked(ch, x, y) {
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        return !!(mpc && mpc.bodyBlocked && mpc.bodyBlocked(ch, x, y));
    }

    function slideCanMoveFrom(ch, x, y, tx, ty, d) {
        if (!active(ch)) return false;
        tx = rx(apiRound(tx));
        ty = ry(apiRound(ty));
        if (through(ch)) return true;
        if (boatShip(ch)) return passVehicleBody(ch, tx, ty);
        if (!passMap(ch, x, y, tx, ty, d)) return false;
        if (regionWalkBlocked(ch, tx, ty, d)) return false;
        if (slideBodyBlocked(ch, tx, ty)) return false;
        return passChars(ch, tx, ty);
    }

    function slideCanStepFrom(ch, x, y, tx, ty, d) {
        if (!active(ch)) return false;
        x = rx(apiRound(x));
        y = ry(apiRound(y));
        tx = rx(apiRound(tx));
        ty = ry(apiRound(ty));
        if (d % 2 !== 0) {
            var h = horz(d), v = vert(d);
            var hx = rx(apiRound(x + dirX(h) * Math.min(Math.abs(dx(tx, x)), unitX())));
            var vy = ry(apiRound(y + dirY(v) * Math.min(Math.abs(dy(ty, y)), unitY())));
            if (!slideCanMoveFrom(ch, x, y, hx, y, h)) return false;
            if (!slideCanMoveFrom(ch, x, y, x, vy, v)) return false;
        }
        return slideCanMoveFrom(ch, x, y, tx, ty, d);
    }

    function forceCanMoveFrom(ch, x, y, tx, ty, d, ignoreCharacter) {
        if (!active(ch)) return false;
        tx = rx(apiRound(tx));
        ty = ry(apiRound(ty));
        if (through(ch)) return true;
        if (boatShip(ch)) return passVehicleBody(ch, tx, ty);
        if (!passMap(ch, x, y, tx, ty, d)) return false;
        if (regionWalkBlocked(ch, tx, ty, d)) return false;
        if (slideBodyBlocked(ch, tx, ty)) return false;
        return forcePassChars(ch, tx, ty, ignoreCharacter);
    }

    function forceCanStepFrom(ch, x, y, tx, ty, d, ignoreCharacter) {
        if (!active(ch)) return false;
        x = rx(apiRound(x));
        y = ry(apiRound(y));
        tx = rx(apiRound(tx));
        ty = ry(apiRound(ty));
        if (d % 2 !== 0) {
            var h = horz(d), v = vert(d);
            var hx = rx(apiRound(x + dirX(h) * Math.min(Math.abs(dx(tx, x)), unitX())));
            var vy = ry(apiRound(y + dirY(v) * Math.min(Math.abs(dy(ty, y)), unitY())));
            if (!forceCanMoveFrom(ch, x, y, hx, y, h, ignoreCharacter)) return false;
            if (!forceCanMoveFrom(ch, x, y, x, vy, v, ignoreCharacter)) return false;
        }
        return forceCanMoveFrom(ch, x, y, tx, ty, d, ignoreCharacter);
    }

    Game_CharacterBase.prototype.vsMapPixelForceMovePixels = function(vectorX, vectorY, pixels, ignoreCharacter) {
        if (!active(this) || !$gameMap) return { moved:0, blocked:true };
        var vx = Number(vectorX) || 0;
        var vy = Number(vectorY) || 0;
        var remaining = Number(pixels);
        if (!isFinite(remaining)) remaining = 0;
        remaining = Math.max(0, remaining);
        var length = Math.sqrt(vx * vx + vy * vy);
        if (length <= vsEps || remaining <= vsEps) return { moved:0, blocked:false };
        vx /= length;
        vy /= length;
        var tw = Math.max(1, Number($gameMap.tileWidth ? $gameMap.tileWidth() : 48) || 48);
        var th = Math.max(1, Number($gameMap.tileHeight ? $gameMap.tileHeight() : 48) || 48);
        var h = vx < -vsEps ? 4 : vx > vsEps ? 6 : 0;
        var v = vy < -vsEps ? 8 : vy > vsEps ? 2 : 0;
        var d = dir(h, v);
        if (d <= 0) return { moved:0, blocked:false };
        var moved = 0;
        while (remaining > vsEps) {
            var step = Math.min(vsForceCollisionPixelStep, remaining);
            var tx = rx(apiRound(this._x + vx * step / tw));
            var ty = ry(apiRound(this._y + vy * step / th));
            if (!forceCanStepFrom(this, this._x, this._y, tx, ty, d, ignoreCharacter)) break;
            this._x = tx;
            this._y = ty;
            this._realX = tx;
            this._realY = ty;
            moved += step;
            remaining = Math.max(0, remaining - step);
        }
        return { moved:moved, blocked:remaining > vsEps };
    };

    function slideFrame() {
        return typeof Graphics !== "undefined" && Graphics.frameCount ? Graphics.frameCount : 0;
    }

    function slideSigns(ch, d) {
        var data = ch && ch._vsMapPixelSlideEdge;
        if (data && data.d === d && data.expire > slideFrame() && data.sign) return [data.sign, -data.sign];
        return [1, -1];
    }

    function rememberSlide(ch, d, sign) {
        if (ch) ch._vsMapPixelSlideEdge = { d: d, sign: sign, expire: slideFrame() + 16 };
    }

    function slidePixelX() {
        var tw = $gameMap && $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
        return 1 / Math.max(1, tw);
    }

    function slidePixelY() {
        var th = $gameMap && $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
        return 1 / Math.max(1, th);
    }

    function slideMaxPixels() {
        if ($gameSystem && $gameSystem._vsMapPixelSlideEdgePixels !== undefined) {
            var value = Number($gameSystem._vsMapPixelSlideEdgePixels);
            if (isFinite(value)) return Math.max(0, Math.min(24, Math.floor(value)));
        }
        return vsSlideEdgePixels;
    }

    function setSlideEdgePixels(value) {
        if (value === undefined || value === null || value === "") return;
        var pixels = Number(value);
        if (!isFinite(pixels) || pixels < 0) return;
        pixels = Math.max(0, Math.min(24, Math.floor(pixels)));
        if ($gameSystem) $gameSystem._vsMapPixelSlideEdgePixels = pixels;
    }

    function slideAxisPoint(ch, tx, ty, d, horizontal) {
        var signs = slideSigns(ch, d);
        var max = slideMaxPixels();
        for (var p = 1; p <= max; p++) {
            for (var i = 0; i < signs.length; i++) {
                var sign = signs[i];
                var sx = horizontal ? ch._x : rx(apiRound(ch._x + sign * p * slidePixelX()));
                var sy = horizontal ? ry(apiRound(ch._y + sign * p * slidePixelY())) : ch._y;
                var sideD = horizontal ? (sign > 0 ? 2 : 8) : (sign > 0 ? 6 : 4);
                var fx2 = horizontal ? tx : sx;
                var fy2 = horizontal ? sy : ty;
                if (!slideCanStepFrom(ch, ch._x, ch._y, sx, sy, sideD)) continue;
                if (!slideCanStepFrom(ch, sx, sy, fx2, fy2, d)) continue;
                rememberSlide(ch, d, sign);
                return { x: fx2, y: fy2 };
            }
        }
        return null;
    }

    function slideDiagonalPoint(ch, tx, ty, d) {
        var sx = dirX(d), sy = dirY(d);
        if (!sx || !sy) return null;
        var signs = slideSigns(ch, d);
        var max = slideMaxPixels();
        for (var p = 1; p <= max; p++) {
            for (var i = 0; i < signs.length; i++) {
                var sign = signs[i];
                var nx = rx(apiRound(tx - sy * sign * p * slidePixelX()));
                var ny = ry(apiRound(ty + sx * sign * p * slidePixelY()));
                if (!slideCanStepFrom(ch, ch._x, ch._y, nx, ny, d)) continue;
                rememberSlide(ch, d, sign);
                return { x: nx, y: ny };
            }
        }
        return null;
    }

    function slidePoint(ch, tx, ty, d) {
        if (!active(ch) || through(ch)) return null;
        tx = rx(apiRound(tx));
        ty = ry(apiRound(ty));
        var h = horz(d), v = vert(d);
        if (h && !v) return slideAxisPoint(ch, tx, ty, d, true);
        if (v && !h) return slideAxisPoint(ch, tx, ty, d, false);
        if (h && v) return slideDiagonalPoint(ch, tx, ty, d);
        return null;
    }

    function trySlideStep(ch, tx, ty, d) {
        var p = slidePoint(ch, tx, ty, d);
        if (!p) return false;
        succeedExact(ch, p.x, p.y, d);
        return true;
    }

    Game_CharacterBase.prototype.vsMapPixelMoveByDirection = function(d) {
        if (d % 2 === 0) this.moveStraight(d);
        else this.moveDiagonally(horz(d), vert(d));
    };

    function regionBlockedTile(ch, x, y) {
        if (typeof regionPassOverride !== "function") return false;
        var tx = fx(rx(x));
        var ty = fx(ry(y));
        if (!$gameMap || !$gameMap.isValid(tx, ty)) return false;
        return regionPassOverride(ch, tx + 0.5, ty + 0.5) === false;
    }

    function regionTileHitBox(box, tx, ty) {
        var l = tx;
        var t = ty;
        var r = tx + 1;
        var b = ty + 1;
        if (!box || box.r <= l + vsEps || box.l >= r - vsEps || box.b <= t + vsEps || box.t >= b - vsEps) return false;
        if (box.shape !== "circle") return true;
        var px = Math.max(l, Math.min(box.cx, r));
        var py = Math.max(t, Math.min(box.cy, b));
        var x = box.cx - px;
        var y = box.cy - py;
        return x * x + y * y < box.radius * box.radius;
    }

    function regionBoxBlocked(ch, box) {
        if (!box) return false;
        var l = fx(box.l);
        var t = fx(box.t);
        var r = fx(box.r - vsEps);
        var b = fx(box.b - vsEps);
        for (var y = t; y <= b; y++) {
            for (var x = l; x <= r; x++) {
                if (regionBlockedTile(ch, x, y) && regionTileHitBox(box, x, y)) return true;
            }
        }
        return false;
    }

    function regionWalkBlocked(ch, x, y, d) {
        if (!ch || through(ch) || (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle)) return false;
        var b = bodyBox(ch, x, y);
        return regionBoxBlocked(ch, b);
    }

    function regionEdge(box, d) {
        if (box.shape === "circle") {
            if (d === 6) return box.cx + box.radius;
            if (d === 4) return box.cx - box.radius;
            if (d === 2) return box.cy + box.radius;
            if (d === 8) return box.cy - box.radius;
        }
        if (d === 6) return box.r;
        if (d === 4) return box.l;
        if (d === 2) return box.b;
        if (d === 8) return box.t;
        return 0;
    }

    function regionContactPoint(ch, tx, ty, d) {
        if (!ch || through(ch)) return null;
        if (d !== 2 && d !== 4 && d !== 6 && d !== 8) return null;
        var oldBox = bodyBox(ch, ch._x, ch._y);
        var nextBox = bodyBox(ch, tx, ty);
        if (!oldBox || !nextBox || !regionBoxBlocked(ch, nextBox)) return null;
        var l = fx(nextBox.l);
        var t = fx(nextBox.t);
        var r = fx(nextBox.r - vsEps);
        var b = fx(nextBox.b - vsEps);
        var best = null;
        for (var y = t; y <= b; y++) {
            for (var x = l; x <= r; x++) {
                if (!regionBlockedTile(ch, x, y) || !regionTileHitBox(nextBox, x, y)) continue;
                if (d === 6 && boxRangeOverlap(nextBox.t, nextBox.b, y, y + 1) && oldBox.r <= x + vsEps) {
                    var rightX = x - (regionEdge(oldBox, 6) - ch._x);
                    if (rightX > ch._x + vsEps && rightX <= tx + vsEps) best = best === null ? rightX : Math.min(best, rightX);
                } else if (d === 4 && boxRangeOverlap(nextBox.t, nextBox.b, y, y + 1) && oldBox.l >= x + 1 - vsEps) {
                    var leftX = x + 1 - (regionEdge(oldBox, 4) - ch._x);
                    if (leftX < ch._x - vsEps && leftX >= tx - vsEps) best = best === null ? leftX : Math.max(best, leftX);
                } else if (d === 2 && boxRangeOverlap(nextBox.l, nextBox.r, x, x + 1) && oldBox.b <= y + vsEps) {
                    var downY = y - (regionEdge(oldBox, 2) - ch._y);
                    if (downY > ch._y + vsEps && downY <= ty + vsEps) best = best === null ? downY : Math.min(best, downY);
                } else if (d === 8 && boxRangeOverlap(nextBox.l, nextBox.r, x, x + 1) && oldBox.t >= y + 1 - vsEps) {
                    var upY = y + 1 - (regionEdge(oldBox, 8) - ch._y);
                    if (upY < ch._y - vsEps && upY >= ty - vsEps) best = best === null ? upY : Math.max(best, upY);
                }
            }
        }
        if (best === null) return null;
        if (d === 4 || d === 6) return { x: rx(apiRound(best)), y: ch._y };
        return { x: ch._x, y: ry(apiRound(best)) };
    }

    var _VS221_MapPixel_moveStraight = Game_CharacterBase.prototype.moveStraight;
    Game_CharacterBase.prototype.moveStraight = function(d) {
        if (!active(this)) return _VS221_MapPixel_moveStraight.call(this, d);
        this.setMovementSuccess(false);
        if (d > 0) this.setDirection(d);
        var p = this.vsMapPixelNextPoint(d);
        var rp = regionContactPoint(this, p.x, p.y, d);
        if (rp) {
            if (!this._vsMapPixelNoSlide && trySlideStep(this, p.x, p.y, d)) return;
            var cx = rp.x;
            var cy = rp.y;
            if (d === 6) cx = rx(apiRound(rp.x - vsEps));
            else if (d === 4) cx = rx(apiRound(rp.x + vsEps));
            else if (d === 2) cy = ry(apiRound(rp.y - vsEps));
            else if (d === 8) cy = ry(apiRound(rp.y + vsEps));
            if (!regionWalkBlocked(this, cx, cy, d) && passMap(this, this._x, this._y, cx, cy, d) && passChars(this, rp.x, rp.y)) succeedExact(this, rp.x, rp.y, d);
            eventTouchPlayer(this, p.x, p.y);
            return;
        }
        if (regionWalkBlocked(this, p.x, p.y, d)) {
            if (!this._vsMapPixelNoSlide && trySlideStep(this, p.x, p.y, d)) return;
            eventTouchPlayer(this, p.x, p.y);
            return;
        }
        if (this.vsMapPixelCanMoveTo(p.x, p.y, d)) succeed(this, p.x, p.y, d);
        else if (!this._vsMapPixelNoSlide && !regionWalkBlocked(this, p.x, p.y, d) && trySlideStep(this, p.x, p.y, d)) return;
        else if (!tryContactStep(this, p.x, p.y, d)) eventTouchPlayer(this, p.x, p.y);
    };

    var _VS221_MapPixel_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally;
    Game_CharacterBase.prototype.moveDiagonally = function(h, v) {
        if (!active(this) || !vsDiagonal) return _VS221_MapPixel_moveDiagonally.call(this, h, v);
        this.setMovementSuccess(false);
        var tx = rx(snapX(this._x + dirX(h) * routeUnitX(this)));
        var ty = ry(snapY(this._y + dirY(v) * routeUnitY(this)));
        var d = dir(h, v);
        var blockH = regionWalkBlocked(this, tx, this._y, h);
        var blockV = regionWalkBlocked(this, this._x, ty, v);
        var blockD = regionWalkBlocked(this, tx, ty, d);
        var canH = !blockH && this.vsMapPixelCanMoveTo(tx, this._y, h);
        var canV = !blockV && this.vsMapPixelCanMoveTo(this._x, ty, v);
        if (canH && canV && !blockD && this.vsMapPixelCanMoveTo(tx, ty, d)) succeed(this, tx, ty, d);
        else if (!this._vsMapPixelNoSlide && canH) succeed(this, tx, this._y, h);
        else if (!this._vsMapPixelNoSlide && canV) succeed(this, this._x, ty, v);
        else if (!this._vsMapPixelNoSlide && trySlideStep(this, tx, ty, d)) return;
        else eventTouchPlayer(this, tx, ty);
    };

    Game_CharacterBase.prototype.vsMapPixelDirectionTo = function(tx, ty, away) {
        tx = snapX(tx);
        ty = snapY(ty);
        var mx = dx(tx, this._x), my = dy(ty, this._y);
        if (away) {
            mx = -mx;
            my = -my;
        }
        var ax = Math.abs(mx), ay = Math.abs(my);
        if (ax < unit() * 0.45 && ay < unit() * 0.45) return 0;
        var h = mx < -unitX() * 0.2 ? 4 : mx > unitX() * 0.2 ? 6 : 0;
        var v = my < -unitY() * 0.2 ? 8 : my > unitY() * 0.2 ? 2 : 0;
        if (vsDiagonal && h && v) return dir(h, v);
        return ax >= ay ? h || v : v || h;
    };
    function smartCellX(x) {
        return Math.round(Number(x || 0) * divX());
    }
    function smartCellY(y) {
        return Math.round(Number(y || 0) * divY());
    }
    function smartCellsX() {
        return $gameMap ? Math.max(1, Math.round($gameMap.width() * divX())) : 1;
    }
    function smartCellsY() {
        return $gameMap ? Math.max(1, Math.round($gameMap.height() * divY())) : 1;
    }
    function smartWrapX(x) {
        if ($gameMap && $gameMap.isLoopHorizontal && $gameMap.isLoopHorizontal()) {
            var w = smartCellsX();
            return ((x % w) + w) % w;
        }
        return x;
    }
    function smartWrapY(y) {
        if ($gameMap && $gameMap.isLoopVertical && $gameMap.isLoopVertical()) {
            var h = smartCellsY();
            return ((y % h) + h) % h;
        }
        return y;
    }
    function smartPoint(x, y) {
        return { x: rx(snapX(x / divX())), y: ry(snapY(y / divY())) };
    }
    function smartKey(x, y) {
        return (smartWrapX(x) << 12) | (smartWrapY(y) & 0xFFF);
    }
    function smartDistance(x1, y1, x2, y2) {
        var x = dx(x1, x2);
        var y = dy(y1, y2);
        return Math.sqrt(x * x + y * y);
    }
    function smartBoxCenterX(box) {
        return box.shape === "circle" ? box.cx : (box.l + box.r) / 2;
    }
    function smartBoxCenterY(box) {
        return box.shape === "circle" ? box.cy : (box.t + box.b) / 2;
    }
    function smartGoalReached(ch, x, y, tx, ty, target) {
        if (target && active(target)) {
            return hit(bodyBox(ch, x, y), bodyBox(target, target._x, target._y));
        }
        return smartDistance(x, y, tx, ty) <= Math.max(unit() * 0.8, 0.12);
    }
    function smartDestinationBlocked(ch, x, y) {
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        return !!(mpc && mpc.bodyBlocked && mpc.bodyBlocked(ch, x, y));
    }
    function smartResolveDestination(ch, x, y) {
        x = snapX(x);
        y = snapY(y);
        if (!smartDestinationBlocked(ch, x, y) && inMap(bodyBox(ch, x, y))) return { x: x, y: y };
        var cx = smartCellX(x);
        var cy = smartCellY(y);
        var best = null;
        var bestScore = 999999;
        for (var r = 1; r <= 16; r++) {
            for (var oy = -r; oy <= r; oy++) {
                for (var ox = -r; ox <= r; ox++) {
                    if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
                    var p = smartPoint(smartWrapX(cx + ox), smartWrapY(cy + oy));
                    if (!inMap(bodyBox(ch, p.x, p.y)) || smartDestinationBlocked(ch, p.x, p.y)) continue;
                    var score = smartDistance(p.x, p.y, x, y) + smartDistance(p.x, p.y, ch._x, ch._y) * 0.01;
                    if (score < bestScore) {
                        bestScore = score;
                        best = p;
                    }
                }
            }
            if (best) return best;
        }
        return null;
    }
    function smartTargetKey(target) {
        if (!target) return "";
        if (target === $gamePlayer) return "player";
        if (target.eventId) return "event" + target.eventId();
        if (target._memberIndex != null) return "follower" + target._memberIndex;
        return "";
    }
    function smartFrame() {
        return typeof Graphics !== "undefined" && Graphics.frameCount ? Graphics.frameCount : 0;
    }
    function smartSearchAllowed(ch, frame) {
        if (VS._smartSearchFrame !== frame) {
            VS._smartSearchFrame = frame;
            VS._smartSearchCount = 0;
        }
        var id = ch && ch.eventId ? ch.eventId() : 0;
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        var heavy = !!(mpc && mpc.bodyBlocked);
        var force = !!(ch && ch._vsMapPixelSmartForceSearch && ch._vsMapPixelSmartForceSearch >= frame);
        if (ch && ch._vsMapPixelSmartWait > frame && !force) return false;
        if (heavy && id && (frame + id) % 2 !== 0 && !force) return false;
        var maxSearch = heavy ? 1 : 4;
        if (force) maxSearch += 1;
        if (VS._smartSearchCount >= maxSearch) {
            if (ch) ch._vsMapPixelSmartWait = frame + (heavy ? 4 + (id % 6) : 1);
            return false;
        }
        if (force && ch) ch._vsMapPixelSmartWait = 0;
        VS._smartSearchCount++;
        return true;
    }
    function smartRouteKey(gx, gy, target) {
        return ($gameMap ? $gameMap.mapId() : 0) + "|" + gx + "," + gy + "|" + smartTargetKey(target);
    }
    function smartCellRange(x1, y1, x2, y2) {
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }
    function smartBodyCacheKey(ch) {
        var b = ch && ch.vsMapPixelBodyData ? ch.vsMapPixelBodyData() : vsBodyHitboxDefault;
        var feet = ch && ch.vsMapPixelFeetOffset ? ch.vsMapPixelFeetOffset() : vsMapPixelZeroFeetOffset;
        return [b.shape, b.width || 0, b.height || 0, b.radius || 0, b.offsetX || 0, b.offsetY || 0, feet.x || 0, feet.y || 0, divX(), divY()].join(",");
    }
    function smartMapStepCache(ch) {
        var key = ($gameMap ? $gameMap.mapId() : 0) + "|" + smartBodyCacheKey(ch);
        if (!VS._smartMapStepCache || VS._smartMapStepCache.key !== key) {
            VS._smartMapStepCache = { key: key, data: {} };
        }
        return VS._smartMapStepCache.data;
    }
    function smartMapPassCached(ch, cache, sx, sy, d) {
        var key = (sx << 16) | (sy << 4) | d;
        var value = cache[key];
        if (value !== undefined) return value === 1;
        var p = smartPoint(sx, sy);
        var t = smartPoint(smartWrapX(sx + dirX(d)), smartWrapY(sy + dirY(d)));
        var ok = true;
        if (d % 2 !== 0) {
            var h = horz(d);
            var v = vert(d);
            var hx = rx(snapX(p.x + dirX(h) * unitX()));
            var vy = ry(snapY(p.y + dirY(v) * unitY()));
            ok = passMap(ch, p.x, p.y, hx, p.y, h) && passMap(ch, p.x, p.y, p.x, vy, v);
        }
        if (ok) ok = passMap(ch, p.x, p.y, t.x, t.y, d);
        cache[key] = ok ? 1 : 0;
        return ok;
    }
    function smartCollisionCache(ch) {
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        if (!mpc || !mpc.bodyBlocked) return null;
        var rev = mpc.revision ? mpc.revision() : 1;
        var key = ($gameMap ? $gameMap.mapId() : 0) + "|" + smartBodyCacheKey(ch) + "|" + rev;
        if (!VS._smartCollisionCache || VS._smartCollisionCache.key !== key) {
            VS._smartCollisionCache = { key: key, data: {} };
        }
        return VS._smartCollisionCache.data;
    }
    function smartCollisionBlocked(ch, cache, x, y) {
        if (!cache) return false;
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        if (!mpc || !mpc.bodyBlocked) return false;
        var cx = smartWrapX(smartCellX(x));
        var cy = smartWrapY(smartCellY(y));
        var key = (cx << 12) | (cy & 0xFFF);
        var value = cache[key];
        if (value !== undefined) return value === 1;
        var blocked = mpc.bodyBlocked(ch, x, y);
        cache[key] = blocked ? 1 : 0;
        return blocked;
    }
    function smartCharsPassCached(ch, blockers, cache, x, y) {
        var cx = smartWrapX(smartCellX(x));
        var cy = smartWrapY(smartCellY(y));
        var key = (cx << 12) | (cy & 0xFFF);
        var value = cache[key];
        if (value !== undefined) return value === 1;
        var ok = smartPassChars(ch, x, y, blockers);
        cache[key] = ok ? 1 : 0;
        return ok;
    }
    function smartCanStepCached(ch, mapSteps, blockers, charsCache, sx, sy, x, y, tx, ty, d) {
        if (!active(ch) || !smartMapPassCached(ch, mapSteps, sx, sy, d)) return false;
        var collision = smartCollisionCache(ch);
        if (smartCollisionBlocked(ch, collision, tx, ty)) return false;
        if (d % 2 !== 0) {
            var h = horz(d);
            var v = vert(d);
            var hx = rx(snapX(x + dirX(h) * unitX()));
            var vy = ry(snapY(y + dirY(v) * unitY()));
            if (smartCollisionBlocked(ch, collision, hx, y) || !smartCharsPassCached(ch, blockers, charsCache, hx, y)) return false;
            if (smartCollisionBlocked(ch, collision, x, vy) || !smartCharsPassCached(ch, blockers, charsCache, x, vy)) return false;
        }
        return smartCharsPassCached(ch, blockers, charsCache, tx, ty);
    }
    function smartRouteFromNode(node) {
        var route = [];
        while (node && node.parent) {
            route.push({ x: node.x, y: node.y, d: node.d });
            node = node.parent;
        }
        route.reverse();
        return route;
    }
    function smartHeapPush(heap, node) {
        heap.push(node);
        var i = heap.length - 1;
        while (i > 0) {
            var p = (i - 1) >> 1;
            if (heap[p].f <= node.f) break;
            heap[i] = heap[p];
            i = p;
        }
        heap[i] = node;
    }
    function smartHeapPop(heap) {
        var top = heap[0];
        var node = heap.pop();
        if (heap.length > 0) {
            var i = 0;
            while (true) {
                var a = i * 2 + 1;
                var b = a + 1;
                if (a >= heap.length) break;
                var c = b < heap.length && heap[b].f < heap[a].f ? b : a;
                if (heap[c].f >= node.f) break;
                heap[i] = heap[c];
                i = c;
            }
            heap[i] = node;
        }
        return top;
    }
    function smartBuildBlockers(ch, goalTarget) {
        var data = [];
        var list = charFrameData();
        var chNormal = normal(ch);
        var chParty = partyCharacter(ch);
        for (var i = 0; i < list.length; i++) {
            var rec = list[i];
            if (rec && rec.target === goalTarget) continue;
            if (!charRecordBlocks(ch, chNormal, chParty, rec)) continue;
            data.push(rec.box);
        }
        return data;
    }
    function smartPassChars(ch, x, y, blockers) {
        if (through(ch)) return true;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) return true;
        var b = bodyBox(ch, x, y);
        for (var i = 0; i < blockers.length; i++) {
            if (hit(b, blockers[i])) return false;
        }
        return true;
    }
    function smartCanStepFrom(ch, blockers, x, y, tx, ty, d) {
        if (!active(ch)) return false;
        x = rx(snapX(x));y = ry(snapY(y));tx = rx(snapX(tx));ty = ry(snapY(ty));
        if (d % 2 !== 0) {
            var h = horz(d);
            var v = vert(d);
            var hx = rx(snapX(x + dirX(h) * unitX()));
            var vy = ry(snapY(y + dirY(v) * unitY()));
            if (!passMap(ch, x, y, hx, y, h) || !smartPassChars(ch, hx, y, blockers)) return false;
            if (!passMap(ch, x, y, x, vy, v) || !smartPassChars(ch, x, vy, blockers)) return false;
        }

        return passMap(ch, x, y, tx, ty, d) && smartPassChars(ch, tx, ty, blockers);
    }
    function smartRouteValidStep(ch, step) {
        if (!step || step.d <= 0 || !ch.vsMapPixelNextPoint || !ch.vsMapPixelCanMoveTo) return false;
        var p = ch.vsMapPixelNextPoint(step.d);
        var nx = smartWrapX(smartCellX(p.x));
        var ny = smartWrapY(smartCellY(p.y));
        return step.x === nx && step.y === ny && ch.vsMapPixelCanMoveTo(p.x, p.y, step.d);
    }

    Game_CharacterBase.prototype.vsMapPixelCanSmartFind = function() {
        if (!vsSmartFinding || through(this)) return false;
        if (typeof Game_Event !== "undefined" && this instanceof Game_Event) return true;
        return !!(this._vsMapPixelDestinationSmart && typeof Game_Player !== "undefined" && this instanceof Game_Player);
    };

    Game_CharacterBase.prototype.vsMapPixelSmartDirectionTo = function(tx, ty, target) {
        if (!this.vsMapPixelCanSmartFind()) return -1;
        tx = snapX(tx);ty = snapY(ty);
        var sx = smartWrapX(smartCellX(this._x));
        var sy = smartWrapY(smartCellY(this._y));
        var gx = smartWrapX(smartCellX(tx));
        var gy = smartWrapY(smartCellY(ty));
        var frame = smartFrame();
        var targetKey = smartTargetKey(target);
        var key = smartRouteKey(gx, gy, target);
        var cache = this._vsMapPixelSmartPath;
        if (cache && cache.expire > frame && cache.route && cache.targetKey === targetKey) {
            if (cache.route.length <= 0 && cache.key === key) {
                if (target && active(target)) {
                    this._vsMapPixelSmartPath = null;
                    this._vsMapPixelSmartWait = 0;
                    this._vsMapPixelSmartForceSearch = frame + 12;
                } else return 0;
            } else {
                var sameGoal = cache.key === key;
                var closeGoal = cache.gx != null && smartCellRange(gx, gy, cache.gx, cache.gy) <= vsSmartFarKeepCells;
                var farTarget = smartDistance(this._x, this._y, tx, ty) >= vsSmartFarKeepDistance;
                var keepRoute = sameGoal || (closeGoal && farTarget && cache.refresh > frame);
                if (keepRoute) {
                    while (cache.route.length > 0 && cache.route[0].x === sx && cache.route[0].y === sy) cache.route.shift();
                    if (cache.route.length > 0 && smartRouteValidStep(this, cache.route[0])) return cache.route[0].d;
                    if (sameGoal && cache.route.length <= 0) {
                        if (target && active(target)) {
                            this._vsMapPixelSmartPath = null;
                            this._vsMapPixelSmartWait = 0;
                            this._vsMapPixelSmartForceSearch = frame + 12;
                        } else return 0;
                    } else this._vsMapPixelSmartPath = null;
                }
            }
        }
        var destinationSmart = !!(this._vsMapPixelDestinationSmart && typeof Game_Player !== "undefined" && this instanceof Game_Player);
        if (((target && active(target)) || destinationSmart) && !smartSearchAllowed(this, frame)) return 0;
        var forcedWide = !!(this._vsMapPixelSmartForceSearch && this._vsMapPixelSmartForceSearch >= frame);
        if (forcedWide) this._vsMapPixelSmartWideSearch = true;
        var route = this.vsMapPixelSearchDirectionTo(tx, ty, target, sx, sy);
        if (forcedWide) {
            this._vsMapPixelSmartWideSearch = false;
            this._vsMapPixelSmartForceSearch = 0;
        }
        var mpc = window.VS221 && window.VS221.MapPixelCollision;
        var farLife = target && active(target) && smartDistance(this._x, this._y, tx, ty) >= vsSmartFarKeepDistance;
        var life = route.length > 0 ? Math.max(vsSmartRouteLife, route.length * (mpc && mpc.bodyBlocked && farLife ? 8 : 3)) : Math.max(12, Math.floor(vsSmartFailLife / 3));
        this._vsMapPixelSmartPath = {
            key: key,
            targetKey: targetKey,
            gx: gx,
            gy: gy,
            route: route,
            expire: frame + life,
            refresh: frame + Math.max(24, Math.floor(vsSmartFarRefresh / 2)) + (this.eventId ? this.eventId() % 8 : 0)
        };
        return route.length > 0 ? route[0].d : 0;
    };

    Game_CharacterBase.prototype.vsMapPixelSearchDirectionTo = function(tx, ty, target, sx, sy) {
        var start = smartPoint(sx, sy);
        var dirs = vsDiagonal ? [1, 3, 7, 9, 2, 4, 6, 8] : [2, 4, 6, 8];
        var open = [];
        var cost = {};
        var closed = {};
        var charsCache = {};
        var blockers = smartBuildBlockers(this, target);
        var mapSteps = smartMapStepCache(this);
        var startKey = smartKey(sx, sy);
        var startScore = smartDistance(start.x, start.y, tx, ty);
        var startNode = { x: sx, y: sy, px: start.x, py: start.y, g: 0, f: startScore, d: 0, parent: null };
        var goal = null;
        var best = null;
        var bestScore = startScore;
        var checked = 0;
        cost[startKey] = 0;
        smartHeapPush(open, startNode);
        var farTarget = target && active(target) && startScore >= vsSmartFarKeepDistance;
        var limit = this._vsMapPixelSmartWideSearch ? vsSmartWideSearchLimit : vsSmartSearchLimit;
        var moveData = this._vsMapPixelMoveToTarget;
        if (moveData && moveData.followTarget && moveData.smartSearchLimit > 0) limit = Math.min(limit, moveData.smartSearchLimit);
        while (open.length > 0 && checked < limit) {
            var node = smartHeapPop(open);
            var nodeKey = smartKey(node.x, node.y);
            if (closed[nodeKey]) continue;
            closed[nodeKey] = true;
            checked++;
            var score = smartDistance(node.px, node.py, tx, ty);
            if (node.parent && score < bestScore) {
                bestScore = score;
                best = node;
            }
            if (node.parent && smartGoalReached(this, node.px, node.py, tx, ty, target)) {
                goal = node;
                break;
            }
            for (var j = 0; j < dirs.length; j++) {
                var d = dirs[j];
                var nx = smartWrapX(node.x + dirX(d));
                var ny = smartWrapY(node.y + dirY(d));
                var key = smartKey(nx, ny);
                if (closed[key]) continue;
                var point = smartPoint(nx, ny);
                if (!smartCanStepCached(this, mapSteps, blockers, charsCache, node.x, node.y, node.px, node.py, point.x, point.y, d)) continue;
                var step = d % 2 === 0 ? 1 : Math.SQRT2;
                var nextCost = node.g + step;
                if (cost[key] != null && nextCost >= cost[key]) continue;
                cost[key] = nextCost;
                var h = smartDistance(point.x, point.y, tx, ty) / Math.max(unit(), 0.01);
                smartHeapPush(open, { x: nx, y: ny, px: point.x, py: point.y, g: nextCost, f: nextCost + h, d: d, parent: node });
            }
        }
        if (goal) return smartRouteFromNode(goal);
        var mpc2 = window.VS221 && window.VS221.MapPixelCollision;
        var collisionDestination = !target && this._vsMapPixelDestinationSmart && mpc2 && mpc2.bodyBlocked;
        if ((mpc2 && mpc2.bodyBlocked && farTarget) || collisionDestination) return [];
        if (best && bestScore < startScore - unit() * 0.5) return smartRouteFromNode(best);
        if (target && active(target)) {
            if (mpc2 && mpc2.bodyBlocked) return [];
            if (!this._vsMapPixelSmartWideSearch) {
                this._vsMapPixelSmartWideSearch = true;
                var retry = this.vsMapPixelSearchDirectionTo(tx, ty, target, sx, sy);
                this._vsMapPixelSmartWideSearch = false;
                return retry;
            }
            return [];
        }
        return [];
    };

    Game_CharacterBase.prototype.vsMapPixelBestDirectionTo = function(tx, ty, away, target, localOnly) {
        var smart = !localOnly && !away && this.vsMapPixelSmartDirectionTo ? this.vsMapPixelSmartDirectionTo(tx, ty, target) : -1;
        if (smart > 0) {
            this._vsMapPixelEdgeSide = 0;
            this._vsMapPixelEdgeBase = 0;
            this._vsMapPixelEdgeExpire = 0;
            return smart;
        }
        if (smart === 0 && !away && this.vsMapPixelCanSmartFind && this.vsMapPixelCanSmartFind()) {
            if (this._vsMapPixelDestinationSmart) return 0;
            if (target && active(target)) {
                this._vsMapPixelSmartPath = null;
                this._vsMapPixelSmartWait = 0;
                this._vsMapPixelSmartForceSearch = smartFrame() + 12;
                return 0;
            }
        }
        var base = this.vsMapPixelDirectionTo(tx, ty, away);
        var list = [];
        var frame = typeof Graphics !== "undefined" && Graphics.frameCount ? Graphics.frameCount : 0;
        function add(d) {
            if (d > 0 && list.indexOf(d) < 0) list.push(d);
        }
        function canUse(ch, d) {
            if (d <= 0 || !ch.vsMapPixelNextPoint || !ch.vsMapPixelCanMoveTo) return false;
            var p = ch.vsMapPixelNextPoint(d);
            return ch.vsMapPixelCanMoveTo(p.x, p.y, d);
        }
        function edgePair(d) {
            var h = horz(d);
            var v = vert(d);
            if (h && v) return [h, v];
            if (v) return [4, 6];
            if (h) return [8, 2];
            return [0, 0];
        }
        function edgeMix(baseDir, sideDir) {
            var h = horz(baseDir);
            var v = vert(baseDir);
            if ((sideDir === 4 || sideDir === 6) && v) return dir(sideDir, v);
            if ((sideDir === 2 || sideDir === 8) && h) return dir(h, sideDir);
            return sideDir;
        }
        var blocked = false;
        if (!away && base > 0 && this.vsMapPixelNextPoint && this.vsMapPixelCanMoveTo) {
            var front = this.vsMapPixelNextPoint(base);
            blocked = !this.vsMapPixelCanMoveTo(front.x, front.y, base);
        }
        var edgeSide = 0;
        if (!away && blocked) {
            var pair = edgePair(base);
            var sideA = pair[0];
            var sideB = pair[1];
            if (this._vsMapPixelEdgeExpire > frame && this._vsMapPixelEdgeBase === base && this._vsMapPixelEdgeSide > 0) {
                edgeSide = this._vsMapPixelEdgeSide;
            }
            if (edgeSide <= 0 || !canUse(this, edgeSide)) {
                if (canUse(this, sideA)) edgeSide = sideA;
                else if (canUse(this, sideB)) edgeSide = sideB;
                else edgeSide = this.eventId && this.eventId() % 2 === 0 ? sideB : sideA;
            }
            var otherSide = edgeSide === sideA ? sideB : sideA;
            add(edgeSide);
            add(edgeMix(base, edgeSide));
            add(otherSide);
            add(edgeMix(base, otherSide));
            if (base % 2 !== 0) {
                add(horz(base));
                add(vert(base));
            }
            add(base);
        } else {
            add(base);
            if (base % 2 !== 0) {
                add(horz(base));
                add(vert(base));
            }
        }
        if (!localOnly && !away && this.findDirectionTo) add(this.findDirectionTo(fx(tx), fx(ty)));
        add(2); add(4); add(6); add(8);
        if (vsDiagonal) {
            add(1); add(3); add(7); add(9);
        }
        var cx = dx(tx, this._x), cy = dy(ty, this._y);
        var current = Math.sqrt(cx * cx + cy * cy);
        var best = 0, score = Infinity;
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            var p = this.vsMapPixelNextPoint(d);
            if (!this.vsMapPixelCanMoveTo(p.x, p.y, d)) continue;
            var nx = dx(tx, p.x), ny = dy(ty, p.y);
            var s = Math.sqrt(nx * nx + ny * ny) + i * 0.01;
            if (away) {
                s = -s;
            } else if (blocked) {
                if (d === base) s += 4;
                if (edgeSide > 0 && d === edgeSide) s -= 2;
                if (edgeSide > 0 && d === edgeMix(base, edgeSide)) s -= 1.4;
                if (edgeSide > 0 && d === rev(edgeSide)) s += 3;
            } else if (s > current + unit() * 1.25) {
                continue;
            }
            if (s < score) {
                score = s;
                best = d;
            }
        }
        if (!away && blocked && best > 0) {
            var savePair = edgePair(base);
            var saveA = savePair[0];
            var saveB = savePair[1];
            var saveSide = 0;
            if (best === saveA || horz(best) === saveA || vert(best) === saveA) saveSide = saveA;
            if (best === saveB || horz(best) === saveB || vert(best) === saveB) saveSide = saveB;
            this._vsMapPixelEdgeSide = saveSide || edgeSide;
            this._vsMapPixelEdgeBase = base;
            this._vsMapPixelEdgeExpire = frame + 18;
        } else if (!away && !blocked) {
            this._vsMapPixelEdgeSide = 0;
            this._vsMapPixelEdgeBase = 0;
            this._vsMapPixelEdgeExpire = 0;
        }
        return best;
    };

    Game_CharacterBase.prototype.vsMapPixelMoveTowardPoint = function(x, y, target) {
        if (eventTouchPlayerToward(this)) return;
        var d = this.vsMapPixelBestDirectionTo(x, y, false, target);
        if (d > 0) {
            this.vsMapPixelMoveByDirection(d);
            return;
        }
        d = this.vsMapPixelDirectionTo(x, y, false);
        if (d > 0) {
            var p = this.vsMapPixelNextPoint(d);
            eventTouchPlayer(this, p.x, p.y);
        }
    };

    Game_CharacterBase.prototype.vsMapPixelMoveAwayFromPoint = function(x, y) {
        var d = this.vsMapPixelBestDirectionTo(x, y, true);
        if (d > 0) this.vsMapPixelMoveByDirection(d);
    };

    var _VS221_MapPixel_moveTowardCharacter = Game_Character.prototype.moveTowardCharacter;
    Game_Character.prototype.moveTowardCharacter = function(ch) {
        if (!active(this) || !ch) return _VS221_MapPixel_moveTowardCharacter.call(this, ch);
        this.vsMapPixelMoveTowardPoint(ch._x, ch._y, ch);
    };

    var _VS221_MapPixel_moveAwayFromCharacter = Game_Character.prototype.moveAwayFromCharacter;
    Game_Character.prototype.moveAwayFromCharacter = function(ch) {
        if (!active(this) || !ch) return _VS221_MapPixel_moveAwayFromCharacter.call(this, ch);
        this.vsMapPixelMoveAwayFromPoint(ch._x, ch._y);
    };

    var _VS221_MapPixel_moveRandom = Game_Character.prototype.moveRandom;
    Game_Character.prototype.moveRandom = function() {
        if (!active(this)) return _VS221_MapPixel_moveRandom.call(this);
        var dirs = vsDiagonal ? [2, 4, 6, 8, 1, 3, 7, 9] : [2, 4, 6, 8];
        for (var i = 0; i < 8; i++) {
            var d = dirs[Math.randomInt(dirs.length)];
            var p = this.vsMapPixelNextPoint(d);
            if (this.vsMapPixelCanMoveTo(p.x, p.y, d)) return this.vsMapPixelMoveByDirection(d);
        }
    };

    function boatShip(ch) {
        return ch && typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle && (ch._type === "boat" || ch._type === "ship");
    }

    Game_Player.prototype.vsMapPixelBoatShipDriving = function() {
        return this.isInVehicle && this.isInVehicle() && boatShip(this.vehicle && this.vehicle());
    };

    Game_Player.prototype.vsMapPixelVehicleFrontPoint = function() {
        var d = this.direction();
        var x = Math.round(this._x);
        var y = Math.round(this._y);
        return {
            x: $gameMap.roundXWithDirection(x, d),
            y: $gameMap.roundYWithDirection(y, d)
        };
    };

    Game_Player.prototype.vsMapPixelAirship = function() {
        var vehicle = $gameMap && $gameMap.airship ? $gameMap.airship() : null;
        return vehicle && (!$gameMap || vehicle._mapId === $gameMap.mapId()) ? vehicle : null;
    };

    Game_Player.prototype.vsMapPixelBoardVehicleList = function() {
        var list = vehicleList().slice();
        var airship = this.vsMapPixelAirship();
        if (airship) list.push(airship);
        return list;
    };

    Game_Player.prototype.vsMapPixelFindBoatShip = function() {
        if (!$gameMap) return null;
        var p = this.vsMapPixelVehicleFrontPoint();
        var box = this.vsMapPixelInteractionBox(this._x, this._y, this.direction());
        var list = vehicleList();
        for (var i = 0; i < list.length; i++) {
            var vehicle = list[i];
            if (hit(box, vehicle.vsMapPixelInteractionBox(vehicle._x, vehicle._y, rev(this.direction())))) return vehicle;
            if (vehicle.pos && vehicle.pos(p.x, p.y)) return vehicle;
        }
        return null;
    };

    Game_Player.prototype.vsMapPixelFindAirship = function() {
        var vehicle = this.vsMapPixelAirship();
        if (!vehicle) return null;
        if (this.vsMapPixelVehicleBoardTouching(vehicle)) return vehicle;
        return null;
    };

    Game_Player.prototype.vsMapPixelDestinationBoatShip = function() {
        if (!$gameTemp || !$gameTemp.isDestinationValid || !$gameTemp.isDestinationValid()) return null;
        var x = $gameTemp.destinationX();
        var y = $gameTemp.destinationY();
        var list = this.vsMapPixelBoardVehicleList();
        for (var i = 0; i < list.length; i++) {
            var vehicle = list[i];
            if (vehicle.pos && vehicle.pos(x, y)) return vehicle;
            if (pointInBox(bodyBox(vehicle, vehicle._x, vehicle._y), x, y)) return vehicle;
            if (pointInBox(vehicle.vsMapPixelInteractionBox(vehicle._x, vehicle._y, 2), x, y)) return vehicle;
        }
        return null;
    };

    Game_Player.prototype.vsMapPixelVehicleBoardTouching = function(vehicle) {
        if (!vehicle) return false;
        var body = bodyBox(vehicle, vehicle._x, vehicle._y);
        var dirs = [this.direction(), 2, 4, 6, 8];
        var used = {};
        for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            if (used[d]) continue;
            used[d] = true;
            var box = this.vsMapPixelInteractionBox(this._x, this._y, d);
            if (touchHit(box, body) || touchHit(box, vehicle.vsMapPixelInteractionBox(vehicle._x, vehicle._y, rev(d)))) {
                this.setDirection(d);
                return true;
            }
        }
        return touchHit(bodyBox(this, this._x, this._y), body);
    };

    Game_Player.prototype.vsMapPixelBestVehicleBoardPoint = function(vehicle) {
        if (!vehicle) return null;
        var best = null;
        var bestScore = Infinity;
        var vx = snapX(vehicle._x);
        var vy = snapY(vehicle._y);
        var dirs = [2, 4, 6, 8];
        var range = vehicle._type === "airship" ? 4 : 10;
        for (var ix = -range; ix <= range; ix++) {
            for (var iy = -range; iy <= range; iy++) {
                var px = rx(snapX(vx + ix * unitX()));
                var py = ry(snapY(vy + iy * unitY()));
                if (!this.vsMapPixelDestinationMapStandable(px, py)) continue;
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i];
                    var box = this.vsMapPixelInteractionBox(px, py, d);
                    if (!touchHit(box, bodyBox(vehicle, vehicle._x, vehicle._y)) && !touchHit(box, vehicle.vsMapPixelInteractionBox(vehicle._x, vehicle._y, rev(d)))) continue;
                    var sx = dx(px, this._x);
                    var sy = dy(py, this._y);
                    var vx2 = dx(px, vehicle._x);
                    var vy2 = dy(py, vehicle._y);
                    var score = Math.sqrt(sx * sx + sy * sy) + Math.sqrt(vx2 * vx2 + vy2 * vy2) * 0.25;
                    if (score < bestScore) {
                        bestScore = score;
                        best = { x: px, y: py, d: d };
                    }
                }
            }
        }
        return best;
    };

    Game_Player.prototype.vsMapPixelStartAirshipBoarding = function(vehicle) {
        if (!vehicle || vehicle._type !== "airship") return false;
        this._vehicleType = "airship";
        this._vehicleGettingOn = true;
        this._x = vehicle._x;
        this._y = vehicle._y;
        this._realX = vehicle._realX;
        this._realY = vehicle._realY;
        if (this.gatherFollowers) this.gatherFollowers();
        $gameTemp.clearDestination();
        return true;
    };

    Game_Player.prototype.vsMapPixelTryBoardBoatShipByDestination = function() {
        var clicked = this.vsMapPixelDestinationBoatShip();
        var data = this._vsMapPixelDestinationVehicle;
        var vehicle = clicked;
        if (!vehicle && data && data.vehicle && $gameTemp && $gameTemp.isDestinationValid && $gameTemp.isDestinationValid()) {
            var tx = $gameTemp.destinationX();
            var ty = $gameTemp.destinationY();
            if (Math.abs(dx(tx, data.x)) <= unit() * 0.35 && Math.abs(dy(ty, data.y)) <= unit() * 0.35) vehicle = data.vehicle;
            else this._vsMapPixelDestinationVehicle = null;
        }
        if (!vehicle || this._vsMapPixelVehicleFlow) return false;
        if (this.vsMapPixelVehicleBoardTouching(vehicle)) {
            this._vsMapPixelDestinationVehicle = null;
            $gameTemp.clearDestination();
            return vehicle._type === "airship" ? this.vsMapPixelStartAirshipBoarding(vehicle) : this.vsMapPixelStartVehicleBoarding(vehicle);
        }
        var p = this.vsMapPixelBestVehicleBoardPoint(vehicle);
        if (!p) return false;
        this._vsMapPixelDestinationVehicle = { vehicle: vehicle, x: p.x, y: p.y };
        if ($gameTemp.setDestination) $gameTemp.setDestination(p.x, p.y);
        return false;
    };

    Game_Player.prototype.vsMapPixelArrivedAt = function(x, y) {
        var mx = dx(x, this._x);
        var my = dy(y, this._y);
        return Math.sqrt(mx * mx + my * my) <= Math.max(unit() * 0.55, 0.08);
    };

    Game_Player.prototype.vsMapPixelDestinationMapStandable = function(x, y) {
        x = rx(snapX(x));
        y = ry(snapY(y));
        var b = bodyBox(this, x, y);
        if (!inMap(b) || !passChars(this, x, y)) return false;
        var xs = [b.l + vsEps, (b.l + b.r) / 2, b.r - vsEps];
        var ys = [b.t + vsEps, (b.t + b.b) / 2, b.b - vsEps];
        for (var iy = 0; iy < ys.length; iy++) {
            for (var ix = 0; ix < xs.length; ix++) {
                var tx = fx(rx(xs[ix]));
                var ty = fx(ry(ys[iy]));
                if (!$gameMap.isValid(tx, ty)) return false;
                if (!vehiclePassable(this, tx, ty, 2) && !vehiclePassable(this, tx, ty, 4) && !vehiclePassable(this, tx, ty, 6) && !vehiclePassable(this, tx, ty, 8)) return false;
            }
        }
        return true;
    };

    Game_Player.prototype.vsMapPixelResolveMapDestination = function(x, y) {
        x = rx(snapX(x));y = ry(snapY(y));
        if (this.vsMapPixelDestinationMapStandable(x, y)) return { x: x, y: y };
        var best = null;
        var bestScore = Infinity;
        for (var r = 1; r <= 3; r++) {
            for (var ix = -r; ix <= r; ix++) {
                for (var iy = -r; iy <= r; iy++) {
                    if (Math.max(Math.abs(ix), Math.abs(iy)) !== r) continue;
                    var px = rx(snapX(x + ix * unitX()));
                    var py = ry(snapY(y + iy * unitY()));
                    if (!this.vsMapPixelDestinationMapStandable(px, py)) continue;
                    var ox = dx(px, x);
                    var oy = dy(py, y);
                    var mx = dx(px, this._x);
                    var my = dy(py, this._y);
                    var score = Math.sqrt(ox * ox + oy * oy) * 3 + Math.sqrt(mx * mx + my * my) * 0.1;
                    if (score < bestScore) {
                        bestScore = score;
                        best = { x: px, y: py };
                    }
                }
            }
            if (best) return best;
        }
        return null;
    };

    Game_Player.prototype.vsMapPixelFollowers = function() {
        return this.followers && this.followers() && this.followers().visibleFollowers ? this.followers().visibleFollowers() : [];
    };

    Game_Player.prototype.vsMapPixelSetFollowersThrough = function(value) {
        var list = this.vsMapPixelFollowers();
        for (var i = 0; i < list.length; i++) {
            if (list[i] && list[i].setThrough) list[i].setThrough(!!value);
        }
    };

    Game_Player.prototype.vsMapPixelSetFollowersTransparent = function(value) {
        var list = this.vsMapPixelFollowers();
        for (var i = 0; i < list.length; i++) {
            if (list[i] && list[i].setTransparent) list[i].setTransparent(!!value);
        }
    };

    Game_Player.prototype.vsMapPixelSyncFollowersTo = function(x, y, d) {
        var list = this.vsMapPixelFollowers();
        for (var i = 0; i < list.length; i++) {
            var follower = list[i];
            if (!follower) continue;
            follower._x = x;
            follower._y = y;
            follower._realX = x;
            follower._realY = y;
            follower._vsMapPixelFollowAim = null;
            follower._vsMapPixelFollowBlock = 0;
            if (follower.vsMapPixelPushTrace) {
                follower._vsMapPixelTrace = [];
                follower.vsMapPixelPushTrace(true);
            }
            if (follower.setDirection) follower.setDirection(d);
        }
    };

    Game_Player.prototype.vsMapPixelFollowersNear = function(x, y) {
        var list = this.vsMapPixelFollowers();
        var limit = Math.max(unit() * 1.35, 0.16);
        for (var i = 0; i < list.length; i++) {
            var follower = list[i];
            if (!follower) continue;
            var mx = dx(x, follower._x);
            var my = dy(y, follower._y);
            if (Math.sqrt(mx * mx + my * my) > limit) return false;
        }
        return true;
    };

    Game_Player.prototype.vsMapPixelMoveFollowersTo = function(x, y, d, mode) {
        var list = this.vsMapPixelFollowers();
        for (var i = 0; i < list.length; i++) {
            var follower = list[i];
            if (!follower) continue;
            if (follower.setThrough) follower.setThrough(true);
            if (follower.setTransparent) follower.setTransparent(false);
            if (follower.setDirection) follower.setDirection(d);
            var target = i > 0 ? list[i - 1] : mode === "vehicle" ? null : this;
            var tx = target ? target._x : x;
            var ty = target ? target._y : y;
            var mx = dx(tx, follower._x);
            var my = dy(ty, follower._y);
            if (Math.sqrt(mx * mx + my * my) <= Math.max(unit() * 0.75, 0.08)) {
                if (follower.vsMapPixelPushTrace) follower.vsMapPixelPushTrace();
                continue;
            }
            if (!follower.isMoving || !follower.isMoving()) {
                if (follower.setMoveSpeed) follower.setMoveSpeed(this.realMoveSpeed ? this.realMoveSpeed() : 4);
                if (follower.vsMapPixelMoveTowardPoint) follower.vsMapPixelMoveTowardPoint(tx, ty);
            }
            if (follower.vsMapPixelPushTrace) follower.vsMapPixelPushTrace();
        }
    };

    Game_Player.prototype.vsMapPixelSyncVehiclePosition = function() {
        var vehicle = this.vehicle && this.vehicle();
        if (!boatShip(vehicle)) return;
        this._x = vehicle._x;
        this._y = vehicle._y;
        this._realX = vehicle._realX;
        this._realY = vehicle._realY;
        this.setDirection(vehicle.direction());
        if (this.vsMapPixelPushTrace) this.vsMapPixelPushTrace();
        if (!this._vsMapPixelVehicleFlow) {
            this.vsMapPixelSyncFollowersTo(vehicle._x, vehicle._y, vehicle.direction());
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelSetFollowersTransparent(true);
        }
    };

    Game_Player.prototype.vsMapPixelStartVehicleBoarding = function(vehicle) {
        if (!boatShip(vehicle) || this._vsMapPixelVehicleFlow) return false;
        this._vsMapPixelVehicleFlow = {
            mode: "board",
            vehicle: vehicle,
            d: this.direction(),
            oldThrough: this.isThrough && this.isThrough()
        };
        this._vehicleGettingOn = true;
        this.setThrough(true);
        this.setTransparent(false);
        this.vsMapPixelSetFollowersThrough(false);
        this.vsMapPixelSetFollowersTransparent(false);
        $gameTemp.clearDestination();
        return true;
    };

    Game_Player.prototype.vsMapPixelUpdateVehicleFlow = function() {
        var data = this._vsMapPixelVehicleFlow;
        if (!data || !data.vehicle) return false;
        var vehicle = data.vehicle;
        if (data.mode === "board") {
            this.setThrough(true);
            this.setTransparent(false);
            if (!this.vsMapPixelArrivedAt(vehicle._x, vehicle._y)) {
                if (!this.isMoving()) this.vsMapPixelMoveTowardPoint(vehicle._x, vehicle._y);
                return true;
            }
            vehicle.getOn();
            this._vehicleType = vehicle._type;
            this._vehicleGettingOn = false;
            this.setTransparent(true);
            this.setThrough(true);
            this.setMoveSpeed(vehicle.moveSpeed());
            this._x = vehicle._x;
            this._y = vehicle._y;
            this._realX = vehicle._realX;
            this._realY = vehicle._realY;
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelSetFollowersTransparent(false);
            this._vsMapPixelVehicleFlow = { mode: "boardFollowers", vehicle: vehicle, d: data.d, frame: 0 };
            clearPartyTrace();
            return true;
        }
        if (data.mode === "boardFollowers") {
            this.vsMapPixelSyncVehiclePosition();
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelSetFollowersTransparent(false);
            this.vsMapPixelMoveFollowersTo(vehicle._x, vehicle._y, data.d, "vehicle");
            if (this.vsMapPixelFollowersNear(vehicle._x, vehicle._y)) {
                this.vsMapPixelSyncFollowersTo(vehicle._x, vehicle._y, data.d);
                this.vsMapPixelSetFollowersTransparent(true);
                this._vsMapPixelVehicleFlow = null;
                clearPartyTrace();
                return false;
            }
            return true;
        }
        if (data.mode === "off") {
            this._vehicleType = "walk";
            this._vehicleGettingOn = false;
            this._vehicleGettingOff = true;
            this.setTransparent(false);
            this.setThrough(true);
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelSetFollowersTransparent(false);
            if (!this.vsMapPixelArrivedAt(data.landX, data.landY)) {
                if (!this.isMoving()) this.vsMapPixelMoveTowardPoint(data.landX, data.landY);
                this.vsMapPixelMoveFollowersTo(this._x, this._y, data.d, "off");
                return true;
            }
            this.setThrough(false);
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelMoveFollowersTo(data.landX, data.landY, data.d, "off");
            if (this.vsMapPixelFollowersNear(data.landX, data.landY)) {
                this._vehicleGettingOff = false;
                this.vsMapPixelSetFollowersThrough(false);
                this.vsMapPixelSetFollowersTransparent(false);
                this._vsMapPixelVehicleFlow = null;
                if (this._followers) this._followers._gathering = false;
                clearPartyTrace();
                return false;
            }
            this._vsMapPixelVehicleFlow = { mode: "offFollowers", vehicle: vehicle, d: data.d, landX: data.landX, landY: data.landY };
            return true;
        }
        if (data.mode === "offFollowers") {
            this._vehicleType = "walk";
            this._vehicleGettingOn = false;
            this._vehicleGettingOff = true;
            this.setTransparent(false);
            this.setThrough(false);
            this.vsMapPixelSetFollowersThrough(true);
            this.vsMapPixelSetFollowersTransparent(false);
            this.vsMapPixelMoveFollowersTo(data.landX, data.landY, data.d, "off");
            if (this.vsMapPixelFollowersNear(data.landX, data.landY)) {
                this._vehicleGettingOff = false;
                this.vsMapPixelSetFollowersThrough(false);
                this.vsMapPixelSetFollowersTransparent(false);
                this._vsMapPixelVehicleFlow = null;
                if (this._followers) this._followers._gathering = false;
                clearPartyTrace();
                return false;
            }
            return true;
        }
        return false;
    };

    var _VS221_MapPixel_getOnVehicle = Game_Player.prototype.getOnVehicle;
    Game_Player.prototype.getOnVehicle = function() {
        var vehicle = this.vsMapPixelFindBoatShip();
        if (vehicle) return this.vsMapPixelStartVehicleBoarding(vehicle);
        var airship = this.vsMapPixelFindAirship ? this.vsMapPixelFindAirship() : null;
        if (airship) return this.vsMapPixelStartAirshipBoarding(airship);
        return _VS221_MapPixel_getOnVehicle.call(this);
    };

    var _VS221_MapPixel_getOffVehicle = Game_Player.prototype.getOffVehicle;
    Game_Player.prototype.getOffVehicle = function() {
        if (!this.vsMapPixelBoatShipDriving()) return _VS221_MapPixel_getOffVehicle.call(this);
        var vehicle = this.vehicle();
        var d = this.direction();
        var x = Math.round(vehicle._x);
        var y = Math.round(vehicle._y);
        if (!vehicle.isLandOk(x, y, d)) return false;
        var landX = $gameMap.roundXWithDirection(x, d);
        var landY = $gameMap.roundYWithDirection(y, d);
        vehicle.getOff();
        this._vehicleType = "walk";
        this._vehicleGettingOn = false;
        this._vehicleGettingOff = true;
        this.setMoveSpeed(4);
        this.setDirection(d);
        this.setTransparent(false);
        this.setThrough(true);
        this._x = vehicle._x;
        this._y = vehicle._y;
        this._realX = vehicle._realX;
        this._realY = vehicle._realY;
        this.vsMapPixelSetFollowersThrough(true);
        this.vsMapPixelSetFollowersTransparent(false);
        this.vsMapPixelSyncFollowersTo(this._x, this._y, d);
        this._vsMapPixelVehicleFlow = { mode: "off", vehicle: vehicle, d: d, landX: landX, landY: landY };
        if (this._followers) this._followers._gathering = false;
        clearPartyTrace();
        this.makeEncounterCount();
        $gameTemp.clearDestination();
        return true;
    };

    var _VS221_MapPixel_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this._vsMapPixelVehicleFlow) return false;
        return _VS221_MapPixel_canMove.call(this);
    };

    var _VS221_MapPixel_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function(direction) {
        if (this.vsMapPixelBoatShipDriving && this.vsMapPixelBoatShipDriving()) {
            var vehicle = this.vehicle();
            if (boatShip(vehicle)) {
                vehicle.vsMapPixelMoveByDirection(direction);
                this.vsMapPixelSyncVehiclePosition();
                return;
            }
        }
        if (!active(this)) return _VS221_MapPixel_executeMove.call(this, direction);
        this.vsMapPixelMoveByDirection(direction);
    };

    function vsMapPixelMouseSmartDirection(ch, x, y) {
        var oldSmart = ch._vsMapPixelDestinationSmart;
        var oldWide = ch._vsMapPixelSmartWideSearch;
        var oldWait = ch._vsMapPixelSmartWait;
        ch._vsMapPixelDestinationSmart = true;
        ch._vsMapPixelSmartWideSearch = true;
        ch._vsMapPixelSmartWait = 0;
        VS._smartSearchFrame = -1;
        var d = ch.vsMapPixelSmartDirectionTo ? ch.vsMapPixelSmartDirectionTo(x, y, null) : 0;
        ch._vsMapPixelDestinationSmart = oldSmart;
        ch._vsMapPixelSmartWideSearch = oldWide;
        ch._vsMapPixelSmartWait = oldWait;
        return d;
    }

    function vsMapPixelClearMouseDestination(ch) {
        if (ch) {
            ch._vsMapPixelSmartPath = null;
            ch._vsMapPixelDestinationSmart = false;
            ch._vsMapPixelSmartWideSearch = false;
        }
        $gameTemp.clearDestination();
    }

    function vsMapPixelExecuteMouseMove(ch, d) {
        var oldX = ch._x;
        var oldY = ch._y;
        var oldNoSlide = ch._vsMapPixelNoSlide;
        ch._vsMapPixelNoSlide = true;
        ch.executeMove(d);
        ch._vsMapPixelNoSlide = oldNoSlide;
        if (Math.abs(dx(ch._x, oldX)) <= 0.001 && Math.abs(dy(ch._y, oldY)) <= 0.001) vsMapPixelClearMouseDestination(ch);
    }

    var _VS221_MapPixel_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if (this.vsMapPixelBoatShipDriving && this.vsMapPixelBoatShipDriving()) {
            var vehicle = this.vehicle();
            if (!vehicle || vehicle.isMoving && vehicle.isMoving() || !this.canMove()) return;
            var vd = vsDiagonal ? inputDir8() : Input.dir4;
            if (vd > 0) {
                vsMapPixelClearMouseDestination(this);
                this.executeMove(vd);
            } else if ($gameTemp.isDestinationValid()) {
                var vx = $gameTemp.destinationX();
                var vy = $gameTemp.destinationY();
                var mx = dx(vx, vehicle._x), my = dy(vy, vehicle._y);
                if (Math.sqrt(mx * mx + my * my) <= unit() * 0.45) vsMapPixelClearMouseDestination(this);
                else {
                    var md = vehicle.vsMapPixelBestDirectionTo(vx, vy, false);
                    if (md > 0) this.executeMove(md);
                    else vsMapPixelClearMouseDestination(this);
                }
            }
            return;
        }
        if (this._vsMapPixelMoveToTarget && this._vsMapPixelMoveToTarget.centerGrid) return;
        if (!active(this)) return _VS221_MapPixel_moveByInput.call(this);
        if (!this.isMoving() && this.canMove()) {
            var d = vsDiagonal ? inputDir8() : Input.dir4;
            if (d > 0) {
                vsMapPixelClearMouseDestination(this);
                this.executeMove(d);
            } else if ($gameTemp.isDestinationValid()) {
                if (this.vsMapPixelTryBoardBoatShipByDestination && this.vsMapPixelTryBoardBoatShipByDestination()) return;
                var x = $gameTemp.destinationX();
                var y = $gameTemp.destinationY();
                var fixed = this.vsMapPixelResolveMapDestination ? this.vsMapPixelResolveMapDestination(x, y) : null;
                if (!fixed) {
                    vsMapPixelClearMouseDestination(this);
                    return;
                }
                if (fixed.x !== x || fixed.y !== y) {
                    x = fixed.x;
                    y = fixed.y;
                    $gameTemp.setDestination(x, y);
                }
                var mpc = window.VS221 && window.VS221.MapPixelCollision;
                if (mpc && mpc.bodyBlocked) {
                    var resolved = smartResolveDestination(this, x, y);
                    if (!resolved) {
                        vsMapPixelClearMouseDestination(this);
                        return;
                    }
                    if (resolved.x !== x || resolved.y !== y) {
                        x = resolved.x;
                        y = resolved.y;
                        $gameTemp.setDestination(x, y);
                    }
                }
                var mx2 = dx(x, this._x), my2 = dy(y, this._y);
                var dist = Math.sqrt(mx2 * mx2 + my2 * my2);
                if (dist <= unit() * 0.45) {
                    vsMapPixelClearMouseDestination(this);
                } else if (mpc && mpc.bodyBlocked) {
                    var sd = vsMapPixelMouseSmartDirection(this, x, y);
                    if (sd > 0) vsMapPixelExecuteMouseMove(this, sd);
                    else vsMapPixelClearMouseDestination(this);
                } else {
                    var pd = 0;
                    var direct = this.vsMapPixelDirectionTo ? this.vsMapPixelDirectionTo(x, y, false) : 0;
                    if (direct > 0) {
                        var p = this.vsMapPixelNextPoint(direct);
                        if (this.vsMapPixelCanMoveTo(p.x, p.y, direct)) pd = direct;
                    }
                    if (pd <= 0) {
                        var oldSmart = this._vsMapPixelDestinationSmart;
                        var oldWide = this._vsMapPixelSmartWideSearch;
                        this._vsMapPixelDestinationSmart = true;
                        this._vsMapPixelSmartWideSearch = true;
                        pd = this.vsMapPixelSmartDirectionTo ? this.vsMapPixelSmartDirectionTo(x, y, null) : 0;
                        this._vsMapPixelDestinationSmart = oldSmart;
                        this._vsMapPixelSmartWideSearch = oldWide;
                    }
                    if (pd > 0) this.executeMove(pd);
                    else vsMapPixelClearMouseDestination(this);
                }
            }
        }
    };

    function clearPartyTrace() {
        if ($gamePlayer && $gamePlayer.vsMapPixelPushTrace) {
            $gamePlayer._vsMapPixelTrace = [];
            $gamePlayer.vsMapPixelPushTrace(true);
        }
        var list = $gamePlayer && $gamePlayer.followers ? $gamePlayer.followers().visibleFollowers() : [];
        for (var i = 0; i < list.length; i++) {
            list[i]._vsMapPixelTrace = [];
            if (list[i].vsMapPixelPushTrace) list[i].vsMapPixelPushTrace(true);
        }
    }

    var _VS221_MapPixel_playerUpdate = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _VS221_MapPixel_playerUpdate.call(this, sceneActive);
        if (this.vsMapPixelUpdateVehicleFlow && this.vsMapPixelUpdateVehicleFlow()) return;
        if (this.vsMapPixelBoatShipDriving && this.vsMapPixelBoatShipDriving()) this.vsMapPixelSyncVehiclePosition();
        if (active(this)) {
            this.vsMapPixelPushTrace();
            resetTouchCooldownsAwayFromPlayer();
            if (this.vsMapPixelStartBelowEventByBody) this.vsMapPixelStartBelowEventByBody([1, 2], this._x, this._y);
            if (this.vsMapPixelTryStartMouseBodyEvent) this.vsMapPixelTryStartMouseBodyEvent();
        }
    };

    var _VS221_MapPixel_playerLocate = Game_Player.prototype.locate;
    Game_Player.prototype.locate = function(x, y) {
        _VS221_MapPixel_playerLocate.call(this, x, y);
        clearPartyTrace();
    };

    var _VS221_MapPixel_followersUpdateMove = Game_Followers.prototype.updateMove;
    Game_Followers.prototype.updateMove = function() {
        if (this.areGathering && this.areGathering()) {
            _VS221_MapPixel_followersUpdateMove.call(this);
        }
    };

    Game_Follower.prototype.vsMapPixelFollowTarget = function() {
        var fs = $gamePlayer && $gamePlayer.followers ? $gamePlayer.followers().visibleFollowers() : [];
        var i = fs.indexOf(this);
        return i > 0 ? fs[i - 1] : $gamePlayer;
    };

    Game_Follower.prototype.vsMapPixelFollowDistance = function() {
        return Math.max(vsFollowerDistance, unit() * 2.2);
    };

    Game_Follower.prototype.vsMapPixelFollowSpeed = function(far) {
        var speed = $gamePlayer && $gamePlayer.realMoveSpeed ? $gamePlayer.realMoveSpeed() : this.realMoveSpeed();
        if (far >= 7) return speed + 0.5;
        if (far >= 4) return speed + 0.25;
        if (far >= 1.25) return speed;
        return speed - 0.5;
    };

    Game_Follower.prototype.vsMapPixelFollowPoint = function(target, far, gap) {
        if (far >= 4.2) return { x: target._x, y: target._y };
        if (target.vsMapPixelTracePoint) return target.vsMapPixelTracePoint(gap);
        return { x: target._x, y: target._y };
    };

    Game_Follower.prototype.vsMapPixelTryFollowMove = function(p) {
        var x = this._x, y = this._y;
        var beforeX = dx(p.x, x);
        var beforeY = dy(p.y, y);
        var before = Math.sqrt(beforeX * beforeX + beforeY * beforeY);
        this.vsMapPixelMoveTowardPoint(p.x, p.y);
        var movedX = Math.abs(dx(this._x, x));
        var movedY = Math.abs(dy(this._y, y));
        var moved = movedX > 0.001 || movedY > 0.001;
        var afterX = dx(p.x, this._x);
        var afterY = dy(p.y, this._y);
        var after = Math.sqrt(afterX * afterX + afterY * afterY);
        var progress = before - after;
        if (moved && progress <= Math.max(unit() * 0.08, 0.01)) {
            this._x = x;
            this._y = y;
            this._realX = x;
            this._realY = y;
            moved = false;
        }
        this._vsMapPixelFollowBlock = moved ? 0 : (this._vsMapPixelFollowBlock || 0) + 1;
        return moved;
    };

    Game_Follower.prototype.vsMapPixelUpdateFollow = function() {
        if (!active(this) || (this.isVisible && !this.isVisible()) || this.isMoving()) return;
        var group = $gamePlayer && $gamePlayer.followers ? $gamePlayer.followers() : null;
        if (group && group.areGathering && group.areGathering()) return;
        var target = this.vsMapPixelFollowTarget();
        if (!target) return;
        var gap = this.vsMapPixelFollowDistance();
        var tx = dx(target._x, this._x), ty = dy(target._y, this._y);
        var far = Math.sqrt(tx * tx + ty * ty);
        if (far <= gap * 0.88) {
            this._vsMapPixelFollowAim = null;
            this._vsMapPixelFollowBlock = 0;
            this.setMovementSuccess(false);
            this.vsMapPixelPushTrace();
            return;
        }
        var point = this.vsMapPixelFollowPoint(target, far, gap);
        var aim = this._vsMapPixelFollowAim;
        var fresh = !aim || far >= 4.2 || (this._vsMapPixelFollowBlock || 0) >= 3;
        if (aim && !fresh) {
            var ax = dx(aim.x, this._x), ay = dy(aim.y, this._y);
            fresh = Math.sqrt(ax * ax + ay * ay) <= Math.max(unit() * 0.65, 0.08);
        }
        if (fresh) this._vsMapPixelFollowAim = { x: point.x, y: point.y };
        var p = this._vsMapPixelFollowAim || point;
        var px = dx(p.x, this._x), py = dy(p.y, this._y);
        if (Math.sqrt(px * px + py * py) <= Math.max(unit() * 0.6, 0.08)) {
            this.vsMapPixelPushTrace();
            return;
        }
        this.setMoveSpeed(this.vsMapPixelFollowSpeed(far));
        if (!this.vsMapPixelTryFollowMove(p) && far >= 2.2) {
            if ((this._vsMapPixelFollowBlock || 0) >= 4) {
                this._vsMapPixelFollowAim = { x: target._x, y: target._y };
                this.vsMapPixelTryFollowMove(this._vsMapPixelFollowAim);
            }
        }
        this.vsMapPixelPushTrace();
    };

    var _VS221_MapPixel_followerUpdate = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
        _VS221_MapPixel_followerUpdate.call(this);
        this.vsMapPixelUpdateFollow();
    };

    function canvasX(x) {
        var tw = $gameMap.tileWidth();
        var d = divX();
        var anchor = tw / 2 - vsGridPixel / 2;
        var cell = Math.floor(($gameMap.displayX() * tw + x - anchor) / vsGridPixel);
        return rx(cell / d);
    }
    function canvasY(y) {
        var th = $gameMap.tileHeight(), d = divY();
        var anchor = th / 2 - vsGridPixel / 2;
        var cell = Math.floor(($gameMap.displayY() * th + y - anchor) / vsGridPixel);
        return ry(cell / d);
    }
    function rawCanvasX(x) {
        return rx($gameMap.displayX() + x / $gameMap.tileWidth());
    }
    function rawCanvasY(y) {
        return ry($gameMap.displayY() + y / $gameMap.tileHeight());
    }

    var _VS221_MapPixel_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        if (!$gameTemp || !$gameTemp.setDestination) {
            _VS221_MapPixel_processMapTouch.call(this);
            return;
        }
        if (TouchInput.isTriggered && TouchInput.isTriggered()) {
            var px = rawCanvasX(TouchInput.x);
            var py = rawCanvasY(TouchInput.y);
            if ($gamePlayer && $gamePlayer.vsMapPixelHandleMouseBodyEventClick && $gamePlayer.vsMapPixelHandleMouseBodyEventClick(px, py)) return;
            if ($gamePlayer) $gamePlayer._vsMapPixelMouseBodyEventId = 0;
        }
        var originalSetDestination = $gameTemp.setDestination;
        $gameTemp.setDestination = function(x, y) {
            if (TouchInput.isPressed()) {
                originalSetDestination.call(this, canvasX(TouchInput.x), canvasY(TouchInput.y));
            } else {
                originalSetDestination.call(this, x, y);
            }
        };
        try {
            _VS221_MapPixel_processMapTouch.call(this);
        } finally {
            $gameTemp.setDestination = originalSetDestination;
        }
    };

    Game_Player.prototype.vsMapPixelGridX = function() {
        return Math.round(this._x);
    };

    Game_Player.prototype.vsMapPixelGridY = function() {
        return Math.round(this._y);
    };

    Game_Event.prototype.vsMapPixelHasPageHitboxData = function() {
        var data = this.vsMapPixelBoxTags ? this.vsMapPixelBoxTags() : {};
        return !!(data.Body || data.VSBody || data.BodyOffset || data.Offset || data.VSBodyOffset || data.VSOffset || data.InteractUp || data.InteractDown || data.InteractLeft || data.InteractRight || data.VSInteractUp || data.VSInteractDown || data.VSInteractLeft || data.VSInteractRight);
    };

    function mouseClamp(v, a, b) {
        if (a > b) return v;
        return Math.max(a, Math.min(b, v));
    }

    function mouseBoxCenterX(b) {
        return b.shape === "circle" ? b.cx : (b.l + b.r) / 2;
    }

    function mouseBoxCenterY(b) {
        return b.shape === "circle" ? b.cy : (b.t + b.b) / 2;
    }

    function mouseBodyGap(a, b) {
        if (!a || !b) return Infinity;
        if (touchHit(a, b)) return 0;
        var gx = Math.max(0, Math.max(b.l - a.r, a.l - b.r));
        var gy = Math.max(0, Math.max(b.t - a.b, a.t - b.b));
        return Math.sqrt(gx * gx + gy * gy);
    }

    function mouseBodyClickGap() {
        var tw = $gameMap && $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
        return Math.max(unit() * 0.5, 8 / Math.max(1, tw));
    }

    Game_Player.prototype.vsMapPixelMouseBodyEventAt = function(x, y) {
        if (!$gameMap || $gameMap.isEventRunning()) return null;
        var events = $gameMap.events ? $gameMap.events() : [];
        var best = null;
        var score = Infinity;
        for (var i = events.length - 1; i >= 0; i--) {
            var event = events[i];
            if (!event || event._erased) continue;
            if (event.isJumping && event.isJumping()) continue;
            if (event.isNormalPriority && !event.isNormalPriority()) continue;
            if (event.isTriggerIn && !event.isTriggerIn([0])) continue;
            if (!event.isTriggerIn && event._trigger !== 0) continue;
            var box = bodyBox(event, event._x, event._y);
            if (!pointInBox(box, x, y)) continue;
            var cx = mouseBoxCenterX(box);
            var cy = mouseBoxCenterY(box);
            var s = Math.abs(dx(x, cx)) + Math.abs(dy(y, cy));
            if (s < score) {
                score = s;
                best = event;
            }
        }
        return best;
    };

    Game_Player.prototype.vsMapPixelMouseBodyApproachPoint = function(event, x, y) {
        var pb = bodyBox(this, this._x, this._y);
        var eb = bodyBox(event, event._x, event._y);
        if (!pb || !eb) return { x: event._x, y: event._y };
        var pl = pb.l - this._x;
        var pr = pb.r - this._x;
        var pt = pb.t - this._y;
        var pbm = pb.b - this._y;
        var pcx = (pb.l + pb.r) / 2 - this._x;
        var pcy = (pb.t + pb.b) / 2 - this._y;
        var cx = mouseClamp(x, eb.l, eb.r);
        var cy = mouseClamp(y, eb.t, eb.b);
        var e = Math.max(vsEps, unit() * 0.15);
        var list = [
            { x: eb.l - pr - e, y: mouseClamp(cy - pcy, eb.t - pbm, eb.b - pt) },
            { x: eb.r - pl + e, y: mouseClamp(cy - pcy, eb.t - pbm, eb.b - pt) },
            { x: mouseClamp(cx - pcx, eb.l - pr, eb.r - pl), y: eb.t - pbm - e },
            { x: mouseClamp(cx - pcx, eb.l - pr, eb.r - pl), y: eb.b - pt + e }
        ];
        var best = list[0];
        var score = Infinity;
        for (var i = 0; i < list.length; i++) {
            var p = list[i];
            var s = Math.abs(dx(p.x, this._x)) + Math.abs(dy(p.y, this._y));
            if (s < score) {
                score = s;
                best = p;
            }
        }
        return { x: rx(snapX(best.x)), y: ry(snapY(best.y)) };
    };

    Game_Player.prototype.vsMapPixelTryStartMouseBodyEvent = function(event) {
        if (!$gameMap || $gameMap.isEventRunning()) return false;
        if (!this.canStartLocalEvents || !this.canStartLocalEvents()) return false;
        event = event || $gameMap.event(this._vsMapPixelMouseBodyEventId || 0);
        if (!event || event._erased || event.isJumping && event.isJumping()) {
            this._vsMapPixelMouseBodyEventId = 0;
            return false;
        }
        if (event.isNormalPriority && !event.isNormalPriority()) {
            this._vsMapPixelMouseBodyEventId = 0;
            return false;
        }
        if (event.isTriggerIn && !event.isTriggerIn([0])) {
            this._vsMapPixelMouseBodyEventId = 0;
            return false;
        }
        var playerBox = bodyBox(this, this._x, this._y);
        var eventBox = bodyBox(event, event._x, event._y);
        if (mouseBodyGap(playerBox, eventBox) > mouseBodyClickGap()) {
            if ($gameTemp && $gameTemp.isDestinationValid && !$gameTemp.isDestinationValid()) this._vsMapPixelMouseBodyEventId = 0;
            return false;
        }
        var d = this.vsMapPixelDirectionTo ? this.vsMapPixelDirectionTo(event._x, event._y, false) : 0;
        if (d > 0 && this.setDirection) this.setDirection(faceDir(this, d));
        this._vsMapPixelMouseBodyEventId = 0;
        if ($gameTemp && $gameTemp.clearDestination) $gameTemp.clearDestination();
        event.start();
        return true;
    };

    Game_Player.prototype.vsMapPixelHandleMouseBodyEventClick = function(x, y) {
        var event = this.vsMapPixelMouseBodyEventAt(x, y);
        if (!event) return false;
        this._vsMapPixelMouseBodyEventId = event.eventId ? event.eventId() : 0;
        if (this.vsMapPixelTryStartMouseBodyEvent(event)) return true;
        var p = this.vsMapPixelMouseBodyApproachPoint(event, x, y);
        if ($gameTemp && $gameTemp.setDestination) $gameTemp.setDestination(p.x, p.y);
        return true;
    };

    Game_Player.prototype.vsMapPixelStartEventByInteractionBox = function(triggers) {
        if (!this.canStartLocalEvents || !this.canStartLocalEvents()) return false;
        if (!$gameMap || $gameMap.isEventRunning()) return false;
        var d = this.direction();
        var playerBox = this.vsMapPixelInteractionBox(this._x, this._y, d);
        var eventDirection = rev(d);
        var events = $gameMap.events ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (!event || event._erased) continue;
            if (event.isNormalPriority && !event.isNormalPriority()) continue;
            if (event.isTriggerIn && !event.isTriggerIn(triggers)) continue;
            if (!hit(playerBox, event.vsMapPixelInteractionBox(event._x, event._y, eventDirection))) continue;
            event.start();
            return true;
        }
        return false;
    };

    Game_Player.prototype.vsMapPixelStartEventByGridPoint = function(x, y, triggers) {
        var d = this.direction();
        var playerBox = this.vsMapPixelInteractionBox(this._x, this._y, d);
        var eventDirection = rev(d);
        var events = $gameMap.eventsXyNt ? $gameMap.eventsXyNt(x, y) : [];
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (!event || event._erased) continue;
            if (event.isNormalPriority && !event.isNormalPriority()) continue;
            if (event.vsMapPixelHasPageHitboxData && event.vsMapPixelHasPageHitboxData()) continue;
            if (event.isTriggerIn && !event.isTriggerIn(triggers)) continue;
            if (!hit(playerBox, event.vsMapPixelInteractionBox(event._x, event._y, eventDirection))) continue;
            event.start();
            return true;
        }
        return false;
    };

    Game_Player.prototype.vsMapPixelStartEventByGridBackup = function(triggers) {
        if (!this.canStartLocalEvents || !this.canStartLocalEvents()) return false;
        if (!$gameMap || $gameMap.isEventRunning()) return false;
        var d = this.direction();
        var x = this.vsMapPixelGridX();
        var y = this.vsMapPixelGridY();
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if (this.vsMapPixelStartEventByGridPoint(x2, y2, triggers)) return true;
        if ($gameMap.isCounter && $gameMap.isCounter(x2, y2)) {
            x2 = $gameMap.roundXWithDirection(x2, d);
            y2 = $gameMap.roundYWithDirection(y2, d);
            if (this.vsMapPixelStartEventByGridPoint(x2, y2, triggers)) return true;
        }
        return false;
    };

    Game_Player.prototype.vsMapPixelStartBelowEventByBody = function(triggers, x, y) {
        if (!this.canStartLocalEvents || !this.canStartLocalEvents()) return false;
        if (!$gameMap || $gameMap.isEventRunning()) return false;
        var px = x != null ? x : this._x;
        var py = y != null ? y : this._y;
        var playerBox = bodyBox(this, px, py);
        var events = $gameMap.events ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (!event || event._erased) continue;
            if (event._priorityType !== 0) continue;
            if (event.isTriggerIn && !event.isTriggerIn(triggers)) continue;
            if (!touchHit(playerBox, bodyBox(event, event._x, event._y))) continue;
            if (event.isTriggerIn && event.isTriggerIn([1, 2])) {
                return startTouchEvent(event);
            }
            event.start();
            return true;
        }
        return false;
    };

    var _VS221_MapPixel_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;

    Game_Player.prototype.vsMapPixelRunOnGridPosition = function(x, y, method) {
        var oldX = this._x;
        var oldY = this._y;
        var oldRealX = this._realX;
        var oldRealY = this._realY;
        this._x = rx(Math.round(Number(x || 0)));
        this._y = ry(Math.round(Number(y || 0)));
        this._realX = this._x;
        this._realY = this._y;
        try {
            method();
        } finally {
            this._x = oldX;
            this._y = oldY;
            this._realX = oldRealX;
            this._realY = oldRealY;
        }
    };

    Game_Player.prototype.checkEventTriggerHere = function(triggers) {
        if (this.vsMapPixelStartBelowEventByBody(triggers, this._x, this._y)) return;
        var touchMode = active(this) && triggers && triggers.indexOf(0) < 0 && (triggers.indexOf(1) >= 0 || triggers.indexOf(2) >= 0);
        if (touchMode) return;
        var x = this.vsMapPixelGridX();
        var y = this.vsMapPixelGridY();
        this.vsMapPixelRunOnGridPosition(x, y, function() {
            _VS221_MapPixel_checkEventTriggerHere.call($gamePlayer, triggers);
        });
    };

    var _VS221_MapPixel_checkEventTriggerTouch = Game_Player.prototype.checkEventTriggerTouch;
    Game_Player.prototype.checkEventTriggerTouch = function(x, y) {
        if (this.vsMapPixelStartBelowEventByBody([1, 2], x, y)) return;
        _VS221_MapPixel_checkEventTriggerTouch.call(this, Math.round(Number(x || 0)), Math.round(Number(y || 0)));
    };

    Game_Player.prototype.checkEventTriggerThere = function(triggers) {
        if (this.vsMapPixelStartEventByInteractionBox(triggers)) return;
        this.vsMapPixelStartEventByGridBackup(triggers);
    };

    function apiEventId() {
        if (VS._scriptEventId > 0) return VS._scriptEventId;
        return $gameMap && $gameMap._interpreter ? $gameMap._interpreter._eventId : 0;
    }
    function apiCurrentCharacter() {
        if (VS._routeCharacter && !VS._routeCharacter._erased) return VS._routeCharacter;
        var id = apiEventId();
        if (id > 0 && $gameMap) return $gameMap.event(id);
        return $gamePlayer || null;
    }
    function byId(id) {
        id = Number(id || 0);
        if (id === -1) return $gamePlayer;
        if (id === 0) return apiCurrentCharacter();
        return id > 0 && $gameMap ? $gameMap.event(id) : null;
    }
    function apiTargetById(id) {
        id = Number(id || 0);
        if (id <= 0) return $gamePlayer || null;
        return $gameMap ? $gameMap.event(id) : null;
    }
    function apiNumber(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }
    function apiRound(value) {
        return Math.round(Number(value || 0) * 1000000) / 1000000;
    }
    function apiMoveUnit(ch) {
        return routeUnit(ch);
    }
    function apiCanMoveTo(ch, x, y, d) {
        if (!active(ch)) return false;
        x = rx(apiRound(x));
        y = ry(apiRound(y));
        return slideCanMoveFrom(ch, ch._x, ch._y, x, y, d);
    }
    function apiCanStep(ch, x, y, d) {
        if (d % 2 !== 0) {
            var h = horz(d), v = vert(d);
            var hx = rx(apiRound(ch._x + dirX(h) * Math.min(Math.abs(dx(x, ch._x)), unitX())));
            var vy = ry(apiRound(ch._y + dirY(v) * Math.min(Math.abs(dy(y, ch._y)), unitY())));
            if (!apiCanMoveTo(ch, hx, ch._y, h)) return false;
            if (!apiCanMoveTo(ch, ch._x, vy, v)) return false;
        }
        return apiCanMoveTo(ch, x, y, d);
    }
    function apiClampMapPosition(ch, x, y) {
        x = apiRound(x);
        y = apiRound(y);
        if (!$gameMap || !ch) return { x: rx(x), y: ry(y) };
        var b = bodyBox(ch, x, y);
        if (b) {
            if ((!$gameMap.isLoopHorizontal || !$gameMap.isLoopHorizontal())) {
                if (b.l < 0) x -= b.l;
                if (b.r > $gameMap.width()) x -= b.r - $gameMap.width();
            }
            if ((!$gameMap.isLoopVertical || !$gameMap.isLoopVertical())) {
                if (b.t < 0) y -= b.t;
                if (b.b > $gameMap.height()) y -= b.b - $gameMap.height();
            }
        }
        return { x: rx(apiRound(x)), y: ry(apiRound(y)) };
    }
    function apiSetPosition(ch, x, y) {
        var p = apiClampMapPosition(ch, x, y);
        ch._x = p.x;
        ch._y = p.y;
    }

    var _VS221_MapPixel_setDestination = Game_Temp.prototype.setDestination;
    Game_Temp.prototype.setDestination = function(x, y) {
        if ($gameMap && $gamePlayer) {
            var p = apiClampMapPosition($gamePlayer, x, y);
            _VS221_MapPixel_setDestination.call(this, p.x, p.y);
        } else {
            _VS221_MapPixel_setDestination.call(this, x, y);
        }
    };
    function apiFinishMove(ch, oldX, oldY, d, keepFace) {
        var oldDir = ch._vsMapPixelApiOldDir || (ch.direction ? ch.direction() : 2);
        ch._realX = oldX;
        ch._realY = oldY;
        ch.setMovementSuccess(true);
        if (d > 0 && !keepFace) ch.setDirection(faceDir(ch, d));
        if (keepFace && ch.setDirection) ch.setDirection(oldDir);
        ch.increaseSteps();
        if (typeof Game_Player !== "undefined" && ch instanceof Game_Player && ch.vsMapPixelStartBelowEventByBody) ch.vsMapPixelStartBelowEventByBody([1, 2], ch._x, ch._y);
        ch._vsMapPixelApiOldDir = null;
    }
    function apiMoveDirection(ch, d, distance, keepFace) {
        if (!active(ch) || d <= 0) return false;
        var sx = dirX(d), sy = dirY(d);
        if (!sx && !sy) return false;
        var oldX = ch._x, oldY = ch._y;
        ch._vsMapPixelApiOldDir = ch.direction ? ch.direction() : 2;
        if (ch.setMovementSuccess) ch.setMovementSuccess(false);
        var leftX = sx ? Math.abs(apiNumber(distance, apiMoveUnit(ch))) : 0;
        var leftY = sy ? Math.abs(apiNumber(distance, apiMoveUnit(ch))) : 0;
        var moved = false;
        var guard = 0;
        while ((leftX > vsEps || leftY > vsEps) && guard < 256) {
            var mx = sx ? Math.min(unitX(), leftX) * sx : 0;
            var my = sy ? Math.min(unitY(), leftY) * sy : 0;
            var tx = rx(apiRound(ch._x + mx));
            var ty = ry(apiRound(ch._y + my));
            if (!apiCanStep(ch, tx, ty, d)) {
                var slide = slidePoint(ch, tx, ty, d);
                if (!slide) {
                    eventTouchPlayer(ch, tx, ty);
                    break;
                }
                tx = slide.x;
                ty = slide.y;
            }
            apiSetPosition(ch, tx, ty);
            if (sx) leftX = Math.max(0, leftX - Math.abs(mx));
            if (sy) leftY = Math.max(0, leftY - Math.abs(my));
            moved = true;
            guard++;
        }
        if (moved) apiFinishMove(ch, oldX, oldY, d, keepFace);
        else {
            if (keepFace && ch.setDirection) ch.setDirection(ch._vsMapPixelApiOldDir || ch.direction());
            ch._vsMapPixelApiOldDir = null;
        }
        return moved;
    }
    function apiDashBool(value, fallback) {
        if (value === undefined || value === null || value === "") return fallback;
        return argBool(value, !!fallback);
    }
    function apiDashLimit(value, fallback, min, max) {
        var n = apiNumber(value, fallback);
        return Math.max(min, Math.min(max, n));
    }
    function apiDashCanMoveTo(ch, x, y, d, data) {
        if (!active(ch)) return false;
        x = rx(apiRound(x));
        y = ry(apiRound(y));
        if (data.throughMap) {
            if (!inMap(bodyBox(ch, x, y))) return false;
        } else {
            if (!passMap(ch, ch._x, ch._y, x, y, d)) return false;
            if (slideBodyBlocked(ch, x, y)) return false;
        }
        return data.throughEvents || passChars(ch, x, y);
    }
    function apiDashCanStep(ch, x, y, d, data) {
        if (d % 2 !== 0) {
            var h = horz(d), v = vert(d);
            var hx = rx(apiRound(ch._x + dirX(h) * Math.min(Math.abs(dx(x, ch._x)), unitX())));
            var vy = ry(apiRound(ch._y + dirY(v) * Math.min(Math.abs(dy(y, ch._y)), unitY())));
            if (!apiDashCanMoveTo(ch, hx, ch._y, h, data)) return false;
            if (!apiDashCanMoveTo(ch, ch._x, vy, v, data)) return false;
        }
        return apiDashCanMoveTo(ch, x, y, d, data);
    }
    function apiDashStep(ch, data) {
        if (!data || data.left <= vsEps || !active(ch)) return false;
        var d = data.d;
        var sx = dirX(d), sy = dirY(d);
        if (!sx && !sy) return false;
        var amount = Math.min(unit(), apiMoveUnit(ch), data.left);
        var tx = rx(apiRound(ch._x + sx * amount));
        var ty = ry(apiRound(ch._y + sy * amount));
        var oldX = ch._x, oldY = ch._y;
        ch._vsMapPixelApiOldDir = ch.direction ? ch.direction() : 2;
        if (ch.setMovementSuccess) ch.setMovementSuccess(false);
        if (!apiDashCanStep(ch, tx, ty, d, data)) {
            if (!data.throughEvents) eventTouchPlayer(ch, tx, ty);
            ch._vsMapPixelApiOldDir = null;
            return false;
        }
        apiSetPosition(ch, tx, ty);
        data.left = Math.max(0, data.left - amount);
        ch._vsMapPixelDashMoveSpeed = data.speed;
        apiFinishMove(ch, oldX, oldY, d, data.keepFace);
        return true;
    }

    Game_CharacterBase.prototype.vsMapPixelUpdateDash = function() {
        var data = this._vsMapPixelDash;
        if (!data) {
            this._vsMapPixelDashMoveSpeed = 0;
            return false;
        }
        if (!active(this)) {
            this._vsMapPixelDash = null;
            this._vsMapPixelDashMoveSpeed = 0;
            return true;
        }
        if (data.done || data.left <= vsEps) {
            if (this.isMoving && this.isMoving()) return true;
            this._vsMapPixelDash = null;
            this._vsMapPixelDashMoveSpeed = 0;
            return true;
        }
        if (this.isJumping && this.isJumping()) return true;
        if (this.isMoving && this.isMoving()) return true;
        if (!apiDashStep(this, data)) {
            this._vsMapPixelDash = null;
            this._vsMapPixelDashMoveSpeed = 0;
            return true;
        }
        if (data.left <= vsEps) data.done = true;
        return true;
    };

    var _VS221_MapPixel_distancePerFrame = Game_CharacterBase.prototype.distancePerFrame;
    Game_CharacterBase.prototype.distancePerFrame = function() {
        var base = _VS221_MapPixel_distancePerFrame.call(this);
        var mx = Math.abs(dx(Number(this._x || 0), Number(this._realX || 0)));
        var my = Math.abs(dy(Number(this._y || 0), Number(this._realY || 0)));
        if (mx > vsEps && my > vsEps) base *= vsDiagonalSpeed;
        var rate = this._vsMapPixelDashMoveSpeed;
        return rate > 0 ? base * rate : base;
    };

    function apiStartDash(ch, d, steps, speed, throughEvents, throughMap, keepFace) {
        if (!ch || d <= 0) return false;
        var s = apiDashLimit(steps, 1, 0.01, 999);
        var rate = apiDashLimit(speed, 3, 0.25, 12);
        var distance = s * apiMoveUnit(ch);
        ch._vsMapPixelMoveToTarget = null;
        ch._vsMapPixelDash = {
            d: d,
            left: distance,
            speed: rate,
            throughEvents: apiDashBool(throughEvents, false),
            throughMap: apiDashBool(throughMap, false),
            keepFace: !!keepFace
        };
        if (ch.vsMapPixelUpdateDash && (!ch.isMoving || !ch.isMoving())) ch.vsMapPixelUpdateDash();
        return true;
    }

    function apiDirectionToPoint(ch, x, y, target) {
        if (!ch || !ch.vsMapPixelBestDirectionTo) return 0;
        var d = ch.vsMapPixelBestDirectionTo(x, y, false, target);
        if (d > 0) return d;
        if (target && ch.vsMapPixelCanSmartFind && ch.vsMapPixelCanSmartFind()) return 0;
        return ch.vsMapPixelDirectionTo ? ch.vsMapPixelDirectionTo(x, y, false) : 0;
    }
    function apiClearFollowNavigation(ch) {
        if (!ch) return;
        ch._vsMapPixelSmartPath = null;
        ch._vsMapPixelSmartWait = 0;
        ch._vsMapPixelSmartForceSearch = 0;
        ch._vsMapPixelSmartWideSearch = false;
        ch._vsMapPixelEdgeSide = 0;
        ch._vsMapPixelEdgeBase = 0;
        ch._vsMapPixelEdgeExpire = 0;
    }
    function apiFollowOptions(options) {
        options = options && typeof options === "object" ? options : {};
        return {
            directFirst: options.directFirst !== false,
            smartAfterBlocked: Math.max(1, Math.min(60, Math.floor(apiNumber(options.smartAfterBlocked, vsFollowSmartAfterBlockedDefault)))),
            smartSearchLimit: Math.max(16, Math.min(vsSmartWideSearchLimit, Math.floor(apiNumber(options.smartSearchLimit, vsFollowSmartSearchLimitDefault))))
        };
    }
    function apiStableFollowDirection(ch, x, y, d) {
        if (!ch || d <= 0 || d % 2 === 0) return d;
        var mx = Math.abs(dx(x, ch._x));
        var my = Math.abs(dy(y, ch._y));
        var ux = unitX();
        var uy = unitY();
        if (mx < ux - vsEps && my < uy - vsEps) return mx >= my ? horz(d) : vert(d);
        if (mx < ux - vsEps) return vert(d);
        if (my < uy - vsEps) return horz(d);
        return d;
    }

    function apiFollowDirectionToPoint(ch, x, y, target, data) {
        if (!data || !data.followTarget || !data.directFirst) return apiDirectionToPoint(ch, x, y, target);
        var frame = smartFrame();
        var cache = ch._vsMapPixelSmartPath;
        if (cache && cache.expire > frame && cache.route && cache.route.length > 0 && cache.targetKey === smartTargetKey(target)) {
            var sx = smartWrapX(smartCellX(ch._x));
            var sy = smartWrapY(smartCellY(ch._y));
            var gx = smartWrapX(smartCellX(x));
            var gy = smartWrapY(smartCellY(y));
            var sameGoal = cache.key === smartRouteKey(gx, gy, target);
            var closeGoal = cache.gx != null && smartCellRange(gx, gy, cache.gx, cache.gy) <= vsSmartFarKeepCells;
            var farTarget = smartDistance(ch._x, ch._y, x, y) >= vsSmartFarKeepDistance;
            if (sameGoal || (closeGoal && farTarget && cache.refresh > frame)) {
                while (cache.route.length > 0 && cache.route[0].x === sx && cache.route[0].y === sy) cache.route.shift();
                if (cache.route.length > 0 && smartRouteValidStep(ch, cache.route[0])) return cache.route[0].d;
            }
            ch._vsMapPixelSmartPath = null;
        }
        var direct = ch.vsMapPixelDirectionTo ? ch.vsMapPixelDirectionTo(x, y, false) : 0;
        direct = apiStableFollowDirection(ch, x, y, direct);
        if (direct > 0 && ch.vsMapPixelNextPoint && ch.vsMapPixelCanMoveTo) {
            var point = ch.vsMapPixelNextPoint(direct);
            if (ch.vsMapPixelCanMoveTo(point.x, point.y, direct)) {
                data.blockedCount = 0;
                apiClearFollowNavigation(ch);
                return direct;
            }
        }
        data.blockedCount = Math.min(data.smartAfterBlocked, Math.max(0, Math.floor(Number(data.blockedCount) || 0)) + 1);
        if (data.blockedCount < data.smartAfterBlocked && ch.vsMapPixelBestDirectionTo) {
            return ch.vsMapPixelBestDirectionTo(x, y, false, target, true);
        }
        return apiDirectionToPoint(ch, x, y, target);
    }
    function apiStartFollowTarget(ch, target, options) {
        if (!ch || !target) return false;
        var targetId = target === $gamePlayer ? 0 : target.eventId ? Number(target.eventId()) : null;
        if (targetId == null || !isFinite(targetId)) return false;
        var config = apiFollowOptions(options);
        var current = ch._vsMapPixelMoveToTarget;
        if (current && current.followTarget && current.targetId === targetId && current.directFirst === config.directFirst && current.smartAfterBlocked === config.smartAfterBlocked && current.smartSearchLimit === config.smartSearchLimit) {
            current.stopped = false;
            current.pauseFrames = 0;
            return true;
        }
        apiClearFollowNavigation(ch);
        ch._vsMapPixelMoveToTarget = {
            x: 0,
            y: 0,
            targetId: targetId,
            stopped: false,
            followTarget: true,
            directFirst: config.directFirst,
            smartAfterBlocked: config.smartAfterBlocked,
            smartSearchLimit: config.smartSearchLimit,
            blockedCount: 0
        };
        if (ch.vsMapPixelUpdateMoveToTarget && (!ch.isMoving || !ch.isMoving())) ch.vsMapPixelUpdateMoveToTarget();
        return true;
    }
    function apiStopFollowTarget(ch) {
        if (!ch || !ch._vsMapPixelMoveToTarget || !ch._vsMapPixelMoveToTarget.followTarget) return false;
        ch._vsMapPixelMoveToTarget = null;
        apiClearFollowNavigation(ch);
        return true;
    }
    function apiStartPointMove(ch, x, y) {
        if (!ch) return;
        var p = apiClampMapPosition(ch, x, y);
        ch._vsMapPixelMoveToTarget = { x: p.x, y: p.y, targetId: null, stopped: false };
        if (ch.vsMapPixelUpdateMoveToTarget && (!ch.isMoving || !ch.isMoving())) ch.vsMapPixelUpdateMoveToTarget();
    }
    function apiStartTargetMove(targetId) {
        var ch = apiCurrentCharacter();
        if (!ch) return;
        ch._vsMapPixelMoveToTarget = { x: 0, y: 0, targetId: Number(targetId || 0), stopped: false };
        if (ch.vsMapPixelUpdateMoveToTarget && (!ch.isMoving || !ch.isMoving())) ch.vsMapPixelUpdateMoveToTarget();
    }
    function apiMoveToTarget(ch, target) {
        if (!ch || !target) return;
        ch._vsMapPixelMoveToTarget = { x: 0, y: 0, targetId: target === $gamePlayer ? 0 : target.eventId ? target.eventId() : null, stopped: false };
        if (ch.vsMapPixelUpdateMoveToTarget && (!ch.isMoving || !ch.isMoving())) ch.vsMapPixelUpdateMoveToTarget();
    }

    function apiStartTileStepCenter(ch) {
        if (!ch || !active(ch)) return;
        var x = rx(Math.round(Number(ch._x || 0)));
        var y = ry(Math.round(Number(ch._y || 0)));
        if (Math.abs(dx(x, ch._x)) <= vsEps && Math.abs(dy(y, ch._y)) <= vsEps) {
            ch._vsMapPixelTileStepCenterHold = false;
            return;
        }
        ch._vsMapPixelTileStepCenterHold = true;
        ch._vsMapPixelDash = null;
        ch._vsMapPixelDashMoveSpeed = 0;
        ch._vsMapPixelMoveToTarget = {
            x: x,
            y: y,
            targetId: null,
            stopped: false,
            centerGrid: true
        };
        if (typeof Game_Player !== "undefined" && ch instanceof Game_Player && $gameTemp && $gameTemp.clearDestination) {
            $gameTemp.clearDestination();
        }
        if (ch.vsMapPixelUpdateMoveToTarget && (!ch.isMoving || !ch.isMoving())) {
            ch.vsMapPixelUpdateMoveToTarget();
        }
    }

    function apiAngleDirection(angle, back) {
        var deg = apiNumber(angle, 0);
        if (back) deg += 180;
        deg = ((deg % 360) + 360) % 360;
        return [8, 9, 6, 3, 2, 1, 4, 7][Math.round(deg / 45) % 8];
    }

    Game_CharacterBase.prototype.vsMapPixelUpdateMoveToTarget = function() {
        var data = this._vsMapPixelMoveToTarget;
        if (!data || !active(this)) return;
        if (data.stopped) {
            if (data.pauseFrames > 0) {
                data.pauseFrames--;
                if (data.pauseFrames <= 0) {
                    data.stopped = false;
                    data.pauseFrames = 0;
                }
            }
            return;
        }
        if (this.isJumping && this.isJumping()) return;
        if (this.isMoving && this.isMoving()) return;
        var target = data.targetId != null ? apiTargetById(data.targetId) : null;
        if (data.followTarget && (!target || target._erased || !active(target))) {
            apiStopFollowTarget(this);
            return;
        }
        var tx = target ? target._x : data.x;
        var ty = target ? target._y : data.y;
        if (tx == null || ty == null) return;
        var mx = dx(tx, this._x);
        var my = dy(ty, this._y);
        if (data.centerGrid) {
            var ax = Math.abs(mx);
            var ay = Math.abs(my);
            if (ax <= vsEps && ay <= vsEps) {
                this._vsMapPixelTileStepCenterHold = false;
                this._vsMapPixelMoveToTarget = null;
                return;
            }
            var dirs = ax >= ay
                ? [mx < 0 ? 4 : 6, my < 0 ? 8 : 2]
                : [my < 0 ? 8 : 2, mx < 0 ? 4 : 6];
            for (var i = 0; i < dirs.length; i++) {
                var centerDir = dirs[i];
                var centerFar = centerDir === 4 || centerDir === 6 ? ax : ay;
                if (centerFar <= vsEps) continue;
                var centerX = centerDir === 4 || centerDir === 6 ? tx : this._x;
                var centerY = centerDir === 2 || centerDir === 8 ? ty : this._y;
                if (!apiCanMoveTo(this, centerX, centerY, centerDir)) continue;
                if (apiMoveDirection(this, centerDir, centerFar, false)) return;
            }
            this._vsMapPixelMoveToTarget = null;
            return;
        }
        var far = Math.max(Math.abs(mx), Math.abs(my));
        if (far <= 0.02) {
            if (!target) this._vsMapPixelMoveToTarget = null;
            return;
        }
        var d = data.followTarget ? apiFollowDirectionToPoint(this, tx, ty, target, data) : apiDirectionToPoint(this, tx, ty, target);
        if (d > 0) apiMoveDirection(this, d, Math.min(apiMoveUnit(this), far), false);
    };

    var _VS221_MapPixel_baseUpdate = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        _VS221_MapPixel_baseUpdate.apply(this, arguments);
        if (!this.vsMapPixelUpdateDash()) this.vsMapPixelUpdateMoveToTarget();
    };

    function apiMoveRouteEndIndex(ch) {
        var route = ch && ch._moveRoute;
        return route && route.list ? Math.max(0, route.list.length - 1) : 0;
    }

    function apiStopMoveRoute(ch) {
        if (!ch || ch !== VS._routeCharacter) return;
        ch._vsMapPixelRouteStopWait = 0;
        if (ch._moveRoute && ch._moveRoute.list) ch._moveRouteIndex = apiMoveRouteEndIndex(ch);
    }

    var _VS221_MapPixel_updateRoutineMove = Game_Character.prototype.updateRoutineMove;
    Game_Character.prototype.updateRoutineMove = function() {
        if (this._vsMapPixelRouteStopWait > 0) {
            this._vsMapPixelRouteStopWait--;
            return;
        }
        _VS221_MapPixel_updateRoutineMove.call(this);
    };

    var _VS221_MapPixel_processMoveCommand = Game_Character.prototype.processMoveCommand;
    Game_Character.prototype.processMoveCommand = function(command) {
        var last = VS._routeCharacter;
        VS._routeCharacter = this;
        try {
            return _VS221_MapPixel_processMoveCommand.call(this, command);
        } finally {
            VS._routeCharacter = last;
        }
    };

    var _VS221_MapPixel_command355 = Game_Interpreter.prototype.command355;
    Game_Interpreter.prototype.command355 = function() {
        var last = VS._scriptEventId;
        VS._scriptEventId = this._eventId || 0;
        try {
            return _VS221_MapPixel_command355.call(this);
        } finally {
            VS._scriptEventId = last;
        }
    };

    var _VS221_MapPixel_command285 = Game_Interpreter.prototype.command285;
    Game_Interpreter.prototype.command285 = function(params) {
        params = params || this._params || [];
        var type = Number(params[1]);
        var locationType = Number(params[2]);
        var isTerrain = type === 0;
        var isRegion = type === 6 || (type === 3 && typeof Utils !== "undefined" && Utils.RPGMAKER_NAME === "MV");
        if (locationType === 2 && vsRegionDetectionMode === "pixel" && $gameVariables) {
            var ch = this.character(Number(params[3]));
            if (ch && isRegion) {
                $gameVariables.setValue(Number(params[0]), vsMapPixelBodyRegionId(ch));
                return true;
            }
            if (ch && isTerrain) {
                $gameVariables.setValue(Number(params[0]), vsMapPixelBodyTerrainTag(ch));
                return true;
            }
        }
        return _VS221_MapPixel_command285.apply(this, arguments);
    };

    function addTileStepCenterTarget(list, ch) {
        if (ch && !ch._erased && list.indexOf(ch) < 0) list.push(ch);
    }

    function allTileStepCenterTargets() {
        var list = [];
        addTileStepCenterTarget(list, $gamePlayer);
        if ($gamePlayer && $gamePlayer.followers) {
            var followers = $gamePlayer.followers();
            var followerList = followers && followers.visibleFollowers ? followers.visibleFollowers() : [];
            for (var i = 0; i < followerList.length; i++) {
                addTileStepCenterTarget(list, followerList[i]);
            }
        }
        var events = $gameMap && $gameMap.events ? $gameMap.events() : [];
        for (var j = 0; j < events.length; j++) {
            addTileStepCenterTarget(list, events[j]);
        }
        var vehicles = vehicleList();
        for (var k = 0; k < vehicles.length; k++) {
            addTileStepCenterTarget(list, vehicles[k]);
        }
        return list;
    }

    function setTileStepTargets(value, targets, currentEventId, center, slidePixels) {
        var data = tileStepData();
        if (!data) return;
        var enabled = argBool(value, false);
        setSlideEdgePixels(slidePixels);
        var centerGrid = enabled && argBool(center, false);
        var text = targets === undefined || targets === null || String(targets).trim() === "" ? "-2" : String(targets);
        var list = text.split(/[\s,]+/).map(function(id) {
            return Number(id);
        }).filter(function(id) {
            return isFinite(id);
        });
        var affectedTargets = [];
        if (list.indexOf(-2) >= 0) {
            data.all = enabled;
            data.player = null;
            data.maps = {};
            affectedTargets = allTileStepCenterTargets();
        } else {
            var mapId = $gameMap && $gameMap.mapId ? Number($gameMap.mapId()) : 0;
            var map = null;
            for (var i = 0; i < list.length; i++) {
                var id = list[i];
                if (id === -1) {
                    data.player = enabled;
                    addTileStepCenterTarget(affectedTargets, $gamePlayer);
                    continue;
                }
                if (id === 0) id = Number(currentEventId || 0);
                if (id <= 0 || mapId <= 0) continue;
                if (!map) {
                    map = data.maps[String(mapId)];
                    if (!map || typeof map !== "object") {
                        map = data.maps[String(mapId)] = {};
                    }
                }
                id = Math.floor(id);
                map[String(id)] = enabled;
                if ($gameMap) addTileStepCenterTarget(affectedTargets, $gameMap.event(id));
            }
        }
        for (var j = 0; j < affectedTargets.length; j++) {
            var target = affectedTargets[j];
            if (centerGrid) apiStartTileStepCenter(target);
            else target._vsMapPixelTileStepCenterHold = false;
        }
    }

    function tileStepCurrentEventId() {
        if (VS._routeCharacter && typeof Game_Event !== "undefined" && VS._routeCharacter instanceof Game_Event) {
            return VS._routeCharacter.eventId ? Number(VS._routeCharacter.eventId()) : Number(VS._routeCharacter._eventId || 0);
        }
        return apiEventId();
    }
    VS.enabled = function() { return true; };
    VS.gridPixelSize = function() { return vsGridPixel; };
    VS.divisions = function() { return divX(); };
    VS.step = function(id) { return routeUnit(id === undefined ? null : byId(id)); };
    VS.tileStepMode = function(id) {
        if (id === undefined) {
            var data = tileStepData();
            return data ? !!data.all : false;
        }
        return tileStepModeFor(byId(id));
    };
    VS.setTileStep = function(v, targets, center, slidePixels) {
        setTileStepTargets(v, targets, tileStepCurrentEventId(), center, slidePixels);
    };
    VS.setTileStepMode = VS.setTileStep;
    VS.snap = function(v) { return snap(v); };
    VS.snapX = function(v) { return snapX(v); };
    VS.snapY = function(v) { return snapY(v); };
    VS.gridVisible = function() { return vsShowGrid; };
    VS.setGridVisible = function(v) { vsShowGrid = !!v; };
    VS.bodyHitboxVisible = function() { return vsShowBodyHitboxes; };
    VS.setBodyHitboxVisible = function(v) { vsShowBodyHitboxes = !!v; };
    VS.interactionHitboxVisible = function() { return vsShowInteractionHitboxes; };
    VS.setInteractionHitboxVisible = function(v) { vsShowInteractionHitboxes = !!v; };
    VS.touchCooldownPersistent = function() { return vsTouchCooldownPersistent; };
    VS.setTouchCooldownPersistent = function(v) { vsTouchCooldownPersistent = !!v; };
    VS.setDestination = function(x, y) { if ($gameTemp) $gameTemp.setDestination(snapX(x), snapY(y)); };
    VS.moveTo = function(a, b, c) {
        if (arguments.length >= 3) return apiStartPointMove(byId(a), b, c);
        if (arguments.length >= 2) return apiStartPointMove(apiCurrentCharacter(), a, b);
        return apiStartTargetMove(a);
    };

    VS.stop = function(frames, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        if (!ch) return;
        var n = Math.max(0, Math.floor(apiNumber(frames, 0)));
        if (n > 0) {
            if (ch._vsMapPixelMoveToTarget) {
                ch._vsMapPixelMoveToTarget.stopped = true;
                ch._vsMapPixelMoveToTarget.pauseFrames = n;
            }
            if (ch === VS._routeCharacter) ch._vsMapPixelRouteStopWait = n;
            return;
        }
        ch._vsMapPixelMoveToTarget = null;
        ch._vsMapPixelRouteStopWait = 0;
        apiStopMoveRoute(ch);
    };

    VS.teleportTo = function(x, y, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        if (!ch) return;
        ch._vsMapPixelMoveToTarget = null;
        ch._vsMapPixelRouteStopWait = 0;
        var p = apiClampMapPosition(ch, Math.round(apiNumber(x, ch._x)), Math.round(apiNumber(y, ch._y)));
        if (ch.locate) ch.locate(Math.round(p.x), Math.round(p.y));
        else if (ch.setPosition) ch.setPosition(Math.round(p.x), Math.round(p.y));
        else apiSetPosition(ch, Math.round(p.x), Math.round(p.y));
    };

    VS.jumpTo = function(x, y, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        if (!ch) return;
        ch._vsMapPixelMoveToTarget = null;
        ch._vsMapPixelRouteStopWait = 0;
        var p = apiClampMapPosition(ch, Math.round(apiNumber(x, ch._x)), Math.round(apiNumber(y, ch._y)));
        var jumpX = apiRound(dx(Math.round(p.x), ch._x));
        var jumpY = apiRound(dy(Math.round(p.y), ch._y));
        if (ch.jump) ch.jump(jumpX, jumpY);
        else apiSetPosition(ch, Math.round(p.x), Math.round(p.y));
    };

    VS.moveTo.stop = VS.stop;
    VS.moveTo.teleportTo = VS.teleportTo;
    VS.moveTo.jumpTo = VS.jumpTo;
    VS.moveAngle = function(steps, angle, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        var distance = Math.max(1, Math.abs(apiNumber(steps, 1))) * apiMoveUnit(ch);
        return apiMoveDirection(ch, apiAngleDirection(angle, false), distance, false);
    };

    VS.backAngle = function(steps, angle, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        var distance = Math.max(1, Math.abs(apiNumber(steps, 1))) * apiMoveUnit(ch);
        return apiMoveDirection(ch, apiAngleDirection(angle, true), distance, true);
    };

    VS.moveByAngle = VS.moveAngle;
    VS.backByAngle = VS.backAngle;
    VS.dashForward = function(steps, speed, throughEvents, throughMap, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        return apiStartDash(ch, ch && ch.direction ? ch.direction() : 2, steps, speed, throughEvents, throughMap, false);
    };

    VS.dashBack = function(steps, speed, throughEvents, throughMap, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        return apiStartDash(ch, ch && ch.direction ? rev(ch.direction()) : 8, steps, speed, throughEvents, throughMap, true);
    };

    VS.dashAngle = function(steps, angle, speed, throughEvents, throughMap, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        return apiStartDash(ch, apiAngleDirection(angle, false), steps, speed, throughEvents, throughMap, false);
    };

    VS.followTarget = function(targetId, options, id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        var target = apiTargetById(targetId);
        return apiStartFollowTarget(ch, target, options);
    };
    VS.stopFollow = function(id) {
        var ch = id != null ? byId(id) : apiCurrentCharacter();
        return apiStopFollowTarget(ch);
    };
    VS.moveTowardPlayer = function(id) {
        var ch = byId(id);
        apiMoveToTarget(ch, $gamePlayer);
    };

    VS.moveAwayFromPlayer = function(id) {
        var ch = byId(id);
        if (ch && ch.vsMapPixelMoveAwayFromPoint) ch.vsMapPixelMoveAwayFromPoint($gamePlayer._x, $gamePlayer._y);
    };

    if (PluginManager.registerCommand) {
        PluginManager.registerCommand(vsPluginName, "SetGridVisible", function(args) {
            VS.setGridVisible(argBool(args.visible, true));
        });
        PluginManager.registerCommand(vsPluginName, "SetBodyHitboxVisible", function(args) {
            VS.setBodyHitboxVisible(argBool(args.visible, true));
        });
        PluginManager.registerCommand(vsPluginName, "SetInteractionHitboxVisible", function(args) {
            VS.setInteractionHitboxVisible(argBool(args.visible, true));
        });
        PluginManager.registerCommand(vsPluginName, "SetTouchCooldownPersistent", function(args) {
            VS.setTouchCooldownPersistent(argBool(args.enabled, false));
        });
        PluginManager.registerCommand(vsPluginName, "SetTileStepMode", function(args) {
            setTileStepTargets(args.enabled, args.targets, this && this._eventId, args.center, args.slidePixels);
        });
    }

    var _VS221_MapPixel_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _VS221_MapPixel_pluginCommand.call(this, command, args);
        if (String(command).toLowerCase() !== "vs221_mappixelmovement") return;
        var sub = String(args[0] || "").toLowerCase();
        if (sub === "showgrid") VS.setGridVisible(argBool(args[1], true));
        if (sub === "showbodyhitbox") VS.setBodyHitboxVisible(argBool(args[1], true));
        if (sub === "showinteractionhitbox") VS.setInteractionHitboxVisible(argBool(args[1], true));
        if (sub === "keeptouchcooldown") VS.setTouchCooldownPersistent(argBool(args[1], false));
        if (sub === "tilestep") {
            var hasSlide = args.length > 4;
            var center = hasSlide ? args[args.length - 2] : args.length > 3 ? args[args.length - 1] : false;
            var slidePixels = hasSlide ? args[args.length - 1] : -1;
            var targets = hasSlide ? args.slice(2, -2).join("") : args.length > 3 ? args.slice(2, -1).join("") : args[2];
            setTileStepTargets(args[1], targets, this._eventId, center, slidePixels);
        }
    };

    Spriteset_Map.prototype.vs221CreateMapPixelGrid = function() {
        this._vs221MapPixelGrid = new PIXI.Graphics();
        this._vs221MapPixelGridState = {};
        if (this._tilemap && this._tilemap.addChild) this._tilemap.addChild(this._vs221MapPixelGrid);
        else this.addChild(this._vs221MapPixelGrid);
        this.vsCreateCollisionHitboxLayer();
    };

    Spriteset_Map.prototype.vsCreateCollisionHitboxLayer = function() {
        if (!vsShowBodyHitboxes && !vsShowInteractionHitboxes) return;
        this._vs221CollisionHitboxLayer = new PIXI.Graphics();
        this._baseSprite.addChild(this._vs221CollisionHitboxLayer);
    };

    Spriteset_Map.prototype.vs221RefreshMapPixelGrid = function() {
        var g = this._vs221MapPixelGrid;
        if (!g || !$gameMap) return;
        g.clear();
        g.visible = !!vsShowGrid;
        if (!vsShowGrid) {
            this._vs221MapPixelGridState = { visible: false };
            return;
        }
        var tw = $gameMap.tileWidth(), th = $gameMap.tileHeight();
        var sx = tw, sy = th;
        var w = Graphics.width, h = Graphics.height;
        var ox = Math.floor($gameMap.displayX() * tw) % sx;
        var oy = Math.floor($gameMap.displayY() * th) % sy;
        if (ox < 0) ox += sx;
        if (oy < 0) oy += sy;
        function drawRegionBlocks() {
            var startX = Math.floor($gameMap.displayX()) - 1;
            var startY = Math.floor($gameMap.displayY()) - 1;
            var endX = Math.ceil($gameMap.displayX() + w / tw) + 1;
            var endY = Math.ceil($gameMap.displayY() + h / th) + 1;
            var ch = $gamePlayer || null;
            for (var yy = startY; yy <= endY; yy++) {
                for (var xx = startX; xx <= endX; xx++) {
                    var mx = rx(xx);
                    var my = ry(yy);
                    if (!$gameMap.isValid(mx, my) || !regionBlockedTile(ch, mx, my)) continue;
                    var px = Math.round($gameMap.adjustX(mx) * tw);
                    var py = Math.round($gameMap.adjustY(my) * th);
                    g.beginFill(0x660000, 0.45);
                    g.drawRect(px, py, tw, th);
                    g.endFill();
                    g.lineStyle(1, 0x220000, 0.9);
                    g.drawRect(px + 0.5, py + 0.5, Math.max(1, tw - 1), Math.max(1, th - 1));
                }
            }
        }
        function drawGrid(width, color, alpha) {
            g.lineStyle(width, color, alpha);
            for (var x = -ox; x <= w + sx; x += sx) {
                var px = Math.round(x) + 0.5;
                g.moveTo(px, 0);
                g.lineTo(px, h);
            }
            for (var y = -oy; y <= h + sy; y += sy) {
                var py = Math.round(y) + 0.5;
                g.moveTo(0, py);
                g.lineTo(w, py);
            }
        }
        drawRegionBlocks();
        drawGrid(2, 0x000000, 0.42);
        drawGrid(1, vsGridColor, 0.7);
        this._vs221MapPixelGridState = { visible: true, dx: $gameMap.displayX(), dy: $gameMap.displayY(), w: w, h: h, tw: tw, th: th, px: tw + "x" + th };
    };

    Spriteset_Map.prototype.vsHitboxEventVisible = function(event) {
        if (!event || event.isThrough()) return false;
        if (event.isTransparent && event.isTransparent()) return false;
        return !event.isNearTheScreen || event.isNearTheScreen();
    };

    Spriteset_Map.prototype.vsHitboxCharacterKey = function(ch) {
        if (!ch) return "";
        var x = ch._realX != null ? ch._realX : ch._x;
        var y = ch._realY != null ? ch._realY : ch._y;
        var d = ch.direction ? ch.direction() : 0;
        var page = ch._pageIndex != null ? ch._pageIndex : 0;
        var hide = ch.isTransparent && ch.isTransparent() ? 1 : 0;
        return Math.round(x * 1000) + "," + Math.round(y * 1000) + "," + d + "," + page + "," + hide;
    };

    Spriteset_Map.prototype.vsHitboxStateKey = function(events, followers, vehicles) {
        var key = [
            vsShowBodyHitboxes ? 1 : 0,
            vsShowInteractionHitboxes ? 1 : 0,
            Math.round($gameMap.displayX() * 1000),
            Math.round($gameMap.displayY() * 1000),
            Graphics.width,
            Graphics.height
        ].join(":");
        if ($gamePlayer) key += "|p:" + this.vsHitboxCharacterKey($gamePlayer);
        for (var i = 0; i < followers.length; i++) {
            key += "|f" + i + ":" + this.vsHitboxCharacterKey(followers[i]);
        }
        for (var j = 0; j < events.length; j++) {
            var event = events[j];
            if (!this.vsHitboxEventVisible(event)) continue;
            key += "|e" + event.eventId() + ":" + this.vsHitboxCharacterKey(event);
        }
        for (var k = 0; k < vehicles.length; k++) {
            key += "|v" + k + ":" + this.vsHitboxCharacterKey(vehicles[k]);
        }
        return key;
    };

    Spriteset_Map.prototype.vsUpdateCollisionHitboxes = function() {
        var g = this._vs221CollisionHitboxLayer;
        if (!g) {
            if (!vsShowBodyHitboxes && !vsShowInteractionHitboxes) return;
            this.vsCreateCollisionHitboxLayer();
            g = this._vs221CollisionHitboxLayer;
            if (!g) return;
        }
        if ((!vsShowBodyHitboxes && !vsShowInteractionHitboxes) || !$gameMap) {
            if (this._vs221CollisionHitboxState !== "off") {
                g.clear();
                this._vs221CollisionHitboxState = "off";
            }
            return;
        }

        var events = $gameMap.events();
        var followers = $gamePlayer && $gamePlayer.followers ? $gamePlayer.followers().visibleFollowers() : [];
        var vehicles = vehicleList();
        var state = this.vsHitboxStateKey(events, followers, vehicles);
        if (this._vs221CollisionHitboxState === state) return;
        this._vs221CollisionHitboxState = state;
        g.clear();
        if (vsShowBodyHitboxes && $gamePlayer) {
            this.vsDrawHitboxRect(g, $gamePlayer, 0xffcc33, $gamePlayer.vsMapPixelBodyBox($gamePlayer._x, $gamePlayer._y));
            for (var i = 0; i < followers.length; i++) {
                var follower = followers[i];
                if (follower) this.vsDrawHitboxRect(g, follower, 0xffcc33, follower.vsMapPixelBodyBox(follower._x, follower._y));
            }
            for (var j = 0; j < events.length; j++) {
                var event = events[j];
                if (!this.vsHitboxEventVisible(event)) continue;
                this.vsDrawHitboxRect(g, event, 0xffcc33, event.vsMapPixelBodyBox(event._x, event._y));
            }
            for (var v = 0; v < vehicles.length; v++) {
                var vehicle = vehicles[v];
                this.vsDrawHitboxRect(g, vehicle, 0xffcc33, vehicle.vsMapPixelBodyBox(vehicle._x, vehicle._y));
            }
        }
        if (vsShowInteractionHitboxes && $gamePlayer) {
            this.vsDrawInteractionSet(g, $gamePlayer, 0x33ccff);
            for (var k = 0; k < events.length; k++) {
                var event2 = events[k];
                if (!this.vsHitboxEventVisible(event2)) continue;
                if (event2.isNormalPriority && !event2.isNormalPriority()) continue;
                this.vsDrawInteractionSet(g, event2, 0x33ff66);
            }
            for (var n = 0; n < vehicles.length; n++) {
                var vehicle2 = vehicles[n];
                this.vsDrawInteractionSet(g, vehicle2, 0x33ff66);
            }
        }
    };

    Spriteset_Map.prototype.vsDrawInteractionSet = function(g, character, color) {
        var dirs = [8, 2, 4, 6];
        for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            this.vsDrawHitboxRect(g, character, color, character.vsMapPixelInteractionBox(character._x, character._y, d), d);
        }
    };

    Spriteset_Map.prototype.vsDrawHitboxRect = function(g, character, color, box, direction) {
        if (!character || !box || !$gameMap) return;
        if (character.isTransparent && character.isTransparent()) return;
        var tw = $gameMap.tileWidth();
        var th = $gameMap.tileHeight();
        var ox = dx(character._realX != null ? character._realX : character._x, character._x);
        var oy = dy(character._realY != null ? character._realY : character._y, character._y);
        var l = box.l + ox;
        var t = box.t + oy;
        var r = box.r + ox;
        var b = box.b + oy;
        var x = Math.round($gameMap.adjustX(l) * tw);
        var y = Math.round($gameMap.adjustY(t) * th);
        var w = Math.max(1, Math.round((r - l) * tw));
        var h = Math.max(1, Math.round((b - t) * th));
        if (x > Graphics.width + 64 || y > Graphics.height + 64 || x + w < -64 || y + h < -64) return;
        g.lineStyle(2, color, 0.9);
        if (box.shape === "circle") {
            var cx = Math.round($gameMap.adjustX(box.cx + ox) * tw);
            var cy = Math.round($gameMap.adjustY(box.cy + oy) * th);
            g.drawCircle(cx, cy, Math.max(1, Math.round(box.radius * tw)));
        } else {
            g.drawRect(x, y, w, h);
        }
        if (direction) this.vsDrawHitboxArrow(g, x, y, w, h, direction, color);
    };

    Spriteset_Map.prototype.vsDrawHitboxArrow = function(g, x, y, w, h, d, color) {
        var cx = x + w / 2;
        var cy = y + h / 2;
        var len = Math.max(5, Math.min(14, Math.max(w, h) * 0.28));
        var head = Math.max(3, len * 0.35);
        var ax = d === 4 ? -1 : d === 6 ? 1 : 0;
        var ay = d === 8 ? -1 : d === 2 ? 1 : 0;
        var sx = ay !== 0 ? 1 : 0;
        var sy = ax !== 0 ? 1 : 0;
        var ex = cx + ax * len;
        var ey = cy + ay * len;
        g.lineStyle(2, color, 0.9);
        g.moveTo(cx - ax * len * 0.35, cy - ay * len * 0.35);
        g.lineTo(ex, ey);
        g.moveTo(ex, ey);
        g.lineTo(ex - ax * head + sx * head, ey - ay * head + sy * head);
        g.moveTo(ex, ey);
        g.lineTo(ex - ax * head - sx * head, ey - ay * head - sy * head);
    };

    Spriteset_Map.prototype.vs221RefreshMapPixelHitboxes = function() {
        this.vsUpdateCollisionHitboxes();
    };

    function needGridRefresh(ss) {
        if (!ss._vs221MapPixelGrid) return false;
        var s = ss._vs221MapPixelGridState || {};
        if (!vsShowGrid) return s.visible !== false || ss._vs221MapPixelGrid.visible !== false;
        return s.visible !== true || s.dx !== $gameMap.displayX() || s.dy !== $gameMap.displayY() || s.w !== Graphics.width || s.h !== Graphics.height || s.tw !== $gameMap.tileWidth() || s.th !== $gameMap.tileHeight() || s.px !== $gameMap.tileWidth() + "x" + $gameMap.tileHeight();
    }

    var _VS221_MapPixel_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _VS221_MapPixel_createLowerLayer.call(this);
        this.vs221CreateMapPixelGrid();
    };

    function vsMapPixelFeetFrame(sprite) {
        if (!sprite || !sprite._character || !sprite.bitmap || !sprite._frame) return null;
        var bitmap = sprite.bitmap;
        if (bitmap.isReady && !bitmap.isReady()) return null;
        var pw = sprite.patternWidth ? Number(sprite.patternWidth()) : Number(sprite._frame.width);
        var ph = sprite.patternHeight ? Number(sprite.patternHeight()) : Number(sprite._frame.height);
        if (!(pw > 0) || !(ph > 0)) return null;
        var caf = sprite._vsCafCfg || null;
        var blockX = caf ? 0 : (sprite.characterBlockX ? Number(sprite.characterBlockX()) || 0 : 0);
        var blockY = caf ? 0 : (sprite.characterBlockY ? Number(sprite.characterBlockY()) || 0 : 0);
        var patternX = caf ? Math.max(0, Math.floor(Number(caf.start) || 0)) : 1;
        var cols = Math.max(1, Math.floor(Number(bitmap.width) / pw));
        if (caf) patternX %= cols;
        var sx = Math.floor((blockX + patternX) * pw);
        var sy = Math.floor(blockY * ph);
        if (sx < 0 || sy < 0 || sx + pw > bitmap.width || sy + ph > bitmap.height) {
            patternX = 0;
            sx = Math.floor((blockX + patternX) * pw);
            sy = Math.floor(blockY * ph);
        }
        var sw = Math.max(1, Math.min(Math.floor(pw), Math.max(0, Number(bitmap.width) - sx)));
        var sh = Math.max(1, Math.min(Math.floor(ph), Math.max(0, Number(bitmap.height) - sy)));
        if (sw <= 0 || sh <= 0) return null;
        return { sx: sx, sy: sy, sw: sw, sh: sh };
    }

    function vsMapPixelFeetScanKey(sprite) {
        if (!sprite || !sprite._character || !sprite.bitmap) return "";
        var ch = sprite._character;
        if (typeof Game_Vehicle !== "undefined" && ch instanceof Game_Vehicle) return "";
        if (sprite._vsCafCfg && ch._vsCafProfile) return "";
        if (sprite._vsCafCfg && sprite._vsCafAnim && sprite._vsCafAnim !== "Default") return "";
        var scan = vsMapPixelFeetFrame(sprite);
        if (!scan) return "";
        var bitmap = sprite.bitmap;
        var name = ch.characterName ? String(ch.characterName() || "") : String(sprite._characterName || "");
        var index = ch.characterIndex ? Number(ch.characterIndex() || 0) : Number(sprite._characterIndex || 0);
        var caf = sprite._vsCafCfg || null;
        return [String(bitmap.url || bitmap._url || ""), name, index, String(sprite._vsCafKey || ""), scan.sx, scan.sy, scan.sw, scan.sh, caf ? Number(caf.offsetX) || 0 : 0, caf ? Number(caf.offsetY) || 0 : 0].join("|");
    }

    function vsMapPixelScanSpriteFeet(sprite) {
        var bitmap = sprite && sprite.bitmap;
        var scan = vsMapPixelFeetFrame(sprite);
        if (!bitmap || !scan) return null;
        var context = bitmap.context || bitmap._context;
        if (!context || !context.getImageData) return null;
        var sx = scan.sx;
        var sy = scan.sy;
        var sw = scan.sw;
        var sh = scan.sh;
        var pixels;
        try {
            pixels = context.getImageData(sx, sy, sw, sh).data;
        } catch (e) {
            return null;
        }
        var minX = sw;
        var maxX = -1;
        var maxY = -1;
        for (var y = 0; y < sh; y++) {
            for (var x = 0; x < sw; x++) {
                if (pixels[(y * sw + x) * 4 + 3] <= 0) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
        if (maxY < 0 || maxX < minX) return { x: 0, y: 0 };
        var footX = (minX + maxX + 1) / 2;
        var footY = maxY + 1;
        var caf = sprite._vsCafCfg || null;
        var drawOffsetX = caf ? Number(caf.offsetX) || 0 : 0;
        var drawOffsetY = caf ? Number(caf.offsetY) || 0 : 0;
        var tw = $gameMap && $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
        var th = $gameMap && $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
        return { x: (footX - sw / 2 + drawOffsetX) / Math.max(1, tw), y: (footY - sh + drawOffsetY) / Math.max(1, th) };
    }

    function vsMapPixelSetFeetOffset(ch, offset) {
        if (!ch) return false;
        var old = ch._vsMapPixelFeetOffset || vsMapPixelZeroFeetOffset;
        var next = offset || vsMapPixelZeroFeetOffset;
        var changed = Math.abs((Number(old.x) || 0) - (Number(next.x) || 0)) > vsEps || Math.abs((Number(old.y) || 0) - (Number(next.y) || 0)) > vsEps;
        try {
            if (Object.prototype.hasOwnProperty.call(ch, "_vsMapPixelFeetOffset")) ch._vsMapPixelFeetOffset = { x: Number(next.x) || 0, y: Number(next.y) || 0 };
            else Object.defineProperty(ch, "_vsMapPixelFeetOffset", { value: { x: Number(next.x) || 0, y: Number(next.y) || 0 }, writable: true, configurable: true, enumerable: false });
        } catch (e) {
            ch._vsMapPixelFeetOffset = { x: Number(next.x) || 0, y: Number(next.y) || 0 };
        }
        return changed;
    }

    Spriteset_Map.prototype.vsUpdateAutoSpriteFeetOffset = function() {
        if (!vsAutoSpriteFeetOffset) return;
        var sprites = this._characterSprites || [];
        var changed = false;
        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            var key = vsMapPixelFeetScanKey(sprite);
            if (!key || sprite._vsMapPixelFeetScanKey === key) continue;
            var offset = vsMapPixelScanSpriteFeet(sprite);
            if (!offset) continue;
            sprite._vsMapPixelFeetScanKey = key;
            if (vsMapPixelSetFeetOffset(sprite._character, offset)) changed = true;
        }
        if (changed) {
            this._vs221CollisionHitboxState = "";
            VS._smartMapStepCache = null;
        }
    };

    function vsMapPixelRenderFeetY(sprite) {
        if (!sprite || !sprite._character || !sprite._character.vsMapPixelFeetOffset) return Number(sprite && sprite.y) || 0;
        var ch = sprite._character;
        var feet = ch.vsMapPixelFeetOffset();
        var fy = feet ? Number(feet.y) || 0 : 0;
        var th = $gameMap && $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
        var y = ch.screenY ? Number(ch.screenY()) : Number(sprite.y);
        if (!isFinite(y)) y = Number(sprite.y) || 0;
        return y + fy * Math.max(1, th);
    }

    if (typeof Tilemap !== "undefined" && Tilemap.prototype._compareChildOrder) {
        var _VS221_MapPixel_compareChildOrder = Tilemap.prototype._compareChildOrder;
        Tilemap.prototype._compareChildOrder = function(a, b) {
            if (!vsAutoSpriteFeetOffset || !a || !b || !a._character || !b._character || a.z !== b.z) {
                return _VS221_MapPixel_compareChildOrder.call(this, a, b);
            }
            var ay = vsMapPixelRenderFeetY(a);
            var by = vsMapPixelRenderFeetY(b);
            if (Math.abs(ay - by) > vsEps) return ay - by;
            return _VS221_MapPixel_compareChildOrder.call(this, a, b);
        };
    }

    var _VS221_MapPixel_spritesetUpdate = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _VS221_MapPixel_spritesetUpdate.call(this);
        this.vsUpdateAutoSpriteFeetOffset();
        if (needGridRefresh(this)) this.vs221RefreshMapPixelGrid();
        this.vsUpdateCollisionHitboxes();
    };
})();