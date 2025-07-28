// JSCraft 3D - Three.js Implementation
// A simple first-person 3D game for kids

// ===================================================================
// CONFIGURATION
// ===================================================================

const CONFIG = {
  world: {
    size: 1000,
    groundSize: 2000
  },
  player: {
    height: 1.7,
    speed: 10,
    lookSpeed: 0.002,
    jumpSpeed: 10,
    gravity: 30
  },
  building: {
    distance: 5,
    highlightColor: 0xffff00
  },
  dayNight: {
    dayDuration: 120, // seconds
    nightDuration: 60 // seconds
  },
  objects: {
    tree: {
      trunkColor: 0x8B4513,
      leavesColor: 0x228B22,
      minHeight: 4,
      maxHeight: 8,
      minRadius: 2,
      maxRadius: 3
    },
    rock: {
      color: 0x696969,
      minSize: 0.5,
      maxSize: 2
    },
    house: {
      wallColor: 0xD2691E,
      roofColor: 0x8B4513,
      doorColor: 0x654321,
      windowColor: 0x87CEEB,
      minSize: 3,
      maxSize: 5
    }
  }
};

// ===================================================================
// GAME STATE
// ===================================================================

let scene, camera, renderer;
let raycaster, mouse;
let clock;

// Player state
let player = {
  velocity: new THREE.Vector3(),
  canJump: true,
  height: CONFIG.player.height
};

// Camera controller state
let cameraController = {
  yaw: 0,      // Horizontal rotation (Y-axis)
  pitch: 0,    // Vertical rotation (X-axis)
  // Prevent gimbal lock by using separate yaw/pitch values
};

// Input state
let keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false
};

let mouseControls = {
  active: false,
  movementX: 0,
  movementY: 0
};

// Building state
let selectedObjectType = 0;
let buildableTypes = ['tree', 'rock', 'house'];
let highlightedObject = null;
let ghostObject = null;

// World objects
let worldObjects = [];
let interactableObjects = new THREE.Group();

// Lighting
let sunLight, moonLight, ambientLight;
let skyMesh;

// UI Elements
let crosshairDiv, compassDiv, selectorDiv, instructionsDiv;

// ===================================================================
// INITIALIZATION
// ===================================================================

function init() {
  // Clock for time tracking
  clock = new THREE.Clock();
  
  // Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, CONFIG.player.height, 0);
  
  // Initialize camera rotation properly
  updateCameraRotation();
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('gameCanvas'),
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Raycaster for object interaction
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
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
}

// ===================================================================
// WORLD CREATION
// ===================================================================

function createWorld() {
  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(CONFIG.world.groundSize, CONFIG.world.groundSize, 100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a7d3a,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Add some variation to ground vertices for a more natural look
  const vertices = groundGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 0.2 - 0.1; // Small height variations
  }
  groundGeometry.computeVertexNormals();
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Add grid helper for reference (optional, can be removed)
  const gridHelper = new THREE.GridHelper(CONFIG.world.size, 50, 0x444444, 0x222222);
  scene.add(gridHelper);
  
  // Create sky sphere
  const skyGeometry = new THREE.SphereGeometry(500, 32, 16);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide
  });
  skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyMesh);
  
  // Add interactable objects group
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
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);
  
  // Moon light (initially disabled)
  moonLight = new THREE.DirectionalLight(0x6666ff, 0.3);
  moonLight.position.set(-50, 100, -50);
  moonLight.castShadow = true;
  moonLight.visible = false;
  scene.add(moonLight);
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
  
  // Foliage (3 layers for fuller appearance)
  const foliageGeometry = new THREE.ConeGeometry(radius, height * 0.6, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.leavesColor,
    roughness: 0.9
  });
  
  for (let i = 0; i < 3; i++) {
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
  
  // Create irregular rock shape
  const geometry = new THREE.DodecahedronGeometry(size, 0);
  
  // Deform vertices for more natural look
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] *= THREE.MathUtils.randFloat(0.8, 1.2);
    positions[i + 1] *= THREE.MathUtils.randFloat(0.7, 1.1);
    positions[i + 2] *= THREE.MathUtils.randFloat(0.8, 1.2);
  }
  geometry.computeVertexNormals();
  
  const material = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.rock.color,
    roughness: 0.9,
    metalness: 0.1
  });
  
  const rock = new THREE.Mesh(geometry, material);
  rock.position.set(x, size * 0.4, z);
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
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
    emissiveIntensity: 0.2
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
      applyCameraMovement(0.1, 0);
      break;
    case 'KeyE':
      applyCameraMovement(-0.1, 0);
      break;
    case 'KeyB':
      buildObject();
      break;
    case 'Digit1':
      selectedObjectType = 0;
      updateObjectSelector();
      break;
    case 'Digit2':
      selectedObjectType = 1;
      updateObjectSelector();
      break;
    case 'Digit3':
      selectedObjectType = 2;
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
      -Math.PI / 2, 
      Math.PI / 2
    );
  }
  
  // Apply the rotation
  updateCameraRotation();
}

function getForwardVector() {
  // Get forward direction based on yaw only (for movement)
  return new THREE.Vector3(
    Math.sin(cameraController.yaw),
    0,
    Math.cos(cameraController.yaw)
  );
}

function getRightVector() {
  // Get right direction based on yaw only
  return new THREE.Vector3(
    Math.cos(cameraController.yaw),
    0,
    -Math.sin(cameraController.yaw)
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
  if (keys.left) moveVector.sub(right);
  if (keys.right) moveVector.add(right);
  
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
    
    sunLight.position.x = Math.cos(sunAngle) * 100;
    sunLight.position.y = Math.sin(sunAngle) * 100;
    sunLight.visible = true;
    moonLight.visible = false;
    
    lightIntensity = 0.5 + Math.sin(sunAngle) * 0.5;
    sunLight.intensity = lightIntensity;
    ambientLight.intensity = 0.3 + lightIntensity * 0.2;
    
    // Sky color transitions
    if (progress < 0.1 || progress > 0.9) {
      // Sunrise/sunset
      skyColor = new THREE.Color(0xff6b35);
    } else {
      skyColor = new THREE.Color(0x87ceeb);
    }
  } else {
    // Night time
    progress = (elapsed - CONFIG.dayNight.dayDuration) / CONFIG.dayNight.nightDuration;
    const moonAngle = progress * Math.PI;
    
    moonLight.position.x = -Math.cos(moonAngle) * 100;
    moonLight.position.y = Math.sin(moonAngle) * 100;
    moonLight.visible = true;
    sunLight.visible = false;
    
    lightIntensity = 0.1 + Math.sin(moonAngle) * 0.2;
    moonLight.intensity = lightIntensity;
    ambientLight.intensity = 0.1;
    
    skyColor = new THREE.Color(0x191970);
  }
  
  // Update sky and fog colors
  skyMesh.material.color = skyColor;
  scene.fog.color = skyColor;
  
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

function updateGhostObject() {
  // Remove existing ghost
  if (ghostObject) {
    scene.remove(ghostObject);
    ghostObject = null;
  }
  
  // Create new ghost for building preview
  const buildPos = getBuildPosition();
  if (buildPos) {
    const type = buildableTypes[selectedObjectType];
    
    switch (type) {
      case 'tree':
        ghostObject = createTree(0, 0);
        break;
      case 'rock':
        ghostObject = createRock(0, 0);
        break;
      case 'house':
        ghostObject = createHouse(0, 0);
        break;
    }
    
    if (ghostObject) {
      ghostObject.position.copy(buildPos);
      ghostObject.traverse(child => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.5;
        }
      });
      scene.add(ghostObject);
      interactableObjects.remove(ghostObject);
      worldObjects.pop();
    }
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
  const buildPos = getBuildPosition();
  if (buildPos) {
    const type = buildableTypes[selectedObjectType];
    
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

function removeObject() {
  if (highlightedObject && highlightedObject.userData.removable) {
    interactableObjects.remove(highlightedObject);
    const index = worldObjects.indexOf(highlightedObject);
    if (index > -1) {
      worldObjects.splice(index, 1);
    }
    highlightedObject = null;
  }
}

// ===================================================================
// UI ELEMENTS
// ===================================================================

function createUIElements() {
  // Crosshair
  crosshairDiv = document.createElement('div');
  crosshairDiv.innerHTML = `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <div style="width: 20px; height: 2px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
      <div style="width: 2px; height: 20px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
    </div>
  `;
  document.body.appendChild(crosshairDiv);
  
  // Compass
  compassDiv = document.createElement('div');
  compassDiv.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: 80px;
    height: 80px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: white;
    font-family: Arial;
    font-size: 12px;
  `;
  compassDiv.innerHTML = `
    <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%);">N</div>
    <div id="compassNeedle" style="position: absolute; top: 50%; left: 50%; width: 2px; height: 30px; background: red; transform-origin: center bottom;"></div>
    <div id="timeDisplay" style="position: absolute; top: 90px; left: 50%; transform: translateX(-50%); text-align: center; width: 100px;">Day</div>
  `;
  document.body.appendChild(compassDiv);
  
  // Object selector
  selectorDiv = document.createElement('div');
  selectorDiv.style.cssText = `
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
  selectorDiv.innerHTML = `
    <div class="selector-item" data-type="0" style="width: 60px; height: 60px; background: #333; border: 2px solid #ff0; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
      <div>🌳<br>Tree<br>[1]</div>
    </div>
    <div class="selector-item" data-type="1" style="width: 60px; height: 60px; background: #333; border: 2px solid #666; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
      <div>🪨<br>Rock<br>[2]</div>
    </div>
    <div class="selector-item" data-type="2" style="width: 60px; height: 60px; background: #333; border: 2px solid #666; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
      <div>🏠<br>House<br>[3]</div>
    </div>
  `;
  document.body.appendChild(selectorDiv);
  
  // Instructions (update existing)
  instructionsDiv = document.getElementById('instructions');
  if (instructionsDiv) {
    instructionsDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    instructionsDiv.style.color = 'white';
    instructionsDiv.style.padding = '10px';
    instructionsDiv.style.borderRadius = '5px';
  }
  
  updateObjectSelector();
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

function updateObjectSelector() {
  const items = selectorDiv.querySelectorAll('.selector-item');
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
// START GAME
// ===================================================================

window.addEventListener('load', init);