/**
 * Save/Load System
 * Handles saving and loading game state to localStorage
 */

import { CONFIG } from './config.js';
import { 
  worldObjects, interiorObjects, worldAnimals, interiorAnimals,
  camera, cameraController, worldState, selectedObjectType, ghostRotation, scene, clock,
  interactableObjects, skyMesh, sunMesh, moonMesh, sunLight, moonLight, ambientLight
} from './gameState.js';
import { createTree, createRock, createHouse } from './worldObjects.js';
import { createCow, createPig, createHorse } from './worldAnimals.js';
import { createChair, createTable, createCouch, createTV, createBed } from './interiorObjects.js';
import { createCat, createDog } from './interiorAnimals.js';
import { disposeObject } from './utils.js';
import { updateCameraRotation } from './camera.js';
import { createInterior, removeInterior } from './interior.js';
import { updateSelectorContent } from './ui.js';

const SAVE_KEY = 'jscraft_save';
const SAVE_VERSION = '1.0';

/**
 * Save the current game state
 * @returns {boolean} Success status
 */
export function saveGameState() {
  try {
    // Always save current interior if inside a house
    if (worldState.isInside && worldState.currentHouse) {
      saveCurrentInterior();
    }
    
    // Convert house interiors Map to serializable format
    const houseInteriorsData = {};
    worldState.houseInteriors.forEach((interiorData, houseUuid) => {
      houseInteriorsData[houseUuid] = interiorData;
    });
    
    // Prepare save data
    
    const saveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      timeOfDay: clock.getElapsedTime(), // Save the current time
      player: {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        rotation: {
          yaw: cameraController.yaw,
          pitch: cameraController.pitch
        },
        selectedObjectType: selectedObjectType,
        ghostRotation: ghostRotation
      },
      worldState: {
        isInside: worldState.isInside,
        currentHouseUuid: worldState.currentHouse ? worldState.currentHouse.uuid : null,
        outsidePosition: worldState.outsidePosition.toArray(),
        outsideRotation: worldState.outsideRotation
      },
      worldObjects: worldObjects.map(obj => ({
        type: obj.userData.type,
        position: obj.position.toArray(),
        rotation: obj.rotation.y,
        uuid: obj.uuid
      })),
      worldAnimals: worldAnimals.map(animal => ({
        type: animal.userData.type,
        position: animal.position.toArray(),
        rotation: animal.rotation.y
      })),
      houseInteriors: houseInteriorsData
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

/**
 * Load a saved game state
 * @returns {boolean} Success status
 */
export function loadGameState() {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      console.log('No save data found');
      return false;
    }
    
    let saveData;
    try {
      saveData = JSON.parse(savedData);
    } catch (parseError) {
      console.error('Failed to parse save data:', parseError);
      return false;
    }
    
    // Validate save data structure
    if (!saveData || typeof saveData !== 'object') {
      console.error('Invalid save data structure');
      return false;
    }
    
    // Check version compatibility
    if (saveData.version !== SAVE_VERSION) {
      // Version mismatch but continue loading
    }
    
    // Clear existing objects (except initial terrain)
    clearWorldObjects();
    
    // Restore player position and rotation
    camera.position.set(
      saveData.player.position.x,
      saveData.player.position.y,
      saveData.player.position.z
    );
    cameraController.yaw = saveData.player.rotation.yaw;
    cameraController.pitch = saveData.player.rotation.pitch;
    updateCameraRotation();
    
    // Restore selected object and ghost rotation
    selectedObjectType = saveData.player.selectedObjectType || 0;
    ghostRotation = saveData.player.ghostRotation || 0;
    
    // Restore time of day
    if (saveData.timeOfDay !== undefined) {
      clock.elapsedTime = saveData.timeOfDay;
      clock.oldTime = performance.now() / 1000 - saveData.timeOfDay;
    }
    
    // Restore world objects
    saveData.worldObjects.forEach(objData => {
      let newObj = null;
      const [x, y, z] = objData.position;
      
      switch (objData.type) {
        case 'tree':
          newObj = createTree(x, z);
          break;
        case 'rock':
          newObj = createRock(x, z);
          break;
        case 'house':
          // Pass the UUID to preserve it for interior mapping
          newObj = createHouse(x, z, objData.uuid);
          break;
      }
      
      if (newObj) {
        newObj.rotation.y = objData.rotation;
      }
    });
    
    // Restore world animals
    saveData.worldAnimals.forEach(animalData => {
      let newAnimal = null;
      const [x, y, z] = animalData.position;
      
      switch (animalData.type) {
        case 'cow':
          newAnimal = createCow(x, z);
          break;
        case 'pig':
          newAnimal = createPig(x, z);
          break;
        case 'horse':
          newAnimal = createHorse(x, z);
          break;
      }
      
      if (newAnimal) {
        newAnimal.rotation.y = animalData.rotation;
      }
    });
    
    // Restore house interiors data
    if (saveData.houseInteriors && typeof saveData.houseInteriors === 'object') {
      worldState.houseInteriors.clear();
      Object.entries(saveData.houseInteriors).forEach(([houseUuid, interiorData]) => {
        // Validate interior data structure
        if (interiorData && 
            Array.isArray(interiorData.objects) && 
            Array.isArray(interiorData.animals)) {
          worldState.houseInteriors.set(houseUuid, interiorData);
        }
      });
      // House interiors restored
    }
    
    // If player was inside a house, restore that interior
    if (saveData.worldState.isInside && saveData.worldState.currentHouseUuid) {
      const house = worldObjects.find(obj => obj.uuid === saveData.worldState.currentHouseUuid);
      if (house) {
        // Set world state
        worldState.currentHouse = house;
        worldState.isInside = true;
        worldState.outsidePosition.fromArray(saveData.worldState.outsidePosition);
        worldState.outsideRotation = saveData.worldState.outsideRotation;
        
        // Hide outside world objects
        if (interactableObjects) interactableObjects.visible = false;
        if (skyMesh) skyMesh.visible = false;
        if (sunMesh) sunMesh.visible = false;
        if (moonMesh) moonMesh.visible = false;
        if (sunLight) sunLight.visible = false;
        if (moonLight) moonLight.visible = false;
        if (ambientLight) ambientLight.intensity = 0.5;
        
        // Create interior with saved data
        createInterior(house, true); // Skip default furniture
        loadHouseInterior(house.uuid);
        
        // Update UI for interior mode
        updateSelectorContent();
      }
    } else {
      // Reset world state if not inside
      worldState.isInside = false;
      worldState.currentHouse = null;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

/**
 * Clear all world objects (used before loading)
 */
function clearWorldObjects() {
  // Clear world objects
  [...worldObjects].forEach(obj => {
    if (obj.parent) obj.parent.remove(obj);
    disposeObject(obj);
  });
  worldObjects.length = 0;
  
  // Clear world animals
  [...worldAnimals].forEach(animal => {
    if (animal.parent) animal.parent.remove(animal);
    disposeObject(animal);
  });
  worldAnimals.length = 0;
  
  // Clear interior objects if inside
  if (worldState.isInside) {
    [...interiorObjects].forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
      disposeObject(obj);
    });
    interiorObjects.length = 0;
    
    [...interiorAnimals].forEach(animal => {
      if (animal.parent) animal.parent.remove(animal);
      disposeObject(animal);
    });
    interiorAnimals.length = 0;
  }
}

/**
 * Check if a save exists
 * @returns {boolean} True if save exists
 */
export function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Get save data info without loading
 * @returns {Object|null} Save info or null
 */
export function getSaveInfo() {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;
    
    const saveData = JSON.parse(savedData);
    return {
      timestamp: new Date(saveData.timestamp),
      objectCount: saveData.worldObjects.length,
      animalCount: saveData.worldAnimals.length
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete save data
 */
export function deleteSaveData() {
  localStorage.removeItem(SAVE_KEY);
  console.log('Save data deleted');
}

/**
 * Save the current interior to the house interiors map
 * Traverses the interior group to collect all furniture and pets
 * Only saves if player is currently inside a house
 */
export function saveCurrentInterior() {
  if (!worldState.currentHouse || !worldState.isInside) {
    return;
  }
  
  const houseUuid = worldState.currentHouse.uuid;
  
  // Collect all interior objects from the interior group
  const objectsToSave = [];
  const animalsToSave = [];
  
  if (worldState.interiorGroup) {
    worldState.interiorGroup.traverse(child => {
      if (child.userData && child.userData.type) {
        const saveData = {
          type: child.userData.type,
          position: child.position.toArray(),
          rotation: child.rotation.y || 0
        };
        
        if (['chair', 'table', 'couch', 'tv', 'bed'].includes(child.userData.type)) {
          objectsToSave.push(saveData);
        } else if (['cat', 'dog'].includes(child.userData.type)) {
          animalsToSave.push(saveData);
        }
      }
    });
  }
  
  const interiorData = {
    objects: objectsToSave,
    animals: animalsToSave,
    timestamp: Date.now()
  };
  
  worldState.houseInteriors.set(houseUuid, interiorData);
}

/**
 * Load a specific house's interior from saved data
 * Recreates all furniture and pets in their saved positions
 * @param {string} houseUuid - UUID of the house to load interior for
 * @returns {boolean} True if interior was loaded successfully, false otherwise
 */
export function loadHouseInterior(houseUuid) {
  const interiorData = worldState.houseInteriors.get(houseUuid);
  
  if (!interiorData || !worldState.interiorGroup) {
    return false;
  }
  
  // Clear arrays to track new objects
  interiorObjects.length = 0;
  interiorAnimals.length = 0;
  
  // Restore interior objects
  interiorData.objects.forEach(objData => {
    let newObj = null;
    const [x, y, z] = objData.position;
    
    switch (objData.type) {
      case 'chair':
        newObj = createChair(x, y, z);
        break;
      case 'table':
        newObj = createTable(x, y, z);
        break;
      case 'couch':
        newObj = createCouch(x, y, z);
        break;
      case 'tv':
        newObj = createTV(x, y, z);
        break;
      case 'bed':
        newObj = createBed(x, y, z);
        break;
    }
    
    if (newObj) {
      newObj.rotation.y = objData.rotation || 0;
      // Always add to interior group when loading interior
      if (worldState.interiorGroup) {
        worldState.interiorGroup.add(newObj);
      }
      // Track in the array
      if (!interiorObjects.includes(newObj)) {
        interiorObjects.push(newObj);
      }
    }
  });
  
  // Restore interior animals
  interiorData.animals.forEach(animalData => {
    let newAnimal = null;
    const [x, , z] = animalData.position;
    
    switch (animalData.type) {
      case 'cat':
        newAnimal = createCat(x, z);
        break;
      case 'dog':
        newAnimal = createDog(x, z);
        break;
    }
    
    if (newAnimal) {
      newAnimal.rotation.y = animalData.rotation || 0;
      // Always add to interior group when loading interior
      if (worldState.interiorGroup) {
        worldState.interiorGroup.add(newAnimal);
      }
      // Track in the array
      if (!interiorAnimals.includes(newAnimal)) {
        interiorAnimals.push(newAnimal);
      }
    }
  });
  
  return true;
}