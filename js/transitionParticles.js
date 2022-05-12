/* eslint-disable */
import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";

class transitionParticles {
  parentContainer;
  size = 2;
  pos = new THREE.Vector3();
  direction = new THREE.Vector3(0, 0, 1);
  speed = 10;
  currentSpeed = this.speed;
  particleCount = 3000;
  frontBirthDistane = -150;
  backBirthDistane = 100;
  flying = false;
  mat = new THREE.PointsMaterial();

  horizontalSpread = 200;
  verticalSpread = 200;
  depthSpread = 200;

  particles; // THREE.Points(); - main object added to scene
  vertices = []; // particles verts
  color = new THREE.Color(0x4fcfae);

  constructor(cont) {
    this.parentContainer = cont;
    // this.pos.z = -200;
    this.buildParticles();
  }

  buildParticles() {
    let particlesParticlesGeo = new THREE.BufferGeometry();
    const sprite = new THREE.TextureLoader().load(window.CANVAS_ASSET_ROOT + "img/pointSprite.png");

    for (let i = 0; i < this.particleCount; i++) {
      const x = this.horizontalSpread * Math.random() - this.horizontalSpread / 2;
      const y = this.verticalSpread * Math.random() - this.verticalSpread / 2;
      const z = this.depthSpread * Math.random() - this.depthSpread / 2;

      this.vertices.push(x, y, z);
    }
    particlesParticlesGeo.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    particlesParticlesGeo.setAttribute("direction", new THREE.Float32BufferAttribute(this.directions, 3));

    this.mat = new THREE.PointsMaterial({
      size: this.size,
      sizeAttenuation: true,
      map: sprite,
      depthTest: false,
      transparent: true,
    });

    this.mat.color.set(this.color);
    this.particles = new THREE.Points(particlesParticlesGeo, this.mat);
    this.parentContainer.add(this.particles);
  }

  hide() {
    this.particles.visible = false;
  }

  show() {
    this.mat.size = this.size;
    this.particles.visible = true;
  }

  stop() {
    if (this.flying) {
      this.mat.size *= 0.82;
      this.currentSpeed *= 0.89;
      this.fly();
    }
    if (Math.abs(this.currentSpeed) < 0.1 && this.flying) {
      this.flying = false;
      this.currentSpeed = this.speed;
      this.hide();
      // console.log("stop!");
    }
  }

  fly() {
    if (!this.flying) {
      this.show();
      this.flying = true;
    }
    let positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i++) {
      positions[i * 3 + 2] += this.currentSpeed;
      if (positions[i * 3 + 2] > this.backBirthDistane) {
        positions[i * 3] = this.pos.x + this.horizontalSpread * Math.random() - this.horizontalSpread / 2;
        positions[i * 3 + 1] = this.pos.y + this.verticalSpread * Math.random() - this.verticalSpread / 2;
        positions[i * 3 + 2] = this.frontBirthDistane;
      }
      if (positions[i * 3 + 2] < this.frontBirthDistane) {
        positions[i * 3] = this.pos.x + this.horizontalSpread * Math.random() - this.horizontalSpread / 2;
        positions[i * 3 + 1] = this.pos.y + this.verticalSpread * Math.random() - this.verticalSpread / 2;
        positions[i * 3 + 2] = this.backBirthDistane;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  update() {}
}

export { transitionParticles };
