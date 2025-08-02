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
export const interiorBuildableTypes = ['fists', 'chair', 'table', 'couch', 'tv', 'bed', 'cat', 'dog'];
export let highlightedObject = null;
export let ghostObject = null;
export let ghostRotation = 0;  // Rotation for ghost preview objects
export let lastGhostType = null;  // Track last ghost type to avoid recreation
export let lastGhostRotation = 0;  // Track last rotation to detect changes

// World object management
export const worldObjects = [];     // Outdoor objects (trees, rocks, houses)
export const interiorObjects = [];  // Indoor objects (furniture: tv, chairs, couches, etc.)
export const worldAnimals = [];     // Outdoor animals (cows, pigs, horses)
export const interiorAnimals = [];  // Indoor animals (cats, dogs)
export let interactableObjects;

// Interior world state management
export const worldState = {
  isInside: false,                    // Whether player is inside a building
  currentHouse: null,                 // Reference to the house player entered
  outsidePosition: new THREE.Vector3(), // Player position before entering
  outsideRotation: { yaw: 0, pitch: 0 }, // Camera rotation before entering
  interiorGroup: null,                // Group containing all interior objects
  houseInteriors: new Map()           // Map of house UUID to interior data
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
export function setGhostRotation(value) { ghostRotation = value; }
export function setSelectedObjectType(value) { selectedObjectType = value; }
export function setLastGhostType(value) { lastGhostType = value; }
export function setLastGhostRotation(value) { lastGhostRotation = value; }