# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSCraft 3D is an educational Three.js-based first-person exploration game for kids learning web game development. The project uses pure HTML/CSS/JavaScript with no build tools, making it accessible for beginners while demonstrating professional 3D graphics techniques.

## Development Commands

- **Run the game**: Open `index.html` in a web browser (no server required)
- **No build process**: Pure HTML/CSS/JS project - `bundle.js` is the pre-bundled version of the modules
- **No package.json**: No npm dependencies or build scripts
- **No linting/testing**: Educational project focused on simplicity

## High-Level Architecture

### Project Structure

The game has two deployment modes:
1. **Direct browser mode**: Uses `bundle.js` (pre-bundled) loaded from `index.html`
2. **Development mode**: ES6 modules in the `modules/` directory for better code organization

### Module Organization

All game logic is split into focused modules:
- `main.js`: Entry point, initialization, and game loop
- `config.js`: Central configuration object (CONFIG) with all game settings
- `gameState.js`: Global state management (scene, camera, renderer, separated object arrays)
- `world.js`: World creation, terrain, skybox, and environment
- `objects.js`: Static objects (trees, rocks, houses) creation
- `animals.js`: Animal entities with autonomous movement (outdoor: cow, pig, horse; indoor: cat, dog)
- `interior.js`: Interior world system for entering/exiting houses with furniture
- `input.js`: Keyboard/mouse event handling and Pointer Lock API
- `camera.js`: Camera rotation and look controls
- `player.js`: Player physics, movement, and collision detection
- `building.js`: Context-aware object placement/removal system with raycasting
- `ui.js`: Dynamic UI elements (crosshair, compass, context-sensitive object selector)
- `dayNight.js`: Sun/moon movement and lighting transitions
- `utils.js`: Helper functions (object disposal, random generation)

### Core Technical Architecture

1. **Three.js Scene Management**:
   - Single Scene with conditional content based on `worldState` (outside/inside)
   - PerspectiveCamera with separated yaw/pitch controls
   - WebGLRenderer with shadow mapping (PCFSoftShadowMap)
   - Raycaster for object interaction and building

2. **Object Management**:
   - Separated arrays for different object types:
     - `worldObjects`: Outdoor static objects (trees, rocks, houses)
     - `interiorObjects`: Indoor furniture (chairs, tables, couches, TVs, beds)
     - `worldAnimals`: Outdoor animals (cows, pigs, horses) with wandering AI
     - `interiorAnimals`: Indoor animals (cats, dogs) with constrained movement
   - `interactableObjects` group for raycast targeting
   - `buildableTypes` and `interiorBuildableTypes` for context-sensitive building
   - Named objects with userData for type identification and behavior

3. **State Management**:
   - `worldState`: 'outside' or 'inside' for world transitions
   - `insideHouse`: Reference to the house being entered
   - `keys`: Keyboard state tracking
   - `player`: Physics state (velocity, canJump, height)
   - `cameraController`: Yaw/pitch rotation state

4. **Rendering Pipeline**:
   - 60 FPS target with requestAnimationFrame
   - Delta time calculations for framerate-independent movement
   - Distance fog for performance optimization
   - Dynamic shadows following sun/moon position

### Key Implementation Patterns

- **Configuration-Driven Design**: All values in CONFIG object for easy tweaking
- **Memory Management**: `disposeObject()` properly cleans up Three.js resources
- **Event-Based Input**: Clean event listener setup/teardown
- **Modular Boundaries**: Each module exports specific functions, maintains encapsulation
- **Performance Optimization**: Separate arrays for static vs. moving objects
- **World Transitions**: Scene clearing and rebuilding for interior/exterior switches
- **Context-Aware Systems**: UI and building mechanics adapt based on location
- **Variable Distance Placement**: Camera pitch affects object placement distance

### Interior System Architecture

The interior system uses a state-based approach:
1. Door interaction via raycasting (green highlight on hover)
2. Click triggers world state change to 'inside'
3. Scene is cleared except persistent elements
4. Interior room is generated with randomly placed furniture
5. Movement boundaries adjusted for interior space
6. UI automatically switches to interior-appropriate items
7. Building system adapts to interior context (furniture and pets)
8. Exit door returns player to original position outside

### Animal System Design

Animals use autonomous behavior patterns:
- **Outdoor Animals** (cows, pigs, horses):
  - Large wander radius within world boundaries
  - Variable movement speeds and idle times
  - Complex geometric construction with detailed features
  - Smooth rotation and curved path movement
- **Indoor Animals** (cats, dogs):
  - Constrained movement within room boundaries
  - Smaller wander radius appropriate for interior spaces
  - Detailed models with ears, tails, and distinct colors
  - Same sophisticated AI as outdoor animals but scaled for indoors
- All animals feature:
  - Random target selection with wait times
  - Smooth path interpolation with drift for natural movement
  - Individual properties (speed, wander radius, idle time)
  - Simple leg animations during movement
  - Boundary detection preventing wall clipping