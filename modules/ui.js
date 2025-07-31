/**
 * UI elements creation and management
 */

import { CONFIG } from './config.js';
import { uiElements, selectedObjectType } from './gameState.js';

/**
 * Create all UI elements for the game
 */
export function createUIElements() {
  createCrosshair();
  createCompass();
  createObjectSelector();
  updateInstructions();
  updateObjectSelector();
}

/**
 * Create the aiming crosshair
 */
function createCrosshair() {
  const crosshair = document.createElement('div');
  crosshair.innerHTML = `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <div style="width: 20px; height: 2px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
      <div style="width: 2px; height: 20px; background: white; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
    </div>
  `;
  document.body.appendChild(crosshair);
  uiElements.crosshair = crosshair;
}

/**
 * Create the compass UI element
 */
function createCompass() {
  const compass = document.createElement('div');
  compass.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: ${CONFIG.ui.compassSize}px;
    height: ${CONFIG.ui.compassSize}px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: white;
    font-family: Arial;
    font-size: 12px;
  `;
  compass.innerHTML = `
    <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%);">N</div>
    <div id="compassNeedle" style="position: absolute; top: 50%; left: 50%; width: 2px; height: 30px; background: red; transform-origin: center bottom;"></div>
    <div id="timeDisplay" style="position: absolute; top: ${CONFIG.ui.compassSize + 10}px; left: 50%; transform: translateX(-50%); text-align: center; width: 100px;">Day</div>
  `;
  document.body.appendChild(compass);
  uiElements.compass = compass;
}

/**
 * Create the object selector UI
 */
function createObjectSelector() {
  const selector = document.createElement('div');
  selector.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
  `;
  
  // Create selector items
  const items = [
    { icon: '✊', label: 'Fists', key: '0' },
    { icon: '🌳', label: 'Tree', key: '1' },
    { icon: '🪨', label: 'Rock', key: '2' },
    { icon: '🏠', label: 'House', key: '3' },
    { icon: '🐄', label: 'Cow', key: '4' },
    { icon: '🐷', label: 'Pig', key: '5' },
    { icon: '🐴', label: 'Horse', key: '6' }
  ];
  
  selector.innerHTML = items.map((item, index) => `
    <div class="selector-item" data-type="${index}" style="
      width: ${CONFIG.ui.selectorItemSize}px;
      height: ${CONFIG.ui.selectorItemSize}px;
      background: #333;
      border: 2px solid ${index === 0 ? '#ff0' : '#666'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
    ">
      <div>${item.icon}<br>${item.label}<br>[${item.key}]</div>
    </div>
  `).join('');
  
  document.body.appendChild(selector);
  uiElements.selector = selector;
}

/**
 * Update the instructions panel styling
 */
function updateInstructions() {
  const instructions = document.getElementById('instructions');
  if (instructions) {
    instructions.style.background = 'rgba(0, 0, 0, 0.7)';
    instructions.style.color = 'white';
    instructions.style.padding = '10px';
    instructions.style.borderRadius = '5px';
    uiElements.instructions = instructions;
  }
}

/**
 * Update the object selector UI to show current selection
 */
export function updateObjectSelector() {
  if (!uiElements.selector) return;
  
  const items = uiElements.selector.querySelectorAll('.selector-item');
  items.forEach((item, index) => {
    if (index === selectedObjectType) {
      item.style.border = '2px solid #ff0';
    } else {
      item.style.border = '2px solid #666';
    }
  });
}