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
const buildableTypes = ['fists', 'tree', 'rock', 'house'];
let highlightedObject = null;
let ghostObject = null;

/**
 * World object management
 */
const worldObjects = [];
let interactableObjects;

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
  
  // Door
  const doorGeometry = new THREE.BoxGeometry(size * 0.2, size * 0.4, 0.1);
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.house.doorColor 
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, size * 0.2, size * 0.51);
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
  house.userData = { type: 'house', removable: true };
  
  interactableObjects.add(house);
  worldObjects.push(house);
  
  return house;
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
  if (!mouseControls.active) {
    renderer.domElement.requestPointerLock();
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
  const boundary = CONFIG.world.size / 2;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -boundary, boundary);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -boundary, boundary);
  
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

function updateObjectHighlight() {
  // Cast ray from camera center
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(interactableObjects.children, true);
  
  // Reset previous highlight
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    highlightedObject = null;
  }
  
  // Highlight new object if within range
  if (intersects.length > 0) {
    const object = findParentObject(intersects[0].object);
    const distance = intersects[0].distance;
    
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
  object.traverse(child => {
    if (child.isMesh) {
      child.material.emissive = new THREE.Color(0x000000);
      child.material.emissiveIntensity = 0;
    }
  });
}

/**
 * Update the ghost preview object for building
 */
function updateGhostObject() {
  // Remove existing ghost
  if (ghostObject) {
    disposeObject(ghostObject);
    ghostObject = null;
  }
  
  // Don't create ghost for fists
  const type = buildableTypes[selectedObjectType];
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
    }
    
    ghostObject = ghostGroup;
    ghostObject.position.copy(buildPos);
    scene.add(ghostObject);
  }
}

function getBuildPosition() {
  // Get forward direction for building placement
  const forward = getForwardVector();
  
  const buildPos = camera.position.clone();
  buildPos.add(forward.multiplyScalar(CONFIG.building.distance));
  buildPos.y = 0;
  
  return buildPos;
}

// ===================================================================
// BUILDING SYSTEM
// ===================================================================

function buildObject() {
  const type = buildableTypes[selectedObjectType];
  
  // Don't build if fists are selected
  if (type === 'fists') return;
  
  const buildPos = getBuildPosition();
  if (buildPos) {
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
    
    // Remove from world objects array
    const index = worldObjects.indexOf(highlightedObject);
    if (index > -1) {
      worldObjects.splice(index, 1);
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
  
  // Create selector items
  const items = [
    { icon: '✊', label: 'Fists', key: '0' },
    { icon: '🌳', label: 'Tree', key: '1' },
    { icon: '🪨', label: 'Rock', key: '2' },
    { icon: '🏠', label: 'House', key: '3' }
  ];
  
  selector.innerHTML = items.map((item, index) => `
    <div class="selector-item" data-type="${index}" style="
      width: ${CONFIG.ui.selectorItemSize}px;
      height: ${CONFIG.ui.selectorItemSize}px;
      background: #333;
      border: 2px solid ${index === 0 ? '#ff0' : '#666'};
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
  
  document.body.appendChild(selector);
  uiElements.selector = selector;
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
 */
function updateObjectSelector() {
  if (!uiElements.selector) return;
  
  const items = uiElements.selector.querySelectorAll('.selector-item');
  items.forEach((item, index) => {
    if (index === selectedObjectType) {
      item.style.border = '2px solid #ff0';
    } else {
      item.style.border = '2px solid #666';
    }
  });
}

// ===================================================================
// ANIMATION LOOP
// ===================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  updatePlayer(delta);
  updateDayNightCycle();
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