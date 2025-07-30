# 🎮 JSCraft First-Person Exploration Template for Kids

Welcome to your first JavaScript first-person exploration game! This template gives you everything you need to start building awesome 3D adventure games where you see the world through your character's eyes as you explore.

## 🚀 Getting Started

### Option 1: Using Replit
1. Go to [Replit.com](https://replit.com)
2. Create a new HTML/CSS/JS project
3. Upload all three files: `index.html`, `script.js`, and `style.css`
4. Click the "Run" button to see your game!

### Option 2: Using Your Computer
1. Download or copy all three files:
   - `index.html` - The main HTML file
   - `script.js` - The game logic
   - `style.css` - The styling
2. Save them in the same folder
3. Double-click `index.html` to open it in your web browser

## 🎮 How to Play

### Movement Controls
- **Click the game** to activate mouse look controls
- **Move mouse**: Look around (left/right and up/down)
- **WASD keys** or **arrow keys** to move around the 3D world
- **W/Up Arrow**: Walk forward in the direction you're facing
- **A/Left Arrow**: Strafe left (sidestep left)
- **S/Down Arrow**: Walk backward
- **D/Right Arrow**: Strafe right (sidestep right)
- **Q**: Turn your view left (when not using mouse)
- **E**: Turn your view right (when not using mouse)
- **ESC**: Release mouse control

### Building Controls
- **SPACE**: Jump when moving, or remove the object you're looking at (yellow highlight)
- **B**: Build a new object in front of you
- **0**: Select fists (remove mode)
- **1-3**: Select object type to build (tree, rock, house)
- **4-6**: Select animal type to spawn (cow, pig, horse)

### UI Elements
- **White crosshair** in the center shows where you're looking
- **Compass** in the top-left shows your direction and time of day
- **Object selector** at the bottom shows buildable objects and animals
- **Day/Night cycle**: Watch the sun and moon move across the sky!

### Animals
The game now features three types of animals that wander around the world:
- **🐄 Cows**: Brown with white spots, simplified box-based design with horns and udders - move slowly with a gentle sway
- **🐷 Pigs**: Pink with distinctive snouts, clean box-based body design - move at medium speed with a waddle
- **🐴 Horses**: Dark brown with black manes, elegant design with two-part legs - move quickly with grace

Animals feature clean, recognizable shapes with simple geometry (boxes, cylinders, spheres), properly positioned features, and natural movement animations including walking, idle breathing, and occasional head turns. You can spawn new animals or remove existing ones just like other objects!

## 🧠 What You're Learning

This template teaches you important programming concepts:

- **Three.js Fundamentals**: Working with a professional 3D graphics library
- **3D Scene Graph**: Understanding how objects are organized in 3D space
- **WebGL Rendering**: Hardware-accelerated graphics in the browser
- **First-Person Camera**: PerspectiveCamera with yaw/pitch controls
- **Vector Math**: Using THREE.Vector3 for positions and movement
- **Raycasting**: Detecting what objects the player is looking at
- **Event Listeners**: Keyboard and mouse input handling
- **Game Loop**: Using requestAnimationFrame for smooth 60 FPS
- **Pointer Lock API**: Capturing mouse for immersive controls
- **Object Building System**: Dynamic object creation and removal
- **Lighting Systems**: DirectionalLight for sun/moon, AmbientLight for atmosphere
- **Memory Management**: Proper disposal of 3D objects to prevent leaks

## 🎨 Understanding the Code

### Project Structure
The game consists of three main files:
- **index.html**: The webpage structure with semantic HTML5
- **script.js**: All game logic using Three.js (1900+ lines)
- **style.css**: Responsive styling with mobile support

### Three.js Architecture
This game uses Three.js, a powerful 3D graphics library that makes creating 3D worlds much easier:
- **Scene**: The 3D world containing all objects
- **Camera**: Your viewpoint in the world (PerspectiveCamera for realistic depth)
- **Renderer**: Draws the 3D scene onto the HTML canvas
- **Raycaster**: Detects which objects you're looking at for interaction

### The Player System
```javascript
// Player physics state
const player = {
    velocity: new THREE.Vector3(),  // Movement speed in 3D space
    canJump: true,                  // Whether player can jump
    height: 1.7                     // Eye height in meters
};

// Camera controller for first-person view
const cameraController = {
    yaw: 0,      // Horizontal rotation (left/right looking)
    pitch: 0     // Vertical rotation (up/down looking)
};
```

### World Objects
Objects are created using Three.js geometries and materials:
```javascript
// Example: Creating a tree with Three.js
const tree = new THREE.Group();  // Container for multiple parts
// Trunk: CylinderGeometry with brown material
// Foliage: Multiple ConeGeometry layers with green material
tree.userData = { type: 'tree', removable: true };
```

Objects feature:
- **Multi-layered rendering** for depth and realism
- **Dynamic shading** based on distance and time of day
- **Detailed textures** like bark, foliage clusters, rock facets, and house features

### 3D Graphics with Three.js
Three.js handles the complex 3D math for us:
- **Perspective Projection**: Automatic realistic depth rendering
- **Shadow Mapping**: Dynamic shadows that follow the sun/moon
- **Fog Effects**: Distance-based visibility for performance
- **Lighting System**: DirectionalLight for sun/moon, AmbientLight for base illumination
- **Materials**: PBR (Physically Based Rendering) with MeshStandardMaterial

### The Game Loop
The game runs at 60 FPS using requestAnimationFrame:
```javascript
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();  // Time since last frame
    
    updatePlayer(delta);             // Handle movement and physics
    updateDayNightCycle();           // Move sun/moon, change lighting
    updateAnimals(delta);            // Update animal movement and animations
    updateObjectHighlight();         // Check what player is looking at
    
    renderer.render(scene, camera);  // Draw everything
}
```

### Key Features
- **Mouse Look**: Click to capture mouse for smooth camera control
- **Building System**: Place and remove objects in the world
- **Day/Night Cycle**: 2-minute days and 1-minute nights with moving sun/moon
- **Dynamic Lighting**: Objects and sky change based on celestial positions
- **Object Targeting**: Yellow highlight shows which object you can interact with
- **Realistic Objects**: Trees with multiple foliage layers, procedurally deformed rocks, detailed houses with windows and doors
- **Living Animals**: Cows, pigs, and horses that wander around with simple animations

## 🎯 Fun Challenges to Try

### Beginner Challenges
1. **Change Colors**: Try changing the sky gradients, ground colors, or object colors
2. **Speed Control**: Make your walking or turning faster or slower
3. **Add Objects**: Create more trees, rocks, or houses in different locations
4. **Object Types**: Design new object types with different shapes and details
5. **Animal Colors**: Change cow spots to black, make pigs purple, or create golden horses
6. **Animal Speeds**: Make cows run fast and horses move slowly for a silly effect
7. **More Animals**: Add a whole farm of animals at different positions

### Intermediate Challenges
1. **Collision Detection**: Make it so you can't walk through trees and houses
2. **Enhanced Lighting**: Extend the day/night system with dawn/dusk transitions
3. **Sound Effects**: Add footstep sounds when moving or ambient nature sounds
4. **Weather Effects**: Add rain, snow, or fog that affects visibility
5. **Animated Objects**: Make trees sway or add moving clouds
6. **Build Limits**: Add resource management for building objects
7. **Save/Load**: Save your world creations to local storage
8. **Animal Sounds**: Add moo, oink, and neigh sounds when near animals
9. **Animal Reactions**: Make animals run away when you get too close
10. **Feeding System**: Let players feed animals to make them follow you
11. **Baby Animals**: Create smaller versions that follow their parents

### Advanced Challenges
1. **Larger World**: Create a bigger world with more diverse environments
2. **Quest System**: Add objectives like "find all the houses" or "collect hidden items"
3. **Inventory System**: Let players collect and use items they find
4. **NPCs**: Add other characters that move around or can be talked to
5. **Minimap**: Add a small map showing your position and nearby objects
6. **Procedural Generation**: Create random worlds each time you play
7. **Animal AI**: Implement flocking behavior so animals move in groups
8. **Farming System**: Plant crops that animals can eat, affecting their behavior

## 🔧 Customization Ideas

### Easy Changes - Modify the CONFIG Object
All game settings are in the CONFIG object at the top of `script.js`:
```javascript
const CONFIG = {
    player: {
        speed: 10,          // Make walking faster/slower
        lookSpeed: 0.002,   // Mouse sensitivity
        jumpSpeed: 10       // Jump height
    },
    world: {
        size: 1000,         // Playable area size
        fogFar: 500         // View distance
    },
    objects: {
        tree: {
            leavesColor: 0x228B22,  // Change tree color (hex format)
            minHeight: 4,           // Tree size variation
            maxHeight: 8
        },
        cow: {
            bodyColor: 0x8B4513,    // Brown
            moveSpeed: 2,           // How fast they walk
            wanderRadius: 15        // How far they roam
        }
        // Similar configs for pig and horse...
    }
}
```

### Adding More Objects
Find the `createInitialObjects()` function in script.js and add more objects:
```javascript
// Add a new tree at position (x: 50, z: 50)
createTree(50, 50);

// Add multiple rocks in a pattern
for (let i = 0; i < 5; i++) {
    createRock(i * 10, 20);
}

// Create a house
createHouse(100, 100);

// Create animals
createCow(30, 30);
createPig(-20, 40);
createHorse(60, -50);
```

Objects and animals are automatically added to the world with:
- Shadows enabled
- Collision detection ready (for future implementation)
- Removable by looking at them and pressing SPACE
- Animals have autonomous movement and animations

### Color Codes for Three.js
Three.js uses hexadecimal color format (0x instead of #):
- `0xFF0000` - Red
- `0x00FF00` - Green  
- `0x0000FF` - Blue
- `0xFFFF00` - Yellow
- `0xFF00FF` - Magenta
- `0x00FFFF` - Cyan
- `0xFFA500` - Orange
- `0x800080` - Purple

## 🐛 Common Problems and Solutions

### My player doesn't move!
- Check that you copied all the JavaScript code
- Make sure to click on the game canvas to activate it
- The browser console (F12) will show any JavaScript errors

### The movement feels too fast/slow!
- Adjust `CONFIG.player.speed` (default is 10, try 5-20)
- Change `CONFIG.player.lookSpeed` for mouse sensitivity (default 0.002)

### I can't see any objects!
- Objects might be behind you - try turning around
- Check if fog is hiding distant objects - increase `CONFIG.world.fogFar`
- Make sure Three.js loaded properly (check console for errors)

### The game is running slowly!
- Reduce shadow quality: `CONFIG.renderer.shadowMapSize = 1024`
- Decrease the number of objects in the world
- Close other browser tabs to free up memory

### Objects look dark or black!
- Make sure lighting is set up properly in `createLighting()`
- Check that materials have proper color values (0x format)
- Verify shadows are enabled on both lights and objects

### The game doesn't start!
- Check the browser's developer console for errors (F12 key)
- Make sure Three.js CDN link in index.html is working
- Verify you're using a modern browser with WebGL support

## 📚 Learning Resources

### Next Steps
- Learn about collision detection (preventing walking through objects)
- Explore texture mapping to add realistic surfaces to objects
- Study lighting and shadow effects for more immersive environments
- Research audio integration for sound effects and music
- Learn about 3D math and vector calculations for advanced effects

### Helpful Websites
- [Three.js Documentation](https://threejs.org/docs/) - Official Three.js docs
- [Three.js Examples](https://threejs.org/examples/) - Interactive demos
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) - WebGL tutorials
- [W3Schools JavaScript](https://www.w3schools.com/js/) - JavaScript basics
- [Khan Academy](https://www.khanacademy.org/computing/computer-programming) - Programming courses

## 🎉 You Did It!

Congratulations! You now have a working first-person 3D exploration game built with Three.js. You can:
- Walk around a 3D world with realistic physics
- Look around smoothly with mouse controls
- Build and remove objects dynamically
- Spawn animals that move around autonomously
- Experience day/night cycles with moving sun and moon
- See realistic shadows and lighting effects

This is professional-level game development using the same tools that power many web games! 

### What Makes This Special
- You're using **Three.js**, the same library used by major companies
- The code is organized and scalable for adding new features
- Everything is configurable through the CONFIG object
- Proper memory management prevents crashes
- Responsive design works on different screen sizes

Remember: Every expert was once a beginner. You're already on your way to becoming a great programmer! 🌟

---

**Happy Coding!** 👨‍💻👩‍💻