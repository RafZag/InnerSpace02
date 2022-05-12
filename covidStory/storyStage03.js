import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "../js/particleObject.js";
import { ambientParticles } from "../js/ambientParticles.js";

class storyStage03 {
  name;
  sceneObjects = [];
  stageContainer = new THREE.Object3D();
  pathsContainer = new THREE.Object3D();
  startPosition = new THREE.Vector3();
  targetPosition = new THREE.Vector3();
  startRotation = new THREE.Vector3();
  targetRotation = new THREE.Vector3();
  inputPath;
  outputPath;
  camera;
  blurAmount = 0.2;
  blurCenter = 1.0;

  mNRAinput = [];
  mNRAoutput = [];

  inputPathPoints = [
    [85.56941986083984, 14.419384002685547, -31.687936782836914],
    [-269.7044982910156, -16.67125701904297, 49.42464065551758],
    [-395.9049072265625, -25.884124755859375, 9.090765953063965],
    [-522.8670043945312, -93.54253387451172, -127.82300567626953],
    [-604.0142822265625, -261.60498046875, -263.64068603515625],
    [-583.5564575195312, -354.283203125, -294.0704345703125],
    [-507.5660705566406, -463.3643798828125, -296.85565185546875],
    [-403.8945617675781, -540.1542358398438, -262.5854187011719],
    [-292.754150390625, -579.3082275390625, -199.38858032226562],
    [-96.6392822265625, -553.4852905273438, -22.192169189453125],
    [44.67139434814453, -434.9996643066406, 172.06494140625],
    [172.48837280273438, -251.475830078125, 318.8839416503906],
    [331.7178649902344, 106.30014038085938, 393.841796875],
    [393.06988525390625, 357.3178405761719, 328.74761962890625],
    [396.3809814453125, 463.70867919921875, 248.49171447753906],
    [369.1063232421875, 517.3782958984375, 131.46865844726562],
    [355.14593505859375, 504.3778076171875, 68.16239166259766],
    [344.6791076660156, 463.57403564453125, 16.635995864868164],
    [217.851318359375, 106.60765075683594, -69.59161376953125],
  ];

  outputPathPoints = [
    [-3.4314045906066895, 11.64316177368164, -16.628284454345703],
    [-12.999126434326172, 113.50640106201172, 2.716341495513916],
    [-39.78010177612305, 177.35504150390625, 11.779489517211914],
    [-74.68276977539062, 212.48744201660156, 15.19365406036377],
    [-108.6155776977539, 228.2019805908203, 17.59132957458496],
    [-138.31851196289062, 236.94590759277344, 33.2750129699707],
    [-72.02987670898438, 272.9170837402344, 96.60765075683594],
    [39.948543548583984, 329.8083801269531, 153.95187377929688],
    [76.42567443847656, 345.6706848144531, 150.3125],
    [105.96669006347656, 356.046142578125, 124.22930908203125],
    [123.27275085449219, 358.1517639160156, 62.87162399291992],
    [93.37355041503906, 338.210205078125, -95.37197875976562],
    [26.259870529174805, 318.98162841796875, -186.75819396972656],
    [-2.632807493209839, 314.6131286621094, -202.13587951660156],
    [-34.16408920288086, 312.1573181152344, -206.88226318359375],
    [-67.96070098876953, 312.1494140625, -199.1439208984375],
    [-133.18789672851562, 309.4430236816406, -157.71087646484375],
    [-164.73794555664062, 295.910400390625, -119.495361328125],
    [-176.18728637695312, 278.81146240234375, -81.6129379272461],
    [-158.05198669433594, 261.1812438964844, -11.719773292541504],
    [-132.79559326171875, 280.9956970214844, 24.48262596130371],
    [-119.79718780517578, 304.95623779296875, 39.503990173339844],
    [-96.23094940185547, 412.9084167480469, 64.99407958984375],
  ];
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
    this.duration = this.loadedData.duration;
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

    this.inputPathPoints.reverse();

    this.stageContainer.visible = false;
    this.parentContainer.add(this.stageContainer);
    this.ready = true;

    //========== scale the curve to make it as large as you want
    let scale = 0.08;
    //========== Convert the array of points into vertices (in Blender the z axis is UP so we swap the z and y)
    for (let i = 0; i < this.inputPathPoints.length; i++) {
      let x = this.inputPathPoints[i][0] * scale;
      let y = this.inputPathPoints[i][1] * scale;
      let z = this.inputPathPoints[i][2] * scale;
      this.inputPathPoints[i] = new THREE.Vector3(x, z, -y);
    }

    for (let i = 0; i < this.outputPathPoints.length; i++) {
      let x = this.outputPathPoints[i][0] * scale;
      let y = this.outputPathPoints[i][1] * scale;
      let z = this.outputPathPoints[i][2] * scale;
      this.outputPathPoints[i] = new THREE.Vector3(x, z, -y);
    }

    //========== Create a path from the points
    this.inputPath = new THREE.CatmullRomCurve3(this.inputPathPoints);
    this.inputPath.closed = true;

    this.outputPath = new THREE.CatmullRomCurve3(this.outputPathPoints);
    this.outputPath.closed = false;

    for (let i = 0; i < 100; i++) {
      // let tmp = new particleObject(this.stageContainer, this.sceneObjects[1].modelURL, this.sceneObjects[1].particleParams.particleColor);
      // tmp.buildParticles();
      let tmp = new THREE.Points();
      tmp.copy(this.sceneObjects[2].particles);
      //tmp = Object.assign({}, this.sceneObjects[1].particles);
      tmp.position.x = this.inputPath.getPoint(i * 0.001).x;
      tmp.position.y = this.inputPath.getPoint(i * 0.001).y;
      tmp.position.z = this.inputPath.getPoint(i * 0.001).z;
      tmp.scale.set(0.05, 0.05, 0.05);
      this.mNRAinput.push(tmp);
      this.pathsContainer.add(tmp);
    }

    for (let i = 0; i < 100; i++) {
      // let tmp = new particleObject(this.stageContainer, this.sceneObjects[1].modelURL, this.sceneObjects[1].particleParams.particleColor);
      // tmp.buildParticles();
      let tmp = new THREE.Points();
      tmp.copy(this.sceneObjects[1].particles);
      //tmp = Object.assign({}, this.sceneObjects[1].particles);
      tmp.position.x = this.outputPath.getPoint(i * 0.001).x;
      tmp.position.y = this.outputPath.getPoint(i * 0.001).y;
      tmp.position.z = this.outputPath.getPoint(i * 0.001).z;
      tmp.scale.set(0.05, 0.05, 0.05);
      this.mNRAoutput.push(tmp);
      this.pathsContainer.add(tmp);
    }
    const points1 = this.inputPath.getPoints(50);
    const inputLineGeometry = new THREE.BufferGeometry().setFromPoints(points1);
    const material1 = new THREE.LineBasicMaterial({ color: 0xff0000 });

    const inputLline = new THREE.Line(inputLineGeometry, material1);
    this.pathsContainer.add(inputLline);

    const points2 = this.outputPath.getPoints(50);
    const outputLineGeometry = new THREE.BufferGeometry().setFromPoints(points2);
    const material2 = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    const outputLineLline = new THREE.Line(outputLineGeometry, material2);
    this.pathsContainer.add(outputLineLline);

    this.sceneObjects[2].particles.visible = false;
    this.sceneObjects[1].particles.visible = false;

    this.stageContainer.add(this.pathsContainer);

    this.pathsContainer.rotation.set(-1.57, 3.14, 1.57);
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
    this.stageContainer.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z);
    this.stageContainer.rotation.set(this.startRotation.x, this.startRotation.y, this.startRotation.z);

    for (let i = 0; i < this.sceneObjects.length; i++) {
      this.sceneObjects[i].setPosition(this.sceneObjects[i].startPosition);
      this.sceneObjects[i].setRotation(this.sceneObjects[i].startRotation);
      this.sceneObjects[i].setScale(this.sceneObjects[i].startScale);
    }
    this.complete = false;
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

      for (let o = 0; o < this.mNRAoutput.length; o++) {
        let p = o * 0.001 + animProgress;
        if (p > 1) p = 1;
        this.mNRAoutput[o].position.x = this.outputPath.getPoint(p).x;
        this.mNRAoutput[o].position.y = this.outputPath.getPoint(p).y;
        this.mNRAoutput[o].position.z = this.outputPath.getPoint(p).z;
      }

      for (let i = 0; i < this.mNRAinput.length; i++) {
        let p = i * 0.001 + animProgress + 0.5;
        // if (p > 1) p = 1;
        this.mNRAinput[i].position.x = this.inputPath.getPoint(p).x;
        this.mNRAinput[i].position.y = this.inputPath.getPoint(p).y;
        this.mNRAinput[i].position.z = this.inputPath.getPoint(p).z;
      }

      for (let i = 0; i < this.sceneObjects.length; i++) {
        this.sceneObjects[i].update(animProgress);
      }
    }
  }
}

export { storyStage03 };
