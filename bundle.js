/**
 * JSCraft 3D - Three.js Implementation
 * A simple first-person 3D game for kids learning game development
 * 
 * @version 1.0.0
 * @license MIT
 */

// ===================================================================
// CONFIGURATION
// ===================================================================

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
    boundaryPadding: 20,      // Padding from world edge
    fogNear: 100,             // Fog start distance
    fogFar: 500               // Fog end distance
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
      leavesColor: 0x228B22,  // Forest green
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
      size: 1.5,              // Reduced from 2
      moveSpeed: 2,           // Movement speed
      wanderRadius: 15        // How far they wander
    },
    pig: {
      bodyColor: 0xFFB6C1,    // Light pink
      size: 1,                // Reduced from 1.5
      moveSpeed: 3,
      wanderRadius: 10
    },
    horse: {
      bodyColor: 0x654321,    // Dark brown
      maneColor: 0x000000,    // Black mane
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
    boundaryPadding: 1,       // Padding from room walls
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

// ===================================================================
// GAME STATE
// ===================================================================

/**
 * Core Three.js objects
 */
let scene, camera, renderer;
let raycaster;
let clock;

/**
 * Player state management
 */
const player = {
  velocity: new THREE.Vector3(),
  canJump: true,
  height: CONFIG.player.height
};

/**
 * Camera controller for FPS-style movement
 * Uses separate yaw/pitch to prevent gimbal lock
 */
const cameraController = {
  yaw: 0,      // Horizontal rotation (Y-axis)
  pitch: 0     // Vertical rotation (X-axis)
};

/**
 * Input state tracking
 */
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

/**
 * Building system state
 */
let selectedObjectType = 0;
const buildableTypes = ['fists', 'tree', 'rock', 'house', 'cow', 'pig', 'horse'];
const interiorBuildableTypes = ['fists', 'chair', 'table', 'couch', 'tv', 'bed', 'cat', 'dog'];
let highlightedObject = null;
let ghostObject = null;

/**
 * World object management
 */
const worldObjects = [];
const animals = [];  // Track animals for movement updates
let interactableObjects;

/**
 * Interior world state management
 */
const worldState = {
  isInside: false,                    // Whether player is inside a building
  currentHouse: null,                 // Reference to the house player entered
  outsidePosition: new THREE.Vector3(), // Player position before entering
  outsideRotation: { yaw: 0, pitch: 0 }, // Camera rotation before entering
  interiorObjects: [],                // Objects in the current interior
  interiorGroup: null                 // Group containing all interior objects
};

/**
 * Lighting and environment
 */
let sunLight, moonLight, ambientLight;
let skyMesh, sunMesh, moonMesh;

/**
 * UI element references
 */
const uiElements = {
  crosshair: null,
  compass: null,
  selector: null,
  instructions: null
};

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Initialize the game
 */
function init() {
  try {
    // Clock for time tracking
    clock = new THREE.Clock();
    
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, CONFIG.world.fogNear, CONFIG.world.fogFar);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    camera.position.set(0, CONFIG.player.height, 0);
    
    // Initialize camera rotation properly
    updateCameraRotation();
    
    // Renderer setup
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      throw new Error('Game canvas not found');
    }
    
    renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: CONFIG.renderer.antialias 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Raycaster for object interaction
    raycaster = new THREE.Raycaster();
    
    // Setup world
    createWorld();
    createLighting();
    createInitialObjects();
    
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

// ===================================================================
// WORLD CREATION
// ===================================================================

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
  skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.name = 'sky';
  scene.add(skyMesh);
  
  // Initialize interactable objects group
  interactableObjects = new THREE.Group();
  interactableObjects.name = 'interactableObjects';
  scene.add(interactableObjects);
}

function createLighting() {
  // Ambient light
  ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  // Sun light
  sunLight = new THREE.DirectionalLight(0xffffff, 1);
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
  
  // Moon light (initially disabled)
  moonLight = new THREE.DirectionalLight(0x6666ff, 0.3);
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
  
  // Create sun mesh
  const sunGeometry = new THREE.SphereGeometry(10, 32, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1
  });
  sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);
  
  // Create moon mesh
  const moonGeometry = new THREE.SphereGeometry(8, 32, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xcccccc,
    emissive: 0x6666ff,
    emissiveIntensity: 0.5
  });
  moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  moonMesh.visible = false;
  scene.add(moonMesh);
}

function createInitialObjects() {
  // Create trees
  const treePositions = [
    { x: 10, z: 10 },
    { x: -15, z: 5 },
    { x: 20, z: -10 },
    { x: -5, z: -20 },
    { x: 25, z: 15 },
    { x: -20, z: -15 },
    { x: 30, z: 0 },
    { x: -10, z: 25 }
  ];
  
  treePositions.forEach(pos => {
    createTree(pos.x, pos.z);
  });
  
  // Create rocks
  const rockPositions = [
    { x: 5, z: -5 },
    { x: -8, z: 8 },
    { x: 15, z: 5 },
    { x: -12, z: -8 },
    { x: 0, z: 15 }
  ];
  
  rockPositions.forEach(pos => {
    createRock(pos.x, pos.z);
  });
  
  // Create houses
  const housePositions = [
    { x: -25, z: 0 },
    { x: 0, z: -25 },
    { x: 35, z: -20 }
  ];
  
  housePositions.forEach(pos => {
    createHouse(pos.x, pos.z);
  });
  
  // Create initial animals
  createCow(-30, 10);
  createCow(40, -30);
  createPig(15, -35);
  createPig(-20, 30);
  createHorse(50, 5);
  createHorse(-40, -40);
}

// ===================================================================
// OBJECT CREATION
// ===================================================================

function createTree(x, z) {
  const tree = new THREE.Group();
  
  // Random variations
  const height = THREE.MathUtils.randFloat(CONFIG.objects.tree.minHeight, CONFIG.objects.tree.maxHeight);
  const radius = THREE.MathUtils.randFloat(CONFIG.objects.tree.minRadius, CONFIG.objects.tree.maxRadius);
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(radius * 0.2, radius * 0.3, height * 0.4);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.trunkColor,
    roughness: 0.8
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = height * 0.2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);
  
  // Foliage (multiple layers for fuller appearance)
  const foliageGeometry = new THREE.ConeGeometry(radius, height * 0.6, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.leavesColor,
    roughness: 0.9
  });
  
  for (let i = 0; i < CONFIG.objects.tree.foliageLayers; i++) {
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = height * 0.4 + i * height * 0.15;
    foliage.scale.set(1 - i * 0.3, 1 - i * 0.2, 1 - i * 0.3);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);
  }
  
  tree.position.set(x, 0, z);
  tree.userData = { type: 'tree', removable: true };
  
  interactableObjects.add(tree);
  worldObjects.push(tree);
  
  return tree;
}

function createRock(x, z) {
  const size = THREE.MathUtils.randFloat(CONFIG.objects.rock.minSize, CONFIG.objects.rock.maxSize);
  
  // Create a more organic rock shape using a sphere as base
  const geometry = new THREE.SphereGeometry(size, 8, 6);
  
  // Deform vertices to create natural rock shape
  const positions = geometry.attributes.position.array;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);
    
    // Apply multiple octaves of noise for more natural deformation
    const noise1 = THREE.MathUtils.randFloat(1 - CONFIG.objects.rock.deformationRange, 1.0);
    const noise2 = THREE.MathUtils.randFloat(0.9, 1.1);
    const noise3 = THREE.MathUtils.randFloat(0.95, 1.05);
    
    // Flatten the bottom slightly
    const flattenFactor = Math.max(0.3, (vertex.y + size) / (2 * size));
    
    // Apply deformation with more variation on top
    vertex.x *= noise1 * noise2;
    vertex.y *= noise1 * noise3 * flattenFactor;
    vertex.z *= noise1 * noise2;
    
    positions[i] = vertex.x;
    positions[i + 1] = vertex.y;
    positions[i + 2] = vertex.z;
  }
  
  // Smooth the normals for better shading
  geometry.computeVertexNormals();
  
  // Create material with subtle color variation
  const colorVariation = THREE.MathUtils.randFloat(0.8, 1.0);
  const rockColor = new THREE.Color(CONFIG.objects.rock.color).multiplyScalar(colorVariation);
  
  const material = new THREE.MeshStandardMaterial({ 
    color: rockColor,
    roughness: 1.0,
    metalness: 0,
    // Add some texture-like appearance with vertex colors
    vertexColors: false
  });
  
  const rock = new THREE.Mesh(geometry, material);
  
  // Position rock naturally on ground
  rock.position.set(x, size * 0.3, z);
  
  // Random but subtle rotation
  rock.rotation.set(
    THREE.MathUtils.randFloat(-0.2, 0.2),
    Math.random() * Math.PI * 2,
    THREE.MathUtils.randFloat(-0.2, 0.2)
  );
  
  // Scale variation for more variety
  const scaleVariation = THREE.MathUtils.randFloat(0.8, 1.2);
  rock.scale.set(
    scaleVariation * THREE.MathUtils.randFloat(0.9, 1.1),
    scaleVariation * THREE.MathUtils.randFloat(0.7, 0.9),
    scaleVariation * THREE.MathUtils.randFloat(0.9, 1.1)
  );
  
  rock.castShadow = true;
  rock.receiveShadow = true;
  rock.userData = { type: 'rock', removable: true };
  
  interactableObjects.add(rock);
  worldObjects.push(rock);
  
  return rock;
}

function createHouse(x, z) {
  const house = new THREE.Group();
  const size = THREE.MathUtils.randFloat(CONFIG.objects.house.minSize, CONFIG.objects.house.maxSize);
  
  // Base/walls
  const wallGeometry = new THREE.BoxGeometry(size, size * 0.8, size);
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.wallColor,
    roughness: 0.7
  });
  const walls = new THREE.Mesh(wallGeometry, wallMaterial);
  walls.position.y = size * 0.4;
  walls.castShadow = true;
  walls.receiveShadow = true;
  house.add(walls);
  
  // Roof
  const roofGeometry = new THREE.ConeGeometry(size * 0.8, size * 0.5, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.roofColor,
    roughness: 0.8
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = size * 1.05;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  house.add(roof);
  
  // Door (interactive)
  const doorGeometry = new THREE.BoxGeometry(size * 0.2, size * 0.4, 0.1);
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.doorColor 
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, size * 0.2, size * 0.51);
  // Make door interactive
  door.userData = { 
    type: 'door', 
    isInteractive: true,
    parentHouse: house,
    originalMaterial: doorMaterial
  };
  door.name = 'door'; // For easy identification
  house.add(door);
  
  // Windows
  const windowGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.15, 0.1);
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.windowColor,
    emissive: CONFIG.objects.house.windowColor,
    emissiveIntensity: CONFIG.objects.house.windowEmissive
  });
  
  // Front windows
  const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
  window1.position.set(-size * 0.3, size * 0.5, size * 0.51);
  house.add(window1);
  
  const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
  window2.position.set(size * 0.3, size * 0.5, size * 0.51);
  house.add(window2);
  
  house.position.set(x, 0, z);
  house.rotation.y = Math.random() * Math.PI * 2;
  house.userData = { 
    type: 'house', 
    removable: true,
    door: door,
    size: size
  };
  
  interactableObjects.add(house);
  worldObjects.push(house);
  
  return house;
}

function createCow(x, z) {
  const cow = new THREE.Group();
  const size = CONFIG.objects.cow.size;
  
  // Body - simple elongated box
  const bodyGeometry = new THREE.BoxGeometry(size * 1.2, size * 0.6, size * 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  cow.add(body);
  
  // Head - smaller box
  const headGeometry = new THREE.BoxGeometry(size * 0.3, size * 0.35, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.7, size * 0.55, 0);
  head.castShadow = true;
  cow.add(head);
  
  // Snout - pink box
  const snoutGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.12, size * 0.2);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFB6C1,
    roughness: 0.9
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(size * 0.82, size * 0.48, 0);
  cow.add(snout);
  
  // Eyes - simple spheres on sides
  const eyeGeometry = new THREE.SphereGeometry(size * 0.03, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.65, size * 0.6, size * 0.12);
  cow.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.65, size * 0.6, -size * 0.12);
  cow.add(eye2);
  
  // Horns - small cones
  const hornGeometry = new THREE.ConeGeometry(size * 0.03, size * 0.08, 4);
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xE6E6E6 });
  const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn1.position.set(size * 0.6, size * 0.72, size * 0.08);
  cow.add(horn1);
  
  const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn2.position.set(size * 0.6, size * 0.72, -size * 0.08);
  cow.add(horn2);
  
  // Ears - flat triangles
  const earGeometry = new THREE.ConeGeometry(size * 0.08, size * 0.12, 3);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.55, size * 0.65, size * 0.18);
  ear1.rotation.z = Math.PI / 2;
  cow.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.55, size * 0.65, -size * 0.18);
  ear2.rotation.z = Math.PI / 2;
  cow.add(ear2);
  
  // Black spots - simple spheres
  const spotMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.spotColor,
    roughness: 0.8
  });
  
  const spot1 = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.2, 6, 4),
    spotMaterial
  );
  spot1.position.set(size * 0.1, size * 0.6, size * 0.26);
  spot1.scale.set(1.2, 0.8, 0.1);
  cow.add(spot1);
  
  const spot2 = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.15, 6, 4),
    spotMaterial
  );
  spot2.position.set(-size * 0.3, size * 0.5, -size * 0.26);
  spot2.scale.set(1, 0.7, 0.1);
  cow.add(spot2);
  
  // Legs - simple cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.08, size * 0.08, size * 0.4);
  const legPositions = [
    { x: size * 0.35, z: size * 0.18 },
    { x: size * 0.35, z: -size * 0.18 },
    { x: -size * 0.35, z: size * 0.18 },
    { x: -size * 0.35, z: -size * 0.18 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.2, pos.z);
    leg.castShadow = true;
    cow.add(leg);
  });
  
  // Udder - pink sphere
  const udder = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.15, 6, 4),
    new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.9 })
  );
  udder.position.set(-size * 0.2, size * 0.28, 0);
  udder.scale.set(0.8, 0.6, 0.6);
  cow.add(udder);
  
  // Tail - simple cylinder
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.03, size * 0.02, size * 0.35),
    bodyMaterial
  );
  tail.position.set(-size * 0.6, size * 0.5, 0);
  tail.rotation.z = Math.PI / 4;
  cow.add(tail);
  
  // Set initial position and properties
  cow.position.set(x, 0, z);
  cow.userData = { 
    type: 'cow', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.cow.moveSpeed,
    wanderRadius: CONFIG.objects.cow.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(cow);
  worldObjects.push(cow);
  animals.push(cow);
  
  return cow;
}

function createPig(x, z) {
  const pig = new THREE.Group();
  const size = CONFIG.objects.pig.size;
  
  // Body - simple rounded box
  const bodyGeometry = new THREE.BoxGeometry(size * 0.8, size * 0.5, size * 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.pig.bodyColor,
    roughness: 0.9
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.35;
  body.castShadow = true;
  body.receiveShadow = true;
  pig.add(body);
  
  // Head - smaller box
  const headGeometry = new THREE.BoxGeometry(size * 0.35, size * 0.3, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.5, size * 0.35, 0);
  head.castShadow = true;
  pig.add(head);
  
  // Snout - pink cylinder
  const snoutGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.12, size * 0.08);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFB6C1,
    roughness: 0.7
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(size * 0.7, size * 0.32, 0);
  pig.add(snout);
  
  // Eyes - small black dots
  const eyeGeometry = new THREE.SphereGeometry(size * 0.02, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.5, size * 0.42, size * 0.1);
  pig.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.5, size * 0.42, -size * 0.1);
  pig.add(eye2);
  
  // Ears - triangular
  const earGeometry = new THREE.ConeGeometry(size * 0.08, size * 0.12, 3);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.35, size * 0.48, size * 0.12);
  ear1.rotation.z = -Math.PI / 6;
  pig.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.35, size * 0.48, -size * 0.12);
  ear2.rotation.z = -Math.PI / 6;
  pig.add(ear2);
  
  // Legs - short cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.06, size * 0.15);
  const legPositions = [
    { x: size * 0.3, z: size * 0.18 },
    { x: size * 0.3, z: -size * 0.18 },
    { x: -size * 0.3, z: size * 0.18 },
    { x: -size * 0.3, z: -size * 0.18 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.075, pos.z);
    leg.castShadow = true;
    pig.add(leg);
  });
  
  // Curly tail - simple pink sphere
  const tailGeometry = new THREE.SphereGeometry(size * 0.06, 6, 6);
  const tail = new THREE.Mesh(tailGeometry, snoutMaterial);
  tail.position.set(-size * 0.4, size * 0.4, 0);
  tail.scale.set(0.5, 1, 0.5);
  pig.add(tail);
  
  // Set initial position and properties
  pig.position.set(x, 0, z);
  pig.userData = { 
    type: 'pig', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.pig.moveSpeed,
    wanderRadius: CONFIG.objects.pig.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(pig);
  worldObjects.push(pig);
  animals.push(pig);
  
  return pig;
}

function createHorse(x, z) {
  const horse = new THREE.Group();
  const size = CONFIG.objects.horse.size;
  
  // Body (sleek and muscular)
  const bodyGeometry = new THREE.BoxGeometry(size * 1.3, size * 0.7, size * 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.bodyColor,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.7;
  // Taper the body
  body.scale.set(1, 1, 0.9);
  body.castShadow = true;
  body.receiveShadow = true;
  horse.add(body);
  
  // Chest (more muscular front)
  const chestGeometry = new THREE.SphereGeometry(size * 0.35, 6, 4);
  const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
  chest.position.set(size * 0.5, size * 0.7, 0);
  chest.scale.set(0.8, 1.1, 1.2);
  horse.add(chest);
  
  // Neck (curved and elegant)
  const neckGeometry = new THREE.CylinderGeometry(size * 0.2, size * 0.25, size * 0.5);
  const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
  neck.position.set(size * 0.55, size * 0.95, 0);
  neck.rotation.z = -Math.PI / 6;
  neck.castShadow = true;
  horse.add(neck);
  
  // Head (refined shape)
  const headGeometry = new THREE.BoxGeometry(size * 0.35, size * 0.4, size * 0.2);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.75, size * 1.15, 0);
  head.rotation.z = -0.1;
  head.scale.set(1, 0.8, 1);
  head.castShadow = true;
  horse.add(head);
  
  // Muzzle
  const muzzleGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.15, size * 0.18);
  const muzzle = new THREE.Mesh(muzzleGeometry, bodyMaterial);
  muzzle.position.set(size * 0.9, size * 1.05, 0);
  horse.add(muzzle);
  
  // Nostrils
  const nostrilGeometry = new THREE.SphereGeometry(size * 0.025, 4, 4);
  const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const nostril1 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  nostril1.position.set(size * 0.95, size * 1.05, size * 0.05);
  nostril1.scale.set(1.5, 1, 1);
  horse.add(nostril1);
  
  const nostril2 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  nostril2.position.set(size * 0.95, size * 1.05, -size * 0.05);
  nostril2.scale.set(1.5, 1, 1);
  horse.add(nostril2);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.04, 6, 6);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x4B0000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.7, size * 1.2, size * 0.1);
  horse.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.7, size * 1.2, -size * 0.1);
  horse.add(eye2);
  
  // Ears (pointed)
  const earGeometry = new THREE.ConeGeometry(size * 0.06, size * 0.12, 4);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.65, size * 1.35, size * 0.08);
  ear1.rotation.z = -0.2;
  ear1.rotation.x = 0.1;
  horse.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.65, size * 1.35, -size * 0.08);
  ear2.rotation.z = -0.2;
  ear2.rotation.x = -0.1;
  horse.add(ear2);
  
  // Mane (flowing)
  const maneGeometry = new THREE.BoxGeometry(size * 0.08, size * 0.4, size * 0.25);
  const maneMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.maneColor,
    roughness: 0.9
  });
  const mane = new THREE.Mesh(maneGeometry, maneMaterial);
  mane.position.set(size * 0.45, size * 1.15, 0);
  mane.rotation.z = -0.3;
  horse.add(mane);
  
  // Mane top
  const maneTopGeometry = new THREE.BoxGeometry(size * 0.06, size * 0.15, size * 0.2);
  const maneTop = new THREE.Mesh(maneTopGeometry, maneMaterial);
  maneTop.position.set(size * 0.65, size * 1.3, 0);
  horse.add(maneTop);
  
  // Legs (slender and strong)
  const upperLegGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.06, size * 0.35);
  const lowerLegGeometry = new THREE.CylinderGeometry(size * 0.04, size * 0.05, size * 0.35);
  const hoofGeometry = new THREE.CylinderGeometry(size * 0.06, size * 0.07, size * 0.08);
  const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x1C1C1C });
  
  const legPositions = [
    { x: size * 0.35, z: size * 0.15 },
    { x: size * 0.35, z: -size * 0.15 },
    { x: -size * 0.35, z: size * 0.15 },
    { x: -size * 0.35, z: -size * 0.15 }
  ];
  
  legPositions.forEach(pos => {
    // Upper leg
    const upperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
    upperLeg.position.set(pos.x, size * 0.525, pos.z);
    upperLeg.castShadow = true;
    horse.add(upperLeg);
    
    // Lower leg
    const lowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
    lowerLeg.position.set(pos.x, size * 0.175, pos.z);
    lowerLeg.castShadow = true;
    horse.add(lowerLeg);
    
    // Hoof
    const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
    hoof.position.set(pos.x, size * 0.04, pos.z);
    horse.add(hoof);
  });
  
  // Tail (flowing)
  const tailGeometry = new THREE.ConeGeometry(size * 0.12, size * 0.5, 6);
  const tail = new THREE.Mesh(tailGeometry, maneMaterial);
  tail.position.set(-size * 0.65, size * 0.5, 0);
  tail.rotation.z = Math.PI / 4;
  horse.add(tail);
  
  // Set initial position and properties
  horse.position.set(x, 0, z);
  horse.userData = { 
    type: 'horse', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.horse.moveSpeed,
    wanderRadius: CONFIG.objects.horse.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(horse);
  worldObjects.push(horse);
  animals.push(horse);
  
  return horse;
}

/**
 * Create a cat at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cat object
 */
function createCat(x, z) {
  const cat = new THREE.Group();
  const size = CONFIG.objects.cat.size;
  
  // Body - elongated cylinder
  const bodyGeometry = new THREE.CylinderGeometry(size * 0.3, size * 0.25, size * 1.2, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cat.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.3;
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  cat.add(body);
  
  // Head - sphere
  const headGeometry = new THREE.SphereGeometry(size * 0.35, 8, 8);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.5, size * 0.35, 0);
  head.castShadow = true;
  cat.add(head);
  
  // Ears - small cones
  const earGeometry = new THREE.ConeGeometry(size * 0.15, size * 0.2, 4);
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
  
  interactableObjects.add(cat);
  worldState.interiorObjects.push(cat);
  
  // Add to global animals array for movement updates
  if (!window.interiorAnimals) {
    window.interiorAnimals = [];
  }
  window.interiorAnimals.push(cat);
  
  return cat;
}

/**
 * Create a dog at the specified position
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
  
  // Snout - smaller box
  const snoutGeometry = new THREE.BoxGeometry(size * 0.2, size * 0.15, size * 0.2);
  const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
  snout.position.set(size * 0.85, size * 0.4, 0);
  dog.add(snout);
  
  // Ears - floppy triangular shapes
  const earGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.3, size * 0.05);
  const earMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.dog.earColor,
    roughness: 0.9
  });
  const ear1 = new THREE.Mesh(earGeometry, earMaterial);
  ear1.position.set(size * 0.65, size * 0.55, size * 0.15);
  ear1.rotation.z = 0.3;
  dog.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, earMaterial);
  ear2.position.set(size * 0.65, size * 0.55, -size * 0.15);
  ear2.rotation.z = 0.3;
  dog.add(ear2);
  
  // Eyes - black spheres
  const eyeGeometry = new THREE.SphereGeometry(size * 0.04, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.75, size * 0.5, size * 0.08);
  dog.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.75, size * 0.5, -size * 0.08);
  dog.add(eye2);
  
  // Tail - wagging cylinder
  const tailGeometry = new THREE.CylinderGeometry(size * 0.06, size * 0.04, size * 0.4, 4);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-size * 0.5, size * 0.5, 0);
  tail.rotation.z = Math.PI / 3;
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
  
  interactableObjects.add(dog);
  worldState.interiorObjects.push(dog);
  
  // Add to global animals array for movement updates
  if (!window.interiorAnimals) {
    window.interiorAnimals = [];
  }
  window.interiorAnimals.push(dog);
  
  return dog;
}

// ===================================================================
// INTERIOR WORLD SYSTEM
// ===================================================================

/**
 * Creates an interior room environment
 * @param {THREE.Object3D} house - The house object being entered
 */
function createInterior(house) {
  // Create interior group
  worldState.interiorGroup = new THREE.Group();
  worldState.interiorGroup.name = 'interior';
  
  // Initialize interior animals array
  if (!window.interiorAnimals) {
    window.interiorAnimals = [];
  }
  
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
  
  // Add furniture
  addFurnitureToInterior();
  
  // Add the interior to the scene
  scene.add(worldState.interiorGroup);
  
  // Store interior objects for cleanup
  worldState.interiorGroup.traverse(child => {
    if (child.isMesh) {
      worldState.interiorObjects.push(child);
    }
  });
}

/**
 * Adds furniture to the interior
 */
function addFurnitureToInterior() {
  const roomSize = CONFIG.interior.roomSize;
  
  // Living area - left side
  const couch = createCouch();
  couch.position.set(-roomSize / 3, 0, -roomSize / 3);
  couch.rotation.y = Math.PI / 2;
  worldState.interiorGroup.add(couch);
  
  const table = createTable();
  table.position.set(-roomSize / 3, 0, 0);
  worldState.interiorGroup.add(table);
  
  const tv = createTV();
  tv.position.set(-roomSize / 2 + 0.7, 0, 0);
  tv.rotation.y = Math.PI / 2;
  worldState.interiorGroup.add(tv);
  
  // Dining area - right side
  const diningTable = createTable();
  diningTable.position.set(roomSize / 3, 0, -roomSize / 4);
  worldState.interiorGroup.add(diningTable);
  
  // Add chairs around dining table
  const chair1 = createChair();
  chair1.position.set(roomSize / 3 - 0.8, 0, -roomSize / 4);
  chair1.rotation.y = Math.PI / 2;
  worldState.interiorGroup.add(chair1);
  
  const chair2 = createChair();
  chair2.position.set(roomSize / 3 + 0.8, 0, -roomSize / 4);
  chair2.rotation.y = -Math.PI / 2;
  worldState.interiorGroup.add(chair2);
  
  // Bedroom area - back
  const bed = createBed();
  bed.position.set(0, 0, -roomSize / 2 + 1.5);
  worldState.interiorGroup.add(bed);
}

/**
 * Removes the interior and restores the outside world
 */
function removeInterior() {
  if (worldState.interiorGroup) {
    // Remove all interior objects
    worldState.interiorObjects.forEach(obj => {
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
    worldState.interiorObjects = [];
    
    // Clear interior animals
    if (window.interiorAnimals) {
      window.interiorAnimals = [];
    }
  }
}

// ===================================================================
// FURNITURE CREATION FUNCTIONS
// ===================================================================

/**
 * Creates a chair object
 * @returns {THREE.Group} Chair group
 */
function createChair() {
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
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, config.height * 0.75, -config.depth / 2 + 0.025);
  back.castShadow = true;
  chair.add(back);
  
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
  
  return chair;
}

/**
 * Creates a table object
 * @returns {THREE.Group} Table group
 */
function createTable() {
  const table = new THREE.Group();
  const config = CONFIG.interior.furniture.table;
  
  // Table top
  const topGeometry = new THREE.BoxGeometry(config.width, 0.05, config.depth);
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: config.topColor,
    roughness: 0.6
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = config.height;
  top.castShadow = true;
  top.receiveShadow = true;
  table.add(top);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.05, config.height, 0.05);
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
  
  return table;
}

/**
 * Creates a couch object
 * @returns {THREE.Group} Couch group
 */
function createCouch() {
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
  const back = new THREE.Mesh(backGeometry, baseMaterial);
  back.position.set(0, config.height * 0.5, -config.width / 2 + 0.1);
  back.castShadow = true;
  couch.add(back);
  
  // Armrests
  const armGeometry = new THREE.BoxGeometry(0.2, config.height * 0.6, config.width);
  const armMaterial = new THREE.MeshStandardMaterial({ 
    color: config.mainColor,
    roughness: 0.8
  });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-config.length / 2 + 0.1, config.height * 0.3, 0);
  leftArm.castShadow = true;
  couch.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(config.length / 2 - 0.1, config.height * 0.3, 0);
  rightArm.castShadow = true;
  couch.add(rightArm);
  
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
      0.1
    );
    cushion.receiveShadow = true;
    couch.add(cushion);
  }
  
  return couch;
}

/**
 * Creates a TV object
 * @returns {THREE.Group} TV group
 */
function createTV() {
  const tv = new THREE.Group();
  const config = CONFIG.interior.furniture.tv;
  
  // Screen frame
  const frameGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.7
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = 1.2;
  frame.castShadow = true;
  tv.add(frame);
  
  // Screen
  const screenGeometry = new THREE.BoxGeometry(config.width - 0.1, config.height - 0.1, 0.01);
  const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: config.screenColor,
    roughness: 0.1,
    metalness: 0.5
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1.2, config.depth / 2);
  tv.add(screen);
  
  // Stand
  const standGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8);
  const standMaterial = new THREE.MeshStandardMaterial({ 
    color: config.standColor,
    roughness: 0.8
  });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.y = 0.4;
  stand.castShadow = true;
  tv.add(stand);
  
  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05);
  const base = new THREE.Mesh(baseGeometry, standMaterial);
  base.position.y = 0.025;
  base.castShadow = true;
  tv.add(base);
  
  return tv;
}

/**
 * Creates a bed object
 * @returns {THREE.Group} Bed group
 */
function createBed() {
  const bed = new THREE.Group();
  const config = CONFIG.interior.furniture.bed;
  
  // Frame
  const frameGeometry = new THREE.BoxGeometry(config.width, 0.3, config.length);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.7
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = 0.25;
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
  mattress.position.y = 0.5;
  mattress.receiveShadow = true;
  bed.add(mattress);
  
  // Headboard
  const headboardGeometry = new THREE.BoxGeometry(config.width, 0.8, 0.1);
  const headboard = new THREE.Mesh(headboardGeometry, frameMaterial);
  headboard.position.set(0, 0.7, -config.length / 2 + 0.05);
  headboard.castShadow = true;
  bed.add(headboard);
  
  // Pillows
  const pillowGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
  const pillowMaterial = new THREE.MeshStandardMaterial({ 
    color: config.pillowColor,
    roughness: 1
  });
  
  const pillow1 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow1.position.set(-config.width / 4, 0.65, -config.length / 2 + 0.3);
  pillow1.rotation.z = 0.1;
  bed.add(pillow1);
  
  const pillow2 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow2.position.set(config.width / 4, 0.65, -config.length / 2 + 0.3);
  pillow2.rotation.z = -0.1;
  bed.add(pillow2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.8
  });
  
  const legPositions = [
    { x: config.width / 2 - 0.1, z: config.length / 2 - 0.1 },
    { x: -config.width / 2 + 0.1, z: config.length / 2 - 0.1 },
    { x: config.width / 2 - 0.1, z: -config.length / 2 + 0.1 },
    { x: -config.width / 2 + 0.1, z: -config.length / 2 + 0.1 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, 0.1, pos.z);
    leg.castShadow = true;
    bed.add(leg);
  });
  
  return bed;
}

// ===================================================================
// INPUT HANDLING
// ===================================================================

function setupEventListeners() {
  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Mouse controls
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);
}

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
      if (!mouseControls.active) {
        applyCameraMovement(0.1, 0);
      }
      break;
    case 'KeyE':
      if (!mouseControls.active) {
        applyCameraMovement(-0.1, 0);
      }
      break;
    case 'KeyB':
      buildObject();
      break;
    case 'Digit0':
      selectedObjectType = 0; // Fists
      updateObjectSelector();
      break;
    case 'Digit1':
      selectedObjectType = 1; // Tree
      updateObjectSelector();
      break;
    case 'Digit2':
      selectedObjectType = 2; // Rock
      updateObjectSelector();
      break;
    case 'Digit3':
      selectedObjectType = 3; // House
      updateObjectSelector();
      break;
    case 'Digit4':
      selectedObjectType = 4; // Cow
      updateObjectSelector();
      break;
    case 'Digit5':
      selectedObjectType = 5; // Pig
      updateObjectSelector();
      break;
    case 'Digit6':
      selectedObjectType = 6; // Horse or Cat (inside)
      updateObjectSelector();
      break;
    case 'Digit7':
      selectedObjectType = 7; // Dog (inside only)
      updateObjectSelector();
      break;
  }
}

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


function onMouseMove(event) {
  if (mouseControls.active) {
    mouseControls.movementX = event.movementX || 0;
    mouseControls.movementY = event.movementY || 0;
  }
}

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
  
  // Create interior world
  createInterior(house);
  
  // Position player inside near the door
  camera.position.set(0, CONFIG.player.height, CONFIG.interior.roomSize / 2 - 2);
  cameraController.yaw = Math.PI; // Face into the room
  cameraController.pitch = 0;
  
  // Update world state
  worldState.isInside = true;
  
  // Reset selected object type to fists
  selectedObjectType = 0;
  
  // Update selector to show interior items
  updateSelectorContent();
}

/**
 * Transitions from house interior back to outside world
 */
function exitToOutside() {
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
  
  // Update world state
  worldState.isInside = false;
  worldState.currentHouse = null;
  
  // Reset selected object type to fists
  selectedObjectType = 0;
  
  // Update selector to show exterior items
  updateSelectorContent();
  
  // Reset any highlighted objects
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    highlightedObject = null;
  }
}

function onPointerLockChange() {
  mouseControls.active = document.pointerLockElement === renderer.domElement;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

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

// ===================================================================
// CAMERA CONTROLS
// ===================================================================

function updateCameraRotation() {
  // Apply camera rotation with proper Euler order to prevent tilting
  camera.rotation.order = 'YXZ';
  camera.rotation.y = cameraController.yaw;
  camera.rotation.x = cameraController.pitch;
  camera.rotation.z = 0; // Always ensure no roll
}

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

function getForwardVector() {
  // Get forward direction based on yaw only (for movement)
  return new THREE.Vector3(
    -Math.sin(cameraController.yaw),
    0,
    -Math.cos(cameraController.yaw)
  );
}

function getRightVector() {
  // Get right direction based on yaw only
  return new THREE.Vector3(
    -Math.cos(cameraController.yaw),
    0,
    Math.sin(cameraController.yaw)
  );
}

// ===================================================================
// GAME LOGIC
// ===================================================================

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

function updateAnimals(delta) {
  const currentTime = clock.getElapsedTime();
  
  // Update world animals when outside
  if (!worldState.isInside && animals) {
    animals.forEach(animal => {
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
      const boundary = CONFIG.world.size / 2 - 20;
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
  if (worldState.isInside && window.interiorAnimals) {
    window.interiorAnimals.forEach(animal => {
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
        const boundary = roomSize / 2 - 1;
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
        
        // Bobbing animation based on animal type and speed
        const bobSpeed = 8 + animal.userData.moveSpeed;
        const bobAmount = Math.sin(currentTime * bobSpeed) * 0.02;
        animal.position.y = Math.abs(bobAmount) * animal.userData.moveSpeed / 4;
        
        // Subtle sway animation
        animal.rotation.z = Math.sin(currentTime * bobSpeed * 0.7) * 0.01;
        
        // Cat-specific animations
        if (animal.userData.type === 'cat') {
          // Tail sway
          const tail = animal.children.find(child => child.position.x < 0 && child.position.y > 0.3);
          if (tail) {
            tail.rotation.y = Math.sin(currentTime * 3) * 0.2;
          }
        }
        
        // Dog-specific animations
        if (animal.userData.type === 'dog' && animal.userData.tail) {
          // Tail wagging
          animal.userData.tail.rotation.y = Math.sin(currentTime * 10) * 0.4;
          animal.userData.tail.rotation.z = Math.PI / 3 + Math.sin(currentTime * 8) * 0.1;
        }
      } else {
        // Idle animation when stopped
        animal.position.y = Math.sin(currentTime * 2) * 0.005; // Gentle breathing
        animal.rotation.z = 0;
        
        // Occasionally look around when idle
        if (Math.random() < 0.02) {
          animal.rotation.y += (Math.random() - 0.5) * 0.3;
        }
        
        // Idle tail movement for dogs
        if (animal.userData.type === 'dog' && animal.userData.tail) {
          animal.userData.tail.rotation.y = Math.sin(currentTime * 2) * 0.1;
        }
      }
      
      // Keep animals within room bounds
      const boundary = CONFIG.interior.roomSize / 2 - 0.5;
      animal.position.x = THREE.MathUtils.clamp(animal.position.x, -boundary, boundary);
      animal.position.z = THREE.MathUtils.clamp(animal.position.z, -boundary, boundary);
    });
  }
}

function updateObjectHighlight() {
  // Cast ray from camera center
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  // Include both world and interior objects
  const objectsToCheck = worldState.isInside ? 
    [worldState.interiorGroup] : 
    interactableObjects.children;
  
  const intersects = raycaster.intersectObjects(objectsToCheck, true);
  
  // Reset previous highlight
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    highlightedObject = null;
  }
  
  // Highlight new object if within range
  if (intersects.length > 0) {
    const distance = intersects[0].distance;
    
    // Check for door interactions first
    let doorObject = intersects[0].object;
    if (doorObject.userData && doorObject.userData.type === 'door' && 
        doorObject.userData.isInteractive && distance < CONFIG.building.distance) {
      highlightedObject = doorObject;
      highlightDoor(doorObject);
      return; // Don't check other objects if door is highlighted
    }
    
    // Otherwise check for removable objects
    const object = findParentObject(intersects[0].object);
    if (object && object.userData.removable && distance < CONFIG.building.distance) {
      highlightedObject = object;
      highlightObject(object);
    }
  }
  
  // Update ghost object for building preview
  updateGhostObject();
}

function findParentObject(mesh) {
  let current = mesh;
  while (current && !current.userData.type) {
    current = current.parent;
  }
  return current;
}

function highlightObject(object) {
  object.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.emissive = new THREE.Color(CONFIG.building.highlightColor);
      child.material.emissiveIntensity = 0.3;
    }
  });
}

function resetObjectHighlight(object) {
  // Check if it's a door
  if (object.userData && object.userData.type === 'door') {
    // Restore original material for door
    if (object.userData.originalMaterial) {
      object.material = object.userData.originalMaterial;
    }
  } else {
    // Regular object highlight reset
    object.traverse(child => {
      if (child.isMesh) {
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
  if (door.isMesh) {
    door.material = door.material.clone();
    door.material.emissive = new THREE.Color(CONFIG.interior.doorHighlightColor);
    door.material.emissiveIntensity = 0.4;
  }
}

/**
 * Update the ghost preview object for building
 * Shows a transparent preview of the object that will be placed
 */
function updateGhostObject() {
  // Remove existing ghost
  if (ghostObject) {
    disposeObject(ghostObject);
    ghostObject = null;
  }
  
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Don't create ghost for fists
  if (type === 'fists') return;
  
  // Create new ghost for building preview
  const buildPos = getBuildPosition();
  if (buildPos) {
    // Create a simplified ghost object
    const ghostGroup = new THREE.Group();
    
    switch (type) {
      case 'tree':
        // Simple tree preview
        const treeGhost = new THREE.Mesh(
          new THREE.ConeGeometry(2, 6, 8),
          new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        treeGhost.position.y = 3;
        ghostGroup.add(treeGhost);
        break;
        
      case 'rock':
        // Simple rock preview
        const rockGhost = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 6, 5),
          new THREE.MeshBasicMaterial({ 
            color: 0x888888, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        rockGhost.scale.set(1.1, 0.8, 1.1);
        rockGhost.position.y = 0.5;
        ghostGroup.add(rockGhost);
        break;
        
      case 'house':
        // Simple house preview
        const houseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 4),
          new THREE.MeshBasicMaterial({ 
            color: 0xffaa00, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        houseGhost.position.y = 1.5;
        ghostGroup.add(houseGhost);
        break;
        
      case 'cow':
        // Simple cow preview
        const cowGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.05, 1.2),
          new THREE.MeshBasicMaterial({ 
            color: 0x8B4513, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        cowGhost.position.y = 0.75;
        ghostGroup.add(cowGhost);
        break;
        
      case 'pig':
        // Simple pig preview
        const pigGhost = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 4),
          new THREE.MeshBasicMaterial({ 
            color: 0xFFB6C1, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        pigGhost.position.y = 0.45;
        pigGhost.scale.set(1.4, 0.9, 1.1);
        ghostGroup.add(pigGhost);
        break;
        
      case 'horse':
        // Simple horse preview
        const horseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2.3, 1.3, 0.9),
          new THREE.MeshBasicMaterial({ 
            color: 0x654321, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        horseGhost.position.y = 0.9;
        ghostGroup.add(horseGhost);
        break;
        
      // Interior object ghosts
      case 'chair':
        const chairGhost = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 1, 0.5),
          new THREE.MeshBasicMaterial({ 
            color: 0x8B4513, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        chairGhost.position.y = 0.5;
        ghostGroup.add(chairGhost);
        break;
        
      case 'table':
        const tableGhost = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.8, 1),
          new THREE.MeshBasicMaterial({ 
            color: 0x654321, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        tableGhost.position.y = 0.4;
        ghostGroup.add(tableGhost);
        break;
        
      case 'couch':
        const couchGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.8, 0.8),
          new THREE.MeshBasicMaterial({ 
            color: 0x4169E1, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        couchGhost.position.y = 0.4;
        ghostGroup.add(couchGhost);
        break;
        
      case 'tv':
        const tvGhost = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.8, 0.1),
          new THREE.MeshBasicMaterial({ 
            color: 0x000000, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        tvGhost.position.y = 0.4;
        ghostGroup.add(tvGhost);
        break;
        
      case 'bed':
        const bedGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.6, 1.5),
          new THREE.MeshBasicMaterial({ 
            color: 0x8B7355, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        bedGhost.position.y = 0.3;
        ghostGroup.add(bedGhost);
        break;
        
      case 'cat':
        const catGhost = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.3, 0.3),
          new THREE.MeshBasicMaterial({ 
            color: 0x808080, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        catGhost.position.y = 0.15;
        ghostGroup.add(catGhost);
        break;
        
      case 'dog':
        const dogGhost = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.4, 0.3),
          new THREE.MeshBasicMaterial({ 
            color: 0xD2691E, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        dogGhost.position.y = 0.2;
        ghostGroup.add(dogGhost);
        break;
    }
    
    ghostObject = ghostGroup;
    ghostObject.position.copy(buildPos);
    scene.add(ghostObject);
  }
}

function getBuildPosition() {
  // Cast a ray from the camera to find where to place the object
  const rayDirection = new THREE.Vector3();
  camera.getWorldDirection(rayDirection);
  
  // Check if we're looking more at the floor or ahead
  const isLookingDown = rayDirection.y < -0.3;
  
  if (isLookingDown || worldState.isInside) {
    // Cast ray to find floor intersection
    const rayOrigin = camera.position.clone();
    const ray = new THREE.Raycaster(rayOrigin, rayDirection);
    
    // Create a temporary floor plane at y=0
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    if (ray.ray.intersectPlane(floorPlane, intersection)) {
      // Clamp the distance to reasonable bounds
      const distance = camera.position.distanceTo(intersection);
      const maxDistance = worldState.isInside ? CONFIG.interior.roomSize / 2 : CONFIG.building.distance * 2;
      const minDistance = 2;
      
      if (distance > minDistance && distance < maxDistance) {
        return intersection;
      }
    }
  }
  
  // Default behavior - place at fixed distance in front
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // Keep it horizontal
  forward.normalize();
  
  const buildPos = camera.position.clone();
  const distance = worldState.isInside ? 4 : CONFIG.building.distance;
  buildPos.add(forward.multiplyScalar(distance));
  buildPos.y = 0;
  
  return buildPos;
}

// ===================================================================
// BUILDING SYSTEM
// ===================================================================

function buildObject() {
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Don't build if fists are selected
  if (type === 'fists') return;
  
  const buildPos = getBuildPosition();
  if (buildPos) {
    if (worldState.isInside) {
      // Interior objects
      switch (type) {
        case 'chair':
          const chair = createChair();
          chair.position.set(buildPos.x, 0, buildPos.z);
          worldState.interiorGroup.add(chair);
          break;
        case 'table':
          const table = createTable();
          table.position.set(buildPos.x, 0, buildPos.z);
          worldState.interiorGroup.add(table);
          break;
        case 'couch':
          const couch = createCouch();
          couch.position.set(buildPos.x, 0, buildPos.z);
          worldState.interiorGroup.add(couch);
          break;
        case 'tv':
          const tv = createTV();
          tv.position.set(buildPos.x, 0, buildPos.z);
          worldState.interiorGroup.add(tv);
          break;
        case 'bed':
          const bed = createBed();
          bed.position.set(buildPos.x, 0, buildPos.z);
          worldState.interiorGroup.add(bed);
          break;
        case 'cat':
          const cat = createCat(buildPos.x, buildPos.z);
          worldState.interiorGroup.add(cat);
          break;
        case 'dog':
          const dog = createDog(buildPos.x, buildPos.z);
          worldState.interiorGroup.add(dog);
          break;
      }
    } else {
      // Exterior objects
      switch (type) {
        case 'tree':
          createTree(buildPos.x, buildPos.z);
          break;
        case 'rock':
          createRock(buildPos.x, buildPos.z);
          break;
        case 'house':
          createHouse(buildPos.x, buildPos.z);
          break;
        case 'cow':
          createCow(buildPos.x, buildPos.z);
          break;
        case 'pig':
          createPig(buildPos.x, buildPos.z);
          break;
        case 'horse':
          createHorse(buildPos.x, buildPos.z);
          break;
      }
    }
  }
}

/**
 * Remove the currently highlighted object from the world
 * Properly disposes of Three.js resources and updates arrays
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
      const index = worldState.interiorObjects.indexOf(highlightedObject);
      if (index > -1) {
        worldState.interiorObjects.splice(index, 1);
      }
      
      // Remove from parent group if it has one
      if (highlightedObject.parent) {
        highlightedObject.parent.remove(highlightedObject);
      }
    } else {
      // Remove from world objects array
      const index = worldObjects.indexOf(highlightedObject);
      if (index > -1) {
        worldObjects.splice(index, 1);
      }
      
      // Remove from animals array if it's an animal
      if (highlightedObject.userData.isAnimal) {
        const animalIndex = animals.indexOf(highlightedObject);
        if (animalIndex > -1) {
          animals.splice(animalIndex, 1);
        }
      }
    }
    
    // Dispose of object resources
    disposeObject(highlightedObject);
    
    // Clear reference
    highlightedObject = null;
    
  } catch (error) {
    console.error('Failed to remove object:', error);
  }
}

// ===================================================================
// UI ELEMENTS
// ===================================================================

/**
 * Create all UI elements for the game
 */
function createUIElements() {
  createCrosshair();
  createCompass();
  createObjectSelector();
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

/**
 * Update the object selector UI to show current selection
 * Highlights the currently selected building object type
 */
function updateObjectSelector() {
  // Just update the content which will handle the selection highlight
  updateSelectorContent();
}

// ===================================================================
// ANIMATION LOOP
// ===================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  updatePlayer(delta);
  
  // Only update outside world systems when not inside
  if (!worldState.isInside) {
    updateDayNightCycle();
  }
  
  // Update animals (both interior and exterior)
  updateAnimals(delta);
  
  updateObjectHighlight();
  
  renderer.render(scene, camera);
}

// ===================================================================
// CLEANUP
// ===================================================================

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
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onClick);
  document.removeEventListener('pointerlockchange', onPointerLockChange);
  window.removeEventListener('resize', onWindowResize);
}

// ===================================================================
// START GAME
// ===================================================================

// Initialize on load
window.addEventListener('load', init);

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);