/**
 * Object creation functions for trees, rocks, and houses
 */

import { CONFIG } from './config.js';
import { interactableObjects, worldObjects } from './gameState.js';

/**
 * Create a tree at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created tree object
 */
export function createTree(x, z) {
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

/**
 * Create a rock at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Mesh} The created rock object
 */
export function createRock(x, z) {
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

/**
 * Create a house at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created house object
 */
export function createHouse(x, z) {
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

/**
 * Create initial objects in the world
 */
export function createInitialObjects() {
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