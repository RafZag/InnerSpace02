/* eslint-disable */
import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "./particleObject.js";
import { ambientParticles } from "./ambientParticles.js";

class storyStage {
  name;
  sceneObjects = [];
  stageContainer = new THREE.Object3D();
  startPosition = new THREE.Vector3();
  targetPosition = new THREE.Vector3();
  startRotation = new THREE.Vector3();
  targetRotation = new THREE.Vector3();
  camera;
  duration;
  animStart;
  animStop;
  blurAmount = 0.2;
  blurCenter = 1.0;

  // moveForwardThreshold = 350;
  // moveBackThreshold = -250;
  // transitionSpeed = 6;
  animationProgress = 0;
  // flyRange = 500;
  parentContainer;
  dataUrl;
  ready = false;
  visible = false;
  complete = false;
  loadedData;
  tCell;
  bars;
  barcode;
  ambParticles;

  colorPallete = [0x74d5a7, 0x92c846, 0x00916c, 0x4fcfae, 0x84d6cd, 0x9ce5f0, 0xe1e9f1];

  constructor(cont, cam, data) {
    this.parentContainer = cont;
    this.dataUrl = data;
    this.camera = cam;
    this.loadJSON();
  }

  async getStageData(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
  }

  loadJSON() {
    this.getStageData(this.dataUrl).then((data) => {
      this.loadedData = data;
      this.buildScene();
    });
  }

  buildScene() {
    this.name = this.loadedData.name;
    this.ambParticles = new ambientParticles(this.stageContainer);
    this.duration = this.loadedData.duration;

    this.animStart = this.loadedData.stageContainer.animStart;
    this.animStop = this.loadedData.stageContainer.animStop;
    // this.camera.position.z = this.loadedData.camera.start.z;

    this.startPosition.fromArray(this.loadedData.stageContainer.startPosition);
    this.targetPosition.fromArray(this.loadedData.stageContainer.targetPosition);

    this.startRotation.fromArray(this.loadedData.stageContainer.startRotation);
    this.targetRotation.fromArray(this.loadedData.stageContainer.targetRotation);

    this.stageContainer.position.copy(this.startPosition);
    this.stageContainer.rotation.set(this.startRotation.x, this.startRotation.y, this.startRotation.z);

    this.loadedData.sceneObjs.forEach(
      function (item) {
        let tmpParent = this.stageContainer;
        for (let i = 0; i < this.sceneObjects.length; i++) {
          if (this.sceneObjects[i].name == item.parent) tmpParent = this.sceneObjects[i].objectContainer;
        }

        const tmpObj = new particleObject(tmpParent, window.CANVAS_ASSET_ROOT + item.gltfFile, this.colorPallete[item.color]);
        tmpObj.startColor = tmpObj.color;
        tmpObj.targetColor = new THREE.Color(this.colorPallete[item.targetcolor]);
        tmpObj.name = item.name;
        tmpObj.particleParams.particleCount = item.particleCount;
        tmpObj.particleParams.particleSize = item.particleSize;
        tmpObj.particleParams.particlesWobble = item.particlesWobble;

        tmpObj.particleParams.surfaceNoiseAmpl = item.surfaceNoiseAmpl;
        tmpObj.particleParams.surfaceNoiseScale = item.surfaceNoiseScale;
        tmpObj.particleParams.surfaceNoiseSpeed = item.surfaceNoiseSpeed;
        tmpObj.objWobbleAmp = item.objWobbleAmp;
        tmpObj.objWobbleSpeed = item.objWobbleSpeed;

        tmpObj.buildParticles();
        tmpParent.add(tmpObj.objectContainer);
        tmpObj.setScale(new THREE.Vector3().fromArray(item.startScale));
        tmpObj.startScale = new THREE.Vector3(item.startScale[0], item.startScale[1], item.startScale[2]);
        tmpObj.targetScale = new THREE.Vector3(item.targetScale[0], item.targetScale[1], item.targetScale[2]);
        tmpObj.setPosition(new THREE.Vector3().fromArray(item.startPosition));
        tmpObj.startPosition = tmpObj.position;
        tmpObj.targetPosition = new THREE.Vector3().fromArray(item.targetPosition);
        tmpObj.setRotation(new THREE.Vector3(item.startRotation[0], item.startRotation[1], item.startRotation[2]));
        tmpObj.startRotation = tmpObj.rotation;
        tmpObj.targetRotation = new THREE.Vector3(item.targetRotation[0], item.targetRotation[1], item.targetRotation[2]);
        tmpObj.showRangeStrat = item.showRangeStrat;
        tmpObj.showRangeEnd = item.showRangeEnd;
        tmpObj.animStart = item.animStart;
        tmpObj.animStop = item.animStop;
        this.sceneObjects.push(tmpObj);
        tmpObj.show = true;
      }.bind(this)
    );

    this.stageContainer.visible = false;
    this.parentContainer.add(this.stageContainer);
    this.ready = false;
    this.sceneExtraFeatures();
  }

  sceneExtraFeatures() {}

  show() {
    this.stageContainer.visible = true;
    this.visible = true;
    // console.log("show scene: " + this.name);
  }

  hide() {
    this.stageContainer.visible = false;
    this.visible = false;
    // console.log("hide scene: " + this.name);
  }

  reset() {
    this.stageContainer.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z);
    this.stageContainer.rotation.set(this.startRotation.x, this.startRotation.y, this.startRotation.z);

    for (let i = 0; i < this.sceneObjects.length; i++) {
      this.sceneObjects[i].setPosition(this.sceneObjects[i].startPosition);
      this.sceneObjects[i].setRotation(this.sceneObjects[i].startRotation);
      this.sceneObjects[i].setScale(this.sceneObjects[i].startScale);
      this.sceneObjects[i].changeColor(this.sceneObjects[i].startColor);
    }
    this.complete = false;
  }

  readyCheck() {
    if (this.sceneObjects.length > 0) {
      let n = 0;
      let proc = 0;
      for (let i = 0; i < this.sceneObjects.length; i++) {
        proc += this.sceneObjects[i].loadedProc;
        if (this.sceneObjects[i].ready) {
          n++;
        }
      }
      if (n >= this.sceneObjects.length) {
        this.ready = true;
        return 1;
      }
      return proc / this.sceneObjects.length;
    }
  }

  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  }

  update(animProgress) {
    if (this.visible) {
      this.ambParticles.update();

      if (animProgress >= 1) animProgress = 1;

      let p;
      // if (animProgress >= this.animStart && animProgress <= this.animStop) {
      p = Math.abs((animProgress - this.animStart) / (this.animStop - this.animStart));
      if (p >= 1) p = 1;
      // }

      p = this.easeOutSine(p);

      let posVec = new THREE.Vector3();
      posVec.lerpVectors(this.startPosition, this.targetPosition, p);

      let rotVec = new THREE.Vector3();
      rotVec.lerpVectors(this.startRotation, this.targetRotation, p);

      this.stageContainer.position.set(posVec.x, posVec.y, posVec.z);
      this.stageContainer.rotation.set(rotVec.x, rotVec.y, rotVec.z);

      for (let i = 0; i < this.sceneObjects.length; i++) {
        this.sceneObjects[i].update(animProgress);
      }
    }
  }
}

export { storyStage };
