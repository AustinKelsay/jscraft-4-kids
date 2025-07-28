// ===================================================================
// JSCraft First-Person Adventure Game
// A modular, educational 3D first-person game built with Canvas 2D
// ===================================================================

// ===================================================================
// CONFIGURATION AND CONSTANTS
// ===================================================================

const CONFIG = {
  // Player settings
  player: {
    initialX: 400,
    initialY: 300,
    speed: 3,
    turnSpeed: 0.05,
    mouseSensitivity: 0.002,
    maxPitch: Math.PI / 3,
    buildDistance: 100
  },
  
  // World settings
  world: {
    minX: 50,
    maxX: 1200,
    minY: 50,
    maxY: 800,
    maxRenderDistance: 400,
    targetingDistance: 200,
    targetingAngle: 0.1
  },
  
  // Day/night cycle
  dayNight: {
    dayDuration: 120000,    // 2 minutes
    nightDuration: 60000,   // 1 minute
    dayBrightnessMin: 0.6,
    dayBrightnessMax: 1.0,
    nightBrightnessMin: 0.2,
    nightBrightnessMax: 0.35
  },
  
  // Rendering settings
  rendering: {
    fieldOfView: Math.PI / 3,  // 60 degrees
    baseObjectSize: 200,
    pitchMultiplier: 300,
    sunRadius: 30,
    moonRadius: 25,
    compassRadius: 40,
    compassX: 80,
    compassY: 80
  },
  
  // UI settings
  ui: {
    crosshairSize: 10,
    selectorHeight: 80,
    selectorItemSize: 60,
    selectorSpacing: 20,
    selectorPadding: 20,
    instructionFont: '14px Arial',
    labelFont: '12px Arial'
  }
};

// Object type configurations
const OBJECT_CONFIGS = {
  tree: {
    colors: ['#228B22', '#0F5F0F', '#2E8B57', '#006400'],
    widths: [35, 40, 45, 50],
    heights: [100, 110, 120, 130, 140, 150, 160],
    trunkColor: '#8B4513',
    trunkWidthRatio: 0.15,
    trunkHeightRatio: 0.45,
    foliageRadiusRatio: 0.35
  },
  rock: {
    colors: ['#696969', '#808080', '#A9A9A9', '#708090'],
    widths: [22, 25, 28, 30, 32, 35, 40],
    heights: [18, 20, 22, 25, 28, 30, 35]
  },
  house: {
    colors: ['#D2691E', '#CD853F', '#8B4513', '#A0522D'],
    widths: [70, 75, 80, 85, 90],
    heights: [90, 95, 100, 105, 110],
    depthRatio: 0.75,
    roofColor: '#8B4513',
    windowColor: '#87CEEB',
    doorColor: '#654321'
  }
};

// ===================================================================
// GAME STATE
// ===================================================================

const GameState = {
  // Canvas and context
  canvas: null,
  ctx: null,
  
  // Player state
  player: {
    x: CONFIG.player.initialX,
    y: CONFIG.player.initialY,
    angle: 0,
    pitch: 0,
    speed: CONFIG.player.speed,
    turnSpeed: CONFIG.player.turnSpeed
  },
  
  // Input state
  keys: {
    left: false,
    right: false,
    up: false,
    down: false,
    turnLeft: false,
    turnRight: false
  },
  
  // Building system state
  buildableTypes: ['tree', 'rock', 'house'],
  selectedObjectType: 0,
  targetedObject: null,
  mouseControlsActive: false,
  
  // Day/night cycle state
  cycleStartTime: Date.now(),
  
  // World objects
  worldObjects: []
};

// ===================================================================
// INITIALIZATION
// ===================================================================

function initializeGame() {
  // Get canvas and context
  GameState.canvas = document.getElementById('gameCanvas');
  GameState.ctx = GameState.canvas.getContext('2d');
  
  // Set up canvas resizing
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Initialize world objects
  initializeWorldObjects();
  
  // Set up input handlers
  setupKeyboardHandlers();
  setupMouseHandlers();
  
  // Start game loop
  gameLoop();
}

function resizeCanvas() {
  GameState.canvas.width = window.innerWidth;
  GameState.canvas.height = window.innerHeight;
}

function initializeWorldObjects() {
  GameState.worldObjects = [
    // Trees
    {x: 200, y: 100, width: 40, height: 120, depth: 40, color: '#228B22', type: 'tree'},
    {x: 500, y: 200, width: 45, height: 140, depth: 45, color: '#0F5F0F', type: 'tree'},
    {x: 150, y: 400, width: 35, height: 100, depth: 35, color: '#2E8B57', type: 'tree'},
    {x: 600, y: 350, width: 50, height: 160, depth: 50, color: '#228B22', type: 'tree'},
    {x: 300, y: 500, width: 40, height: 110, depth: 40, color: '#006400', type: 'tree'},
    {x: 700, y: 150, width: 38, height: 125, depth: 38, color: '#228B22', type: 'tree'},
    {x: 450, y: 450, width: 42, height: 130, depth: 42, color: '#0F5F0F', type: 'tree'},
    {x: 250, y: 350, width: 36, height: 115, depth: 36, color: '#2E8B57', type: 'tree'},
    {x: 800, y: 400, width: 48, height: 150, depth: 48, color: '#006400', type: 'tree'},
    {x: 50, y: 550, width: 40, height: 120, depth: 40, color: '#228B22', type: 'tree'},
    
    // Rocks
    {x: 350, y: 250, width: 30, height: 25, depth: 30, color: '#696969', type: 'rock'},
    {x: 180, y: 300, width: 25, height: 20, depth: 25, color: '#808080', type: 'rock'},
    {x: 550, y: 400, width: 35, height: 30, depth: 35, color: '#696969', type: 'rock'},
    {x: 250, y: 200, width: 28, height: 22, depth: 28, color: '#A9A9A9', type: 'rock'},
    {x: 750, y: 250, width: 32, height: 28, depth: 32, color: '#708090', type: 'rock'},
    {x: 400, y: 150, width: 22, height: 18, depth: 22, color: '#696969', type: 'rock'},
    {x: 650, y: 480, width: 40, height: 35, depth: 40, color: '#808080', type: 'rock'},
    {x: 120, y: 450, width: 26, height: 21, depth: 26, color: '#A9A9A9', type: 'rock'},
    
    // Houses
    {x: 100, y: 200, width: 80, height: 100, depth: 60, color: '#D2691E', type: 'house'},
    {x: 650, y: 300, width: 90, height: 110, depth: 70, color: '#CD853F', type: 'house'},
    {x: 400, y: 600, width: 75, height: 95, depth: 55, color: '#8B4513', type: 'house'},
    {x: 850, y: 500, width: 85, height: 105, depth: 65, color: '#A0522D', type: 'house'},
    {x: 300, y: 50, width: 70, height: 90, depth: 50, color: '#D2691E', type: 'house'}
  ];
}

// ===================================================================
// INPUT HANDLING
// ===================================================================

function setupKeyboardHandlers() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  
  switch (key) {
    case 'arrowleft':
    case 'a':
      GameState.keys.left = true;
      break;
    case 'arrowright':
    case 'd':
      GameState.keys.right = true;
      break;
    case 'arrowup':
    case 'w':
      GameState.keys.up = true;
      break;
    case 'arrowdown':
    case 's':
      GameState.keys.down = true;
      break;
    case 'q':
      GameState.keys.turnLeft = true;
      break;
    case 'e':
      GameState.keys.turnRight = true;
      break;
    case ' ':
      removeTargetedObject();
      break;
    case 'b':
      buildObject();
      break;
    case '1':
      GameState.selectedObjectType = 0;
      break;
    case '2':
      GameState.selectedObjectType = 1;
      break;
    case '3':
      GameState.selectedObjectType = 2;
      break;
    case 'escape':
      if (GameState.mouseControlsActive) {
        document.exitPointerLock();
      }
      break;
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  
  switch (key) {
    case 'arrowleft':
    case 'a':
      GameState.keys.left = false;
      break;
    case 'arrowright':
    case 'd':
      GameState.keys.right = false;
      break;
    case 'arrowup':
    case 'w':
      GameState.keys.up = false;
      break;
    case 'arrowdown':
    case 's':
      GameState.keys.down = false;
      break;
    case 'q':
      GameState.keys.turnLeft = false;
      break;
    case 'e':
      GameState.keys.turnRight = false;
      break;
  }
}

function setupMouseHandlers() {
  document.addEventListener('mousemove', handleMouseMove);
  GameState.canvas.addEventListener('click', handleCanvasClick);
  document.addEventListener('pointerlockchange', handlePointerLockChange);
}

function handleMouseMove(event) {
  if (GameState.mouseControlsActive) {
    GameState.player.angle += event.movementX * CONFIG.player.mouseSensitivity;
    GameState.player.pitch -= event.movementY * CONFIG.player.mouseSensitivity;
    
    // Normalize angle
    while (GameState.player.angle > Math.PI) GameState.player.angle -= 2 * Math.PI;
    while (GameState.player.angle < -Math.PI) GameState.player.angle += 2 * Math.PI;
    
    // Clamp pitch
    GameState.player.pitch = Math.max(-CONFIG.player.maxPitch, Math.min(CONFIG.player.maxPitch, GameState.player.pitch));
  }
}

function handleCanvasClick() {
  if (!GameState.mouseControlsActive) {
    GameState.canvas.requestPointerLock();
  }
}

function handlePointerLockChange() {
  GameState.mouseControlsActive = document.pointerLockElement === GameState.canvas;
}

// ===================================================================
// GAME LOGIC
// ===================================================================

function updatePlayer() {
  const { player, keys } = GameState;
  
  // Handle turning
  if (keys.turnLeft) {
    player.angle -= player.turnSpeed;
  }
  if (keys.turnRight) {
    player.angle += player.turnSpeed;
  }
  
  // Handle movement
  if (keys.up) {
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
  }
  if (keys.down) {
    player.x -= Math.cos(player.angle) * player.speed;
    player.y -= Math.sin(player.angle) * player.speed;
  }
  if (keys.left) {
    player.x += Math.cos(player.angle - Math.PI / 2) * player.speed;
    player.y += Math.sin(player.angle - Math.PI / 2) * player.speed;
  }
  if (keys.right) {
    player.x += Math.cos(player.angle + Math.PI / 2) * player.speed;
    player.y += Math.sin(player.angle + Math.PI / 2) * player.speed;
  }
  
  // Keep player within bounds
  player.x = Math.max(CONFIG.world.minX, Math.min(CONFIG.world.maxX, player.x));
  player.y = Math.max(CONFIG.world.minY, Math.min(CONFIG.world.maxY, player.y));
}

function getDayNightState() {
  const elapsed = (Date.now() - GameState.cycleStartTime) % (CONFIG.dayNight.dayDuration + CONFIG.dayNight.nightDuration);
  
  if (elapsed < CONFIG.dayNight.dayDuration) {
    // Day time
    const dayProgress = elapsed / CONFIG.dayNight.dayDuration;
    const sunHeight = Math.sin(dayProgress * Math.PI);
    const brightness = CONFIG.dayNight.dayBrightnessMin + sunHeight * (CONFIG.dayNight.dayBrightnessMax - CONFIG.dayNight.dayBrightnessMin);
    
    return {
      isDay: true,
      progress: dayProgress,
      brightness: brightness,
      sunHeight: sunHeight
    };
  } else {
    // Night time
    const nightProgress = (elapsed - CONFIG.dayNight.dayDuration) / CONFIG.dayNight.nightDuration;
    const moonHeight = Math.sin(nightProgress * Math.PI);
    const brightness = CONFIG.dayNight.nightBrightnessMin + moonHeight * (CONFIG.dayNight.nightBrightnessMax - CONFIG.dayNight.nightBrightnessMin);
    
    return {
      isDay: false,
      progress: nightProgress,
      brightness: brightness,
      moonHeight: moonHeight
    };
  }
}

// ===================================================================
// BUILDING SYSTEM
// ===================================================================

function removeTargetedObject() {
  if (GameState.targetedObject) {
    const index = GameState.worldObjects.indexOf(GameState.targetedObject);
    if (index > -1) {
      GameState.worldObjects.splice(index, 1);
      GameState.targetedObject = null;
    }
  }
}

function buildObject() {
  const { player, buildableTypes, selectedObjectType } = GameState;
  const buildDistance = CONFIG.player.buildDistance;
  const newX = player.x + Math.cos(player.angle) * buildDistance;
  const newY = player.y + Math.sin(player.angle) * buildDistance;
  
  const objectType = buildableTypes[selectedObjectType];
  const config = OBJECT_CONFIGS[objectType];
  
  let newObject;
  
  switch(objectType) {
    case 'tree':
      const width = config.widths[Math.floor(Math.random() * config.widths.length)];
      newObject = {
        x: newX,
        y: newY,
        width: width,
        height: config.heights[Math.floor(Math.random() * config.heights.length)],
        depth: width,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: 'tree'
      };
      break;
      
    case 'rock':
      const rockWidth = config.widths[Math.floor(Math.random() * config.widths.length)];
      newObject = {
        x: newX,
        y: newY,
        width: rockWidth,
        height: config.heights[Math.floor(Math.random() * config.heights.length)],
        depth: rockWidth,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: 'rock'
      };
      break;
      
    case 'house':
      const houseWidth = config.widths[Math.floor(Math.random() * config.widths.length)];
      newObject = {
        x: newX,
        y: newY,
        width: houseWidth,
        height: config.heights[Math.floor(Math.random() * config.heights.length)],
        depth: houseWidth * config.depthRatio,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: 'house'
      };
      break;
  }
  
  if (newObject) {
    GameState.worldObjects.push(newObject);
  }
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function getAngleToObject(objX, objY) {
  const dx = objX - GameState.player.x;
  const dy = objY - GameState.player.y;
  return Math.atan2(dy, dx);
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

function applyBrightness(hexColor, brightness) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  return {
    r: Math.floor(r * brightness),
    g: Math.floor(g * brightness),
    b: Math.floor(b * brightness),
    rgb: `rgb(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)})`
  };
}

// ===================================================================
// RENDERING SYSTEM
// ===================================================================

const Renderer = {
  drawBackground() {
    const { ctx, canvas } = GameState;
    const dayNight = getDayNightState();
    
    // Calculate colors based on time of day
    let skyTopColor, skyBottomColor, groundTopColor, groundBottomColor;
    
    if (dayNight.isDay) {
      if (dayNight.sunHeight < 0.3) {
        // Sunrise/sunset
        const sunsetIntensity = 1 - (dayNight.sunHeight / 0.3);
        skyTopColor = `rgb(${Math.floor(135 + 120 * sunsetIntensity)}, ${Math.floor(206 - 100 * sunsetIntensity)}, ${Math.floor(235 - 135 * sunsetIntensity)})`;
        skyBottomColor = `rgb(${Math.floor(224 + 31 * sunsetIntensity)}, ${Math.floor(246 - 70 * sunsetIntensity)}, ${Math.floor(255 - 155 * sunsetIntensity)})`;
      } else {
        skyTopColor = '#87CEEB';
        skyBottomColor = '#E0F6FF';
      }
      groundTopColor = '#90EE90';
      groundBottomColor = '#228B22';
    } else {
      // Night
      skyTopColor = `rgb(${Math.floor(25 * dayNight.brightness)}, ${Math.floor(25 * dayNight.brightness)}, ${Math.floor(60 * dayNight.brightness)})`;
      skyBottomColor = `rgb(${Math.floor(40 * dayNight.brightness)}, ${Math.floor(40 * dayNight.brightness)}, ${Math.floor(80 * dayNight.brightness)})`;
      groundTopColor = `rgb(${Math.floor(50 * dayNight.brightness)}, ${Math.floor(80 * dayNight.brightness)}, ${Math.floor(50 * dayNight.brightness)})`;
      groundBottomColor = `rgb(${Math.floor(20 * dayNight.brightness)}, ${Math.floor(50 * dayNight.brightness)}, ${Math.floor(20 * dayNight.brightness)})`;
    }
    
    // Draw sky
    const pitchOffset = GameState.player.pitch * CONFIG.rendering.pitchMultiplier;
    const horizonY = canvas.height / 2 + pitchOffset;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
    gradient.addColorStop(0, skyTopColor);
    gradient.addColorStop(1, skyBottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, horizonY);
    
    // Draw stars at night
    if (!dayNight.isDay) {
      this.drawStars(horizonY, pitchOffset, dayNight.brightness);
    }
    
    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    groundGradient.addColorStop(0, groundTopColor);
    groundGradient.addColorStop(1, groundBottomColor);
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
    
    // Draw sun or moon
    this.drawCelestialBody(dayNight, horizonY, pitchOffset);
  },
  
  drawStars(horizonY, pitchOffset, brightness) {
    const { ctx, canvas } = GameState;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - brightness)})`;
    
    for (let i = 0; i < 100; i++) {
      const x = (i * 73) % canvas.width;
      const y = ((i * 37) % horizonY) + pitchOffset;
      const size = ((i * 13) % 3) + 1;
      
      if (y > 0 && y < horizonY) {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  },
  
  drawCelestialBody(dayNight, horizonY, pitchOffset) {
    const { ctx, canvas } = GameState;
    const celestialX = canvas.width / 2;
    let celestialY;
    
    if (dayNight.isDay) {
      // Sun
      const sunAngle = dayNight.progress * Math.PI;
      celestialY = horizonY - Math.sin(sunAngle) * (horizonY - 100) + pitchOffset;
      this.drawSun(celestialX, celestialY);
    } else {
      // Moon
      const moonAngle = dayNight.progress * Math.PI;
      celestialY = horizonY - Math.sin(moonAngle) * (horizonY - 100) + pitchOffset;
      this.drawMoon(celestialX, celestialY);
    }
  },
  
  drawSun(x, y) {
    const { ctx } = GameState;
    const sunRadius = CONFIG.rendering.sunRadius;
    
    // Glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, sunRadius * 2);
    glowGradient.addColorStop(0, 'rgba(255, 255, 100, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(x - sunRadius * 2, y - sunRadius * 2, sunRadius * 4, sunRadius * 4);
    
    // Body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, sunRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Rays
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * (sunRadius + 5), y + Math.sin(angle) * (sunRadius + 5));
      ctx.lineTo(x + Math.cos(angle) * (sunRadius + 15), y + Math.sin(angle) * (sunRadius + 15));
      ctx.stroke();
    }
  },
  
  drawMoon(x, y) {
    const { ctx } = GameState;
    const moonRadius = CONFIG.rendering.moonRadius;
    
    // Glow
    ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, moonRadius * 1.5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#F0F0F0';
    ctx.beginPath();
    ctx.arc(x, y, moonRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Craters
    ctx.fillStyle = '#D0D0D0';
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y + 3, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 3, y + 8, 2, 0, 2 * Math.PI);
    ctx.fill();
  },
  
  drawWorldObjects() {
    const { player, worldObjects, canvas } = GameState;
    
    // Reset targeting
    GameState.targetedObject = null;
    let closestDistance = Infinity;
    
    // Sort objects by distance
    const sortedObjects = worldObjects.slice().sort((a, b) => {
      const distA = getDistance(player.x, player.y, a.x, a.y);
      const distB = getDistance(player.x, player.y, b.x, b.y);
      return distB - distA;
    });
    
    sortedObjects.forEach(obj => {
      const distance = getDistance(player.x, player.y, obj.x, obj.y);
      
      if (distance > CONFIG.world.maxRenderDistance) return;
      
      const angleToObject = getAngleToObject(obj.x, obj.y);
      let relativeAngle = normalizeAngle(angleToObject - player.angle);
      
      if (Math.abs(relativeAngle) > CONFIG.rendering.fieldOfView) return;
      
      // Check targeting
      if (Math.abs(relativeAngle) < CONFIG.world.targetingAngle && 
          distance < closestDistance && 
          distance < CONFIG.world.targetingDistance) {
        GameState.targetedObject = obj;
        closestDistance = distance;
      }
      
      // Calculate screen position
      const screenCenterX = canvas.width / 2;
      const screenX = screenCenterX + (relativeAngle / CONFIG.rendering.fieldOfView) * (canvas.width / 2);
      
      // Calculate scale
      const scale = CONFIG.rendering.baseObjectSize / distance;
      const screenWidth = obj.width * scale;
      const screenHeight = obj.height * scale;
      
      // Calculate vertical position
      const pitchOffset = player.pitch * CONFIG.rendering.pitchMultiplier;
      const horizon = canvas.height / 2 + pitchOffset;
      const screenY = horizon - screenHeight;
      
      // Only draw if visible
      if (screenX + screenWidth > 0 && screenX < canvas.width && screenY < canvas.height) {
        this.drawObject(obj, screenX, screenY, screenWidth, screenHeight, distance);
      }
    });
  },
  
  drawObject(obj, x, y, width, height, distance) {
    const { ctx } = GameState;
    const dayNight = getDayNightState();
    const distanceBrightness = Math.max(0.3, 1 - distance / CONFIG.world.maxRenderDistance);
    const brightness = distanceBrightness * dayNight.brightness;
    
    const scale = CONFIG.rendering.baseObjectSize / distance;
    const depthScale = Math.min(0.3, scale * 0.3);
    const objDepth = obj.depth ? obj.depth * depthScale : width * 0.3;
    
    switch(obj.type) {
      case 'tree':
        ObjectRenderers.drawTree(x, y, width, height, objDepth, obj.color, brightness);
        break;
      case 'rock':
        ObjectRenderers.drawRock(x, y, width, height, objDepth, obj.color, brightness);
        break;
      case 'house':
        ObjectRenderers.drawHouse(x, y, width, height, objDepth, obj.color, brightness);
        break;
      default:
        // Fallback
        ctx.fillStyle = applyBrightness(obj.color, brightness).rgb;
        ctx.fillRect(x, y, width, height);
    }
    
    // Draw targeting highlight
    if (obj === GameState.targetedObject) {
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  }
};

// ===================================================================
// OBJECT RENDERERS
// ===================================================================

const ObjectRenderers = {
  drawTree(x, y, width, height, depth, color, brightness) {
    const { ctx } = GameState;
    const config = OBJECT_CONFIGS.tree;
    const colorData = applyBrightness(color, brightness);
    
    // Calculate dimensions
    const trunkWidth = width * config.trunkWidthRatio;
    const trunkHeight = height * config.trunkHeightRatio;
    const foliageRadius = width * config.foliageRadiusRatio;
    const trunkX = x + width / 2 - trunkWidth / 2;
    const trunkY = y + height - trunkHeight;
    
    // Trunk side (3D effect)
    ctx.fillStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(40 * brightness)}, ${Math.floor(10 * brightness)})`;
    ctx.beginPath();
    ctx.moveTo(trunkX + trunkWidth, trunkY);
    ctx.lineTo(trunkX + trunkWidth + depth * 0.15, trunkY - depth * 0.15);
    ctx.lineTo(trunkX + trunkWidth * 0.9 + depth * 0.15, trunkY + trunkHeight - depth * 0.15);
    ctx.lineTo(trunkX + trunkWidth * 0.8, trunkY + trunkHeight);
    ctx.closePath();
    ctx.fill();
    
    // Trunk front
    ctx.fillStyle = `rgb(${Math.floor(101 * brightness)}, ${Math.floor(67 * brightness)}, ${Math.floor(33 * brightness)})`;
    ctx.beginPath();
    ctx.moveTo(trunkX - trunkWidth * 0.1, trunkY + trunkHeight);
    ctx.lineTo(trunkX + trunkWidth * 0.1, trunkY);
    ctx.lineTo(trunkX + trunkWidth * 0.9, trunkY);
    ctx.lineTo(trunkX + trunkWidth * 1.1, trunkY + trunkHeight);
    ctx.closePath();
    ctx.fill();
    
    // Trunk texture
    if (width > 30) {
      ctx.strokeStyle = `rgb(${Math.floor(60 * brightness)}, ${Math.floor(30 * brightness)}, ${Math.floor(10 * brightness)})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(trunkX + trunkWidth * (0.3 + i * 0.2), trunkY + trunkHeight * 0.2);
        ctx.lineTo(trunkX + trunkWidth * (0.3 + i * 0.2), trunkY + trunkHeight * 0.9);
        ctx.stroke();
      }
    }
    
    // Foliage
    const foliageY = y + height * 0.55;
    const centerX = x + width / 2;
    
    const clusters = [
      // Back layer
      {x: centerX + depth * 0.2, y: foliageY - depth * 0.2, r: foliageRadius * 0.8, shade: 0.5},
      {x: centerX - foliageRadius * 0.3 + depth * 0.2, y: foliageY + foliageRadius * 0.2 - depth * 0.2, r: foliageRadius * 0.6, shade: 0.55},
      {x: centerX + foliageRadius * 0.3 + depth * 0.2, y: foliageY + foliageRadius * 0.2 - depth * 0.2, r: foliageRadius * 0.6, shade: 0.55},
      // Middle layer
      {x: centerX, y: foliageY - foliageRadius * 0.3, r: foliageRadius * 0.7, shade: 0.7},
      {x: centerX - foliageRadius * 0.4, y: foliageY, r: foliageRadius * 0.75, shade: 0.75},
      {x: centerX + foliageRadius * 0.4, y: foliageY, r: foliageRadius * 0.75, shade: 0.75},
      // Front layer
      {x: centerX, y: foliageY, r: foliageRadius, shade: 1},
      {x: centerX - foliageRadius * 0.25, y: foliageY + foliageRadius * 0.3, r: foliageRadius * 0.65, shade: 0.9},
      {x: centerX + foliageRadius * 0.25, y: foliageY + foliageRadius * 0.3, r: foliageRadius * 0.65, shade: 0.9},
      {x: centerX, y: foliageY - foliageRadius * 0.2, r: foliageRadius * 0.5, shade: 0.95}
    ];
    
    clusters.forEach(cluster => {
      const clusterBrightness = brightness * cluster.shade;
      ctx.fillStyle = `rgb(${Math.floor(colorData.r * clusterBrightness)}, ${Math.floor(colorData.g * clusterBrightness)}, ${Math.floor(colorData.b * clusterBrightness)})`;
      ctx.beginPath();
      ctx.arc(cluster.x, cluster.y, cluster.r, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Leaf texture
    if (width > 40) {
      ctx.fillStyle = `rgb(${Math.floor(colorData.r * brightness * 1.2)}, ${Math.floor(colorData.g * brightness * 1.2)}, ${Math.floor(colorData.b * brightness * 1.2)})`;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const leafX = centerX + Math.cos(angle) * foliageRadius * 0.7;
        const leafY = foliageY + Math.sin(angle) * foliageRadius * 0.5;
        ctx.beginPath();
        ctx.arc(leafX, leafY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  },
  
  drawRock(x, y, width, height, depth, color, brightness) {
    const { ctx } = GameState;
    const colorData = applyBrightness(color, brightness);
    const centerX = x + width / 2;
    const centerY = y + height * 0.7;
    
    const rockLayers = [
      // Back shadow layer
      {
        points: [
          {x: centerX - width * 0.4 + depth * 0.3, y: centerY + height * 0.3},
          {x: centerX - width * 0.2 + depth * 0.3, y: centerY - height * 0.2 - depth * 0.2},
          {x: centerX + width * 0.3 + depth * 0.3, y: centerY - height * 0.15 - depth * 0.2},
          {x: centerX + width * 0.4 + depth * 0.3, y: centerY + height * 0.2},
          {x: centerX + depth * 0.3, y: centerY + height * 0.3}
        ],
        shade: 0.5
      },
      // Middle layer
      {
        points: [
          {x: centerX - width * 0.35, y: centerY + height * 0.25},
          {x: centerX - width * 0.25, y: centerY - height * 0.15},
          {x: centerX + width * 0.1, y: centerY - height * 0.2},
          {x: centerX + width * 0.35, y: centerY},
          {x: centerX + width * 0.3, y: centerY + height * 0.25},
          {x: centerX - width * 0.1, y: centerY + height * 0.3}
        ],
        shade: 0.7
      },
      // Front highlight
      {
        points: [
          {x: centerX - width * 0.3, y: centerY + height * 0.2},
          {x: centerX - width * 0.2, y: centerY - height * 0.1},
          {x: centerX + width * 0.05, y: centerY - height * 0.15},
          {x: centerX + width * 0.25, y: centerY + height * 0.05},
          {x: centerX + width * 0.15, y: centerY + height * 0.2},
          {x: centerX - width * 0.15, y: centerY + height * 0.25}
        ],
        shade: 1
      }
    ];
    
    rockLayers.forEach(layer => {
      const layerBrightness = brightness * layer.shade;
      ctx.fillStyle = `rgb(${Math.floor(colorData.r * layerBrightness)}, ${Math.floor(colorData.g * layerBrightness)}, ${Math.floor(colorData.b * layerBrightness)})`;
      ctx.beginPath();
      ctx.moveTo(layer.points[0].x, layer.points[0].y);
      layer.points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();
    });
    
    // Texture spots
    if (width > 25) {
      // Dark spots
      ctx.fillStyle = `rgb(${Math.floor(colorData.r * brightness * 0.4)}, ${Math.floor(colorData.g * brightness * 0.4)}, ${Math.floor(colorData.b * brightness * 0.4)})`;
      for (let i = 0; i < 3; i++) {
        const spotX = centerX + (Math.random() - 0.5) * width * 0.4;
        const spotY = centerY + (Math.random() - 0.5) * height * 0.3;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 2 + Math.random() * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Light spots
      ctx.fillStyle = `rgb(${Math.floor(colorData.r * brightness * 1.2)}, ${Math.floor(colorData.g * brightness * 1.2)}, ${Math.floor(colorData.b * brightness * 1.2)})`;
      for (let i = 0; i < 2; i++) {
        const spotX = centerX + (Math.random() - 0.5) * width * 0.3;
        const spotY = centerY + (Math.random() - 0.5) * height * 0.2 - height * 0.1;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 1 + Math.random() * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  },
  
  drawHouse(x, y, width, height, depth, color, brightness) {
    const { ctx } = GameState;
    const colorData = applyBrightness(color, brightness);
    
    // Foundation
    ctx.fillStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(80 * brightness)}, ${Math.floor(80 * brightness)})`;
    ctx.fillRect(x - width * 0.05, y + height * 0.95, width * 1.1, height * 0.05);
    
    // Side wall
    const wallGradient = ctx.createLinearGradient(x + width, y, x + width + depth, y);
    wallGradient.addColorStop(0, `rgb(${Math.floor(colorData.r * 0.7)}, ${Math.floor(colorData.g * 0.7)}, ${Math.floor(colorData.b * 0.7)})`);
    wallGradient.addColorStop(1, `rgb(${Math.floor(colorData.r * 0.5)}, ${Math.floor(colorData.g * 0.5)}, ${Math.floor(colorData.b * 0.5)})`);
    ctx.fillStyle = wallGradient;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width + depth, y - depth * 0.7);
    ctx.lineTo(x + width + depth, y + height - depth * 0.7);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Side wall texture
    if (width > 30) {
      ctx.strokeStyle = `rgb(${Math.floor(colorData.r * 0.6)}, ${Math.floor(colorData.g * 0.6)}, ${Math.floor(colorData.b * 0.6)})`;
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + width, y + height * (i * 0.25));
        ctx.lineTo(x + width + depth, y + height * (i * 0.25) - depth * 0.7);
        ctx.stroke();
      }
    }
    
    // Roof side
    ctx.fillStyle = `rgb(${Math.floor(120 * brightness * 0.5)}, ${Math.floor(60 * brightness * 0.5)}, ${Math.floor(30 * brightness * 0.5)})`;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width / 2, y - height * 0.35);
    ctx.lineTo(x + width / 2 + depth, y - height * 0.35 - depth * 0.7);
    ctx.lineTo(x + width + depth, y - depth * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Chimney (if large enough)
    if (width > 40) {
      const chimneyWidth = width * 0.1;
      const chimneyHeight = height * 0.2;
      const chimneyX = x + width * 0.7;
      const chimneyY = y - height * 0.15;
      
      // Chimney side
      ctx.fillStyle = `rgb(${Math.floor(100 * brightness * 0.6)}, ${Math.floor(50 * brightness * 0.6)}, ${Math.floor(50 * brightness * 0.6)})`;
      ctx.fillRect(chimneyX + chimneyWidth, chimneyY - chimneyHeight - depth * 0.2, depth * 0.2, chimneyHeight);
      
      // Chimney front
      ctx.fillStyle = `rgb(${Math.floor(120 * brightness)}, ${Math.floor(60 * brightness)}, ${Math.floor(60 * brightness)})`;
      ctx.fillRect(chimneyX, chimneyY - chimneyHeight, chimneyWidth, chimneyHeight);
    }
    
    // Front wall
    ctx.fillStyle = colorData.rgb;
    ctx.fillRect(x, y, width, height);
    
    // Wall texture
    if (width > 25) {
      ctx.strokeStyle = `rgb(${Math.floor(colorData.r * 0.8)}, ${Math.floor(colorData.g * 0.8)}, ${Math.floor(colorData.b * 0.8)})`;
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + height * (i * 0.16));
        ctx.lineTo(x + width, y + height * (i * 0.16));
        ctx.stroke();
      }
    }
    
    // Front roof
    ctx.fillStyle = `rgb(${Math.floor(160 * brightness)}, ${Math.floor(82 * brightness)}, ${Math.floor(45 * brightness)})`;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.15, y);
    ctx.lineTo(x + width / 2, y - height * 0.35);
    ctx.lineTo(x + width * 1.15, y);
    ctx.closePath();
    ctx.fill();
    
    // Roof edge
    ctx.strokeStyle = `rgb(${Math.floor(100 * brightness)}, ${Math.floor(50 * brightness)}, ${Math.floor(25 * brightness)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.15, y);
    ctx.lineTo(x + width / 2, y - height * 0.35);
    ctx.lineTo(x + width * 1.15, y);
    ctx.stroke();
    
    // Windows
    if (width > 35) {
      const windowWidth = width * 0.18;
      const windowHeight = height * 0.2;
      
      // Left window
      this.drawWindow(x + width * 0.2, y + height * 0.3, windowWidth, windowHeight, brightness);
      
      // Right window
      this.drawWindow(x + width * 0.62, y + height * 0.3, windowWidth, windowHeight, brightness);
    }
    
    // Door
    if (width > 25) {
      const doorWidth = width * 0.22;
      const doorHeight = height * 0.55;
      const doorX = x + width / 2 - doorWidth / 2;
      const doorY = y + height - doorHeight;
      
      // Door frame
      ctx.fillStyle = `rgb(${Math.floor(60 * brightness)}, ${Math.floor(40 * brightness)}, ${Math.floor(20 * brightness)})`;
      ctx.fillRect(doorX - 4, doorY - 4, doorWidth + 8, doorHeight + 8);
      
      // Door
      ctx.fillStyle = `rgb(${Math.floor(101 * brightness)}, ${Math.floor(67 * brightness)}, ${Math.floor(33 * brightness)})`;
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
      
      // Door panels
      if (width > 40) {
        ctx.strokeStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(50 * brightness)}, ${Math.floor(25 * brightness)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(doorX + doorWidth * 0.15, doorY + doorHeight * 0.1, doorWidth * 0.7, doorHeight * 0.35);
        ctx.strokeRect(doorX + doorWidth * 0.15, doorY + doorHeight * 0.55, doorWidth * 0.7, doorHeight * 0.35);
      }
      
      // Door knob
      ctx.fillStyle = `rgb(${Math.floor(255 * brightness)}, ${Math.floor(215 * brightness)}, ${Math.floor(0 * brightness)})`;
      ctx.beginPath();
      ctx.arc(doorX + doorWidth * 0.8, doorY + doorHeight * 0.5, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Door step
      ctx.fillStyle = `rgb(${Math.floor(100 * brightness)}, ${Math.floor(100 * brightness)}, ${Math.floor(100 * brightness)})`;
      ctx.fillRect(doorX - doorWidth * 0.1, doorY + doorHeight, doorWidth * 1.2, 3);
    }
  },
  
  drawWindow(x, y, width, height, brightness) {
    const { ctx } = GameState;
    
    // Frame
    ctx.fillStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(60 * brightness)}, ${Math.floor(40 * brightness)})`;
    ctx.fillRect(x - 3, y - 3, width + 6, height + 6);
    
    // Glass
    ctx.fillStyle = `rgb(${Math.floor(135 * brightness)}, ${Math.floor(206 * brightness)}, ${Math.floor(235 * brightness)})`;
    ctx.fillRect(x, y, width, height);
    
    // Cross
    ctx.strokeStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(60 * brightness)}, ${Math.floor(40 * brightness)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
  }
};

// ===================================================================
// UI RENDERING
// ===================================================================

const UIRenderer = {
  drawCrosshair() {
    const { ctx, canvas } = GameState;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = CONFIG.ui.crosshairSize;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX, centerY + size);
    ctx.stroke();
  },
  
  drawCompass() {
    const { ctx, player } = GameState;
    const { compassX, compassY, compassRadius } = CONFIG.rendering;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(compassX, compassY, compassRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Needle
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(compassX, compassY);
    const needleLength = 25;
    const needleX = compassX + Math.cos(-player.angle - Math.PI / 2) * needleLength;
    const needleY = compassY + Math.sin(-player.angle - Math.PI / 2) * needleLength;
    ctx.lineTo(needleX, needleY);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = CONFIG.ui.labelFont;
    ctx.textAlign = 'center';
    ctx.fillText('N', compassX, compassY - compassRadius - 10);
    
    // Time indicator
    const dayNight = getDayNightState();
    const timeX = compassX;
    const timeY = compassY + compassRadius + 30;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(timeX - 40, timeY - 10, 80, 20);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = CONFIG.ui.instructionFont;
    if (dayNight.isDay) {
      const timeOfDay = dayNight.progress < 0.5 ? 'Morning' : 'Afternoon';
      ctx.fillText(timeOfDay, timeX, timeY + 5);
    } else {
      ctx.fillText('Night', timeX, timeY + 5);
    }
  },
  
  drawObjectSelector() {
    const { ctx, canvas, buildableTypes, selectedObjectType } = GameState;
    const { selectorHeight, selectorItemSize, selectorSpacing, selectorPadding } = CONFIG.ui;
    
    const selectorY = canvas.height - selectorHeight - 20;
    const totalWidth = buildableTypes.length * selectorItemSize + (buildableTypes.length - 1) * selectorSpacing;
    const startX = (canvas.width - totalWidth) / 2;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(startX - selectorPadding, selectorY - selectorPadding, 
                 totalWidth + selectorPadding * 2, selectorHeight + selectorPadding * 2);
    
    // Draw items
    buildableTypes.forEach((type, index) => {
      const x = startX + index * (selectorItemSize + selectorSpacing);
      const y = selectorY;
      
      // Background
      ctx.fillStyle = index === selectedObjectType ? '#444444' : '#222222';
      ctx.fillRect(x, y, selectorItemSize, selectorItemSize);
      
      // Selection border
      if (index === selectedObjectType) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 2, y - 2, selectorItemSize + 4, selectorItemSize + 4);
      }
      
      // Draw icon
      ctx.save();
      ctx.translate(x + selectorItemSize / 2, y + selectorItemSize / 2);
      this.drawObjectIcon(type);
      ctx.restore();
      
      // Key hint
      ctx.fillStyle = '#FFFFFF';
      ctx.font = CONFIG.ui.labelFont;
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), x + selectorItemSize / 2, y + selectorItemSize + 15);
    });
    
    // Instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = CONFIG.ui.instructionFont;
    ctx.textAlign = 'center';
    ctx.fillText('Press 1-3 to select, B to build, SPACE to remove', canvas.width / 2, selectorY - 30);
  },
  
  drawObjectIcon(type) {
    const { ctx } = GameState;
    
    switch(type) {
      case 'tree':
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-3, 5, 6, 15);
        // Trunk texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-1, 8);
        ctx.lineTo(-1, 18);
        ctx.moveTo(1, 8);
        ctx.lineTo(1, 18);
        ctx.stroke();
        // Foliage
        const foliageColors = ['#228B22', '#2E8B57', '#006400'];
        const clusters = [
          {x: 0, y: -5, r: 12},
          {x: -8, y: 0, r: 8},
          {x: 8, y: 0, r: 8},
          {x: 0, y: 5, r: 10}
        ];
        clusters.forEach((cluster, i) => {
          ctx.fillStyle = foliageColors[i % foliageColors.length];
          ctx.beginPath();
          ctx.arc(cluster.x, cluster.y, cluster.r, 0, 2 * Math.PI);
          ctx.fill();
        });
        break;
        
      case 'rock':
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-8, -5);
        ctx.lineTo(0, -8);
        ctx.lineTo(10, -3);
        ctx.lineTo(12, 8);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.fill();
        // Shading
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-5, -3);
        ctx.lineTo(5, 0);
        ctx.lineTo(8, 5);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'house':
        // Foundation
        ctx.fillStyle = '#666666';
        ctx.fillRect(-16, 13, 32, 2);
        // Walls
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(-15, -5, 30, 18);
        // Wall texture
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-15, -5 + i * 6);
          ctx.lineTo(15, -5 + i * 6);
          ctx.stroke();
        }
        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(-18, -5);
        ctx.lineTo(0, -15);
        ctx.lineTo(18, -5);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(-10, 0, 6, 6);
        ctx.fillRect(4, 0, 6, 6);
        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(-3, 3, 6, 10);
        break;
    }
  }
};

// ===================================================================
// GAME LOOP
// ===================================================================

function gameLoop() {
  updatePlayer();
  
  Renderer.drawBackground();
  Renderer.drawWorldObjects();
  
  UIRenderer.drawCrosshair();
  UIRenderer.drawCompass();
  UIRenderer.drawObjectSelector();
  
  requestAnimationFrame(gameLoop);
}

// ===================================================================
// INITIALIZE ON LOAD
// ===================================================================

window.addEventListener('load', initializeGame);