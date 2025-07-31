/**
 * World creation and environment functions
 */

import { CONFIG } from './config.js';
import { 
  scene, setInteractableObjects, setSunLight, setMoonLight, 
  setAmbientLight, setSkyMesh, setSunMesh, setMoonMesh 
} from './gameState.js';

/**
 * Create the game world environment
 */
export function createWorld() {
  // Create ground plane with procedural variation
  const groundGeometry = new THREE.PlaneGeometry(
    CONFIG.world.groundSize, 
    CONFIG.world.groundSize, 
    100, 
    100
  );
  
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a7d3a,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Add subtle height variation for natural terrain
  const vertices = groundGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 0.2 - 0.1;
  }
  groundGeometry.computeVertexNormals();
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);
  
  // Add grid helper for spatial reference
  const gridHelper = new THREE.GridHelper(
    CONFIG.world.size, 
    CONFIG.world.gridDivisions, 
    0x444444, 
    0x222222
  );
  gridHelper.name = 'gridHelper';
  scene.add(gridHelper);
  
  // Create sky dome
  const skyGeometry = new THREE.SphereGeometry(CONFIG.world.fogFar, 32, 16);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide
  });
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.name = 'sky';
  scene.add(skyMesh);
  setSkyMesh(skyMesh);
  
  // Initialize interactable objects group
  const interactableObjects = new THREE.Group();
  interactableObjects.name = 'interactableObjects';
  scene.add(interactableObjects);
  setInteractableObjects(interactableObjects);
}

/**
 * Create lighting for the scene
 */
export function createLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  setAmbientLight(ambientLight);
  
  // Sun light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -50;
  sunLight.shadow.camera.right = 50;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -50;
  sunLight.shadow.camera.near = 0.1;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
  sunLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
  scene.add(sunLight);
  setSunLight(sunLight);
  
  // Moon light (initially disabled)
  const moonLight = new THREE.DirectionalLight(0x6666ff, 0.3);
  moonLight.position.set(-50, 100, -50);
  moonLight.castShadow = true;
  moonLight.shadow.camera.left = -50;
  moonLight.shadow.camera.right = 50;
  moonLight.shadow.camera.top = 50;
  moonLight.shadow.camera.bottom = -50;
  moonLight.shadow.camera.near = 0.1;
  moonLight.shadow.camera.far = 200;
  moonLight.shadow.mapSize.width = CONFIG.renderer.shadowMapSize;
  moonLight.shadow.mapSize.height = CONFIG.renderer.shadowMapSize;
  moonLight.visible = false;
  scene.add(moonLight);
  setMoonLight(moonLight);
  
  // Create sun mesh
  const sunGeometry = new THREE.SphereGeometry(10, 32, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);
  setSunMesh(sunMesh);
  
  // Create moon mesh
  const moonGeometry = new THREE.SphereGeometry(8, 32, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xcccccc
  });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  moonMesh.visible = false;
  scene.add(moonMesh);
  setMoonMesh(moonMesh);
}