/**
 * Input handling system
 */

import { CONFIG } from './config.js';
import { 
  renderer, camera, keys, mouseControls, player, highlightedObject,
  cameraController, worldState, interactableObjects, skyMesh, sunMesh, 
  moonMesh, sunLight, moonLight, ambientLight, uiElements, setSelectedObjectType,
  selectedObjectType, ghostRotation, setGhostRotation
} from './gameState.js';
import { buildObject, removeObject, resetObjectHighlight } from './building.js';
import { updateObjectSelector, updateSelectorContent, updateSaveStatus } from './ui.js';
import { saveGameState, loadGameState, hasSaveData, saveCurrentInterior, loadHouseInterior } from './saveLoad.js';
import { applyCameraMovement, updateCameraRotation } from './camera.js';
import { createInterior, removeInterior } from './interior.js';

/**
 * Setup all event listeners
 */
export function setupEventListeners() {
  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Mouse controls
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  
  // Save/Load button handlers
  const saveButton = document.getElementById('saveButton');
  const loadButton = document.getElementById('loadButton');
  
  if (saveButton) {
    saveButton.addEventListener('click', handleSave);
  }
  
  if (loadButton) {
    loadButton.addEventListener('click', handleLoad);
  }
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      break;
    case 'Space':
      if (event.target === document.body) {
        event.preventDefault();
        // Handle both jump and remove
        if (highlightedObject) {
          removeObject();
        } else if (player.canJump) {
          player.velocity.y = CONFIG.player.jumpSpeed;
          player.canJump = false;
        }
      }
      break;
    case 'KeyQ':
      // Rotate ghost object counter-clockwise when building
      if (selectedObjectType !== 0) {
        setGhostRotation(ghostRotation + Math.PI / 4);
      } else if (!mouseControls.active) {
        // Normal camera rotation when not building
        applyCameraMovement(0.1, 0);
      }
      break;
    case 'KeyE':
      // Rotate ghost object clockwise when building
      if (selectedObjectType !== 0) {
        setGhostRotation(ghostRotation - Math.PI / 4);
      } else if (!mouseControls.active) {
        // Normal camera rotation when not building
        applyCameraMovement(-0.1, 0);
      }
      break;
    case 'KeyB':
      buildObject();
      break;
    case 'Digit0':
      setSelectedObjectType(0); // Fists
      updateObjectSelector();
      break;
    case 'Digit1':
      setSelectedObjectType(1); // Tree
      updateObjectSelector();
      break;
    case 'Digit2':
      setSelectedObjectType(2); // Rock
      updateObjectSelector();
      break;
    case 'Digit3':
      setSelectedObjectType(3); // House
      updateObjectSelector();
      break;
    case 'Digit4':
      setSelectedObjectType(4); // Cow
      updateObjectSelector();
      break;
    case 'Digit5':
      setSelectedObjectType(5); // Pig
      updateObjectSelector();
      break;
    case 'Digit6':
      setSelectedObjectType(6); // Horse
      updateObjectSelector();
      break;
    case 'Digit7':
      setSelectedObjectType(7); // Dog (when inside)
      updateObjectSelector();
      break;
    case 'F5':
      event.preventDefault(); // Prevent browser refresh
      handleSave();
      break;
    case 'F9':
      event.preventDefault();
      handleLoad();
      break;
  }
}

/**
 * Handle keyup events
 * @param {KeyboardEvent} event
 */
function onKeyUp(event) {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = false;
      break;
  }
}

/**
 * Handle mouse move events
 * @param {MouseEvent} event
 */
function onMouseMove(event) {
  if (mouseControls.active) {
    mouseControls.movementX = event.movementX || 0;
    mouseControls.movementY = event.movementY || 0;
  }
}

/**
 * Handle click events
 */
function onClick() {
  // Check if clicking on a door
  if (highlightedObject && highlightedObject.userData && highlightedObject.userData.type === 'door') {
    handleDoorClick(highlightedObject);
    return;
  }
  
  // Otherwise handle pointer lock
  if (!mouseControls.active) {
    renderer.domElement.requestPointerLock();
  }
}

/**
 * Handle pointer lock change events
 */
function onPointerLockChange() {
  mouseControls.active = document.pointerLockElement === renderer.domElement;
}

/**
 * Handles door click interactions
 * @param {THREE.Mesh} door - The door being clicked
 */
function handleDoorClick(door) {
  if (door.userData.isExitDoor) {
    // Exit from interior to outside
    exitToOutside();
  } else if (door.userData.parentHouse) {
    // Enter from outside to interior
    enterHouse(door.userData.parentHouse);
  }
}

/**
 * Transitions from outside world to house interior
 * @param {THREE.Object3D} house - The house being entered
 */
function enterHouse(house) {
  // Save current outside position and rotation
  worldState.outsidePosition.copy(camera.position);
  worldState.outsideRotation.yaw = cameraController.yaw;
  worldState.outsideRotation.pitch = cameraController.pitch;
  worldState.currentHouse = house;
  
  // Hide outside world objects
  interactableObjects.visible = false;
  if (skyMesh) skyMesh.visible = false;
  if (sunMesh) sunMesh.visible = false;
  if (moonMesh) moonMesh.visible = false;
  sunLight.visible = false;
  moonLight.visible = false;
  
  // Adjust ambient light for interior
  ambientLight.intensity = 0.5;
  
  // Check if we have saved interior data for this house
  const hasSavedInterior = worldState.houseInteriors.has(house.uuid);
  
  // Create interior world (skip default furniture if we have saved data)
  createInterior(house, hasSavedInterior);
  
  // Load saved interior if it exists
  if (hasSavedInterior) {
    loadHouseInterior(house.uuid);
  }
  
  // Position player inside near the door
  camera.position.set(0, CONFIG.player.height, CONFIG.interior.roomSize / 2 - 2);
  cameraController.yaw = Math.PI; // Face into the room
  cameraController.pitch = 0;
  updateCameraRotation();
  
  // Update world state
  worldState.isInside = true;
  
  // Reset selected object type to fists
  setSelectedObjectType(0);
  
  // Update selector to show interior items
  updateSelectorContent();
}

/**
 * Transitions from house interior back to outside world
 */
function exitToOutside() {
  // Save current interior before exiting
  if (worldState.currentHouse) {
    saveCurrentInterior();
  }
  
  // Remove interior
  removeInterior();
  
  // Show outside world objects
  interactableObjects.visible = true;
  if (skyMesh) skyMesh.visible = true;
  if (sunMesh) sunMesh.visible = true;
  if (moonMesh) moonMesh.visible = true;
  sunLight.visible = true;
  moonLight.visible = true;
  
  // Restore ambient light
  ambientLight.intensity = 0.3;
  
  // Restore player position and rotation
  camera.position.copy(worldState.outsidePosition);
  cameraController.yaw = worldState.outsideRotation.yaw;
  cameraController.pitch = worldState.outsideRotation.pitch;
  updateCameraRotation();
  
  // Update world state
  worldState.isInside = false;
  worldState.currentHouse = null;
  
  // Reset selected object type to fists
  setSelectedObjectType(0);
  
  // Update selector to show exterior items
  updateSelectorContent();
  
  // Reset any highlighted objects
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
  }
}

/**
 * Handle window resize events
 */
export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handle save game
 */
function handleSave() {
  const success = saveGameState();
  if (success) {
    updateSaveStatus('✅ Game saved successfully!', 'lightgreen');
  } else {
    updateSaveStatus('❌ Failed to save game', 'red');
  }
}

/**
 * Handle load game
 */
function handleLoad() {
  if (!hasSaveData()) {
    updateSaveStatus('⚠️ No save data found', 'orange');
    return;
  }
  
  const success = loadGameState();
  if (success) {
    updateSaveStatus('✅ Game loaded successfully!', 'lightgreen');
    // Update UI to reflect loaded state
    updateObjectSelector();
    updateSelectorContent();
  } else {
    updateSaveStatus('❌ Failed to load game', 'red');
  }
}

/**
 * Remove all event listeners (for cleanup)
 */
export function removeEventListeners() {
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onClick);
  document.removeEventListener('pointerlockchange', onPointerLockChange);
}