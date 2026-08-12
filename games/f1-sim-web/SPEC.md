# F1 Racing Simulator - JavaScript Implementation Specification

## Project Overview

A first-person (POV) Formula 1 racing game rendered in JavaScript using Canvas. The game simulates driving an F1 car around a racing circuit from the driver's perspective, similar to racing game classics like early Gran Turismo or arcade racing games.

---

## Game Requirements

### Core Objective
- Player drives a car around a closed-loop racing track
- Experience is first-person from the driver's seat
- Simple, clean graphics suitable for expansion with additional details

### Platform
- Browser-based (Canvas 2D rendering)
- Tested on modern browsers (Chrome, Firefox, Safari, Edge)
- No external 3D libraries required (pure 2D perspective rendering)

---

## Game Mechanics

### 1. Camera System (First-Person POV)

**Camera Position**
- Fixed behind/above the driver's head
- The camera follows the car's position on the racing circuit
- Perspective view: the road converges toward the horizon

**Rendering Technique**
- Road rendered as trapezoids (2D perspective approximation)
- Near clip: ~120px from camera
- Far clip: ~600px from camera (horizon)
- Road narrows as it recedes, creating depth illusion

**Lateral Offset**
- If the car is off-center on the road, the road shifts laterally
- Example: turning right means the road visually shifts left on screen
- This creates intuitive steering feedback without 3D rotation

### 2. Track System

**Track Representation**
- Centerline defined as a series of waypoints (approximately 12-16 points forming a loop)
- Waypoints interpolated smoothly (10+ steps between each pair for curvature)
- Total waypoints result in ~120-160 points for the complete centerline

**Track Geometry**
- Width: fixed at ~80px in world space
- Left boundary: centerline - (width/2)
- Right boundary: centerline + (width/2)
- Track is a closed loop (end connects to start)

**Track Boundaries** (for potential future collision detection)
- Track edges defined as parallel lines offset from centerline
- Can be used for "off-track" detection and penalties

### 3. Player Car Physics

**Velocity & Movement**
- Car moves in a direction based on steering angle and speed
- Speed ranges from 0 to max_speed (400 pixels/second suggested)
- Acceleration: 300 pixels/second² (when UP held)
- Braking: 400 pixels/second² deceleration (when DOWN held)
- Friction: 0.92 multiplier per frame (gradual speed decay when neither accelerating nor braking)

**Steering**
- Steering angle in radians (-π to π)
- Turn rate: 3.0 radians per second
- Smooth steering input: interpolate stick input over 150ms for responsive feel
- Car movement direction = steering angle

**Position Tracking**
- World coordinates (x, y) track car position on the racing circuit
- Closest point on centerline tracked continuously
- Progress along track: index into centerline array (0 to length-1)

### 4. Input Controls

| Input | Action |
|-------|--------|
| **Arrow Up** | Accelerate forward |
| **Arrow Down** | Brake/Decelerate |
| **Arrow Left** | Steer left |
| **Arrow Right** | Steer right |
| **Space** | Reset to start position |
| **ESC** (optional) | Pause game |

---

## Visual Rendering

### HUD Elements

**Speed Display**
- Located: top-left corner
- Format: `{speed_kmh} km/h`
- Conversion: pixels/sec * 0.36 ≈ km/h
- Font: Large (48pt), white color, bold

**Track Progress**
- Located: top-left, below speed
- Format: `Track: {progress_percent}%`
- Calculated: (current_progress_index / total_centerline_points) * 100
- Font: Small (28pt), light gray

**Turn Indicator**
- Located: top-center of screen
- Visual: A red line pointing toward upcoming turn direction
- Direction derived from: upcoming waypoint direction relative to current facing
- Length: 80px max (scales with turn intensity)

**Control Hint** (optional on-screen)
- Located: bottom-right
- Text: "Arrow Keys: Steer/Speed | Space: Reset"
- Font: Small (28pt), light gray

### Road Rendering

**Road Surface**
- Color: Dark gray (#3C3C3C or RGB(60, 60, 60))
- Shape: Trapezoid drawn top-to-bottom
  - Top (near): wider (120px)
  - Bottom (far): narrower (40px)
  - Sides taper inward creating perspective

**Road Boundaries**
- Color: White (#FFFFFF)
- Thickness: 3px
- Both left and right edges drawn
- Extends full depth (near to far)

**Center Line (Dashed)**
- Color: Yellow (#FFFF00)
- Dashing: 30px on, 30px off
- Thickness: 2px
- Drawn from near to horizon

**Road Offset Calculation**
- When car is left of centerline: road visually shifts right
- When car is right of centerline: road visually shifts left
- Lateral shift amount: car's perpendicular distance from centerline (clamped to -60 to +60px)

### Background

**Sky**
- Color: Light blue (#87CEEB or RGB(135, 206, 235))
- Fills top half of screen

**Grass/Ground**
- Color: Dark green (#228B22 or RGB(34, 139, 34))
- Fills bottom half of screen

---

## Game Loop

### Tick Rate
- Target: 60 FPS
- Delta time passed to physics: calculate as `dt = time_since_last_frame / 1000` (seconds)

### Update Order per Frame
1. **Input Poll**: Read keyboard state for all active keys
2. **Steering Update**: Apply smooth steering interpolation
3. **Physics**: 
   - Adjust speed based on acceleration/braking
   - Apply friction to speed decay
   - Update car position based on speed and direction
4. **Track Tracking**: 
   - Find closest point on centerline to current car position
   - Update progress index
5. **Rendering**:
   - Clear canvas
   - Draw POV road
   - Draw HUD
   - Draw turn indicator
   - Swap/flip (canvas renders immediately)

---

## Data Structures

### Track Waypoints (Pseudocode)
```javascript
const waypoints = [
  {x: 600, y: 150},
  {x: 700, y: 150},
  {x: 750, y: 200},
  // ... more points forming a closed loop
];

const centerline = interpolateWaypoints(waypoints, stepsPerSegment);
// Result: array of ~120-160 (x, y) points
```

### Player State
```javascript
const player = {
  x: number,              // world x position
  y: number,              // world y position
  direction: number,      // radians (-π to π)
  speed: number,          // pixels per second
  steerInput: number,     // -1 to 1 (smoothed)
  progress: number,       // index on centerline
  maxSpeed: 400,
  acceleration: 300,
  brakingDecel: 400,
  friction: 0.92,
  turnRate: 3.0           // radians per second
};
```

---

## Collision & Track Boundaries

### Future Enhancement: Off-Track Detection
- Check if car position is >40px away from centerline
- Reduce speed by 50% when off-track
- Display warning indicator
- Optional: reset countdown if too far off-track
- **Not required for initial implementation**

---

## Audio (Optional for Future)
- Engine sound: pitch varies with speed
- Tire squeal: when turning at high speed
- Crash sound: when hitting boundaries
- **Defer to later implementation**

---

## File Structure

```
f1-sim-js/
├── index.html         # Main HTML file with canvas
├── game.js            # Main game loop and state
├── track.js           # Track class and interpolation
├── player.js          # Player car class
├── renderer.js        # Rendering functions (POV, HUD)
├── input.js           # Input handling
├── physics.js         # Physics calculations
└── styles.css         # Basic styling
```

---

## Initial Canvas Setup

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;   // Width
canvas.height = 700;   // Height
```

---

## Implementation Notes

### Perspective Calculation
- Road trapezoid is the core visual element
- Lateral offset is derived from car's perpendicular distance to centerline
- Turn indicator looks ahead to upcoming waypoint for curvature
- No 3D matrix math needed—all 2D canvas drawing

### Performance Considerations
- Centerline lookup can be optimized with spatial hashing (but not necessary for ~150 points)
- Canvas clear + redraw every frame is acceptable for 60 FPS
- No need for WebGL unless adding complex 3D later

### Extensibility
- **Track Detail**: Add visual elements (trees, barriers) at fixed world positions
- **Multiple Cars**: Add AI opponents following track
- **Realistic Physics**: Full velocity vector instead of speed + direction scalar
- **Bump Maps/Shadows**: Add road texture for visual depth
- **Time Trial Mode**: Track best lap times
- **Damage Model**: Visual deformation on crashes

---

## Success Criteria

1. ✅ Game runs at 60 FPS in modern browsers
2. ✅ Car moves forward when UP is held
3. ✅ Car slows down when DOWN is held
4. ✅ Steering (LEFT/RIGHT) changes direction smoothly
5. ✅ Road perspective shifts when car moves off-center
6. ✅ Speed displayed in km/h in top-left
7. ✅ Turn indicator shows upcoming curves
8. ✅ Space bar resets car to start position
9. ✅ Clean, simple graphics (no anti-aliasing artifacts)
10. ✅ Responsive to keyboard input (no lag)

---

## Testing Checklist

- [ ] Can start game and see road
- [ ] UP arrow accelerates smoothly
- [ ] DOWN arrow decelerates smoothly
- [ ] LEFT/RIGHT arrows steer car, road shifts laterally
- [ ] Speed display updates in real-time
- [ ] Car can complete a full lap around track
- [ ] Turning at high speed shows turn indicator
- [ ] Resetting (Space) places car back at start
- [ ] No frame stuttering at 60 FPS
- [ ] Works in Chrome, Firefox, Safari
