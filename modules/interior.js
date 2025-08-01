/**
 * Interior world system and furniture creation
 */

import { CONFIG } from './config.js';
import { scene, worldState, interiorObjects, interiorAnimals } from './gameState.js';
import { disposeObject } from './utils.js';
import { createChair, createTable, createCouch, createTV, createBed, addFurnitureToInterior } from './interiorObjects.js';

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
  addFurnitureToInterior(worldState.interiorGroup);
  
  // Add the interior to the scene
  scene.add(worldState.interiorGroup);
  
  // Store interior objects for cleanup
  worldState.interiorGroup.traverse(child => {
    if (child.isMesh) {
      interiorObjects.push(child);
    }
  });
}


/**
 * Removes the interior and restores the outside world
 */
export function removeInterior() {
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

