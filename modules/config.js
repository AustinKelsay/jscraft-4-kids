/**
 * Game configuration object containing all adjustable parameters
 * Modify these values to customize gameplay experience
 */
export const CONFIG = {
  // World settings
  world: {
    size: 1000,               // Playable area size
    groundSize: 2000,         // Visual ground plane size
    gridDivisions: 50,        // Grid helper divisions
    fogNear: 100,             // Fog start distance
    fogFar: 500,              // Fog end distance
    objectCount: 50,          // Number of initial objects to spawn
    animalCount: 8,           // Number of initial animals to spawn
    boundaryPadding: 20       // Padding from world edge for spawning
  },
  
  // Player physics and controls
  player: {
    height: 1.7,              // Eye height in meters
    speed: 10,                // Movement speed
    lookSpeed: 0.002,         // Mouse sensitivity
    jumpSpeed: 10,            // Jump velocity
    gravity: 30,              // Gravity strength
    pitchLimit: Math.PI / 2   // Maximum look up/down angle
  },
  
  // Building system
  building: {
    distance: 8,              // Build/interact distance
    highlightColor: 0xffff00, // Object highlight color (yellow)
    ghostOpacity: 0.3         // Preview object transparency
  },
  
  // Day/night cycle
  dayNight: {
    dayDuration: 120,         // Day length in seconds
    nightDuration: 60,        // Night length in seconds
    sunDistance: 150,         // Sun orbit radius
    moonDistance: 150         // Moon orbit radius
  },
  
  // Object properties
  objects: {
    tree: {
      trunkColor: 0x8B4513,   // Brown
      foliageColor: 0x228B22,  // Forest green (fixed from leavesColor)
      minHeight: 4,
      maxHeight: 8,
      minRadius: 2,
      maxRadius: 3,
      foliageLayers: 3        // Number of leaf layers
    },
    rock: {
      color: 0x696969,        // Dim gray
      minSize: 0.5,
      maxSize: 2,
      deformationRange: 0.3   // Vertex noise range
    },
    house: {
      wallColor: 0xD2691E,    // Chocolate
      roofColor: 0x8B4513,    // Saddle brown
      doorColor: 0x654321,    // Dark brown
      windowColor: 0x87CEEB,  // Sky blue
      minSize: 3,
      maxSize: 5,
      windowEmissive: 0.2     // Window glow intensity
    },
    cow: {
      bodyColor: 0x8B4513,    // Brown
      spotColor: 0xFFFFFF,    // White spots
      snoutColor: 0xFFB6C1,   // Pink snout
      hornColor: 0xFFFFF0,    // Ivory horns
      udderColor: 0xFFB6C1,   // Pink udder
      size: 1.5,              // Reduced from 2
      moveSpeed: 2,           // Movement speed
      wanderRadius: 15        // How far they wander
    },
    pig: {
      bodyColor: 0xFFB6C1,    // Light pink
      snoutColor: 0xFF69B4,   // Hot pink snout
      size: 1,                // Reduced from 1.5
      moveSpeed: 3,
      wanderRadius: 10
    },
    horse: {
      bodyColor: 0x654321,    // Dark brown
      maneColor: 0x000000,    // Black mane
      hoofColor: 0x2F4F4F,    // Dark slate gray hooves
      size: 1.8,              // Reduced from 2.5
      moveSpeed: 5,
      wanderRadius: 20
    },
    cat: {
      bodyColor: 0x808080,    // Gray
      size: 0.4,              // Small size
      moveSpeed: 2,
      eyeColor: 0x32CD32      // Lime green eyes
    },
    dog: {
      bodyColor: 0xD2691E,    // Chocolate brown
      size: 0.8,              // Medium size
      moveSpeed: 3,
      earColor: 0x8B4513      // Darker brown ears
    }
  },
  
  // Camera settings
  camera: {
    fov: 75,                  // Field of view
    near: 0.1,                // Near clipping plane
    far: 1000                 // Far clipping plane
  },
  
  // Rendering settings
  renderer: {
    shadowMapSize: 2048,      // Shadow quality
    antialias: true           // Smooth edges
  },
  
  // UI settings
  ui: {
    compassSize: 80,          // Compass diameter in pixels
    selectorItemSize: 60      // Object selector button size
  },
  
  // Interior world settings
  interior: {
    roomSize: 15,             // Interior room dimensions
    ceilingHeight: 3,         // Room height
    floorColor: 0x654321,     // Wood floor
    wallColor: 0xF5F5DC,      // Beige walls
    ceilingColor: 0xFFFFFF,   // White ceiling
    doorHighlightColor: 0x00FF00, // Green door highlight
    boundaryPadding: 2,       // Padding from walls for animal movement
    furniture: {
      chair: {
        seatColor: 0x8B4513,  // Brown seat
        legColor: 0x654321,   // Dark brown legs
        height: 0.8,
        width: 0.5,
        depth: 0.5
      },
      table: {
        topColor: 0x8B4513,   // Brown top
        legColor: 0x654321,   // Dark brown legs
        height: 0.75,
        width: 1.5,
        depth: 0.8
      },
      couch: {
        mainColor: 0x4169E1,  // Royal blue
        cushionColor: 0x6495ED, // Cornflower blue
        length: 2,
        width: 0.8,
        height: 0.7
      },
      tv: {
        frameColor: 0x2F2F2F, // Dark gray frame
        screenColor: 0x000000, // Black screen
        standColor: 0x4F4F4F,  // Gray stand
        width: 1.2,
        height: 0.7,
        depth: 0.1
      },
      bed: {
        frameColor: 0x8B4513,  // Brown frame
        mattressColor: 0xF0E68C, // Khaki mattress
        pillowColor: 0xFFFFFF, // White pillow
        length: 2,
        width: 1.5,
        height: 0.5
      }
    }
  }
};