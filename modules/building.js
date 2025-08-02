/**
 * Building system for placing and removing objects
 */

import { CONFIG } from './config.js';
import { 
  scene, camera, raycaster, worldState, worldObjects, interiorObjects, worldAnimals, interiorAnimals,
  interactableObjects, highlightedObject, setHighlightedObject,
  ghostObject, setGhostObject, selectedObjectType, buildableTypes, interiorBuildableTypes,
  ghostRotation, lastGhostType, setLastGhostType, lastGhostRotation, setLastGhostRotation
} from './gameState.js';
import { createTree, createRock, createHouse } from './worldObjects.js';
import { createCow, createPig, createHorse } from './worldAnimals.js';
import { createCat, createDog } from './interiorAnimals.js';
import { createChair, createTable, createCouch, createTV, createBed } from './interiorObjects.js';
import { getForwardVector } from './camera.js';
import { disposeObject, findParentObject } from './utils.js';

/**
 * Build an object at the current build position
 */
export function buildObject() {
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Don't build if fists are selected
  if (type === 'fists') return;
  
  const buildPos = getBuildPosition();
  if (buildPos) {
    let newObject = null;
    if (worldState.isInside) {
      // Interior objects
      switch (type) {
        case 'chair':
          newObject = createChair(buildPos.x, buildPos.z);
          break;
        case 'table':
          newObject = createTable(buildPos.x, buildPos.z);
          break;
        case 'couch':
          newObject = createCouch(buildPos.x, buildPos.z);
          break;
        case 'tv':
          newObject = createTV(buildPos.x, buildPos.z);
          break;
        case 'bed':
          newObject = createBed(buildPos.x, buildPos.z);
          break;
        case 'cat':
          newObject = createCat(buildPos.x, buildPos.z);
          break;
        case 'dog':
          newObject = createDog(buildPos.x, buildPos.z);
          break;
      }
    } else {
      // Exterior objects
      switch (type) {
        case 'tree':
          newObject = createTree(buildPos.x, buildPos.z);
          break;
        case 'rock':
          newObject = createRock(buildPos.x, buildPos.z);
          break;
        case 'house':
          newObject = createHouse(buildPos.x, buildPos.z);
          break;
        case 'cow':
          newObject = createCow(buildPos.x, buildPos.z);
          break;
        case 'pig':
          newObject = createPig(buildPos.x, buildPos.z);
          break;
        case 'horse':
          newObject = createHorse(buildPos.x, buildPos.z);
          break;
      }
    }
    // Apply rotation to the newly created object
    if (newObject) {
      newObject.rotation.y = ghostRotation;
    }
  }
}

/**
 * Remove the currently highlighted object from the world
 */
export function removeObject() {
  if (!highlightedObject || !highlightedObject.userData.removable) {
    return;
  }
  
  try {
    // Remove from scene
    interactableObjects.remove(highlightedObject);
    
    if (worldState.isInside) {
      // Remove from interior objects array
      const index = interiorObjects.indexOf(highlightedObject);
      if (index > -1) {
        interiorObjects.splice(index, 1);
      }
      
      // Remove from interior animals if it's an animal
      const animalTypes = ['cat', 'dog'];
      if (animalTypes.includes(highlightedObject.userData.type)) {
        const animalIndex = interiorAnimals.indexOf(highlightedObject);
        if (animalIndex > -1) {
          interiorAnimals.splice(animalIndex, 1);
        }
      }
    } else {
      // Remove from world objects array
      const index = worldObjects.indexOf(highlightedObject);
      if (index > -1) {
        worldObjects.splice(index, 1);
      }
      
      // Remove from world animals if it's an animal
      const animalTypes = ['cow', 'pig', 'horse'];
      if (animalTypes.includes(highlightedObject.userData.type)) {
        const animalIndex = worldAnimals.indexOf(highlightedObject);
        if (animalIndex > -1) {
          worldAnimals.splice(animalIndex, 1);
        }
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
  
  // Variable distance based on camera pitch (looking down = closer, looking up = farther)
  const pitchFactor = 1 - (camera.rotation.x / (Math.PI / 2)); // 0 when looking down, 2 when looking up
  const baseDistance = worldState.isInside ? CONFIG.building.distance * 0.5 : CONFIG.building.distance;
  const distance = baseDistance * (0.5 + pitchFactor * 0.5);
  
  const buildPos = camera.position.clone();
  buildPos.add(forward.multiplyScalar(distance));
  buildPos.y = 0;
  
  // Ensure build position is within room bounds when inside
  if (worldState.isInside) {
    const roomHalfSize = CONFIG.interior.roomSize / 2 - 1; // Leave some padding
    buildPos.x = Math.max(-roomHalfSize, Math.min(roomHalfSize, buildPos.x));
    buildPos.z = Math.max(-roomHalfSize, Math.min(roomHalfSize, buildPos.z));
  }
  
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
  
  // Use recursive=true to check all children (including doors on houses)
  const intersects = raycaster.intersectObjects(objectsToCheck, true);
  
  // Reset previous highlight
  if (highlightedObject) {
    resetObjectHighlight(highlightedObject);
    setHighlightedObject(null);
  }
  
  // Highlight new object if within range
  if (intersects.length > 0) {
    const distance = intersects[0].distance;
    const hitObject = intersects[0].object;
    
    // First check if we hit a door directly
    if (hitObject.userData && hitObject.userData.type === 'door' && distance < CONFIG.building.distance) {
      // Check if it's an exterior door (when outside) or interior door (when inside)
      if (!worldState.isInside || (worldState.isInside && hitObject.userData.isInteractive)) {
        setHighlightedObject(hitObject);
        highlightDoor(hitObject);
        return;
      }
    }
    
    // If not a door, find the top-level parent object (house, tree, etc.)
    let parentObject = hitObject;
    while (parentObject.parent && parentObject.parent.name !== 'interactableObjects' && parentObject.parent.name !== 'interior') {
      parentObject = parentObject.parent;
    }
    
    // Check if the parent is removable
    if (parentObject && parentObject.userData && parentObject.userData.removable && distance < CONFIG.building.distance) {
      setHighlightedObject(parentObject);
      highlightObject(parentObject);
    }
  }
  
  // Update ghost object for building preview
  updateGhostObject();
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
    // Reset door material emissive properties
    if (object.material) {
      // Clone the material if it hasn't been cloned yet
      if (!object.material.isClone) {
        object.material = object.material.clone();
        object.material.isClone = true;
      }
      object.material.emissive = new THREE.Color(0x000000);
      object.material.emissiveIntensity = 0;
    }
  } else {
    // Regular object highlight reset
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // Clone the material if it hasn't been cloned yet
        if (!child.material.isClone) {
          child.material = child.material.clone();
          child.material.isClone = true;
        }
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
  if (door.isMesh && door.material) {
    // Clone the material if it hasn't been cloned yet
    if (!door.material.isClone) {
      door.material = door.material.clone();
      door.material.isClone = true;
    }
    door.material.emissive = new THREE.Color(CONFIG.interior.doorHighlightColor);
    door.material.emissiveIntensity = 0.4;
  }
}

/**
 * Update the ghost preview object for building
 */
function updateGhostObject() {
  // Get the appropriate buildable types based on location
  const currentBuildableTypes = worldState.isInside ? interiorBuildableTypes : buildableTypes;
  const type = currentBuildableTypes[selectedObjectType];
  
  // Remove ghost if fists selected
  if (type === 'fists') {
    if (ghostObject) {
      disposeObject(ghostObject);
      setGhostObject(null);
      setLastGhostType(null);
      setLastGhostRotation(0);
    }
    return;
  }
  
  // Check if we need to recreate the ghost (type changed or rotation changed)
  const needsRecreation = !ghostObject || type !== lastGhostType || ghostRotation !== lastGhostRotation;
  
  // Get build position
  const buildPos = getBuildPosition();
  if (!buildPos) {
    if (ghostObject) {
      disposeObject(ghostObject);
      setGhostObject(null);
    }
    return;
  }
  
  // Update position if ghost exists and doesn't need recreation
  if (ghostObject && !needsRecreation) {
    ghostObject.position.copy(buildPos);
    return;
  }
  
  // Remove existing ghost if recreating
  if (ghostObject) {
    disposeObject(ghostObject);
    setGhostObject(null);
  }
  
  // Create new ghost for building preview
  if (buildPos) {
    // Create a detailed ghost object with direction indicator
    const ghostGroup = new THREE.Group();
    const ghostMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: CONFIG.building.ghostOpacity,
      depthWrite: false
    });
    
    switch (type) {
      case 'tree':
        // Tree with directional lean
        const treeGhost = new THREE.Mesh(
          new THREE.ConeGeometry(2, 6, 8),
          ghostMaterial.clone()
        );
        treeGhost.material.color.set(0x00ff00);
        treeGhost.position.y = 3;
        ghostGroup.add(treeGhost);
        
        // Add a small branch to show direction
        const branchGhost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 1.5),
          ghostMaterial.clone()
        );
        branchGhost.material.color.set(0x8B4513);
        branchGhost.position.set(0.8, 2, 0);
        branchGhost.rotation.z = -Math.PI / 6;
        ghostGroup.add(branchGhost);
        break;
        
      case 'rock':
        // Rock with directional marking
        const rockGhost = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 6, 5),
          ghostMaterial.clone()
        );
        rockGhost.material.color.set(0x888888);
        rockGhost.scale.set(1.1, 0.8, 1.1);
        rockGhost.position.y = 0.5;
        ghostGroup.add(rockGhost);
        
        // Add small crystal to show front
        const crystalGhost = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.5, 4),
          ghostMaterial.clone()
        );
        crystalGhost.material.color.set(0xaaaaff);
        crystalGhost.position.set(0.8, 0.7, 0);
        crystalGhost.rotation.z = -Math.PI / 6;
        ghostGroup.add(crystalGhost);
        break;
        
      case 'house':
        // House with door to show front
        const houseGhost = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 4),
          ghostMaterial.clone()
        );
        houseGhost.material.color.set(0xffaa00);
        houseGhost.position.y = 1.5;
        ghostGroup.add(houseGhost);
        
        // Add door to show front
        const doorGhost = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1.6, 0.1),
          ghostMaterial.clone()
        );
        doorGhost.material.color.set(0x654321);
        doorGhost.position.set(0, 0.8, 2.05);
        ghostGroup.add(doorGhost);
        break;
        
      case 'cow':
        // Cow body
        const cowBody = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.05, 1.2),
          ghostMaterial.clone()
        );
        cowBody.material.color.set(0x8B4513);
        cowBody.position.y = 0.75;
        ghostGroup.add(cowBody);
        
        // Cow head to show direction
        const cowHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.6),
          ghostMaterial.clone()
        );
        cowHead.material.color.set(0x8B4513);
        cowHead.position.set(1.2, 0.8, 0);
        ghostGroup.add(cowHead);
        
        // Snout
        const cowSnout = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.2, 0.4),
          ghostMaterial.clone()
        );
        cowSnout.material.color.set(0xFFB6C1);
        cowSnout.position.set(1.5, 0.7, 0);
        ghostGroup.add(cowSnout);
        break;
        
      case 'pig':
        // Pig body
        const pigBody = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 4),
          ghostMaterial.clone()
        );
        pigBody.material.color.set(0xFFB6C1);
        pigBody.position.y = 0.45;
        pigBody.scale.set(1.4, 0.9, 1.1);
        ghostGroup.add(pigBody);
        
        // Pig head
        const pigHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 6, 4),
          ghostMaterial.clone()
        );
        pigHead.material.color.set(0xFFB6C1);
        pigHead.position.set(0.9, 0.5, 0);
        ghostGroup.add(pigHead);
        
        // Snout
        const pigSnout = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 0.15),
          ghostMaterial.clone()
        );
        pigSnout.material.color.set(0xFF69B4);
        pigSnout.position.set(1.2, 0.45, 0);
        pigSnout.rotation.z = Math.PI / 2;
        ghostGroup.add(pigSnout);
        break;
        
      case 'horse':
        // Horse body
        const horseBody = new THREE.Mesh(
          new THREE.BoxGeometry(2.3, 1.3, 0.9),
          ghostMaterial.clone()
        );
        horseBody.material.color.set(0x654321);
        horseBody.position.y = 0.9;
        ghostGroup.add(horseBody);
        
        // Horse neck
        const horseNeck = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 1, 0.4),
          ghostMaterial.clone()
        );
        horseNeck.material.color.set(0x654321);
        horseNeck.position.set(1.0, 1.3, 0);
        horseNeck.rotation.z = -Math.PI / 8;
        ghostGroup.add(horseNeck);
        
        // Horse head
        const horseHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.5, 0.3),
          ghostMaterial.clone()
        );
        horseHead.material.color.set(0x654321);
        horseHead.position.set(1.4, 1.7, 0);
        ghostGroup.add(horseHead);
        break;
        
      // Interior objects
      case 'chair':
        // Chair seat
        const chairSeat = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.05, 0.5),
          ghostMaterial.clone()
        );
        chairSeat.material.color.set(0x8B4513);
        chairSeat.position.y = 0.4;
        ghostGroup.add(chairSeat);
        
        // Chair back to show direction
        const chairBack = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.4, 0.05),
          ghostMaterial.clone()
        );
        chairBack.material.color.set(0x8B4513);
        chairBack.position.set(0, 0.6, -0.225);
        ghostGroup.add(chairBack);
        break;
        
      case 'table':
        // Table top
        const tableTop = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.05, 0.8),
          ghostMaterial.clone()
        );
        tableTop.material.color.set(0x8B4513);
        tableTop.position.y = 0.75;
        ghostGroup.add(tableTop);
        
        // Add a small detail to show front
        const tableFront = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.02, 0.1),
          ghostMaterial.clone()
        );
        tableFront.material.color.set(0x654321);
        tableFront.position.set(0, 0.77, 0.35);
        ghostGroup.add(tableFront);
        break;
        
      case 'couch':
        // Couch base
        const couchBase = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.35, 0.8),
          ghostMaterial.clone()
        );
        couchBase.material.color.set(0x4169E1);
        couchBase.position.y = 0.175;
        ghostGroup.add(couchBase);
        
        // Couch back
        const couchBack = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.35, 0.2),
          ghostMaterial.clone()
        );
        couchBack.material.color.set(0x4169E1);
        couchBack.position.set(0, 0.35, -0.3);
        ghostGroup.add(couchBack);
        break;
        
      case 'tv':
        // TV screen
        const tvScreen = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.7, 0.1),
          ghostMaterial.clone()
        );
        tvScreen.material.color.set(0x2F2F2F);
        tvScreen.position.y = 1.2;
        ghostGroup.add(tvScreen);
        
        // TV stand
        const tvStand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 0.8),
          ghostMaterial.clone()
        );
        tvStand.material.color.set(0x4F4F4F);
        tvStand.position.y = 0.4;
        ghostGroup.add(tvStand);
        break;
        
      case 'bed':
        // Bed frame
        const bedFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.3, 2),
          ghostMaterial.clone()
        );
        bedFrame.material.color.set(0x8B4513);
        bedFrame.position.y = 0.25;
        ghostGroup.add(bedFrame);
        
        // Headboard to show direction
        const headboard = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.8, 0.1),
          ghostMaterial.clone()
        );
        headboard.material.color.set(0x8B4513);
        headboard.position.set(0, 0.7, -0.95);
        ghostGroup.add(headboard);
        break;
        
      case 'cat':
        // Cat body
        const catBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.1, 0.48, 6),
          ghostMaterial.clone()
        );
        catBody.material.color.set(0x808080);
        catBody.position.y = 0.12;
        catBody.rotation.z = Math.PI / 2;
        ghostGroup.add(catBody);
        
        // Cat head
        const catHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 6, 6),
          ghostMaterial.clone()
        );
        catHead.material.color.set(0x808080);
        catHead.position.set(0.2, 0.14, 0);
        ghostGroup.add(catHead);
        
        // Ears
        const catEar1 = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.08, 3),
          ghostMaterial.clone()
        );
        catEar1.material.color.set(0x808080);
        catEar1.position.set(0.18, 0.24, 0.06);
        ghostGroup.add(catEar1);
        
        const catEar2 = catEar1.clone();
        catEar2.position.set(0.18, 0.24, -0.06);
        ghostGroup.add(catEar2);
        break;
        
      case 'dog':
        // Dog body
        const dogBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.96, 0.4, 0.32),
          ghostMaterial.clone()
        );
        dogBody.material.color.set(0xD2691E);
        dogBody.position.y = 0.32;
        ghostGroup.add(dogBody);
        
        // Dog head
        const dogHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.28, 0.28),
          ghostMaterial.clone()
        );
        dogHead.material.color.set(0xD2691E);
        dogHead.position.set(0.56, 0.36, 0);
        ghostGroup.add(dogHead);
        
        // Snout
        const dogSnout = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.12, 0.16),
          ghostMaterial.clone()
        );
        dogSnout.material.color.set(0xD2691E);
        dogSnout.position.set(0.68, 0.32, 0);
        ghostGroup.add(dogSnout);
        
        // Tail up to show happiness
        const dogTail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.048, 0.032, 0.32, 4),
          ghostMaterial.clone()
        );
        dogTail.material.color.set(0xD2691E);
        dogTail.position.set(-0.4, 0.4, 0);
        dogTail.rotation.z = Math.PI / 3;
        ghostGroup.add(dogTail);
        break;
    }
    
    const ghost = ghostGroup;
    ghost.position.copy(buildPos);
    ghost.rotation.y = ghostRotation; // Apply rotation
    scene.add(ghost);
    setGhostObject(ghost);
    
    // Track the type and rotation for next frame
    setLastGhostType(type);
    setLastGhostRotation(ghostRotation);
  }
}