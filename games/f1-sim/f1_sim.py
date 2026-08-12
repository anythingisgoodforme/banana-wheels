#!/usr/bin/env python3
"""F1 Racing Simulator - First Person POV view.

Controls:
- Left/Right arrows: steer
- Up arrow: accelerate
- Down arrow: brake
- Space: reset position

This script uses only the `pygame` dependency.
"""
import sys
import os
import math

# Prevent local files from shadowing Python standard library
_saved_sys_path = sys.path.copy()
try:
    cwd = os.path.dirname(os.path.abspath(__file__))
    def is_cwd(p):
        try:
            return os.path.abspath(p) == cwd
        except Exception:
            return False
    sys.path = [p for p in sys.path if p and not is_cwd(p) and p not in ('', '.')]
    import pygame
except ImportError:
    print("pygame not installed — run: pip install -r requirements.txt")
    sys.exit(1)
finally:
    sys.path = _saved_sys_path

# Constants
WIDTH, HEIGHT = 1200, 700
FPS = 60


class Track:
    """Defines the racing circuit path."""
    
    def __init__(self):
        # Track centerline waypoints (defined as (x, y) pairs)
        self.waypoints = [
            (600, 150), (700, 150), (750, 200), (780, 300),
            (750, 400), (650, 450), (550, 450), (450, 400),
            (420, 300), (450, 200), (500, 150), (600, 150)
        ]
        
        # Smooth the waypoints by interpolation
        self.centerline = self._interpolate_waypoints()
        self.track_width = 80  # width of the track in pixels
    
    def _interpolate_waypoints(self, steps=10):
        """Interpolate between waypoints to create a smooth track."""
        smooth = []
        for i in range(len(self.waypoints)):
            p1 = self.waypoints[i]
            p2 = self.waypoints[(i + 1) % len(self.waypoints)]
            
            for j in range(steps):
                t = j / steps
                x = p1[0] * (1 - t) + p2[0] * t
                y = p1[1] * (1 - t) + p2[1] * t
                smooth.append((x, y))
        
        return smooth
    
    def get_closest_point_on_track(self, x, y):
        """Find the closest point on the track centerline."""
        min_dist = float('inf')
        closest_idx = 0
        
        for i, (tx, ty) in enumerate(self.centerline):
            dist = math.sqrt((x - tx)**2 + (y - ty)**2)
            if dist < min_dist:
                min_dist = dist
                closest_idx = i
        
        return closest_idx, self.centerline[closest_idx]
    
    def get_track_direction(self, idx):
        """Get the direction of the track at a given waypoint index."""
        p1 = self.centerline[idx]
        p2 = self.centerline[(idx + 1) % len(self.centerline)]
        
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        return math.atan2(dy, dx)


class Player:
    """Represents the player's car."""
    
    def __init__(self, track):
        self.track = track
        self.progress = 0  # progress along the track (0-1 represents full lap)
        self.position = list(track.centerline[0])
        self.x, self.y = self.position
        self.direction = 0.0  # radians
        
        self.speed = 0.0  # current speed
        self.max_speed = 400.0
        self.acceleration = 300.0
        self.brake_decel = 400.0
        self.turn_rate = 3.0  # radians per second
        self.friction = 0.92
        
        # Steering input (smoothed)
        self.steer_input = 0.0
    
    def update(self, dt, keys):
        """Update player position and state."""
        # Steering input
        steer = 0.0
        if keys[pygame.K_LEFT]:
            steer = -1.0
        if keys[pygame.K_RIGHT]:
            steer = 1.0
        
        # Smooth steering
        self.steer_input += (steer - self.steer_input) * 0.15
        
        # Turn the car
        self.direction += self.steer_input * self.turn_rate * dt
        
        # Acceleration/braking
        if keys[pygame.K_UP]:
            if self.speed < self.max_speed:
                self.speed += self.acceleration * dt
        else:
            self.speed *= self.friction
        
        if keys[pygame.K_DOWN]:
            self.speed -= self.brake_decel * dt
        
        self.speed = max(0, min(self.speed, self.max_speed))
        
        # Move forward in the direction the car is facing
        self.x += math.cos(self.direction) * self.speed * dt
        self.y += math.sin(self.direction) * self.speed * dt
        self.position = [self.x, self.y]
        
        # Find current position on track
        self.progress, _ = self.track.get_closest_point_on_track(self.x, self.y)
    
    def reset(self):
        """Reset to track start."""
        self.x, self.y = self.track.centerline[0]
        self.position = [self.x, self.y]
        self.progress = 0
        self.direction = self.track.get_track_direction(0)
        self.speed = 0.0


class Game:
    """Main game class - renders POV view."""
    
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("F1 Sim - POV Racing")
        self.clock = pygame.time.Clock()
        self.running = True
        
        self.track = Track()
        self.player = Player(self.track)
        
        self.font_small = pygame.font.Font(None, 28)
        self.font_large = pygame.font.Font(None, 48)
    
    def handle_events(self):
        """Handle user input and window events."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    self.player.reset()
    
    def draw_pov_view(self):
        """Draw the first-person POV racing view."""
        # Sky (top half)
        pygame.draw.rect(self.screen, (135, 206, 235), (0, 0, WIDTH, HEIGHT // 2))
        
        # Ground/horizon (bottom half)
        pygame.draw.rect(self.screen, (34, 139, 34), (0, HEIGHT // 2, WIDTH, HEIGHT // 2))
        
        # Get current track segment information
        current_idx = self.player.progress
        center_point = self.track.centerline[current_idx]
        
        # Calculate offset from track center
        dx = self.player.x - center_point[0]
        dy = self.player.y - center_point[1]
        
        # Get track direction at current position
        track_dir = self.track.get_track_direction(current_idx)
        
        # Calculate car offset from center (in track coordinates)
        angle_to_point = math.atan2(dy, dx)
        forward_dir = self.player.direction
        offset_angle = angle_to_point - forward_dir
        lateral_offset = math.sin(offset_angle) * math.sqrt(dx*dx + dy*dy)
        
        # Clamp the lateral offset for visual effect
        lateral_offset = max(-60, min(60, lateral_offset))
        
        # Draw road as perspective trapezoids
        road_color = (60, 60, 60)
        line_near = 120  # distance to near edge
        line_far = 600   # distance to far edge
        
        # Calculate road width perspective
        road_width_near = 120
        road_width_far = 40
        
        # Road polygon (trapezoid)
        road_left_near = WIDTH // 2 - road_width_near // 2 + lateral_offset
        road_right_near = WIDTH // 2 + road_width_near // 2 + lateral_offset
        road_left_far = WIDTH // 2 - road_width_far // 2
        road_right_far = WIDTH // 2 + road_width_far // 2
        
        road_polygon = [
            (road_left_near, HEIGHT - line_near),
            (road_right_near, HEIGHT - line_near),
            (road_right_far, HEIGHT - line_far),
            (road_left_far, HEIGHT - line_far)
        ]
        
        pygame.draw.polygon(self.screen, road_color, road_polygon)
        
        # Draw road edges (white lines)
        pygame.draw.line(self.screen, (255, 255, 255), 
                        (road_left_near, HEIGHT - line_near), 
                        (road_left_far, HEIGHT - line_far), 3)
        pygame.draw.line(self.screen, (255, 255, 255), 
                        (road_right_near, HEIGHT - line_near), 
                        (road_right_far, HEIGHT - line_far), 3)
        
        # Draw road centerline (yellow dashed)
        center_near_x = WIDTH // 2 + lateral_offset
        center_far_x = WIDTH // 2
        
        # Draw several dashes
        for i in range(0, 600, 60):
            start_y = HEIGHT - line_near + (line_far - line_near) * (i / 600)
            end_y = HEIGHT - line_near + (line_far - line_near) * ((i + 30) / 600)
            
            if i % 120 < 60:  # alternate dashes
                start_x = center_near_x + (center_far_x - center_near_x) * (i / 600)
                end_x = center_near_x + (center_far_x - center_near_x) * ((i + 30) / 600)
                pygame.draw.line(self.screen, (255, 255, 0), (start_x, start_y), (end_x, end_y), 2)
        
        # Draw upcoming track (turn indicator)
        # Look ahead to see if track curves
        look_ahead_idx = (self.player.progress + 10) % len(self.track.centerline)
        look_ahead_point = self.track.centerline[look_ahead_idx]
        
        # Simple representation: draw a line showing upcoming direction
        future_offset = math.atan2(look_ahead_point[1] - center_point[1], 
                                  look_ahead_point[0] - center_point[0]) - self.player.direction
        future_lateral = math.sin(future_offset) * 100
        
        turn_direction = max(-80, min(80, future_lateral * 2))
        
        # Draw a simple turn indicator at the center top
        indicator_y = 100
        pygame.draw.line(self.screen, (255, 100, 100), 
                        (WIDTH // 2, indicator_y), 
                        (WIDTH // 2 + turn_direction, indicator_y - 40), 3)
    
    def draw_ui(self):
        """Draw speed and info display."""
        speed_kmh = self.player.speed * 0.36  # rough conversion
        
        # Speed display
        speed_text = self.font_large.render(f"{speed_kmh:.0f} km/h", True, (255, 255, 255))
        self.screen.blit(speed_text, (20, 20))
        
        # Progress display
        lap_progress = (self.player.progress / len(self.track.centerline)) * 100
        progress_text = self.font_small.render(f"Track: {lap_progress:.1f}%", True, (255, 255, 255))
        self.screen.blit(progress_text, (20, 80))
        
        # Controls hint
        hint_text = self.font_small.render("Arrow Keys: Steer/Speed | Space: Reset", True, (200, 200, 200))
        self.screen.blit(hint_text, (WIDTH - 400, HEIGHT - 40))
    
    def update(self, dt):
        """Update game state."""
        keys = pygame.key.get_pressed()
        self.player.update(dt, keys)
    
    def draw(self):
        """Render the game."""
        self.draw_pov_view()
        self.draw_ui()
        pygame.display.flip()
    
    def run(self):
        """Main game loop."""
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0
            self.handle_events()
            self.update(dt)
            self.draw()
        
        pygame.quit()


if __name__ == "__main__":
    game = Game()
    game.run()
