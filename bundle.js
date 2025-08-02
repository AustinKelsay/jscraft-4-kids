(function() {
'use strict';

// ===== Module: config.js =====
/**
 * Game configuration object containing all adjustable parameters
 * Modify these values to customize gameplay experience
 */
const CONFIG = {
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


// ===== Module: gameState.js =====
/**
 * Game state management
 * Contains all global state variables
 */


// Core Three.js objects
let scene, camera, renderer;
let raycaster;
let clock;

// Player state management
const player = {
  velocity: new THREE.Vector3(),
  canJump: true,
  height: CONFIG.player.height
};

// Camera controller for FPS-style movement
const cameraController = {
  yaw: 0,      // Horizontal rotation (Y-axis)
  pitch: 0     // Vertical rotation (X-axis)
};

// Input state tracking
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false
};

const mouseControls = {
  active: false,
  movementX: 0,
  movementY: 0
};

// Building system state
let selectedObjectType = 0;
const buildableTypes = ['fists', 'tree', 'rock', 'house', 'cow', 'pig', 'horse'];
const interiorBuildableTypes = ['fists', 'chair', 'table', 'couch', 'tv', 'bed', 'cat', 'dog'];
let highlightedObject = null;
let ghostObject = null;
let ghostRotation = 0;  // Rotation for ghost preview objects
let lastGhostType = null;  // Track last ghost type to avoid recreation
let lastGhostRotation = 0;  // Track last rotation to detect changes

// World object management
const worldObjects = [];     // Outdoor objects (trees, rocks, houses)
const interiorObjects = [];  // Indoor objects (furniture: tv, chairs, couches, etc.)
const worldAnimals = [];     // Outdoor animals (cows, pigs, horses)
const interiorAnimals = [];  // Indoor animals (cats, dogs)
let interactableObjects;

// Interior world state management
const worldState = {
  isInside: false,                    // Whether player is inside a building
  currentHouse: null,                 // Reference to the house player entered
  outsidePosition: new THREE.Vector3(), // Player position before entering
  outsideRotation: { yaw: 0, pitch: 0 }, // Camera rotation before entering
  interiorGroup: null,                // Group containing all interior objects
  houseInteriors: new Map()           // Map of house UUID to interior data
};

// Lighting and environment
let sunLight, moonLight, ambientLight;
let skyMesh, sunMesh, moonMesh;

// UI element references
const uiElements = {
  crosshair: null,
  compass: null,
  selector: null,
  instructions: null
};

// Setter functions for variables that need to be updated
function setScene(value) { scene = value; }
function setCamera(value) { camera = value; }
function setRenderer(value) { renderer = value; }
function setRaycaster(value) { raycaster = value; }
function setClock(value) { clock = value; }
function setInteractableObjects(value) { interactableObjects = value; }
function setSunLight(value) { sunLight = value; }
function setMoonLight(value) { moonLight = value; }
function setAmbientLight(value) { ambientLight = value; }
function setSkyMesh(value) { skyMesh = value; }
function setSunMesh(value) { sunMesh = value; }
function setMoonMesh(value) { moonMesh = value; }
function setHighlightedObject(value) { highlightedObject = value; }
function setGhostObject(value) { ghostObject = value; }
function setGhostRotation(value) { ghostRotation = value; }
function setSelectedObjectType(value) { selectedObjectType = value; }
function setLastGhostType(value) { lastGhostType = value; }
function setLastGhostRotation(value) { lastGhostRotation = value; }


// ===== Module: utils.js =====
/**
 * Utility functions for the game
 */

/**
 * Properly dispose of Three.js objects to prevent memory leaks
 * @param {THREE.Object3D} object - The object to dispose
 */
function disposeObject(object) {
  if (!object) return;
  
  object.traverse(child => {
    if (child.isMesh) {
      // Dispose geometry
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      // Dispose material(s)
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => {
          // Dispose textures
          for (const prop in material) {
            if (material[prop] && material[prop].isTexture) {
              material[prop].dispose();
            }
          }
          material.dispose();
        });
      }
    }
  });
  
  // Remove from parent
  if (object.parent) {
    object.parent.remove(object);
  }
}

/**
 * Find the parent object with type data
 * @param {THREE.Object3D} mesh - The mesh to search from
 * @returns {THREE.Object3D|null} The parent object with type data
 */
function findParentObject(mesh) {
  let current = mesh;
  while (current && !current.userData.type) {
    current = current.parent;
  }
  return current;
}


// ===== Module: camera.js =====
/**
 * Camera control functions for FPS-style movement
 */


/**
 * Update camera rotation based on current yaw and pitch
 */
function updateCameraRotation() {
  // Apply camera rotation with proper Euler order to prevent tilting
  camera.rotation.order = 'YXZ';
  camera.rotation.y = cameraController.yaw;
  camera.rotation.x = cameraController.pitch;
  camera.rotation.z = 0; // Always ensure no roll
}

/**
 * Apply camera movement with yaw and pitch
 * @param {number} deltaYaw - Horizontal rotation delta
 * @param {number} deltaPitch - Vertical rotation delta
 */
function applyCameraMovement(deltaYaw, deltaPitch) {
  // Update yaw (horizontal rotation)
  cameraController.yaw += deltaYaw;
  
  // Update pitch (vertical rotation) with clamping
  if (deltaPitch !== undefined) {
    cameraController.pitch += deltaPitch;
    cameraController.pitch = THREE.MathUtils.clamp(
      cameraController.pitch, 
      -CONFIG.player.pitchLimit, 
      CONFIG.player.pitchLimit
    );
  }
  
  // Apply the rotation
  updateCameraRotation();
}

/**
 * Get forward direction vector based on camera yaw
 * @returns {THREE.Vector3} Forward direction vector
 */
function getForwardVector() {
  // Get forward direction based on yaw only (for movement)
  return new THREE.Vector3(
    -Math.sin(cameraController.yaw),
    0,
    -Math.cos(cameraController.yaw)
  );
}

/**
 * Get right direction vector based on camera yaw
 * @returns {THREE.Vector3} Right direction vector
 */
function getRightVector() {
  // Get right direction based on yaw only
  return new THREE.Vector3(
    -Math.cos(cameraController.yaw),
    0,
    Math.sin(cameraController.yaw)
  );
}


// ===== Module: worldObjects.js =====
/**
 * World Objects Module
 * 
 * Handles creation and management of outdoor static objects (trees, rocks, houses)
 */


/**
 * Creates a tree at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 */
function createTree(x, z) {
  const tree = new THREE.Group();
  
  // Random variations
  const heightVariation = CONFIG.objects.tree.minHeight + Math.random() * (CONFIG.objects.tree.maxHeight - CONFIG.objects.tree.minHeight);
  const radiusVariation = CONFIG.objects.tree.minRadius + Math.random() * (CONFIG.objects.tree.maxRadius - CONFIG.objects.tree.minRadius);
  const trunkHeight = heightVariation * 0.4;
  const foliageHeight = heightVariation * 0.6;
  
  // Trunk with variation
  const trunkGeometry = new THREE.CylinderGeometry(
    radiusVariation * 0.15, // top radius
    radiusVariation * 0.2,  // bottom radius
    trunkHeight, 
    8
  );
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.trunkColor,
    roughness: 0.8
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);
  
  // Foliage with variation
  const foliageGeometry = new THREE.ConeGeometry(radiusVariation, foliageHeight, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.foliageColor,
    roughness: 0.9
  });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = trunkHeight + foliageHeight / 2;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  tree.add(foliage);
  
  // Add some rotation variation
  tree.rotation.y = Math.random() * Math.PI * 2;
  
  tree.position.set(x, 0, z);
  tree.userData = { type: 'tree', removable: true };
  
  worldObjects.push(tree);
  interactableObjects.add(tree);
  
  return tree;
}

/**
 * Creates a rock at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 */
function createRock(x, z) {
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.rock.color,
    roughness: 0.9
  });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  
  rock.position.set(x, 0.5, z);
  rock.scale.set(
    0.5 + Math.random() * 0.5,
    0.3 + Math.random() * 0.4,
    0.5 + Math.random() * 0.5
  );
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  
  rock.castShadow = true;
  rock.receiveShadow = true;
  rock.userData = { type: 'rock', removable: true };
  
  worldObjects.push(rock);
  interactableObjects.add(rock);
  
  return rock;
}

/**
 * Creates a house at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @param {string} uuid - Optional UUID to preserve during save/load (for interior persistence)
 * @returns {THREE.Group} The created house object
 */
function createHouse(x, z, uuid = null) {
  const house = new THREE.Group();
  
  // Preserve UUID if provided (for save/load persistence)
  if (uuid) {
    house.uuid = uuid;
  }
  
  // Base structure
  const houseGeometry = new THREE.BoxGeometry(6, 4, 6);
  const houseMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.wallColor
  });
  const houseBase = new THREE.Mesh(houseGeometry, houseMaterial);
  houseBase.position.y = 2;
  houseBase.castShadow = true;
  houseBase.receiveShadow = true;
  house.add(houseBase);
  
  // Roof
  const roofGeometry = new THREE.ConeGeometry(5, 3, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.roofColor
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 5.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  house.add(roof);
  
  // Door
  const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.2);
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.doorColor
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 1.25, 3.1);
  door.userData = { 
    type: 'door', 
    parentHouse: house,
    originalMaterial: doorMaterial  // Store for resetting highlight
  };
  door.castShadow = true;
  door.receiveShadow = true;
  house.add(door);
  
  // Window
  const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.windowColor,
    emissive: CONFIG.objects.house.windowColor,
    emissiveIntensity: 0.2
  });
  const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
  window1.position.set(2, 2, 3.05);
  house.add(window1);
  
  const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
  window2.position.set(-2, 2, 3.05);
  house.add(window2);
  
  house.position.set(x, 0, z);
  house.userData = { type: 'house', removable: true };
  
  worldObjects.push(house);
  interactableObjects.add(house);
  
  return house;
}

/**
 * Creates initial world objects
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createInitialWorldObjects(scene) {
  // Create a grid of objects
  for (let i = 0; i < CONFIG.world.objectCount; i++) {
    const x = (Math.random() - 0.5) * CONFIG.world.size * 0.8;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 0.8;
    
    // Random object type
    const type = Math.random();
    
    if (type < 0.4) {
      createTree(x, z);
    } else if (type < 0.7) {
      createRock(x, z);
    } else {
      createHouse(x, z);
    }
  }
}


// ===== Module: worldAnimals.js =====
/**
 * World Animals Module
 * 
 * Handles creation and management of outdoor animals (cows, pigs, horses)
 */


/**
 * Creates a cow at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cow object
 */
function createCow(x, z) {
  const cow = new THREE.Group();
  const size = CONFIG.objects.cow.size;
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(size * 1.5, size * 0.8, size * 0.8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.6;
  body.castShadow = true;
  body.receiveShadow = true;
  cow.add(body);
  
  // Head
  const headGeometry = new THREE.BoxGeometry(size * 0.5, size * 0.5, size * 0.4);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.8, size * 0.6, 0);
  head.castShadow = true;
  cow.add(head);
  
  // Snout
  const snoutGeometry = new THREE.BoxGeometry(size * 0.3, size * 0.25, size * 0.3);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.snoutColor,
    roughness: 0.9
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(size * 1.05, size * 0.5, 0);
  cow.add(snout);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.05, 6, 6);
  const eyeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    roughness: 0.3
  });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.85, size * 0.7, size * 0.15);
  cow.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.85, size * 0.7, -size * 0.15);
  cow.add(eye2);
  
  // Horns
  const hornGeometry = new THREE.CylinderGeometry(size * 0.03, size * 0.05, size * 0.2);
  const hornMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.hornColor,
    roughness: 0.7
  });
  const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn1.position.set(size * 0.7, size * 0.85, size * 0.1);
  horn1.rotation.z = -0.3;
  cow.add(horn1);
  
  const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn2.position.set(size * 0.7, size * 0.85, -size * 0.1);
  horn2.rotation.z = -0.3;
  cow.add(horn2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(size * 0.08, size * 0.08, size * 0.5);
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.bodyColor,
    roughness: 0.8
  });
  const legs = [];
  const legPositions = [
    { x: size * 0.5, z: size * 0.25 },
    { x: size * 0.5, z: -size * 0.25 },
    { x: -size * 0.5, z: size * 0.25 },
    { x: -size * 0.5, z: -size * 0.25 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, size * 0.25, pos.z);
    leg.castShadow = true;
    legs.push(leg);
    cow.add(leg);
  });
  
  // Udder
  const udderGeometry = new THREE.SphereGeometry(size * 0.3, 6, 4);
  const udderMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.udderColor,
    roughness: 0.9
  });
  const udder = new THREE.Mesh(udderGeometry, udderMaterial);
  udder.position.set(-size * 0.2, size * 0.35, 0);
  udder.scale.y = 0.7;
  cow.add(udder);
  
  // Tail
  const tailGeometry = new THREE.CylinderGeometry(size * 0.03, size * 0.05, size * 0.6);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-size * 0.75, size * 0.5, 0);
  tail.rotation.z = Math.PI / 6;
  cow.add(tail);
  
  cow.position.set(x, 0, z);
  cow.userData = { 
    type: 'cow', 
    removable: true,
    isAnimal: true,
    legs: legs,
    moveSpeed: CONFIG.objects.cow.moveSpeed,
    wanderRadius: CONFIG.objects.cow.wanderRadius,
    targetPosition: new THREE.Vector3(x, 0, z),
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  worldAnimals.push(cow);
  interactableObjects.add(cow);
  
  return cow;
}

/**
 * Creates a pig at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created pig object
 */
function createPig(x, z) {
  const pig = new THREE.Group();
  const size = CONFIG.objects.pig.size;
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(size * 1.2, size * 0.6, size * 0.7);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.pig.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.4;
  body.castShadow = true;
  body.receiveShadow = true;
  pig.add(body);
  
  // Head
  const headGeometry = new THREE.BoxGeometry(size * 0.45, size * 0.4, size * 0.4);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.65, size * 0.4, 0);
  head.castShadow = true;
  pig.add(head);
  
  // Snout
  const snoutGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.15, size * 0.15);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.pig.snoutColor,
    roughness: 0.9
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(size * 0.85, size * 0.35, 0);
  snout.rotation.z = Math.PI / 2;
  pig.add(snout);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.04, 6, 6);
  const eyeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    roughness: 0.3
  });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.7, size * 0.5, size * 0.12);
  pig.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.7, size * 0.5, -size * 0.12);
  pig.add(eye2);
  
  // Ears
  const earGeometry = new THREE.ConeGeometry(size * 0.1, size * 0.15, 4);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.55, size * 0.55, size * 0.15);
  ear1.rotation.z = -0.5;
  pig.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.55, size * 0.55, -size * 0.15);
  ear2.rotation.z = -0.5;
  pig.add(ear2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(size * 0.06, size * 0.06, size * 0.3);
  const legs = [];
  const legPositions = [
    { x: size * 0.4, z: size * 0.2 },
    { x: size * 0.4, z: -size * 0.2 },
    { x: -size * 0.4, z: size * 0.2 },
    { x: -size * 0.4, z: -size * 0.2 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.15, pos.z);
    leg.castShadow = true;
    legs.push(leg);
    pig.add(leg);
  });
  
  // Tail (curly)
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.1, 0.1, 0),
    new THREE.Vector3(-0.15, 0.15, 0.1),
    new THREE.Vector3(-0.2, 0.1, 0.15),
    new THREE.Vector3(-0.25, 0, 0.1)
  ]);
  
  const tailGeometry = new THREE.TubeGeometry(tailCurve, 8, size * 0.02, 4, false);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-size * 0.6, size * 0.5, 0);
  pig.add(tail);
  
  pig.position.set(x, 0, z);
  pig.userData = { 
    type: 'pig', 
    removable: true,
    isAnimal: true,
    legs: legs,
    moveSpeed: CONFIG.objects.pig.moveSpeed,
    wanderRadius: CONFIG.objects.pig.wanderRadius,
    targetPosition: new THREE.Vector3(x, 0, z),
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  worldAnimals.push(pig);
  interactableObjects.add(pig);
  
  return pig;
}

/**
 * Creates a horse at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created horse object
 */
function createHorse(x, z) {
  const horse = new THREE.Group();
  const size = CONFIG.objects.horse.size;
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(size * 1.8, size * 0.9, size * 0.7);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.bodyColor,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.9;
  body.castShadow = true;
  body.receiveShadow = true;
  horse.add(body);
  
  // Neck
  const neckGeometry = new THREE.BoxGeometry(size * 0.4, size * 0.8, size * 0.4);
  const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
  neck.position.set(size * 0.8, size * 1.2, 0);
  neck.rotation.z = -0.3;
  neck.castShadow = true;
  horse.add(neck);
  
  // Head
  const headGeometry = new THREE.BoxGeometry(size * 0.5, size * 0.35, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 1.2, size * 1.4, 0);
  head.castShadow = true;
  horse.add(head);
  
  // Mane
  const maneGeometry = new THREE.BoxGeometry(size * 0.1, size * 0.6, size * 0.3);
  const maneMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.maneColor,
    roughness: 0.9
  });
  const mane = new THREE.Mesh(maneGeometry, maneMaterial);
  mane.position.set(size * 0.65, size * 1.4, 0);
  mane.rotation.z = -0.3;
  horse.add(mane);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.05, 6, 6);
  const eyeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    roughness: 0.3
  });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 1.15, size * 1.5, size * 0.12);
  horse.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 1.15, size * 1.5, -size * 0.12);
  horse.add(eye2);
  
  // Ears
  const earGeometry = new THREE.ConeGeometry(size * 0.06, size * 0.12, 4);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 1.1, size * 1.65, size * 0.08);
  ear1.rotation.z = -0.2;
  horse.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 1.1, size * 1.65, -size * 0.08);
  ear2.rotation.z = -0.2;
  horse.add(ear2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(size * 0.08, size * 0.1, size * 0.9);
  const legs = [];
  const legPositions = [
    { x: size * 0.6, z: size * 0.2 },
    { x: size * 0.6, z: -size * 0.2 },
    { x: -size * 0.6, z: size * 0.2 },
    { x: -size * 0.6, z: -size * 0.2 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.45, pos.z);
    leg.castShadow = true;
    legs.push(leg);
    horse.add(leg);
  });
  
  // Hooves
  const hoofGeometry = new THREE.CylinderGeometry(size * 0.09, size * 0.09, size * 0.1);
  const hoofMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.hoofColor,
    roughness: 0.8
  });
  
  legPositions.forEach(pos => {
    const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
    hoof.position.set(pos.x, size * 0.05, pos.z);
    horse.add(hoof);
  });
  
  // Tail
  const tailGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.8, size * 0.1);
  const tail = new THREE.Mesh(tailGeometry, maneMaterial);
  tail.position.set(-size * 0.9, size * 0.7, 0);
  tail.rotation.z = 0.2;
  horse.add(tail);
  
  horse.position.set(x, 0, z);
  horse.userData = { 
    type: 'horse', 
    removable: true,
    isAnimal: true,
    legs: legs,
    moveSpeed: CONFIG.objects.horse.moveSpeed,
    wanderRadius: CONFIG.objects.horse.wanderRadius,
    targetPosition: new THREE.Vector3(x, 0, z),
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  worldAnimals.push(horse);
  interactableObjects.add(horse);
  
  return horse;
}

/**
 * Creates initial animals in the world
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createInitialAnimals(scene) {
  // Create a variety of animals
  for (let i = 0; i < CONFIG.world.animalCount; i++) {
    const x = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
    
    const type = Math.random();
    
    if (type < 0.33) {
      const cow = createCow(x, z);
      scene.add(cow);
    } else if (type < 0.66) {
      const pig = createPig(x, z);
      scene.add(pig);
    } else {
      const horse = createHorse(x, z);
      scene.add(horse);
    }
  }
}


// ===== Module: interiorObjects.js =====
/**
 * Interior Objects Module
 * 
 * Handles creation and management of indoor furniture (chairs, tables, couches, TVs, beds)
 */


/**
 * Creates a chair at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created chair object
 */
function createChair(x = 0, z = 0) {
  const chair = new THREE.Group();
  const config = CONFIG.interior.furniture.chair;
  
  // Seat
  const seatGeometry = new THREE.BoxGeometry(config.width, 0.05, config.depth);
  const seatMaterial = new THREE.MeshStandardMaterial({ 
    color: config.seatColor,
    roughness: 0.7
  });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.y = config.height / 2;
  seat.castShadow = true;
  seat.receiveShadow = true;
  chair.add(seat);
  
  // Backrest
  const backGeometry = new THREE.BoxGeometry(config.width, config.height / 2, 0.05);
  const backrest = new THREE.Mesh(backGeometry, seatMaterial);
  backrest.position.set(0, config.height * 0.75, -config.depth / 2 + 0.025);
  backrest.castShadow = true;
  chair.add(backrest);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, config.height / 2);
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: config.legColor,
    roughness: 0.8
  });
  
  const legPositions = [
    { x: config.width / 2 - 0.05, z: config.depth / 2 - 0.05 },
    { x: -config.width / 2 + 0.05, z: config.depth / 2 - 0.05 },
    { x: config.width / 2 - 0.05, z: -config.depth / 2 + 0.05 },
    { x: -config.width / 2 + 0.05, z: -config.depth / 2 + 0.05 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, config.height / 4, pos.z);
    leg.castShadow = true;
    chair.add(leg);
  });
  
  chair.position.set(x, 0, z);
  chair.userData = { type: 'chair', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(chair);
  } else {
    interactableObjects.add(chair);
    interiorObjects.push(chair); // Only add to array if not in interior group
  }
  
  return chair;
}

/**
 * Creates a table at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created table object
 */
function createTable(x = 0, z = 0) {
  const table = new THREE.Group();
  const config = CONFIG.interior.furniture.table;
  
  // Tabletop
  const topGeometry = new THREE.BoxGeometry(config.width, 0.1, config.depth);
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: config.topColor,
    roughness: 0.6
  });
  const tabletop = new THREE.Mesh(topGeometry, topMaterial);
  tabletop.position.y = config.height;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  table.add(tabletop);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.height);
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: config.legColor,
    roughness: 0.8
  });
  
  const legPositions = [
    { x: config.width / 2 - 0.1, z: config.depth / 2 - 0.1 },
    { x: -config.width / 2 + 0.1, z: config.depth / 2 - 0.1 },
    { x: config.width / 2 - 0.1, z: -config.depth / 2 + 0.1 },
    { x: -config.width / 2 + 0.1, z: -config.depth / 2 + 0.1 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, config.height / 2, pos.z);
    leg.castShadow = true;
    table.add(leg);
  });
  
  table.position.set(x, 0, z);
  table.userData = { type: 'table', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(table);
  } else {
    interactableObjects.add(table);
    interiorObjects.push(table); // Only add to array if not in interior group
  }
  
  return table;
}

/**
 * Creates a couch at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created couch object
 */
function createCouch(x = 0, z = 0) {
  const couch = new THREE.Group();
  const config = CONFIG.interior.furniture.couch;
  
  // Base
  const baseGeometry = new THREE.BoxGeometry(config.length, config.height / 2, config.width);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: config.mainColor,
    roughness: 0.8
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = config.height / 4;
  base.castShadow = true;
  base.receiveShadow = true;
  couch.add(base);
  
  // Backrest
  const backGeometry = new THREE.BoxGeometry(config.length, config.height / 2, 0.2);
  const backrest = new THREE.Mesh(backGeometry, baseMaterial);
  backrest.position.set(0, config.height / 2, -config.width / 2 + 0.1);
  backrest.castShadow = true;
  couch.add(backrest);
  
  // Armrests
  const armGeometry = new THREE.BoxGeometry(0.2, config.height * 0.6, config.width);
  const armrest1 = new THREE.Mesh(armGeometry, baseMaterial);
  armrest1.position.set(config.length / 2 - 0.1, config.height * 0.3, 0);
  armrest1.castShadow = true;
  couch.add(armrest1);
  
  const armrest2 = new THREE.Mesh(armGeometry, baseMaterial);
  armrest2.position.set(-config.length / 2 + 0.1, config.height * 0.3, 0);
  armrest2.castShadow = true;
  couch.add(armrest2);
  
  // Cushions
  const cushionGeometry = new THREE.BoxGeometry(config.length / 3 - 0.1, 0.1, config.width - 0.2);
  const cushionMaterial = new THREE.MeshStandardMaterial({ 
    color: config.cushionColor,
    roughness: 0.9
  });
  
  for (let i = 0; i < 3; i++) {
    const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    cushion.position.set(
      (i - 1) * (config.length / 3),
      config.height / 2 + 0.05,
      0
    );
    couch.add(cushion);
  }
  
  couch.position.set(x, 0, z);
  couch.userData = { type: 'couch', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(couch);
  } else {
    interactableObjects.add(couch);
    interiorObjects.push(couch); // Only add to array if not in interior group
  }
  
  return couch;
}

/**
 * Creates a TV at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created TV object
 */
function createTV(x = 0, z = 0) {
  const tv = new THREE.Group();
  const config = CONFIG.interior.furniture.tv;
  
  // Stand
  const standGeometry = new THREE.BoxGeometry(config.width * 0.8, 0.1, config.depth * 2);
  const standMaterial = new THREE.MeshStandardMaterial({ 
    color: config.standColor,
    roughness: 0.7
  });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.y = 0.5;
  stand.castShadow = true;
  stand.receiveShadow = true;
  tv.add(stand);
  
  // Support pole
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
  const pole = new THREE.Mesh(poleGeometry, standMaterial);
  pole.position.y = 0.75;
  pole.castShadow = true;
  tv.add(pole);
  
  // Screen frame
  const frameGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.3
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = 1 + config.height / 2;
  frame.castShadow = true;
  tv.add(frame);
  
  // Screen
  const screenGeometry = new THREE.BoxGeometry(config.width * 0.95, config.height * 0.9, 0.01);
  const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: config.screenColor,
    roughness: 0.2,
    metalness: 0.5
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1 + config.height / 2, config.depth / 2);
  tv.add(screen);
  
  tv.position.set(x, 0, z);
  tv.userData = { type: 'tv', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(tv);
  } else {
    interactableObjects.add(tv);
    interiorObjects.push(tv); // Only add to array if not in interior group
  }
  
  return tv;
}

/**
 * Creates a bed at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created bed object
 */
function createBed(x = 0, z = 0) {
  const bed = new THREE.Group();
  const config = CONFIG.interior.furniture.bed;
  
  // Frame
  const frameGeometry = new THREE.BoxGeometry(config.width, config.height / 2, config.length);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.8
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = config.height / 4;
  frame.castShadow = true;
  frame.receiveShadow = true;
  bed.add(frame);
  
  // Mattress
  const mattressGeometry = new THREE.BoxGeometry(config.width - 0.1, 0.2, config.length - 0.1);
  const mattressMaterial = new THREE.MeshStandardMaterial({ 
    color: config.mattressColor,
    roughness: 0.9
  });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.y = config.height / 2 + 0.1;
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  bed.add(mattress);
  
  // Headboard
  const headboardGeometry = new THREE.BoxGeometry(config.width, config.height, 0.1);
  const headboard = new THREE.Mesh(headboardGeometry, frameMaterial);
  headboard.position.set(0, config.height / 2, -config.length / 2 + 0.05);
  headboard.castShadow = true;
  bed.add(headboard);
  
  // Pillows
  const pillowGeometry = new THREE.BoxGeometry(config.width / 3, 0.1, 0.3);
  const pillowMaterial = new THREE.MeshStandardMaterial({ 
    color: config.pillowColor,
    roughness: 0.9
  });
  
  const pillow1 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow1.position.set(-config.width / 4, config.height / 2 + 0.25, -config.length / 2 + 0.3);
  bed.add(pillow1);
  
  const pillow2 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow2.position.set(config.width / 4, config.height / 2 + 0.25, -config.length / 2 + 0.3);
  bed.add(pillow2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.height / 2);
  const legPositions = [
    { x: config.width / 2 - 0.1, z: config.length / 2 - 0.1 },
    { x: -config.width / 2 + 0.1, z: config.length / 2 - 0.1 },
    { x: config.width / 2 - 0.1, z: -config.length / 2 + 0.1 },
    { x: -config.width / 2 + 0.1, z: -config.length / 2 + 0.1 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, frameMaterial);
    leg.position.set(pos.x, config.height / 4, pos.z);
    leg.castShadow = true;
    bed.add(leg);
  });
  
  bed.position.set(x, 0, z);
  bed.userData = { type: 'bed', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(bed);
  } else {
    interactableObjects.add(bed);
    interiorObjects.push(bed); // Only add to array if not in interior group
  }
  
  return bed;
}

/**
 * Adds default furniture to the interior room
 */
function addFurnitureToInterior() {
  const roomSize = CONFIG.interior.roomSize;
  
  // Add some chairs
  const chair1 = createChair(-roomSize / 4, roomSize / 4);
  chair1.rotation.y = Math.PI / 4;
  
  const chair2 = createChair(roomSize / 4, roomSize / 4);
  chair2.rotation.y = -Math.PI / 4;
  
  // Add a table
  createTable(0, roomSize / 4);
  
  // Add a couch
  const couch = createCouch(0, -roomSize / 3);
  couch.rotation.y = Math.PI;
  
  // Add a TV
  createTV(0, -roomSize / 2 + 1);
  
  // Add a bed
  const bed = createBed(roomSize / 3, 0);
  bed.rotation.y = Math.PI / 2;
}


// ===== Module: interiorAnimals.js =====
/**
 * Interior Animals Module
 * 
 * Handles creation and management of indoor animals (cats, dogs)
 */


/**
 * Creates a cat at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cat object
 */
function createCat(x, z) {
  const cat = new THREE.Group();
  const size = CONFIG.objects.cat.size;
  
  // Body - sleek and elongated
  const bodyGeometry = new THREE.BoxGeometry(size * 1.0, size * 0.3, size * 0.3);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cat.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.3;
  body.castShadow = true;
  body.receiveShadow = true;
  cat.add(body);
  
  // Head - smaller and rounded
  const headGeometry = new THREE.BoxGeometry(size * 0.35, size * 0.3, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.5, size * 0.35, 0);
  head.castShadow = true;
  cat.add(head);
  
  // Ears - triangular
  const earGeometry = new THREE.ConeGeometry(size * 0.08, size * 0.12, 4);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.45, size * 0.6, size * 0.15);
  cat.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.45, size * 0.6, -size * 0.15);
  cat.add(ear2);
  
  // Eyes - glowing green
  const eyeGeometry = new THREE.SphereGeometry(size * 0.05, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cat.eyeColor,
    emissive: CONFIG.objects.cat.eyeColor,
    emissiveIntensity: 0.5
  });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.65, size * 0.4, size * 0.1);
  cat.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.65, size * 0.4, -size * 0.1);
  cat.add(eye2);
  
  // Tail - curved cylinder
  const tailGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.08, size * 0.8, 4);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-size * 0.5, size * 0.4, 0);
  tail.rotation.z = -Math.PI / 4;
  tail.castShadow = true;
  cat.add(tail);
  
  // Legs - simple cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.05, size * 0.3);
  const legs = [];
  const legPositions = [
    { x: size * 0.3, z: size * 0.15 },
    { x: size * 0.3, z: -size * 0.15 },
    { x: -size * 0.3, z: size * 0.15 },
    { x: -size * 0.3, z: -size * 0.15 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.15, pos.z);
    leg.castShadow = true;
    legs.push(leg);
    cat.add(leg);
  });
  
  cat.position.set(x, 0, z);
  cat.userData = { 
    type: 'cat', 
    removable: true,
    isAnimal: true,
    legs: legs,
    moveSpeed: CONFIG.objects.cat.moveSpeed || 2,
    targetPosition: new THREE.Vector3(x, 0, z),
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0,
    wanderRadius: 5
  };
  
  // Add to scene/group but don't add to interiorAnimals array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(cat);
  } else {
    interactableObjects.add(cat);
    interiorAnimals.push(cat); // Only add to array if not in interior group
  }
  
  return cat;
}

/**
 * Creates a dog at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created dog object
 */
function createDog(x, z) {
  const dog = new THREE.Group();
  const size = CONFIG.objects.dog.size;
  
  // Body - box
  const bodyGeometry = new THREE.BoxGeometry(size * 1.2, size * 0.5, size * 0.4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.dog.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.4;
  body.castShadow = true;
  body.receiveShadow = true;
  dog.add(body);
  
  // Head - box
  const headGeometry = new THREE.BoxGeometry(size * 0.4, size * 0.35, size * 0.35);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.7, size * 0.45, 0);
  head.castShadow = true;
  dog.add(head);
  
  // Snout
  const snoutGeometry = new THREE.BoxGeometry(size * 0.2, size * 0.15, size * 0.2);
  const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
  snout.position.set(size * 0.9, size * 0.35, 0);
  dog.add(snout);
  
  // Ears - floppy
  const earGeometry = new THREE.BoxGeometry(size * 0.1, size * 0.2, size * 0.05);
  const earMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.dog.earColor,
    roughness: 0.9
  });
  const ear1 = new THREE.Mesh(earGeometry, earMaterial);
  ear1.position.set(size * 0.6, size * 0.55, size * 0.2);
  ear1.rotation.z = 0.3;
  dog.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, earMaterial);
  ear2.position.set(size * 0.6, size * 0.55, -size * 0.2);
  ear2.rotation.z = 0.3;
  dog.add(ear2);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.05, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    roughness: 0.3
  });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.75, size * 0.5, size * 0.1);
  dog.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.75, size * 0.5, -size * 0.1);
  dog.add(eye2);
  
  // Tail - wagging
  const tailGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.08, size * 0.4, 4);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-size * 0.6, size * 0.5, 0);
  tail.rotation.z = -Math.PI / 3;
  tail.castShadow = true;
  dog.add(tail);
  
  // Store tail reference for wagging animation
  dog.userData.tail = tail;
  
  // Legs - cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.06, size * 0.06, size * 0.35);
  const legs = [];
  const legPositions = [
    { x: size * 0.4, z: size * 0.15 },
    { x: size * 0.4, z: -size * 0.15 },
    { x: -size * 0.4, z: size * 0.15 },
    { x: -size * 0.4, z: -size * 0.15 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.175, pos.z);
    leg.castShadow = true;
    legs.push(leg);
    dog.add(leg);
  });
  
  dog.position.set(x, 0, z);
  dog.userData = { 
    type: 'dog', 
    removable: true,
    isAnimal: true,
    legs: legs,
    moveSpeed: CONFIG.objects.dog.moveSpeed || 3,
    targetPosition: new THREE.Vector3(x, 0, z),
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0,
    wanderRadius: 6,
    tail: tail
  };
  
  // Add to scene/group but don't add to interiorAnimals array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(dog);
  } else {
    interactableObjects.add(dog);
    interiorAnimals.push(dog); // Only add to array if not in interior group
  }
  
  return dog;
}


// ===== Module: world.js =====
/**
 * World creation and environment functions
 */


/**
 * Create the game world environment
 */
function createWorld() {
  // Create ground plane with procedural variation
  const groundGeometry = new THREE.PlaneGeometry(
    CONFIG.world.groundSize, 
    CONFIG.world.groundSize, 
    100, 
    100
  );
  
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a7d3a,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Add subtle height variation for natural terrain
  const vertices = groundGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 0.2 - 0.1;
  }
  groundGeometry.computeVertexNormals();
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);
  
  // Add grid helper for spatial reference
  const gridHelper = new THREE.GridHelper(
    CONFIG.world.size, 
    CONFIG.world.gridDivisions, 
    0x444444, 
    0x222222
  );
  gridHelper.name = 'gridHelper';
  scene.add(gridHelper);
  
  // Create sky dome
  const skyGeometry = new THREE.SphereGeometry(CONFIG.world.fogFar, 32, 16);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide
  });
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.name = 'sky';
  scene.add(skyMesh);
  setSkyMesh(skyMesh);
  
  // Initialize interactable objects group
  const interactableObjects = new THREE.Group();
  interactableObjects.name = 'interactableObjects';
  scene.add(interactableObjects);
  setInteractableObjects(interactableObjects);
}

/**
 * Create lighting for the scene
 */
function createLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  setAmbientLight(ambientLight);
  
  // Sun light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -50;
  sunLight.shadow.camera.right = 50;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -50;
  sunLight.shadow.camera.near = 0.1;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
  sunLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
  scene.add(sunLight);
  setSunLight(sunLight);
  
  // Moon light (initially disabled)
  const moonLight = new THREE.DirectionalLight(0x6666ff, 0.3);
  moonLight.position.set(-50, 100, -50);
  moonLight.castShadow = true;
  moonLight.shadow.camera.left = -50;
  moonLight.shadow.camera.right = 50;
  moonLight.shadow.camera.top = 50;
  moonLight.shadow.camera.bottom = -50;
  moonLight.shadow.camera.near = 0.1;
  moonLight.shadow.camera.far = 200;
  moonLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
  moonLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
  moonLight.visible = false;
  scene.add(moonLight);
  setMoonLight(moonLight);
  
  // Create sun mesh
  const sunGeometry = new THREE.SphereGeometry(10, 32, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);
  setSunMesh(sunMesh);
  
  // Create moon mesh
  const moonGeometry = new THREE.SphereGeometry(8, 32, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xcccccc
  });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  moonMesh.visible = false;
  scene.add(moonMesh);
  setMoonMesh(moonMesh);
}


// ===== Module: interior.js =====
/**
 * Interior world system and furniture creation
 */


/**
 * Creates an interior room environment
 * @param {THREE.Object3D} house - The house object being entered
 * @param {boolean} skipFurniture - Whether to skip adding default furniture
 */
function createInterior(house, skipFurniture = false) {
  // Create interior group
  worldState.interiorGroup = new THREE.Group();
  worldState.interiorGroup.name = 'interior';
  
  const roomSize = CONFIG.interior.roomSize;
  const height = CONFIG.interior.ceilingHeight;
  
  // Floor
  const floorGeometry = new THREE.BoxGeometry(roomSize, 0.1, roomSize);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.interior.floorColor,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  worldState.interiorGroup.add(floor);
  
  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.interior.wallColor,
    roughness: 0.9
  });
  
  // Back wall
  const backWallGeometry = new THREE.BoxGeometry(roomSize, height, 0.2);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, height / 2, -roomSize / 2);
  backWall.receiveShadow = true;
  worldState.interiorGroup.add(backWall);
  
  // Left wall
  const sideWallGeometry = new THREE.BoxGeometry(0.2, height, roomSize);
  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.set(-roomSize / 2, height / 2, 0);
  leftWall.receiveShadow = true;
  worldState.interiorGroup.add(leftWall);
  
  // Right wall
  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.set(roomSize / 2, height / 2, 0);
  rightWall.receiveShadow = true;
  worldState.interiorGroup.add(rightWall);
  
  // Front wall with door opening
  const frontWallLeftGeometry = new THREE.BoxGeometry(roomSize / 2 - 1, height, 0.2);
  const frontWallLeft = new THREE.Mesh(frontWallLeftGeometry, wallMaterial);
  frontWallLeft.position.set(-roomSize / 4 - 0.5, height / 2, roomSize / 2);
  frontWallLeft.receiveShadow = true;
  worldState.interiorGroup.add(frontWallLeft);
  
  const frontWallRightGeometry = new THREE.BoxGeometry(roomSize / 2 - 1, height, 0.2);
  const frontWallRight = new THREE.Mesh(frontWallRightGeometry, wallMaterial);
  frontWallRight.position.set(roomSize / 4 + 0.5, height / 2, roomSize / 2);
  frontWallRight.receiveShadow = true;
  worldState.interiorGroup.add(frontWallRight);
  
  // Top of door frame
  const doorFrameTopGeometry = new THREE.BoxGeometry(2, height - 2.2, 0.2);
  const doorFrameTop = new THREE.Mesh(doorFrameTopGeometry, wallMaterial);
  doorFrameTop.position.set(0, height - (height - 2.2) / 2, roomSize / 2);
  doorFrameTop.receiveShadow = true;
  worldState.interiorGroup.add(doorFrameTop);
  
  // Ceiling
  const ceilingGeometry = new THREE.BoxGeometry(roomSize, 0.1, roomSize);
  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.interior.ceilingColor,
    roughness: 1
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.position.y = height;
  ceiling.receiveShadow = true;
  worldState.interiorGroup.add(ceiling);
  
  // Exit door (interactive)
  const exitDoorGeometry = new THREE.BoxGeometry(1.8, 2.2, 0.15);
  const exitDoorMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.doorColor
  });
  const exitDoor = new THREE.Mesh(exitDoorGeometry, exitDoorMaterial);
  exitDoor.position.set(0, 1.1, roomSize / 2 - 0.1);
  exitDoor.userData = {
    type: 'door',
    isInteractive: true,
    isExitDoor: true,
    originalMaterial: exitDoorMaterial
  };
  exitDoor.name = 'exitDoor';
  worldState.interiorGroup.add(exitDoor);
  
  // Interior lighting
  const interiorLight = new THREE.PointLight(0xFFFFFF, 0.8, 20);
  interiorLight.position.set(0, height - 0.5, 0);
  interiorLight.castShadow = true;
  interiorLight.shadow.mapSize.width = 1024;
  interiorLight.shadow.mapSize.height = 1024;
  worldState.interiorGroup.add(interiorLight);
  
  // Add furniture only if not loading saved interior
  if (!skipFurniture) {
    addFurnitureToInterior();
    
    // Add some interior animals
    const roomSize = CONFIG.interior.roomSize;
    createCat(-roomSize / 3, -roomSize / 4);
    createDog(roomSize / 4, -roomSize / 4);
  }
  
  // Add the interior to the scene
  scene.add(worldState.interiorGroup);
  
  // Only collect objects if we added default furniture (not when loading saved interior)
  if (!skipFurniture) {
    // Clear the arrays first to avoid duplicates
    interiorObjects.length = 0;
    interiorAnimals.length = 0;
    
    // Store interior objects for cleanup
    worldState.interiorGroup.traverse(child => {
      if (child.userData && child.userData.type) {
        // Add furniture objects
        if (['chair', 'table', 'couch', 'tv', 'bed'].includes(child.userData.type)) {
          interiorObjects.push(child);
        }
        // Add animal objects
        else if (['cat', 'dog'].includes(child.userData.type)) {
          interiorAnimals.push(child);
        }
      }
    });
  }
}


/**
 * Removes the interior and restores the outside world
 */
function removeInterior() {
  if (worldState.interiorGroup) {
    // Remove all interior objects
    interiorObjects.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    scene.remove(worldState.interiorGroup);
    worldState.interiorGroup = null;
    interiorObjects.length = 0; // Clear the array
    
    // Also dispose and clear interior animals
    interiorAnimals.forEach(animal => {
      if (animal.parent) {
        animal.parent.remove(animal);
      }
      disposeObject(animal);
    });
    interiorAnimals.length = 0; // Clear the array
  }
}



// ===== Module: building.js =====
/**
 * Building system for placing and removing objects
 */


/**
 * Build an object at the current build position
 */
function buildObject() {
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Don't build if fists are selected
  if (type === 'fists') return;
  
  const buildPos = getBuildPosition();
  if (buildPos) {
    let newObject = null;
    if (worldState.isInside) {
      // Interior objects
      switch (type) {
        case 'chair':
          newObject = createChair(buildPos.x, buildPos.z);
          break;
        case 'table':
          newObject = createTable(buildPos.x, buildPos.z);
          break;
        case 'couch':
          newObject = createCouch(buildPos.x, buildPos.z);
          break;
        case 'tv':
          newObject = createTV(buildPos.x, buildPos.z);
          break;
        case 'bed':
          newObject = createBed(buildPos.x, buildPos.z);
          break;
        case 'cat':
          newObject = createCat(buildPos.x, buildPos.z);
          break;
        case 'dog':
          newObject = createDog(buildPos.x, buildPos.z);
          break;
      }
    } else {
      // Exterior objects
      switch (type) {
        case 'tree':
          newObject = createTree(buildPos.x, buildPos.z);
          break;
        case 'rock':
          newObject = createRock(buildPos.x, buildPos.z);
          break;
        case 'house':
          newObject = createHouse(buildPos.x, buildPos.z);
          break;
        case 'cow':
          newObject = createCow(buildPos.x, buildPos.z);
          break;
        case 'pig':
          newObject = createPig(buildPos.x, buildPos.z);
          break;
        case 'horse':
          newObject = createHorse(buildPos.x, buildPos.z);
          break;
      }
    }
    // Apply rotation to the newly created object
    if (newObject) {
      newObject.rotation.y = ghostRotation;
    }
  }
}

/**
 * Remove the currently highlighted object from the world
 */
function removeObject() {
  if (!highlightedObject || !highlightedObject.userData.removable) {
    return;
  }
  
  try {
    // Remove from scene
    interactableObjects.remove(highlightedObject);
    
    if (worldState.isInside) {
      // Remove from interior objects array
      const index = interiorObjects.indexOf(highlightedObject);
      if (index > -1) {
        interiorObjects.splice(index, 1);
      }
      
      // Remove from interior animals if it's an animal
      const animalTypes = ['cat', 'dog'];
      if (animalTypes.includes(highlightedObject.userData.type)) {
        const animalIndex = interiorAnimals.indexOf(highlightedObject);
        if (animalIndex > -1) {
          interiorAnimals.splice(animalIndex, 1);
        }
      }
    } else {
      // Remove from world objects array
      const index = worldObjects.indexOf(highlightedObject);
      if (index > -1) {
        worldObjects.splice(index, 1);
      }
      
      // Remove from world animals if it's an animal
      const animalTypes = ['cow', 'pig', 'horse'];
      if (animalTypes.includes(highlightedObject.userData.type)) {
        const animalIndex = worldAnimals.indexOf(highlightedObject);
        if (animalIndex > -1) {
          worldAnimals.splice(animalIndex, 1);
        }
      }
    }
    
    // Dispose of object resources
    disposeObject(highlightedObject);
    
    // Clear reference
    setHighlightedObject(null);
    
  } catch (error) {
    console.error('Failed to remove object:', error);
  }
}

/**
 * Get the position where an object should be built
 * @returns {THREE.Vector3|null} Build position or null
 */
function getBuildPosition() {
  // Get forward direction for building placement
  const forward = getForwardVector();
  
  // Variable distance based on camera pitch (looking down = closer, looking up = farther)
  const pitchFactor = 1 - (camera.rotation.x / (Math.PI / 2)); // 0 when looking down, 2 when looking up
  const baseDistance = worldState.isInside ? CONFIG.building.distance * 0.5 : CONFIG.building.distance;
  const distance = baseDistance * (0.5 + pitchFactor * 0.5);
  
  const buildPos = camera.position.clone();
  buildPos.add(forward.multiplyScalar(distance));
  buildPos.y = 0;
  
  // Ensure build position is within room bounds when inside
  if (worldState.isInside) {
    const roomHalfSize = CONFIG.interior.roomSize / 2 - 1; // Leave some padding
    buildPos.x = Math.max(-roomHalfSize, Math.min(roomHalfSize, buildPos.x));
    buildPos.z = Math.max(-roomHalfSize, Math.min(roomHalfSize, buildPos.z));
  }
  
  return buildPos;
}

/**
 * Update object highlighting and ghost preview
 */
function updateObjectHighlight() {
  // Cast ray from camera center
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  // Include both world and interior objects
  const objectsToCheck = worldState.isInside ? 
    [worldState.interiorGroup] : 
    interactableObjects.children;
  
  // Use recursive=true to check all children (including doors on houses)
  const intersects = raycaster.intersectObjects(objectsToCheck, true);
  
  // Reset previous highlight
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    setHighlightedObject(null);
  }
  
  // Highlight new object if within range
  if (intersects.length > 0) {
    const distance = intersects[0].distance;
    const hitObject = intersects[0].object;
    
    // First check if we hit a door directly
    if (hitObject.userData && hitObject.userData.type === 'door' && distance < CONFIG.building.distance) {
      // Check if it's an exterior door (when outside) or interior door (when inside)
      if (!worldState.isInside || (worldState.isInside && hitObject.userData.isInteractive)) {
        setHighlightedObject(hitObject);
        highlightDoor(hitObject);
        return;
      }
    }
    
    // If not a door, find the top-level parent object (house, tree, etc.)
    let parentObject = hitObject;
    while (parentObject.parent && parentObject.parent.name !== 'interactableObjects' && parentObject.parent.name !== 'interior') {
      parentObject = parentObject.parent;
    }
    
    // Check if the parent is removable
    if (parentObject && parentObject.userData && parentObject.userData.removable && distance < CONFIG.building.distance) {
      setHighlightedObject(parentObject);
      highlightObject(parentObject);
    }
  }
  
  // Update ghost object for building preview
  updateGhostObject();
}

/**
 * Highlight an object with emissive color
 * @param {THREE.Object3D} object - Object to highlight
 */
function highlightObject(object) {
  object.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.emissive = new THREE.Color(CONFIG.building.highlightColor);
      child.material.emissiveIntensity = 0.3;
    }
  });
}

/**
 * Reset object highlighting
 * @param {THREE.Object3D} object - Object to reset
 */
function resetObjectHighlight(object) {
  // Check if it's a door
  if (object.userData && object.userData.type === 'door') {
    // Reset door material emissive properties
    if (object.material) {
      // Clone the material if it hasn't been cloned yet
      if (!object.material.isClone) {
        object.material = object.material.clone();
        object.material.isClone = true;
      }
      object.material.emissive = new THREE.Color(0x000000);
      object.material.emissiveIntensity = 0;
    }
  } else {
    // Regular object highlight reset
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // Clone the material if it hasn't been cloned yet
        if (!child.material.isClone) {
          child.material = child.material.clone();
          child.material.isClone = true;
        }
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
      }
    });
  }
}

/**
 * Highlights an interactive door with green color
 * @param {THREE.Mesh} door - The door mesh to highlight
 */
function highlightDoor(door) {
  if (door.isMesh && door.material) {
    // Clone the material if it hasn't been cloned yet
    if (!door.material.isClone) {
      door.material = door.material.clone();
      door.material.isClone = true;
    }
    door.material.emissive = new THREE.Color(CONFIG.interior.doorHighlightColor);
    door.material.emissiveIntensity = 0.4;
  }
}

/**
 * Update the ghost preview object for building
 */
function updateGhostObject() {
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Remove ghost if fists selected
  if (type === 'fists') {
    if (ghostObject) {
      disposeObject(ghostObject);
      setGhostObject(null);
      setLastGhostType(null);
      setLastGhostRotation(0);
    }
    return;
  }
  
  // Check if we need to recreate the ghost (type changed or rotation changed)
  const needsRecreation = !ghostObject || type !== lastGhostType || ghostRotation !== lastGhostRotation;
  
  // Get build position
  const buildPos = getBuildPosition();
  if (!buildPos) {
    if (ghostObject) {
      disposeObject(ghostObject);
      setGhostObject(null);
    }
    return;
  }
  
  // Update position if ghost exists and doesn't need recreation
  if (ghostObject && !needsRecreation) {
    ghostObject.position.copy(buildPos);
    return;
  }
  
  // Remove existing ghost if recreating
  if (ghostObject) {
    disposeObject(ghostObject);
    setGhostObject(null);
  }
  
  // Create new ghost for building preview
  if (buildPos) {
    // Create a detailed ghost object with direction indicator
    const ghostGroup = new THREE.Group();
    const ghostMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: CONFIG.building.ghostOpacity,
      depthWrite: false
    });
    
    switch (type) {
      case 'tree':
        // Tree with directional lean
        const treeGhost = new THREE.Mesh(
          new THREE.ConeGeometry(2, 6, 8),
          ghostMaterial.clone()
        );
        treeGhost.material.color.set(0x00ff00);
        treeGhost.position.y = 3;
        ghostGroup.add(treeGhost);
        
        // Add a small branch to show direction
        const branchGhost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 1.5),
          ghostMaterial.clone()
        );
        branchGhost.material.color.set(0x8B4513);
        branchGhost.position.set(0.8, 2, 0);
        branchGhost.rotation.z = -Math.PI / 6;
        ghostGroup.add(branchGhost);
        break;
        
      case 'rock':
        // Rock with directional marking
        const rockGhost = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 6, 5),
          ghostMaterial.clone()
        );
        rockGhost.material.color.set(0x888888);
        rockGhost.scale.set(1.1, 0.8, 1.1);
        rockGhost.position.y = 0.5;
        ghostGroup.add(rockGhost);
        
        // Add small crystal to show front
        const crystalGhost = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.5, 4),
          ghostMaterial.clone()
        );
        crystalGhost.material.color.set(0xaaaaff);
        crystalGhost.position.set(0.8, 0.7, 0);
        crystalGhost.rotation.z = -Math.PI / 6;
        ghostGroup.add(crystalGhost);
        break;
        
      case 'house':
        // House with door to show front
        const houseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 4),
          ghostMaterial.clone()
        );
        houseGhost.material.color.set(0xffaa00);
        houseGhost.position.y = 1.5;
        ghostGroup.add(houseGhost);
        
        // Add door to show front
        const doorGhost = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1.6, 0.1),
          ghostMaterial.clone()
        );
        doorGhost.material.color.set(0x654321);
        doorGhost.position.set(0, 0.8, 2.05);
        ghostGroup.add(doorGhost);
        break;
        
      case 'cow':
        // Cow body
        const cowBody = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.05, 1.2),
          ghostMaterial.clone()
        );
        cowBody.material.color.set(0x8B4513);
        cowBody.position.y = 0.75;
        ghostGroup.add(cowBody);
        
        // Cow head to show direction
        const cowHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.6),
          ghostMaterial.clone()
        );
        cowHead.material.color.set(0x8B4513);
        cowHead.position.set(1.2, 0.8, 0);
        ghostGroup.add(cowHead);
        
        // Snout
        const cowSnout = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.2, 0.4),
          ghostMaterial.clone()
        );
        cowSnout.material.color.set(0xFFB6C1);
        cowSnout.position.set(1.5, 0.7, 0);
        ghostGroup.add(cowSnout);
        break;
        
      case 'pig':
        // Pig body
        const pigBody = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 4),
          ghostMaterial.clone()
        );
        pigBody.material.color.set(0xFFB6C1);
        pigBody.position.y = 0.45;
        pigBody.scale.set(1.4, 0.9, 1.1);
        ghostGroup.add(pigBody);
        
        // Pig head
        const pigHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 6, 4),
          ghostMaterial.clone()
        );
        pigHead.material.color.set(0xFFB6C1);
        pigHead.position.set(0.9, 0.5, 0);
        ghostGroup.add(pigHead);
        
        // Snout
        const pigSnout = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 0.15),
          ghostMaterial.clone()
        );
        pigSnout.material.color.set(0xFF69B4);
        pigSnout.position.set(1.2, 0.45, 0);
        pigSnout.rotation.z = Math.PI / 2;
        ghostGroup.add(pigSnout);
        break;
        
      case 'horse':
        // Horse body
        const horseBody = new THREE.Mesh(
          new THREE.BoxGeometry(2.3, 1.3, 0.9),
          ghostMaterial.clone()
        );
        horseBody.material.color.set(0x654321);
        horseBody.position.y = 0.9;
        ghostGroup.add(horseBody);
        
        // Horse neck
        const horseNeck = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 1, 0.4),
          ghostMaterial.clone()
        );
        horseNeck.material.color.set(0x654321);
        horseNeck.position.set(1.0, 1.3, 0);
        horseNeck.rotation.z = -Math.PI / 8;
        ghostGroup.add(horseNeck);
        
        // Horse head
        const horseHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.5, 0.3),
          ghostMaterial.clone()
        );
        horseHead.material.color.set(0x654321);
        horseHead.position.set(1.4, 1.7, 0);
        ghostGroup.add(horseHead);
        break;
        
      // Interior objects
      case 'chair':
        // Chair seat
        const chairSeat = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.05, 0.5),
          ghostMaterial.clone()
        );
        chairSeat.material.color.set(0x8B4513);
        chairSeat.position.y = 0.4;
        ghostGroup.add(chairSeat);
        
        // Chair back to show direction
        const chairBack = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.4, 0.05),
          ghostMaterial.clone()
        );
        chairBack.material.color.set(0x8B4513);
        chairBack.position.set(0, 0.6, -0.225);
        ghostGroup.add(chairBack);
        break;
        
      case 'table':
        // Table top
        const tableTop = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.05, 0.8),
          ghostMaterial.clone()
        );
        tableTop.material.color.set(0x8B4513);
        tableTop.position.y = 0.75;
        ghostGroup.add(tableTop);
        
        // Add a small detail to show front
        const tableFront = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.02, 0.1),
          ghostMaterial.clone()
        );
        tableFront.material.color.set(0x654321);
        tableFront.position.set(0, 0.77, 0.35);
        ghostGroup.add(tableFront);
        break;
        
      case 'couch':
        // Couch base
        const couchBase = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.35, 0.8),
          ghostMaterial.clone()
        );
        couchBase.material.color.set(0x4169E1);
        couchBase.position.y = 0.175;
        ghostGroup.add(couchBase);
        
        // Couch back
        const couchBack = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.35, 0.2),
          ghostMaterial.clone()
        );
        couchBack.material.color.set(0x4169E1);
        couchBack.position.set(0, 0.35, -0.3);
        ghostGroup.add(couchBack);
        break;
        
      case 'tv':
        // TV screen
        const tvScreen = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.7, 0.1),
          ghostMaterial.clone()
        );
        tvScreen.material.color.set(0x2F2F2F);
        tvScreen.position.y = 1.2;
        ghostGroup.add(tvScreen);
        
        // TV stand
        const tvStand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 0.8),
          ghostMaterial.clone()
        );
        tvStand.material.color.set(0x4F4F4F);
        tvStand.position.y = 0.4;
        ghostGroup.add(tvStand);
        break;
        
      case 'bed':
        // Bed frame
        const bedFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.3, 2),
          ghostMaterial.clone()
        );
        bedFrame.material.color.set(0x8B4513);
        bedFrame.position.y = 0.25;
        ghostGroup.add(bedFrame);
        
        // Headboard to show direction
        const headboard = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.8, 0.1),
          ghostMaterial.clone()
        );
        headboard.material.color.set(0x8B4513);
        headboard.position.set(0, 0.7, -0.95);
        ghostGroup.add(headboard);
        break;
        
      case 'cat':
        // Cat body
        const catBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.1, 0.48, 6),
          ghostMaterial.clone()
        );
        catBody.material.color.set(0x808080);
        catBody.position.y = 0.12;
        catBody.rotation.z = Math.PI / 2;
        ghostGroup.add(catBody);
        
        // Cat head
        const catHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 6, 6),
          ghostMaterial.clone()
        );
        catHead.material.color.set(0x808080);
        catHead.position.set(0.2, 0.14, 0);
        ghostGroup.add(catHead);
        
        // Ears
        const catEar1 = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.08, 3),
          ghostMaterial.clone()
        );
        catEar1.material.color.set(0x808080);
        catEar1.position.set(0.18, 0.24, 0.06);
        ghostGroup.add(catEar1);
        
        const catEar2 = catEar1.clone();
        catEar2.position.set(0.18, 0.24, -0.06);
        ghostGroup.add(catEar2);
        break;
        
      case 'dog':
        // Dog body
        const dogBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.96, 0.4, 0.32),
          ghostMaterial.clone()
        );
        dogBody.material.color.set(0xD2691E);
        dogBody.position.y = 0.32;
        ghostGroup.add(dogBody);
        
        // Dog head
        const dogHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.28, 0.28),
          ghostMaterial.clone()
        );
        dogHead.material.color.set(0xD2691E);
        dogHead.position.set(0.56, 0.36, 0);
        ghostGroup.add(dogHead);
        
        // Snout
        const dogSnout = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.12, 0.16),
          ghostMaterial.clone()
        );
        dogSnout.material.color.set(0xD2691E);
        dogSnout.position.set(0.68, 0.32, 0);
        ghostGroup.add(dogSnout);
        
        // Tail up to show happiness
        const dogTail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.048, 0.032, 0.32, 4),
          ghostMaterial.clone()
        );
        dogTail.material.color.set(0xD2691E);
        dogTail.position.set(-0.4, 0.4, 0);
        dogTail.rotation.z = Math.PI / 3;
        ghostGroup.add(dogTail);
        break;
    }
    
    const ghost = ghostGroup;
    ghost.position.copy(buildPos);
    ghost.rotation.y = ghostRotation; // Apply rotation
    scene.add(ghost);
    setGhostObject(ghost);
    
    // Track the type and rotation for next frame
    setLastGhostType(type);
    setLastGhostRotation(ghostRotation);
  }
}


// ===== Module: player.js =====
/**
 * Player movement and physics
 */


/**
 * Update player movement and physics
 * @param {number} delta - Time since last frame
 */
function updatePlayer(delta) {
  // Apply gravity
  player.velocity.y -= CONFIG.player.gravity * delta;
  
  // Calculate movement direction using camera vectors
  const moveVector = new THREE.Vector3();
  const forward = getForwardVector();
  const right = getRightVector();
  
  // Add movement based on input
  if (keys.forward) moveVector.add(forward);
  if (keys.backward) moveVector.sub(forward);
  if (keys.left) moveVector.add(right);  // Fixed: was reversed
  if (keys.right) moveVector.sub(right); // Fixed: was reversed
  
  // Normalize and scale by speed
  if (moveVector.length() > 0) {
    moveVector.normalize();
    moveVector.multiplyScalar(CONFIG.player.speed * delta);
  }
  
  // Update position
  camera.position.add(moveVector);
  camera.position.y += player.velocity.y * delta;
  
  // Ground collision
  if (camera.position.y <= CONFIG.player.height) {
    camera.position.y = CONFIG.player.height;
    player.velocity.y = 0;
    player.canJump = true;
  }
  
  // World boundaries
  if (worldState.isInside) {
    // Interior boundaries
    const interiorBoundary = CONFIG.interior.roomSize / 2 - 0.5; // Leave space for walls
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -interiorBoundary, interiorBoundary);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -interiorBoundary, interiorBoundary);
  } else {
    // Outside world boundaries
    const boundary = CONFIG.world.size / 2;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -boundary, boundary);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -boundary, boundary);
  }
  
  // Mouse look with proper yaw/pitch control
  if (mouseControls.active && (mouseControls.movementX !== 0 || mouseControls.movementY !== 0)) {
    applyCameraMovement(
      -mouseControls.movementX * CONFIG.player.lookSpeed,
      -mouseControls.movementY * CONFIG.player.lookSpeed
    );
    
    mouseControls.movementX = 0;
    mouseControls.movementY = 0;
  }
}


// ===== Module: dayNight.js =====
/**
 * Day/night cycle system
 */


/**
 * Update the day/night cycle
 */
function updateDayNightCycle() {
  const totalCycle = CONFIG.dayNight.dayDuration + CONFIG.dayNight.nightDuration;
  const elapsed = clock.getElapsedTime() % totalCycle;
  const isDay = elapsed < CONFIG.dayNight.dayDuration;
  
  let progress, lightIntensity, skyColor;
  
  if (isDay) {
    // Day time
    progress = elapsed / CONFIG.dayNight.dayDuration;
    const sunAngle = progress * Math.PI;
    
    // Update sun position and light
    const sunX = Math.cos(sunAngle) * CONFIG.dayNight.sunDistance;
    const sunY = Math.sin(sunAngle) * CONFIG.dayNight.sunDistance;
    sunLight.position.set(sunX, sunY, 50);
    sunMesh.position.set(sunX, sunY, -100);
    sunLight.visible = true;
    sunMesh.visible = true;
    moonLight.visible = false;
    moonMesh.visible = false;
    
    lightIntensity = 0.5 + Math.sin(sunAngle) * 0.5;
    sunLight.intensity = lightIntensity;
    ambientLight.intensity = 0.3 + lightIntensity * 0.2;
    
    // Sky color transitions
    if (progress < 0.1 || progress > 0.9) {
      // Sunrise/sunset
      skyColor = new THREE.Color(0xff6b35);
      scene.fog.color = skyColor;
    } else {
      skyColor = new THREE.Color(0x87ceeb);
      scene.fog.color = skyColor;
    }
  } else {
    // Night time
    progress = (elapsed - CONFIG.dayNight.dayDuration) / CONFIG.dayNight.nightDuration;
    const moonAngle = progress * Math.PI;
    
    // Update moon position and light
    const moonX = -Math.cos(moonAngle) * CONFIG.dayNight.moonDistance;
    const moonY = Math.sin(moonAngle) * CONFIG.dayNight.moonDistance;
    moonLight.position.set(moonX, moonY, -50);
    moonMesh.position.set(moonX, moonY, -100);
    moonLight.visible = true;
    moonMesh.visible = true;
    sunLight.visible = false;
    sunMesh.visible = false;
    
    lightIntensity = 0.1 + Math.sin(moonAngle) * 0.2;
    moonLight.intensity = lightIntensity;
    ambientLight.intensity = 0.1;
    
    skyColor = new THREE.Color(0x191970);
    scene.fog.color = skyColor;
  }
  
  // Update sky color
  skyMesh.material.color = skyColor;
  
  // Update compass time display
  updateCompass(isDay, progress);
}

/**
 * Update compass display with current time
 * @param {boolean} isDay - Whether it's day time
 * @param {number} progress - Progress through current cycle (0-1)
 */
function updateCompass(isDay, progress) {
  const needle = document.getElementById('compassNeedle');
  const timeDisplay = document.getElementById('timeDisplay');
  
  if (needle) {
    const rotation = -cameraController.yaw * (180 / Math.PI) - 90;
    needle.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
  }
  
  if (timeDisplay) {
    if (isDay) {
      timeDisplay.textContent = progress < 0.5 ? 'Morning' : 'Afternoon';
    } else {
      timeDisplay.textContent = 'Night';
    }
  }
}


// ===== Module: ui.js =====
/**
 * UI elements creation and management
 */


/**
 * Create all UI elements for the game
 */
function createUIElements() {
  createCrosshair();
  createCompass();
  createObjectSelector();
  createSaveLoadPanel();
  updateInstructions();
  updateObjectSelector();
}

/**
 * Create the aiming crosshair
 */
function createCrosshair() {
  const crosshair = document.createElement('div');
  crosshair.innerHTML = `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <div style="width: 20px; height: 2px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
      <div style="width: 2px; height: 20px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
    </div>
  `;
  document.body.appendChild(crosshair);
  uiElements.crosshair = crosshair;
}

/**
 * Create the compass UI element
 */
function createCompass() {
  const compass = document.createElement('div');
  compass.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: ${CONFIG.ui.compassSize}px;
    height: ${CONFIG.ui.compassSize}px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: white;
    font-family: Arial;
    font-size: 12px;
  `;
  compass.innerHTML = `
    <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%);">N</div>
    <div id="compassNeedle" style="position: absolute; top: 50%; left: 50%; width: 2px; height: 30px; background: red; transform-origin: center bottom;"></div>
    <div id="timeDisplay" style="position: absolute; top: ${CONFIG.ui.compassSize + 10}px; left: 50%; transform: translateX(-50%); text-align: center; width: 100px;">Day</div>
  `;
  document.body.appendChild(compass);
  uiElements.compass = compass;
}

/**
 * Create the object selector UI
 */
function createObjectSelector() {
  const selector = document.createElement('div');
  selector.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
  `;
  
  document.body.appendChild(selector);
  uiElements.selector = selector;
  
  // Update the selector content based on location
  updateSelectorContent();
}

/**
 * Update the selector content based on whether we're inside or outside
 */
function updateSelectorContent() {
  if (!uiElements.selector) return;
  
  // Different items for interior vs exterior
  const exteriorItems = [
    { icon: '✊', label: 'Fists', key: '0' },
    { icon: '🌳', label: 'Tree', key: '1' },
    { icon: '🪨', label: 'Rock', key: '2' },
    { icon: '🏠', label: 'House', key: '3' },
    { icon: '🐄', label: 'Cow', key: '4' },
    { icon: '🐷', label: 'Pig', key: '5' },
    { icon: '🐴', label: 'Horse', key: '6' }
  ];
  
  const interiorItems = [
    { icon: '✊', label: 'Fists', key: '0' },
    { icon: '🪑', label: 'Chair', key: '1' },
    { icon: '🔲', label: 'Table', key: '2' },
    { icon: '🛋️', label: 'Couch', key: '3' },
    { icon: '📺', label: 'TV', key: '4' },
    { icon: '🛏️', label: 'Bed', key: '5' },
    { icon: '🐱', label: 'Cat', key: '6' },
    { icon: '🐕', label: 'Dog', key: '7' }
  ];
  
  const items = worldState.isInside ? interiorItems : exteriorItems;
  
  uiElements.selector.innerHTML = items.map((item, index) => `
    <div class="selector-item" data-type="${index}" style="
      width: ${CONFIG.ui.selectorItemSize}px;
      height: ${CONFIG.ui.selectorItemSize}px;
      background: #333;
      border: 2px solid ${index === selectedObjectType ? '#ff0' : '#666'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
    ">
      <div>${item.icon}<br>${item.label}<br>[${item.key}]</div>
    </div>
  `).join('');
}

/**
 * Update the instructions panel styling
 */
function updateInstructions() {
  const instructions = document.getElementById('instructions');
  if (instructions) {
    instructions.style.background = 'rgba(0, 0, 0, 0.7)';
    instructions.style.color = 'white';
    instructions.style.padding = '10px';
    instructions.style.borderRadius = '5px';
    uiElements.instructions = instructions;
  }
}

/**
 * Update the object selector UI to show current selection
 */
function updateObjectSelector() {
  // Just update the content which will handle the selection highlight
  updateSelectorContent();
}

/**
 * Create save/load panel
 */
function createSaveLoadPanel() {
  const panel = document.createElement('div');
  panel.id = 'saveLoadPanel';
  panel.style.cssText = `
    position: absolute;
    top: ${CONFIG.ui.compassSize + 100}px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
    color: white;
    font-family: Arial;
    font-size: 14px;
  `;
  
  panel.innerHTML = `
    <div style="margin-bottom: 10px; font-weight: bold;">💾 Save/Load</div>
    <button id="saveButton" style="
      margin: 5px;
      padding: 5px 10px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    ">Save Game [F5]</button>
    <button id="loadButton" style="
      margin: 5px;
      padding: 5px 10px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    ">Load Game [F9]</button>
    <div id="saveStatus" style="margin-top: 10px; font-size: 12px;"></div>
  `;
  
  document.body.appendChild(panel);
  uiElements.saveLoadPanel = panel;
}

/**
 * Update save status message
 * @param {string} message - Status message to display
 * @param {string} color - Text color (default: white)
 */
function updateSaveStatus(message, color = 'white') {
  const statusElement = document.getElementById('saveStatus');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.style.color = color;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      statusElement.textContent = '';
    }, 3000);
  }
}


// ===== Module: saveLoad.js =====
/**
 * Save/Load System
 * Handles saving and loading game state to localStorage
 */


const SAVE_KEY = 'jscraft_save';
const SAVE_VERSION = '1.0';

/**
 * Save the current game state
 * @returns {boolean} Success status
 */
function saveGameState() {
  try {
    // Always save current interior if inside a house
    if (worldState.isInside && worldState.currentHouse) {
      saveCurrentInterior();
    }
    
    // Convert house interiors Map to serializable format
    const houseInteriorsData = {};
    worldState.houseInteriors.forEach((interiorData, houseUuid) => {
      houseInteriorsData[houseUuid] = interiorData;
    });
    
    // Prepare save data
    
    const saveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      timeOfDay: clock.getElapsedTime(), // Save the current time
      player: {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        rotation: {
          yaw: cameraController.yaw,
          pitch: cameraController.pitch
        },
        selectedObjectType: selectedObjectType,
        ghostRotation: ghostRotation
      },
      worldState: {
        isInside: worldState.isInside,
        currentHouseUuid: worldState.currentHouse ? worldState.currentHouse.uuid : null,
        outsidePosition: worldState.outsidePosition.toArray(),
        outsideRotation: worldState.outsideRotation
      },
      worldObjects: worldObjects.map(obj => ({
        type: obj.userData.type,
        position: obj.position.toArray(),
        rotation: obj.rotation.y,
        uuid: obj.uuid
      })),
      worldAnimals: worldAnimals.map(animal => ({
        type: animal.userData.type,
        position: animal.position.toArray(),
        rotation: animal.rotation.y
      })),
      houseInteriors: houseInteriorsData
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

/**
 * Load a saved game state
 * @returns {boolean} Success status
 */
function loadGameState() {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      console.log('No save data found');
      return false;
    }
    
    let saveData;
    try {
      saveData = JSON.parse(savedData);
    } catch (parseError) {
      console.error('Failed to parse save data:', parseError);
      return false;
    }
    
    // Validate save data structure
    if (!saveData || typeof saveData !== 'object') {
      console.error('Invalid save data structure');
      return false;
    }
    
    // Check version compatibility
    if (saveData.version !== SAVE_VERSION) {
      // Version mismatch but continue loading
    }
    
    // Clear existing objects (except initial terrain)
    clearWorldObjects();
    
    // Restore player position and rotation
    camera.position.set(
      saveData.player.position.x,
      saveData.player.position.y,
      saveData.player.position.z
    );
    cameraController.yaw = saveData.player.rotation.yaw;
    cameraController.pitch = saveData.player.rotation.pitch;
    updateCameraRotation();
    
    // Restore selected object and ghost rotation
    selectedObjectType = saveData.player.selectedObjectType || 0;
    ghostRotation = saveData.player.ghostRotation || 0;
    
    // Restore time of day
    if (saveData.timeOfDay !== undefined) {
      clock.elapsedTime = saveData.timeOfDay;
      clock.oldTime = performance.now() / 1000 - saveData.timeOfDay;
    }
    
    // Restore world objects
    saveData.worldObjects.forEach(objData => {
      let newObj = null;
      const [x, y, z] = objData.position;
      
      switch (objData.type) {
        case 'tree':
          newObj = createTree(x, z);
          break;
        case 'rock':
          newObj = createRock(x, z);
          break;
        case 'house':
          // Pass the UUID to preserve it for interior mapping
          newObj = createHouse(x, z, objData.uuid);
          break;
      }
      
      if (newObj) {
        newObj.rotation.y = objData.rotation;
      }
    });
    
    // Restore world animals
    saveData.worldAnimals.forEach(animalData => {
      let newAnimal = null;
      const [x, y, z] = animalData.position;
      
      switch (animalData.type) {
        case 'cow':
          newAnimal = createCow(x, z);
          break;
        case 'pig':
          newAnimal = createPig(x, z);
          break;
        case 'horse':
          newAnimal = createHorse(x, z);
          break;
      }
      
      if (newAnimal) {
        newAnimal.rotation.y = animalData.rotation;
      }
    });
    
    // Restore house interiors data
    if (saveData.houseInteriors && typeof saveData.houseInteriors === 'object') {
      worldState.houseInteriors.clear();
      Object.entries(saveData.houseInteriors).forEach(([houseUuid, interiorData]) => {
        // Validate interior data structure
        if (interiorData && 
            Array.isArray(interiorData.objects) && 
            Array.isArray(interiorData.animals)) {
          worldState.houseInteriors.set(houseUuid, interiorData);
        }
      });
      // House interiors restored
    }
    
    // If player was inside a house, restore that interior
    if (saveData.worldState.isInside && saveData.worldState.currentHouseUuid) {
      const house = worldObjects.find(obj => obj.uuid === saveData.worldState.currentHouseUuid);
      if (house) {
        // Set world state
        worldState.currentHouse = house;
        worldState.isInside = true;
        worldState.outsidePosition.fromArray(saveData.worldState.outsidePosition);
        worldState.outsideRotation = saveData.worldState.outsideRotation;
        
        // Hide outside world objects
        if (interactableObjects) interactableObjects.visible = false;
        if (skyMesh) skyMesh.visible = false;
        if (sunMesh) sunMesh.visible = false;
        if (moonMesh) moonMesh.visible = false;
        if (sunLight) sunLight.visible = false;
        if (moonLight) moonLight.visible = false;
        if (ambientLight) ambientLight.intensity = 0.5;
        
        // Create interior with saved data
        createInterior(house, true); // Skip default furniture
        loadHouseInterior(house.uuid);
        
        // Update UI for interior mode
        updateSelectorContent();
      }
    } else {
      // Reset world state if not inside
      worldState.isInside = false;
      worldState.currentHouse = null;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

/**
 * Clear all world objects (used before loading)
 */
function clearWorldObjects() {
  // Clear world objects
  [...worldObjects].forEach(obj => {
    if (obj.parent) obj.parent.remove(obj);
    disposeObject(obj);
  });
  worldObjects.length = 0;
  
  // Clear world animals
  [...worldAnimals].forEach(animal => {
    if (animal.parent) animal.parent.remove(animal);
    disposeObject(animal);
  });
  worldAnimals.length = 0;
  
  // Clear interior objects if inside
  if (worldState.isInside) {
    [...interiorObjects].forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
      disposeObject(obj);
    });
    interiorObjects.length = 0;
    
    [...interiorAnimals].forEach(animal => {
      if (animal.parent) animal.parent.remove(animal);
      disposeObject(animal);
    });
    interiorAnimals.length = 0;
  }
}

/**
 * Check if a save exists
 * @returns {boolean} True if save exists
 */
function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Get save data info without loading
 * @returns {Object|null} Save info or null
 */
function getSaveInfo() {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;
    
    const saveData = JSON.parse(savedData);
    return {
      timestamp: new Date(saveData.timestamp),
      objectCount: saveData.worldObjects.length,
      animalCount: saveData.worldAnimals.length
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete save data
 */
function deleteSaveData() {
  localStorage.removeItem(SAVE_KEY);
  console.log('Save data deleted');
}

/**
 * Save the current interior to the house interiors map
 * Traverses the interior group to collect all furniture and pets
 * Only saves if player is currently inside a house
 */
function saveCurrentInterior() {
  if (!worldState.currentHouse || !worldState.isInside) {
    return;
  }
  
  const houseUuid = worldState.currentHouse.uuid;
  
  // Collect all interior objects from the interior group
  const objectsToSave = [];
  const animalsToSave = [];
  
  if (worldState.interiorGroup) {
    worldState.interiorGroup.traverse(child => {
      if (child.userData && child.userData.type) {
        const saveData = {
          type: child.userData.type,
          position: child.position.toArray(),
          rotation: child.rotation.y || 0
        };
        
        if (['chair', 'table', 'couch', 'tv', 'bed'].includes(child.userData.type)) {
          objectsToSave.push(saveData);
        } else if (['cat', 'dog'].includes(child.userData.type)) {
          animalsToSave.push(saveData);
        }
      }
    });
  }
  
  const interiorData = {
    objects: objectsToSave,
    animals: animalsToSave,
    timestamp: Date.now()
  };
  
  worldState.houseInteriors.set(houseUuid, interiorData);
}

/**
 * Load a specific house's interior from saved data
 * Recreates all furniture and pets in their saved positions
 * @param {string} houseUuid - UUID of the house to load interior for
 * @returns {boolean} True if interior was loaded successfully, false otherwise
 */
function loadHouseInterior(houseUuid) {
  const interiorData = worldState.houseInteriors.get(houseUuid);
  
  if (!interiorData || !worldState.interiorGroup) {
    return false;
  }
  
  // Clear arrays to track new objects
  interiorObjects.length = 0;
  interiorAnimals.length = 0;
  
  // Restore interior objects
  interiorData.objects.forEach(objData => {
    let newObj = null;
    const [x, y, z] = objData.position;
    
    switch (objData.type) {
      case 'chair':
        newObj = createChair(x, y, z);
        break;
      case 'table':
        newObj = createTable(x, y, z);
        break;
      case 'couch':
        newObj = createCouch(x, y, z);
        break;
      case 'tv':
        newObj = createTV(x, y, z);
        break;
      case 'bed':
        newObj = createBed(x, y, z);
        break;
    }
    
    if (newObj) {
      newObj.rotation.y = objData.rotation || 0;
      // Always add to interior group when loading interior
      if (worldState.interiorGroup) {
        worldState.interiorGroup.add(newObj);
      }
      // Track in the array
      if (!interiorObjects.includes(newObj)) {
        interiorObjects.push(newObj);
      }
    }
  });
  
  // Restore interior animals
  interiorData.animals.forEach(animalData => {
    let newAnimal = null;
    const [x, , z] = animalData.position;
    
    switch (animalData.type) {
      case 'cat':
        newAnimal = createCat(x, z);
        break;
      case 'dog':
        newAnimal = createDog(x, z);
        break;
    }
    
    if (newAnimal) {
      newAnimal.rotation.y = animalData.rotation || 0;
      // Always add to interior group when loading interior
      if (worldState.interiorGroup) {
        worldState.interiorGroup.add(newAnimal);
      }
      // Track in the array
      if (!interiorAnimals.includes(newAnimal)) {
        interiorAnimals.push(newAnimal);
      }
    }
  });
  
  return true;
}


// ===== Module: input.js =====
/**
 * Input handling system
 */


/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Mouse controls
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  
  // Save/Load button handlers
  const saveButton = document.getElementById('saveButton');
  const loadButton = document.getElementById('loadButton');
  
  if (saveButton) {
    saveButton.addEventListener('click', handleSave);
  }
  
  if (loadButton) {
    loadButton.addEventListener('click', handleLoad);
  }
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      break;
    case 'Space':
      if (event.target === document.body) {
        event.preventDefault();
        // Handle both jump and remove
        if (highlightedObject) {
          removeObject();
        } else if (player.canJump) {
          player.velocity.y = CONFIG.player.jumpSpeed;
          player.canJump = false;
        }
      }
      break;
    case 'KeyQ':
      // Rotate ghost object counter-clockwise when building
      if (selectedObjectType !== 0) {
        setGhostRotation(ghostRotation + Math.PI / 4);
      } else if (!mouseControls.active) {
        // Normal camera rotation when not building
        applyCameraMovement(0.1, 0);
      }
      break;
    case 'KeyE':
      // Rotate ghost object clockwise when building
      if (selectedObjectType !== 0) {
        setGhostRotation(ghostRotation - Math.PI / 4);
      } else if (!mouseControls.active) {
        // Normal camera rotation when not building
        applyCameraMovement(-0.1, 0);
      }
      break;
    case 'KeyB':
      buildObject();
      break;
    case 'Digit0':
      setSelectedObjectType(0); // Fists
      updateObjectSelector();
      break;
    case 'Digit1':
      setSelectedObjectType(1); // Tree
      updateObjectSelector();
      break;
    case 'Digit2':
      setSelectedObjectType(2); // Rock
      updateObjectSelector();
      break;
    case 'Digit3':
      setSelectedObjectType(3); // House
      updateObjectSelector();
      break;
    case 'Digit4':
      setSelectedObjectType(4); // Cow
      updateObjectSelector();
      break;
    case 'Digit5':
      setSelectedObjectType(5); // Pig
      updateObjectSelector();
      break;
    case 'Digit6':
      setSelectedObjectType(6); // Horse
      updateObjectSelector();
      break;
    case 'Digit7':
      setSelectedObjectType(7); // Dog (when inside)
      updateObjectSelector();
      break;
    case 'F5':
      event.preventDefault(); // Prevent browser refresh
      handleSave();
      break;
    case 'F9':
      event.preventDefault();
      handleLoad();
      break;
  }
}

/**
 * Handle keyup events
 * @param {KeyboardEvent} event
 */
function onKeyUp(event) {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = false;
      break;
  }
}

/**
 * Handle mouse move events
 * @param {MouseEvent} event
 */
function onMouseMove(event) {
  if (mouseControls.active) {
    mouseControls.movementX = event.movementX || 0;
    mouseControls.movementY = event.movementY || 0;
  }
}

/**
 * Handle click events
 */
function onClick() {
  // Check if clicking on a door
  if (highlightedObject && highlightedObject.userData && highlightedObject.userData.type === 'door') {
    handleDoorClick(highlightedObject);
    return;
  }
  
  // Otherwise handle pointer lock
  if (!mouseControls.active) {
    renderer.domElement.requestPointerLock();
  }
}

/**
 * Handle pointer lock change events
 */
function onPointerLockChange() {
  mouseControls.active = document.pointerLockElement === renderer.domElement;
}

/**
 * Handles door click interactions
 * @param {THREE.Mesh} door - The door being clicked
 */
function handleDoorClick(door) {
  if (door.userData.isExitDoor) {
    // Exit from interior to outside
    exitToOutside();
  } else if (door.userData.parentHouse) {
    // Enter from outside to interior
    enterHouse(door.userData.parentHouse);
  }
}

/**
 * Transitions from outside world to house interior
 * @param {THREE.Object3D} house - The house being entered
 */
function enterHouse(house) {
  // Save current outside position and rotation
  worldState.outsidePosition.copy(camera.position);
  worldState.outsideRotation.yaw = cameraController.yaw;
  worldState.outsideRotation.pitch = cameraController.pitch;
  worldState.currentHouse = house;
  
  // Hide outside world objects
  interactableObjects.visible = false;
  if (skyMesh) skyMesh.visible = false;
  if (sunMesh) sunMesh.visible = false;
  if (moonMesh) moonMesh.visible = false;
  sunLight.visible = false;
  moonLight.visible = false;
  
  // Adjust ambient light for interior
  ambientLight.intensity = 0.5;
  
  // Check if we have saved interior data for this house
  const hasSavedInterior = worldState.houseInteriors.has(house.uuid);
  
  // Create interior world (skip default furniture if we have saved data)
  createInterior(house, hasSavedInterior);
  
  // Load saved interior if it exists
  if (hasSavedInterior) {
    loadHouseInterior(house.uuid);
  }
  
  // Position player inside near the door
  camera.position.set(0, CONFIG.player.height, CONFIG.interior.roomSize / 2 - 2);
  cameraController.yaw = Math.PI; // Face into the room
  cameraController.pitch = 0;
  updateCameraRotation();
  
  // Update world state
  worldState.isInside = true;
  
  // Reset selected object type to fists
  setSelectedObjectType(0);
  
  // Update selector to show interior items
  updateSelectorContent();
}

/**
 * Transitions from house interior back to outside world
 */
function exitToOutside() {
  // Save current interior before exiting
  if (worldState.currentHouse) {
    saveCurrentInterior();
  }
  
  // Remove interior
  removeInterior();
  
  // Show outside world objects
  interactableObjects.visible = true;
  if (skyMesh) skyMesh.visible = true;
  if (sunMesh) sunMesh.visible = true;
  if (moonMesh) moonMesh.visible = true;
  sunLight.visible = true;
  moonLight.visible = true;
  
  // Restore ambient light
  ambientLight.intensity = 0.3;
  
  // Restore player position and rotation
  camera.position.copy(worldState.outsidePosition);
  cameraController.yaw = worldState.outsideRotation.yaw;
  cameraController.pitch = worldState.outsideRotation.pitch;
  updateCameraRotation();
  
  // Update world state
  worldState.isInside = false;
  worldState.currentHouse = null;
  
  // Reset selected object type to fists
  setSelectedObjectType(0);
  
  // Update selector to show exterior items
  updateSelectorContent();
  
  // Reset any highlighted objects
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
  }
}

/**
 * Handle window resize events
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handle save game
 */
function handleSave() {
  const success = saveGameState();
  if (success) {
    updateSaveStatus('✅ Game saved successfully!', 'lightgreen');
  } else {
    updateSaveStatus('❌ Failed to save game', 'red');
  }
}

/**
 * Handle load game
 */
function handleLoad() {
  if (!hasSaveData()) {
    updateSaveStatus('⚠️ No save data found', 'orange');
    return;
  }
  
  const success = loadGameState();
  if (success) {
    updateSaveStatus('✅ Game loaded successfully!', 'lightgreen');
    // Update UI to reflect loaded state
    updateObjectSelector();
    updateSelectorContent();
  } else {
    updateSaveStatus('❌ Failed to load game', 'red');
  }
}

/**
 * Remove all event listeners (for cleanup)
 */
function removeEventListeners() {
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onClick);
  document.removeEventListener('pointerlockchange', onPointerLockChange);
}


// ===== Module: animals.js =====
/**
 * Animal creation and movement functions
 */


// Re-export animal creation functions from their respective modules

/**
 * Update all animals' movement and animations
 * @param {number} delta - Time since last frame
 */
function updateAnimals(delta) {
  const currentTime = clock.getElapsedTime();
  
  // Update world animals when outside
  if (!worldState.isInside) {
    worldAnimals.forEach(animal => {
    // Check if it's time to pick a new target
    if (currentTime > animal.userData.nextMoveTime) {
      // Pick a new random target within wander radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * animal.userData.wanderRadius * 0.7 + animal.userData.wanderRadius * 0.3; // Avoid always going to edges
      
      animal.userData.targetPosition.set(
        animal.userData.initialPosition.x + Math.cos(angle) * distance,
        0,
        animal.userData.initialPosition.z + Math.sin(angle) * distance
      );
      
      // Keep target within bounds
      const boundary = CONFIG.world.size / 2 - CONFIG.world.boundaryPadding;
      animal.userData.targetPosition.x = THREE.MathUtils.clamp(animal.userData.targetPosition.x, -boundary, boundary);
      animal.userData.targetPosition.z = THREE.MathUtils.clamp(animal.userData.targetPosition.z, -boundary, boundary);
      
      // Set next move time (wait 2-6 seconds between moves, varies by animal)
      const waitTime = 2 + Math.random() * 4;
      animal.userData.nextMoveTime = currentTime + waitTime;
    }
    
    // Move towards target
    const direction = new THREE.Vector3()
      .subVectors(animal.userData.targetPosition, animal.position)
      .normalize();
    
    const distanceToTarget = animal.position.distanceTo(animal.userData.targetPosition);
    
    if (distanceToTarget > 1) {
      // Move the animal with slight curve for more natural movement
      const moveDistance = animal.userData.moveSpeed * delta;
      
      // Add slight perpendicular drift for curved paths
      const drift = new THREE.Vector3(-direction.z, 0, direction.x);
      drift.multiplyScalar(Math.sin(currentTime * 2) * 0.1);
      
      animal.position.add(direction.multiplyScalar(moveDistance));
      animal.position.add(drift);
      
      // Smooth rotation towards direction
      if (direction.length() > 0) {
        const targetAngle = Math.atan2(direction.x, direction.z);
        const angleDiff = targetAngle - animal.rotation.y;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        animal.rotation.y += normalizedDiff * delta * 3; // Smooth turning
      }
      
      // Improved bobbing animation based on animal type and speed
      const bobSpeed = 8 + animal.userData.moveSpeed;
      const bobAmount = Math.sin(currentTime * bobSpeed) * 0.03;
      animal.position.y = Math.abs(bobAmount) * animal.userData.moveSpeed / 4;
      
      // Subtle sway animation
      animal.rotation.z = Math.sin(currentTime * bobSpeed * 0.7) * 0.01;
      
      // Head movement for horses (they're taller)
      if (animal.userData.type === 'horse') {
        animal.rotation.x = Math.sin(currentTime * bobSpeed * 0.5) * 0.02;
      }
    } else {
      // Idle animation when stopped
      animal.position.y = Math.sin(currentTime * 2) * 0.01; // Gentle breathing
      animal.rotation.z = 0;
      animal.rotation.x = 0;
      
      // Occasionally look around when idle
      if (Math.random() < 0.01) {
        animal.rotation.y += (Math.random() - 0.5) * 0.5;
      }
    }
    
    // Keep animals within world bounds with soft boundaries
    const boundary = CONFIG.world.size / 2 - 15;
    const softBoundary = 10;
    
    // Apply soft boundary force
    if (Math.abs(animal.position.x) > boundary - softBoundary) {
      animal.position.x = THREE.MathUtils.clamp(animal.position.x, -boundary, boundary);
      animal.userData.targetPosition.x = animal.position.x + (Math.random() - 0.5) * 20;
    }
    if (Math.abs(animal.position.z) > boundary - softBoundary) {
      animal.position.z = THREE.MathUtils.clamp(animal.position.z, -boundary, boundary);
      animal.userData.targetPosition.z = animal.position.z + (Math.random() - 0.5) * 20;
    }
    });
  }
  
  // Update interior animals when inside
  if (worldState.isInside) {
    interiorAnimals.forEach(animal => {
      // Check if it's time to pick a new target
      if (currentTime > animal.userData.nextMoveTime) {
        // Pick a new random target within room
        const roomSize = CONFIG.interior.roomSize;
        const maxDistance = roomSize / 3; // Smaller wander radius for interior
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxDistance * 0.7 + maxDistance * 0.3;
        
        animal.userData.targetPosition.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
        
        // Keep target within room bounds
        const boundary = roomSize / 2 - CONFIG.interior.boundaryPadding;
        animal.userData.targetPosition.x = THREE.MathUtils.clamp(animal.userData.targetPosition.x, -boundary, boundary);
        animal.userData.targetPosition.z = THREE.MathUtils.clamp(animal.userData.targetPosition.z, -boundary, boundary);
        
        // Set next move time (shorter wait times for interior)
        const waitTime = 1 + Math.random() * 3;
        animal.userData.nextMoveTime = currentTime + waitTime;
      }
      
      // Move towards target
      const direction = new THREE.Vector3()
        .subVectors(animal.userData.targetPosition, animal.position)
        .normalize();
      
      const distanceToTarget = animal.position.distanceTo(animal.userData.targetPosition);
      
      if (distanceToTarget > 0.3) {
        // Move the animal with slight curve for more natural movement
        const moveDistance = animal.userData.moveSpeed * delta * 0.7; // Slightly slower indoors
        
        // Add slight perpendicular drift for curved paths
        const drift = new THREE.Vector3(-direction.z, 0, direction.x);
        drift.multiplyScalar(Math.sin(currentTime * 2) * 0.05);
        
        animal.position.add(direction.multiplyScalar(moveDistance));
        animal.position.add(drift);
        
        // Smooth rotation towards direction
        if (direction.length() > 0) {
          const targetAngle = Math.atan2(direction.x, direction.z);
          const angleDiff = targetAngle - animal.rotation.y;
          const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          animal.rotation.y += normalizedDiff * delta * 3;
        }
        
        // Animate legs
        if (animal.userData.legs) {
          const walkCycle = currentTime * 8;
          animal.userData.legs.forEach((leg, index) => {
            const offset = index < 2 ? 0 : Math.PI;
            leg.rotation.x = Math.sin(walkCycle + offset) * 0.3;
          });
        }
        
        // Subtle bobbing
        animal.position.y = Math.abs(Math.sin(currentTime * 6) * 0.02);
        
        // Tail wagging for dogs
        if (animal.userData.type === 'dog' && animal.userData.tail) {
          animal.userData.tail.rotation.y = Math.sin(currentTime * 10) * 0.3;
        }
      } else {
        // Idle animations
        animal.position.y = Math.sin(currentTime * 2) * 0.01;
        
        // Reset leg positions
        if (animal.userData.legs) {
          animal.userData.legs.forEach(leg => {
            leg.rotation.x = 0;
          });
        }
        
        // Gentle tail movement for cats
        if (animal.userData.type === 'cat') {
          const tailBase = animal.children.find(child => child.position.x < -animal.userData.size * 0.3);
          if (tailBase) {
            tailBase.rotation.y = Math.sin(currentTime * 1.5) * 0.1;
          }
        }
      }
    });
  }
}


// ===== Module: main.js =====
/**
 * JSCraft 3D - Three.js Implementation
 * Main entry point for the modular game
 * 
 * @version 2.0.0
 * @license MIT
 */


/**
 * Initialize the game
 */
function init() {
  try {
    // Clock for time tracking
    setClock(new THREE.Clock());
    
    // Scene setup
    setScene(new THREE.Scene());
    scene.fog = new THREE.Fog(0x87CEEB, CONFIG.world.fogNear, CONFIG.world.fogFar);
    
    // Camera setup
    setCamera(new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    ));
    camera.position.set(0, CONFIG.player.height, 0);
    
    // Initialize camera rotation properly
    updateCameraRotation();
    
    // Renderer setup
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      throw new Error('Game canvas not found');
    }
    
    setRenderer(new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: CONFIG.renderer.antialias 
    }));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Raycaster for object interaction
    setRaycaster(new THREE.Raycaster());
    
    // Setup world
    createWorld();
    createLighting();
    createInitialWorldObjects(scene);
    createInitialAnimals(scene);
    
    // Setup controls
    setupEventListeners();
    
    // Setup UI
    createUIElements();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start game loop
    animate();
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    alert('Failed to start the game. Please check the console for errors.');
  }
}

/**
 * Main animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  updatePlayer(delta);
  
  // Update different systems based on location
  if (!worldState.isInside) {
    updateDayNightCycle();
  }
  
  // Animals update regardless of location (different animals inside/outside)
  updateAnimals(delta);
  
  updateObjectHighlight();
  
  renderer.render(scene, camera);
}

/**
 * Clean up resources when the window is closed
 */
function cleanup() {
  // Dispose of all world objects
  worldObjects.forEach(object => {
    disposeObject(object);
  });
  
  // Dispose of renderer
  if (renderer) {
    renderer.dispose();
  }
  
  // Remove event listeners
  removeEventListeners();
  window.removeEventListener('resize', onWindowResize);
}

// Initialize on load
window.addEventListener('load', init);

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);


})();
