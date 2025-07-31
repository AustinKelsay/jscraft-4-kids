/**
 * Interior world system and furniture creation
 */

import { CONFIG } from './config.js';
import { scene, worldState } from './gameState.js';

/**
 * Creates an interior room environment
 * @param {THREE.Object3D} house - The house object being entered
 */
export function createInterior(house) {
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
export function removeInterior() {
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
  }
}

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