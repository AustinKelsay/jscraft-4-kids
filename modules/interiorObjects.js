/**
 * Interior Objects Module
 * 
 * Handles creation and management of indoor furniture (chairs, tables, couches, TVs, beds)
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { interiorObjects, interactableObjects, worldState } from './gameState.js';

/**
 * Creates a chair at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created chair object
 */
export function createChair(x = 0, z = 0) {
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
  const backrest = new THREE.Mesh(backGeometry, seatMaterial);
  backrest.position.set(0, config.height * 0.75, -config.depth / 2 + 0.025);
  backrest.castShadow = true;
  chair.add(backrest);
  
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
  
  chair.position.set(x, 0, z);
  chair.userData = { type: 'chair', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(chair);
  } else {
    interactableObjects.add(chair);
    interiorObjects.push(chair); // Only add to array if not in interior group
  }
  
  return chair;
}

/**
 * Creates a table at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created table object
 */
export function createTable(x = 0, z = 0) {
  const table = new THREE.Group();
  const config = CONFIG.interior.furniture.table;
  
  // Tabletop
  const topGeometry = new THREE.BoxGeometry(config.width, 0.1, config.depth);
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: config.topColor,
    roughness: 0.6
  });
  const tabletop = new THREE.Mesh(topGeometry, topMaterial);
  tabletop.position.y = config.height;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  table.add(tabletop);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.height);
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
  
  table.position.set(x, 0, z);
  table.userData = { type: 'table', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(table);
  } else {
    interactableObjects.add(table);
    interiorObjects.push(table); // Only add to array if not in interior group
  }
  
  return table;
}

/**
 * Creates a couch at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created couch object
 */
export function createCouch(x = 0, z = 0) {
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
  const backrest = new THREE.Mesh(backGeometry, baseMaterial);
  backrest.position.set(0, config.height / 2, -config.width / 2 + 0.1);
  backrest.castShadow = true;
  couch.add(backrest);
  
  // Armrests
  const armGeometry = new THREE.BoxGeometry(0.2, config.height * 0.6, config.width);
  const armrest1 = new THREE.Mesh(armGeometry, baseMaterial);
  armrest1.position.set(config.length / 2 - 0.1, config.height * 0.3, 0);
  armrest1.castShadow = true;
  couch.add(armrest1);
  
  const armrest2 = new THREE.Mesh(armGeometry, baseMaterial);
  armrest2.position.set(-config.length / 2 + 0.1, config.height * 0.3, 0);
  armrest2.castShadow = true;
  couch.add(armrest2);
  
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
      0
    );
    couch.add(cushion);
  }
  
  couch.position.set(x, 0, z);
  couch.userData = { type: 'couch', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(couch);
  } else {
    interactableObjects.add(couch);
    interiorObjects.push(couch); // Only add to array if not in interior group
  }
  
  return couch;
}

/**
 * Creates a TV at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created TV object
 */
export function createTV(x = 0, z = 0) {
  const tv = new THREE.Group();
  const config = CONFIG.interior.furniture.tv;
  
  // Stand
  const standGeometry = new THREE.BoxGeometry(config.width * 0.8, 0.1, config.depth * 2);
  const standMaterial = new THREE.MeshStandardMaterial({ 
    color: config.standColor,
    roughness: 0.7
  });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.y = 0.5;
  stand.castShadow = true;
  stand.receiveShadow = true;
  tv.add(stand);
  
  // Support pole
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
  const pole = new THREE.Mesh(poleGeometry, standMaterial);
  pole.position.y = 0.75;
  pole.castShadow = true;
  tv.add(pole);
  
  // Screen frame
  const frameGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.3
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = 1 + config.height / 2;
  frame.castShadow = true;
  tv.add(frame);
  
  // Screen
  const screenGeometry = new THREE.BoxGeometry(config.width * 0.95, config.height * 0.9, 0.01);
  const screenMaterial = new THREE.MeshStandardMaterial({ 
    color: config.screenColor,
    roughness: 0.2,
    metalness: 0.5
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1 + config.height / 2, config.depth / 2);
  tv.add(screen);
  
  tv.position.set(x, 0, z);
  tv.userData = { type: 'tv', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(tv);
  } else {
    interactableObjects.add(tv);
    interiorObjects.push(tv); // Only add to array if not in interior group
  }
  
  return tv;
}

/**
 * Creates a bed at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created bed object
 */
export function createBed(x = 0, z = 0) {
  const bed = new THREE.Group();
  const config = CONFIG.interior.furniture.bed;
  
  // Frame
  const frameGeometry = new THREE.BoxGeometry(config.width, config.height / 2, config.length);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: config.frameColor,
    roughness: 0.8
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.y = config.height / 4;
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
  mattress.position.y = config.height / 2 + 0.1;
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  bed.add(mattress);
  
  // Headboard
  const headboardGeometry = new THREE.BoxGeometry(config.width, config.height, 0.1);
  const headboard = new THREE.Mesh(headboardGeometry, frameMaterial);
  headboard.position.set(0, config.height / 2, -config.length / 2 + 0.05);
  headboard.castShadow = true;
  bed.add(headboard);
  
  // Pillows
  const pillowGeometry = new THREE.BoxGeometry(config.width / 3, 0.1, 0.3);
  const pillowMaterial = new THREE.MeshStandardMaterial({ 
    color: config.pillowColor,
    roughness: 0.9
  });
  
  const pillow1 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow1.position.set(-config.width / 4, config.height / 2 + 0.25, -config.length / 2 + 0.3);
  bed.add(pillow1);
  
  const pillow2 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow2.position.set(config.width / 4, config.height / 2 + 0.25, -config.length / 2 + 0.3);
  bed.add(pillow2);
  
  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.height / 2);
  const legPositions = [
    { x: config.width / 2 - 0.1, z: config.length / 2 - 0.1 },
    { x: -config.width / 2 + 0.1, z: config.length / 2 - 0.1 },
    { x: config.width / 2 - 0.1, z: -config.length / 2 + 0.1 },
    { x: -config.width / 2 + 0.1, z: -config.length / 2 + 0.1 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, frameMaterial);
    leg.position.set(pos.x, config.height / 4, pos.z);
    leg.castShadow = true;
    bed.add(leg);
  });
  
  bed.position.set(x, 0, z);
  bed.userData = { type: 'bed', removable: true };
  
  // Add to scene/group but don't add to interiorObjects array yet
  // The interior.js module will handle tracking after adding to the group
  if (worldState.interiorGroup) {
    worldState.interiorGroup.add(bed);
  } else {
    interactableObjects.add(bed);
    interiorObjects.push(bed); // Only add to array if not in interior group
  }
  
  return bed;
}

/**
 * Adds default furniture to the interior room
 */
export function addFurnitureToInterior() {
  const roomSize = CONFIG.interior.roomSize;
  
  // Add some chairs
  const chair1 = createChair(-roomSize / 4, roomSize / 4);
  chair1.rotation.y = Math.PI / 4;
  
  const chair2 = createChair(roomSize / 4, roomSize / 4);
  chair2.rotation.y = -Math.PI / 4;
  
  // Add a table
  createTable(0, roomSize / 4);
  
  // Add a couch
  const couch = createCouch(0, -roomSize / 3);
  couch.rotation.y = Math.PI;
  
  // Add a TV
  createTV(0, -roomSize / 2 + 1);
  
  // Add a bed
  const bed = createBed(roomSize / 3, 0);
  bed.rotation.y = Math.PI / 2;
}