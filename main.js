import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/postprocessing/ShaderPass.js";
import { GUI } from "https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js";
import { storyStage } from "./covidStory/storyStage.js";
import { TiltShiftShader } from "./shaders/TiltShiftShader.js";
import { VignetteShader } from "./shaders/VignetteShader.js";
import { transitionParticles } from "./js/transitionParticles.js";

///////////////////////////// BROWSER CHECK

let isSafari = false;
let isMobile = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isMobile = true;
} else {
  isMobile = false;
}

let camera, scene, renderer, stats, controls, composer, effectPass, vignettePass;
let currentStage;
let nextStage;
let animationProgress = 0;
let transParticles;

let plusZ = 0;
let darkMode = false;
let freeCam = false;
let transition = false;

let mouse = new THREE.Vector3(0, 0, 0.5);
let camTargetRotX = 0;
let camTargetRotY = 0;

let msgDiv = document.getElementById("msg");

let camPosition = new THREE.Vector3(0, 0, 60);
let vignetteColor = new THREE.Color(0xcad3da);

const tween = eval("TWEEN.Easing.Quadratic.InOut");

const params = {
  camControl: function () {
    freeCam = !freeCam;
    controls.enabled = freeCam;
    if (!freeCam) camera.position.copy(camPosition);
  },
  camRot: 0.1,
  sizeMult: 0.44,
  countMult: 65,
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
    startAnim();
  },
  animTween: 0,
  transTween: 0,
};

function startAnim(e) {
  if (e.key == " ") {
    if (!currentStage.complete) animateTween.to({ animTween: 1 }, 3000).start();
    else sceneTransition();
  }
}

function changeBG() {
  darkMode = !darkMode;
  if (darkMode) {
    for (let i = 0; i < currentStage.sceneObjects.length; i++) {
      currentStage.sceneObjects[i].changeRimColor(new THREE.Color(params.darkBackground));
    }
    renderer.setClearColor(params.darkBackground);
  } else {
    for (let i = 0; i < currentStage.sceneObjects.length; i++) {
      currentStage.sceneObjects[i].changeRimColor(new THREE.Color(0xffffff));
    }
    renderer.setClearColor(new THREE.Color());
  }
}

let animateTween = new TWEEN.Tween(params)
  .to({ animTween: 1 })
  .easing(tween)
  .onComplete(() => {
    // freeCam = true;
    currentStage.complete = true;
  })
  .onUpdate(() => {
    animationProgress = params.animTween;
  });

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

  renderer = new THREE.WebGLRenderer({ antyalias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setClearColor(new THREE.Color());
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //----------------  postprocessing --------------------------

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  effectPass = new ShaderPass(TiltShiftShader);
  effectPass.uniforms["bluramount"].value = params.bluramount;
  effectPass.uniforms["center"].value = params.center;

  vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms["color"].value = [vignetteColor.r, vignetteColor.g, vignetteColor.b];

  composer.addPass(effectPass);
  composer.addPass(vignettePass);

  //---------------- Controls --------------------------

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = freeCam;
  // controls.target = new THREE.Vector3(0, 18, 0);
  controls.enableDamping = true;

  //---------------------- Listeners -----------------

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("wheel", onDocumentWheel, false);
  document.addEventListener("click", onDocumentClick, false);
  document.addEventListener("keydown", startAnim);

  //---------------- GUI --------------------------

  stats = new Stats();
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, "camControl");
  gui.add(params, "changeBG");
  const tiltFolder = gui.addFolder("TiltShift");
  tiltFolder.add(params, "bluramount", 0, 5.0, 0.01).onChange(() => {
    effectPass.uniforms["bluramount"].value = params.bluramount;
  });
  tiltFolder.add(params, "center", 0.1, 2, 0.01).onChange(() => {
    effectPass.uniforms["center"].value = params.center;
  });
  const vignFolder = gui.addFolder("Vignette");
  vignFolder.add(params, "vignetteOffset", 0, 2.0, 0.01).onChange(() => {
    vignettePass.uniforms["offset"].value = params.vignetteOffset;
  });
  vignFolder.add(params, "vignetteDarkness", 0, 1, 0.01).onChange(() => {
    vignettePass.uniforms["darkness"].value = params.vignetteDarkness;
  });

  // gui.close();

  ///////////////////// Build scene, add objects

  transParticles = new transitionParticles(scene);
  transParticles.hide();

  const stage01 = new storyStage(scene, camera, "covidStory/data/stage01.json");
  const stage02 = new storyStage(scene, camera, "covidStory/data/stage02.json");

  currentStage = stage01;
  nextStage = stage02;

  effectPass.uniforms["bluramount"].value = currentStage.blurAmount;
  params.bluramount = currentStage.blurAmount;
  effectPass.uniforms["center"].value = currentStage.blurCenter;
  vignettePass.uniforms["offset"].value = params.vignetteOffset;
  vignettePass.uniforms["darkness"].value = params.vignetteDarkness;

  msgDiv.innerHTML = "window.devicePixelRatio: " + window.devicePixelRatio;
}

//---------------- Animate --------------------------

function animate(time) {
  if (transition) transParticles.fly();
  else transParticles.stop();

  if (currentStage.ready && !currentStage.visible) currentStage.show();
  if (!freeCam) {
    plusZ += (0 - plusZ) * 0.05;

    if (animationProgress >= 1) {
      plusZ = 0;
      animationProgress = 1;
    }

    if (animationProgress < 0) {
      plusZ = 0;
      animationProgress = 0;
    }

    camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
    camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;
  }
  if (currentStage.ready && !transition) currentStage.update(animationProgress);

  requestAnimationFrame(animate);
  render();
  if (freeCam) controls.update();
  stats.update();
  TWEEN.update(time);

  composer.render();
}

//---------------- Render --------------------------

function render() {
  renderer.render(scene, camera);
}

// ----------------------------------------------------------------

function switchScene() {
  params.transTween = 0;
  animationProgress = 0;
  currentStage.hide();
  let tmp = currentStage;
  currentStage = nextStage;
  nextStage = tmp;
  nextStage.hide();
  currentStage.reset();
  currentStage.update(animationProgress);
  currentStage.show();
}

// ----------------------------------------------------------------

function sceneTransition() {
  params.animTween = 0;
  params.transTween = 0;

  transition = true;

  // let myTimeout = setTimeout(() => {
  //   transition = false;
  //   switchScene();
  //   clearTimeout(myTimeout);
  // }, 2000);

  let transInTween = new TWEEN.Tween(params)
    .to({ transTween: 1 }, 400)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {
      transition = false;
      TWEEN.remove(transInTween);
    })
    .onUpdate(() => {
      currentStage.update(animationProgress);
      currentStage.stageContainer.position.z = currentStage.startPosition.z - 1000 + params.transTween * 1000;
    });

  let transOutTween = new TWEEN.Tween(params)
    .to({ transTween: 1 }, 1000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onComplete(() => {
      switchScene();
      currentStage.stageContainer.position.z = currentStage.startPosition.z - 1000;
      transInTween.start();
      TWEEN.remove(transOutTween);
    })
    .onUpdate(() => {
      currentStage.stageContainer.position.z = currentStage.targetPosition.z + params.transTween * 1000;
    })
    .start();
}

// ----------------------Event handlers----------------------------

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  camTargetRotX = mouse.y * params.camRot;
  camTargetRotY = -mouse.x * params.camRot;

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
  // for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //   storyStd.sceneObjects[i].zoomResample(camera);
  // }

  if (!freeCam) plusZ += event.deltaY / 20000;
  // console.log(plusZ);
}

function onWindowResize() {
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ----------------------------------------------
