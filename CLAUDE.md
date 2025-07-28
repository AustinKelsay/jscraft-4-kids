# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript educational game project for kids learning 3D first-person game development. The project has evolved from a simple single-file HTML game to a Three.js-based implementation with proper 3D rendering.

## Development Commands

This project has no build process or package.json. Development is straightforward:

- **Run the game**: Simply open `index.html` in a web browser
- **No build/lint/test commands**: This is a pure HTML/CSS/JS educational project with no tooling

## High-Level Architecture

### Current Implementation (Three.js)

The game now uses Three.js for proper 3D rendering (`script.js`):

1. **Core Structure**:
   - `index.html`: Minimal HTML with canvas and Three.js CDN import
   - `script.js`: Full Three.js implementation (894 lines)
   - `style.css`: Basic styling for HTML elements

2. **Game Systems**:
   - **Player System**: First-person camera with position, velocity, and jump mechanics
   - **Input Handling**: 
     - WASD/Arrow keys for movement
     - Mouse look with pointer lock API
     - Space for jump/remove objects
     - B for building, 1-3 for object selection
   - **World Generation**: Procedural placement of trees, rocks, and houses
   - **Building System**: Real-time object placement/removal with ghost preview
   - **Day/Night Cycle**: 2-minute days, 1-minute nights with dynamic lighting
   - **Physics**: Basic gravity and ground collision

3. **Three.js Architecture**:
   - Scene graph with interactable objects group
   - Perspective camera with FOV controls
   - WebGL renderer with shadow mapping
   - Raycaster for object interaction
   - Dynamic lighting (sun/moon directional lights)

### Key Technical Implementation

- **3D Rendering**: Full Three.js scene with proper depth, shadows, and lighting
- **Object Creation**: Procedural generation with random variations
- **Interaction System**: Raycasting for object highlighting and selection
- **Performance**: Shadow mapping, fog for distance culling
- **UI Elements**: Custom HTML overlays for crosshair, compass, and object selector

## Important Notes for Future Development

- The code is heavily commented for educational purposes
- Three.js is loaded via CDN (version r128) - no local dependencies
- Maintain simplicity and avoid complex build tools
- All game logic is contained in script.js for easy understanding
- Consider performance implications when adding new features