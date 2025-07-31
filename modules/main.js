/**
 * JSCraft 3D - Three.js Implementation
 * Main entry point for the modular game
 * 
 * @version 2.0.0
 * @license MIT
 */

import { CONFIG } from './config.js';
import { 
  setScene, setCamera, setRenderer, setClock, setRaycaster,
  scene, camera, renderer, clock, worldState, worldObjects, animals
} from './gameState.js';
import { createWorld, createLighting } from './world.js';
import { createInitialObjects } from './objects.js';
import { createInitialAnimals, updateAnimals } from './animals.js';
import { createUIElements } from './ui.js';
import { updatePlayer } from './player.js';
import { updateDayNightCycle } from './dayNight.js';
import { updateObjectHighlight } from './building.js';
import { setupEventListeners, onWindowResize, removeEventListeners } from './input.js';
import { updateCameraRotation } from './camera.js';
import { disposeObject } from './utils.js';

/**
 * Initialize the game
 */
function init() {
  try {
    // Clock for time tracking
    setClock(new THREE.Clock());
    
    // Scene setup
    setScene(new THREE.Scene());
    scene.fog = new THREE.Fog(0x87CEEB, CONFIG.world.fogNear, CONFIG.world.fogFar);
    
    // Camera setup
    setCamera(new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    ));
    camera.position.set(0, CONFIG.player.height, 0);
    
    // Initialize camera rotation properly
    updateCameraRotation();
    
    // Renderer setup
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      throw new Error('Game canvas not found');
    }
    
    setRenderer(new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: CONFIG.renderer.antialias 
    }));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Raycaster for object interaction
    setRaycaster(new THREE.Raycaster());
    
    // Setup world
    createWorld();
    createLighting();
    createInitialObjects();
    createInitialAnimals();
    
    // Setup controls
    setupEventListeners();
    
    // Setup UI
    createUIElements();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start game loop
    animate();
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    alert('Failed to start the game. Please check the console for errors.');
  }
}

/**
 * Main animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  updatePlayer(delta);
  
  // Only update outside world systems when not inside
  if (!worldState.isInside) {
    updateDayNightCycle();
    updateAnimals(delta);
  }
  
  updateObjectHighlight();
  
  renderer.render(scene, camera);
}

/**
 * Clean up resources when the window is closed
 */
function cleanup() {
  // Dispose of all world objects
  worldObjects.forEach(object => {
    disposeObject(object);
  });
  
  // Dispose of renderer
  if (renderer) {
    renderer.dispose();
  }
  
  // Remove event listeners
  removeEventListeners();
  window.removeEventListener('resize', onWindowResize);
}

// Initialize on load
window.addEventListener('load', init);

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);