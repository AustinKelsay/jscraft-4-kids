/**
 * Game state management
 * Contains all global state variables
 */

import { CONFIG } from './config.js';

// Core Three.js objects
export let scene, camera, renderer;
export let raycaster;
export let clock;

// Player state management
export const player = {
  velocity: new THREE.Vector3(),
  canJump: true,
  height: CONFIG.player.height
};

// Camera controller for FPS-style movement
export const cameraController = {
  yaw: 0,      // Horizontal rotation (Y-axis)
  pitch: 0     // Vertical rotation (X-axis)
};

// Input state tracking
export const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false
};

export const mouseControls = {
  active: false,
  movementX: 0,
  movementY: 0
};

// Building system state
export let selectedObjectType = 0;
export const buildableTypes = ['fists', 'tree', 'rock', 'house', 'cow', 'pig', 'horse'];
export let highlightedObject = null;
export let ghostObject = null;

// World object management
export const worldObjects = [];
export const animals = [];  // Track animals for movement updates
export let interactableObjects;

// Interior world state management
export const worldState = {
  isInside: false,                    // Whether player is inside a building
  currentHouse: null,                 // Reference to the house player entered
  outsidePosition: new THREE.Vector3(), // Player position before entering
  outsideRotation: { yaw: 0, pitch: 0 }, // Camera rotation before entering
  interiorObjects: [],                // Objects in the current interior
  interiorGroup: null                 // Group containing all interior objects
};

// Lighting and environment
export let sunLight, moonLight, ambientLight;
export let skyMesh, sunMesh, moonMesh;

// UI element references
export const uiElements = {
  crosshair: null,
  compass: null,
  selector: null,
  instructions: null
};

// Setter functions for variables that need to be updated
export function setScene(value) { scene = value; }
export function setCamera(value) { camera = value; }
export function setRenderer(value) { renderer = value; }
export function setRaycaster(value) { raycaster = value; }
export function setClock(value) { clock = value; }
export function setInteractableObjects(value) { interactableObjects = value; }
export function setSunLight(value) { sunLight = value; }
export function setMoonLight(value) { moonLight = value; }
export function setAmbientLight(value) { ambientLight = value; }
export function setSkyMesh(value) { skyMesh = value; }
export function setSunMesh(value) { sunMesh = value; }
export function setMoonMesh(value) { moonMesh = value; }
export function setHighlightedObject(value) { highlightedObject = value; }
export function setGhostObject(value) { ghostObject = value; }
export function setSelectedObjectType(value) { selectedObjectType = value; }