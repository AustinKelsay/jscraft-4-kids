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
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.trunkColor,
    roughness: 0.8
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);
  
  // Foliage
  const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.tree.foliageColor,
    roughness: 0.9
  });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 5;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  tree.add(foliage);
  
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
 */
export function createHouse(x, z) {
  const house = new THREE.Group();
  
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
  door.userData = { type: 'door', parentHouse: house };
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
      const tree = createTree(x, z);
      scene.add(tree);
    } else if (type < 0.7) {
      const rock = createRock(x, z);
      scene.add(rock);
    } else {
      const house = createHouse(x, z);
      scene.add(house);
    }
  }
}