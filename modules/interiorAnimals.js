/**
 * Interior Animals Module
 * 
 * Handles creation and management of indoor animals (cats, dogs)
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { interiorAnimals, interactableObjects, worldState } from './gameState.js';

/**
 * Creates a cat at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cat object
 */
export function createCat(x, z) {
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
export function createDog(x, z) {
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