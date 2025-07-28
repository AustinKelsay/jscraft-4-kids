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

The game now uses Three.js for proper 3D rendering with a well-organized codebase:

1. **Core Structure**:
   - `index.html`: Semantic HTML with proper accessibility attributes
   - `script.js`: Modular Three.js implementation with comprehensive CONFIG object
   - `style.css`: Well-organized CSS with responsive design

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
   - Scene graph with named objects and groups
   - Perspective camera with configurable FOV
   - WebGL renderer with shadow mapping and pixel ratio optimization
   - Raycaster for object interaction
   - Dynamic lighting (sun/moon directional lights)
   - Proper resource disposal to prevent memory leaks

### Key Technical Implementation

- **Configuration**: Centralized CONFIG object for all game parameters
- **Error Handling**: Try-catch blocks in critical functions
- **Memory Management**: Proper disposal of Three.js objects
- **Modular UI**: Separated UI creation functions
- **Performance**: Shadow mapping, fog for distance culling, pixel ratio optimization
- **Documentation**: JSDoc comments throughout the codebase

## Code Organization

The script.js file is organized into clear sections:
1. Configuration (CONFIG object)
2. Game State
3. Initialization
4. World Creation
5. Object Creation
6. Input Handling
7. Helper Functions
8. Camera Controls
9. Game Logic
10. Building System
11. UI Elements
12. Animation Loop
13. Cleanup

## Important Notes for Future Development

- All configurable values are in the CONFIG object - avoid magic numbers
- The code is heavily commented for educational purposes
- Three.js is loaded via CDN (version r128) with integrity check
- Maintain simplicity and avoid complex build tools
- Use the helper functions (disposeObject) for proper cleanup
- Follow the established patterns for new features
- Test on different screen sizes (responsive CSS included)