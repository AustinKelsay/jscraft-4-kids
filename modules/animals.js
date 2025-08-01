/**
 * Animal creation and movement functions
 */

import { CONFIG } from './config.js';
import { worldAnimals, interiorAnimals, clock, worldState } from './gameState.js';

// Re-export animal creation functions from their respective modules
export { createCow, createPig, createHorse, createInitialAnimals } from './worldAnimals.js';
export { createCat, createDog } from './interiorAnimals.js';

/**
 * Update all animals' movement and animations
 * @param {number} delta - Time since last frame
 */
export function updateAnimals(delta) {
  const currentTime = clock.getElapsedTime();
  
  // Update world animals when outside
  if (!worldState.isInside) {
    worldAnimals.forEach(animal => {
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
      const boundary = CONFIG.world.size / 2 - CONFIG.world.boundaryPadding;
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
  
  // Update interior animals when inside
  if (worldState.isInside) {
    interiorAnimals.forEach(animal => {
      // Check if it's time to pick a new target
      if (currentTime > animal.userData.nextMoveTime) {
        // Pick a new random target within room
        const roomSize = CONFIG.interior.roomSize;
        const maxDistance = roomSize / 3; // Smaller wander radius for interior
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxDistance * 0.7 + maxDistance * 0.3;
        
        animal.userData.targetPosition.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
        
        // Keep target within room bounds
        const boundary = roomSize / 2 - CONFIG.interior.boundaryPadding;
        animal.userData.targetPosition.x = THREE.MathUtils.clamp(animal.userData.targetPosition.x, -boundary, boundary);
        animal.userData.targetPosition.z = THREE.MathUtils.clamp(animal.userData.targetPosition.z, -boundary, boundary);
        
        // Set next move time (shorter wait times for interior)
        const waitTime = 1 + Math.random() * 3;
        animal.userData.nextMoveTime = currentTime + waitTime;
      }
      
      // Move towards target
      const direction = new THREE.Vector3()
        .subVectors(animal.userData.targetPosition, animal.position)
        .normalize();
      
      const distanceToTarget = animal.position.distanceTo(animal.userData.targetPosition);
      
      if (distanceToTarget > 0.3) {
        // Move the animal with slight curve for more natural movement
        const moveDistance = animal.userData.moveSpeed * delta * 0.7; // Slightly slower indoors
        
        // Add slight perpendicular drift for curved paths
        const drift = new THREE.Vector3(-direction.z, 0, direction.x);
        drift.multiplyScalar(Math.sin(currentTime * 2) * 0.05);
        
        animal.position.add(direction.multiplyScalar(moveDistance));
        animal.position.add(drift);
        
        // Smooth rotation towards direction
        if (direction.length() > 0) {
          const targetAngle = Math.atan2(direction.x, direction.z);
          const angleDiff = targetAngle - animal.rotation.y;
          const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          animal.rotation.y += normalizedDiff * delta * 3;
        }
        
        // Animate legs
        if (animal.userData.legs) {
          const walkCycle = currentTime * 8;
          animal.userData.legs.forEach((leg, index) => {
            const offset = index < 2 ? 0 : Math.PI;
            leg.rotation.x = Math.sin(walkCycle + offset) * 0.3;
          });
        }
        
        // Subtle bobbing
        animal.position.y = Math.abs(Math.sin(currentTime * 6) * 0.02);
        
        // Tail wagging for dogs
        if (animal.userData.type === 'dog' && animal.userData.tail) {
          animal.userData.tail.rotation.y = Math.sin(currentTime * 10) * 0.3;
        }
      } else {
        // Idle animations
        animal.position.y = Math.sin(currentTime * 2) * 0.01;
        
        // Reset leg positions
        if (animal.userData.legs) {
          animal.userData.legs.forEach(leg => {
            leg.rotation.x = 0;
          });
        }
        
        // Gentle tail movement for cats
        if (animal.userData.type === 'cat') {
          const tailBase = animal.children.find(child => child.position.x < -animal.userData.size * 0.3);
          if (tailBase) {
            tailBase.rotation.y = Math.sin(currentTime * 1.5) * 0.1;
          }
        }
      }
    });
  }
}