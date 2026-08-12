# F1 Sim Racing Game

A simple Formula 1 racing simulator in Python using Pygame.

## Controls

- **Left/Right arrows**: steer
- **Up arrow**: accelerate
- **Down arrow**: brake
- **Space**: reset position to center

## Setup

```bash
# Create venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run game
python3 f1_sim.py
```

## Features

- Smooth steering and acceleration physics
- Speed and score tracking
- Wraparound track boundaries
- Minimal dependencies (pygame only)

## Architecture

- Single `f1_sim.py` file with `Player` and `Game` classes
- Game loop at 60 FPS
- Simple physics: velocity, friction, acceleration decay
- Placeholder track (expandable to a real course)

## Future Enhancements

- Real track geometry (bezier curves, turns)
- AI opponents
- Lap timing and checkpoints
- Sound effects
- Better graphics and car models
- Settings menu for difficulty/tuning
