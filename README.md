# InnerSpace02 - Project structure description

Project currently in WIP stage. Whole object structure mostly ready. Only one story line (covid story) with two scenes.

Currently in development - edit mode for scenes art direction. It will allow to control camera movement (for beter visuals) and will exposse parameters on UI.

Next steps:

- build rest of the stories
- website integration
- will see ;)

# Foders

## Root folder:

**index.html** - starting file + simple UI divs

**main.css** - basic styles

**main.js** - main application script. Things it does:

- THREE.js components import,
- scene setup (canvas, renderer, camera etc.).
- document events listeners and callback function.
- creates stage objects for current story scenes.
- scene navigation (transitiopn effect and scene switching).

## ./js folder:

Aplication classes for project's objects:

- **particleObject.js** - class for every 3D objects in project.

  - Metods for loading .gltf files.
  - Visual parameters: particle count, particle size, color, wobble etc.
  - Scene coordinates: position in scene, rotation, scale.
  - Show / hide methods.
  - Animation of object (movement in scene).

- **ambientParticles.js** - particles shown in scene. Simple space effect for more immersive look.
- **transitionParticles** - similar to ambientParticles but only for transition effect between scenes.

## ./libs:

Extra utility libraries

- TWEEN.js - animation tweens.

## ./img

Images and sprites for projects. Currently only pointSprite.png used for ambient and transition particles. I future we'll need ./img subfoldes in each story folder.

## ./shaders

GLSL shaders for particle rendering and for postprocessing effects (tiltshift and vignette).

## ./covidStory

Folder for covid story line. There will be other folders for rest of stories. Consist of:

- **./data** - JSON files with stage parameters
  - Space coordinates of main scene,
  - Space coordinates for all scene objects
  - Animation parameters for scene and all objects
  - Visuals parameters (size, colors, etc.),
  - Object hierarchy
- **./gltf01, 02 , 03 etc.** - folders with ./gltf files divided by scene
- **storyStage.js** - Object class for scene object:
  - loads and parsess JSON files
  - creates 3D objects - loads .gltf files, samples its surrface, scattering particles
  - animates scene and updates 3D objects

# Object's hierarchy / Project structure

**Objects relations (parent <- children):**

THREE.js scene (main.js) <- storyStage object <- particleObjects / ambientParticles / transitionParticles.

**Update, control and animation methods (parent -> children):**

THREE.js scene (main.js) -> storyStage object -> particleObjects / ambientParticles / transitionParticles.

# Application control

**Spacebar** - play animation. Only two scenes looped

**control menu (upper right corner)** - postprodution effects and edit mode on/off
