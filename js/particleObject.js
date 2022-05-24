/* eslint-disable */
import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/math/MeshSurfaceSampler.js";
import particleVertexShader from "../shaders/particleVertexShader.js";
import particleFragmentShader from "../shaders/particleFragmentShader.js";

class particleObject {
  objectContainer = new THREE.Object3D();
  parentContainer;
  position = new THREE.Vector3();
  rotation = new THREE.Vector3();
  startPosition = new THREE.Vector3();
  startRotation = new THREE.Vector3();
  targetPosition = new THREE.Vector3();
  targetRotation = new THREE.Vector3();
  scale = new THREE.Vector3();
  startScale = new THREE.Vector3();
  targetScale = new THREE.Vector3();
  color;
  startColor;
  targetColor;
  showPercent = 0;
  showStep = 0.01;
  showRangeStrat = 0;
  showRangeEnd = 1;
  animStart = 0;
  animStop = 1;
  objWobbleDir = new THREE.Vector3();
  objWobbleSpeed = 0;
  objWobbleAmp = 0;
  uuid;
  name;

  ready = false;
  visible = false;
  show = false;
  particles; // THREE.Points(); - main object added to scene
  vertices = []; // particles verts
  surfaceVerts = [];
  partColors = [];
  sizes = [];

  modelURL;
  gltfLoader = new GLTFLoader();
  geometry = new THREE.BufferGeometry();

  loadedProc = 0;

  surfaceMesh;
  sampler;
  uniformsValues;

  particleParams = {
    particleCount: 20000,
    particleCntMult: 65,
    particleSize: 0.2,
    particleSizeMult: 0.44,
    particleSizeVariation: 0.025,
    particlesWobble: 0.04,
    wobbleSpeed: 0.002,
    surfaceNoiseAmpl: 0.01,
    surfaceNoiseScale: 8,
    surfaceNoiseSpeed: 0.2,
  };

  MAX_PARTICLES = 500000;
  MAX_SIZE = 6;

  constructor(parentContainer, model, col) {
    this.parentContainer = parentContainer;
    this.color = new THREE.Color(col);
    this.targetColor = new THREE.Color(0xff0000);
    this.modelURL = model;
    // this.buildParticles();
  }

  buildParticles() {
    const pc = new THREE.Color(this.color);

    for (let j = 0; j < this.MAX_PARTICLES; j++) {
      this.vertices.push(0, 0, 0);
      this.partColors.push(pc.r, pc.g, pc.b);
      this.sizes.push(this.particleParams.particleSize);
    }

    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.partColors, 3));
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setAttribute("size", new THREE.Float32BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage));

    this.geometry.setDrawRange(0, this.particleParams.particleCount);

    this.objWobbleDir = new THREE.Vector3(Math.random(), Math.random(), Math.random());

    this.uniformsValues = {
      rimColor: { value: new THREE.Color("rgb(255, 255, 255)") },
      partColor: { value: new THREE.Color(this.color) },
      time: { value: 0.0 },
      wobble: { value: this.particleParams.particlesWobble },
      wobbleSpeed: { value: this.particleParams.particlesWobble },
      surfaceNoiseSpeed: { value: this.particleParams.surfaceNoiseSpeed },
      surfaceNoiseAmpl: { value: this.particleParams.surfaceNoiseAmpl },
      surfaceNoiseScale: { value: this.particleParams.surfaceNoiseScale },
      objWobbleDir: { value: this.objWobbleDir },
      objWobbleSpeed: { value: this.objWobbleSpeed },
      objWobbleAmp: { value: this.objWobbleAmp },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniformsValues,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      // blending: THREE.AdditiveBlending,
      // depthWrite: false,
      depthTest: true,
      transparent: true,
      vertexColors: true,
    });

    this.particles = new THREE.Points(this.geometry, shaderMaterial);
    this.uuid = this.particles.uuid;
    this.particles.frustumCulled = false; ////  object visibility fixed

    this.objectContainer.add(this.particles);
    this.parentContainer.add(this.objectContainer);
    this.loadMesh(this.modelURL);
  }

  loadMesh(url) {
    this.gltfLoader.load(
      url,
      function (gltf) {
        // this.parentContainer.add(gltf.scene);
        this.surfaceMesh = gltf.scene.children[0]; // Object
        // console.log(url);
        // console.log(this.surfaceMesh.name);
        this.sampleSurface();
      }.bind(this),
      function (xhr) {
        this.loadedProc = xhr.loaded / xhr.total;
      }.bind(this),
      function (error) {
        console.log("An error happened " + error);
      }
    );
  }

  sampleSurface() {
    this.sampler = new MeshSurfaceSampler(this.surfaceMesh).setWeightAttribute("color").build();
    let _position = new THREE.Vector3();
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.sampler.sample(_position);
      let v = new THREE.Vector3(_position.x, _position.y, _position.z);
      this.surfaceVerts.push(v);
    }
    // this.sampler.removeFromParent();
    this.surfaceScatter();
  }

  surfaceScatter() {
    const positions = this.particles.geometry.attributes.position.array;
    let index = 0;

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      positions[index++] = this.surfaceVerts[i].x;
      positions[index++] = this.surfaceVerts[i].y;
      positions[index++] = this.surfaceVerts[i].z;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.resample(0);
    // this.particles.geometry.dispose();
    // this.particles.material.dispose();
    // this.particles.removeFromParent();
    // this.surfaceMesh.geometry.dispose();
    // this.surfaceMesh.material.dispose();
    // this.surfaceMesh.removeFromParent();
    this.ready = true;
  }

  resample(n) {
    this.particles.geometry.setDrawRange(0, n);
    // this.geometry.attributes.position.needsUpdate = true;
  }

  zoomResample(cam) {
    const dist = this.particles.position.distanceTo(cam.position);
    this.particleParams.particleCount = (this.MAX_PARTICLES * this.particleParams.particleCntMult) / (dist * dist);
    this.resample();
    this.particleParams.particleSize = (this.MAX_SIZE * dist) / 500;
    this.changeParticleSize();
  }

  changeParticleSize() {
    let viewportSurfaceArea = window.innerWidth * window.innerHeight * 0.000001;

    const sizes = this.geometry.attributes.size.array;
    for (let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      sizes[i] =
        this.particleParams.particleSize * this.particleParams.particleSizeMult * viewportSurfaceArea +
        (Math.random() - 0.5) * 2 * this.particleParams.particleSizeVariation;
    }
    this.geometry.attributes.size.needsUpdate = true;
  }

  changeRimColor(col) {
    this.uniformsValues["rimColor"].value = col;
    this.uniformsValues.needsUpdate = true;
  }

  changeColor(col) {
    this.color = col;
    this.uniformsValues["partColor"].value = col;
    this.uniformsValues.needsUpdate = true;
    // let c = new THREE.Color(col);
    // const cols = this.geometry.attributes.color.array;
    // for (let i = 0; i < this.geometry.attributes.size.array.length; i++) {
    //   cols[i * 3] = c.r;
    //   cols[i * 3 + 1] = c.g;
    //   cols[i * 3 + 2] = c.b;
    // }
    // this.geometry.attributes.color.needsUpdate = true;
  }

  spin(speed) {
    this.particles.rotation.y = performance.now() * (speed * 0.0001);
  }
  float(speed) {
    this.particles.position.y += 0.1 * Math.sin(performance.now() * speed * 0.0001);
  }

  setPosition(vec) {
    this.position = vec;
    this.objectContainer.position.x = vec.x;
    this.objectContainer.position.y = vec.y;
    this.objectContainer.position.z = vec.z;
  }

  setRotation(vec) {
    this.rotation = vec;
    this.objectContainer.rotation.x = vec.x;
    this.objectContainer.rotation.y = vec.y;
    this.objectContainer.rotation.z = vec.z;
  }

  setScale(vec) {
    this.scale = vec;
    this.objectContainer.scale.x = vec.x;
    this.objectContainer.scale.y = vec.y;
    this.objectContainer.scale.z = vec.z;
  }

  showMe() {
    if (!this.visible && this.ready) {
      this.showPercent += this.showStep;
      let n = Math.ceil(this.particleParams.particleCount * this.showPercent);
      this.resample(n);
      if (n >= this.particleParams.particleCount) this.visible = true;
      this.uniformsValues["time"].value = performance.now() * this.particleParams.wobbleSpeed;
      this.uniformsValues.needsUpdate = true;
    }
  }

  hideMe() {
    if (this.visible) {
      this.showPercent -= this.showStep;
      let n = Math.ceil(this.particleParams.particleCount * this.showPercent);
      this.resample(n);
      if (n <= 0) this.visible = false;
    }
  }

  mapValue(value, x1, y1, x2, y2) {
    return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  }

  update(progress) {
    if (this.ready) {
      if (progress >= this.showRangeStrat && progress <= this.showRangeEnd) this.show = true;
      else this.show = false;

      if (this.show) this.showMe();
      else this.hideMe();

      if (this.visible) {
        let p;

        if (progress >= this.animStart && progress <= this.animStop) {
          p = (progress - this.animStart) / (this.animStop - this.animStart);
        }

        p = this.easeOutSine(p);

        let posVec = new THREE.Vector3();
        posVec.lerpVectors(this.startPosition, this.targetPosition, p);
        if (p <= 1 && p != undefined) this.setPosition(posVec);
        // if (p == 1) this.setPosition(this.targetPosition);

        let rotVec = new THREE.Vector3();
        rotVec.lerpVectors(this.startRotation, this.targetRotation, p);
        if (p <= 1 && p != undefined) this.setRotation(rotVec);

        let scaleVec = new THREE.Vector3();
        scaleVec.lerpVectors(this.startScale, this.targetScale, p);
        if (p <= 1 && p != undefined) this.setScale(scaleVec);

        let colorTrans = new THREE.Color();
        colorTrans.lerpColors(this.startColor, this.targetColor, p);
        if (p <= 1 && p != undefined) this.changeColor(colorTrans);

        this.uniformsValues["time"].value = performance.now() * this.particleParams.wobbleSpeed;
        this.uniformsValues["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.uniformsValues.needsUpdate = true;
      }
    }
  }
}

export { particleObject };
