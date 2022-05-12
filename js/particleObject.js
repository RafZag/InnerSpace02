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
  scale = 1.0;
  startScale = 1.0;
  targetScale = 1.0;
  spinRate = 0.2;
  floatRate = 0.5;
  showPercent = 0;
  showStep = 0.01;
  showRangeStrat = 0;
  showRangeEnd = 1;
  animStart = 0;
  animStop = 1;
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

  surfaceMesh;
  sampler;
  uniformsValues;

  particleParams = {
    particleColor: 0x4fcfae,
    particleCount: 20000,
    particleCntMult: 65,
    particleSize: 0.2,
    particleSizeMult: 0.44,
    particleSizeVariation: 0.025,
    particlesWobble: 0.04,
    wobbleSpeed: 0.002,
    surfaceNoise: 0.02,
    noiseScale: 8,
  };

  MAX_PARTICLES = 500000;
  MAX_SIZE = 6;

  constructor(parentContainer, model, col) {
    this.parentContainer = parentContainer;
    this.particleParams.particleColor = new THREE.Color(col);
    this.modelURL = model;
    // this.buildParticles();
  }

  buildParticles() {
    const pc = new THREE.Color(this.particleParams.particleColor);

    for (let j = 0; j < this.MAX_PARTICLES; j++) {
      this.vertices.push(0, 0, 0);
      this.partColors.push(pc.r, pc.g, pc.b);
      this.sizes.push(this.particleParams.particleSize);
    }

    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.partColors, 3));
    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setAttribute("size", new THREE.Float32BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage));

    this.geometry.setDrawRange(0, this.particleParams.particleCount);

    this.uniformsValues = {
      rimColor: { value: new THREE.Color("rgb(255, 255, 255)") },
      time: { value: 0.0 },
      wobble: { value: this.particleParams.particlesWobble },
      surfaceNoise: { value: this.particleParams.surfaceNoise },
      noiseScale: { value: this.particleParams.noiseScale },
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
        // console.log(this.surfaceMesh);
        this.sampler = new MeshSurfaceSampler(this.surfaceMesh).setWeightAttribute("color").build();
        this.sampleSurface();
      }.bind(this),
      function (xhr) {
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.log("An error happened " + error);
      }
    );
  }

  sampleSurface() {
    let _position = new THREE.Vector3();
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.sampler.sample(_position);
      let v = new THREE.Vector3(_position.x, _position.y, _position.z);
      this.surfaceVerts.push(v);
    }
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
    let c = new THREE.Color(col);
    const cols = this.geometry.attributes.color.array;
    for (let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    this.geometry.attributes.color.needsUpdate = true;
  }

  spin(speed) {
    this.particles.rotation.y = performance.now() * (speed * 0.0001);
  }
  float(speed) {
    this.particles.position.y += 0.1 * Math.sin(performance.now() * speed * 0.0001);
  }

  setScale(sc) {
    this.scale = sc;
    this.objectContainer.scale.x = sc;
    this.objectContainer.scale.y = sc;
    this.objectContainer.scale.z = sc;
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

  showMe() {
    if (!this.visible && this.ready) {
      this.showPercent += this.showStep;
      let n = Math.ceil(this.particleParams.particleCount * this.showPercent);
      this.resample(n);
      if (n >= this.particleParams.particleCount) this.visible = true;
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

  update(progress) {
    if (progress >= this.showRangeStrat && progress <= this.showRangeEnd) this.show = true;
    else this.show = false;

    if (this.show) this.showMe();
    else this.hideMe();

    if (this.visible) {
      let p;

      // const p = this.mapValue(progress, this.animStart, this.animStop, 0, 1);
      if (progress >= this.animStart && progress <= this.animStop) {
        p = (progress - this.animStart) / (this.animStop - this.animStart);
      }

      let posVec = new THREE.Vector3();
      posVec.lerpVectors(this.startPosition, this.targetPosition, p);
      if (p <= 1) this.setPosition(posVec);
      // if (p == 1) this.setPosition(this.targetPosition);

      let rotVec = new THREE.Vector3();
      rotVec.lerpVectors(this.startRotation, this.targetRotation, p);
      if (p <= 1) this.setRotation(rotVec);

      this.uniformsValues["time"].value = performance.now() * this.particleParams.wobbleSpeed;
      this.uniformsValues["wobble"].value = this.particleParams.particlesWobble;
      this.uniformsValues["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
      this.uniformsValues.needsUpdate = true;
    }
  }
}

export { particleObject };
