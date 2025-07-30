# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSCraft 3D is an educational Three.js-based first-person exploration game for kids learning web game development. The project uses pure HTML/CSS/JavaScript with no build tools, making it accessible for beginners while demonstrating professional 3D graphics techniques.

## Development Commands

- **Run the game**: Open `index.html` in a web browser
- **No build process**: This is a pure HTML/CSS/JS project with no package.json or build tools
- **No linting/testing**: Educational project focused on simplicity

## High-Level Architecture

### Core Files
- `index.html`: Entry point with Three.js CDN link (r128)
- `script.js`: Main game logic (1900+ lines) with modular organization
- `style.css`: Responsive styling with mobile support

### Game Systems Architecture

1. **Three.js Scene Graph**:
   - Scene → Camera + Renderer + Objects
   - Hierarchical object groups (interactableObjects)
   - Named objects for debugging and management

2. **Player Controller**:
   - Separated yaw/pitch camera rotation to prevent gimbal lock
   - Physics-based movement with gravity and jumping
   - Boundary clamping within world limits

3. **Input System**:
   - Keyboard state tracking (keys object)
   - Pointer Lock API for immersive mouse controls
   - Event-driven architecture with proper cleanup

4. **Building System**:
   - Raycasting for object targeting
   - Ghost preview objects with transparency
   - Dynamic object creation/removal with proper disposal

5. **Rendering Pipeline**:
   - Shadow mapping (PCFSoftShadowMap)
   - Distance fog for performance
   - Pixel ratio optimization for high DPI displays
   - 60 FPS animation loop with delta timing

6. **Animal System**:
   - Autonomous movement with wander behavior
   - Smooth path following with curved trajectories
   - Individual animal properties (speed, wander radius)
   - Idle and walking animations
   - Boundary avoidance with soft edges
   - Clean, simplified animal designs using basic geometries
   - Three animal types: Cow, Pig, Horse

### Key Technical Patterns

- **Configuration-Driven**: All gameplay values in CONFIG object
- **Memory Management**: disposeObject() for Three.js cleanup, separate animals array
- **Error Boundaries**: Try-catch in critical initialization
- **Vector Math**: Three.js Vector3 for all 3D calculations
- **Event Cleanup**: Proper listener removal on window unload
- **Object Pooling**: Separate arrays for static objects and moving animals

### Code Organization

The script.js file follows a clear section structure:
1. Configuration (CONFIG object)
2. Game State (global variables)
3. Initialization
4. World Creation
5. Object Creation (including animals)
6. Input Handling
7. Helper Functions
8. Camera Controls
9. Game Logic (includes animal movement)
10. Building System
11. UI Elements
12. Animation Loop
13. Cleanup