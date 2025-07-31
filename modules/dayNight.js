/**
 * Day/night cycle system
 */

import { CONFIG } from './config.js';
import { 
  scene, clock, sunLight, moonLight, ambientLight, 
  skyMesh, sunMesh, moonMesh, cameraController 
} from './gameState.js';

/**
 * Update the day/night cycle
 */
export function updateDayNightCycle() {
  const totalCycle = CONFIG.dayNight.dayDuration + CONFIG.dayNight.nightDuration;
  const elapsed = clock.getElapsedTime() % totalCycle;
  const isDay = elapsed < CONFIG.dayNight.dayDuration;
  
  let progress, lightIntensity, skyColor;
  
  if (isDay) {
    // Day time
    progress = elapsed / CONFIG.dayNight.dayDuration;
    const sunAngle = progress * Math.PI;
    
    // Update sun position and light
    const sunX = Math.cos(sunAngle) * CONFIG.dayNight.sunDistance;
    const sunY = Math.sin(sunAngle) * CONFIG.dayNight.sunDistance;
    sunLight.position.set(sunX, sunY, 50);
    sunMesh.position.set(sunX, sunY, -100);
    sunLight.visible = true;
    sunMesh.visible = true;
    moonLight.visible = false;
    moonMesh.visible = false;
    
    lightIntensity = 0.5 + Math.sin(sunAngle) * 0.5;
    sunLight.intensity = lightIntensity;
    ambientLight.intensity = 0.3 + lightIntensity * 0.2;
    
    // Sky color transitions
    if (progress < 0.1 || progress > 0.9) {
      // Sunrise/sunset
      skyColor = new THREE.Color(0xff6b35);
      scene.fog.color = skyColor;
    } else {
      skyColor = new THREE.Color(0x87ceeb);
      scene.fog.color = skyColor;
    }
  } else {
    // Night time
    progress = (elapsed - CONFIG.dayNight.dayDuration) / CONFIG.dayNight.nightDuration;
    const moonAngle = progress * Math.PI;
    
    // Update moon position and light
    const moonX = -Math.cos(moonAngle) * CONFIG.dayNight.moonDistance;
    const moonY = Math.sin(moonAngle) * CONFIG.dayNight.moonDistance;
    moonLight.position.set(moonX, moonY, -50);
    moonMesh.position.set(moonX, moonY, -100);
    moonLight.visible = true;
    moonMesh.visible = true;
    sunLight.visible = false;
    sunMesh.visible = false;
    
    lightIntensity = 0.1 + Math.sin(moonAngle) * 0.2;
    moonLight.intensity = lightIntensity;
    ambientLight.intensity = 0.1;
    
    skyColor = new THREE.Color(0x191970);
    scene.fog.color = skyColor;
  }
  
  // Update sky color
  skyMesh.material.color = skyColor;
  
  // Update compass time display
  updateCompass(isDay, progress);
}

/**
 * Update compass display with current time
 * @param {boolean} isDay - Whether it's day time
 * @param {number} progress - Progress through current cycle (0-1)
 */
function updateCompass(isDay, progress) {
  const needle = document.getElementById('compassNeedle');
  const timeDisplay = document.getElementById('timeDisplay');
  
  if (needle) {
    const rotation = -cameraController.yaw * (180 / Math.PI) - 90;
    needle.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
  }
  
  if (timeDisplay) {
    if (isDay) {
      timeDisplay.textContent = progress < 0.5 ? 'Morning' : 'Afternoon';
    } else {
      timeDisplay.textContent = 'Night';
    }
  }
}