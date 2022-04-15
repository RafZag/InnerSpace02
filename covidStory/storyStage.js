import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "../js/particleObject.js";
import { ambientParticles } from "../js/ambientParticles.js";

class storyStage {
  name;
  sceneObjects = [];
  stageContainer = new THREE.Object3D();
  startPosition = new THREE.Vector3();
  targetPosition = new THREE.Vector3();
  startRotation = new THREE.Vector3();
  targetRotation = new THREE.Vector3();
  camera;
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

        const tmpObj = new particleObject(tmpParent, item.gltfFile, this.colorPallete[item.color]);
        tmpObj.name = item.name;
        tmpObj.particleParams.particleCount = item.particleCount;
        tmpObj.particleParams.particleSize = item.particleSize;
        tmpObj.particleParams.particlesWobble = item.particlesWobble;

        tmpObj.particleParams.surfaceNoise = item.surfaceNoise;
        tmpObj.particleParams.noiseScale = item.noiseScale;
        tmpObj.buildParticles();
        tmpParent.add(tmpObj.objectContainer);
        tmpObj.setScale(item.startScale);
        tmpObj.startScale = tmpObj.scale;
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
    this.ready = true;
  }
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
    for (let i = 0; i < this.sceneObjects.length; i++) {
      this.sceneObjects[i].setPosition(this.sceneObjects[i].startPosition);
      this.sceneObjects[i].setRotation(this.sceneObjects[i].startRotation);
      this.sceneObjects[i].setScale(this.sceneObjects[i].startScale);
    }
    this.complete = false;
    console.log("scene reset");
  }

  update(animProgress) {
    if (this.visible) {
      this.ambParticles.update();

      if (animProgress >= 1) animProgress = 1;

      let posVec = new THREE.Vector3();
      posVec.lerpVectors(this.startPosition, this.targetPosition, animProgress);

      let rotVec = new THREE.Vector3();
      rotVec.lerpVectors(this.startRotation, this.targetRotation, animProgress);

      this.stageContainer.position.set(posVec.x, posVec.y, posVec.z);
      this.stageContainer.rotation.set(rotVec.x, rotVec.y, rotVec.z);

      for (let i = 0; i < this.sceneObjects.length; i++) {
        this.sceneObjects[i].update(animProgress);
      }
    }
  }
}

export { storyStage };
