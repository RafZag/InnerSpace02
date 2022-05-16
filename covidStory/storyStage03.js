/* eslint-disable */
import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "../js/particleObject.js";
import { ambientParticles } from "../js/ambientParticles.js";
import { storyStage } from "./storyStage.js";

class storyStage03 extends storyStage {
  stageContainer = new THREE.Object3D();
  pathsContainer = new THREE.Object3D();

  mNRAinput = [];
  mNRAoutput = [];

  inputPathPoints = [
    [-567.6925048828125, -154.9762420654297, -193.79783630371094],
    [-506.4234313964844, -76.54579162597656, -104.044921875],
    [-422.9571838378906, -31.418474197387695, -10.017179489135742],
    [-302.98980712890625, -17.76590347290039, 45.431976318359375],
    [-169.26510620117188, -13.68714714050293, 44.79486083984375],
    [-39.212886810302734, -6.888745307922363, 12.29430866241455],
    [85.55669403076172, 14.133238792419434, -31.716096878051758],
    [195.412109375, 82.02104949951172, -64.83251190185547],
    [271.76898193359375, 191.13278198242188, -74.22664642333984],
    [315.5968322753906, 316.2842712402344, -55.53683853149414],
    [339.8720703125, 437.2672424316406, -3.7858715057373047],
    [361.5320129394531, 515.734375, 99.05715942382812],
    [392.55938720703125, 484.3313293457031, 222.6060028076172],
    [396.4124755859375, 386.2419738769531, 312.58636474609375],
    [376.3586730957031, 265.14080810546875, 366.1885986328125],
    [341.9626770019531, 137.9692840576172, 391.46368408203125],
    [297.5927429199219, 11.323799133300781, 393.0262756347656],
    [245.58731079101562, -110.76576232910156, 372.9261474609375],
    [187.662841796875, -224.79122924804688, 332.2132873535156],
    [125.50489807128906, -327.3738098144531, 271.98583984375],
    [60.9517822265625, -415.56048583984375, 194.0659942626953],
    [-4.124268054962158, -487.38372802734375, 101.18890380859375],
    [-76.10043334960938, -542.6649169921875, 2.2983853816986084],
    [-163.435791015625, -577.308837890625, -93.40855407714844],
    [-265.3797607421875, -583.3731079101562, -180.10887145996094],
    [-376.0570373535156, -553.7986450195312, -249.23477172851562],
    [-483.2843933105469, -486.1994934082031, -291.5870666503906],
    [-568.8314819335938, -384.20703125, -298.9253845214844],
    [-604.4295654296875, -261.5673828125, -263.85858154296875],
  ];

  outputPathPoints = [
    [-3.9867703914642334, -0.31828388571739197, 0.7919312119483948],
    [-6.333519458770752, 62.180599212646484, 13.294113159179688],
    [-16.932716369628906, 124.05162048339844, 24.250429153442383],
    [-44.56991195678711, 180.52218627929688, 31.99381446838379],
    [-93.27593231201172, 220.61236572265625, 36.37514114379883],
    [-131.52252197265625, 242.17039489746094, 64.5574722290039],
    [-87.50409698486328, 265.2513122558594, 104.29844665527344],
    [-38.99612045288086, 290.17626953125, 137.4116973876953],
    [12.551315307617188, 316.37542724609375, 164.24436950683594],
    [69.43733978271484, 342.4158935546875, 169.02676391601562],
    [112.58118438720703, 357.3576354980469, 127.43436431884766],
    [117.73548126220703, 355.20477294921875, 64.5942611694336],
    [109.46954345703125, 348.3630065917969, 1.7319586277008057],
    [92.50977325439453, 339.5622253417969, -59.09218215942383],
    [66.857666015625, 329.6912841796875, -116.52079772949219],
    [26.67304229736328, 319.4047546386719, -164.4661865234375],
    [-31.925630569458008, 312.4984436035156, -185.7772216796875],
    [-91.06410217285156, 311.1346130371094, -164.7580108642578],
    [-141.071044921875, 304.65167236328125, -126.12735748291016],
    [-171.55426025390625, 284.6789855957031, -74.73628234863281],
    [-167.58731079101562, 264.45556640625, -15.380757331848145],
    [-137.92098999023438, 277.6420593261719, 37.23341369628906],
    [-114.75955963134766, 329.421630859375, 65.00346374511719],
    [-100.30323791503906, 389.5690612792969, 80.48715209960938],
  ];

  constructor(cont, cam, data) {
    super(cont, cam, data);
  }

  sceneExtraFeatures() {
    this.buildPaths();
  }

  buildPaths() {
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

    for (let i = 0; i < 80; i++) {
      // let tmp = new particleObject(this.stageContainer, this.sceneObjects[1].modelURL, this.sceneObjects[1].particleParams.particleColor);
      // tmp.buildParticles();
      let tmp = new THREE.Points();
      tmp.copy(this.sceneObjects[2].particles);
      //tmp = Object.assign({}, this.sceneObjects[1].particles);
      tmp.position.x = this.inputPath.getPoint(i * 0.004).x;
      tmp.position.y = this.inputPath.getPoint(i * 0.004).y;
      tmp.position.z = this.inputPath.getPoint(i * 0.004).z;
      tmp.scale.set(0.1, 0.1, 0.1);
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
    // const points1 = this.inputPath.getPoints(50);
    // const inputLineGeometry = new THREE.BufferGeometry().setFromPoints(points1);
    // const material1 = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // const inputLline = new THREE.Line(inputLineGeometry, material1);
    // this.pathsContainer.add(inputLline);

    // const points2 = this.outputPath.getPoints(50);
    // const outputLineGeometry = new THREE.BufferGeometry().setFromPoints(points2);
    // const material2 = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    // const outputLineLline = new THREE.Line(outputLineGeometry, material2);
    // this.pathsContainer.add(outputLineLline);

    this.sceneObjects[2].particles.visible = false;
    this.sceneObjects[1].particles.visible = false;

    this.stageContainer.add(this.pathsContainer);

    this.pathsContainer.rotation.set(-1.57, 3.14, 1.57);
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

      //// Output particles

      for (let o = 0; o < this.mNRAoutput.length; o++) {
        const startAnim = 0.1;
        const endAnim = 1.0;
        let progress = (animProgress - startAnim) / (endAnim - startAnim);

        let p = progress - o * 0.01;
        if (p > 1) p = 1;
        if (p < 0) p = 0;

        this.mNRAoutput[o].position.x = this.outputPath.getPoint(p).x;
        this.mNRAoutput[o].position.y = this.outputPath.getPoint(p).y;
        this.mNRAoutput[o].position.z = this.outputPath.getPoint(p).z;
        if (p < 0.001) this.mNRAoutput[o].visible = false;
        else this.mNRAoutput[o].visible = true;
      }

      //// Input particles

      for (let i = 0; i < this.mNRAinput.length; i++) {
        if (animProgress == 0) this.mNRAinput[i].visible = true;
        let sp = i * (animProgress * 0.02 + 0.004);
        let p = sp + animProgress - 0.4;
        this.mNRAinput[i].position.x = this.inputPath.getPoint(p).x;
        this.mNRAinput[i].position.y = this.inputPath.getPoint(p).y;
        this.mNRAinput[i].position.z = this.inputPath.getPoint(p).z;
        if (p > 0.55) this.mNRAinput[i].visible = false;
      }

      for (let i = 0; i < this.sceneObjects.length; i++) {
        this.sceneObjects[i].update(animProgress);
      }
    }
  }
}

export { storyStage03 };
