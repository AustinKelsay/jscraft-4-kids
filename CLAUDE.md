# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript educational game project designed for kids to learn 3D first-person game development. It's a simple, single-file HTML/JavaScript game with no external dependencies.

## Development Commands

This project has no build process, package.json, or external dependencies. Development is straightforward:

- **Run the game**: Simply open `index.html` in a web browser
- **No build/lint/test commands**: This is a pure HTML/CSS/JS educational project with no tooling

## High-Level Architecture

### Core Structure

1. **Single-file architecture**: The main game logic is embedded in `index.html` (lines 68-426)
2. **Minimal external files**: 
   - `script.js`: Currently empty (placeholder for future code extraction)
   - `style.css`: Contains minimal HTML/body styling

### Game Architecture

The game implements a first-person 3D perspective renderer using Canvas 2D API:

1. **Player System** (lines 89-96): Tracks position, angle, pitch, and movement speed
2. **Input Handling**: 
   - Keyboard controls (lines 99-106, 1016-1187): Movement (WASD/arrows), turning (Q/E), building ('B'), removing (SPACE)
   - Mouse controls (lines 1154-1186): Pointer lock for first-person look with pitch control
   - Object selection (lines 1112-1120): Number keys 1-3 to select buildable types
3. **World Objects** (lines 151-179): Objects with position, size, depth, color, and type (trees, rocks, houses)
4. **3D Rendering Pipeline**:
   - Background rendering with day/night cycle - `drawBackground()` (lines 183-309)
   - Sun and moon rendering with dynamic positioning
   - Object perspective calculation and sorting - `drawWorldObjects()` (lines 326-748)
   - Distance-based scaling and visibility culling
   - Field of view limiting (60 degrees)
   - Pitch-based vertical camera movement
   - Multi-layered object rendering for depth
   - Dynamic lighting based on time of day
5. **Building System** (lines 108-111, 1042-1111):
   - Object targeting system for highlighting interactive objects
   - Space bar to remove targeted objects
   - 'B' key to build selected object type
   - Random variations when building new objects
6. **Day/Night Cycle** (lines 114-148):
   - 2-minute day, 1-minute night cycles
   - Dynamic brightness calculation based on celestial position
   - Sunrise/sunset color transitions
7. **UI Elements**: 
   - Crosshair overlay - `drawCrosshair()` (lines 751-769)
   - Compass with time display - `drawCompass()` (lines 910-956)
   - Object selector UI - `drawObjectSelector()` (lines 772-907)
8. **Game Loop** (lines 996-1013): Standard requestAnimationFrame loop updating player state and rendering

### Key Technical Concepts

- **3D Perspective**: Objects scale based on distance, sorted far-to-near for proper layering
- **Trigonometry**: Used for movement calculations, angle-based positioning, and pitch control
- **Canvas Coordinates**: Full-screen responsive canvas with dynamic resizing
- **Pointer Lock API**: Mouse capture for immersive first-person controls
- **Multi-layer Rendering**: Complex objects built from multiple shapes for depth
- **Dynamic Lighting**: Real-time brightness adjustments based on sun/moon position
- **No External Dependencies**: Pure vanilla JavaScript implementation

## Important Notes for Future Development

- The code is heavily commented to serve as educational material for kids
- Avoid adding complex dependencies or build tools to maintain simplicity
- Any refactoring should preserve the educational clarity of the code
- Consider extracting JavaScript to `script.js` only when the inline code becomes unwieldy