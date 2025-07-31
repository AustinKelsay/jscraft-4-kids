/**
 * Building system for placing and removing objects
 */

import { CONFIG } from './config.js';
import { 
  scene, camera, raycaster, worldState, worldObjects, animals,
  interactableObjects, highlightedObject, setHighlightedObject,
  ghostObject, setGhostObject, selectedObjectType, buildableTypes
} from './gameState.js';
import { createTree, createRock, createHouse } from './objects.js';
import { createCow, createPig, createHorse } from './animals.js';
import { getForwardVector } from './camera.js';
import { disposeObject, findParentObject } from './utils.js';

/**
 * Build an object at the current build position
 */
export function buildObject() {
  // Don't build when inside
  if (worldState.isInside) return;
  
  const type = buildableTypes[selectedObjectType];
  
  // Don't build if fists are selected
  if (type === 'fists') return;
  
  const buildPos = getBuildPosition();
  if (buildPos) {
    switch (type) {
      case 'tree':
        createTree(buildPos.x, buildPos.z);
        break;
      case 'rock':
        createRock(buildPos.x, buildPos.z);
        break;
      case 'house':
        createHouse(buildPos.x, buildPos.z);
        break;
      case 'cow':
        createCow(buildPos.x, buildPos.z);
        break;
      case 'pig':
        createPig(buildPos.x, buildPos.z);
        break;
      case 'horse':
        createHorse(buildPos.x, buildPos.z);
        break;
    }
  }
}

/**
 * Remove the currently highlighted object from the world
 */
export function removeObject() {
  // Don't remove objects when inside
  if (worldState.isInside) return;
  
  if (!highlightedObject || !highlightedObject.userData.removable) {
    return;
  }
  
  try {
    // Remove from scene
    interactableObjects.remove(highlightedObject);
    
    // Remove from world objects array
    const index = worldObjects.indexOf(highlightedObject);
    if (index > -1) {
      worldObjects.splice(index, 1);
    }
    
    // Remove from animals array if it's an animal
    if (highlightedObject.userData.isAnimal) {
      const animalIndex = animals.indexOf(highlightedObject);
      if (animalIndex > -1) {
        animals.splice(animalIndex, 1);
      }
    }
    
    // Dispose of object resources
    disposeObject(highlightedObject);
    
    // Clear reference
    setHighlightedObject(null);
    
  } catch (error) {
    console.error('Failed to remove object:', error);
  }
}

/**
 * Get the position where an object should be built
 * @returns {THREE.Vector3|null} Build position or null
 */
export function getBuildPosition() {
  // Get forward direction for building placement
  const forward = getForwardVector();
  
  const buildPos = camera.position.clone();
  buildPos.add(forward.multiplyScalar(CONFIG.building.distance));
  buildPos.y = 0;
  
  return buildPos;
}

/**
 * Update object highlighting and ghost preview
 */
export function updateObjectHighlight() {
  // Cast ray from camera center
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  // Include both world and interior objects
  const objectsToCheck = worldState.isInside ? 
    [worldState.interiorGroup] : 
    interactableObjects.children;
  
  const intersects = raycaster.intersectObjects(objectsToCheck, true);
  
  // Reset previous highlight
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    setHighlightedObject(null);
  }
  
  // Highlight new object if within range
  if (intersects.length > 0) {
    const distance = intersects[0].distance;
    
    // Check for door interactions first
    let doorObject = intersects[0].object;
    if (doorObject.userData && doorObject.userData.type === 'door' && 
        doorObject.userData.isInteractive && distance < CONFIG.building.distance) {
      setHighlightedObject(doorObject);
      highlightDoor(doorObject);
      return; // Don't check other objects if door is highlighted
    }
    
    // Otherwise check for removable objects
    const object = findParentObject(intersects[0].object);
    if (object && object.userData.removable && distance < CONFIG.building.distance && !worldState.isInside) {
      setHighlightedObject(object);
      highlightObject(object);
    }
  }
  
  // Update ghost object for building preview (only outside)
  if (!worldState.isInside) {
    updateGhostObject();
  }
}

/**
 * Highlight an object with emissive color
 * @param {THREE.Object3D} object - Object to highlight
 */
function highlightObject(object) {
  object.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.emissive = new THREE.Color(CONFIG.building.highlightColor);
      child.material.emissiveIntensity = 0.3;
    }
  });
}

/**
 * Reset object highlighting
 * @param {THREE.Object3D} object - Object to reset
 */
export function resetObjectHighlight(object) {
  // Check if it's a door
  if (object.userData && object.userData.type === 'door') {
    // Restore original material for door
    if (object.userData.originalMaterial) {
      object.material = object.userData.originalMaterial;
    }
  } else {
    // Regular object highlight reset
    object.traverse(child => {
      if (child.isMesh) {
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
      }
    });
  }
}

/**
 * Highlights an interactive door with green color
 * @param {THREE.Mesh} door - The door mesh to highlight
 */
function highlightDoor(door) {
  if (door.isMesh) {
    door.material = door.material.clone();
    door.material.emissive = new THREE.Color(CONFIG.interior.doorHighlightColor);
    door.material.emissiveIntensity = 0.4;
  }
}

/**
 * Update the ghost preview object for building
 */
function updateGhostObject() {
  // Remove existing ghost
  if (ghostObject) {
    disposeObject(ghostObject);
    setGhostObject(null);
  }
  
  // Don't create ghost for fists
  const type = buildableTypes[selectedObjectType];
  if (type === 'fists') return;
  
  // Create new ghost for building preview
  const buildPos = getBuildPosition();
  if (buildPos) {
    // Create a simplified ghost object
    const ghostGroup = new THREE.Group();
    
    switch (type) {
      case 'tree':
        // Simple tree preview
        const treeGhost = new THREE.Mesh(
          new THREE.ConeGeometry(2, 6, 8),
          new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        treeGhost.position.y = 3;
        ghostGroup.add(treeGhost);
        break;
        
      case 'rock':
        // Simple rock preview
        const rockGhost = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 6, 5),
          new THREE.MeshBasicMaterial({ 
            color: 0x888888, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        rockGhost.scale.set(1.1, 0.8, 1.1);
        rockGhost.position.y = 0.5;
        ghostGroup.add(rockGhost);
        break;
        
      case 'house':
        // Simple house preview
        const houseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 4),
          new THREE.MeshBasicMaterial({ 
            color: 0xffaa00, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        houseGhost.position.y = 1.5;
        ghostGroup.add(houseGhost);
        break;
        
      case 'cow':
        // Simple cow preview
        const cowGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.05, 1.2),
          new THREE.MeshBasicMaterial({ 
            color: 0x8B4513, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        cowGhost.position.y = 0.75;
        ghostGroup.add(cowGhost);
        break;
        
      case 'pig':
        // Simple pig preview
        const pigGhost = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 4),
          new THREE.MeshBasicMaterial({ 
            color: 0xFFB6C1, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        pigGhost.position.y = 0.45;
        pigGhost.scale.set(1.4, 0.9, 1.1);
        ghostGroup.add(pigGhost);
        break;
        
      case 'horse':
        // Simple horse preview
        const horseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(2.3, 1.3, 0.9),
          new THREE.MeshBasicMaterial({ 
            color: 0x654321, 
            transparent: true, 
            opacity: CONFIG.building.ghostOpacity,
            depthWrite: false
          })
        );
        horseGhost.position.y = 0.9;
        ghostGroup.add(horseGhost);
        break;
    }
    
    const ghost = ghostGroup;
    ghost.position.copy(buildPos);
    scene.add(ghost);
    setGhostObject(ghost);
  }
}