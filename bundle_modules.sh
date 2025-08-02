#!/bin/bash

# Bundle all modules into a single bundle.js file
# This maintains the game as a static HTML file that can be opened directly

echo "Bundling modules into bundle.js..."

# Start with an IIFE to avoid global scope pollution
echo "(function() {" > bundle.js
echo "'use strict';" >> bundle.js
echo "" >> bundle.js

# Order matters - dependencies first
modules=(
    "config.js"
    "gameState.js"
    "utils.js"
    "camera.js"
    "worldObjects.js"
    "worldAnimals.js"
    "interiorObjects.js"
    "interiorAnimals.js"
    "world.js"
    "interior.js"
    "building.js"
    "player.js"
    "dayNight.js"
    "ui.js"
    "saveLoad.js"
    "input.js"
    "animals.js"
    "main.js"
)

# Process each module
for module in "${modules[@]}"; do
    echo "// ===== Module: $module =====" >> bundle.js
    
    # Process the module file:
    # 1. Remove all import statements (including multiline imports)
    # 2. Remove export keywords
    # 3. Handle export default statements
    # 4. Remove export { ... } statements
    awk '
    BEGIN { in_import = 0 }
    
    # Skip import statements
    /^import / {
        if (/;$/) {
            next
        } else {
            in_import = 1
            next
        }
    }
    
    # Handle multiline imports
    in_import {
        if (/;$/) {
            in_import = 0
        }
        next
    }
    
    # Skip export statements that re-export from other modules
    /^export .* from / { next }
    
    # Transform export default to const _default
    /^export default / {
        sub(/^export default /, "const _default = ")
        print
        next
    }
    
    # Remove export keyword from declarations
    /^export / {
        sub(/^export /, "")
        print
        next
    }
    
    # Remove inline export { ... } statements
    /export \{[^}]*\};/ {
        sub(/export \{[^}]*\};/, "")
        if ($0 != "") print
        next
    }
    
    # Print all other lines
    { print }
    ' "modules/$module" >> bundle.js
    
    echo "" >> bundle.js
    echo "" >> bundle.js
done

# Close the IIFE
echo "})();" >> bundle.js

echo "Bundle created successfully!"
echo "You can now open index.html directly in a browser to play the game."