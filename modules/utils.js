/**
 * Utility functions for the game
 */

/**
 * Properly dispose of Three.js objects to prevent memory leaks
 * @param {THREE.Object3D} object - The object to dispose
 */
export function disposeObject(object) {
  if (!object) return;
  
  object.traverse(child => {
    if (child.isMesh) {
      // Dispose geometry
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      // Dispose material(s)
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => {
          // Dispose textures
          for (const prop in material) {
            if (material[prop] && material[prop].isTexture) {
              material[prop].dispose();
            }
          }
          material.dispose();
        });
      }
    }
  });
  
  // Remove from parent
  if (object.parent) {
    object.parent.remove(object);
  }
}

/**
 * Find the parent object with type data
 * @param {THREE.Object3D} mesh - The mesh to search from
 * @returns {THREE.Object3D|null} The parent object with type data
 */
export function findParentObject(mesh) {
  let current = mesh;
  while (current && !current.userData.type) {
    current = current.parent;
  }
  return current;
}