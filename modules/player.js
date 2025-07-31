/**
 * Player movement and physics
 */

import { CONFIG } from './config.js';
import { camera, player, keys, mouseControls, worldState } from './gameState.js';
import { getForwardVector, getRightVector, applyCameraMovement } from './camera.js';

/**
 * Update player movement and physics
 * @param {number} delta - Time since last frame
 */
export function updatePlayer(delta) {
  // Apply gravity
  player.velocity.y -= CONFIG.player.gravity * delta;
  
  // Calculate movement direction using camera vectors
  const moveVector = new THREE.Vector3();
  const forward = getForwardVector();
  const right = getRightVector();
  
  // Add movement based on input
  if (keys.forward) moveVector.add(forward);
  if (keys.backward) moveVector.sub(forward);
  if (keys.left) moveVector.add(right);  // Fixed: was reversed
  if (keys.right) moveVector.sub(right); // Fixed: was reversed
  
  // Normalize and scale by speed
  if (moveVector.length() > 0) {
    moveVector.normalize();
    moveVector.multiplyScalar(CONFIG.player.speed * delta);
  }
  
  // Update position
  camera.position.add(moveVector);
  camera.position.y += player.velocity.y * delta;
  
  // Ground collision
  if (camera.position.y <= CONFIG.player.height) {
    camera.position.y = CONFIG.player.height;
    player.velocity.y = 0;
    player.canJump = true;
  }
  
  // World boundaries
  if (worldState.isInside) {
    // Interior boundaries
    const interiorBoundary = CONFIG.interior.roomSize / 2 - 0.5; // Leave space for walls
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -interiorBoundary, interiorBoundary);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -interiorBoundary, interiorBoundary);
  } else {
    // Outside world boundaries
    const boundary = CONFIG.world.size / 2;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -boundary, boundary);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -boundary, boundary);
  }
  
  // Mouse look with proper yaw/pitch control
  if (mouseControls.active && (mouseControls.movementX !== 0 || mouseControls.movementY !== 0)) {
    applyCameraMovement(
      -mouseControls.movementX * CONFIG.player.lookSpeed,
      -mouseControls.movementY * CONFIG.player.lookSpeed
    );
    
    mouseControls.movementX = 0;
    mouseControls.movementY = 0;
  }
}