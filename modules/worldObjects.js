/**
 * World Objects Module
 * 
 * Handles creation and management of outdoor static objects (trees, rocks, houses)
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { worldObjects, interactableObjects } from './gameState.js';

/**
 * Creates a tree at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 */
export function createTree(x, z) {
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
export function createRock(x, z) {
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
export function createHouse(x, z, uuid = null) {
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
export function createInitialWorldObjects(scene) {
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