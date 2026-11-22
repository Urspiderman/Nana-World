# Nana World — Claw Machine 3D Asset Pack

Nine genuine 3D GLB files, individually exported, with Y-up coordinates and vertex-colored geometry.

## Installation
Copy models/*.glb to public/models/claw-machine/ in your Next.js project.

## Contents
- 7 stylized toy models: teddy_bear, bunny, kitty, strawberry, heart_pillow, pink_ribbon, flower
- mechanical_claw.glb: static three-arm claw with separate named geometries (not a rigged skeleton)
- claw_machine_cabinet.glb: cabinet with an OPEN front/window (no glass pane), leaving space for interactive toy models
- previews/*.png: simple transparent icon placeholders, NOT rendered previews of the models

## IMPORTANT quality disclosure
These are newly constructed procedural stylized 3D assets. They are NOT photorealistic or textured PBR assets. There are no UV texture maps, hair particles, physically simulated fabric, animations, or real-time physics. Metallic appearances are represented by vertex colors; materials may need manual adjustment in Blender/Three.js. They are more detailed than primitive boxes but do not match the reference promotional concept's furry realism.

## Usage
In React Three Fiber use useGLTF('/models/claw-machine/teddy_bear.glb').
For the cabinet, consider replacing your existing procedurally rendered ArcadeCabinet rather than rendering both simultaneously. The cabinet is a separate model from the claw and prizes.

## Performance
For a pile of 30+ toys, load each GLB once and clone or instance the geometry. Keep visible mesh count and draw calls in mind.
