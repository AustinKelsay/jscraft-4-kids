/**
 * World Animals Module
 * 
 * Handles creation and management of outdoor animals (cows, pigs, horses)
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { worldAnimals, interactableObjects } from './gameState.js';

/**
 * Creates a cow at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cow object
 */
export function createCow(x, z) {
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
export function createPig(x, z) {
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
export function createHorse(x, z) {
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
export function createInitialAnimals(scene) {
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