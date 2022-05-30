/* eslint-disable */
import * as THREE from 'https://cdn.skypack.dev/three@0.132.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/ShaderPass.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js';
import { story } from './js/story.js';
import { introStory } from './intro/introStory.js';
import { TiltShiftShader } from './shaders/TiltShiftShader.js';
import { VignetteShader } from './shaders/VignetteShader.js';
import { transitionParticles } from './js/transitionParticles.js';
import Event from './libs/Events.js';

///////////////////////////// BROWSER CHECK

let isSafari = false;
let isMobile = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isMobile = true;
} else {
  isMobile = false;
}

let camera, scene, renderer, stats, composer, effectPass, vignettePass;

let currentStory;
let intro;
let storyList = [];

let transParticles;

let darkMode = false;
let editMode = false;
let editFrame = 0;
let rightButtonDown = false;
let leftButtonDown = false;

let mouse = new THREE.Vector3(0, 0, 0.5);
let camTargetRotX = 0;
let camTargetRotY = 0;

let msgDiv = document.getElementById('msg');
let editDiv = document.getElementById('edit');
let frameDiv = document.getElementById('frame');
// let loader = document.getElementById('loader');

const events = new Event();
let canvas;

let camPosition = new THREE.Vector3(0, 0, 60);
let vignetteColor = new THREE.Color(0xcad3da);

const params = {
  editMode: function () {
    editMode = !editMode;
    if (editMode) {
      editDiv.style.visibility = 'visible';
      frameDiv.style.visibility = 'visible';
      frameDiv.innerHTML = 'start frame';
      editFrame = 0;
      currentStory.animationProgress = 0;
      currentStory.currentStage.update(editFrame);
    } else {
      editDiv.style.visibility = 'hidden';
      frameDiv.style.visibility = 'hidden';
      currentStory.animationProgress = 0;
      currentStory.currentStage.update(currentStory.animationProgress);
    }
  },
  camRot: 0.1,
  backgroundColor: 0xdfe9f2,
  darkBackground: 0x000000,
  bluramount: 0.6,
  center: 1.0,
  vignetteOffset: 1.3,
  vignetteDarkness: 0.85,
  changeBG: function () {
    changeBG();
  },
  animate: function () {
    currentStory.startAnim();
  },
};

function changeBG() {
  darkMode = !darkMode;
  if (darkMode) {
    for (let i = 0; i < currentStory.currentStage.sceneObjects.length; i++) {
      currentStory.currentStage.sceneObjects[i].changeRimColor(new THREE.Color(params.darkBackground));
    }
    renderer.setClearColor(params.darkBackground);
  } else {
    for (let i = 0; i < currentStory.currentStage.sceneObjects.length; i++) {
      currentStory.currentStage.sceneObjects[i].changeRimColor(new THREE.Color(0xffffff));
    }
    renderer.setClearColor(new THREE.Color());
  }
}

/////////////////////// RAYCASTER

let raycaster = new THREE.Raycaster();

init();
animate();

function init() {
  scene = new THREE.Scene();

  //---------------- Camera --------------------------

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 3000);
  let c = new THREE.Vector3();
  camera.position.copy(camPosition);

  //---------------- Render --------------------------

  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas, antyalias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setClearColor(new THREE.Color());
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //----------------  postprocessing --------------------------

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  effectPass = new ShaderPass(TiltShiftShader);
  effectPass.uniforms['bluramount'].value = params.bluramount;
  effectPass.uniforms['center'].value = params.center;

  vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms['color'].value = [vignetteColor.r, vignetteColor.g, vignetteColor.b];

  composer.addPass(effectPass);
  composer.addPass(vignettePass);

  //---------------------- Listeners -----------------

  // events.bind(canvas, 'canvas:loading', function (event) {
  //   loader.innerText = event.detail.percent + '%';
  // });

  // events.bind(canvas, 'canvas:loaded', function (event) {
  //   loader.style.visibility = 'hidden';
  //   console.log(event.type);
  // });

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('wheel', onDocumentWheel, false);
  document.addEventListener('click', onDocumentClick, false);
  document.addEventListener('keydown', onDocumentKeyDown);
  document.addEventListener('mousedown', onDocumentMouseDown);
  document.addEventListener('mouseup', onDocumentMouseUp);

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  //---------------- GUI --------------------------

  stats = new Stats();
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, 'editMode');
  const tiltFolder = gui.addFolder('TiltShift');
  tiltFolder.add(params, 'bluramount', 0, 5.0, 0.01).onChange(() => {
    effectPass.uniforms['bluramount'].value = params.bluramount;
  });
  tiltFolder.add(params, 'center', 0.1, 2, 0.01).onChange(() => {
    effectPass.uniforms['center'].value = params.center;
  });
  tiltFolder.close();
  const vignFolder = gui.addFolder('Vignette');
  vignFolder.add(params, 'vignetteOffset', 0, 2.0, 0.01).onChange(() => {
    vignettePass.uniforms['offset'].value = params.vignetteOffset;
  });
  vignFolder.add(params, 'vignetteDarkness', 0, 1, 0.01).onChange(() => {
    vignettePass.uniforms['darkness'].value = params.vignetteDarkness;
  });
  vignFolder.close();

  gui.add(params, 'changeBG');
  gui.close();

  ///////////////////// Build scene, add objects

  transParticles = new transitionParticles(scene);
  transParticles.hide();

  intro = new introStory(scene, canvas);
  currentStory = intro;
  storyList.push(currentStory);
  const covidStory = new story(scene, canvas);
  storyList.push(covidStory);

  effectPass.uniforms['bluramount'].value = currentStory.currentStage.blurAmount;
  params.bluramount = currentStory.currentStage.blurAmount;
  effectPass.uniforms['center'].value = currentStory.currentStage.blurCenter;
  vignettePass.uniforms['offset'].value = params.vignetteOffset;
  vignettePass.uniforms['darkness'].value = params.vignetteDarkness;

  // console.log(renderer.info);
}

//---------------- Animate --------------------------

function animate(time) {
  if (currentStory.transition) transParticles.fly();
  else transParticles.stop();

  if (currentStory.transition) effectPass.uniforms['bluramount'].value = 2.0;
  else effectPass.uniforms['bluramount'].value = currentStory.currentStage.blurAmount;

  if (!editMode) {
    camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
    camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;
  }

  if (!editMode) currentStory.update();
  if (intro.storyCopleted && !storyList[1].loading) {
    currentStory = storyList[1];
    currentStory.init();
  }
  if (intro.storyCopleted && storyList[1].loaded) intro.currentStage.hide();

  if (editMode) displaySceneCoords();
  else msgDiv.innerHTML = '';

  requestAnimationFrame(animate);
  render();

  stats.update();
  TWEEN.update(time);

  composer.render();
}

//---------------- Render --------------------------

function render() {
  renderer.render(scene, camera);
}

// ----------------------------------------------------------------

function displaySceneCoords() {
  let position =
    '( ' +
    currentStory.currentStage.stageContainer.position.x.toFixed(2) +
    ', ' +
    currentStory.currentStage.stageContainer.position.y.toFixed(2) +
    ', ' +
    currentStory.currentStage.stageContainer.position.z.toFixed(2) +
    ')';

  let rotation =
    '( ' +
    currentStory.currentStage.stageContainer.rotation.x.toFixed(2) +
    ', ' +
    currentStory.currentStage.stageContainer.rotation.y.toFixed(2) +
    ', ' +
    currentStory.currentStage.stageContainer.rotation.z.toFixed(2) +
    ')';
  msgDiv.innerHTML = 'Position: ' + position + ' | Rotation: ' + rotation;
}
// ----------------------------------------------------------------

function saveFrame(frm) {
  if (editMode && editFrame == 0) {
    currentStory.currentStage.startPosition.copy(currentStory.currentStage.stageContainer.position);
    currentStory.currentStage.startRotation.copy(currentStory.currentStage.stageContainer.rotation);
    alert('start frame saved!');
  }

  if (editMode && editFrame == 1) {
    currentStory.currentStage.targetPosition.copy(currentStory.currentStage.stageContainer.position);
    currentStory.currentStage.targetRotation.copy(currentStory.currentStage.stageContainer.rotation);
    alert('end frame saved!');
  }
}

// ----------------------Event handlers----------------------------

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  camTargetRotX = mouse.y * params.camRot;
  camTargetRotY = -mouse.x * params.camRot;

  if (editMode && rightButtonDown) {
    currentStory.currentStage.stageContainer.position.x += event.movementX / 100;
    currentStory.currentStage.stageContainer.position.y -= event.movementY / 100;
  }

  if (editMode && leftButtonDown) {
    currentStory.currentStage.stageContainer.rotation.x += event.movementY / 100;
    currentStory.currentStage.stageContainer.rotation.y += event.movementX / 100;
  }

  // mouse.unproject(camera);
  // raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
  // const intersects = raycaster.intersectObjects(storyStd.stageCointainer.children);

  // if (intersects.length > 0) {
  //   if (intersects[0].object.visible) document.body.style.cursor = "pointer";
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     if (storyStd.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStd.sceneObjects[i].scale = 0.7;
  //     }
  //   }
  // } else {
  //   document.body.style.cursor = "default";
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     storyStd.sceneObjects[i].scale = 0.5;
  //   }
  // }
}

function onDocumentClick(event) {
  // console.log("click!");
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // mouse.unproject(camera);
  // raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
  // const intersects = raycaster.intersectObjects(storyStd.stageCointainer.children);
  // if (intersects.length > 0) {
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     if (storyStd.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStd.sceneObjects[i].changeColor(colorPallete[Math.floor(Math.random() * (colorPallete.length - 1))]);
  //     }
  //   }
  //   //console.log(intersects[0].object.uuid);
  //   // intersects[0].object.visible = false;
  // }
}

function onDocumentWheel(event) {
  currentStory.currentStage.stageContainer.position.z += event.deltaY / 100;
}

function onDocumentMouseDown(event) {
  if (event.button == 2) rightButtonDown = true;
  if (event.button == 0) leftButtonDown = true;
  event.preventDefault();
}

function onDocumentMouseUp(event) {
  if (event.button == 2) rightButtonDown = false;
  if (event.button == 0) leftButtonDown = false;
  event.preventDefault();
}

function onWindowResize() {
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentKeyDown(e) {
  switch (e.key) {
    case ' ':
      if (!editMode) currentStory.startAnim();
      break;

    case 'ArrowUp':
      frameDiv.innerHTML = 'end frame';
      editFrame = 1;
      if (editMode) currentStory.currentStage.update(editFrame);
      break;

    case 'ArrowDown':
      frameDiv.innerHTML = 'start frame';
      editFrame = 0;
      if (editMode) currentStory.currentStage.update(editFrame);
      break;

    case 'Enter':
      saveFrame(editFrame);
      break;
  }
}

// ----------------------------------------------
