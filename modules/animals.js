/**
 * Animal creation and movement functions
 */

import { CONFIG } from './config.js';
import { interactableObjects, worldObjects, animals, clock } from './gameState.js';

/**
 * Create a cow at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created cow object
 */
export function createCow(x, z) {
  const cow = new THREE.Group();
  const size = CONFIG.objects.cow.size;
  
  // Body - simple elongated box
  const bodyGeometry = new THREE.BoxGeometry(size * 1.2, size * 0.6, size * 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.bodyColor,
    roughness: 0.8
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  cow.add(body);
  
  // Head - smaller box
  const headGeometry = new THREE.BoxGeometry(size * 0.3, size * 0.35, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.7, size * 0.55, 0);
  head.castShadow = true;
  cow.add(head);
  
  // Snout - pink box
  const snoutGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.12, size * 0.2);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFB6C1,
    roughness: 0.9
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(size * 0.82, size * 0.48, 0);
  cow.add(snout);
  
  // Eyes - simple spheres on sides
  const eyeGeometry = new THREE.SphereGeometry(size * 0.03, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.65, size * 0.6, size * 0.12);
  cow.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.65, size * 0.6, -size * 0.12);
  cow.add(eye2);
  
  // Horns - small cones
  const hornGeometry = new THREE.ConeGeometry(size * 0.03, size * 0.08, 4);
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xE6E6E6 });
  const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn1.position.set(size * 0.6, size * 0.72, size * 0.08);
  cow.add(horn1);
  
  const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
  horn2.position.set(size * 0.6, size * 0.72, -size * 0.08);
  cow.add(horn2);
  
  // Ears - flat triangles
  const earGeometry = new THREE.ConeGeometry(size * 0.08, size * 0.12, 3);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.55, size * 0.65, size * 0.18);
  ear1.rotation.z = Math.PI / 2;
  cow.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.55, size * 0.65, -size * 0.18);
  ear2.rotation.z = Math.PI / 2;
  cow.add(ear2);
  
  // Black spots - simple spheres
  const spotMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.cow.spotColor,
    roughness: 0.8
  });
  
  const spot1 = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.2, 6, 4),
    spotMaterial
  );
  spot1.position.set(size * 0.1, size * 0.6, size * 0.26);
  spot1.scale.set(1.2, 0.8, 0.1);
  cow.add(spot1);
  
  const spot2 = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.15, 6, 4),
    spotMaterial
  );
  spot2.position.set(-size * 0.3, size * 0.5, -size * 0.26);
  spot2.scale.set(1, 0.7, 0.1);
  cow.add(spot2);
  
  // Legs - simple cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.08, size * 0.08, size * 0.4);
  const legPositions = [
    { x: size * 0.35, z: size * 0.18 },
    { x: size * 0.35, z: -size * 0.18 },
    { x: -size * 0.35, z: size * 0.18 },
    { x: -size * 0.35, z: -size * 0.18 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.2, pos.z);
    leg.castShadow = true;
    cow.add(leg);
  });
  
  // Udder - pink sphere
  const udder = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.15, 6, 4),
    new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.9 })
  );
  udder.position.set(-size * 0.2, size * 0.28, 0);
  udder.scale.set(0.8, 0.6, 0.6);
  cow.add(udder);
  
  // Tail - simple cylinder
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.03, size * 0.02, size * 0.35),
    bodyMaterial
  );
  tail.position.set(-size * 0.6, size * 0.5, 0);
  tail.rotation.z = Math.PI / 4;
  cow.add(tail);
  
  // Set initial position and properties
  cow.position.set(x, 0, z);
  cow.userData = { 
    type: 'cow', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.cow.moveSpeed,
    wanderRadius: CONFIG.objects.cow.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(cow);
  worldObjects.push(cow);
  animals.push(cow);
  
  return cow;
}

/**
 * Create a pig at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created pig object
 */
export function createPig(x, z) {
  const pig = new THREE.Group();
  const size = CONFIG.objects.pig.size;
  
  // Body - simple rounded box
  const bodyGeometry = new THREE.BoxGeometry(size * 0.8, size * 0.5, size * 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.pig.bodyColor,
    roughness: 0.9
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.35;
  body.castShadow = true;
  body.receiveShadow = true;
  pig.add(body);
  
  // Head - smaller box
  const headGeometry = new THREE.BoxGeometry(size * 0.35, size * 0.3, size * 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.5, size * 0.35, 0);
  head.castShadow = true;
  pig.add(head);
  
  // Snout - pink cylinder
  const snoutGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.12, size * 0.08);
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFB6C1,
    roughness: 0.7
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(size * 0.7, size * 0.32, 0);
  pig.add(snout);
  
  // Eyes - small black dots
  const eyeGeometry = new THREE.SphereGeometry(size * 0.02, 4, 4);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.5, size * 0.42, size * 0.1);
  pig.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.5, size * 0.42, -size * 0.1);
  pig.add(eye2);
  
  // Ears - triangular
  const earGeometry = new THREE.ConeGeometry(size * 0.08, size * 0.12, 3);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.35, size * 0.48, size * 0.12);
  ear1.rotation.z = -Math.PI / 6;
  pig.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.35, size * 0.48, -size * 0.12);
  ear2.rotation.z = -Math.PI / 6;
  pig.add(ear2);
  
  // Legs - short cylinders
  const legGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.06, size * 0.15);
  const legPositions = [
    { x: size * 0.3, z: size * 0.18 },
    { x: size * 0.3, z: -size * 0.18 },
    { x: -size * 0.3, z: size * 0.18 },
    { x: -size * 0.3, z: -size * 0.18 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(pos.x, size * 0.075, pos.z);
    leg.castShadow = true;
    pig.add(leg);
  });
  
  // Curly tail - simple pink sphere
  const tailGeometry = new THREE.SphereGeometry(size * 0.06, 6, 6);
  const tail = new THREE.Mesh(tailGeometry, snoutMaterial);
  tail.position.set(-size * 0.4, size * 0.4, 0);
  tail.scale.set(0.5, 1, 0.5);
  pig.add(tail);
  
  // Set initial position and properties
  pig.position.set(x, 0, z);
  pig.userData = { 
    type: 'pig', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.pig.moveSpeed,
    wanderRadius: CONFIG.objects.pig.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(pig);
  worldObjects.push(pig);
  animals.push(pig);
  
  return pig;
}

/**
 * Create a horse at the specified position
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {THREE.Group} The created horse object
 */
export function createHorse(x, z) {
  const horse = new THREE.Group();
  const size = CONFIG.objects.horse.size;
  
  // Body (sleek and muscular)
  const bodyGeometry = new THREE.BoxGeometry(size * 1.3, size * 0.7, size * 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.bodyColor,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.7;
  // Taper the body
  body.scale.set(1, 1, 0.9);
  body.castShadow = true;
  body.receiveShadow = true;
  horse.add(body);
  
  // Chest (more muscular front)
  const chestGeometry = new THREE.SphereGeometry(size * 0.35, 6, 4);
  const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
  chest.position.set(size * 0.5, size * 0.7, 0);
  chest.scale.set(0.8, 1.1, 1.2);
  horse.add(chest);
  
  // Neck (curved and elegant)
  const neckGeometry = new THREE.CylinderGeometry(size * 0.2, size * 0.25, size * 0.5);
  const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
  neck.position.set(size * 0.55, size * 0.95, 0);
  neck.rotation.z = -Math.PI / 6;
  neck.castShadow = true;
  horse.add(neck);
  
  // Head (refined shape)
  const headGeometry = new THREE.BoxGeometry(size * 0.35, size * 0.4, size * 0.2);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(size * 0.75, size * 1.15, 0);
  head.rotation.z = -0.1;
  head.scale.set(1, 0.8, 1);
  head.castShadow = true;
  horse.add(head);
  
  // Muzzle
  const muzzleGeometry = new THREE.BoxGeometry(size * 0.15, size * 0.15, size * 0.18);
  const muzzle = new THREE.Mesh(muzzleGeometry, bodyMaterial);
  muzzle.position.set(size * 0.9, size * 1.05, 0);
  horse.add(muzzle);
  
  // Nostrils
  const nostrilGeometry = new THREE.SphereGeometry(size * 0.025, 4, 4);
  const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const nostril1 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  nostril1.position.set(size * 0.95, size * 1.05, size * 0.05);
  nostril1.scale.set(1.5, 1, 1);
  horse.add(nostril1);
  
  const nostril2 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
  nostril2.position.set(size * 0.95, size * 1.05, -size * 0.05);
  nostril2.scale.set(1.5, 1, 1);
  horse.add(nostril2);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(size * 0.04, 6, 6);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x4B0000 });
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(size * 0.7, size * 1.2, size * 0.1);
  horse.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(size * 0.7, size * 1.2, -size * 0.1);
  horse.add(eye2);
  
  // Ears (pointed)
  const earGeometry = new THREE.ConeGeometry(size * 0.06, size * 0.12, 4);
  const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear1.position.set(size * 0.65, size * 1.35, size * 0.08);
  ear1.rotation.z = -0.2;
  ear1.rotation.x = 0.1;
  horse.add(ear1);
  
  const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
  ear2.position.set(size * 0.65, size * 1.35, -size * 0.08);
  ear2.rotation.z = -0.2;
  ear2.rotation.x = -0.1;
  horse.add(ear2);
  
  // Mane (flowing)
  const maneGeometry = new THREE.BoxGeometry(size * 0.08, size * 0.4, size * 0.25);
  const maneMaterial = new THREE.MeshStandardMaterial({ 
    color: CONFIG.objects.horse.maneColor,
    roughness: 0.9
  });
  const mane = new THREE.Mesh(maneGeometry, maneMaterial);
  mane.position.set(size * 0.45, size * 1.15, 0);
  mane.rotation.z = -0.3;
  horse.add(mane);
  
  // Mane top
  const maneTopGeometry = new THREE.BoxGeometry(size * 0.06, size * 0.15, size * 0.2);
  const maneTop = new THREE.Mesh(maneTopGeometry, maneMaterial);
  maneTop.position.set(size * 0.65, size * 1.3, 0);
  horse.add(maneTop);
  
  // Legs (slender and strong)
  const upperLegGeometry = new THREE.CylinderGeometry(size * 0.05, size * 0.06, size * 0.35);
  const lowerLegGeometry = new THREE.CylinderGeometry(size * 0.04, size * 0.05, size * 0.35);
  const hoofGeometry = new THREE.CylinderGeometry(size * 0.06, size * 0.07, size * 0.08);
  const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x1C1C1C });
  
  const legPositions = [
    { x: size * 0.35, z: size * 0.15 },
    { x: size * 0.35, z: -size * 0.15 },
    { x: -size * 0.35, z: size * 0.15 },
    { x: -size * 0.35, z: -size * 0.15 }
  ];
  
  legPositions.forEach(pos => {
    // Upper leg
    const upperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
    upperLeg.position.set(pos.x, size * 0.525, pos.z);
    upperLeg.castShadow = true;
    horse.add(upperLeg);
    
    // Lower leg
    const lowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
    lowerLeg.position.set(pos.x, size * 0.175, pos.z);
    lowerLeg.castShadow = true;
    horse.add(lowerLeg);
    
    // Hoof
    const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
    hoof.position.set(pos.x, size * 0.04, pos.z);
    horse.add(hoof);
  });
  
  // Tail (flowing)
  const tailGeometry = new THREE.ConeGeometry(size * 0.12, size * 0.5, 6);
  const tail = new THREE.Mesh(tailGeometry, maneMaterial);
  tail.position.set(-size * 0.65, size * 0.5, 0);
  tail.rotation.z = Math.PI / 4;
  horse.add(tail);
  
  // Set initial position and properties
  horse.position.set(x, 0, z);
  horse.userData = { 
    type: 'horse', 
    removable: true,
    isAnimal: true,
    velocity: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(x, 0, z),
    moveSpeed: CONFIG.objects.horse.moveSpeed,
    wanderRadius: CONFIG.objects.horse.wanderRadius,
    initialPosition: new THREE.Vector3(x, 0, z),
    nextMoveTime: 0
  };
  
  interactableObjects.add(horse);
  worldObjects.push(horse);
  animals.push(horse);
  
  return horse;
}

/**
 * Update all animals' movement and animations
 * @param {number} delta - Time since last frame
 */
export function updateAnimals(delta) {
  const currentTime = clock.getElapsedTime();
  
  animals.forEach(animal => {
    // Check if it's time to pick a new target
    if (currentTime > animal.userData.nextMoveTime) {
      // Pick a new random target within wander radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * animal.userData.wanderRadius * 0.7 + animal.userData.wanderRadius * 0.3; // Avoid always going to edges
      
      animal.userData.targetPosition.set(
        animal.userData.initialPosition.x + Math.cos(angle) * distance,
        0,
        animal.userData.initialPosition.z + Math.sin(angle) * distance
      );
      
      // Keep target within bounds
      const boundary = CONFIG.world.size / 2 - 20;
      animal.userData.targetPosition.x = THREE.MathUtils.clamp(animal.userData.targetPosition.x, -boundary, boundary);
      animal.userData.targetPosition.z = THREE.MathUtils.clamp(animal.userData.targetPosition.z, -boundary, boundary);
      
      // Set next move time (wait 2-6 seconds between moves, varies by animal)
      const waitTime = 2 + Math.random() * 4;
      animal.userData.nextMoveTime = currentTime + waitTime;
    }
    
    // Move towards target
    const direction = new THREE.Vector3()
      .subVectors(animal.userData.targetPosition, animal.position)
      .normalize();
    
    const distanceToTarget = animal.position.distanceTo(animal.userData.targetPosition);
    
    if (distanceToTarget > 1) {
      // Move the animal with slight curve for more natural movement
      const moveDistance = animal.userData.moveSpeed * delta;
      
      // Add slight perpendicular drift for curved paths
      const drift = new THREE.Vector3(-direction.z, 0, direction.x);
      drift.multiplyScalar(Math.sin(currentTime * 2) * 0.1);
      
      animal.position.add(direction.multiplyScalar(moveDistance));
      animal.position.add(drift);
      
      // Smooth rotation towards direction
      if (direction.length() > 0) {
        const targetAngle = Math.atan2(direction.x, direction.z);
        const angleDiff = targetAngle - animal.rotation.y;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        animal.rotation.y += normalizedDiff * delta * 3; // Smooth turning
      }
      
      // Improved bobbing animation based on animal type and speed
      const bobSpeed = 8 + animal.userData.moveSpeed;
      const bobAmount = Math.sin(currentTime * bobSpeed) * 0.03;
      animal.position.y = Math.abs(bobAmount) * animal.userData.moveSpeed / 4;
      
      // Subtle sway animation
      animal.rotation.z = Math.sin(currentTime * bobSpeed * 0.7) * 0.01;
      
      // Head movement for horses (they're taller)
      if (animal.userData.type === 'horse') {
        animal.rotation.x = Math.sin(currentTime * bobSpeed * 0.5) * 0.02;
      }
    } else {
      // Idle animation when stopped
      animal.position.y = Math.sin(currentTime * 2) * 0.01; // Gentle breathing
      animal.rotation.z = 0;
      animal.rotation.x = 0;
      
      // Occasionally look around when idle
      if (Math.random() < 0.01) {
        animal.rotation.y += (Math.random() - 0.5) * 0.5;
      }
    }
    
    // Keep animals within world bounds with soft boundaries
    const boundary = CONFIG.world.size / 2 - 15;
    const softBoundary = 10;
    
    // Apply soft boundary force
    if (Math.abs(animal.position.x) > boundary - softBoundary) {
      animal.position.x = THREE.MathUtils.clamp(animal.position.x, -boundary, boundary);
      animal.userData.targetPosition.x = animal.position.x + (Math.random() - 0.5) * 20;
    }
    if (Math.abs(animal.position.z) > boundary - softBoundary) {
      animal.position.z = THREE.MathUtils.clamp(animal.position.z, -boundary, boundary);
      animal.userData.targetPosition.z = animal.position.z + (Math.random() - 0.5) * 20;
    }
  });
}

/**
 * Create initial animals in the world
 */
export function createInitialAnimals() {
  // Create initial animals
  createCow(-30, 10);
  createCow(40, -30);
  createPig(15, -35);
  createPig(-20, 30);
  createHorse(50, 5);
  createHorse(-40, -40);
}